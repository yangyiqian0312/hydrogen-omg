import { defer } from '@shopify/remix-oxygen';
import React from 'react';
import { Heart, Filter, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRef, useState, useEffect, useMemo } from 'react'; // Add useMemo import

import { useLoaderData } from '@remix-run/react';
import { AddToCartButton } from '~/components/AddToCartButton';

import { useSearchParams } from '@remix-run/react';

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
    context.storefront.query(WOMEN_PRODUCTS_QUERY),
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

    const womenProducts = await context.storefront.query(
      WOMEN_PRODUCTS_QUERY,
    );
    // const vendorProducts = await context.storefront.query(
    //   VENDOR_PRODUCTS_QUERY,
    // );
    // Log the resolved data for debugging
    console.log('Resolved Data in Loader:', womenProducts);
    return {
      womenProducts: womenProducts || null,
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


const Women = (selectedVariant) => {

  const [searchParams] = useSearchParams();
  const urlBrand = searchParams.get('brand');
  const urlTag = searchParams.get('tag');

  const [isOpen, setIsOpen] = useState(false);
  const brands = ['all brands', 'YSL', 'Bvlgari', 'Versace', 'Tiffany', 'Lattafa', 'Burberry', 'GUCCI', 'Givenchy', 'Valentino', 'Viktor & Rolf', 'Chloe', 'Prada', 'Carolina Herrera'];
  const tags = ['Minis'];
  const [selectedBrand, setSelectedBrand] = useState(urlBrand);
  const [selectedTag, setSelectedTag] = useState(urlTag);

  // Set selected brand from URL when component mounts or URL changes
  useEffect(() => {
    if (urlBrand) {
      setSelectedBrand(urlBrand);
    } else {
      setSelectedBrand(null);
    }
    if (urlTag) {
      setSelectedTag(urlTag);
    } else {
      setSelectedTag(null);
    }
  }, [urlBrand, urlTag]);

  const data = useLoaderData();

  const products = data.womenProducts?.collection?.products?.edges || [];

  // Memoize womenProducts to prevent recalculation on every render
  const womenProducts = useMemo(() => {
    return products
      .filter(({ node }) => node.tags && node.tags.includes('Women'))
      .sort((a, b) => { 
        if (a.node.vendor === b.node.vendor) 
          return a.node.title.localeCompare(b.node.title); 
        else 
          return a.node.vendor.localeCompare(b.node.vendor) 
      });
  }, [products]);

  // Memoize filteredProducts to prevent recalculation on every render
  const filteredProducts = useMemo(() => {
    if (selectedBrand) {
      return womenProducts
        .filter(({ node }) => node.vendor.toLowerCase() === selectedBrand.toLowerCase())
        .sort((a, b) => b.node.totalInventory - a.node.totalInventory);
    } else if (selectedTag) {
      return womenProducts
        .filter(({ node }) => node.tags && node.tags.includes(selectedTag))
        .sort((a, b) => b.node.totalInventory - a.node.totalInventory);
    } else {
      return womenProducts;
    }
  }, [womenProducts, selectedBrand, selectedTag]);

  const [sortedProducts, setSortedProducts] = useState(filteredProducts);

  // Update sortedProducts when filteredProducts changes
  useEffect(() => {
    setSortedProducts(filteredProducts);
  }, [filteredProducts]);

  const handleSortChange = (sortOption) => {
    if (sortOption === 'price-asc') {
      setSortedProducts([...filteredProducts].sort((a, b) =>
        a.node.variants.edges[0].node.price.amount - b.node.variants.edges[0].node.price.amount
      ));
    } else if (sortOption === 'price-desc') {
      setSortedProducts([...filteredProducts].sort((a, b) =>
        b.node.variants.edges[0].node.price.amount - a.node.variants.edges[0].node.price.amount
      ));
    } else if (sortOption === 'new') {
      setSortedProducts([...filteredProducts].sort((a, b) =>
        b.node.createdAt.localeCompare(a.node.createdAt)
      ));
    } else {
      setSortedProducts(filteredProducts);
    }
  };

  return (
    <div className="flex flex-col md:gap-2">
      <div className="flex items-center hidden">
        <div className="relative">
          {/* <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-full shadow-sm border border-gray-200 transition-all duration-200"
            >
              <span className="font-medium text-gray-700">
                {selectedBrand || 'Shop by brand'}
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button> */}

          {/* Brand dropdown menu */}
          {/* {isOpen && (
              <div className="absolute top-full left-4 mt-2 w-52 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                <div className="px-4 py-1 mb-1 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  Brands
                </div>
                <button
                  onClick={() => {
                    setSelectedBrand(null);
                    setIsOpen(false);
                    // Navigate to base URL without brand parameter
                    window.history.pushState({}, "", "/products/women");
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
                >
                  <span className="font-medium">All Brands</span>
                  {selectedBrand === null && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => {
                      setSelectedBrand(brand);
                      setIsOpen(false);
                      // Update URL with selected brand parameter
                      window.history.pushState({}, "", `/products/women?brand=${encodeURIComponent(brand)}`);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
                  >
                    <span>{brand}</span>
                    {selectedBrand === brand && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                  </button>
                ))}
              </div>
            )} */}
        </div>
      </div>
      <div className="flex justify-between md:p-4 pt-2 px-2 md:flex-row flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-500">Showing {sortedProducts.length} products</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-500">Sort by:</p>
          <select onChange={(e) => handleSortChange(e.target.value)} className="border border-gray-200 rounded-md px-4 py-1">
            <option value="" selected>Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="new">Newest</option>
          </select>
        </div>
      </div>
      {/* Products grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 p-4">
        {sortedProducts.length > 0 &&
          sortedProducts.map(({ node }) => (
            <Link
              to={`/products/${node.handle}`}
              key={node.id}
              className="rounded-lg flex flex-col overflow-hidden shadow-lg shadow-gray-300 hover:shadow-md transition-shadow duration-300"
            >
              {/* Product card content remains the same */}
              <div className="relative aspect-square p-1">
                {node.images.edges[0] ? (
                  <img
                    src={node.images.edges[0].node.url}
                    alt={node.title}
                    className="w-full aspect-square object-contain"
                  />
                ) : (
                  <img
                    src="/api/placeholder/400/400"
                    alt="Placeholder"
                    className="w-full aspect-square object-contain"
                  />
                )}
              </div>

              <div className="p-3 flex flex-col h-full justify-between">
                <div
                  className="block"
                >
                  <div className="font-semibold text-black uppercase hover:underline truncate">
                    {node.vendor || 'Unknown Brand'}
                  </div>
                  <p className="text-sm font-normal mb-2 text-gray-800 overflow-hidden 
                    h-auto max-h-12
                    line-clamp-2">
                    {node.abbrTitle?.value
                      ? node.abbrTitle.value
                      : node.title.replace(new RegExp(`^${node.vendor}\\s*`), '')}
                  </p>
                </div>

                <div className='pt-1'>
                  <p className={`font-bold ${node.variants.edges[0]?.node.compareAtPrice ? 'text-red-500' : ''}`}>
                    ${Number(node.variants.edges[0]?.node.price.amount || 0).toFixed(2)}
                    {node.variants.edges[0]?.node.compareAtPrice && (
                      <span className="ml-2 text-gray-500 line-through">
                        ${Number(node.variants.edges[0]?.node.compareAtPrice.amount || 0).toFixed(2)}
                      </span>
                    )}
                  </p>
                  <div className="2xl:flex 2xl:justify-end 2xl:flex-none 2xl:pr-4 py-2 2xl:py-0">
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
              </div>
            </Link>
          ))
        }

        {sortedProducts.length == 0 && (
          <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-8 text-gray-500">
            No products found for {selectedBrand ? selectedBrand : 'Women Collection'}
          </div>
        )}

      </div>
    </div>
  );
};

export default Women;

// const WOMEN_PRODUCTS_QUERY = `#graphql
//   query WomenProducts {
//     products(first: 100, query: "tag:Women") {
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

const WOMEN_PRODUCTS_QUERY = `#graphql
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
  query WomenProducts {
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
            totalInventory
            descriptionHtml
            images(first: 6) {
              edges {
                node {
                  url
                }  
              } 
            }
            abbrTitle: metafield(namespace: "custom", key: "abbrtitle") {
              id
              namespace
              key
              value
            }
            createdAt
            selectedOrFirstAvailableVariant {
              ...ProductVariant
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