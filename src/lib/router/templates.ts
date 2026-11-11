/**
 * Deterministic json-render specs for router results. Data lives in spec
 * state and components bind to it with `$state`, like the LLM-built specs.
 */
import { nestedToFlat, type Spec } from "@json-render/core";

type Node = {
	type: string;
	props: Record<string, unknown>;
	children?: Node[];
};

const el = (
	type: string,
	props: Record<string, unknown> = {},
	children?: Node[],
): Node => (children ? { type, props, children } : { type, props });

const bind = (path: string) => ({ $state: path });

const compact = new Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 2,
});
const usd = (n: number) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: n >= 1 ? 2 : 6,
	}).format(n);
const usdCompact = (n: number) => `$${compact.format(n)}`;
const pct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
const trend = (n: number) => (n > 0 ? "up" : n < 0 ? "down" : "neutral");

type Failed = { error: string };
const failed = (x: unknown): x is Failed =>
	typeof x === "object" && x !== null && "error" in x;

const errorCallout = (title: string, x: Failed) =>
	el("Callout", { type: "warning", title, content: x.error });

const grid = (n: number, children: Node[]) =>
	el(
		"Grid",
		{ columns: Math.min(Math.max(n, 1), 3), gap: "md", className: "w-full" },
		children,
	);

const stack = (children: Node[]) =>
	el(
		"Stack",
		{ direction: "vertical", gap: "md", className: "w-full" },
		children,
	);

// =============================================================================
// Weather
// =============================================================================

export type WeatherData = {
	city: string;
	country: string;
	current: {
		temperature: number;
		feelsLike: number;
		humidity: number;
		windSpeed: number;
		condition: string;
	};
	forecast: Array<{
		day: string;
		high: number;
		low: number;
		condition: string;
		precipitation: number;
	}>;
};

export function weatherSection(
	results: Array<WeatherData | Failed>,
	names: string[],
	state: Record<string, unknown>,
): Node {
	state.weather = results;
	const ok = results.flatMap((r, i) => (failed(r) ? [] : [{ r, i }]));

	if (results.length === 1 && ok.length === 1) {
		const w = ok[0]!.r;
		return el(
			"Card",
			{
				title: `Weather in ${w.city}, ${w.country}`,
				description: w.current.condition,
			},
			[
				stack([
					grid(3, [
						el("Metric", {
							label: "Temperature",
							value: `${w.current.temperature}°F`,
							detail: `Feels like ${w.current.feelsLike}°F`,
						}),
						el("Metric", {
							label: "Humidity",
							value: `${w.current.humidity}%`,
						}),
						el("Metric", {
							label: "Wind",
							value: `${w.current.windSpeed} mph`,
						}),
					]),
					el("LineChart", {
						title: "7-day high (°F)",
						data: bind("/weather/0/forecast"),
						xKey: "day",
						yKey: "high",
					}),
					el("Table", {
						data: bind("/weather/0/forecast"),
						columns: [
							{ key: "day", label: "Day" },
							{ key: "condition", label: "Condition" },
							{ key: "high", label: "High °F" },
							{ key: "low", label: "Low °F" },
							{ key: "precipitation", label: "Precip (in)" },
						],
					}),
				]),
			],
		);
	}

	state.weatherComparison = ok.map(({ r }) => ({
		city: r.city,
		temperature: r.current.temperature,
	}));
	return stack([
		el("Heading", { text: "Weather comparison", level: "h2" }),
		grid(
			results.length,
			results.map((r, i) =>
				failed(r)
					? errorCallout(names[i] ?? "Weather", r)
					: el(
							"Card",
							{
								title: `${r.city}, ${r.country}`,
								description: r.current.condition,
							},
							[
								stack([
									el("Metric", {
										label: "Now",
										value: `${r.current.temperature}°F`,
										detail: `Feels like ${r.current.feelsLike}°F`,
									}),
									el("Text", {
										content: `Humidity ${r.current.humidity}% · Wind ${r.current.windSpeed} mph`,
										muted: true,
									}),
									el("Table", {
										data: bind(`/weather/${i}/forecast`),
										columns: [
											{ key: "day", label: "Day" },
											{ key: "high", label: "High" },
											{ key: "low", label: "Low" },
										],
									}),
								]),
							],
						),
			),
		),
		...(ok.length > 1
			? [
					el("Card", { title: "Current temperature (°F)" }, [
						el("BarChart", {
							data: bind("/weatherComparison"),
							xKey: "city",
							yKey: "temperature",
						}),
					]),
				]
			: []),
	]);
}

