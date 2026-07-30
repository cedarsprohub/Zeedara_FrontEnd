import whatsappIcon from "../../../assets/home/whatsapp.svg";

// Floating WhatsApp shortcut pinned to the bottom-right of the landing page.
const WHATSAPP_URL = "https://wa.me/2349012345643";

function WhatsappFab() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Zeedara on WhatsApp"
      title="Chat with us on WhatsApp"
      className="fixed bottom-5 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-transform hover:scale-105 lg:bottom-8 lg:right-8 lg:size-[72px]"
    >
      <img
        src={whatsappIcon}
        alt=""
        className="size-8 lg:size-10"
        loading="lazy"
      />
    </a>
  );
}

export default WhatsappFab;
