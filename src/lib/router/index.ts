/**
 * Jev router: one TypeSafe request answers which tools the user wants and
 * with which arguments; code fetches the data and builds the UI spec.
 * Anything the truth table doesn't cover goes to the LLM agent instead.
 */

import type { Spec } from "@json-render/core";
import { TypeSafeClient } from "@typesafe-ai/sdk";
import type { Tool } from "ai";
import { getCryptoPrice, getCryptoPriceHistory } from "../tools/crypto";
import { getGitHubPullRequests, getGitHubRepo } from "../tools/github";
import { getHackerNewsTop } from "../tools/hackernews";
import { getWeather } from "../tools/weather";
import type { Candidates } from "./candidates";
import { type Answers, decide, type Plan, type Section } from "./decide";
import { buildRequest } from "./request";
import {
	assemble,
	type CryptoData,
	type CryptoHistory,
	cryptoSection,
	type HackerNewsData,
	hackerNewsSection,
	type PullsData,
	pullsSection,
	type RepoData,
	repoSection,
	type SpecNode,
	type WeatherData,
	weatherSection,
} from "./templates";

let client: TypeSafeClient | null = null;
export function routerEnabled(): boolean {
	return Boolean(process.env.TYPESAFE_API_KEY);
}
function getClient(): TypeSafeClient {
	client ??= new TypeSafeClient();
	return client;
}

export type RouteResult =
	| {
			kind: "router";
			plan: Extract<Plan, { kind: "router" }>;
			text: string;
			spec: Spec;
	  }
	| { kind: "fallback"; reason: string };

export type RouteTrace = {
	request: ReturnType<typeof buildRequest>["request"];
	answers?: Answers;
	plan?: Plan;
	usage?: unknown;
};

/** Throws on TypeSafe API errors; the caller decides what a failure means. */
export async function route(
	latest: string,
	earlier: readonly string[],
	trace?: (t: RouteTrace) => void,
): Promise<RouteResult> {
	const { candidates, request } = buildRequest(latest, earlier);
	const result = await getClient().systemOne(request);
	const answers = result.answers as Answers;
	const plan = decide(answers, candidates);
	trace?.({ request, answers, plan, usage: result.usage });
	if (plan.kind === "fallback") return plan;
	const { spec, text } = await render(plan.sections, candidates);
	return { kind: "router", plan, spec, text };
}

// =============================================================================
// Data fetching + rendering
// =============================================================================

/** Our tools are plain async functions wrapped by `tool()`; call them directly. */
async function run<I, O>(t: Tool<I, O>, input: I): Promise<O> {
	if (!t.execute) throw new Error("Tool has no execute function");
	return (await t.execute(input, {
		toolCallId: "jev-router",
		messages: [],
		context: undefined,
	})) as O;
}

const list = (xs: string[]) =>
	xs.length <= 1
		? (xs[0] ?? "")
		: `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`;

function describe(s: Section, c: Candidates): string {
	switch (s.tool) {
		case "weather":
			return `the weather in ${list(s.cities)}`;
		case "github_repo":
			return `stats for ${list(s.repos)}`;
		case "github_pulls":
			return `${s.state === "all" ? "" : `${s.state} `}pull requests for ${list(s.repos)}`;
		case "crypto": {
			const names = s.coinIds.map(
				(id) => c.coins.find((x) => x.id === id)?.name ?? id,
			);
			return s.historyDays
				? `${s.historyDays}-day price history for ${list(names)}`
				: `market data for ${list(names)}`;
		}
		case "hacker_news":
			return `the top ${s.count} Hacker News stories`;
	}
}

async function render(
	sections: Section[],
	c: Candidates,
): Promise<{ spec: Spec; text: string }> {
	const state: Record<string, unknown> = {};

	const nodes = await Promise.all(
		sections.map(async (s): Promise<SpecNode> => {
			switch (s.tool) {
				case "weather": {
					const data = await Promise.all(
						s.cities.map((city) => run(getWeather, { city })),
					);
					return weatherSection(
						data as Array<WeatherData | { error: string }>,
						s.cities,
						state,
					);
				}
				case "github_repo": {
					const data = await Promise.all(
						s.repos.map((r) => {
							const [owner, repo] = r.split("/") as [string, string];
							return run(getGitHubRepo, { owner, repo });
						}),
					);
					return repoSection(
						data as Array<RepoData | { error: string }>,
						s.repos,
						state,
					);
				}
				case "github_pulls": {
					const data = await Promise.all(
						s.repos.map((r) => {
							const [owner, repo] = r.split("/") as [string, string];
							return run(getGitHubPullRequests, {
								owner,
								repo,
								state: s.state,
								sort: s.sort,
								perPage: 10,
							});
						}),
					);
					return pullsSection(
						data as Array<PullsData | { error: string }>,
						s.repos,
						s.sort,
						state,
					);
				}
				case "crypto": {
					const days = s.historyDays;
					const [prices, histories] = await Promise.all([
						Promise.all(
							s.coinIds.map((coinId) => run(getCryptoPrice, { coinId })),
						),
						days
							? Promise.all(
									s.coinIds.map((coinId) =>
										run(getCryptoPriceHistory, { coinId, days }),
									),
								)
							: Promise.resolve(null),
					]);
					return cryptoSection(
						prices as Array<CryptoData | { error: string }>,
						histories as Array<CryptoHistory | { error: string }> | null,
						days,
						s.coinIds,
						state,
					);
				}
				case "hacker_news": {
					const data = await run(getHackerNewsTop, { count: s.count });
					return hackerNewsSection(
						data as HackerNewsData | { error: string },
						state,
					);
				}
			}
		}),
	);

	const text = `Here's ${list(sections.map((s) => describe(s, c)))}.`;
	return { spec: assemble(nodes, state), text };
}
