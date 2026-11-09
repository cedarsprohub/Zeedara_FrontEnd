import userIcon from "../../assets/account/nav/user.svg";
import boxIcon from "../../assets/account/nav/box.svg";
import reviewsIcon from "../../assets/account/nav/reviews.svg";
import hairIcon from "../../assets/account/nav/hair.svg";
import supportIcon from "../../assets/account/nav/support.svg";
import chevronIcon from "../../assets/account/nav/chev.svg";
import backIcon from "../../assets/account/nav/back.svg";

// Each glyph at the SVG's own root size. The design paints the same shapes in
// different colours per breakpoint (#141B34 in the desktop rail, gold on the
// mobile menu), so the SVG is used as a mask over `currentColor` rather than an
// <img> — one file, any colour, geometry untouched.
const ICONS = {
  user: { src: userIcon, width: 17.0005, height: 18.6667 },
  box: { src: boxIcon, width: 18.6672, height: 18.6667 },
  reviews: { src: reviewsIcon, width: 20, height: 20 },
  hair: { src: hairIcon, width: 20, height: 20 },
  support: { src: supportIcon, width: 18.6667, height: 17 },
  chevron: { src: chevronIcon, width: 6.50005, height: 11.5001 },
  back: { src: backIcon, width: 8, height: 12 },
};

// `box` is the slot the glyph is centred in (20px for nav icons, 16px for the
// back arrow), matching the icon frames in the design.
export default function NavIcon({ name, box = 20, className = "", glyphClassName = "" }) {
  const { src, width, height } = ICONS[name];
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center ${className}`}
      style={{ width: box, height: box }}
    >
      <span
        className={`block bg-current ${glyphClassName}`}
        style={{
          width,
          height,
          maskImage: `url("${src}")`,
          WebkitMaskImage: `url("${src}")`,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
      />
    </span>
  );
}
