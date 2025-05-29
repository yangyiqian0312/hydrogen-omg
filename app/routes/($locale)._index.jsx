import { defer } from '@shopify/remix-oxygen';
import { Await, useLoaderData, Link } from '@remix-run/react';
import { Suspense } from 'react';
import { Image, Money } from '@shopify/hydrogen';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight, Clock, Gift } from 'lucide-react';
import OldHeader from '~/components/OldHeader';
/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [
    { title: 'OMG Beauty Box – Premium Beauty Subscription' },
    { name: 'description', content: 'Get the best beauty products with OMG Beauty Box. Subscribe now for exclusive beauty items delivered to your doorstep.' }
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = await loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({ ...deferredData, ...criticalData });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({ context }) {
  const [{ collections }] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
    context.storefront.query(PROMOTING_PRODUCTS_QUERY),
    context.storefront.query(TRENDING_PRODUCTS_QUERY),
    context.storefront.query(ALL_PRODUCTS_QUERY),
  ]);
  console.table('collections:', collections.nodes);

  return {
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
async function loadDeferredData({ context }) {
  // const allProducts = await context.storefront
  //   .query(ALL_PRODUCTS_QUERY)
  //   .catch((error) => {
  //     // Log query errors, but don't throw them so the page can still render
  //     console.error(error);
  //     return null;
  //   });
  try {
    const promotingProducts = await context.storefront.query(
      PROMOTING_PRODUCTS_QUERY,
    );
    const trendingProducts = await context.storefront.query(
      TRENDING_PRODUCTS_QUERY,
    );
    const newProducts = await context.storefront.query(
      NEW_PRODUCTS_QUERY,
    );

    const allProducts = await context.storefront.query(
      ALL_PRODUCTS_QUERY,
    );

    // Log the resolved data for debugging
    console.log('Resolved Data in Loader:', promotingProducts);
    //console.log('Resolved Data in Loader:', trendingProducts);
    return {
      promotingProducts: promotingProducts || null,
      trendingProducts: trendingProducts || null,
      newProducts: newProducts || null,
      allProducts: allProducts || null,
    };
  } catch (error) {
    // Log query errors, but don't throw them so the page can still render
    console.error(error);
    return null;
  }

  // return {
  //   allProducts,title
  //   promotingProducts,
  // };
}

export default function Homepage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingDesktopIndex, setPlayingDesktopIndex] = useState(null);
  const [playingMobileIndex, setPlayingMobileIndex] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  /** @type {LoaderReturnData} */
  const data = useLoaderData();

  const products = data.allProducts?.collection?.products?.edges || [];
  //console.log(products)
  // const trendingProducts = data.allProducts?.collection?.products?.edges || [];
  // const newProducts = data.allProducts?.collection?.products?.edges || [];

  // const promotingProducts = data.promotingProducts;
  // const trendingProducts = data.trendingProducts;
  // const newProducts = data.newProducts;


  const promotingProducts = products.filter(({ node }) => {
    return node.tags && node.tags.includes('Promoting');
  });

  console.log("Filtered promoting products:", promotingProducts);

  const trendingProducts = products.filter(({ node }) => {
    return node.tags && node.tags.includes('Trending');
  });

  //console.log("Filtered trending products:", trendingProducts);

  const newProducts = products.filter(({ node }) => {
    return node.tags && node.tags.includes('New Products');
  });

  //console.log("Filtered new products:", newProducts);

  const videoProducts = products.filter(({ node }) => {
    return node.tags && node.tags.includes('Video');
  });

  // console.log("Filtered video products:", videoProducts);

  const testimonials = [
    {
      id: 1,
      name: "@ᴊ*****︎",
      userProfile: '/assets/reviews/1.jpeg',  // Replace with actual review photo
      location: "United States",
      verified: true,
      rating: 5,
      title: "Repeat purchase, Smell good",
      text: "This Smells Amazing second time ordering this",
      item: "Default",
      date: "March 11, 2024",
      helpfulCount: 0
    },
    {
      id: 2,
      name: "@H***l ***",
      userProfile: '/assets/reviews/2.jpeg',
      location: "United States",
      verified: true,
      rating: 5,
      title: "Fast delivery",
      text: "Fast shipping, great price and the perfume is authentic and smells amazing! I can't believe I scored an amazing deal 💙",
      item: "Default",
      date: "March 8, 2024",
      helpfulCount: 2
    },
    {
      id: 3,
      name: "@l***a",
      userProfile: '/assets/reviews/3.jpeg',
      location: "United States",
      verified: true,
      rating: 5,
      title: "Love scent",
      text: "In love with the scent! 💞🫶 Worth it.",
      item: "Default",
      date: "March 5, 2024",
      helpfulCount: 1
    },
    {
      id: 4,
      name: "@j*****6",
      userProfile: '/assets/reviews/4.jpeg',
      location: "United States",
      verified: true,
      rating: 5,
      title: "Good gift",
      text: "So happy I got my perfume today 🤗🤗thanks💕🥰🥰💕🥰",
      item: "Default",
      date: "March 2, 2024",
      helpfulCount: 0
    },
    {
      id: 5,
      name: "@t*******7",
      userProfile: '/assets/reviews/5.jpeg',
      location: "United States",
      verified: true,
      rating: 5,
      title: "Smell good",
      text: "Smells so good got a lot of compliments",
      item: "Default",
      date: "February 28, 2024",
      helpfulCount: 3
    },
    {
      id: 6,
      name: "@AuRoRa",
      userProfile: '/assets/reviews/6.jpeg',
      location: "United States",
      verified: true,
      rating: 5,
      title: "Captivating smell",
      text: "I get so may compliments from this",
      item: "Default",
      date: "February 25, 2024",
      helpfulCount: 1
    },
    {
      id: 7,
      name: "@Jess",
      userProfile: '/assets/reviews/7.jpeg',
      location: "United States",
      verified: true,
      rating: 5,
      title: "Huge discount",
      text: "Favorite perfume at a huge discount",
      item: "Default",
      date: "February 22, 2024",
      helpfulCount: 0
    },
    {
      id: 8,
      name: "@y*****⟬",
      userProfile: '/assets/reviews/8.jpeg',
      location: "United States",
      verified: true,
      rating: 5,
      title: "Well packaged",
      text: "Came well packaged and is legit product very pleased with this purchase",
      item: "Default",
      date: "February 19, 2024",
      helpfulCount: 2
    },
    {
      id: 9,
      name: "@m*****i",
      userProfile: '/assets/reviews/9.jpeg',
      location: "United States",
      verified: true,
      rating: 5,
      title: "Authentic",
      text: "Smells super good! Was a bit skeptical because of the price but it's definitely legit",
      item: "Default",
      date: "February 16, 2024",
      helpfulCount: 1
    },
    {
      id: 10,
      name: "@Mandaa.Jayne",
      userProfile: '/assets/reviews/10.jpeg',
      location: "United States",
      verified: true,
      rating: 5,
      title: "Great deal",
      text: "My Favorite Perfume!! Discount SO WORTH IT!!!!",
      item: "Default",
      date: "February 13, 2024",
      helpfulCount: 0
    },
    {
      id: 11,
      name: "@wyattdkmn",
      userProfile: '/assets/reviews/11.jpeg',
      location: "United States",
      verified: true,
      rating: 5,
      title: "great smell",
      text: "It’s really strong when you smell it right after you spray, but when it dialates it becomes a really great smell",
      item: "Default",
      date: "February 13, 2024",
      helpfulCount: 0
    },
    {
      id: 12,
      name: "@Noah",
      userProfile: '/assets/reviews/12.jpeg',
      location: "United States",
      verified: true,
      rating: 5,
      title: "Perfectly Balanced Scent",
      text: "It’s a really relaxing sent not to hard but not too light very good blind but for starters",
      item: "Default",
      date: "February 13, 2024",
      helpfulCount: 0
    }
  ];


  const preferredOrder = [
    "Valentino Donna Born In Roma Eau de Parfum For Women 1.7 oz / 50 mL",
    "BURBERRY Touch Eau De Toilette Spray 3.3 oz / 100 ml Cologne for Men - Full Size Luxurious Warm & Spicy Woody Fragrance",
    "Versace Bright Crystal Eau de Toilette for Women 3.0 oz/90ml - Full Size Floral Scent Fragrance",
    "Valentino Donna Born in Roma Yellow Dream 3.4oz",
    "Viktor&Rolf Spicebomb Eau de Toilette Spray for Men 3.04 Oz / 90 ml - Woody, Spicy, Gourmand Scent",
    "GUCCI 3PC SET: 1 X 100ML Bloom EDP + 1 X 100 ML Bloom Body lotion + 1 X 10 ML Bloom EDP Pen Spray - Floral Scent Fragrance Jasmine",
    "VERSACE Eros Eau de Toilette Spray for MEN 1.7oz / 50ml - Luxury, Long Lasting Perfume",
    "Viktor & Rolf Flowerbomb 3.4 oz/100 ml Eau De Parfum Spray for Women - Full Size Floral Fragrance with Cattleya, Jasmine, and Rose",
    "Versace Pour Homme Eau De Toilette Spray 1.7 Oz/ 50 ml - Full Size Woody & Citrus Aromatic Fragrance for Men"
  ];

  // 找出优先显示的商品
  const priorityProducts = preferredOrder
    .map(title => promotingProducts.find(({ node }) => node.title === title))
    .filter(Boolean);

  // 找出其他产品
  const otherProducts = promotingProducts.filter(
    ({ node }) => !preferredOrder.includes(node.title)
  );
  console.log("otherProducts", otherProducts);

  // 合并所有产品
  const orderedProducts = [...priorityProducts, ...otherProducts];

  const bgColors = [
    'bg-[#A1E9ED]',
    'bg-[#FFB2FF]',
    'bg-[#FFB2A4]',
    'bg-[#AD9CFF]',
    'bg-[#F6EDDF]',
    'bg-[#FFB2FF]',
    'bg-[#FFB2A4]',
    'bg-[#AD9CFF]',
    'bg-[#F6EDDF]'
  ]; // 展示图背景颜色

  const videoPaths = [
    '/assets/video/1.mp4',
    '/assets/video/2.mp4',
    '/assets/video/3.mp4',
    '/assets/video/4.mp4',
    // '/assets/video/5.mp4',
    // 添加更多视频路径
  ];


  const [currentTestimonialPage, setCurrentTestimonialPage] = useState(0);
  const testimonialCarouselRef = useRef(null);

  const carouselRef = useRef(null);
  const desktopVideoRefs = useRef([]);
  const mobileVideoRefs = useRef([]);

  const orderCarouselRef = useRef(null);
  useEffect(() => {
    if (orderCarouselRef.current) {
      console.log('Carousel mounted successfully');
    }
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);

    // Base on screen size, play the video
    if (isMobile) {
      desktopVideoRefs.current.forEach((video, idx) => {
        video.pause();
        video.currentTime = 0;
      });
      mobileVideoRefs.current.forEach((video, idx) => {
        if (video) {
          if (idx === playingMobileIndex) {
            video.muted = false;
            video.currentTime = 0;
            video.play();
          } else {
            video.pause();
            video.currentTime = 0;
          }
        }
      });
    } else {

      mobileVideoRefs.current.forEach((video, idx) => {
        video.pause();
        video.currentTime = 0;
      });
      desktopVideoRefs.current.forEach((video, idx) => {
        if (video) {
          if (idx === playingDesktopIndex) {
            video.muted = false;
            video.currentTime = 0;
            video.play();
          } else {
            video.pause();
            video.currentTime = 0;
          }
        }
      });
    }


    return () => window.removeEventListener('resize', handleResize);
  }, [playingDesktopIndex, playingMobileIndex, isMobile]);

  const orderScrollLeft = () => {
    if (orderCarouselRef.current) {
      orderCarouselRef.current.scrollBy({
        left: -320,
        behavior: 'smooth'
      });
    }
  };

  const orderScrollRight = () => {
    if (orderCarouselRef.current) {
      orderCarouselRef.current.scrollBy({
        left: 320,
        behavior: 'smooth'
      });
    }
  };


  const videoCarouselRef = useRef(null);
  const videoScrollLeft = () => {
    if (videoCarouselRef.current) {
      videoCarouselRef.current.scrollBy({
        left: -320,
        behavior: 'smooth'
      });
    }
  };
  const videoScrollRight = () => {
    if (videoCarouselRef.current) {
      videoCarouselRef.current.scrollBy({
        left: 320,
        behavior: 'smooth'
      });
    }
  };


  return (
    <div className="home w-full">
      <div className="flex flex-col space-y-4 relative" >
        {/* Main banner image */}
        <div>
          <img
            src="/assets/BANNER.png"
            alt="Banner"
            className="w-full h-auto max-h-[400px] object-contain bg-red-300"
          />
        </div>

        {/* TikTok LIVE element positioned at the top right corner */}
        <div className="absolute inset-y-0 xl:right-12 xl:p-4 lg:right-2 lg:pb-3 max-w-sm hidden lg:flex flex-col justify-center items-center">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto lg:mb-2 xl:mb-4">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-20"></div>
                <img
                  src="/assets/logo/omgbeautybox.png"
                  alt="OMG Beauty Box"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <button
              onClick={() =>
                window.open(
                  'https://www.tiktok.com/@omgbeautyshop/live?enter_from_merge=others_homepage&enter_method=others_photo',
                  '_blank',
                  'noopener,noreferrer',
                )
              }
              className="bg-red-600 hover:bg-red-700 text-white px-6 lg:py-3 rounded-3xl text-sm font-medium w-full transition-colors duration-200"
            >
              Go To TikTok
            </button>
          </div>
        </div>
      </div>


      <div className="relative">
        <button
          onClick={orderScrollLeft}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 text-black w-10 h-10 rounded-full items-center justify-center shadow-md hover:bg-white transition-colors duration-200 -ml-5"
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div
          ref={orderCarouselRef}
          className="flex overflow-x-auto snap-x gap-4 hide-scrollbar scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {orderedProducts.map(({ node }, index) => (
            <div
              key={node.id}
              className={`flex-none w-1/4 xs:w-2/3 sm:w-60 md:w-80 lg:w-1/4 rounded-lg overflow-hidden snap-start shadow-sm hover:shadow-md transition-shadow duration-300 ${bgColors[index % bgColors.length]}`}
            >
              <div className="relative aspect-square">
                <Link
                  to={`/products/${node.handle}`}
                  onClick={(e) => {
                    if (!node?.handle) e.preventDefault();
                  }}
                >
                  <img
                    src={`/assets/presentation/${index + 1}.jpg`}
                    alt={node.title}
                    className="w-full h-full object-cover"
                  />
                </Link>
              </div>
              <div className="p-6">
                <div className="text-sm font-medium text-black uppercase tracking-wider mb-2">
                  {node.vendor || 'Unknown Brand'}
                </div>
                <p className="text-pink-600 font-bold mb-4">
                  ${Number(node.variants.edges[0]?.node.price.amount || 0).toFixed(2)}
                </p>
                <Link
                  to={`/products/${node.handle}`}
                  onClick={(e) => {
                    if (!node?.handle) e.preventDefault();
                  }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  SHOP NOW ▸
                </Link>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={orderScrollRight}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 text-black w-10 h-10 rounded-full items-center justify-center shadow-md hover:bg-white transition-colors duration-200 -mr-5"
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>



      {/* Main Content Grid for phone screens */}
      <div className="block sm:hidden">
        <div className="flex items-center mt-4 mb-2 space-x-2">
          <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-lg font-semibold align-middle">
            Special Offers
          </span>
        </div>
        <div
          ref={carouselRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-2 hide-scrollbar scrollbar-hide"
          style={{
            scrollbarWidth: 'none', // 隐藏滚动条（适用于 Firefox）
            msOverflowStyle: 'none', // 隐藏滚动条（适用于 IE）
            WebkitOverflowScrolling: 'touch', // 平滑滚动（适用于 iOS）
          }}
        >
          {/* TikTok Live Deal 卡片 */}
          <div className="flex-none w-60 h-80 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 m-2 bg-white hover:shadow-md transition-shadow duration-300">
            <div className="rounded-xl p-6 text-center">
              <h3 className="text-lg font-medium">
                Exclusive <br />
                Deals On <br />
                TikTok LIVE
              </h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                {/* <div className="absolute inset-0 rounded-full "></div> */}
                {/* TODO:这个光圈好小 */}
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-20 "></div>
                  <img
                    src="/assets/logo/omgbeautybox.png"
                    alt="OMG Beauty Box"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* TODO: CHANGE TT LIVE REDIRECT */}
              <button
                onClick={() =>
                  window.open(
                    'https://www.tiktok.com/@omgbeautyshop/live?enter_from_merge=others_homepage&enter_method=others_photo',
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-3xl text-sm font-medium w-full transition-colors duration-200"
              >
                Go To TikTok
              </button>
            </div>
          </div>

          {/* New Arrivals 卡片 */}
          <div className="flex-none w-60 h-80 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 m-2 bg-[#F7CAC9] hover:shadow-md transition-shadow duration-300">
            <div className="rounded-xl p-6">
              <h3 className="font-medium text-lg">New Arrivals</h3>
              <div className="flex flex-col gap-4">
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src="/assets/category/new.jpg"
                    alt="New arrival product"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                    20% OFF
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/products/newarrivals');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-3xl text-sm font-medium w-full transition-colors duration-200">
                  Shop Now
                </button>


                {/* <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/products/women');
                  }}
                  className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300"
                >
                  Explore Women
                </button> */}
              </div>
            </div>
          </div>

          {/* Sale Products 卡片 */}
          {/* <div className="flex-none w-60 h-80 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 m-2 bg-white hover:shadow-md transition-shadow duration-300">
            <div className="rounded-xl p-6 text-center">
              <h3 className="text-lg font-medium">Sale</h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full "></div>
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <img
                    src="./assets/logo.jpeg"
                    alt="OMG Beauty Shop"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              TODO: CHANGE TT LIVE REDIRECT
              <button
                onClick={() =>
                  window.open(
                    'https://www.tiktok.com/@omgbeautyshop/live...',
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-3xl text-sm font-medium w-full transition-colors duration-200"
              >
                Go To TikTok
              </button>
            </div>
          </div> */}
        </div>
        {/* TODO: ADD SHOW MORE BUTTON */}

        <div className="border-t my-4 mx-2 border-gray-300"></div>

        {/* Video Section */}
        <div>
          <div
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-2 hide-scrollbar scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {videoPaths.map((video, index) => (
              <div
                key={index}
                className="flex-none w-60 h-80 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 bg-white hover:shadow-md transition-shadow duration-300 relative"
              >
                <video
                  ref={el => mobileVideoRefs.current[index] = el}
                  src={video}
                  className="w-full h-full object-cover"
                  controls={playingMobileIndex === index}
                  controlsList="nodownload nofullscreen noplaybackrate"
                  muted={false}
                  loop={false}
                  disablePictureInPicture
                  playsInline
                  onPause={() => {
                    if (playingMobileIndex === index) setPlayingMobileIndex(null);
                  }}
                  style={{ background: "#000" }}
                />
                {playingMobileIndex !== index && (
                  <button
                    className="absolute inset-0 flex items-center justify-center text-5xl text-white bg-black/40 hover:bg-black/60 transition"
                    style={{ pointerEvents: "auto" }}
                    onClick={() => setPlayingMobileIndex(index)}
                    aria-label="Play video"
                  >
                    ▶
                  </button>
                )}

                {/* Shop Now Button */}
                {videoProducts[index] && (
                  <Link
                    to={`/products/${videoProducts[index].node.handle}`}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors duration-200 shadow-md"
                  >
                    Shop Now
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* <div class="border-t my-4 mx-2 border-gray-300"></div> */}

        {/* Trending Now Section */}
        <div>
          <div className="flex items-center mt-4 mb-2 space-x-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-lg font-semibold align-middle">
              Trending Now
            </span>
          </div>
          <div
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-2 p-4 hide-scrollbar scrollbar-hide"
            style={{
              scrollbarWidth: 'none', // 隐藏滚动条（适用于 Firefox）
              msOverflowStyle: 'none', // 隐藏滚动条（适用于 IE）
              WebkitOverflowScrolling: 'touch', // 平滑滚动（适用于 iOS）
            }}
          >
            {' '}
            {trendingProducts.map(({ node }, index) => (
              <div
                key={node.id}
                className="flex-none w-1/3 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 hover:shadow-md transition-shadow duration-300"
              >
                <a href={`/products/${node.handle}`}>
                  {/* 图片容器，保持方形比例 */}
                  <div className="relative aspect-square">
                    {node.images.edges[0] ? (
                      <img
                        src={node.images.edges[0].node.url} // 商品图片 URL
                        alt={node.title}
                        className="w-full h-full object-cover" // 确保图片填充整个容器
                      />
                    ) : (
                      <img
                        src="/api/placeholder/400/400" // 占位图片
                        alt="Placeholder"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="m-2">
                    {/* Optional button or additional actions */}
                    {/* SHOP NOW 按钮 */}
                    <Link
                      key={node.id}
                      to={`/products/${node.handle}`}
                      className="font-semibold text-blue-600 hover:underline truncate"
                    >
                      {node.vendor || 'Unknown Brand'}{' '}
                      <p className="text-sm font-normal mb-4 overflow-hidden text-ellipsis whitespace-normal break-words h-12">
                        {node.title
                          ? node.title.replace(
                            new RegExp(`^${node.vendor}\\s*`),
                            '',
                          )
                          : 'N/A'}
                      </p>
                    </Link>
                    <p className="font-bold mb-4">
                      $
                      {Number(
                        node.variants.edges[0]?.node.price.amount || 0,
                      ).toFixed(2)}
                    </p>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* TODO: ADD SHOW MORE BUTTON */}
        {/* New Arrivals Section */}
        {/* <div>
          <div className="flex items-center mt-4 mb-2 space-x-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-lg font-semibold align-middle">
              New Arrivals
            </span>
          </div>
          <div
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-2 p-4 hide-scrollbar scrollbar-hide"
            style={{
              scrollbarWidth: 'none', // 隐藏滚动条（适用于 Firefox）
              msOverflowStyle: 'none', // 隐藏滚动条（适用于 IE）
              WebkitOverflowScrolling: 'touch', // 平滑滚动（适用于 iOS）
            }}
          >
            {' '}
            {newProducts.map(({ node }, index) => (
              <div
                key={node.id}
                className="flex-none w-1/3 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 hover:shadow-md transition-shadow duration-300"
              >
           
                <div className="relative aspect-square">
                  {node.images.edges[0] ? (
                    <img
                      src={node.images.edges[0].node.url} // 商品图片 URL
                      alt={node.title}
                      className="w-full h-full object-cover" // 确保图片填充整个容器
                    />
                  ) : (
                    <img
                      src="/api/placeholder/400/400" // 占位图片
                      alt="Placeholder"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="m-2">
   
   
                  <Link
                    key={node.id}
                    to={`/products/${node.handle}`}
                    className="font-semibold text-blue-600 hover:underline truncate"
                  >
                    {node.vendor || 'Unknown Brand'}{' '}
                    <p className="text-sm font-normal mb-4 overflow-hidden text-ellipsis whitespace-normal break-words h-12">
                      {node.title
                        ? node.title.replace(
                          new RegExp(`^${node.vendor}\\s*`),
                          '',
                        )
                        : 'N/A'}
                    </p>
                  </Link>
                  <p className="font-bold mb-4">
                    $
                    {Number(
                      node.variants.edges[0]?.node.price.amount || 0,
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        <div className="border-t my-4 mx-2 border-gray-300"></div>

        {/* Shop By Category Section */}
        <div>
          <div
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-2 hide-scrollbar scrollbar-hide"
            style={{
              scrollbarWidth: 'none', // 隐藏滚动条（适用于 Firefox）
              msOverflowStyle: 'none', // 隐藏滚动条（适用于 IE）
              WebkitOverflowScrolling: 'touch', // 平滑滚动（适用于 iOS）
            }}
          >
            {/* Women 卡片 */}
            <div className="flex-none w-60 h-80 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 bg-white hover:shadow-md transition-shadow duration-300 relative">
              {/* 背景图片 */}
              <img
                src="/assets/category/women.png"
                alt="Women's Fragrances"
                className="w-full h-auto object-contain"
              />

              {/* 文字和按钮容器 */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 to-transparent">
                <h3 className="text-white font-semibold text-2xl sm:text-3xl mb-1">
                  Women
                </h3>
                {/* <p className="text-white/90 mb-8" style={{ fontSize: '13px' }}>
                  Discover elegant and refined scents
                </p> */}
                {/* <br></br> */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/products/women');
                  }}
                  className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300"
                >
                  Explore Women
                </button>
              </div>
            </div>

            {/* Men 卡片 */}
            <div className="flex-none w-60 h-80 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 bg-white hover:shadow-md transition-shadow duration-300 relative">
              {/* 背景图片 */}
              <img
                src="/assets/category/men.png"
                alt="Women's Fragrances"
                className="w-full h-auto object-contain"
              />

              {/* 文字和按钮容器 */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 to-transparent">
                <h3 className="text-white font-semibold text-2xl sm:text-3xl mb-1">
                  Men
                </h3>
                {/* <p className="text-white/90 mb-8" style={{ fontSize: '13px' }}>
                  Discover elegant and refined scents
                </p> */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/products/women');
                  }}
                  className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300"
                >
                  Explore Men
                </button>
              </div>
            </div>

            {/* Sales 卡片 */}
            <div className="flex-none w-60 h-80 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 bg-white hover:shadow-md transition-shadow duration-300 relative">
              {/* 背景图片 */}
              <img
                src="/assets/category/sales.png"
                alt="Special Sales"
                className="w-full h-auto object-contain"
              />

              {/* 文字和按钮容器 */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 to-transparent">
                <h3 className="text-white font-semibold text-2xl sm:text-3xl mb-1">
                  Deals & Offers
                </h3>
                {/* <p className="text-white/90 mb-8" style={{ fontSize: '13px' }}>
                  Limited time deals & discounts
                </p>
                <br></br> */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/products/sales');
                  }}
                  className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300"
                >
                  Explore Sales
                </button>
              </div>
            </div>

            {/* Gift Sets 卡片 */}
            <div className="flex-none w-60 h-80 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 bg-white hover:shadow-md transition-shadow duration-300 relative">
              {/* 背景图片 */}
              <img
                src="/assets/category/gift.png"
                alt="Gift Sets"
                className="w-full h-auto object-contain"
              />

              {/* 文字和按钮容器 */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 to-transparent">
                <h3 className="text-white font-semibold text-2xl sm:text-3xl mb-1">
                  Gift Sets
                </h3>
                {/* <p className="text-white/90 mb-8" style={{ fontSize: '13px' }}>
                  Perfect presents for any occasion
                </p>
                <br></br> */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/products/giftsets');
                  }}
                  className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300"
                >
                  Explore Gifts
                </button>
              </div>
            </div>


          </div>
        </div>

        {/* <div class="border-t my-4 mx-2 border-gray-300"></div> */}


      </div>

      {/* 桌面版布局 */}
      <div className="hidden sm:block w-full">
        <div className="px-2 pb-8">
          {/* 内容部分 */}
          <div className="flex gap-6 w-full">
            {/* 左侧列 */}
            <div className="w-1/3 lg:w-1/4 grid grid-rows-2 gap-4">
              {/* TikTok Live Deal */}
              <div className="flex-grow h-full flex flex-col">
                <div className="my-4 flex items-center space-x-2">
                  <Gift className="w-5 h-5" />
                  <span className="text-lg font-semibold">Special Offers</span>
                </div>
                <div className="h-full bg-pink-50 rounded-lg p-6 text-center flex flex-col xl:gap-4">
                  <h3 className="text-lg font-medium mb-8">
                    Exclusive Deal On TikTok LIVE
                  </h3>
                  <div className="relative w-32 h-32 xl:w-40 xl:h-40 mx-auto ">
                    <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-20"></div>
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      <a
                        href="https://www.tiktok.com/@omgbeautyshop/live"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src="/assets/logo/omgbeautybox.png"
                          alt="OMG Beauty Box"
                          className="w-full h-full object-cover"
                        />
                      </a>

                    </div>
                  </div>
                  <a
                    href="https://www.tiktok.com/@omgbeautyshop/live"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white bg-red-600 xl:w-64 xl:mx-auto hover:bg-red-700 px-6 py-3 mt-12 rounded-md text-sm font-medium w-full block"
                  >
                    Go To TikTok
                  </a>
                </div>
              </div>

              {/* New Arrivals */}
              <div className="bg-[#F7CAC9] rounded-lg overflow-hidden mt-2 flex-grow">
                <div className="p-6 h-full flex flex-col">
                  <h3 className="font-medium text-center text-lg mb-8">New Arrivals</h3>
                  <div className="flex flex-col gap-4 flex-grow">
                    <div className="relative h-full w-full rounded-lg overflow-hidden flex-grow">
                      <img
                        src="/assets/category/new.jpg"
                        alt="New arrival product"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                        20% OFF
                      </div>
                    </div>
                    <a
                      href="/products/newarrivals"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="inline-block bg-red-600 hover:bg-red-700 text-white py-3 px-6 my-4 rounded-md text-sm font-medium w-full mt-auto text-center"
                    >
                      Shop Now
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧列 */}
            <div className="w-2/3 lg:w-3/4 mx-auto grid grid-rows-2 gap-4">
              {/* 视频轮播 */}
              <div className="flex-grow w-full h-full flex flex-col">
                <div className="my-4 flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-lg font-semibold">Featured Videos</span>
                </div>

                <div
                  className="relative w-full h-full"

                >
                  <button
                    onClick={videoScrollLeft}
                    className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 text-black w-10 h-10 rounded-full items-center justify-center shadow-md hover:bg-white transition-colors duration-200 -ml-5"
                    aria-label="Scroll left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <div
                    ref={videoCarouselRef}
                    className="flex overflow-x-auto h-full snap-x gap-4 hide-scrollbar scrollbar-hide"
                    style={{
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch',
                      scrollbarWidth: 'none',
                    }}
                  >
                    {videoPaths.map((video, index) => (
                      <div
                        key={index}
                        className=" lg:w-1/3 xl:w-1/4 w-1/2 h-full flex-none overflow-hidden rounded-lg snap-start shadow-lg shadow-gray-300 bg-white hover:shadow-md transition-shadow duration-300 relative"
                      >
                        <video
                          ref={el => desktopVideoRefs.current[index] = el}
                          src={video}
                          className="w-full h-full object-cover"
                          controls={playingDesktopIndex === index}
                          controlsList="nodownload nofullscreen noplaybackrate"
                          muted={false}
                          loop={false}
                          disablePictureInPicture
                          playsInline
                          onPause={() => {
                            if (playingDesktopIndex === index) setPlayingDesktopIndex(null);
                          }}
                          style={{ background: "#000" }}
                        />
                        {playingDesktopIndex !== index && (
                          <button
                            className="absolute inset-0 text-5xl text-white bg-black/40 hover:bg-black/60 transition"
                            style={{ pointerEvents: "auto" }}
                            onClick={() => { setPlayingDesktopIndex(index) }}
                            aria-label="Play video"
                          >
                            ▶
                          </button>
                        )}

                        {/* Shop Now Button */}
                        {videoProducts[index] && (
                          <Link
                            to={`/products/${videoProducts[index].node.handle}`}
                            className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors duration-200 shadow-md"
                          >
                            Shop Now
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Right Arrow Button (Desktop only) */}
                  <button
                    onClick={videoScrollRight}
                    className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 text-black w-10 h-10 rounded-full items-center justify-center shadow-md hover:bg-white transition-colors duration-200 -mr-5"
                    aria-label="Scroll right"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>



              {/* Trending Now Section */}
              <div className="w-full h-full flex flex-col">
                <div className="flex items-center my-2 lg:my-4">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="text-lg font-semibold">
                    Trending Now
                  </span>
                </div>

                <div className="relative w-full h-full">
                  <button
                    onClick={orderScrollLeft}
                    className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 text-black w-10 h-10 rounded-full items-center justify-center shadow-md hover:bg-white transition-colors duration-200 -ml-5"
                    aria-label="Scroll left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <div
                    ref={orderCarouselRef}
                    className="flex w-full overflow-x-auto h-full snap-x gap-2 mx-2 hide-scrollbar scrollbar-hide"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch',
                    }}
                  >
                    {trendingProducts.slice(0, 4).map(({ node }, index) => (
                      <div key={node.id} className="flex-none flex flex-col py-2 my-2 w-1/2 lg:w-1/3 xl:w-1/4 border border-gray-200 rounded-lg overflow-hidden snap-start shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex justify-center">
                          <a href={`/products/${node.handle}`}>
                            {node.images.edges[0] ? (
                              <img
                                src={node.images.edges[0].node.url}
                                alt={node.title}
                                className="h-full object-fill"
                              />
                            ) : (
                              <img
                                src="/api/placeholder/400/400"
                                alt="Placeholder"
                                className="h-full object-fill"
                              />
                            )}
                          </a>
                        </div>
                        <div className="text-left h-full flex flex-col mx-2 border-t border-gray-200 pt-2">
                          <Link
                            key={node.id}
                            to={`/products/${node.handle}`}
                            className="font-semibold text-blue-600 hover:underline flex flex-col py-2"
                          >
                            <div className="font-bold text-xs uppercase mb-1">
                              {node.vendor || 'Unknown Brand'}
                            </div>
                            <p className="text-xs font-normal mb-2 overflow-hidden text-ellipsis ">
                              {node.title
                                ? node.title.replace(
                                  new RegExp(`^${node.vendor}\\s*`),
                                  '',
                                )
                                : 'N/A'}
                            </p>
                          </Link>
                          <div className="font-bold text-sm">
                            ${Number(node.variants.edges[0]?.node.price.amount || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* {orderedProducts.map(({ node }, index) => (
                    <div
                      key={node.id}
                      className={`flex-none w-1/4 xs:w-2/3 sm:w-60 md:w-80 lg:w-1/4 rounded-lg overflow-hidden snap-start shadow-sm hover:shadow-md transition-shadow duration-300`}
                    >
                      <div className="relative aspect-square">
                        <Link
                          to={`/products/${node.handle}`}
                          onClick={(e) => {
                            if (!node?.handle) e.preventDefault();
                          }}
                        >
                          <img
                            src={`/assets/presentation/${index + 1}.jpg`}
                            alt={node.title}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                      </div>
                      <div className="p-6">
                        <div className="text-sm font-medium text-black uppercase tracking-wider mb-2">
                          {node.vendor || 'Unknown Brand'}
                        </div>
                        <p className="text-pink-600 font-bold mb-4">
                          ${Number(node.variants.edges[0]?.node.price.amount || 0).toFixed(2)}
                        </p>
                        <Link
                          to={`/products/${node.handle}`}
                          onClick={(e) => {
                            if (!node?.handle) e.preventDefault();
                          }}
                          className="font-bold text-blue-600 hover:underline"
                        >
                          SHOP NOW ▸
                        </Link>
                      </div>
                    </div>
                  ))} */}
                  </div>
                  <button
                    onClick={orderScrollRight}
                    className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 text-black w-10 h-10 rounded-full items-center justify-center shadow-md hover:bg-white transition-colors duration-200 -mr-5"
                    aria-label="Scroll right"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Shop By Category */}
          <div className="mt-10">
            <div className="flex items-center mb-4 space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-lg font-semibold">Shop By Category</span>
            </div>

            {/* 电脑版网格布局 */}
            <div className="grid grid-cols-4 gap-4">
              {/* Women Category */}
              <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 relative">
                <img
                  src="/assets/category/women.png"
                  alt="Women's Fragrances"
                  className="w-full h-auto object-contain"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="text-white font-semibold text-2xl mb-2">Women</h3>
                  <a
                    href="/products/women"
                    className="bg-white text-black hover:bg-gray-100 px-6 py-3 rounded-full text-sm font-medium transition-colors duration-300 inline-block text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Explore Women
                  </a>
                </div>
              </div>

              {/* Men Category */}
              <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 relative">
                <img
                  src="/assets/category/men.png"
                  alt="Men's Fragrances"
                  className="w-full h-auto object-contain"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="text-white font-semibold text-2xl mb-2">Men</h3>
                  <a
                    href="/products/men"
                    className="bg-white text-black hover:bg-gray-100 px-6 py-3 rounded-full text-sm font-medium transition-colors duration-300 inline-block text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Explore Men
                  </a>
                </div>
              </div>

              {/* Sales Category */}
              <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 relative">
                <img
                  src="/assets/category/sales.png"
                  alt="Special Sales"
                  className="w-full h-auto object-contain"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="text-white font-semibold text-2xl mb-2">Deals & Offers</h3>
                  <a
                    href="/products/sales"
                    className="bg-white text-black hover:bg-gray-100 px-6 py-3 rounded-full text-sm font-medium transition-colors duration-300 inline-block text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Explore Sales
                  </a>
                </div>
              </div>

              {/* Gift Sets Category */}
              <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 relative">
                <img
                  src="/assets/category/gift.png"
                  alt="Gift Sets"
                  className="w-full h-auto object-contain"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="text-white font-semibold text-2xl mb-2">Gift Sets</h3>
                  <a
                    href="/products/giftsets"
                    className="bg-white text-black hover:bg-gray-100 px-6 py-3 rounded-full text-sm font-medium transition-colors duration-300 inline-block text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Explore Gifts
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* <div class="border-t my-4 mx-2 border-gray-300"></div> */}

      {/* Customer Reviews Heading - with padding only on desktop */}
      <div className="flex items-center mt-4 mb-2 space-x-2 md:px-4">
        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-lg font-semibold align-middle">
          Customer Reviews
        </span>
      </div>

      {/* Mobile View: Original carousel (hidden on md and above screens) */}
      <div
        ref={carouselRef}
        className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 p-4 hide-scrollbar scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {testimonials.map((review) => (
          <div
            key={review.id}
            className="flex-none w-full snap-start bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
          >
            {/* User Info and Menu */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                {review.userProfile ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={review.userProfile}
                      alt={`${review.name}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                    {review.name[0]}
                  </div>
                )}
                <div>
                  <div className="text-gray-900">{review.name}</div>
                  <div className="text-gray-500 text-sm">United States</div>
                </div>
              </div>
            </div>

            {/* Star Rating */}
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Review Title and Content */}
            <h3 className="text-base font-medium text-gray-900 mb-1">
              {review.title}
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              {review.text}
            </p>
          </div>
        ))}
      </div>

      {/* Desktop View: Grid layout with 3 columns (visible only on md and above screens) */}
      {/* Desktop View: Carousel with 3 columns */}
      <div className="hidden md:block relative">
        <div className="overflow-hidden relative">
          {/* Navigation Buttons - With cursor pointer */}
          {testimonials.length > 3 && (
            <>
              <button
                onClick={() => setCurrentTestimonialPage(prev => Math.max(0, prev - 1))}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed -ml-3 transition-shadow"
                disabled={currentTestimonialPage === 0}
                aria-label="Previous testimonials"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => setCurrentTestimonialPage(prev => Math.min(Math.ceil(testimonials.length / 3) - 1, prev + 1))}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed -mr-3 transition-shadow"
                disabled={currentTestimonialPage === Math.ceil(testimonials.length / 3) - 1}
                aria-label="Next testimonials"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div
            ref={testimonialCarouselRef}
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentTestimonialPage * 100}%)`,
            }}
          >
            {/* Group testimonials into pages of 3 */}
            {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, pageIndex) => (
              <div key={`page-${pageIndex}`} className="flex-none w-full">
                <div className="grid grid-cols-3 gap-4 p-4">
                  {testimonials.slice(pageIndex * 3, pageIndex * 3 + 3).map((review) => (
                    <div
                      key={review.id}
                      className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                    >
                      {/* User Info and Menu */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {review.userProfile ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <img
                                src={review.userProfile}
                                alt={`${review.name}'s profile`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                              {review.name[0]}
                            </div>
                          )}
                          <div>
                            <div className="text-gray-900">{review.name}</div>
                            <div className="text-gray-500 text-sm">United States</div>
                          </div>
                        </div>
                      </div>

                      {/* Star Rating */}
                      <div className="flex gap-1 mb-2">
                        {[...Array(5)].map((_, index) => (
                          <svg
                            key={index}
                            className="w-5 h-5 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>

                      {/* Review Title and Content */}
                      <h3 className="text-base font-medium text-gray-900 mb-1">
                        {review.title}
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        {review.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Page Indicators */}
        {testimonials.length > 3 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, index) => (
              <button
                key={`indicator-${index}`}
                className={`w-2 h-2 rounded-full cursor-pointer ${currentTestimonialPage === index ? 'bg-black' : 'bg-gray-300'
                  }`}
                onClick={() => setCurrentTestimonialPage(index)}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({ collection }) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({ products }) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                  <Link
                    key={product.id}
                    className="recommended-product"
                    to={`/products/${product.handle}`}
                  >
                    <Image
                      data={product.images.nodes[0]}
                      aspectRatio="1/1"
                      sizes="(min-width: 45em) 20vw, 50vw"
                    />
                    <h4>{product.title}</h4>
                    <small>
                      <Money data={product.priceRange.minVariantPrice} />
                    </small>
                  </Link>
                ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}


const ALL_PRODUCTS_QUERY = `
  query MenProducts {
    collection(id: "gid://shopify/Collection/285176168553") {
      title
      id
      products(first: 100) {
        edges {
          node {
            id
            title
            handle
            tags
            vendor
            descriptionHtml
            images(first: 6) {
              edges {
                node {
                  url
                }  
              } 
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

const PROMOTING_PRODUCTS_QUERY = `#graphql
  query PromotingProducts {
    products(first: 10, query: "tag:Promoting") {
      edges {
        node {
          id
          title
          handle
          tags
          vendor
          descriptionHtml
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

const TRENDING_PRODUCTS_QUERY = `#graphql
  query TrendingProducts {
    products(first: 10, query: "tag:Trending") {
      edges {
        node {
          id
          title
          handle
          tags
          vendor
          descriptionHtml
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

const NEW_PRODUCTS_QUERY = `#graphql
  query TrendingProducts {
    products(first: 10, query: "tag:New Product") {
      edges {
        node {
          id
          title
          handle
          tags
          vendor
          descriptionHtml
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

// const ALL_PRODUCTS_QUERY = `
// query AllProduct {
//   products(first: 250, after: null) {
//     edges {
//       node {
//         id
//         title
//         handle
//         description
//         priceRange {
//           minVariantPrice {
//             amount
//             currencyCode
//           }
//         }
//         images(first: 1) {
//           edges {
//             node {
//               id
//               url
//               altText
//             }
//           }
//         }
//       }
//       cursor
//     }
//     pageInfo {
//       hasNextPage
//     }
//   }
// }

// `;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
