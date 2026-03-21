import { FullSession } from "@/types/auth";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SECRET = process.env.BASE64_TOKEN || ""


export function encryptSessionToken(session: FullSession) {
  const payload = JSON.stringify({
    userId: session.user.id,
    ts: Date.now(),
  });

  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex");

  return btoa(`${payload}.${signature}`);
}

export function isEncryptedToken(token: string | null): boolean {
  if (!token) return false;
  try {
    const decoded = atob(token);
    const [payload, signature] = decoded.split(".");
    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(payload)
      .digest("hex");
    return signature === expected;
  } catch {
    return false;
  }
}

