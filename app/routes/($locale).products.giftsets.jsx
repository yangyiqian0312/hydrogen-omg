import { defer } from '@shopify/remix-oxygen';
import React from 'react';
import { Heart, Filter, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useLoaderData } from '@remix-run/react';
import { AddToCartButton } from '~/components/AddToCartButton';


/**
 * @param {{
*   productOptions: MappedProductOptions[];
*   selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
* }}
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
    context.storefront.query(GIFT_PRODUCTS_QUERY),
    // context.storefront.query(VENDOR_PRODUCTS_QUERY),
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
    const giftProducts = await context.storefront.query(
      GIFT_PRODUCTS_QUERY,
    );
    // const vendorProducts = await context.storefront.query(
    //   VENDOR_PRODUCTS_QUERY,
    // );
    // Log the resolved data for debugging
    console.log('Resolved Data in Loader:', promotingProducts);
    console.log('Resolved Data in Loader:', trendingProducts);
    return {
      promotingProducts: promotingProducts || null,
      trendingProducts: trendingProducts || null,
      giftProducts: giftProducts || null,
      // vendorProducts: vendorProducts || null,
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


const Giftsets = (selectedVariant) => {
  const [isOpen, setIsOpen] = useState(false);
  const brands = ['Versace', 'Burberry', 'Gucci ', 'Valentino ', 'YSL', 'Viktor&Rolf'];
  const [selectedBrand, setSelectedBrand] = useState(null);


  const data = useLoaderData();

  const products = data.giftProducts?.collection?.products?.edges || [];
  console.log("Products before filtering:", products);


  // Filter for products with "men" tag with extra logging
  const giftProducts = products.filter(({ node }) => {
    return node.tags && node.tags.includes('Gift Sets') || node.tags && node.tags.includes('Minis');
  }).sort((a, b) => b.node.totalInventory - a.node.totalInventory);

  console.log("Filtered men products:", giftProducts);


  const filteredProducts = selectedBrand
    ? giftProducts.filter(
      ({ node }) => node.vendor.toLowerCase() === selectedBrand.toLowerCase()
    ).sort((a, b) => b.node.totalInventory - a.node.totalInventory)
    : giftProducts;



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


  return (
    <div>
      {/* <div className="flex items-center">
        <div className="relative flex gap-2 items-center p-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
          >
            <Filter size={18} className="text-gray-600" />
            <span className="font-medium">
              {selectedBrand || 'Shop by brand'}
            </span>
            <ChevronDown
              size={16}
              className={`text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isOpen && (
            <div className="absolute top-full left-4 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
              <button
                onClick={() => {
                  setSelectedBrand(null);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200"
              >
                All Brands
              </button>
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => {
                    setSelectedBrand(brand);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200"
                >
                  {brand}
                </button>
              ))}
            </div>
          )}
        </div>
      </div> */}

      {/* Updated grid - 2 columns on mobile, 4 columns on desktop with increased spacing */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 p-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(({ node }) => (
            <Link
              key={node.id}
              to={`/products/${node.handle}`}
              className="rounded-lg overflow-hidden shadow-lg shadow-gray-300 hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative aspect-square p-2">
                  {node.images.edges[0] ? (
                    <img
                      src={node.images.edges[0].node.url}
                      alt={node.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src="/api/placeholder/400/400"
                      alt="Placeholder"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                <div className="p-3">
                  <div className="font-semibold text-black uppercase hover:underline truncate">
                      {node.vendor || 'Unknown Brand'}
                    </div>
                    <p className="text-sm font-normal mb-2 text-gray-800 overflow-hidden 
                h-auto max-h-12
                line-clamp-2">
                      {node.title
                        ? node.title.replace(new RegExp(`^${node.vendor}\\s*`), '')
                        : 'N/A'}
                    </p>

                  <div>
                    <p className="font-bold">
                      ${Number(node.variants.edges[0]?.node.price.amount || 0).toFixed(2)}
                      {node.variants.edges[0]?.node.compareAtPrice && (
                        <span className="ml-2 text-gray-500 line-through">
                          ${Number(node.variants.edges[0]?.node.compareAtPrice.amount || 0).toFixed(2)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </Link>
          ))
        ) : (
          <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-8 text-gray-500">
            No products found for {selectedBrand}
          </div>
        )}
      </div>
    </div>


  );
};

export default Giftsets;

const GIFT_PRODUCTS_QUERY = `#graphql
  query GiftProducts {
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
            totalInventory
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

// const VENDOR_PRODUCTS_QUERY = `#graphql
//   query VendorProducts {
//     products(first: 10) {
//       edges {
//         node {
//           id
//           title
//           handle
//           tags
//           vendor
//           descriptionHtml
//           images(first: 1) {
//             edges {
//               node {
//                 url
//               }
//             }
//           }
//           variants(first: 10) {
//             edges {
//               node {
//                 id
//                 title
//                 price {
//                   amount
//                   currencyCode
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// `;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */