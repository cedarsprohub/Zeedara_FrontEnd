import { NavLink } from "react-router-dom";
import { Fingerprint, Package, Leaf, Star } from "lucide-react";
import logo from "../../assets/navbar/zeedara_logo.png";

import phoneIcon from "../../assets/footer/phoneIcon.svg";
import mailIcon from "../../assets/footer/mailIcon.svg";
import locationIcon from "../../assets/footer/locationIcon.svg";
import tiktokIcon from "../../assets/footer/tiktok.svg";
import threadsIcon from "../../assets/footer/threadsIcon.svg";
import xIcon from "../../assets/footer/xIcon.svg";
import instagramIcon from "../../assets/footer/instagramIcon.svg";
import facebookIcon from "../../assets/footer/facebookIcon.svg";

const trustBadges = [
  {
    icon: Fingerprint,
    title: "SECURE PAYMENT",
    description: "Pay safely in NGN through Paystack.",
  },
  {
    icon: Package,
    title: "AUTHENTIC PRODUCTS",
    description: "Selected hair, beauty, skincare, & personal care essentials.",
  },
  {
    icon: Leaf,
    title: "RELIABLE DELIVERY",
    description: "Delivery fees are shown clearly before payment.",
  },
  {
    icon: Star,
    title: "CUSTOMER SUPPORT",
    description: "Need help choosing or tracking an order? We’re here to help.",
  },
];

const socials = [
  {
    img: tiktokIcon,
    to: "/",
    alt: "Tiktok",
  },
  {
    img: threadsIcon,
    to: "/",
    alt: "Threads",
  },
  {
    img: xIcon,
    to: "/",
    alt: "X",
  },
  {
    img: instagramIcon,
    to: "/",
    alt: "Instagram",
  },
  {
    img: facebookIcon,
    to: "/",
    alt: "Facebook",
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
    to: "/login",
  },
  {
    label: "Create Account",
    to: "/register",
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
        <div className="top-footer-inner mx-auto w-full max-w-[1920px] px-[clamp(1rem,6.25vw,7.5rem)] py-[50px]">
          <div className="grid grid-cols-2 gap-[40px] sm:grid-cols-2 lg:grid-cols-4 lg:gap-[clamp(1.5rem,3.125vw,3.75rem)]">
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
                  <h3 className="font-['Anton'] text-[18px] leading-[34px] tracking-[-0.84px] text-white">
                    {title}
                  </h3>
                  <p className="text-[12px] leading-[1.4] text-white font-['Montserrat']">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-top bg-(--footer-background-color) py-10">
        <div className="footer-top-container mx-auto w-full max-w-[1920px] px-[clamp(1rem,6.25vw,7.5rem)]">
          <div className="footer-top-inner grid grid-cols-1 lg:justify-items-center 2xl:justify-items-end w-full gap-x-8 lg:gap-x-0 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            <div className="about flex flex-col gap-4">
              <img
                src={logo}
                className="object-fit h-[26px] w-[128px] lg:h-[44px] lg:w-[210px]"
                alt="Zeedara Logo"
              />
              <p className="text-[14px] text-white">
                Zeedara offers quality wigs, beauty, skincare, and personal care
                products designed to help you look confident, beautiful, and
                cared for every day.
              </p>

              <div className="contact flex flex-col gap-2">
                <div className="flex gap-3">
                  <img
                    src={phoneIcon}
                    className="object-fit h-[20px] w-[19px]"
                  />
                  <span className="text-white text-[14px]">
                    Phone: +234(0) 901 234 5643
                  </span>
                </div>
                <div className="flex gap-3">
                  <img
                    src={mailIcon}
                    className="object-fit h-[20px] w-[19px]"
                  />
                  <span className="text-white text-[14px]">
                    Email: email@zeedara.com
                  </span>
                </div>
                <div className="flex gap-3">
                  <img
                    src={locationIcon}
                    className="object-fit h-[20px] w-[19px]"
                  />
                  <span className="text-white text-[14px]">
                    Omma Mall Ground floor, Moore Jackson street, Bonny Island,
                    Rivers state, Nigeria.
                  </span>
                </div>
              </div>
            </div>

            <div className="shop-links">
              <h3 className="text-white font-bold text-[18px] capitalize mb-1 lg:mb-4 w-full py-2 border-none lg:border-b lg:border-white">
                SHOP
              </h3>
              <ul className="space-y-2">
                {shopLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.to}
                      className="text-white text-[14px] hover:text-(--primary-color)"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="customer-care-links">
              <h3 className="text-white font-bold text-[18px] capitalize mb-1 lg:mb-4 w-full py-2 border-none lg:border-b lg:border-white">
                CUSTOMER CARE
              </h3>
              <ul className="space-y-2">
                {customerCareLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.to}
                      className="text-white text-[14px] hover:text-(--primary-color)"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="about-us-links">
              <h3 className="text-white font-bold text-[18px] capitalize mb-1 lg:mb-4 w-full py-2 border-none lg:border-b lg:border-white">
                ABOUT ZEEDARA
              </h3>
              <ul className="space-y-2">
                {AboutUsLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.to}
                      className="text-white text-[14px] hover:text-(--primary-color)"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="account-links">
              <h3 className="text-white font-bold text-[18px] capitalize mb-1 lg:mb-4 w-full py-2 border-none lg:border-b lg:border-white">
                MY ACCOUNT
              </h3>
              <ul className="space-y-2">
                {myAccountLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.to}
                      className="text-white text-[14px] hover:text-(--primary-color)"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="contact-links">
              <h3 className="text-white font-bold text-[18px] capitalize mb-1 lg:mb-4 w-full py-2 border-none lg:border-b lg:border-white">
                CONTACT
              </h3>
              <ul className="space-y-2">
                {contactLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.to}
                      className="text-white text-[14px] hover:text-(--primary-color)"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="socials mt-6 flex gap-3 items-center justify-between border p-3 lg:p-2 border-white">
                {socials.map((social, key) => {
                  return (
                    <NavLink to={social.to} key={key}>
                      <img
                        src={social.img}
                        className="object-fit h-[27px] w-[26px] lg:h-[20px] lg:w-[19px]"
                        alt={social.alt}
                      />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom bg-[#6c4a13] py-6">
        <div className="mx-auto w-full max-w-[1920px] px-[clamp(1rem,6.25vw,7.5rem)] flex flex-col md:flex-row items-start justify-between space-y-4 md:space-y-0">
          <p className="text-white text-[12px] text-start">
            Copyright &copy; {new Date().getFullYear()} Zeedara. All Rights
            Reserved.
          </p>

          <div className="footer-bottom-links flex flex-wrap items-center justify-start gap-x-4 gap-y-2">
            <NavLink
              className="text-white text-[12px] hover:text-(--primary-color) hover:underline"
              to="/"
            >
              Terms & Conditions
            </NavLink>
            <div className="h-1 w-1 bg-white rounded-full"></div>
            <NavLink
              className="text-white text-[12px] hover:text-(--primary-color) hover:underline"
              to="/"
            >
              Privacy Policy
            </NavLink>
            <div className="h-1 w-1 bg-white rounded-full"></div>
            <NavLink
              className="text-white text-[12px] hover:text-(--primary-color) hover:underline"
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
