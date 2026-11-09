import MaskIcon from "../../../components/ui/MaskIcon";
import plusIcon from "../../../assets/account/skincare/plus.svg";
import timeIcon from "../../../assets/account/skincare/time.svg";
import calendarIcon from "../../../assets/account/skincare/calendar.svg";
import locationIcon from "../../../assets/account/skincare/location.svg";
import checkCircleIcon from "../../../assets/account/skincare/check-circle.svg";
import arrowRightIcon from "../../../assets/account/skincare/arrow-right.svg";
import arrowDownIcon from "../../../assets/account/skincare/arrow-down.svg";
import checkIcon from "../../../assets/account/skincare/check.svg";

// Icon frames from the design. The clock and check-circle SVGs were exported at
// the 29px avatar size; the calendar and location ones at the 24px row size.
const GLYPHS = {
  plus: { src: plusIcon, width: 15.4167, height: 15.4167, box: 20 },
  time: { src: timeIcon, width: 26.0606, height: 26.0606, box: 29.09 },
  calendar: { src: calendarIcon, width: 20.5, height: 21.5, box: 24 },
  location: { src: locationIcon, width: 17.5001, height: 21.5, box: 24 },
  checkCircle: { src: checkCircleIcon, width: 26.0606, height: 26.0606, box: 29.09 },
  arrowRight: { src: arrowRightIcon, width: 6.25004, height: 11.2501, box: 20 },
  arrowDown: { src: arrowDownIcon, width: 13.5001, height: 7.50005, box: 24 },
  check: { src: checkIcon, width: 14, height: 14, box: 20 },
};

// `size` resizes the frame (and the glyph with it), e.g. the 24px clock in an
// appointment row, or the smaller avatar on phones.
export function Glyph({ name, size, className = "" }) {
  const { box, ...glyph } = GLYPHS[name];
  const frame = size ?? box;
  return (
    <MaskIcon {...glyph} box={frame} scale={frame / box} className={className} />
  );
}
