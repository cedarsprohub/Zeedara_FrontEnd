import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is Zeedara?",
    answer:
      "Zeedara is a premium beauty, hair, cosmetics, skincare, and personal care store built to help customers shop authentic products with confidence.",
  },
  {
    question: "What can I buy on Zeedara?",
    answer:
      "You can shop beauty, hair, wigs, cosmetics, skincare, personal care products, and other curated beauty essentials.",
  },
  {
    question: "Are Zeedara products authentic?",
    answer:
      "Yes. Zeedara is built around trusted product sourcing, clear product information, quality product media, and authenticity cues to help you shop with confidence.",
  },
  {
    question: "Do I need an account to place an order?",
    answer:
      "No. You can check out as a guest. However, creating an account allows you to view your order history, save addresses, submit reviews, and manage your account details.",
  },
  {
    question: "What information do I need to place an order?",
    answer:
      "You will need to provide your name, email address, phone number, delivery address, delivery method, and payment details.",
  },
  {
    question: "What happens after I make payment?",
    answer:
      "After payment, Zeedara verifies the transaction. Once payment is confirmed, your order moves into the paid order stage and fulfilment begins.",
  },
];

function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) =>
    setOpenIndex((current) => (current === index ? -1 : index));

  return (
    <section className="faq bg-(--secondary-background-color)">
      <div className="faq-inner mx-auto flex max-w-[1920px] flex-col lg:flex-row gap-10 lg:gap-[clamp(2rem,3.75vw,4.5rem)] items-start justify-center px-[clamp(1rem,6.25vw,7.5rem)] py-[clamp(3rem,6.25vw,7.5rem)]">
        {/* Left: heading */}
        <div className="faq-intro flex flex-1 flex-col gap-4 items-start w-full min-w-0">
          <div className="border-2 border-[#2e323c] flex items-center justify-center p-3">
            <p className="font-semibold text-[18px] text-black text-center leading-[1.4]">
              FREQUENTLY ASKED QUESTIONS
            </p>
          </div>
          <h2 className="font-['Anton'] text-[length:clamp(2rem,2.7vw,3.25rem)] leading-[1.21] tracking-[-1.04px] text-black">
            Questions?
            <br aria-hidden />
            We&rsquo;re here to help.
          </h2>
          <p className="text-[16px] leading-[1.48] text-black max-w-[588px]">
            Get answers to common questions about Zeedara products, payments,
            delivery, returns, refunds, wholesale, and customer support.
          </p>
        </div>

        {/* Right: accordion */}
        <div className="faq-questions flex flex-col items-start w-full lg:flex-1 lg:max-w-[804px]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className={`w-full px-4 py-5 transition-colors ${
                  isOpen ? "bg-white" : "bg-transparent"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 cursor-pointer text-left"
                >
                  <span
                    className={`font-semibold text-[18px] leading-[1.4] ${
                      isOpen ? "text-black" : "text-[#575f71]"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`shrink-0 size-6 text-black transition-transform duration-300 ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-5"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="font-semibold text-[18px] leading-[1.4] text-[#575f71]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Faq;
