import {
	CopilotRuntime,
	copilotRuntimeNodeHTTPEndpoint,
} from "@copilotkit/runtime";
import { createFileRoute } from "@tanstack/react-router";
import { agent } from "~/agent";

const runtime = new CopilotRuntime({
	plugins: [],
});

const runtimeUrl = process.env.COPILOTKIT_RUNTIME_URL;
const runtimeToken = process.env.COPILOTKIT_RUNTIME_TOKEN;

export const Route = createFileRoute("/api/copilotkit")({
	POST: async ({ request }) => {
		const { jsonResponse, stream } = await copilotRuntimeNodeHTTPEndpoint({
			request,
			runtime,
			agent,
			runtimeUrl,
			runtimeToken,
		});

		if (stream) {
			return new Response(stream, {
				headers: jsonResponse.headers,
			});
		}

		return new Response(jsonResponse.body, {
			headers: jsonResponse.headers,
		});
	},
});
