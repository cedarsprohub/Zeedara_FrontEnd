import { NavLink } from "react-router-dom";

const navLinks = [
  { name: "HOME", path: "/", icon: "" },
  {
    name: "CATEGORIES",
    path: "/categories",
    icon: "/src/assets/navbar/arrow_down_icon.svg",
  },
  { name: "NEW ARRIVALS", path: "/new-arrivals", icon: "" },
  { name: "SKINCARE CLINIC", path: "/skincare-clinic", icon: "" },
  { name: "CONSULTATION", path: "/consultation", icon: "" },
  { name: "REQUEST A QUOTE", path: "/request-a-quote", icon: "" },
];

const socialIcons = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/zeedara",
    path: "/src/assets/navbar/instagram_icon.svg",
  },
  {
    name: "Youtube",
    url: "https://www.youtube.com/zeedara",
    path: "/src/assets/navbar/youtube_icon.svg",
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/zeedara",
    path: "/src/assets/navbar/facebook_icon.svg",
  },
  {
    name: "Twitter",
    url: "https://www.twitter.com/zeedara",
    path: "/src/assets/navbar/twitter_icon.svg",
  },
];

function Navbar() {
  return (
    <div className="navbar">
      {/* Banner  */}
      <div className="navbar-banner bg-black py-4">
        <div className="navbar-banner-inner container mx-auto px-4 flex items-center justify-between">
          <div className="nav-contact-left flex items-center space-x-4">
            <div className="socials flex items-center space-x-2">
              <span className="text-white text-[14px] 2xl:text-[16px]">
                Follow Us :
              </span>
              <div className="social-icons flex space-x-3">
                {socialIcons.map((icon) => (
                  <a
                    key={icon.name}
                    href={icon.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon block"
                  >
                    <img src={icon.path} alt={icon.name} className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
            <span className="divider text-[#e3caa1] text-[20px]">|</span>
            <span className="text-white font-semibold text-[14px] 2xl:text-[16px]">
              CALL: 090123455869 FOR INQUIRIES
            </span>
          </div>

          <div className="nav-contact-center text-[14px] 2xl:text-[16px] flex items-center font-semibold text-white">
            Members Save{" "}
            <span className="text-(--primary-color) mx-1">10%</span> Today —
            SIGN UP ON{" "}
            <span className="text-(--primary-color) ml-1">ZEEDARA</span>
          </div>

          <div className="nav-contact-right text-white font-semibold text-[14px] 2xl:text-[16px]">
            OPEN: MON - SAT: 8:00AM - 6:00PM
          </div>
        </div>
      </div>
      {/* Navbar Main */}
      <div className="navbar-main bg-white py-6">
        <div className="navbar-main-inner container mx-auto px-4 ">
          <div className="head flex items-center justify-between">
            <div className="navbar-logo">
              <NavLink to="/">
                <img
                  src="/src/assets/navbar/zeedara_logo.png"
                  alt="Zeedara Logo"
                  className="w-[180px] 2xl:w-[210.936px] h-[36px] 2xl:h-[44px] aspect-auto"
                />
              </NavLink>
            </div>

            <div className="searchbar relative">
              <input
                type="text"
                placeholder="Search a Product Here"
                className="border-none bg-[#f7f8fa] py-2 px-4 w-[600px] 2xl:w-[800px] h-[56px] focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent"
              />
              <div className="search-icon absolute right-0 h-full px-[16px] flex items-center justify-center top-1/2 transform -translate-y-1/2 bg-(--primary-color) p-2 cursor-pointer">
                <img
                  src="/src/assets/navbar/search_icon.svg"
                  alt="Search Icon"
                  className="aspect-auto"
                />
              </div>
            </div>

            <div className="account flex items-center space-x-6">
              <div className="account_btn flex items-center space-x-3 cursor-pointer">
                <div className="account_btn_inner flex items-center space-x-2">
                  <img
                    src="/src/assets/navbar/user_icon.svg"
                    className="w-5 h-5 object-cover"
                    alt="Account Icon"
                  />
                  <span className="text-[14px] 2xl:text-[16px] font-medium">
                    Account
                  </span>
                </div>
                <img
                  src="/src/assets/navbar/arrow_down_icon.svg"
                  className="w-5 h-5 object-cover"
                  alt="Account Dropdown Icon"
                />
              </div>

              <div className="shopping_cart flex space-x-1 cursor-pointer">
                <img
                  src="/src/assets/navbar/cart_icon.svg"
                  className="w-5 h-5 object-cover"
                  alt="Shopping Cart Icon"
                />
                <div className="badge py-px px-2 bg-(--primary-color) text-white text-[12px] font-bold rounded-full">
                  1
                </div>
              </div>
            </div>
          </div>

          <div className="foot w-full flex justify-center py-6">
            <div className="navbar-links flex items-center space-x-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => `
                    text-[14px] flex 2xl:text-[16px] font-semibold text-[#667085] relative transition-colors duration-300 py-2 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full 
        after:bg-(--primary-color) after:transition-transform after:duration-300 hover:text-(--primary-color) after:origin-right after:scale-x-0 hover:after:origin-left hover:after:scale-x-100
                    ${isActive ? "text-[#bf8322] after:origin-left after:scale-x-100" : ""}
                  `}
                >
                  {link.name}
                  {link.icon && (
                    <img
                      src={link.icon}
                      className="w-5 h-5 object-cover ml-2"
                      alt={link.name}
                    />
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
