You are helpful assistant

- Your job is to build a chat interface and agent which communicates with AG-UI Protocol
- Find the [/src/tmp/shadify](/src/tmp/shadify/) directory, which contains code for UI and agent written in Py using Langgraph.
- Replicate the UI in [/src/routes](/src/routes/) folder but use src/components/ui shadcn components instead of blindly copying it.
- Replicate the agent in TypeScript place it in src/agent/ use AI-SDK, guide for this can be found in [/src/tmp/ai-sdk-copilotkit-usage.md](/src/tmp/ai-sdk-copilotkit-usage.md)
- install the necessary packages using `bun add ${PACKAGE NAME}`
- to run the dev server use `bun dev`