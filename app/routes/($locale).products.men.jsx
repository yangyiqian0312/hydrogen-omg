import { defer } from '@shopify/remix-oxygen';
import React from 'react';
import { Heart, Filter, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect, useMemo } from 'react';
import { useLoaderData } from '@remix-run/react';
import GalleryProductCard from '~/components/GalleryProductCard';

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

    // context.storefront.query(PROMOTING_PRODUCTS_QUERY),
    // context.storefront.query(TRENDING_PRODUCTS_QUERY),
    context.storefront.query(MEN_PRODUCTS_QUERY),
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

    const menProducts = await context.storefront.query(
      MEN_PRODUCTS_QUERY,
    );
    return {
      menProducts: menProducts || null,
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


const Men = (selectedVariant) => {
  const [searchParams] = useSearchParams();
  const urlBrand = searchParams.get('brand');


  const [isOpen, setIsOpen] = useState(false);
  const brands = ['all brands', 'Versace', 'Carolina Herrera', 'Jean Paul Gaultier', 'Prada', 'Bvlgari', 'Burberry', 'GUCCI', 'Givenchy', 'Tiffany', 'Lattafa', 'Giorgio Armani', 'Valentino', 'Viktor & Rolf', 'YSL'];
  const [selectedBrand, setSelectedBrand] = useState("all brands");
  const navigate = useNavigate();

  // Set selected brand from URL when component mounts or URL changes
  useEffect(() => {
    if (urlBrand) {
      setSelectedBrand(urlBrand);
    } else {
      setSelectedBrand("all brands");
    }
  }, [urlBrand]);


  const data = useLoaderData();

  const products = data.menProducts?.collection?.products?.edges || [];

  // Filter for products with "men" tag with extra logging
  const menProducts = useMemo(() => {
    return products
      .filter(({ node }) => node.tags && node.tags.includes('men'))
      .sort((a, b) => {
        if (a.node.vendor === b.node.vendor)
          return a.node.title.localeCompare(b.node.title);
        else
          return a.node.vendor.localeCompare(b.node.vendor)
      })
      .sort((a, b) => {
        return b.node.selectedOrFirstAvailableVariant.availableForSale - a.node.selectedOrFirstAvailableVariant.availableForSale;
      });
  }, [products]);




  const filteredProducts = useMemo(() => {
    if (selectedBrand === 'all brands') {
      return menProducts;
    }
    return selectedBrand
      ? menProducts.filter(
        ({ node }) => node.vendor.toLowerCase() === selectedBrand.toLowerCase()
      )
      : menProducts;
  }, [menProducts, selectedBrand]);

  const [sortedProducts, setSortedProducts] = useState(filteredProducts);
  const [sortOption, setSortOption] = useState('');
  useEffect(() => {
    setSortedProducts(filteredProducts);
    setSortOption('');
    console.log("filtered men products:", filteredProducts);
  }, [selectedBrand]);


  // // Update sortedProducts when filteredProducts changes
  // useEffect(() => {
  //   setSortedProducts(filteredProducts);
  //   setSortOption('');
  //   console.log("Sorted products:", sortedProducts);
  // }, [filteredProducts]);

  const handleSortChange = (sortOption) => {
    setSortOption(sortOption);
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

  const handleBrandChange = (brand) => {
    // navigate to /products/women?brand={brand}
    if (brand === 'all brands') {
      setSelectedBrand("all brands");
      navigate("/products/men");
    } else {
      setSelectedBrand(brand);
      navigate("/products/men?brand=" + brand);
    }
  };

  return (
    <div className="flex flex-col md:gap-2">
      <div className="flex justify-between md:p-4 pt-2 px-2 md:flex-row flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-500">Showing {sortedProducts.length} products</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-500">Sort by:</p>
          <select value={sortOption} onChange={(e) => handleSortChange(e.target.value)} className="border border-gray-200 rounded-md px-2 md:px-4 py-1">
            <option value="">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="new">Newest</option>
          </select>
        </div>
        <div className="flex lg:hidden items-center gap-2">
          <p className="text-sm font-medium text-gray-500">Select Brand:</p>
          {brands.length > 0 && <select value={selectedBrand} onChange={(e) => handleBrandChange(e.target.value)} className="border border-gray-200 rounded-md px-4 py-1">
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>}
        </div>
      </div>

      {/* Updated grid - 2 columns on mobile, 4 columns on desktop with increased spacing */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 p-4">
        {sortedProducts.length > 0 ? (
          sortedProducts.map(({ node }) => (
            <GalleryProductCard key={node.id} node={node} />
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

export default Men;

// const MEN_PRODUCTS_QUERY = `#graphql
//   query MenProducts {
//     products(first: 100, query: "tag:men") {
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

const MEN_PRODUCTS_QUERY = `#graphql
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
            createdAt
            abbrTitle: metafield(namespace: "custom", key: "abbrtitle") {
              id
              namespace
              key
              value
            }
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






/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */