import { defer } from '@shopify/remix-oxygen';
import React from 'react';
import { Heart, Filter, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect, useMemo } from 'react';
import { useLoaderData } from '@remix-run/react';
import GalleryProductCard from '~/components/products/GalleryProductCard';
import { ProductFragment, PRODUCT_FIELDS_FRAGMENT } from '~/lib/fragments';
import GallerySortSection from '~/components/products/GallerySortSection';
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
  try {
    const giftProducts = await context.storefront.query(
      GIFT_PRODUCTS_QUERY,
    );
    // Log the resolved data for debugging
    return {
      giftProducts: giftProducts || null,
    };
  } catch (error) {
    // Log query errors, but don't throw them so the page can still render
    console.error(error);
    return null;
  }
}


const Giftsets = (selectedVariant) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const data = useLoaderData();

  const products = data.giftProducts?.collection?.products?.edges || [];
  // Filter for products with "men" tag with extra logging
  const giftProducts = useMemo(() => products
    .sort((a, b) => {
      if (a.node.vendor === b.node.vendor)
        return a.node.title.localeCompare(b.node.title);
      else
        return a.node.vendor.localeCompare(b.node.vendor)
    })
    .sort((a, b) => {
      return b.node.selectedOrFirstAvailableVariant.availableForSale - a.node.selectedOrFirstAvailableVariant.availableForSale;
    })
    , [products]);

  const brands = useMemo(() => {
    const vendors = [...new Set(giftProducts.map(({ node }) => node.vendor[0] + node.vendor.slice(1).toLowerCase()))].sort();
    return ['all brands', ...vendors];
  }, [giftProducts]);

  // console.log("Filtered gift set products:", giftProducts);

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
  const [sortedProducts, setSortedProducts] = useState(giftProducts);
  
  return (
    <div className="flex flex-col md:gap-2">
      <GallerySortSection products={giftProducts} brands={brands} setSortedProducts={setSortedProducts} ifbrand={true} location={"giftsets"} />

      {/* Updated grid - 2 columns on mobile, 4 columns on desktop with increased spacing */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pt-1 md:gap-4 m:p-4">
        {sortedProducts.length > 0 ? (
          sortedProducts.map(({ node }) => (
            <GalleryProductCard key={node.id} node={node} />
          ))
        ) : (
          <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-8 text-gray-500">
            No products found
          </div>
        )}
      </div>
    </div>


  );
};

export default Giftsets;

const GIFT_PRODUCTS_QUERY = `#graphql
${ProductFragment}
${PRODUCT_FIELDS_FRAGMENT} 
  query GiftProducts {
    collection(id: "gid://shopify/Collection/285176168553") {
      title
      id
      products(first: 100, filters:[{tag:"Gift Sets & Minis"}]) {
        edges {
          node {
            ...ProductFields
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