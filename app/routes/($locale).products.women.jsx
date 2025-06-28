import { defer } from '@shopify/remix-oxygen';
import React from 'react';
import { Heart, Filter, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect, useMemo } from 'react'; // Add useMemo import
import { useLoaderData } from '@remix-run/react';
import { ProductFragment, PRODUCT_FIELDS_FRAGMENT } from '~/lib/fragments';
import { useAside } from '~/components/layout/Aside';
import { useSearchParams } from '@remix-run/react';
import GalleryProductCard from '~/components/products/GalleryProductCard';
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
    // console.log('Resolved Data in Loader:', womenProducts);
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
  const { open } = useAside();
  const [searchParams] = useSearchParams();
  const urlBrand = searchParams.get('brand');
  const urlTag = searchParams.get('tag');

  const [isOpen, setIsOpen] = useState(false);
  const brands = ['all brands', 'YSL', 'Bvlgari', 'Versace', 'Tiffany', 'Lattafa', 'Burberry', 'GUCCI', 'Givenchy', 'Valentino', 'Viktor & Rolf', 'Chloe', 'Prada', 'Carolina Herrera'];
  const tags = ['Minis'];
  const [selectedBrand, setSelectedBrand] = useState(urlBrand || "all brands");
  const [selectedTag, setSelectedTag] = useState(urlTag);
  const navigate = useNavigate();

  // Set selected brand from URL when component mounts or URL changes
  useEffect(() => {
    if (urlBrand) {
      setSelectedBrand(urlBrand);
    } else {
      setSelectedBrand("all brands");
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
      .sort((a, b) => { 
        if (a.node.vendor === b.node.vendor) 
          return a.node.title.localeCompare(b.node.title); 
        else 
          return a.node.vendor.localeCompare(b.node.vendor) 
      })
      .sort((a, b) => {
        return b.node.selectedOrFirstAvailableVariant.availableForSale - a.node.selectedOrFirstAvailableVariant.availableForSale;
      })
      
  }, [products]);

  // Memoize filteredProducts to prevent recalculation on every render
  const filteredProducts = useMemo(() => {
    if (selectedBrand) {
      if (selectedBrand === 'all brands') {
        return womenProducts;
      }
      return womenProducts
        .filter(({ node }) => node.vendor.toLowerCase() === selectedBrand.toLowerCase())
    } else if (selectedTag) {
      return womenProducts
        .filter(({ node }) => node.tags && node.tags.includes(selectedTag))
    } else {
      return womenProducts;
    }
  }, [womenProducts, selectedBrand, selectedTag]);

  const [sortedProducts, setSortedProducts] = useState(filteredProducts);

  return (
    <div className="flex flex-col md:gap-2">
      <GallerySortSection products={filteredProducts} brands={brands} setSortedProducts={setSortedProducts} ifbrand={false} location="women" />
      {/* Products grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6 pt-1 sm:p-4">
        {sortedProducts.length > 0 &&
          sortedProducts.map(({ node }) => (
            <GalleryProductCard key={node.id} node={node} />
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
${ProductFragment}
${PRODUCT_FIELDS_FRAGMENT} 
  query WomenProducts {
    collection(id: "gid://shopify/Collection/285176168553") {
      title
      id
      products(first: 100, filters:[{tag:"Women"}]) {
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