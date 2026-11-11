/**
 * Every question, option, criterion, and threshold the Jev router sends.
 * Edit wording here; decision logic lives in `decide.ts`.
 */
import { choice, noul, type Questions } from "@typesafe-ai/sdk";
import type { Candidates } from "./candidates";

/** Above YES reads as yes, below NO as no; between means unsettled. */
export const YES = 0.7;
export const NO = 0.3;

export const STATE_NOTE =
	"`latest_message` is the request to answer. `earlier_messages` are the user's previous messages in this chat, oldest first, for context only.";

export const routeQuestions = {
	wants_weather: noul(
		"Does `latest_message` ask to see the weather for a place?",
		{
			true: "The user wants current conditions or a forecast for one or more places.",
			false:
				"The user asks about something else, or mentions weather only as part of a general topic such as climate.",
		},
	),
	wants_github_repo: noul(
		"Does `latest_message` ask to see stats about a GitHub repository, such as stars, forks, issues, or languages?",
	),
	wants_github_pulls: noul(
		"Does `latest_message` ask to see pull requests of a GitHub repository?",
	),
	wants_crypto: noul(
		"Does `latest_message` ask to see the price or market data of a cryptocurrency?",
	),
	wants_hacker_news: noul(
		"Does `latest_message` ask to see stories from Hacker News?",
	),
	asks_other_topic: noul(
		"Does `latest_message` ask about anything other than weather, GitHub repositories, cryptocurrency prices, or Hacker News stories?",
		{
			true: "Part of the request is about another subject, such as stock prices, news from another site, or a general topic.",
			false:
				"Everything the user asks for is weather, GitHub, cryptocurrency, or Hacker News data.",
		},
	),
	asks_beyond_data: noul(
		"Does `latest_message` ask for an explanation, a lesson, a quiz, advice, or a 3D scene?",
		{
			true: "The user wants something written or built beyond the data itself, such as 'explain why Bitcoin dropped' or 'quiz me on these stories'.",
			false:
				"The user only wants the data shown, such as 'show me the weather in Paris' or 'compare these repos'.",
		},
	),
	crypto_wants_history: noul(
		"Does `latest_message` ask how a cryptocurrency's price changed over a period of time?",
		{
			true: "The user asks for a price history or a chart over a period, such as 'Bitcoin over the last year'.",
			false: "The user asks for the current price or current market stats.",
		},
	),
	crypto_range: choice("Over what period does the user want price history?", {
		week: "The last 7 days",
		month: "About the last 30 days",
		quarter: "About the last 90 days",
		year: "About the last 12 months",
	}),
	pulls_state: choice("Which pull requests does the user want to see?", {
		open: "Pull requests that are still open",
		closed: "Pull requests that were merged or closed",
		all: "Pull requests in any state",
	}),
	pulls_state_stated: noul(
		"Does `latest_message` say which pull requests it wants by state, such as open, closed, or merged?",
	),
	pulls_sort: choice("How does the user want the pull requests ordered?", {
		created: "Newest first",
		updated: "Most recently updated first",
		popularity: "Most discussed or most reacted to first",
		long_running: "The ones open the longest first",
	}),
	pulls_sort_stated: noul(
		"Does `latest_message` say how the pull requests should be ordered or ranked?",
	),
	hn_count_stated: noul(
		"Does `latest_message` say how many Hacker News stories it wants?",
	),
} satisfies Questions;

export const CRYPTO_RANGE_DAYS = {
	week: 7,
	month: 30,
	quarter: 90,
	year: 365,
} as const;

/** One question per candidate value; code reads only those for routes that apply. */
export function candidateQuestions(c: Candidates): Questions {
	const qs: Questions = {};
	c.cities.forEach((city, i) => {
		qs[`city_${i}`] = noul(
			`Does \`latest_message\` ask for the weather in "${city}"?`,
		);
	});
	c.coins.forEach((coin, i) => {
		qs[`coin_${i}`] = noul(
			`Does \`latest_message\` ask about the cryptocurrency ${coin.name} (${coin.symbol}), either by name or by referring back to it?`,
		);
	});
	c.repos.forEach((repo, i) => {
		qs[`repo_${i}`] = noul(
			`Does \`latest_message\` ask about the GitHub repository ${repo}, either by name or by referring back to it?`,
		);
	});
	if (c.numbers.length > 1) {
		qs.hn_count = choice(
			"How many Hacker News stories does the user want?",
			Object.fromEntries(c.numbers.map((n) => [String(n), `${n} stories`])),
		);
	}
	return qs;
}
