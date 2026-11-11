import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { findCandidates, findCities, findRepos } from "./candidates";
import { type Answers, decide } from "./decide";
import { buildRequest } from "./request";
import {
	assemble,
	cryptoSection,
	hackerNewsSection,
	repoSection,
	weatherSection,
} from "./templates";

const yes = { type: "noul", noul: 0.95 } as const;
const no = { type: "noul", noul: 0.05 } as const;
const mid = { type: "noul", noul: 0.5 } as const;
const pick = (choice: string) => ({ type: "choice", choice }) as const;

const base: Record<string, unknown> = {
	asks_other_topic: no,
	asks_beyond_data: no,
	wants_weather: no,
	wants_github_repo: no,
	wants_github_pulls: no,
	wants_crypto: no,
	wants_hacker_news: no,
	crypto_wants_history: no,
	crypto_range: pick("month"),
	pulls_state: pick("open"),
	pulls_state_stated: no,
	pulls_sort: pick("created"),
	pulls_sort_stated: no,
	hn_count_stated: no,
};
const answers = (over: Record<string, unknown>) =>
	({ ...base, ...over }) as Answers;

describe("candidates", () => {
	it("finds capitalized and listed city names", () => {
		expect(
			findCities("Compare the weather in New York, London, and Tokyo"),
		).toEqual(expect.arrayContaining(["New York", "London", "Tokyo"]));
	});

	it("finds lowercase places after prepositions", () => {
		expect(findCities("weather in paris and rome")).toEqual(
			expect.arrayContaining(["paris", "rome"]),
		);
	});

	it("finds repos and strips github URLs", () => {
		expect(
			findRepos(
				"Show me stats for the effect-ts/effect and https://github.com/effect-ts/effect-smol repos",
			),
		).toEqual(["effect-ts/effect", "effect-ts/effect-smol"]);
	});

	it("finds coins by name or symbol, and repos from earlier messages", () => {
		const c = findCandidates("what about its PRs, and ETH?", [
			"show vercel/next.js",
		]);
		expect(c.coins.map((x) => x.id)).toEqual(["ethereum"]);
		expect(c.repos).toEqual(["vercel/next.js"]);
	});

	it("does not offer coin names as places", () => {
		const c = findCandidates(
			"Build a crypto dashboard for Bitcoin and Solana",
			[],
		);
		expect(c.cities).not.toContain("Bitcoin");
		expect(c.cities).not.toContain("Solana");
	});
});

describe("buildRequest", () => {
	it("omits earlier_messages when there are none and asks one question per candidate", () => {
		const { request, candidates } = buildRequest(
			"Weather in Paris and BTC",
			[],
		);
		expect(request.state).not.toHaveProperty("earlier_messages");
		expect(Object.keys(request.questions)).toEqual(
			expect.arrayContaining(["wants_weather", "coin_0"]),
		);
		candidates.cities.forEach((_, i) => {
			expect(request.questions).toHaveProperty(`city_${i}`);
		});
	});
});

describe("decide", () => {
	const c = {
		cities: ["Compare", "New York", "London"],
		coins: [{ id: "bitcoin", name: "Bitcoin", symbol: "BTC" }],
		repos: ["vercel/next.js"],
		numbers: [15],
	};

	it("routes weather with only the picked cities", () => {
		const plan = decide(
			answers({ wants_weather: yes, city_0: no, city_1: yes, city_2: yes }),
			c,
		);
		expect(plan).toEqual({
			kind: "router",
			sections: [{ tool: "weather", cities: ["New York", "London"] }],
		});
	});

	it("falls back when the request goes beyond data", () => {
		expect(decide(answers({ asks_beyond_data: yes }), c)).toMatchObject({
			kind: "fallback",
		});
	});

	it("falls back when a tool or candidate is unsettled", () => {
		expect(decide(answers({ wants_crypto: mid }), c).kind).toBe("fallback");
		expect(
			decide(
				answers({ wants_weather: yes, city_0: no, city_1: mid, city_2: yes }),
				c,
			).kind,
		).toBe("fallback");
	});

	it("falls back when no tool is wanted or no argument is picked", () => {
		expect(decide(answers({}), c).kind).toBe("fallback");
		expect(
			decide(
				answers({ wants_weather: yes, city_0: no, city_1: no, city_2: no }),
				c,
			).kind,
		).toBe("fallback");
	});

	it("reads speculative answers only when their condition holds", () => {
		const plan = decide(
			answers({
				wants_crypto: yes,
				coin_0: yes,
				crypto_wants_history: yes,
				crypto_range: pick("year"),
				wants_hacker_news: yes,
				hn_count_stated: yes,
			}),
			c,
		);
		expect(plan).toEqual({
			kind: "router",
			sections: [
				{ tool: "crypto", coinIds: ["bitcoin"], historyDays: 365 },
				{ tool: "hacker_news", count: 15 },
			],
		});
	});

	it("uses PR defaults unless the user states them", () => {
		const plan = decide(
			answers({
				wants_github_pulls: yes,
				repo_0: yes,
				pulls_state: pick("closed"),
				pulls_sort: pick("long_running"),
				pulls_sort_stated: yes,
			}),
			c,
		);
		expect(plan).toEqual({
			kind: "router",
			sections: [
				{
					tool: "github_pulls",
					repos: ["vercel/next.js"],
					state: "open",
					sort: "long-running",
				},
			],
		});
	});
});

describe("templates", () => {
	// Importing the catalog pulls in zod, which doesn't resolve under vitest
	// here; read the component keys from its source instead.
	const catalogSource = readFileSync(
		new URL("../render/catalog.ts", import.meta.url),
		"utf8",
	);
	const known = new Set(
		[...catalogSource.matchAll(/^ {4}(\w+): (?:\{|shadcn)/gm)].map((m) => m[1]),
	);

	const weather = {
		city: "London",
		country: "UK",
		current: {
			temperature: 50,
			feelsLike: 47,
			humidity: 80,
			windSpeed: 10,
			condition: "Overcast",
		},
		forecast: [
			{ day: "Mon", high: 52, low: 44, condition: "Rain", precipitation: 0.2 },
		],
	};

	it("builds specs that use only catalog components and bind real state paths", () => {
		const state: Record<string, unknown> = {};
		const spec = assemble(
			[
				weatherSection(
					[weather, { error: "City not found: Xyz" }],
					["London", "Xyz"],
					state,
				),
				cryptoSection(
					[
						{
							id: "bitcoin",
							name: "Bitcoin",
							symbol: "BTC",
							rank: 1,
							price: 1,
							marketCap: 2,
							volume24h: 3,
							change24h: 1,
							change7d: -1,
							sparkline7d: [],
						},
					],
					null,
					null,
					["bitcoin"],
					state,
				),
				repoSection([{ error: "Not found: a/b" }], ["a/b"], state),
				hackerNewsSection(
					{ stories: [{ title: "t", score: 1, author: "a", comments: 0 }] },
					state,
				),
			],
			state,
		);

		for (const element of Object.values(spec.elements)) {
			expect(known).toContain(element.type);
			const data = (element.props as { data?: { $state?: string } }).data;
			if (data?.$state) {
				const value = data.$state
					.split("/")
					.slice(1)
					.reduce<unknown>(
						(o, k) => (o as Record<string, unknown> | undefined)?.[k],
						spec.state,
					);
				expect(Array.isArray(value), data.$state).toBe(true);
			}
		}
		expect(spec.elements[spec.root]?.type).toBe("Stack");
	});
});
