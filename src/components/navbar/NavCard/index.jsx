import { NavLink } from "react-router-dom";

function NavCard({ label, img, alt, to }) {
  return (
    <NavLink to={to} class="navcard w-full">
      <div className="flex items-center justify-between w-full bg-[#faf4eb] p-5">
        <h2 className="uppercase text-(--footer-background-color) w-fit font-bold text-[20px]">
          {label}
        </h2>
        <img src={img} className="object-fit w-[50%]" alt={alt} />
      </div>
    </NavLink>
  );
}

export default NavCard;
