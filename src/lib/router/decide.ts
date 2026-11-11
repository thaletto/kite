/**
 * The router's truth table: Jev answers in, a plan out. Pure code, no I/O.
 *
 * | other topic / beyond data | each tool Noul      | candidates         | outcome   |
 * |---------------------------|---------------------|--------------------|-----------|
 * | any not clearly no        | -                   | -                  | fallback  |
 * | no                        | any unsettled       | -                  | fallback  |
 * | no                        | none yes            | -                  | fallback  |
 * | no                        | yes ones, rest no   | any unsettled      | fallback  |
 * | no                        | yes ones, rest no   | none picked (arg)  | fallback  |
 * | no                        | yes ones, rest no   | picked, rest no    | router    |
 */
import type { Candidates } from "./candidates";
import { CRYPTO_RANGE_DAYS, NO, YES } from "./questions";

type Band = "yes" | "no" | "unsettled";

export type NoulAnswer = { type: "noul"; noul: number };
export type ChoiceAnswer = { type: "choice"; choice: string };
export type Answers = Readonly<
	Record<string, NoulAnswer | ChoiceAnswer | { type: string }>
>;

export type PullState = "open" | "closed" | "all";
export type PullSort = "created" | "updated" | "popularity" | "long-running";

export type Section =
	| { tool: "weather"; cities: string[] }
	| { tool: "github_repo"; repos: string[] }
	| { tool: "github_pulls"; repos: string[]; state: PullState; sort: PullSort }
	| { tool: "crypto"; coinIds: string[]; historyDays: number | null }
	| { tool: "hacker_news"; count: number };

export type Plan =
	| { kind: "router"; sections: Section[] }
	| { kind: "fallback"; reason: string };

const DEFAULT_HN_COUNT = 10;

export function band(p: number): Band {
	if (p > YES) return "yes";
	if (p < NO) return "no";
	return "unsettled";
}

function noulOf(answers: Answers, id: string): number {
	const a = answers[id];
	if (!a || a.type !== "noul") throw new Error(`Missing noul answer: ${id}`);
	return (a as NoulAnswer).noul;
}

function choiceOf(answers: Answers, id: string): string {
	const a = answers[id];
	if (!a || a.type !== "choice")
		throw new Error(`Missing choice answer: ${id}`);
	return (a as ChoiceAnswer).choice;
}

/** Picked candidates, or null when any candidate is unsettled. */
function pick<T>(
	answers: Answers,
	prefix: string,
	items: readonly T[],
): T[] | null {
	const picked: T[] = [];
	for (let i = 0; i < items.length; i++) {
		const b = band(noulOf(answers, `${prefix}_${i}`));
		if (b === "unsettled") return null;
		if (b === "yes") picked.push(items[i]!);
	}
	return picked;
}

export function decide(answers: Answers, c: Candidates): Plan {
	for (const id of ["asks_other_topic", "asks_beyond_data"]) {
		const b = band(noulOf(answers, id));
		if (b !== "no") return { kind: "fallback", reason: `${id}: ${b}` };
	}

	const tools = [
		"wants_weather",
		"wants_github_repo",
		"wants_github_pulls",
		"wants_crypto",
		"wants_hacker_news",
	] as const;
	const wanted = new Set<(typeof tools)[number]>();
	for (const id of tools) {
		const b = band(noulOf(answers, id));
		if (b === "unsettled")
			return { kind: "fallback", reason: `${id}: unsettled` };
		if (b === "yes") wanted.add(id);
	}
	if (wanted.size === 0) return { kind: "fallback", reason: "no tool wanted" };

	const sections: Section[] = [];

	if (wanted.has("wants_weather")) {
		const cities = pick(answers, "city", c.cities);
		if (!cities) return { kind: "fallback", reason: "city: unsettled" };
		if (cities.length === 0)
			return { kind: "fallback", reason: "weather: no city" };
		sections.push({ tool: "weather", cities });
	}

	const needsRepos =
		wanted.has("wants_github_repo") || wanted.has("wants_github_pulls");
	const repos = needsRepos ? pick(answers, "repo", c.repos) : [];
	if (needsRepos) {
		if (!repos) return { kind: "fallback", reason: "repo: unsettled" };
		if (repos.length === 0)
			return { kind: "fallback", reason: "github: no repo" };
	}

	if (wanted.has("wants_github_repo")) {
		sections.push({ tool: "github_repo", repos: repos! });
	}

	if (wanted.has("wants_github_pulls")) {
		const state =
			band(noulOf(answers, "pulls_state_stated")) === "yes"
				? (choiceOf(answers, "pulls_state") as PullState)
				: "open";
		const sortChoice =
			band(noulOf(answers, "pulls_sort_stated")) === "yes"
				? choiceOf(answers, "pulls_sort")
				: "created";
		const sort = (
			sortChoice === "long_running" ? "long-running" : sortChoice
		) as PullSort;
		sections.push({ tool: "github_pulls", repos: repos!, state, sort });
	}

	if (wanted.has("wants_crypto")) {
		const coins = pick(answers, "coin", c.coins);
		if (!coins) return { kind: "fallback", reason: "coin: unsettled" };
		if (coins.length === 0)
			return { kind: "fallback", reason: "crypto: no known coin" };
		const history = band(noulOf(answers, "crypto_wants_history"));
		if (history === "unsettled") {
			return { kind: "fallback", reason: "crypto_wants_history: unsettled" };
		}
		const historyDays =
			history === "yes"
				? CRYPTO_RANGE_DAYS[
						choiceOf(answers, "crypto_range") as keyof typeof CRYPTO_RANGE_DAYS
					]
				: null;
		sections.push({
			tool: "crypto",
			coinIds: coins.map((x) => x.id),
			historyDays,
		});
	}

	if (wanted.has("wants_hacker_news")) {
		let count = DEFAULT_HN_COUNT;
		if (
			c.numbers.length > 0 &&
			band(noulOf(answers, "hn_count_stated")) === "yes"
		) {
			count =
				c.numbers.length === 1
					? c.numbers[0]!
					: Number(choiceOf(answers, "hn_count"));
		}
		sections.push({ tool: "hacker_news", count });
	}

	return { kind: "router", sections };
}
