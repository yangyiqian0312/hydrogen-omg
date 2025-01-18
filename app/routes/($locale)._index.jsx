import {defer} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import {useNavigate} from 'react-router-dom';
import {useRef, useState, useEffect} from 'react';
import {products} from '~/data/products';
import {Heart, ChevronLeft, ChevronRight, Clock} from 'lucide-react';
import OldHeader from '~/components/OldHeader';
/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'OMG BEAUTY'}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

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
function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  const allProducts = context.storefront
    .query(ALL_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    allProducts,
  };
}

export default function Homepage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);

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
          return {hours: 0, minutes: 0, seconds: 0};
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
    setTrendingProducts(trending);
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

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      text: 'I absolutely love the selection of fragrances! The staff was incredibly helpful in finding the perfect scent for me.',
      title: 'Good service and quality',
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format',
    },
    {
      id: 2,
      name: 'Michael Lee',
      text: 'The quality of the perfumes is unmatched. I always get compliments whenever I wear them!',
      title: 'Super fast shipping',
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format',
    },
    {
      id: 3,
      name: 'Emily Davis',
      text: 'I found my signature scent here! The experience was fantastic and I will definitely be back.',
      title: 'A perfect Christmas gift',
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format',
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      text: 'I absolutely love the selection of fragrances! The staff was incredibly helpful in finding the perfect scent for me.',
      title: 'Good service and quality',
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format',
    },
    {
      id: 5,
      name: 'Michael Lee',
      text: 'The quality of the perfumes is unmatched. I always get compliments whenever I wear them!',
      title: 'Super fast shipping',
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format',
    },
  ];

  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="home">
      {/* <FeaturedCollection collection={data.featuredCollection} />
      <RecommendedProducts products={data.recommendedProducts} /> */}
      <OldHeader />
      <div
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 hide-scrollbar scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {featuredProducts.map((product) => (
          <div
            key={product.product_id}
            className="flex-none w-80 bg-white rounded-lg overflow-hidden snap-start shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="relative aspect-square">
              <img
                src={product.main_product_image || '/api/placeholder/400/400'}
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
      </button>

      {/* Main Content Grid */}
      <div className="px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ... Special Offers section ... */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm h-full">
              {' '}
              {/* Added h-full */}
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold">Special Offers</h2>
              </div>
              <div className="p-6 space-y-6">
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
                        <div className="flex items-center text-2xl px-1">:</div>
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
                        <div className="flex items-center text-2xl px-1">:</div>
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
                          product.main_product_image ||
                          '/api/placeholder/400/400'
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
    </div>
  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({collection}) {
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
function RecommendedProducts({products}) {
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
