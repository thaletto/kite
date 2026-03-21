export function dispatchNewChat() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("new-chat"));
  }
}
