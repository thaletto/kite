import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient();

export async function signInWithGoogle() {
    await authClient.signIn.social({
        provider: "google",
        callbackURL: "/"
    })
}