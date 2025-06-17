import { defer } from '@shopify/remix-oxygen';
import { Await, useLoaderData, Link } from '@remix-run/react';
import { Suspense } from 'react';
import { Image, Money } from '@shopify/hydrogen';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight, Clock, Gift } from 'lucide-react';
import OldHeader from '~/components/OldHeader';
import Modal from '~/components/Modal';
import TrendingProductCard from '~/components/TrendingProductCard';
import { AddToCartButton } from '~/components/AddToCartButton';
import { useAside } from '~/components/Aside';
/**
 * @type {MetaFunction}
 */
export const meta = ({ matches }) => {
  const rootMeta = matches[0].meta;
  return [
    ...rootMeta,
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
  // const [{ collections }] = await Promise.all([
  //   context.storefront.query(FEATURED_COLLECTION_QUERY),
  //   // Add other queries here, so that they are loaded in parallel
  //   // context.storefront.query(PROMOTING_PRODUCTS_QUERY),
  //   // context.storefront.query(TRENDING_PRODUCTS_QUERY),
  //   // context.storefront.query(ALL_PRODUCTS_QUERY),
  // ]);
  const collection = await context.storefront.query(FEATURED_COLLECTION_QUERY);
  console.table('collections:', collection);

  return {
    featuredCollection: collection,
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

    const allProducts = await context.storefront.query(
      ALL_PRODUCTS_QUERY,
    );

    // Log the resolved data for debugging
    return {
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
  const [isClient, setIsClient] = useState(false);

  const { open } = useAside();

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
  const promotingProducts_women = products.filter(({ node }) => {
    return node.tags && node.tags.includes('Women') && node.tags.includes('Promoting');
  });
  const promotingProducts_men = products.filter(({ node }) => {
    return node.tags && node.tags.includes('men') && node.tags.includes('Promoting');
  });

  const trendingProducts = products.filter(({ node }) => {
    return node.tags && node.tags.includes('Trending');
  });


  const newProducts = products.filter(({ node }) => {
    return node.tags && node.tags.includes('New Products');
  });

  //console.log("Filtered new products:", newProducts);

  const videoProducts = products.filter(({ node }) => {
    return node.tags && node.tags.includes('Video');
  });

  // Extract video paths from Shopify Video products
  const videoPaths = () => {
    const paths = [];
    let index = 0;
    for (const product of videoProducts) {
      for (const media of product.node.media.edges) {
        if (media.node.mediaContentType === 'VIDEO' ) {
          paths[index] = media.node;
          break;
        }
      }
      index++;
    }
    return paths;
  }

  // Get Shopify direct CDN video URL
  const getShopifyDirectVideoUrl = (videoSources) => {
    // Find the MP4 source
    const mp4Source = videoSources?.find(source => source.mimeType === 'video/mp4');
    if (!mp4Source) return null;

    // Extract video ID and create direct URL
    const match = mp4Source.url.match(/\/([a-f0-9]{32})\//);
    if (!match) return null;

    return `https://cdn.shopify.com/videos/c/o/v/${match[1]}.mp4`;
  };

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


  const [currentTestimonialPage, setCurrentTestimonialPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const testimonialCarouselRef = useRef(null);

  const mainCarouselRef = useRef(null);
  const carouselRef = useRef(null);
  const desktopVideoRefs = useRef([]);
  const mobileVideoRefs = useRef([]);

  const orderCarouselRef = useRef(null);
  const orderCarouselRef_women = useRef(null);
  const orderCarouselRef_men = useRef(null);
  const videoCarouselRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    if (orderCarouselRef.current) {
      console.log('Carousel mounted successfully');
    }
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (playingDesktopIndex !== null || playingMobileIndex !== null) {
        const videoRefs = isMobile ? mobileVideoRefs : desktopVideoRefs;
        const currentIndex = isMobile ? playingMobileIndex : playingDesktopIndex;
        if (videoRefs.current[currentIndex]) {
          videoRefs.current[currentIndex].pause();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

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
    if (typeof window !== 'undefined') {
      const hadModal = sessionStorage.getItem('hadModal');
      if (!hadModal) {
        setShowModal(true);
        sessionStorage.setItem('hadModal', true);
      }
    }
    return () => { window.removeEventListener('resize', handleResize); };
  }, [playingDesktopIndex, playingMobileIndex, isMobile]);

  const scrollLeft = (carouselRef) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: -320,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = (carouselRef) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: 320,
        behavior: 'smooth'
      });
    }
  };

  const banners = [
    {
      image: '/assets/Banners/Banner 1.png',
      link: '/account/subscribe',
    },
    {
      image: '/assets/Banners/Banner 2.png',
      link: '/account/subscribe',
    },
    {
      image: '/assets/Banners/Banner 3.png',
      link: '/account/subscribe',
    },
  ];
  const [currentBanner, setCurrentBanner] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const [videoUrl, setVideoUrl] = useState({ index: null, url: null });
  return (
    <div className="home w-full">
      {showModal && <Modal onClose={() => setShowModal(false)} />}
      <div className="flex flex-col space-y-4 relative" >
        {/* Main banner carousel */}
        <div className="relative w-full overflow-hidden max-h-[400px]">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              width: `${banners.length * 100}%`,
              transform: `translateX(-${currentBanner * (100 / banners.length)}%)`,
            }}
          >
            {banners.map((banner, index) => (
              <a
                key={index}
                href={banner.link}
                className="w-full flex-shrink-0"
                tabIndex={currentBanner === index ? 0 : -1}
                aria-hidden={currentBanner !== index}
              >
                <img
                  src={banner.image}
                  alt="Banner"
                  className="w-full h-full overflow-hidden max-h-[400px] object-fill bg-red-300 mt-2 md:mt-0"
                />
              </a>
            ))}
          </div>
          {/* Dots navigation (optional, for UX) */}
          <div className="absolute left-1/2 bottom-2 transform -translate-x-1/2 flex space-x-2 z-5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`w-2 h-2 rounded-full ${i === currentBanner ? 'bg-black' : 'bg-gray-400'} transition-colors duration-300 ease-in-out`}
                aria-label={`Go to banner ${i + 1}`}
              />
            ))}
          </div>
          <div
            onClick={() => setShowModal(true)}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 block w-2/3 h-3/4 cursor-pointer z-5"
          />
        </div>


        {/* TikTok LIVE element positioned at the top right corner */}
        <div className="absolute inset-y-0 xl:right-10 xl:p-4 lg:right-4 lg:pb-3 max-w-sm hidden lg:flex flex-col justify-center items-center">
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


      <div className="relative h-full">
        <button
          onClick={() => scrollLeft(mainCarouselRef)}
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-5 bg-white/80 text-black w-10 h-10 rounded-full items-center justify-center shadow-md hover:bg-white transition-colors duration-200 -ml-5"
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div
          ref={mainCarouselRef}
          className="flex h-full overflow-x-auto snap-x md:gap-4 gap-2 hide-scrollbar scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {orderedProducts.map(({ node }, index) => (
            node.selectedOrFirstAvailableVariant.availableForSale && (<div
              key={node.id}
              className={`flex flex-col justify-between h-auto flex-none w-1/4 xs:w-2/3 sm:w-60 md:w-80 lg:w-1/4 rounded-lg overflow-hidden snap-start shadow-sm hover:shadow-md transition-shadow duration-300 ${bgColors[index % bgColors.length]}`}
            >
              <div className={`flex-none h-auto w-full ${videoUrl?.index === index && videoUrl?.url ? 'aspect-[2/3]' : 'aspect-[2/3]'}`}>
                <Link
                  to={`/products/${node.handle}`}
                  onClick={(e) => {
                    if (!node?.handle) e.preventDefault();
                  }}
                  onMouseOver={() => {
                    for (const media of node.media.edges) {
                      if (media.node.mediaContentType === 'VIDEO') {
                        const videoUrl = getShopifyDirectVideoUrl(media.node.sources);
                        setVideoUrl({ index, url: videoUrl });
                      }
                    }
                  }}
                  onMouseLeave={() => {
                    setVideoUrl({ index: null, url: null });
                  }}
                  className="w-full h-full"
                >
                  {videoUrl?.index === index && videoUrl?.url && (
                    <video src={videoUrl.url} autoPlay loop className="w-full aspect-[2/3] pt-2 h-full object-contain" />
                  )}

                  <img
                    src={`/assets/presentation/${index + 1}.jpg`}
                    alt={node.title}
                    className={`${videoUrl?.index === index && videoUrl?.url ? 'hidden' : ''} w-full h-full object-cover lazy`}
                  />

                </Link>
              </div>
              <div className="relative p-4 lg:p-6 flex flex-col gap-4 justify-between h-full">
                <Link
                  to={`/products/${node.handle}`}
                  onClick={(e) => {
                    if (!node?.handle) e.preventDefault();
                  }}
                  className='h-full'
                >
                  <div className="text-md lg:text-lg font-medium text-black uppercase tracking-wider mb-2">
                    {node.vendor || 'Unknown Brand'}
                  </div>
                  <div className="text-sm lg:text-base font-normal mb-2 text-wrap h-12 md:h-10">
                    {node.abbrTitle?.value || node.title.replace(new RegExp(`^${node.vendor}\s*`), '')}
                  </div>
                  <div className="text-pink-600 font-bold md:pb-4 pb-2">
                    ${Number(node.variants.edges[0]?.node.price.amount || 0).toFixed(2)}
                    {node.variants.edges[0]?.node.compareAtPrice.amount && (
                      <span className="text-gray-500 line-through ml-2">
                        ${Number(node.variants.edges[0]?.node.compareAtPrice.amount).toFixed(2)}
                      </span>
                    )}

                  </div>
                  {node.variants.edges[0]?.node.compareAtPrice.amount && (
                    <span className="mb-2 w-auto text-red-500 font-semibold bg-pink-100 px-2 sm:px-4 rounded">
                      {((Number(node.variants.edges[0]?.node.compareAtPrice.amount).toFixed(2) - Number(node.variants.edges[0]?.node.price.amount || 0).toFixed(2)) / Number(node.variants.edges[0]?.node.compareAtPrice.amount).toFixed(2) * 100).toFixed(0)}% OFF
                    </span>
                  )}
                </Link>
                <div className="absolute bottom-0 right-0 md:bottom-2 md:right-2 lg:bottom-4 lg:right-4 2xl:px-8 sm:flex sm:justify-end sm:flex-none sm:pr-4 p-1 sm:py-0">
                  <AddToCartButton
                    disabled={!node.selectedOrFirstAvailableVariant.availableForSale}
                    onClick={() => {
                      open('cart');
                    }}
                    lines={[
                      {
                        merchandiseId: node.selectedOrFirstAvailableVariant.id,
                        quantity: 1,
                        selectedVariant: node.selectedOrFirstAvailableVariant,
                      },
                    ]}
                  >
                    {node.selectedOrFirstAvailableVariant.availableForSale ? 'Add to cart' : 'Sold out'}
                  </AddToCartButton>
                </div>
              </div>
            </div>)
          ))}
        </div>
        <button
          onClick={() => scrollRight(mainCarouselRef)}
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-5 bg-white/80 text-black w-10 h-10 rounded-full items-center justify-center shadow-md hover:bg-white transition-colors duration-200 -mr-5"
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
          <div className="flex-none w-60 h-80 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 bg-[#F7CAC9] hover:shadow-md transition-shadow duration-300">
            <div className="rounded-xl p-6">
              <h3 className="font-medium text-lg">New Arrivals</h3>
              <div className="flex flex-col gap-4">
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src="/assets/category/new.jpg"
                    alt="New arrival product"
                    className="w-full h-full object-cover pt-2"
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
          {/* Category for Her 卡片 */}
          <div
            className="flex-none w-60 h-80 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 bg-cover bg-center cursor-pointer hover:shadow-md transition-shadow duration-300"
            style={{ backgroundImage: "url('/assets/Category for Her.png')" }}
            onClick={(e) => {
              e.stopPropagation();
              navigate('/products/women');
            }}
          >
            <div className='py-10 px-1 w-full h-full flex flex-col justify-center gap-1'>
              <div className="text-center text-md font-bold text-pink-700"
                style={{ fontFamily: 'forma-djr-micro, sans-serif', fontStyle: 'normal', fontWeight: '700' }}>
                HER SIGNATURE SCENTS
              </div>
              <div
                className="text-center text-xs pb-2 text-balance"
                style={{ fontFamily: 'forma-djr-micro, sans-serif', fontStyle: 'normal', fontWeight: '500' }}>
                From everyday elegance to unforgettable nights.
                Discover timeless scents made for her moments.
              </div>
              <div className="text-center pb-2">
                <button
                  className="inline-block text-sm bg-transparent text-pink-700 py-1 px-2 rounded-xl border-2 border-pink-700 cursor-pointer hover:bg-pink-700 hover:text-pink-200 transition-colors duration-300"
                  style={{ fontFamily: 'aw-conqueror-didot, serif', fontStyle: 'normal', fontWeight: '500' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/products/women');
                  }}>
                  Shop Now For Her
                </button>
              </div>
            </div>
          </div>
          {/* Category for Him 卡片 */}
          <div
            className="flex-none w-60 h-80 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 bg-cover bg-center cursor-pointer hover:shadow-md transition-shadow duration-300"
            style={{ backgroundImage: "url('/assets/Category for Him.png')" }}
            onClick={(e) => {
              e.stopPropagation();
              navigate('/products/men');
            }}
          >
            <div className='py-10 px-1 w-full h-full flex flex-col justify-center gap-1'>
              <div className="text-center text-md font-bold text-slate-700"
                style={{ fontFamily: 'forma-djr-micro, sans-serif', fontStyle: 'normal', fontWeight: '700' }}>
                HIS SIGNATURE SCENTS
              </div>
              <div
                className="text-center text-xs pb-2 text-balance"
                style={{ fontFamily: 'forma-djr-micro, sans-serif', fontStyle: 'normal', fontWeight: '500' }}>
                 Confidence, character, and timeless appeal.
                 Explore classic and bold fragrances curated for him.
              </div>
              <div className="text-center pb-2">
                <button
                  className="inline-block text-sm bg-transparent text-slate-700 py-1 px-2 rounded-xl border-2 border-slate-700 cursor-pointer hover:bg-slate-700 hover:text-slate-200 transition-colors duration-300"
                  style={{ fontFamily: 'aw-conqueror-didot, serif', fontStyle: 'normal', fontWeight: '500' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/products/men');
                  }}>
                  Shop Now For Him
                </button>
              </div>
            </div>
          </div>

          {/* Sale Products 卡片 */}
          {/* <div className="flex-none w-60 h-80 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 bg-white hover:shadow-md transition-shadow duration-300">
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
              node.selectedOrFirstAvailableVariant.availableForSale && (
                <div
                  key={node.id}
                  className="flex-none w-2/3 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 hover:shadow-md transition-shadow duration-300"
                >
                  <TrendingProductCard
                    {...node}
                    className="flex flex-col w-full h-auto overflow-hidden"
                  />
                </div>
              )
            ))}
          </div>
        </div>
        {/* Trending Now Women Mobile Section */}
        <div>
          <div className="flex items-center mt-4 mb-2 space-x-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-lg font-semibold align-middle">
              Trending Women
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
            {promotingProducts_women.map(({ node }, index) => (
              node.selectedOrFirstAvailableVariant.availableForSale && (
                <div
                  key={node.id}
                  className="flex-none w-2/3 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 hover:shadow-md transition-shadow duration-300"
                >
                  <TrendingProductCard
                    {...node}
                    className="flex flex-col w-full h-auto overflow-hidden"
                  />
                </div>
              )
            ))}
          </div>
        </div>
        {/* Trending Now Men Mobile Section */}
        <div>
          <div className="flex items-center mt-4 mb-2 space-x-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-lg font-semibold align-middle">
              Trending Men
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
            {promotingProducts_men.map(({ node }, index) => (
              node.selectedOrFirstAvailableVariant.availableForSale && (
                <div
                  key={node.id}
                  className="flex-none w-2/3 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 hover:shadow-md transition-shadow duration-300"
                >
                  <TrendingProductCard
                    {...node}
                    className="flex flex-col w-full h-auto overflow-hidden"
                  />
                </div>
              )
            ))}
          </div>
        </div>
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
            {videoPaths().map((video, index) => (
              <div
                key={index}
                className="flex-none w-60 h-80 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 bg-white hover:shadow-md transition-shadow duration-300 relative"
              >
                <video
                  ref={el => mobileVideoRefs.current[index] = el}
                  src={getShopifyDirectVideoUrl(video.sources)}
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
                <Link
                  to={`/products/${node.handle}`}
                  className="flex-none w-full rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 hover:shadow-md transition-shadow duration-300"
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
                    <div className="font-semibold text-blue-600 hover:underline truncate">
                      {node.vendor || 'Unknown Brand'}{' '}
                      <p className="text-sm font-normal mb-4 overflow-hidden text-ellipsis whitespace-normal break-words h-12">
                        {node.title
                          ? node.title.replace(
                            new RegExp(`^${node.vendor}\\s*`),
                            '',
                          )
                          : 'N/A'}
                      </p>
                    </div>
                    <p className="font-bold mb-4">
                      $
                      {Number(
                        node.variants.edges[0]?.node.price.amount || 0,
                      ).toFixed(2)}
                    </p>
                  </div>
                </Link>
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


      </div>

      {/* 桌面版布局 */}
      <div className="hidden sm:block w-full lg:mt-4 h-auto">
        <div className="px-2 pb-8">
          {/* 内容部分 */}
          {/* 内容部分 - 使用 grid 布局确保行高一致 */}
          <div className="grid xl:grid-rows-17 grid-rows-9 gap-6 w-full">
            {/* 第一行 - New Arrivals & Trending Now */}
            <div className="grid grid-cols-9 xl:row-span-4 row-span-2 gap-6 w-full">
              {/* 左侧列 */}
              <div className="2xl:col-span-2 lg:col-span-3 md:col-span-3 col-span-4">
                <div className="w-full h-full flex flex-col">
                  <div className="w-full my-4 flex items-center">
                    <Gift className="w-5 h-5" />
                    <span className="text-lg font-semibold">New Arrivals</span>
                  </div>
                  <div className="bg-[#F7CAC9] rounded-lg h-full flex flex-col">
                    <div className="flex flex-col justify-center p-6 items-center gap-4 flex-grow h-full w-full">
                      <div className="relative w-full rounded-lg overflow-hidden flex-auto">
                        <img
                          src="/assets/category/new.jpg"
                          alt="New arrival product"
                          className="w-full h-full object-cover mx-auto"
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
                        className="inline-block flex-initial bg-red-600 hover:bg-red-700 text-white py-3 px-6 my-4 rounded-md text-sm font-medium w-full mt-auto text-center"
                      >
                        Shop Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧列 */}
              <div className="2xl:col-span-7 lg:col-span-6 md:col-span-6 col-span-5">
                <div className="w-full h-full flex flex-col">
                  <div className="w-full flex items-center my-2 lg:my-4">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="text-lg font-semibold">Trending Now</span>
                  </div>
                  <div className="relative w-full h-full">
                    <button
                      onClick={() => scrollLeft(orderCarouselRef)}
                      className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-5 bg-white/80 text-black w-10 h-10 rounded-full items-center justify-center shadow-md hover:bg-white transition-colors duration-200 -ml-5"
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
                      {trendingProducts.slice(0, 8).map(({ node }) => (
                        node.selectedOrFirstAvailableVariant.availableForSale && (
                          <div
                            key={node.id}
                            className="flex-none py-2 my-2 h-auto w-60 lg:w-64 2xl:w-1/4 border border-gray-200 rounded-lg overflow-hidden snap-start shadow-lg hover:shadow-xl transition-shadow duration-300"
                          >
                            <TrendingProductCard
                              {...node}
                              className="flex flex-col max-w-[450px] w-full h-auto overflow-hidden"
                            />
                          </div>
                        )
                      ))}
                    </div>
                    <button
                      onClick={() => scrollRight(orderCarouselRef)}
                      className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-5 bg-white/80 text-black w-10 h-10 rounded-full items-center justify-center shadow-md hover:bg-white transition-colors duration-200 -mr-5"
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

            {/* 第二行 - Category for Her & Trending Women */}
            <div className="grid grid-cols-9 xl:row-span-4 row-span-2 gap-6 w-full">
              {/* 左侧列 */}
              <div className="2xl:col-span-2 lg:col-span-3 md:col-span-3 col-span-4">
                <div className="w-full h-full flex flex-col">
                  <div className="w-full my-4 flex items-center">
                    <Gift className="w-5 h-5" />
                    <span className="text-lg font-semibold">Category for Her</span>
                  </div>
                  <div
                    style={{ backgroundImage: "url('/assets/Category for Her.png')" }}
                    className="bg-cover bg-center mb-2 bg-no-repeat rounded-lg w-full h-full flex flex-col"
                  >
                    <div className='py-12 px-2 w-full h-full flex flex-col justify-center gap-2'>
                      <div className="text-center text-3xl xl:text-4xl font-bold text-pink-700"
                        style={{ fontFamily: 'forma-djr-micro, sans-serif', fontStyle: 'normal', fontWeight: '700' }}>
                        HER SIGNATURE SCENTS
                      </div>
                      <div
                        className="text-center text-sm xl:text-base pb-2 lg:pb-4 xl:pb-6 2xl:pb-8"
                        style={{ fontFamily: 'forma-djr-micro, sans-serif', fontStyle: 'normal', fontWeight: '700' }}>
                        From everyday elegance to unforgettable nights.<br />
                        Discover timeless scents made for her moments.
                      </div>
                      <div className="text-center">
                        <button
                          className="inline-block text-lg bg-transparent text-pink-700 py-1 px-4 md:px-6 xl:px-8 rounded-xl border-2 border-pink-700 cursor-pointer hover:bg-pink-700 hover:text-pink-200 transition-colors duration-300"
                          style={{ fontFamily: 'aw-conqueror-didot, serif', fontStyle: 'normal', fontWeight: '500' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/products/women');
                          }}>
                          Shop Now For Her
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧列 */}
              <div className="2xl:col-span-7 lg:col-span-6 md:col-span-6 col-span-5">
                <div className="w-full h-full flex flex-col">
                  <div className="w-full flex items-center my-2 lg:my-4">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="text-lg font-semibold">Trending Women</span>
                  </div>
                  <div className="relative w-full h-full">
                    <button
                      onClick={() => scrollLeft(orderCarouselRef_women)}
                      className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-5 bg-white/80 text-black w-10 h-10 rounded-full items-center justify-center shadow-md hover:bg-white transition-colors duration-200 -ml-5"
                      aria-label="Scroll left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <div
                      ref={orderCarouselRef_women}
                      className="flex w-full overflow-x-auto h-full snap-x gap-2 mx-2 hide-scrollbar scrollbar-hide"
                      style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                      }}
                    >
                      {promotingProducts_women.slice(0, 8).map(({ node }) => (
                        node.selectedOrFirstAvailableVariant.availableForSale && (
                          <div
                            key={node.id}
                            className="flex-none py-2 my-2 max-w-[450px] h-auto w-60 lg:w-64 2xl:w-1/4 border border-gray-200 rounded-lg overflow-hidden snap-start shadow-lg hover:shadow-xl transition-shadow duration-300"
                          >
                            <TrendingProductCard
                              {...node}
                              className="flex flex-col w-full h-auto overflow-hidden"
                            />
                          </div>
                        )
                      ))}
                    </div>
                    <button
                      onClick={() => scrollRight(orderCarouselRef_women)}
                      className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-5 bg-white/80 text-black w-10 h-10 rounded-full items-center justify-center shadow-md hover:bg-white transition-colors duration-200 -mr-5"
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

            {/* 第三行 - Category for Him & Trending Men */}
            <div className="grid grid-cols-9 xl:row-span-4 row-span-2 gap-6 w-full">
              {/* 左侧列 */}
              <div className="2xl:col-span-2 lg:col-span-3 md:col-span-3 col-span-4">
                <div className="w-full h-full flex flex-col">
                  <div className="w-full my-4 flex items-center">
                    <Gift className="w-5 h-5" />
                    <span className="text-lg font-semibold">Category for Him</span>
                  </div>
                  <div
                    style={{ backgroundImage: "url('/assets/Category for Him.png')" }}
                    className="bg-cover bg-center mb-2 shadow-sky-800/50 shadow-lg  bg-no-repeat rounded-lg w-full h-full flex flex-col"
                  >
                    <div className='py-12 px-2 w-full h-full flex flex-col justify-center gap-2 2xl:gap-4'>
                      <div className="text-center text-3xl xl:text-4xl font-bold text-sky-800"
                        style={{ fontFamily: 'forma-djr-micro, sans-serif', fontStyle: 'normal', fontWeight: '700' }}>
                        HIS SIGNATURE SCENTS
                      </div>
                      <div
                        className="text-center text-sm xl:text-base pb-2 lg:pb-4 xl:pb-6 2xl:pb-8"
                        style={{ fontFamily: 'forma-djr-micro, sans-serif', fontStyle: 'normal', fontWeight: '700' }}>
                        Confidence, character, and timeless appeal.<br />
                        Explore classic and bold fragrances curated for him.
                      </div>
                      <div className="text-center">
                        <button
                          className="inline-block text-lg bg-transparent text-sky-800 py-1 px-4 md:px-6 xl:px-8 rounded-xl border-2 border-sky-800 cursor-pointer hover:bg-sky-800 hover:text-sky-200 transition-colors duration-300"
                          style={{ fontFamily: 'aw-conqueror-didot, serif', fontStyle: 'normal', fontWeight: '500' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/products/men');
                          }}>
                          Shop Now For Him
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧列 */}
              <div className="2xl:col-span-7 lg:col-span-6 md:col-span-6 col-span-5">
                <div className="w-full h-full flex flex-col">
                  <div className="w-full flex items-center my-2 lg:my-4">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="text-lg font-semibold">Trending Men</span>
                  </div>
                  <div className="relative w-full h-full">
                    <button
                      onClick={() => scrollLeft(orderCarouselRef_men)}
                      className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-5 bg-white/80 text-black w-10 h-10 rounded-full items-center justify-center shadow-md hover:bg-white transition-colors duration-200 -ml-5"
                      aria-label="Scroll left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <div
                      ref={orderCarouselRef_men}
                      className="flex w-full overflow-x-auto h-full snap-x gap-2 mx-2 hide-scrollbar scrollbar-hide"
                      style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                      }}
                    >
                      {promotingProducts_men.slice(0, 8).map(({ node }) => (
                        node.selectedOrFirstAvailableVariant.availableForSale && (
                          <div
                            key={node.id}
                            className="flex-none py-2 my-2 max-w-[450px] h-auto w-60 lg:w-64 2xl:w-1/4 border border-gray-200 rounded-lg overflow-hidden snap-start shadow-lg hover:shadow-xl transition-shadow duration-300"
                          >
                            <TrendingProductCard
                              {...node}
                              className="flex flex-col w-full h-auto overflow-hidden"
                            />
                          </div>
                        )
                      ))}
                    </div>
                    <button
                      onClick={() => scrollRight(orderCarouselRef_men)}
                      className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-5 bg-white/80 text-black w-10 h-10 rounded-full items-center justify-center shadow-md hover:bg-white transition-colors duration-200 -mr-5"
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

            {/* 第四行 - Special Offers & Featured Videos */}
            <div className="grid grid-cols-9 xl:row-span-5 row-span-3 gap-6 w-full">
              {/* 左侧列 */}
              <div className="2xl:col-span-2 lg:col-span-3 md:col-span-3 col-span-4">
                <div className="w-full h-full flex flex-col">
                  <div className="w-full my-4 flex items-center space-x-2">
                    <Gift className="w-5 h-5" />
                    <span className="text-lg font-semibold">Special Offers</span>
                  </div>
                  <div className="h-full bg-pink-50 rounded-lg p-6 text-center flex flex-col xl:gap-4">
                    <h3 className="text-lg font-medium mb-8">
                      Exclusive Deal On TikTok LIVE
                    </h3>
                    <div className="relative w-32 h-32 xl:w-40 xl:h-40 mx-auto">
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
                    <button
                      onClick={() =>
                        window.open(
                          'https://www.tiktok.com/@omgbeautyshop/live?enter_from_merge=others_homepage&enter_method=others_photo',
                          '_blank',
                          'noopener,noreferrer',
                        )
                      }
                      className="text-white bg-red-600 xl:w-40 xl:mx-auto hover:bg-red-700 px-6 py-3 mt-12 rounded-md text-sm font-medium w-full block"
                    >
                      Go To TikTok
                    </button>
                  </div>
                </div>
              </div>

              {/* 右侧列 */}
              <div className="2xl:col-span-7 lg:col-span-6 md:col-span-6 col-span-4">
                <div className="w-full h-full flex flex-col">
                  <div className="w-full my-4 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2v6" />
                    </svg>
                    <span className="text-lg font-semibold">Featured Videos</span>
                  </div>
                  <div className="relative w-full h-auto">
                    <button
                      onClick={() => scrollLeft(videoCarouselRef)}
                      className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-5 bg-white/80 text-black w-10 h-10 rounded-full items-center justify-center shadow-md hover:bg-white transition-colors duration-200 -ml-5"
                      aria-label="Scroll left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <div
                      ref={videoCarouselRef}
                      className="flex w-full overflow-x-auto h-full snap-x gap-4 hide-scrollbar scrollbar-hide"
                      style={{
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                      }}
                    >
                      {videoPaths().map((video, index) => (
                        <div
                          key={index}
                          className="max-w-[600px] h-auto 2xl:w-1/3 xl:w-1/2 w-2/3 flex-none rounded-lg snap-start hover:shadow-md transition-shadow duration-300 relative flex flex-col"
                        >
                          <div className="h-auto shadow-lg shadow-gray-300">
                            <video
                              ref={el => desktopVideoRefs.current[index] = el}
                              src={getShopifyDirectVideoUrl(video.sources)}
                              className="w-full h-auto aspect-[3/4] my-auto object-cover mx-auto"
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
                                className="absolute bottom-1/2 md:bottom-0 inset-0 text-5xl text-white bg-black/40 hover:bg-black/60 transition"
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
                                className="absolute md:bottom-1/3 bottom-1/2 left-1/2 transform -translate-x-1/2 bg-white text-black md:px-4 px-2 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors duration-200 shadow-md"
                              >
                                Shop Now
                              </Link>
                            )}
                          </div>
                          {videoProducts[index] && (
                            <div className="flex flex-col md:flex-row justify-between flex-none pr-4 z-5 bg-white py-2 w-full">
                              <div className="h-40 aspect-square">
                                <Link
                                  to={`/products/${videoProducts[index].node.handle}`}
                                  className="h-full"
                                >
                                  <img
                                    src={videoProducts[index].node.images.edges[0].node.url}
                                    alt={videoProducts[index].node.title}
                                    className="w-auto h-full aspect-square object-cover border border-gray-200 rounded-lg"
                                  />
                                </Link>
                              </div>
                              <div className="flex flex-col w-full justify-between relative">
                                <div className="text-xs font-semibold mb-2 flex flex-col gap-1 lg:mx-2 2xl:text-md">
                                  <Link
                                    to={`/products/${videoProducts[index].node.handle}`}
                                    className="flex flex-col"
                                  >
                                    <span className="text-sm font-semibold 2xl:text-xl">
                                      {videoProducts[index].node.vendor}
                                    </span>
                                    <span className="xl:flex hidden text-md font-semibold 2xl:text-lg/6 text-gray-700">
                                      {videoProducts[index].node.abbrTitle?.value || videoProducts[index].node.title.replace(new RegExp(`^${videoProducts[index].node.vendor}\s*`), '')}
                                    </span>
                                    <div className="flex flex-col xl:flex-row xl:gap-2 md:pt-2 xl:pt-4 xl:text-lg">
                                      <span className="font-bold text-red-600">
                                        ${videoProducts[index].node.selectedOrFirstAvailableVariant.price.amount}
                                      </span>
                                      {videoProducts[index].node.selectedOrFirstAvailableVariant.compareAtPrice && (
                                        <span className="text-gray-500 line-through">
                                          ${Number(videoProducts[index].node.selectedOrFirstAvailableVariant.compareAtPrice.amount).toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                  </Link>
                                </div>
                                <div className="flex-none place-self-end md:absolute bottom-2">
                                  <AddToCartButton
                                    disabled={!videoProducts[index].node.selectedOrFirstAvailableVariant.availableForSale}
                                    onClick={() => {
                                      open('cart');
                                    }}
                                    lines={[
                                      {
                                        merchandiseId: videoProducts[index].node.selectedOrFirstAvailableVariant.id,
                                        quantity: 1,
                                        selectedVariant: videoProducts[index].node.selectedOrFirstAvailableVariant,
                                      },
                                    ]}
                                  >
                                    {videoProducts[index].node.selectedOrFirstAvailableVariant.availableForSale ? 'Add to cart' : 'Sold out'}
                                  </AddToCartButton>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Right Arrow Button (Desktop only) */}
                    <button
                      onClick={() => scrollRight(videoCarouselRef)}
                      className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-5 bg-white/80 text-black w-10 h-10 rounded-full items-center justify-center shadow-md hover:bg-white transition-colors duration-200 -mr-5"
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
          </div>

          {/* Shop By Category */}
          <div className="mt-10">
            <div className="flex items-center mb-4 space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v6" />
              </svg>
              <span className="text-lg font-semibold">Shop By Category</span>
            </div>

            {/* 电脑版网格布局 */}
            <div className="grid grid-cols-4 gap-4 2xl:gap-6">
              {/* Women Category */}
              <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 relative">
                <img
                  src="/assets/category/women.png"
                  alt="Women's Fragrances"
                  className="w-full h-auto object-contain border-t border-l border-gray-400"
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
                  className="w-full h-auto object-contain border-t border-l border-gray-400"
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
                  className="w-full h-auto object-contain border-t border-l border-gray-400"
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
                  className="w-full h-auto object-contain border-t border-l border-gray-400"
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
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-5 p-2 rounded-full bg-white shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed -ml-3 transition-shadow"
                disabled={currentTestimonialPage === 0}
                aria-label="Previous testimonials"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => setCurrentTestimonialPage(prev => Math.min(Math.ceil(testimonials.length / 3) - 1, prev + 1))}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-5 p-2 rounded-full bg-white shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed -mr-3 transition-shadow"
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
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            />
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
    </div >
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
                    <h4>{product.abbrTitle?.value || product.title.replace(new RegExp(`^${product.vendor}\s*`), '')}</h4>
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
 fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    
    unitPrice {
      amount
      currencyCode
    }
  }
  query AllProducts {
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
            selectedOrFirstAvailableVariant {
              ...ProductVariant
            }
            abbrTitle: metafield(namespace: "custom", key: "abbrtitle") {
              id
              namespace
              key
              value
            }
            media(first: 10) {
              edges {
                node {
                  id
                  mediaContentType
                  ... on Video {
                    sources {
                      url
                      mimeType
                    }
                    previewImage {
                      url
                    }
                  }
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  availableForSale
                  currentlyNotInStock
                  title
                  price {
                    amount
                    currencyCode
                  }
                  
                  compareAtPrice {
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
    abbrTitle: metafield(namespace: "custom", key: "abbrtitle") {
              id
              namespace
              key
              value
            }
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


/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
