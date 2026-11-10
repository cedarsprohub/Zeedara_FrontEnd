// Shared styles and checks for the account request forms (see FormControls).

export const labelCls = "text-[14px] font-medium leading-[1.4] text-[#575f71]";

// Colour is left out of the box so a select can grey its placeholder without
// two text-colour utilities competing.
export const boxCls =
  "h-[58px] w-full border border-[#dadde2] bg-white px-[17px] text-[14px] font-medium placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none aria-invalid:border-[#cf251f]";
export const inputCls = `${boxCls} text-black`;

// Images the API accepts for customer uploads (checked by content server-side,
// so this only saves the customer a failed round trip).
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function imageError(file) {
  if (!file) return null;
  if (!IMAGE_TYPES.includes(file.type)) return "Upload a JPEG, PNG or WebP image.";
  if (file.size > MAX_IMAGE_BYTES) return "Images must be 5 MB or smaller.";
  return null;
}
