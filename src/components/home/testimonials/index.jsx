import useEmblaCarousel from "embla-carousel-react";

import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import { useCallback } from "react";

function Testimonials() {
  const slides = [
    {
      id: 1,
      name: "Cynthia Okafor",
      rating: 5,
      contentTitle: "Loved by thousands globally",
      content: "See why our customers keep coming back for more",
    },
    {
      id: 2,
      name: "Amaka Eze",
      rating: 5,
      contentTitle: "Loved by thousands globally",
      content: "See why our customers keep coming back for more",
    },
    {
      id: 3,
      name: "Tolu Adeyemi",
      rating: 5,
      contentTitle: "Loved by thousands globally",
      content: "See why our customers keep coming back for more",
    },
    {
      id: 4,
      name: "Ifeoma Nwosu",
      rating: 5,
      contentTitle: "Loved by thousands globally",
      content: "See why our customers keep coming back for more",
    },
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    slidesToScroll: 1,
    loop: true,
    align: "start",
  });

  // Navigation functions using the Embla API instance. The carousel loops, so
  // both directions are always available and the buttons need no disabled state.
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const sidePadding =
    "px-[clamp(1rem,6.25vw,7.5rem)] py-[clamp(3rem,6.25vw,7.5rem)]";
  return (
    <div className="testimonials bg-[#f8ebfa]">
      <div
        className={`testimonials-inner mx-auto max-w-[1920px] ${sidePadding} flex flex-col gap-8 items-center`}
      >
        <div className="testimonials-content flex flex-col gap-4 w-[100%] lg:w-[70%] xl:w-[65%] items-center">
          <span className="testimonials-badge bg-transparent text-[12px] lg:text-[16px] w-fit text-black font-bold py-2 px-4 text-center uppercase border-2 border-black">
            TESTIMONIALS
          </span>
          <h2 className="testimonials-title text-[32px] sm:text-[40px] lg:text-[48px] uppercase text-center font-medium leading-tight font-['Anton'] text-black">
            What Our Customers are Saying
          </h2>
          <p className="testimonials-description text-black text-center text-[13px] sm:text-[14px] lg:text-[16px] w-full lg:w-[80%]">
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
                    <div className="bg-(--secondary-background-color) flex h-full flex-col gap-4 p-6 lg:gap-6 lg:p-8">
                      <div className="testimonial-rating flex gap-2 items-center">
                        {/* One star per rating point (5 in the design) */}
                        <div className="stars flex gap-1">
                          {Array.from({ length: item.rating }).map((_, i) => (
                            <Star
                              key={i}
                              fill="#bf8322"
                              color="transparent"
                              className="size-4 lg:size-5"
                            />
                          ))}
                        </div>
                        <span className="text-[13px] lg:text-[14px]">
                          {item.rating.toFixed(1)}
                        </span>
                      </div>

                      <div className="content flex flex-col gap-2">
                        <h2 className="testimonial-title text-[18px] lg:text-[20px] font-[Anton]">
                          {item.contentTitle}
                        </h2>
                        <p className="testimonial-text text-[#595959] text-[14px] lg:text-[16px]">
                          {item.content}
                        </p>
                      </div>

                      <div className="name mt-auto flex gap-2 items-center">
                        <div className="line w-[16px] h-[2px] bg-black"></div>
                        <span className="text-[14px] lg:text-[16px]">
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

          {/* Controls — mobile only; all four cards are already visible from lg */}
          <div className="flex justify-center items-center gap-4 mt-8 lg:hidden">
            <button
              onClick={scrollPrev}
              className="flex size-14 cursor-pointer items-center justify-center bg-(--primary-color) transition hover:bg-(--footer-background-color) active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-6 text-white" />
            </button>

            <button
              onClick={scrollNext}
              className="flex size-14 cursor-pointer items-center justify-center bg-(--primary-color) transition hover:bg-(--footer-background-color) active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight className="size-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Testimonials;