// =============================================================================
// Crypto
// =============================================================================

export type CryptoData = {
	id: string;
	name: string;
	symbol: string;
	rank: number;
	price: number;
	marketCap: number;
	volume24h: number;
	change24h: number;
	change7d: number;
	sparkline7d: Array<{ date: string; price: number }>;
};

export type CryptoHistory = {
	priceHistory: Array<{ date: string; price: number }>;
};

export function cryptoSection(
	results: Array<CryptoData | Failed>,
	histories: Array<CryptoHistory | Failed> | null,
	historyDays: number | null,
	ids: string[],
	state: Record<string, unknown>,
): Node {
	state.crypto = results;
	if (histories) state.cryptoHistory = histories;
	const chartTitle = historyDays
		? `Price, last ${historyDays} days`
		: "Price, last 7 days";

	const coinCard = (r: CryptoData | Failed, i: number): Node => {
		if (failed(r)) return errorCallout(ids[i] ?? "Crypto", r);
		const h = histories?.[i];
		const chart =
			h && !failed(h)
				? el("LineChart", {
						title: chartTitle,
						data: bind(`/cryptoHistory/${i}/priceHistory`),
						xKey: "date",
						yKey: "price",
					})
				: el("LineChart", {
						title: "Price, last 7 days",
						data: bind(`/crypto/${i}/sparkline7d`),
						xKey: "date",
						yKey: "price",
					});
		return el(
			"Card",
			{
				title: `${r.name} (${r.symbol})`,
				description: `Market cap rank #${r.rank}`,
			},
			[
				stack([
					grid(results.length === 1 ? 3 : 2, [
						el("Metric", {
							label: "Price",
							value: usd(r.price),
							detail: `${pct(r.change24h)} 24h`,
							trend: trend(r.change24h),
						}),
						el("Metric", {
							label: "7d change",
							value: pct(r.change7d),
							trend: trend(r.change7d),
						}),
						el("Metric", {
							label: "Market cap",
							value: usdCompact(r.marketCap),
							detail: `Vol ${usdCompact(r.volume24h)}`,
						}),
					]),
					chart,
				]),
			],
		);
	};

	if (results.length === 1) return coinCard(results[0]!, 0);

	const ok = results.filter((r): r is CryptoData => !failed(r));
	state.cryptoTable = ok.map((r) => ({
		coin: `${r.name} (${r.symbol})`,
		price: usd(r.price),
		change24h: pct(r.change24h),
		change7d: pct(r.change7d),
		marketCap: usdCompact(r.marketCap),
	}));
	return stack([
		el("Heading", { text: "Crypto dashboard", level: "h2" }),
		el("Table", {
			data: bind("/cryptoTable"),
			columns: [
				{ key: "coin", label: "Coin" },
				{ key: "price", label: "Price" },
				{ key: "change24h", label: "24h" },
				{ key: "change7d", label: "7d" },
				{ key: "marketCap", label: "Market cap" },
			],
		}),
		grid(results.length, results.map(coinCard)),
	]);
}

// =============================================================================
// GitHub
// =============================================================================

export type RepoData = {
	name: string;
	description: string | null;
	url: string;
	stars: number;
	forks: number;
	openIssues: number;
	watchers: number;
	primaryLanguage: string | null;
	license: string;
	lastPush: string;
	topics: string[];
	archived: boolean;
	languages: Array<{ language: string; percentage: number }>;
};

