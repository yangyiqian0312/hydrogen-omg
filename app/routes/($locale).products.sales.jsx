import { defer } from '@shopify/remix-oxygen';
import React from 'react';
import { Heart, Filter, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRef, useState, useEffect, useMemo } from 'react';

import { useLoaderData } from '@remix-run/react';
import GalleryProductCard from '~/components/GalleryProductCard';


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
    context.storefront.query(SALES_PRODUCTS_QUERY),
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
    const salesProducts = await context.storefront.query(
      SALES_PRODUCTS_QUERY,
    );
    // const vendorProducts = await context.storefront.query(
    //   VENDOR_PRODUCTS_QUERY,
    // );
    // Log the resolved data for debugging
    console.log('Resolved Data in Loader:', salesProducts);
    return {
      salesProducts: salesProducts || null,
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


const Sales = (selectedVariant) => {
  const [isOpen, setIsOpen] = useState(false);
  const brands = ['Versace', 'Burberry', 'Gucci ', 'Valentino ', 'YSL', 'Viktor&Rolf'];
  const [selectedBrand, setSelectedBrand] = useState(null);


  const data = useLoaderData();

  const products = data.salesProducts?.collection?.products?.edges || [];
  console.log("Products before filtering:", products);


  // Filter for products with "men" tag with extra logging
  const salesProducts = useMemo(() => products.filter(({ node }) => {
    return node.tags && node.tags.includes('Sale');
  }).sort((a, b) => b.node.totalInventory - a.node.totalInventory), [products]);

  console.log("Filtered sales products:", salesProducts);


  const filteredProducts = useMemo(() => selectedBrand
    ? salesProducts.filter(
      ({ node }) => node.vendor.toLowerCase() === selectedBrand.toLowerCase()
    )
    : salesProducts, [salesProducts, selectedBrand]);



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
  const [sortedProducts, setSortedProducts] = useState(filteredProducts);
 const [sortOption, setSortOption] = useState('');
  // Update sortedProducts when filteredProducts changes
  useEffect(() => {
    setSortedProducts(filteredProducts);
    setSortOption('');
  }, [selectedBrand]);

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
    setSortOption(sortOption);
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
      </div>
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

export default Sales;

const SALES_PRODUCTS_QUERY = `#graphql
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
  query SalesProducts {
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

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */