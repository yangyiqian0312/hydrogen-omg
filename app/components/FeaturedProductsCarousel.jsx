import { useRef, useState, useEffect } from "react";
import { Heart, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import {products} from '../data';

export function FeaturedProductsCarousel() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);

  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 57,
    seconds: 0
  });

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const totalSeconds = prevTime.hours * 3600 + prevTime.minutes * 60 + prevTime.seconds - 1;

        if (totalSeconds <= 0) {
          clearInterval(timer);
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Products Selection Effect
  useEffect(() => {
    // Get the last 6 products for featured
    const featured = products.slice(-6);
    setFeaturedProducts(featured);

    // Get the first 6 products for trending
    const trending = products.slice(0, 6);
    setTrendingProducts(trending);
  }, []); // Empty dependency array ensures this runs only once

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (!carouselRef.current) return;

    const scrollAmount = 320; // Width of one card
    const currentScroll = carouselRef.current.scrollLeft;

    if (direction === "left") {
      carouselRef.current.scrollTo({
        left: currentScroll - scrollAmount,
        behavior: "smooth",
      });
    } else {
      carouselRef.current.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      text: "I absolutely love the selection of fragrances! The staff was incredibly helpful in finding the perfect scent for me.",
      title: "Good service and quality",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format",
    },
    {
      id: 2,
      name: "Michael Lee",
      text: "The quality of the perfumes is unmatched. I always get compliments whenever I wear them!",
      title: "Super fast shipping",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format",
    },
    {
      id: 3,
      name: "Emily Davis",
      text: "I found my signature scent here! The experience was fantastic and I will definitely be back.",
      title: "A perfect Christmas gift",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format",
    },
    {
      id: 4,
      name: "Sarah Johnson",
      text: "I absolutely love the selection of fragrances! The staff was incredibly helpful in finding the perfect scent for me.",
      title: "Good service and quality",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format",
    },
    {
      id: 5,
      name: "Michael Lee",
      text: "The quality of the perfumes is unmatched. I always get compliments whenever I wear them!",
      title: "Super fast shipping",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format",
    },
  ];
  return (
    <div className="bg-white">
      {/* Featured Products Carousel */}
      <div className="relative px-4 py-8">
        <div
          ref={carouselRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 hide-scrollbar scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {featuredProducts.map((product) => (
            <div
              key={product.product_id}
              className="flex-none w-80 bg-white rounded-lg overflow-hidden snap-start shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative aspect-square">
                <img
                  src={product.main_product_image || "/api/placeholder/400/400"}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                  {product.brand}
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {product.product_name}
                </h3>
                <p className="text-pink-600 font-bold mb-4">
                  ${product.sale_price}
                </p>
                {/* <button className="text-sm font-semibold hover:underline">
                  SHOP NOW →
                </button> */}
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Navigation Buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ... Special Offers section ... */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm h-full"> {/* Added h-full */}
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold">Special Offers</h2>
              </div>

              <div className="p-6 space-y-6">

                {/* TikTok Live Deal */}
                <div className="bg-gradient-to-br from-pink-50 to-white rounded-xl p-6 text-center">
                  <h3 className="text-lg font-medium mb-4">
                    Exclusive Deal On TikTok LIVE
                  </h3>
                  <div className="relative w-32 h-32 mx-auto mb-4"> {/* Increased size for logo */}
                    <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-20"></div>
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      <img
                        src="/logo.jpeg"  // Path to your logo in public folder
                        alt="OMG Beauty Shop"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <a
                    href="https://www.tiktok.com/@omgbeautyshop/live?enter_from_merge=general_search&enter_method=others_photo&search_id=20250116183935112EAE20D9596102F13D&search_keyword=omgbeautyshop&search_result_id=7166140096579650606&search_type=general"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-sm font-medium w-full transition-colors duration-200 inline-block"
                  >
                    Go To TikTok
                  </a>
                </div>

                {/* New Arrivals */}
                <div className="bg-gradient-to-br from-pink-50 to-white rounded-xl p-6">
                  <h3 className="font-medium text-lg mb-2">New Arrivals</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Introducing our latest collection
                  </p>
                  <div className="flex flex-col gap-4">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&auto=format"
                        alt="New arrival product"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                        20% OFF
                      </div>
                    </div>
                    <button className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg text-sm font-medium w-full transition-colors duration-200">
                      Shop Now
                    </button>
                  </div>
                </div>

                {/* Flash Sale */}
                <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-xl p-6">
                  <div className="text-center">
                    <h3 className="font-medium text-xl mb-2">FLASH SALE</h3>
                    <p className="text-sm text-white/90 mb-4">Limited time offer</p>
                    <div className="flex justify-center gap-2">
                      {/* Hours */}
                      <div className="flex gap-2">
                        {String(timeLeft.hours).padStart(2, '0').split('').map((digit, idx) => (
                          <div
                            key={`hours-${idx}`}
                            className="bg-white text-red-600 w-10 h-12 rounded-lg flex items-center justify-center text-xl font-bold"
                          >
                            {digit}
                          </div>
                        ))}
                        <div className="flex items-center text-2xl px-1">:</div>
                      </div>

                      {/* Minutes */}
                      <div className="flex gap-2">
                        {String(timeLeft.minutes).padStart(2, '0').split('').map((digit, idx) => (
                          <div
                            key={`minutes-${idx}`}
                            className="bg-white text-red-600 w-10 h-12 rounded-lg flex items-center justify-center text-xl font-bold"
                          >
                            {digit}
                          </div>
                        ))}
                        <div className="flex items-center text-2xl px-1">:</div>
                      </div>

                      {/* Seconds */}
                      <div className="flex gap-2">
                        {String(timeLeft.seconds).padStart(2, '0').split('').map((digit, idx) => (
                          <div
                            key={`seconds-${idx}`}
                            className="bg-white text-red-600 w-10 h-12 rounded-lg flex items-center justify-center text-xl font-bold"
                          >
                            {digit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Main Content Area */}
          <div className="lg:col-span-9">

            {/* Trending Now Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <h2 className="font-semibold">Trending Now</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {trendingProducts.map((product) => (
                  <div
                    key={product.product_id}
                    className="bg-white rounded-lg overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative aspect-square">
                      <img
                        src={
                          product.main_product_image || "/api/placeholder/400/400"
                        }
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">
                        {product.brand}
                      </div>
                      <h3 className="font-medium mb-2 line-clamp-2">
                        {product.product_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-pink-600 font-bold">
                          ${product.sale_price}
                        </span>
                        {product.retail_price > product.sale_price && (
                          <span className="text-sm text-gray-400 line-through">
                            ${product.retail_price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Picks Section */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mx-2 sm:mx-4 mb-8">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          <h2 className="font-semibold text-base sm:text-lg">Shop By Category</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Women's Category */}
          <div
            className="relative rounded-lg overflow-hidden group cursor-pointer"
            onClick={() => navigate('/women')}
          >
            <img
              src="https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=500&auto=format"
              alt="Women's Fragrances"
              className="w-full h-48 sm:h-64 object-cover transform transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-4 flex flex-col justify-end">
              <div className="transform transition-transform duration-300 group-hover:translate-y-0 translate-y-2">
                <h3 className="text-white font-semibold text-lg sm:text-xl mb-1">Women's Fragrances</h3>
                <p className="text-white/90 text-xs sm:text-sm mb-3">Discover elegant and refined scents</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/women');
                  }}
                  className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300"
                >
                  Explore Collection
                </button>
              </div>
            </div>
          </div>

          {/* Men's Category */}
          <div
            className="relative rounded-lg overflow-hidden group cursor-pointer"
            onClick={() => navigate('/men')}
          >
            <img
              src="https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?w=500&auto=format"
              alt="Men's Fragrances"
              className="w-full h-48 sm:h-64 object-cover transform transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-4 flex flex-col justify-end">
              <div className="transform transition-transform duration-300 group-hover:translate-y-0 translate-y-2">
                <h3 className="text-white font-semibold text-lg sm:text-xl mb-1">Men's Fragrances</h3>
                <p className="text-white/90 text-xs sm:text-sm mb-3">Bold and sophisticated scents</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/men');
                  }}
                  className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300"
                >
                  Explore Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Customer Reviews */}
      <div className="bg-pink-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-semibold text-center mb-8">
            What Our Customer Says
          </h3>

          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full px-4 flex items-center justify-center"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-8 h-8 text-gray-400 hover:text-gray-600" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full px-4 flex items-center justify-center"
              aria-label="Next slide"
            >
              <ChevronRight className="w-8 h-8 text-gray-400 hover:text-gray-600" />
            </button>

            {/* Reviews Container */}
            <div className="overflow-hidden px-4">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / (window.innerWidth >= 768 ? 3 : 1))
                    }%)`,
                }}
              >
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="w-full md:w-1/3 flex-shrink-0 px-3"
                  >
                    <div className="bg-white rounded-xl p-6">
                      <h4 className="text-xl font-semibold mb-2">
                        {testimonial.title}
                      </h4>
                      <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                      <div className="flex items-center gap-3">
                        <img
                          src={testimonial.image}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-medium">{testimonial.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex
                    ? "bg-pink-500"
                    : "bg-gray-200 opacity-50"
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
