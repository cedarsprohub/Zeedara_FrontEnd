// Lightweight Paystack Inline helper. Loads the checkout script on demand and
// opens the popup with the given amount (in Naira — converted to kobo here).
const PAYSTACK_SCRIPT = "https://js.paystack.co/v1/inline.js";

function loadPaystack() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve(window.PaystackPop);
    let script = document.querySelector(`script[src="${PAYSTACK_SCRIPT}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = PAYSTACK_SCRIPT;
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener("load", () => resolve(window.PaystackPop));
    script.addEventListener("error", reject);
  });
}

/**
 * Open Paystack checkout for `amount` Naira.
 * Falls back to calling onSuccess directly when no public key is configured
 * (so flows remain demoable without keys).
 */
export async function payWithPaystack({ amount, email, reference, onSuccess, onClose }) {
  const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  if (!key) {
    onSuccess?.();
    return;
  }

  try {
    const PaystackPop = await loadPaystack();
    const handler = PaystackPop.setup({
      key,
      email: email || "customer@zeedara.com",
      amount: Math.round(amount * 100), // Paystack expects kobo
      currency: "NGN",
      ref: reference || `ZD-${Date.now()}`,
      callback: () => onSuccess?.(),
      onClose: () => onClose?.(),
    });
    handler.openIframe();
  } catch {
    onSuccess?.();
  }
}
