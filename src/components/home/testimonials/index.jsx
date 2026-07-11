import useEmblaCarousel from "embla-carousel-react";

import { ChevronLeft, ChevronRight, Heart, Star, StarHalf } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function Testimonials() {
  // Track button activation states
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const slides = [
    {
      id: 1,
      name: "John Doe",
      rating: 5,
      contentTitle: "Excellent Product!",
      content:
        "I've been using Zeedara products for months now, and I'm completely satisfied with the quality and results.",
    },
    {
      id: 1,
      name: "John Doe",
      rating: 5,
      contentTitle: "Excellent Product!",
      content:
        "I've been using Zeedara products for months now, and I'm completely satisfied with the quality and results.",
    },
    {
      id: 1,
      name: "John Doe",
      rating: 5,
      contentTitle: "Excellent Product!",
      content:
        "I've been using Zeedara products for months now, and I'm completely satisfied with the quality and results.",
    },
    {
      id: 1,
      name: "John Doe",
      rating: 5,
      contentTitle: "Excellent Product!",
      content:
        "I've been using Zeedara products for months now, and I'm completely satisfied with the quality and results.",
    },
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    slidesToScroll: 1,
    loop: true,
    align: "start",
  });

  // 2. Define navigation functions using the Embla API instance
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // 3. Keep tracking the slide position to toggle disabled state (useful if loop is false)
  const onSelect = useCallback((api) => {
    setPrevBtnDisabled(!api.canScrollPrev());
    setNextBtnDisabled(!api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  const sidePadding =
    "px-[clamp(1rem,6.25vw,7.5rem)] py-[clamp(3rem,6.25vw,7.5rem)]";
  return (
    <div className="testimonials">
      <div
        className={`testimonials-inner mx-auto max-w-[1920px] ${sidePadding} flex flex-col gap-8 items-center`}
      >
        <div className="testimonials-content flex flex-col gap-4 w-[100%] lg:w-[70%] xl:w-[65%] items-center">
          <span className="testimonials-badge bg-transparent text-[12px] lg:text-[16px] w-fit text-black font-bold py-2 px-4 text-center capitalize border border-2 border-black">
            TESTIMONIALS
          </span>
          <h2 className="testimonials-title text-[40px] lg:text-[48px] lg:text-[48px] uppercase text-center font-medium leading-tight font-['Anton'] text-black">
            What Our Customers are Saying
          </h2>
          <p className="testimonials-description text-black text-center text-[14px] lg:text-[16px] w-full lg:w-[80%]">
            Honest reviews from customers who trust Zeedara for premium beauty,
            hair, and personal care.
          </p>
        </div>
        <div className="testimonials-slider w-full">
          {/* Carousel Viewport Wrapper */}
          <div
            className="overflow-hidden lg:relative lg:left-1/2 lg:right-1/2 lg:-ml-[50vw] lg:w-screen lg:max-w-none"
            ref={emblaRef}
          >
            <div className="flex -ml-4">
              {slides.map((item) => {
                return (
                  <div
                    className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33%] xl:flex-[0_0_25%] min-w-0 pl-4"
                    key={item.id}
                  >
                    <div className="bg-(--secondary-background-color) flex flex-col gap-4 lg:gap-6 p-6">
                      <div className="testimonial-rating flex gap-2 items-center">
                        <div className="stars flex space-x-1 text-[12px] lg:text-[14px]">
                          <Star
                            fill="#bf8322"
                            color="transparent"
                            className="h-[15px] lg:h-[20px] w-[15px] lg:w-[20px]"
                          />
                          <Star
                            fill="#bf8322"
                            color="transparent"
                            className="h-[15px] lg:h-[20px] w-[15px] lg:w-[20px]"
                          />
                        </div>
                        {item.rating}
                      </div>

                      <div className="content flex flex-col gap-2">
                        <h2 className="testimonial-title text-[18px] lg:text-[24px] font-[Anton]">
                          {item.contentTitle}
                        </h2>
                        <p className="testimonial-text text-[#595959] text-[14px] lg:text-[18px]">
                          {item.content}
                        </p>
                      </div>

                      <div className="name flex gap-2 items-center">
                        <div className="line w-[16px] h-[2px] bg-black"></div>
                        <span className="text-[15px] lg:text-[16px]">
                          {item.name}
                        </span>
                      </div>

                      <div className="favorite hidden lg:block">
                        <Heart className="h-[20px] w-[20px]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Controls UI Layout added directly below the slides */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={scrollPrev}
              disabled={
                emblaApi
                  ? !emblaApi.canScrollPrev() &&
                    !emblaApi.internalEngine().options.loop
                  : false
              }
              className="p-3 bg-(--primary-color) transition hover:bg-(--footer-background-color) active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-[24px] w-[24px] text-white" />
            </button>

            <button
              onClick={scrollNext}
              disabled={
                emblaApi
                  ? !emblaApi.canScrollNext() &&
                    !emblaApi.internalEngine().options.loop
                  : false
              }
              className="p-3 bg-(--primary-color) transition hover:bg-(--footer-background-color) active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Next slide"
            >
              <ChevronRight className="h-[24px] w-[24px] text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Testimonials;
