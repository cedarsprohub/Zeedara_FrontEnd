import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Heart, Star, StarHalf } from "lucide-react";

function Testimonials() {
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

  const autoplayOptions = {
    delay: 3000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  };
  const [emblaRef] = useEmblaCarousel(
    { slidesToScroll: 1, loop: true, align: "start" },
    [Autoplay(autoplayOptions)],
  );
  const sidePadding =
    "px-[clamp(1rem,6.25vw,7.5rem)] py-[clamp(3rem,6.25vw,7.5rem)]";
  return (
    <div className="testimonials">
      <div
        className={`testimonials-inner mx-auto max-w-[1920px] ${sidePadding} flex flex-col gap-8 items-center`}
      >
        <div className="testimonials-content flex flex-col gap-4 w-[100%] lg:w-[70%] xl:w-[65%] items-center">
          <span className="testimonials-badge bg-transparent text-[18px] w-full lg:w-fit text-black font-bold py-2 px-4 text-center capitalize border border-2 border-black">
            TESTIMONIALS
          </span>
          <h2 className="testimonials-title text-[32px] md:text-[35px] lg:text-[48px] capitalize lg:uppercase font-medium leading-tight font-['Anton'] text-black">
            What Our Customers are Saying
          </h2>
          <p className="testimonials-description text-black text-start w-full lg:w-[80%]">
            Honest reviews from customers who trust Zeedara for premium beauty,
            hair, and personal care.
          </p>
        </div>
        <div className="testimonials-slider w-full">
          <div
            className="overflow-hidden lg:relative lg:left-1/2 lg:right-1/2 lg:-ml-[50vw] lg:w-screen lg:max-w-none"
            ref={emblaRef}
          >
            {/* Container: Added -ml-4 to counteract slide padding */}
            <div className="flex -ml-4">
              {/* Slides: Each takes up 25% width (1/4 of the viewport) */}
              {[1, 2, 3, 4, 5, 6].map((_) => {
                return (
                  <div
                    className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33%] xl:flex-[0_0_25%] min-w-0 pl-4"
                    key={_}
                  >
                    <div className="bg-(--secondary-background-color) flex flex-col gap-16 p-6">
                      <div className="testimonial-rating flex gap-2 items-center">
                        <div className="stars flex space-x-1">
                          <Star
                            fill="#bf8322"
                            color="transparent"
                            className="h-[20px] w-[20px]"
                          />{" "}
                          <Star
                            fill="#bf8322"
                            color="transparent"
                            className="h-[20px] w-[20px]"
                          />{" "}
                        </div>
                        5.0
                      </div>

                      <div className="content flex flex-col gap-2">
                        <h2 className="testimonial-title font-[Anton]">
                          Loved by thousands globally
                        </h2>
                        <p className="testimonial-text text-[#595959]">
                          See why our customers keep coming back for more
                        </p>
                      </div>

                      <div className="name flex gap-2 items-center">
                        <div className="line w-[16px] h-[2px] bg-black"></div>
                        <span>Cynthia Okafor</span>
                      </div>

                      <div className="favorite">
                        <Heart className="h-[20px] w-[20px]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Testimonials;
