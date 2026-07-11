import { NavLink } from "react-router-dom";

function NavCard({ label, img, alt }) {
  return (
    <NavLink class="navcard flex items-center justify-between w-full bg-[#faf4eb] p-5">
      <h2 className="uppercase text-(--footer-background-color) font-bold text-[20px]">
        {label}
      </h2>
      <img src={img} className="object-fit" alt={alt} />
    </NavLink>
  );
}

export default NavCard;
