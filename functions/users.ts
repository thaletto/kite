"use server";
import { auth } from "@/lib/auth";

export async function signIn(email: string, password: string) {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return {
      sucess: true,
      message: `Welcome back`,
    };
  } catch (error) {
    const e = error as Error;
    console.error(`Name ${e.name}`)
    console.error(`Cause ${e.cause}`)
    console.error(`Message ${e.message}`)
    return {
      success: false,
      message: "An unknown error occured",
    };
  }
}

export async function signUp(email: string, password: string, name: string) {
  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    return {
      sucess: true,
      message: `Signed up successfully`,
    };
  } catch (error) {
    const e = error as Error;
    console.error(`Name ${e.name}`)
    console.error(`Cause ${e.cause}`)
    console.error(`Message ${e.message}`)
    return {
      success: false,
      message: "An unknown error occured",
    };
  }
}