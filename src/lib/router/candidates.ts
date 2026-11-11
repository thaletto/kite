/**
 * Code finds candidate argument values in the user's text; Jev then judges
 * which ones the user meant. Over-collecting is fine: each candidate gets its
 * own yes/no question, so a wrong candidate costs a question, not an answer.
 */

export type Coin = { id: string; name: string; symbol: string };

/** CoinGecko IDs the router can resolve. Unknown coins go to the fallback agent. */
export const COINS: readonly Coin[] = [
	{ id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
	{ id: "ethereum", name: "Ethereum", symbol: "ETH" },
	{ id: "solana", name: "Solana", symbol: "SOL" },
	{ id: "ripple", name: "XRP", symbol: "XRP" },
	{ id: "binancecoin", name: "BNB", symbol: "BNB" },
	{ id: "dogecoin", name: "Dogecoin", symbol: "DOGE" },
	{ id: "cardano", name: "Cardano", symbol: "ADA" },
	{ id: "tron", name: "TRON", symbol: "TRX" },
	{ id: "avalanche-2", name: "Avalanche", symbol: "AVAX" },
	{ id: "chainlink", name: "Chainlink", symbol: "LINK" },
	{ id: "polkadot", name: "Polkadot", symbol: "DOT" },
	{ id: "litecoin", name: "Litecoin", symbol: "LTC" },
	{ id: "the-open-network", name: "Toncoin", symbol: "TON" },
	{ id: "shiba-inu", name: "Shiba Inu", symbol: "SHIB" },
	{ id: "stellar", name: "Stellar", symbol: "XLM" },
];

export type Candidates = {
	cities: string[];
	coins: Coin[];
	repos: string[];
	numbers: number[];
};

const MAX_CITIES = 8;
const MAX_REPOS = 6;

const STOPWORDS = new Set(
	[
		"a an and are as at be but by can compare could do for from get give how i in is it its me my now of on or please show tell than that the then this to today tomorrow vs week weekend what whats when where which will with would you",
		"weather forecast temperature rain github repo repos repository pull pulls requests prs crypto price prices bitcoin ethereum hacker news stories top dashboard build stats",
		"monday tuesday wednesday thursday friday saturday sunday january february march april may june july august september october november december",
	]
		.join(" ")
		.split(" "),
);

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function findCoins(text: string): Coin[] {
	return COINS.filter((coin) => {
		const pattern = new RegExp(
			`\\b(${escapeRegExp(coin.name)}|${escapeRegExp(coin.symbol)}|${escapeRegExp(coin.id)})\\b`,
			"i",
		);
		return pattern.test(text);
	});
}

export function findRepos(text: string): string[] {
	const found = new Set<string>();
	const pattern =
		/(?:github\.com\/)?\b([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/([A-Za-z0-9._-]{1,100})\b/g;
	for (const m of text.matchAll(pattern)) {
		const repo = m[2]!.replace(/\.git$/, "").replace(/[.]+$/, "");
		if (!repo) continue;
		found.add(`${m[1]}/${repo}`);
	}
	return [...found].slice(0, MAX_REPOS);
}

/**
 * Place-name candidates: capitalized word runs, plus lowercase runs after
 * "in", "for", or "at". Jev decides which ones are places the user wants.
 */
export function findCities(
	text: string,
	exclude: readonly string[] = [],
): string[] {
	const excluded = new Set(exclude.map((e) => e.toLowerCase()));
	const found: string[] = [];
	const add = (raw: string) => {
		const words = raw
			.trim()
			.split(/\s+/)
			.filter((w) => w.length > 0);
		while (words.length && STOPWORDS.has(words[0]!.toLowerCase()))
			words.shift();
		while (words.length && STOPWORDS.has(words.at(-1)!.toLowerCase()))
			words.pop();
		const name = words.join(" ");
		if (name.length < 2 || excluded.has(name.toLowerCase())) return;
		if (!found.some((f) => f.toLowerCase() === name.toLowerCase()))
			found.push(name);
	};

	// Repos and URLs are not places.
	const cleaned = text.replace(/\S*\/\S*/g, " ");

	for (const m of cleaned.matchAll(
		/\b[A-Z][\p{L}'.-]*(?:\s+[A-Z][\p{L}'.-]*){0,2}/gu,
	)) {
		add(m[0]);
	}
	for (const m of cleaned.matchAll(
		/\b(?:in|for|at)\s+([\p{L}'.-]+(?:\s+[\p{L}'.-]+){0,2})/giu,
	)) {
		// Stop at a list separator so "in paris and rome" yields "paris" and "rome".
		for (const part of m[1]!.split(/\s+(?:and|or|vs)\s+/i)) add(part);
	}
	for (const m of cleaned.matchAll(
		/(?:,|\band\b|\bvs\.?)\s+([\p{L}'.-]+(?:\s+[\p{L}'.-]+)?)/giu,
	)) {
		add(m[1]!);
	}
	return found.slice(0, MAX_CITIES);
}

export function findNumbers(text: string): number[] {
	const nums = [...text.matchAll(/\b(\d{1,2})\b/g)]
		.map((m) => Number(m[1]))
		.filter((n) => n >= 1 && n <= 30);
	return [...new Set(nums)];
}

export function findCandidates(
	latest: string,
	earlier: readonly string[],
): Candidates {
	// Coins and repos may be referred back to ("what about its PRs?"), so look
	// in earlier messages too. Places and counts come from the latest message.
	const all = [...earlier, latest].join("\n");
	const coins = findCoins(all);
	const repos = findRepos(all);
	const cities = findCities(latest, [
		...coins.flatMap((c) => [c.name, c.symbol, c.id]),
		"Hacker News",
		"GitHub",
	]);
	return { cities, coins, repos, numbers: findNumbers(latest) };
}
