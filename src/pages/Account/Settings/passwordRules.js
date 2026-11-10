// Same rules and thresholds as the auth screens (see Auth/ChangePassword) so a
// password judged "Strong" there reads the same here.
export const requirements = [
  { key: "length", label: "8 characters minimum", test: (v) => v.length >= 8 },
  { key: "number", label: "a number", test: (v) => /\d/.test(v) },
  { key: "upper", label: "an UPPERCASE letter", test: (v) => /[A-Z]/.test(v) },
  { key: "lower", label: "a lowercase letter", test: (v) => /[a-z]/.test(v) },
];

// Weak / Medium / Strong, with the meter's colour and fill.
export function passwordStrength(password) {
  const metCount = requirements.filter((r) => r.test(password)).length;
  return {
    metCount,
    allMet: metCount === requirements.length,
    label: metCount <= 2 ? "Weak" : metCount === 3 ? "Medium" : "Strong",
    color: metCount <= 1 ? "#cf251f" : metCount <= 3 ? "#e7ba6c" : "#0f9959",
    width: password ? (metCount / requirements.length) * 100 : 0,
  };
}