export function repoSection(
	results: Array<RepoData | Failed>,
	names: string[],
	state: Record<string, unknown>,
): Node {
	state.repos = results;
	const cards = results.map((r, i) => {
		if (failed(r)) return errorCallout(names[i] ?? "Repository", r);
		return el("Card", { title: r.name, description: r.description }, [
			stack([
				grid(2, [
					el("Metric", { label: "Stars", value: compact.format(r.stars) }),
					el("Metric", { label: "Forks", value: compact.format(r.forks) }),
					el("Metric", {
						label: "Open issues",
						value: compact.format(r.openIssues),
					}),
					el("Metric", {
						label: "Last push",
						value: new Date(r.lastPush).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric",
						}),
					}),
				]),
				...(r.languages.length > 0
					? [
							el("PieChart", {
								title: "Languages",
								data: bind(`/repos/${i}/languages`),
								nameKey: "language",
								valueKey: "percentage",
							}),
						]
					: []),
				el("Text", {
					content: `${r.primaryLanguage ?? "Unknown language"} · ${r.license} license${r.archived ? " · Archived" : ""}`,
					muted: true,
				}),
				el("Link", { text: "View on GitHub", href: r.url }),
			]),
		]);
	});
	if (results.length === 1) return cards[0]!;

	const ok = results.filter((r): r is RepoData => !failed(r));
	state.repoComparison = ok.map((r) => ({
		repo: r.name,
		stars: r.stars,
		forks: r.forks,
	}));
	return stack([
		el("Heading", { text: "Repository comparison", level: "h2" }),
		grid(Math.min(results.length, 2), cards),
		...(ok.length > 1
			? [
					el("Card", { title: "Stars" }, [
						el("BarChart", {
							data: bind("/repoComparison"),
							xKey: "repo",
							yKey: "stars",
						}),
					]),
				]
			: []),
	]);
}

export type PullsData = {
	repository: string;
	state: string;
	count: number;
	pullRequests: Array<{
		number: number;
		title: string;
		state: string;
		author: string;
		comments: number;
		reviews: number;
		reactions: number;
	}>;
};

const SORT_LABEL: Record<string, string> = {
	created: "newest first",
	updated: "recently updated",
	popularity: "most popular",
	"long-running": "longest running",
};

export function pullsSection(
	results: Array<PullsData | Failed>,
	names: string[],
	sort: string,
	state: Record<string, unknown>,
): Node {
	state.pulls = results;
	return stack(
		results.map((r, i) =>
			failed(r)
				? errorCallout(names[i] ?? "Pull requests", r)
				: el(
						"Card",
						{
							title: `Pull requests · ${r.repository}`,
							description: `${r.count} ${r.state === "all" ? "" : `${r.state} `}PRs, ${SORT_LABEL[sort] ?? sort}`,
						},
						[
							el("Table", {
								data: bind(`/pulls/${i}/pullRequests`),
								emptyMessage: "No pull requests found.",
								columns: [
									{ key: "number", label: "#" },
									{ key: "title", label: "Title" },
									{ key: "author", label: "Author" },
									{ key: "state", label: "State" },
									{ key: "comments", label: "Comments" },
									{ key: "reactions", label: "Reactions" },
								],
							}),
						],
					),
		),
	);
}

// =============================================================================
// Hacker News
// =============================================================================

export type HackerNewsData = {
	stories: Array<{
		title: string;
		score: number;
		author: string;
		comments: number;
	} | null>;
};

export function hackerNewsSection(
	result: HackerNewsData | Failed,
	state: Record<string, unknown>,
): Node {
	if (failed(result)) return errorCallout("Hacker News", result);
	state.hn = result;
	const stories = result.stories.filter((s) => s !== null);
	state.hnScores = stories
		.slice(0, 10)
		.map((s, i) => ({ rank: `#${i + 1}`, score: s.score }));
	return el("Card", { title: `Top ${stories.length} Hacker News stories` }, [
		stack([
			el("Table", {
				data: bind("/hn/stories"),
				columns: [
					{ key: "title", label: "Title" },
					{ key: "score", label: "Points" },
					{ key: "comments", label: "Comments" },
					{ key: "author", label: "By" },
				],
			}),
			el("BarChart", {
				title: "Points, top 10",
				data: bind("/hnScores"),
				xKey: "rank",
				yKey: "score",
			}),
		]),
	]);
}

// =============================================================================
// Assembly
// =============================================================================

export function assemble(
	sections: Node[],
	state: Record<string, unknown>,
): Spec {
	const root = sections.length === 1 ? sections[0]! : stack(sections);
	return nestedToFlat({ ...root, state });
}

export type { Node as SpecNode };
