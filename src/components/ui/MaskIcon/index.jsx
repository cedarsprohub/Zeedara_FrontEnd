// Paints an SVG asset in `currentColor` by using it as a CSS mask, so one file
// serves every colour a design asks for while keeping the asset's own geometry.
//
// `width`/`height` are the SVG's root size; `box` is the square slot it's
// centred in (the icon frame in the design); `scale` resizes the glyph when the
// design uses the same icon in a bigger frame (e.g. 24px row → 29px avatar).
export default function MaskIcon({
  src,
  width,
  height,
  box,
  scale = 1,
  className = "",
  glyphClassName = "",
}) {
  const url = `url("${src}")`;
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center ${className}`}
      style={{ width: box, height: box }}
    >
      <span
        className={`block bg-current ${glyphClassName}`}
        style={{
          width: width * scale,
          height: height * scale,
          maskImage: url,
          WebkitMaskImage: url,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
      />
    </span>
  );
}
