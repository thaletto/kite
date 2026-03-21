import { useEffect, useState } from "react";

export function useMessageToken() {
  const tokenKey = "messagingUserToken";
  const countKey = "guestMessageCount";

  const [token, setToken] = useState<string | null>(null);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let t = localStorage.getItem(tokenKey);
    if (!t) {
      t = crypto.randomUUID();
      localStorage.setItem(tokenKey, t);
    }
    setToken(t);
    const storedCount = parseInt(localStorage.getItem(countKey) ?? "0", 10);
    setCount(isNaN(storedCount) ? 0 : storedCount);
  });

  function increment() {
    const newCount = count + 1;
    setCount(newCount);
    localStorage.setItem(countKey, newCount.toString());
  }

  function unLockMessaging(encryptedSessionToken: string) {
    localStorage.setItem(tokenKey, encryptedSessionToken);
    setToken(encryptedSessionToken);
    localStorage.removeItem(countKey);
    setCount(0);
  }

  return { token, count, increment, unLockMessaging };
}
