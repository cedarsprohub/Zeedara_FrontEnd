import { useEffect, useRef, useState } from "react";
import { useGoogleIdentityScript } from "../../hooks/useGoogleIdentityScript";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Google's renderButton only supports its own limited styling options, not
// arbitrary custom markup, so we render the real (interactive) button
// invisibly on top of a decorative button that matches the site's design.
// The click a user sees land on our button is actually landing on Google's.
function GoogleAuthButton({ label, icon, onCredential, onError }) {
  const isReady = useGoogleIdentityScript();
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Callbacks land in refs so the init effect only depends on `isReady` —
  // onCredential/onError are fresh closures every render in the caller.
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!isReady || !CLIENT_ID || !containerRef.current) return;

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response) => onCredentialRef.current(response.credential),
    });

    containerRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(containerRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      width: 400,
    });
  }, [isReady]);

  const handleClick = () => {
    if (!CLIENT_ID) onErrorRef.current?.("Google sign-in isn't configured yet.");
  };

  return (
    <div className="relative w-full">
      <div
        aria-hidden="true"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`pointer-events-none flex w-full items-center justify-between gap-2 border border-[#8c8c8c] px-[17px] py-[13px] transition-colors ${
          isHovered ? "bg-[#f7f8fa]" : ""
        }`}
      >
        <img src={icon} alt="" className="size-6 shrink-0" />
        <span className="flex-1 text-center text-[14px] font-semibold text-black">
          {label}
        </span>
        <span className="size-6 shrink-0" />
      </div>

      {/* The genuinely clickable element — invisible, same footprint. */}
      <div
        ref={containerRef}
        onClick={handleClick}
        className="absolute inset-0 overflow-hidden opacity-0 [&>div]:h-full [&>div]:w-full"
      />
    </div>
  );
}

export default GoogleAuthButton;
