import { NavLink } from "react-router-dom";
import { Fingerprint, Package, Leaf, Star } from "lucide-react";

const trustBadges = [
  {
    icon: Fingerprint,
    title: "SECURE PAYMENT",
    description: "Pay safely in NGN through Paystack.",
  },
  {
    icon: Package,
    title: "AUTHENTIC BEAUTY PRODUCTS",
    description:
      "Carefully selected hair, beauty, skincare, and personal care essentials.",
  },
  {
    icon: Leaf,
    title: "RELIABLE DELIVERY",
    description: "Delivery options and fees are shown clearly before payment.",
  },
  {
    icon: Star,
    title: "CUSTOMER SUPPORT",
    description: "Need help choosing or tracking an order? We're here to help.",
  },
];

const shopLinks = [
  {
    label: "Hair & Wigs",
    to: "/categories",
  },
  {
    label: "Beauty & Care",
    to: "/categories",
  },
  {
    label: "Makeup",
    to: "/categories",
  },
  {
    label: "Skincare",
    to: "/categories",
  },
  {
    label: "Personal Care",
    to: "/categories",
  },
  {
    label: "New Arrivals",
    to: "/categories",
  },
];

const customerCareLinks = [
  {
    label: "Help Centre",
    to: "",
  },
  {
    label: "Track your Order",
    to: "",
  },
  {
    label: "Delivery Information",
    to: "",
  },
  {
    label: "Returns & Exchanges",
    to: "",
  },
  {
    label: "Refund Policy",
    to: "",
  },
  {
    label: "Payment Options",
    to: "",
  },
  {
    label: "FAQs",
    to: "",
  },
  {
    label: "Contact Support",
    to: "",
  },
];

const AboutUsLinks = [
  {
    label: "About us",
    to: "",
  },
  {
    label: "Why Zeedara",
    to: "",
  },
  {
    label: "Customer Reviews",
    to: "",
  },
  {
    label: "Wholesale Application",
    to: "",
  },
];

const myAccountLinks = [
  {
    label: "Sign In",
    to: "",
  },
  {
    label: "Create Account",
    to: "",
  },
  {
    label: "My Orders",
    to: "",
  },
  {
    label: "Saved Addresses",
    to: "",
  },
  {
    label: "Order History",
    to: "",
  },
  {
    label: "Submit a Review",
    to: "",
  },
];

const contactLinks = [
  {
    label: "Whatsapp Support",
    to: "",
  },
  {
    label: "Email",
    to: "",
  },
  {
    label: "Instagram",
    to: "",
  },
];

function Footer() {
  return (
    <div className="footer">
      <div className="top-footer bg-black">
        <div className="top-footer-inner w-full px-4 sm:px-8 lg:px-20 xl:px-[120px] py-[50px]">
          <div className="grid grid-cols-1 gap-[40px] sm:grid-cols-2 xl:grid-cols-4 xl:gap-[60px]">
            {trustBadges.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col items-center gap-[23px] text-center"
              >
                <Icon
                  className="h-12 w-12 text-(--primary-color)"
                  strokeWidth={1.5}
                />
                <div className="flex flex-col items-center gap-2">
                  <h3 className="font-['Anton'] text-[28px] leading-[34px] tracking-[-0.84px] text-white">
                    {title}
                  </h3>
                  <p className="text-[16px] leading-[1.4] text-white font-['Montserrat']">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-top bg-(--footer-background-color) py-10">
        <div className="footer-top-container w-full px-4 sm:px-8 lg:px-20 xl:px-[120px]">
          <div className="footer-top-inner grid grid-cols-1 justify-items-center w-full md:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="shop-links">
            <h3 className="text-white font-bold text-[20px] capitalize mb-4 w-full py-2 border-b border-white">
              SHOP
            </h3>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.label}>
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
            <h3 className="text-white font-bold text-[20px] capitalize mb-4 w-full py-2 border-b border-white">
              CUSTOMER CARE
            </h3>
            <ul className="space-y-2">
              {customerCareLinks.map((link) => (
                <li key={link.label}>
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
            <h3 className="text-white font-bold text-[20px] capitalize mb-4 w-full py-2 border-b border-white">
              ABOUT ZEEDARA
            </h3>
            <ul className="space-y-2">
              {AboutUsLinks.map((link) => (
                <li key={link.label}>
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
            <h3 className="text-white font-bold text-[20px] capitalize mb-4 w-full py-2 border-b border-white">
              MY ACCOUNT
            </h3>
            <ul className="space-y-2">
              {myAccountLinks.map((link) => (
                <li key={link.label}>
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
            <h3 className="text-white font-bold text-[20px] capitalize mb-4 w-full py-2 border-b border-white">
              CONTACT
            </h3>
            <ul className="space-y-2">
              {contactLinks.map((link) => (
                <li key={link.label}>
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
      </div>
      <div className="footer-bottom bg-[#6c4a13] py-6">
        <div className="w-full px-4 sm:px-8 lg:px-20 xl:px-[120px] flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-white text-center">
            Copyright &copy; {new Date().getFullYear()} Zeedara. All Rights
            Reserved.
          </p>

          <div className="footer-bottom-links flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
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
