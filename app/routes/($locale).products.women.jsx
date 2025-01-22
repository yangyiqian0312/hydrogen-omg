import React from 'react';
import {products} from '~/data/products';
import {defer} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import {useNavigate} from 'react-router-dom';
import {useRef, useState, useEffect} from 'react';
import {Heart, ChevronLeft, ChevronRight, Clock} from 'lucide-react';
import OldHeader from '~/components/OldHeader';

export const meta = () => {
  return [{title: 'OMG BEAUTY'}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = await loadDeferredData(args);

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
    context.storefront.query(WOMEN_PRODUCTS_QUERY),
    // Add other queries here, so that they are loaded in parallel
    context.storefront.query(WOMEN_PRODUCTS_QUERY),
  ]);

  return null;
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
async function loadDeferredData({context}) {
  // const allProducts = await context.storefront
  //   .query(ALL_PRODUCTS_QUERY)
  //   .catch((error) => {
  //     // Log query errors, but don't throw them so the page can still render
  //     console.error(error);
  //     return null;
  //   });
  try {
    const promotingProducts = await context.storefront.query(
      WOMEN_PRODUCTS_QUERY,
    );
    // Log the resolved data for debugging
    console.log('Resolved Data in Loader:', promotingProducts);
    return {
      promotingProducts: promotingProducts || null,
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

const Women = () => {
  const menProducts = products.filter((product) => product.category === 'Men');
  /** @type {LoaderReturnData} */
  const data = useLoaderData();

  const women = data.promotingProducts;
  console.log(women);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Women's Fragrances
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our refined collection of distinguished fragrances for men,
            featuring sophisticated scents from prestigious brands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {menProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No fragrances found</p>
              <p className="text-gray-400 mt-2">
                Please check back later for new arrivals
              </p>
            </div>
          ) : (
            women.products.edges.map(({node}) => (
              <Link
                key={node.id}
                //to={`/product-by-sku/${product.seller_sku}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden block"
              >
                <div className="p-4">
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
                    {node.images.edges.length > 0 ? (
                      <img
                        src={node.images.edges[0].node.url} // 使用第一张图片的 URL
                        alt={node.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src="/api/placeholder/400/400" // 占位图片
                        alt="Placeholder"
                        className="w-full h-full object-cover"
                      />
                    )}
                    {/* <img
                      src={
                        product.main_product_image || '/api/placeholder/400/400'
                      }
                      alt={product.product_name}
                      className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                    /> */}
                    <button
                      className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-50"
                      aria-label="Add to wishlist"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent navigation when clicking the heart
                        // Add wishlist functionality here
                      }}
                    >
                      <Heart className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                      {node.vendor}
                    </div>
                    <h2 className="font-medium text-gray-900 line-clamp-2 min-h-[48px]">
                      {node.title}
                    </h2>

                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-blue-600">
                        ${node.variants.edges[0].node.price.amount || 'N/A'}
                      </span>
                      {node.retailPrice &&
                        node.retailPrice > node.salePrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ${node.retailPrice}
                          </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {node.variants.edges[0].node.availableForSale ? (
                        <div className="text-sm text-emerald-600 flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          In Stock
                        </div>
                      ) : (
                        <div className="text-sm text-red-600 flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          Out of Stock
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const WOMEN_PRODUCTS_QUERY = `#graphql
  query Women {
  products(first: 100, query: "tag:Women") {
    edges {
      node {
        id
        title
        tags
        vendor
        descriptionHtml
        images(first: 10) {
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
              availableForSale
            }
          }
        }
      }
    }
  }
}
`;

export default Women;
