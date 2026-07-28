import { useEffect, useState } from "react";

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let scriptPromise = null;

function loadScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Failed to load Google Identity Services"));
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

// Loads the Google Identity Services script once and shares it across every
// mounted GoogleAuthButton — safe to call from multiple components at once.
export function useGoogleIdentityScript() {
  const [isReady, setIsReady] = useState(() => Boolean(window.google?.accounts?.id));

  useEffect(() => {
    if (isReady) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (!cancelled) setIsReady(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isReady]);

  return isReady;
}
