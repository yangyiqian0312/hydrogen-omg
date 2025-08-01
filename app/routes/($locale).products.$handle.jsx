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
import { ProductPrice } from '~/components/products/ProductPrice';
import { ProductForm } from '~/components/products/ProductForm';
import { ProductImage } from '~/components/products/ProductImage';
import { Heart, Truck, Store } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TrendingProductCard from '~/components/products/TrendingProductCard';
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

  // console.log(product);

  // console.log("recommendedProducts", recommendedProducts);

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
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); setSelectedMedia(0); setActiveSection(0); }, [product]);
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
      <div className="mx-auto px-4 py-4 sm:py-0 flex flex-col xl:flex-row xl:justify-center xl:gap-8 2xl:gap-12 h-full">
        <div className={`flex gap-1 md:gap-6 w-auto h-full justify-center ${selectedMedia >= images.length ? 'xl:pt-0' : 'xl:pt-12'}`}>
          {/* Thumbnails on the left */}
          <div className="relative w-32 md:w-40 xl:w-60 max-h-[calc(100vh-35rem)] xl:max-h-[calc(100vh-25rem)]">
            <div className="flex flex-col lg:gap-4 gap-1 p-2 w-full h-full overflow-y-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMedia(index)}
                  className={`flex-none rounded-lg overflow-hidden border-2 hover:scale-105 aspect-[1/1] w-full h-auto ${selectedMedia === index
                    ? 'border-black border-2 ring-gray-200 shadow-md'
                    : 'border-transparent'
                    } hover:border-gray-300`}
                >
                  <img
                    src={image.node.image?.url}
                    alt={image.node.image?.altText || `Product view ${index + 1}`}
                    className="w-full h-full aspect-[1/1]  object-cover "
                  />
                </button>
              ))}
              {videos.map((video, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMedia(images.length + index)}
                  className={`flex-none rounded-lg overflow-hidden border-2 transform hover:scale-105 aspect-square w-full h-auto ${selectedMedia === images.length + index
                    ? 'border-black border-2 ring-gray-200 shadow-md'
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
          </div>

          {/* Main Image on the right */}
          <div className="max-w-[calc(100vh-250px)]">
            <div className={`relative ${selectedMedia >= images.length ? 'aspect-[3/4]' : 'aspect-square'} max-h-[800px] w-auto rounded-xl overflow-hidden border border-gray-100 lg:shadow-md hover:shadow-lg transition-shadow duration-300`}>
              {images[selectedMedia] ? (
                <img
                  src={images[selectedMedia]?.node?.image?.url}
                  alt={images[selectedMedia]?.node?.image?.altText || `Product main view`}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 xl:p-8 p-2"
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
                  className="w-full h-full object-contain transition-transform duration-700 xl:p-8 p-2"
                />
              )}
            </div>
          </div>
        </div>

        {/* Product Info - right side on desktop */}
        <div className="mt-4 space-y-1 xl:mt-0 xl:w-1/3 h-full flex flex-col flex-none md:px-4">
          <div className="h-auto">
            <div className="text-xl md:text-2xl text-gray-500">{product.vendor}</div>
            <div className="text-xl md:text-2xl font-bold my-4">{product.title}</div>
            {/* <p className="text-10px text-gray-600 mt-1 lg:text-sm">{product.category}</p> */}
          </div>

          <div className="flex flex-col gap-2 w-full flex-none xl:max-w-sm ">
            <div className="flex xl:flex-col sm:flex-row flex-col gap-4 xl:gap-2 xl:justify-between">
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />
              {/* Delivery Image */}
              <div className="border rounded-lg p-4 bg-white xl:shadow-sm flex-none sm:-mt-4 xl:-mt-0" >
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5" />
                  <div>
                    <div className="text-sm md:text-md font-medium">Free Standard Delivery</div>
                    <div className="text-xs md:text-sm text-gray-500">
                      Arrives within 3-5 business days
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-2 w-full">
              <ProductForm
                productOptions={productOptions}
                selectedVariant={selectedVariant}
              />
            </div>
          </div>



          <div className="space-y-4 pt-2 xl:pt-4 xl:border-t xl:mt-4 flex-grow 2xl:max-h-[calc(100vh-20rem)] 2xl:overflow-hidden">
            {/* <h3 className="text-base font-medium lg:text-lg">Product Details</h3> */}
            <div className="space-y-2 text-xs text-gray-600 lg:text-sm">
              <div className="mt-2">
                {isClient ? (() => {
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
                              if (node.innerHTML.trim()) content.push(node.innerHTML);
                            }
                          }

                          // Start a new section
                          currentSection = {
                            heading: heading,
                            content: content
                          };
                        } else if (currentSection) {
                          // Add content to current section
                          currentSection.content.push(node.outerHTML);
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
                              className="w-full flex justify-between items-center py-1 text-left focus:outline-none"
                            >
                              <div
                                className="text-gray-900 text-lg md:text-xl"
                                style={{ fontFamily: 'archivo, sans-serif', fontStyle: 'bold', fontWeight: 700 }}>
                                {section.heading}
                              </div>
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
                              className={`overflow-y-auto transition-all duration-300 ${activeSection === index ? 'h-auto sm:max-h-32 xl:max-h-52' : 'h-0'
                                }`}
                            >
                              <div
                                className="p-2 text-gray-800 text-sm md:text-lg"
                                style={{ fontFamily: 'archivo, sans-serif', fontStyle: 'normal', fontWeight: 400 }}
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
                        style={{ fontFamily: 'archivo, sans-serif', fontStyle: 'normal', fontWeight: 400 }}
                        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                      />
                    );
                  }
                })() : (
                  // Server-side fallback
                  <div
                    className="text-gray-700 space-y-2"
                    style={{ fontFamily: 'archivo, sans-serif', fontStyle: 'normal', fontWeight: 400 }}
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* recommended products */}
      <div className="my-8 w-full h-full px-2 md:px-8 2xl:px-16">
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
