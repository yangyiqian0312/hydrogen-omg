import { defer } from '@shopify/remix-oxygen';
import { Await, useLoaderData, Link } from '@remix-run/react';
import { Suspense } from 'react';
import { Image, Money } from '@shopify/hydrogen';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { products } from '~/data/products';
import { Heart, ChevronLeft, ChevronRight, Clock, Gift } from 'lucide-react';
import OldHeader from '~/components/OldHeader';
/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{ title: 'OMG BEAUTY' }];
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
    // Log the resolved data for debugging
    console.log('Resolved Data in Loader:', promotingProducts);
    console.log('Resolved Data in Loader:', trendingProducts);
    return {
      promotingProducts: promotingProducts || null,
      trendingProducts: trendingProducts || null,
    };
  } catch (error) {
    // Log query errors, but don't throw them so the page can still render
    console.error(error);
    return null;
  }

  // return {
  //   allProducts,
  //   promotingProducts,
  // };
}

export default function Homepage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 57,
    seconds: 0,
  });

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const totalSeconds =
          prevTime.hours * 3600 + prevTime.minutes * 60 + prevTime.seconds - 1;

        if (totalSeconds <= 0) {
          clearInterval(timer);
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60,
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
    // setTrendingProducts(trending);
  }, []); // Empty dependency array ensures this runs only once

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1,
    );
  };

  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (!carouselRef.current) return;

    const scrollAmount = 320; // Width of one card
    const currentScroll = carouselRef.current.scrollLeft;

    if (direction === 'left') {
      carouselRef.current.scrollTo({
        left: currentScroll - scrollAmount,
        behavior: 'smooth',
      });
    } else {
      carouselRef.current.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // const testimonials = [
  //   {
  //     id: 1,
  //     name: 'Sarah Johnson',
  //     text: 'I absolutely love the selection of fragrances! The staff was incredibly helpful in finding the perfect scent for me.',
  //     title: 'Good service and quality',
  //     image:
  //       'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format',
  //   },
  //   {
  //     id: 2,
  //     name: 'Michael Lee',
  //     text: 'The quality of the perfumes is unmatched. I always get compliments whenever I wear them!',
  //     title: 'Super fast shipping',
  //     image:
  //       'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format',
  //   },
  //   {
  //     id: 3,
  //     name: 'Emily Davis',
  //     text: 'I found my signature scent here! The experience was fantastic and I will definitely be back.',
  //     title: 'A perfect Christmas gift',
  //     image:
  //       'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format',
  //   },
  //   {
  //     id: 4,
  //     name: 'Sarah Johnson',
  //     text: 'I absolutely love the selection of fragrances! The staff was incredibly helpful in finding the perfect scent for me.',
  //     title: 'Good service and quality',
  //     image:
  //       'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format',
  //   },
  //   {
  //     id: 5,
  //     name: 'Michael Lee',
  //     text: 'The quality of the perfumes is unmatched. I always get compliments whenever I wear them!',
  //     title: 'Super fast shipping',
  //     image:
  //       'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format',
  //   },
  // ];

  /** @type {LoaderReturnData} */
  const data = useLoaderData();

  const promotingProducts = data.promotingProducts;
  const trendingProducts = data.trendingProducts;


  const testimonials = [
    {
      id: 1,
      name: "@ᴊ*****︎",
      title: "Repeat purchase, Smell good",
      text: "This Smells Amazing second time ordering this",
    },
    {
      id: 2,
      name: "@H***l ***",
      title: "Fast delivery",
      text: "Well I was impressed how fast it came. This is my first time buying this one I have to say it smelled so good it was light. The size was bigger than I thought. I would recommend if you're looking for something not so strong.",
    },
    {
      id: 3,
      name: "@l***a",
      title: "Love scent",
      text: "In love with the scent! 💞🫶 Worth it.",
    },
    {
      id: 4,
      name: "@j*****6",
      title: "Good gift",
      text: "I actually meant to order the touch cologne for men, but I ordered wrong, but this ladies perfume is nice it's going to make a great gift to someone, that's why I didn't send it back, it will make a nice gift",
    },
    {
      id: 5,
      name: "@t*******7",
      title: "Smell good",
      text: "Smells so good got a lot of compliments",
    }
  ];


  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const bgColors = [
    'bg-[#C4C3E7]',
    'bg-[#FFB6C1]',
    'bg-[#FFF4E6]',
    'bg-[#F7CAC9]',
    'bg-[#FADADD]',
  ]; // 展示图背景颜色

  const videoPaths = [
    '/assets/video/1.mp4',
    '/assets/video/2.mp4',
    '/assets/video/3.mp4',
    '/assets/video/4.mp4',
    '/assets/video/5.mp4',
    // 添加更多视频路径
  ];

  return (
    <div className="home">
      <div
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-2 hide-scrollbar scrollbar-hide"
        style={{
          scrollbarWidth: 'none', // 隐藏滚动条（适用于 Firefox）
          msOverflowStyle: 'none', // 隐藏滚动条（适用于 IE）
          WebkitOverflowScrolling: 'touch', // 平滑滚动（适用于 iOS）
        }}
      >
        {promotingProducts.products.edges.map(({ node }, index) => (
          <div
            key={node.id}
            className={`flex-none w-1/4 xs:w-2/3 sm:w-60 md:w-80 lg:w-1/4 rounded-lg overflow-hidden snap-start shadow-sm hover:shadow-md transition-shadow duration-300 ${bgColors[index % bgColors.length]
              }`}
          >
            {/* 图片容器，动态加载图片 */}
            <div className="relative aspect-square">
              <img
                src={`/assets/presentation/${index + 1}.png`} // 动态生成图片路径
                alt={node.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* 图片容器，保持方形比例 */}
            {/* <div className="relative aspect-square">
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
            </div> */}

            <div className="p-6">
              <div className="text-sm font-medium text-black uppercase tracking-wider mb-2">
                {node.vendor || 'Unknown Brand'} {/* Replace `product.brand` */}
              </div>
              <p className="text-pink-600 font-bold mb-4">
                $
                {Number(node.variants.edges[0]?.node.price.amount || 0).toFixed(
                  2,
                )}
              </p>
              {/* Optional button or additional actions */}
              {/* SHOP NOW 按钮 */}
              <Link
                key={node.id}
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

      {/* Carousel Navigation Buttons */}
      {/* <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
      >
        <ChevronRight className="h-6 w-6" />
      </button> */}

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
                    src="/assets/logo/logo.png"
                    alt="OMG Beauty Shop"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* TODO: CHANGE TT LIVE REDIRECT */}
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
          </div>

          {/* New Arrivals 卡片 */}
          <div className="flex-none w-60 h-80 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 m-2 bg-[#F7CAC9] hover:shadow-md transition-shadow duration-300">
            <div className="rounded-xl p-6">
              <h3 className="font-medium text-lg">New Arrivals</h3>
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
                <button className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-3xl text-sm font-medium w-full transition-colors duration-200">
                  Shop Now
                </button>
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
            {trendingProducts.products.edges.map(({ node }, index) => (
              <div
                key={node.id}
                className="flex-none w-1/3 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 hover:shadow-md transition-shadow duration-300"
              >
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
              </div>
            ))}
          </div>
        </div>

        {/* TODO: ADD SHOW MORE BUTTON */}
        {/* New Arrivals Section */}
        <div>
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
            {trendingProducts.products.edges.map(({ node }, index) => (
              <div
                key={node.id}
                className="flex-none w-1/3 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 hover:shadow-md transition-shadow duration-300"
              >
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
              </div>
            ))}
          </div>
        </div>

        <div class="border-t my-4 mx-2 border-gray-300"></div>

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
                src="/assets/presentation/3.png"
                alt="Women's Fragrances"
                className="w-full h-full object-cover"
              />

              {/* 文字和按钮容器 */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 to-transparent">
                <h3 className="text-white font-semibold text-lg sm:text-xl mb-1">
                  Women's Fragrances
                </h3>
                <p className="text-white/90 text-xs sm:text-sm mb-3">
                  Discover elegant and refined scents
                </p>
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
                src="/assets/presentation/1.png"
                alt="Women's Fragrances"
                className="w-full h-full object-cover"
              />

              {/* 文字和按钮容器 */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 to-transparent">
                <h3 className="text-white font-semibold text-lg sm:text-xl mb-1">
                  Men's Fragrances
                </h3>
                <p className="text-white/90 text-xs sm:text-sm mb-3">
                  Discover elegant and refined scents
                </p>
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

            {/* Sale 卡片 */}
            {/* <div className="flex-none w-60 h-80 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 bg-white hover:shadow-md transition-shadow duration-300 relative"> */}
              {/* 背景图片 */}
              {/* <img
                src="/assets/presentation/6.png"
                alt="Women's Fragrances"
                className="w-full h-full object-cover"
              /> */}

              {/* 文字和按钮容器 */}
              {/* <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 to-transparent">
                <h3 className="text-white font-semibold text-lg sm:text-xl mb-1">
                  Sale
                </h3>
                <p className="text-white/90 text-xs sm:text-sm mb-3">
                  Discover elegant and refined scents
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/products/women');
                  }}
                  className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300"
                >
                  Explore Sale
                </button>
              </div> */}
            {/* </div> */}
          </div>
        </div>

        <div class="border-t my-4 mx-2 border-gray-300"></div>

        {/* Video Section */}
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
            {videoPaths.map((video, index) => (
              <div
                key={index}
                className="flex-none w-60 h-80 rounded-lg overflow-hidden snap-start shadow-lg shadow-gray-300 bg-white hover:shadow-md transition-shadow duration-300 relative"
              >
                {/* 背景视频 */}
                <video
                  src={video}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                ></video>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid for larger screens */}
      <div className="hidden mx-20 sm:block md:mx-20 lg:mx-40 xl:mx-60 2xl:mx-80">
        <div className="px-4 pb-8 sm:text-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Special Offers section */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm h-full">
                <div className="flex items-center mt-4 mb-2 space-x-2">
                  <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-lg font-semibold align-middle">
                    Special Offers
                  </span>
                </div>

                <div className="space-y-6">
                  {/* TikTok Live Deal */}
                  <div className="bg-gradient-to-br from-pink-50 to-white rounded-xl p-6 text-center">
                    <h3 className="text-lg font-medium mb-4">
                      Exclusive Deal On TikTok LIVE
                    </h3>
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      {' '}
                      {/* Increased size for logo */}
                      <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-20"></div>
                      <div className="relative w-full h-full rounded-full overflow-hidden">
                        <img
                          src="/logo.jpeg" // Path to your logo in public folder
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
                      <p className="text-sm text-white/90 mb-4">
                        Limited time offer
                      </p>
                      <div className="flex justify-center gap-2">
                        {/* Hours */}
                        <div className="flex gap-2">
                          {String(timeLeft.hours)
                            .padStart(2, '0')
                            .split('')
                            .map((digit, idx) => (
                              <div
                                key={`hours-${idx}`}
                                className="bg-white text-red-600 w-10 h-12 rounded-lg flex items-center justify-center text-xl font-bold"
                              >
                                {digit}
                              </div>
                            ))}
                          <div className="flex items-center text-2xl px-1">
                            :
                          </div>
                        </div>

                        {/* Minutes */}
                        <div className="flex gap-2">
                          {String(timeLeft.minutes)
                            .padStart(2, '0')
                            .split('')
                            .map((digit, idx) => (
                              <div
                                key={`minutes-${idx}`}
                                className="bg-white text-red-600 w-10 h-12 rounded-lg flex items-center justify-center text-xl font-bold"
                              >
                                {digit}
                              </div>
                            ))}
                          <div className="flex items-center text-2xl px-1">
                            :
                          </div>
                        </div>

                        {/* Seconds */}
                        <div className="flex gap-2">
                          {String(timeLeft.seconds)
                            .padStart(2, '0')
                            .split('')
                            .map((digit, idx) => (
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
                  <div className="flex items-center mt-4 mb-2 space-x-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-lg font-semibold align-middle">
                      Trending Now
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {trendingProducts.products.edges.map(({ node }, index) => (
                    <div
                      key={node.id}
                      className={`flex-none w-80 sm:w-60 md:w-72 lg:w-80 rounded-lg overflow-hidden snap-start shadow-sm hover:shadow-md transition-shadow duration-300 ${bgColors[index % bgColors.length]
                        }`}
                    >
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

                      <div>
                        <p className="text-pink-600 font-bold mb-4">
                          $
                          {Number(
                            node.variants.edges[0]?.node.price.amount || 0,
                          ).toFixed(2)}
                        </p>
                        {/* Optional button or additional actions */}
                        {/* SHOP NOW 按钮 */}
                        <Link
                          key={node.id}
                          to={`/products/${node.handle}`}
                          className="font-bold text-blue-600 hover:underline"
                        >
                          {node.vendor || 'Unknown Brand'}{' '}
                          {/* Replace `product.brand` */}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t my-4 mx-2 border-gray-300"></div>

      {/* Customer Reviews */}
      <div className="bg-pink-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-semibold text-center mb-8">
            What Our Customer Says
          </h3>

          <div className="w-full max-w-sm mx-auto px-4 h-50">
            <div className="relative">
              <div
                className="overflow-hidden bg-white rounded-lg shadow-lg p-4 h-44 flex flex-col justify-between"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="space-y-4">
                  <div className="text-gray-600 text-xs">{testimonials[currentIndex].name}</div>
                  <h3 className="text-sm font-semibold text-gray-900">{testimonials[currentIndex].title}</h3>
                  <p className="text-xs text-gray-700">{testimonials[currentIndex].text}</p>
                </div>
              </div>


              <div className="flex justify-center mt-4 space-x-2">
                {testimonials.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full ${index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
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

const ALL_PRODUCTS_QUERY = `
query AllProduct {
  products(first: 250, after: null) {
    edges {
      node {
        id
        title
        handle
        description
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 1) {
          edges {
            node {
              id
              url
              altText
            }
          }
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
    }
  }
}

`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
