import { NavLink } from "react-router-dom";

const shopLinks = [
  {
    label: "Hair & Wigs",
    to: "/categories",
  },
  {
    label: "Hair & Wigs",
    to: "/categories",
  },
  {
    label: "Hair & Wigs",
    to: "/categories",
  },
  {
    label: "Hair & Wigs",
    to: "/categories",
  },
  {
    label: "Hair & Wigs",
    to: "/categories",
  },
  {
    label: "Hair & Wigs",
    to: "/categories",
  },
];

const customerCareLinks = [
  {
    label: "Help Centre",
    to: "",
  },
  {
    label: "Help Centre",
    to: "",
  },
  {
    label: "Help Centre",
    to: "",
  },
  {
    label: "Help Centre",
    to: "",
  },
  {
    label: "Help Centre",
    to: "",
  },
  {
    label: "Help Centre",
    to: "",
  },
  {
    label: "Help Centre",
    to: "",
  },
  {
    label: "Help Centre",
    to: "",
  },
];

const AboutUsLinks = [
  {
    label: "About Zeedara",
    to: "",
  },
  {
    label: "About Zeedara",
    to: "",
  },
  {
    label: "About Zeedara",
    to: "",
  },
  {
    label: "About Zeedara",
    to: "",
  },
];

const myAccountLinks = [
  {
    label: "Sign In",
    to: "",
  },
  {
    label: "Sign In",
    to: "",
  },
  {
    label: "Sign In",
    to: "",
  },
  {
    label: "Sign In",
    to: "",
  },
  {
    label: "Sign In",
    to: "",
  },
  {
    label: "Sign In",
    to: "",
  },
];

const contactLinks = [
  {
    label: "Whatsapp Support",
    to: "",
  },
  {
    label: "Whatsapp Support",
    to: "",
  },
  {
    label: "Whatsapp Support",
    to: "",
  },
];

function Footer() {
  return (
    <div className="footer bg-(--footer-background-color)">
      <div className="footer-top container mx-auto py-10 px-4">
        <div className="footer-top-inner grid grid-cols-1 justify-items-center w-full md:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="shop-links">
            <h3 className="text-white font-bold text-[16px] capitalize mb-4 w-full py-2 border-b border-white">
              SHOP
            </h3>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.to}>
                  <a
                    href={link.to}
                    className="text-white hover:text-(--primary-color)"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="customer-care-links">
            <h3 className="text-white font-bold text-[16px] capitalize mb-4 w-full py-2 border-b border-white">
              CUSTOMER CARE
            </h3>
            <ul className="space-y-2">
              {customerCareLinks.map((link) => (
                <li key={link.to}>
                  <a
                    href={link.to}
                    className="text-white hover:text-(--primary-color)"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="about-us-links">
            <h3 className="text-white font-bold text-[16px] capitalize mb-4 w-full py-2 border-b border-white">
              ABOUT ZEEDARA
            </h3>
            <ul className="space-y-2">
              {AboutUsLinks.map((link) => (
                <li key={link.to}>
                  <a
                    href={link.to}
                    className="text-white hover:text-(--primary-color)"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="account-links">
            <h3 className="text-white font-bold text-[16px] capitalize mb-4 w-full py-2 border-b border-white">
              MY ACCOUNT
            </h3>
            <ul className="space-y-2">
              {myAccountLinks.map((link) => (
                <li key={link.to}>
                  <a
                    href={link.to}
                    className="text-white hover:text-(--primary-color)"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="contact-links">
            <h3 className="text-white font-bold text-[16px] capitalize mb-4 w-full py-2 border-b border-white">
              CONTACT
            </h3>
            <ul className="space-y-2">
              {contactLinks.map((link) => (
                <li key={link.to}>
                  <a
                    href={link.to}
                    className="text-white hover:text-(--primary-color)"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom bg-[#6c4a13] py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-white text-center">
            Copyright &copy; {new Date().getFullYear()} Zeedara. All Rights
            Reserved.
          </p>

          <div className="footer-bottom-links flex items-center space-x-4">
            <NavLink
              className="text-white hover:text-(--primary-color) hover:underline"
              to="/"
            >
              Terms & Conditions
            </NavLink>
            <div className="h-1 w-1 bg-white rounded-full"></div>
            <NavLink
              className="text-white hover:text-(--primary-color) hover:underline"
              to="/"
            >
              Privacy Policy
            </NavLink>
            <div className="h-1 w-1 bg-white rounded-full"></div>
            <NavLink
              className="text-white hover:text-(--primary-color) hover:underline"
              to="/"
            >
              Cookie Policy
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
