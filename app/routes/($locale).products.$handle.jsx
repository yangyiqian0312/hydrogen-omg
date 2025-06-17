import { defer } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import React, { useState, useEffect, useRef } from 'react';
import { ProductPrice } from '~/components/ProductPrice';
import { ProductForm } from '~/components/ProductForm';
import { ProductImage } from '~/components/ProductImage';
import { Heart, Truck, Store } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TrendingProductCard from '~/components/TrendingProductCard';
/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({ data }) => {
  return [
    { title: `OMG BEAUTY | ${data?.product.title ?? ''}` },
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({ ...deferredData, ...criticalData });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({ context, params, request }) {
  const { handle } = params;
  const { storefront } = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{ product }] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: { handle, selectedOptions: getSelectedProductOptions(request) },
    }),

    // Add other queries here, so that they are loaded in parallel
  ]);

  console.log(product);

  if (!product?.id) {
    throw new Response(null, { status: 404 });
  }

  const recommendedProducts = await storefront.query(PRODUCT_RECOMMENDATIONS_QUERY, {
    variables: { productId: product.id },
  });

  return {
    product,
    recommendedProducts,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
async function loadDeferredData({ context, params, request }) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const { product, recommendedProducts } = useLoaderData();

  console.log(product);

  console.log("recommendedProducts", recommendedProducts);

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const { title, descriptionHtml } = product;

  // console.log(productOptions);

  const [selectedMedia, setSelectedMedia] = useState(0);
  const [activeSection, setActiveSection] = useState(null);
  const orderCarouselRef = useRef(null);

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

  // Access all media
  const allMedia = product.media?.edges || [];
  // Filter by media type
  const images = allMedia.filter(({ node }) => node.mediaContentType === 'IMAGE');
  const videos = allMedia.filter(({ node }) => node.mediaContentType === 'VIDEO');

  const getShopifyDirectVideoUrl = (videoSources) => {
    // Find the MP4 source
    const mp4Source = videoSources?.find(source => source.mimeType === 'video/mp4');
    if (!mp4Source) return null;
    
    // Extract video ID and create direct URL
    const match = mp4Source.url.match(/\/([a-f0-9]{32})\//);
    if (!match) return null;
    
    return `https://cdn.shopify.com/videos/c/o/v/${match[1]}.mp4`;
  };

  return (
    <div className="w-full flex flex-col">
      <div className="mx-auto px-4 py-4 flex flex-col xl:flex-row xl:justify-center xl:gap-8 xl:py-8 h-full">
        <div className="flex gap-6 w-auto h-full justify-center  ">
          {/* Thumbnails on the left */}
          <div className="flex flex-col gap-4 w-20 lg:w-28 2xl:w-36">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedMedia(index)}
                className={`rounded-lg overflow-hidden border-2 transition-all duration-200 transform hover:scale-105 ${selectedMedia === index
                  ? 'border-black ring-2 ring-gray-200 shadow-md'
                  : 'border-transparent'
                  } hover:border-gray-300`}
              >
                <img
                  src={image.node.image?.url}
                  alt={image.node.image?.altText || `Product view ${index + 1}`}
                  className="w-full aspect-square object-cover"
                />
              </button>
            ))}
            {videos.map((video, index) => (
              <button
                key={index}
                onClick={() => setSelectedMedia(images.length + index)}
                className={`rounded-lg overflow-hidden border-2 transition-all duration-200 transform hover:scale-105 ${selectedMedia === images.length + index
                  ? 'border-black ring-2 ring-gray-200 shadow-md'
                  : 'border-transparent'
                  } hover:border-gray-300`}
              >
                <div className="w-full h-full flex items-center justify-center absolute bottom-0 inset-0 text-xl text-white bg-black/30 hover:bg-black/60 transition">▶</div>
                <img
                  src={video.node.previewImage?.url}
                  alt={video.node.altText || `Product view ${index + 1}`}
                  className="w-full aspect-square object-cover"
                />
              </button>
            ))}
          </div>

          {/* Main Image on the right */}
          <div className="xl:max-w-[800px] max-w-[600px] w-full">
            <div className={`relative ${selectedMedia >= images.length ? 'aspect-[2/3]' : 'aspect-square'} max-h-[900px] w-full rounded-xl overflow-hidden border border-gray-100 lg:shadow-md hover:shadow-lg transition-shadow duration-300`}>
              {images[selectedMedia]? (
                <img
                  src={images[selectedMedia]?.node?.image?.url}
                  alt={images[selectedMedia]?.node?.image?.altText || `Product main view`}
                  className="w-full h-full max-w-[700px] object-cover transition-transform duration-700 hover:scale-105 xl:p-8 p-2"
                />
              ) : (
                <video
                  src={getShopifyDirectVideoUrl(videos[selectedMedia - images.length]?.node?.sources)}
                  controls
                  width="100%"
                  poster={videos[selectedMedia - images.length]?.node?.previewImage?.url}
                  onError={(e) => console.error('Video error:', e)}
                  onLoadStart={() => console.log('Video loading started')}
                  autoPlay
                  loop
                  className="w-full h-full object-contain transition-transform duration-700 hover:scale-105 xl:p-8 p-2"
                />
              )}
            </div>
          </div>
        </div>

        {/* Product Info - right side on desktop */}
        <div className="mt-4 space-y-1 xl:mt-0 xl:w-2/5 xl:pl-4 h-full flex flex-col flex-none">
          <div className="h-auto">
            <h2 className="text-10px text-gray-500 lg:text-sm">{product.vendor}</h2>
            <h2 className="text-14px font-medium mt-1 lg:text-xl lg:font-semibold">{product.title}</h2>
            <p className="text-10px text-gray-600 mt-1 lg:text-sm">{product.category}</p>
          </div>

          <div className="flex flex-col gap-2 w-full flex-none">
            <div className="flex items-center gap-2">
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />
            </div>
            <div className="pt-2 lg:pt-4 w-full">
              <ProductForm
                productOptions={productOptions}
                selectedVariant={selectedVariant}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4 bg-white lg:mt-6 lg:shadow-sm flex-none">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium">Free Standard Delivery</p>
                <p className="text-xs text-gray-500">
                  Arrives within 3-5 business days
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 lg:pt-8 lg:border-t lg:mt-8 flex-grow 2xl:max-h-[calc(100vh-20rem)] 2xl:overflow-hidden">
            <h3 className="text-base font-medium lg:text-lg">Product Details</h3>
            <div className="space-y-2 text-xs text-gray-600 lg:text-sm">
              <div className="mt-2">
                {typeof window !== 'undefined' ? (() => {
                  try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(product.descriptionHtml, 'text/html');
                    const body = doc.body;
                    const sections = [];
                    let currentSection = null;

                    // Process all child nodes of the body
                    Array.from(body.childNodes).forEach(node => {
                      if (node.nodeType === 1) { // Only process element nodes
                        // Check if it's a heading or a paragraph with strong text
                        if (/^H[1-6]$/i.test(node.nodeName) ||
                          (node.nodeName === 'P' && node.querySelector('strong'))) {

                          // If there's a current section, add it to sections
                          if (currentSection) {
                            sections.push(currentSection);
                          }

                          // Extract the strong text if it's a paragraph
                          let heading = node.textContent;
                          let content = [];

                          if (node.nodeName === 'P') {
                            const strongElement = node.querySelector('strong');
                            if (strongElement) {
                              heading = strongElement.textContent;
                              // Remove the strong element to avoid duplication
                              strongElement.remove();
                              // Add the remaining content
                              content.push(node.innerHTML);
                            }
                          }

                          // Start a new section
                          currentSection = {
                            heading: heading,
                            content: content
                          };
                        } else if (currentSection) {
                          // Add content to current section
                          currentSection.content.push(node.outerHTML || node.textContent);
                        }
                      }
                    });

                    // Add the last section if it exists
                    if (currentSection) {
                      sections.push(currentSection);
                    }

                    return (
                      <div className="space-y-3">
                        {sections.map((section, index) => (
                          <div key={index} className="border-b border-gray-200">
                            <button
                              onMouseOver={() => setActiveSection(activeSection === index ? null : index)}
                              className="w-full flex justify-between items-center py-2 text-left focus:outline-none"
                            >
                              <h3 className="text-base font-medium text-gray-900">
                                {section.heading}
                              </h3>
                              <svg
                                className={`w-5 h-5 text-gray-500 transform transition-transform ${activeSection === index ? 'rotate-180' : ''
                                  }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                            <div
                              className={`overflow-y-auto transition-all duration-300 ${activeSection === index ? 'h-36' : 'h-0'
                                }`}
                            >
                              <div
                                className="pb-4 text-gray-800 text-md lg:text-lg"
                                dangerouslySetInnerHTML={{ __html: section.content.join('') }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  } catch (error) {
                    console.error('Error parsing description:', error);
                    // Fallback to simple HTML rendering if parsing fails
                    return (
                      <div
                        className="text-gray-700 space-y-2"
                        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                      />
                    );
                  }
                })() : (
                  // Server-side fallback
                  <div
                    className="text-gray-700 space-y-2"
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* recommended products */}
      <div className="my-8 w-full h-full px-4 ">
        <h1 className="text-2xl font-medium mb-4">You may also like</h1>
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
            className="flex w-full overflow-x-auto h-auto snap-x gap-2 mx-2 hide-scrollbar scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {recommendedProducts.productRecommendations?.length > 0 && (
              <div className="flex gap-4 h-full">
                {recommendedProducts.productRecommendations.map((product) => (
                  <div
                    key={product.id}
                    className="flex-none py-2 my-2 max-w-[300px] h-full w-60 lg:w-64 2xl:w-1/4 border border-gray-200 rounded-lg overflow-hidden snap-start shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <TrendingProductCard
                      {...product}
                      className="flex flex-col w-full h-auto overflow-hidden"
                    />
                  </div>
                ))}

              </div>
            )}
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
  );

  // <div className="product">
  //   <ProductImage image={selectedVariant?.image} />
  //   <div className="product-main">
  //     <h1>{title}</h1>
  //     <ProductPrice
  //       price={selectedVariant?.price}
  //       compareAtPrice={selectedVariant?.compareAtPrice}
  //     />
  //     <br />
  //     <ProductForm
  //       productOptions={productOptions}
  //       selectedVariant={selectedVariant}
  //     />
  //     <br />
  //     <br />
  //     <p>
  //       <strong>Description</strong>
  //     </p>
  //     <br />
  //     <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
  //     <br />
  //   </div>
  //   <Analytics.ProductView
  //     data={{
  //       products: [
  //         {
  //           id: product.id,
  //           title: product.title,
  //           price: selectedVariant?.price.amount || '0',
  //           vendor: product.vendor,
  //           variantId: selectedVariant?.id || '',
  //           variantTitle: selectedVariant?.title || '',
  //           quantity: 1,
  //         },
  //       ],
  //     }}
  //   />
  // </div>
}


const PRODUCT_VARIANT_FRAGMENT = `#graphql
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
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    media(first: 10) {
      edges {
        node {
          id
          alt
          mediaContentType
          previewImage {
            url
            altText
          }
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
          ... on Video {
            id
            sources {
              format
              height
              mimeType
              url
              width
            }
            
          }
          presentation {
            id
          }
        }
      }
    }
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;
const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
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
query productRecommendations($country: CountryCode, $language: LanguageCode, $productId: ID!) @inContext(country: $country, language: $language) {
  productRecommendations(productId: $productId) {
      id
      title
      handle
      tags
      vendor
      description
      descriptionHtml
      featuredImage {
        url
        altText
      }
      images(first: 6) {
        edges {
          node {
            url
            altText
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
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
`;


/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
