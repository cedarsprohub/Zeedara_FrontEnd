// Paystack Inline helper: loads the checkout script on demand and opens the
// popup for an amount in Naira (converted to kobo here).
//
// This helper never reports success on its own behalf. Earlier it called
// `onSuccess` when no public key was configured and again if the script failed
// to load, which meant a missing key or a blocked CDN looked exactly like a
// completed payment. Those paths now fail loudly through `onError`.
//
// Note what `onSuccess` does and doesn't mean: Paystack's browser callback says
// the popup closed on a charge attempt, not that money moved. It hands back the
// transaction reference so the caller can have the server verify it — that
// verification is the only thing that may mark anything as paid. The store
// checkout does exactly this (see `api/payments.js` and the /payment/callback
// route); any other flow using this helper must do the same before treating a
// payment as settled.
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
    script.addEventListener("load", () => {
      if (window.PaystackPop) resolve(window.PaystackPop);
      else reject(new Error("Paystack checkout failed to initialise."));
    });
    script.addEventListener("error", () =>
      reject(new Error("Paystack checkout could not be loaded.")),
    );
  });
}

/**
 * Open Paystack checkout for `amount` Naira.
 *
 * @param onSuccess Called with `{ reference }` when the popup reports a charge
 *   attempt. The caller MUST verify that reference server-side before treating
 *   the payment as complete.
 * @param onError Called with an Error when checkout can't be opened — no
 *   configured key, script blocked, or setup threw. Nothing was charged.
 * @param onClose Called when the customer dismisses the popup.
 */
export async function payWithPaystack({
  amount,
  email,
  reference,
  onSuccess,
  onError,
  onClose,
}) {
  const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  if (!key) {
    onError?.(
      new Error(
        "Payments aren't configured (VITE_PAYSTACK_PUBLIC_KEY is missing).",
      ),
    );
    return;
  }

  if (!email) {
    onError?.(new Error("An email address is required to take a payment."));
    return;
  }

  try {
    const PaystackPop = await loadPaystack();
    const handler = PaystackPop.setup({
      key,
      email,
      amount: Math.round(amount * 100), // Paystack expects kobo
      currency: "NGN",
      ref: reference,
      // `response.reference` is what the server needs to verify the charge.
      callback: (response) =>
        onSuccess?.({ reference: response?.reference ?? reference }),
      onClose: () => onClose?.(),
    });
    handler.openIframe();
  } catch (error) {
    onError?.(error);
  }
}
