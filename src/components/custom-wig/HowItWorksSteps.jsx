import { useEffect, useState } from "react";

const steps = [
  {
    title: "Fill the Request Form",
    description:
      "Tell us the wig type, length, colour, texture, budget, any important style details, and add a clear image of the look you want.",
  },
  {
    title: "Upload a Reference Photo",
    description:
      "Add a clear image of the look you want so Zeedara can understand the style better.",
  },
  {
    title: "Zeedara Reviews Your Request",
    description:
      "We check your details, hair options, colour choice, availability, price, and timeline.",
  },
  {
    title: "Receive a Quote",
    description:
      "Our representative will contact you with the final price, recommendations, and next steps.",
  },
  {
    title: "Confirm Your Order",
    description:
      "Once you approve the quote, Zeedara will guide you on payment and production.",
  },
];

const STEP_DURATION = 2500;

function HowItWorksSteps() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((current) => (current + 1) % steps.length);
    }, STEP_DURATION);
    return () => clearInterval(interval);
  }, []);

  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isLast = index === steps.length - 1;
        return (
          <li key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                aria-hidden="true"
                className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-gray-200"
              />
            )}
            <span
              className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-500 ${
                isActive
                  ? "bg-(--primary-color) text-white"
                  : "border border-gray-300 text-gray-400"
              }`}
            >
              {index + 1}
            </span>
            <div className="flex flex-col gap-1 pt-0.5">
              <h3
                className={`font-normal capitalize font-[Anton]  transition-colors duration-500 text-[20px] ${
                  isActive ? "text-(--primary-color)" : "text-black"
                }`}
              >
                {step.title}
              </h3>
              <p className="text-sm text-black md:text-sm">
                {step.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default HowItWorksSteps;
