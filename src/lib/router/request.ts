/** The exact TypeSafe request the router sends: state plus every question. */
import type { Questions } from "@typesafe-ai/sdk";
import { findCandidates } from "./candidates";
import { candidateQuestions, routeQuestions, STATE_NOTE } from "./questions";

const MAX_EARLIER_MESSAGES = 4;

export function buildRequest(latest: string, earlier: readonly string[]) {
	const candidates = findCandidates(latest, earlier);
	const recent = earlier.slice(-MAX_EARLIER_MESSAGES);
	const state: Record<string, string | string[]> = {
		note: STATE_NOTE,
		latest_message: latest,
	};
	if (recent.length > 0) state.earlier_messages = [...recent];
	const questions: Questions = {
		...routeQuestions,
		...candidateQuestions(candidates),
	};
	return { candidates, request: { state, questions } };
}
