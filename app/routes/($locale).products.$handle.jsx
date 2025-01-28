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
import React, { useState, useEffect } from 'react';
import { ProductPrice } from '~/components/ProductPrice';
import { ProductImage } from '~/components/ProductImage';
import { ProductForm } from '~/components/ProductForm';
import { Heart, Truck, Store } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({ context, params }) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);


  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance in pixels
  const minSwipeDistance = 50;

  const nextImage = () => {
    setSelectedImage((prev) =>
      prev === product.images.edges.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? product.images.edges.length - 1 : prev - 1
    );
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.touches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      prevImage();
    }
  };


  /** @type {LoaderReturnData} */
  const { product } = useLoaderData();

  //console.log(product);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


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

  //console.log(productOptions);

  const MobileLayout = () => (
    <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col">
      {/* Mobile Image Section */}
      <div className="aspect-square w-full overflow-hidden">
        <div
          className="h-full"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex h-full transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${selectedImage * 100}%)`,
              width: `${product.images.edges.length * 100}%`
            }}
          >
            {product.images.edges.map((image, index) => (
              <div
                key={index}
                className="w-full h-full flex-shrink-0"
              >
                <img
                  src={image.node.url || '/api/placeholder/400/400'}
                  alt={`${product.product_name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 导航按钮 */}
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/3 -translate-y-1/2 z-10 bg-white/80 p-1 rounded-full shadow-md"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextImage}
          className="absolute right-2 top-1/3 -translate-y-1/2 z-10 bg-white/80 p-1 rounded-full shadow-md"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>


      {/* Mobile Product Info */}
      <div className="mt-4 space-y-3">
        <div>
          <h2 className="text-10px text-gray-500">{product.vendor}</h2>
          <h2 className="text-14px font-medium mt-1">{product.title}</h2>
          <p className="text-10px text-gray-600 mt-1">{product.category}</p>
        </div>

        <div className="text-xs">
          {product.selectedOrFirstAvailableVariant.availableForSale ? (
            <span className="text-green-600">In Stock</span>
          ) : (
            <span className="text-red-600">Out of Stock</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xl font-medium">
            ${product.selectedOrFirstAvailableVariant.price.amount}
          </span>
          <span className="text-base text-gray-500 line-through">
            ${product.selectedOrFirstAvailableVariant.compareAtPrice.amount}
          </span>
        </div>

        <div className="border rounded-lg p-3 space-y-3 bg-white">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <div>
              <p className="text-xs font-medium">Free Standard Delivery</p>
              <p className="text-xs text-gray-500">Arrives within 3-5 business days</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            <div>
              <p className="text-xs font-medium">Store Pickup</p>
              <p className="text-xs text-gray-500">Usually ready in 2 hours</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            className="flex-1 bg-black text-white rounded-lg text-sm font-medium py-3"
            disabled={product.stock_total === 0}
          >
            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
            />
          </button>
          <button className="p-3 border border-gray-200 rounded-lg">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-3 pt-6">
        <h3 className="text-base font-medium">Product Details</h3>
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            <span className="font-medium">SKU:</span>{' '}
            {product.selectedOrFirstAvailableVariant.sku}
          </p>
          <div className="mt-2">
            <div
              dangerouslySetInnerHTML={{
                __html: product.descriptionHtml,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const DesktopLayout = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product Images Section */}
        <div className="lg:w-2/3">
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="flex flex-col gap-3 w-20">
              {product.images.edges.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-lg overflow-hidden border-2 ${selectedImage === index
                    ? 'border-black'
                    : 'border-transparent'
                    }`}
                >
                  <img
                    src={image.node.url || '/api/placeholder/400/400'}
                    alt={`Product view ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1">
              <div className="relative aspect-square rounded-xl overflow-hidden">
                <img
                  src={
                    product.images.edges[selectedImage].node.url ||
                    '/api/placeholder/400/400'
                  }
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Info Section - Desktop */}
        <div className="lg:w-1/3 space-y-4">
          <div>
            <h2 className="text-sm text-gray-500">{product.vendor}</h2>
            <h1 className="text-2xl font-medium mt-1">{product.title}</h1>
            <p className="text-sm text-gray-600 mt-1">{product.category}</p>
          </div>

          <div className="text-sm">
            {product.selectedOrFirstAvailableVariant.availableForSale ? (
              <span className="text-green-600">In Stock</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-medium">
              ${product.selectedOrFirstAvailableVariant.price.amount}
            </span>
            <span className="text-lg text-gray-500 line-through">
              ${product.selectedOrFirstAvailableVariant.compareAtPrice.amount}
            </span>
          </div>

          <div className="border rounded-lg p-4 space-y-4 bg-white">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium">Free Standard Delivery</p>
                <p className="text-xs text-gray-500">
                  Arrives within 3-5 business days
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Store className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium">Store Pickup</p>
                <p className="text-xs text-gray-500">
                  Usually ready in 2 hours
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                className="flex-1 bg-black text-white rounded-lg font-medium hover:bg-gray-800 py-2"
                disabled={product.stock_total === 0}
              >
                <ProductForm
                  productOptions={productOptions}
                  selectedVariant={selectedVariant}
                />
              </button>
              <button className="p-3 border border-gray-200 rounded-lg hover:border-gray-300">
                <Heart className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-4 pt-6">
        <h3 className="font-medium">Product Details</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium">SKU:</span>{' '}
            {product.selectedOrFirstAvailableVariant.sku}
          </p>
          <div className="mt-2">
            <div
              dangerouslySetInnerHTML={{
                __html: product.descriptionHtml,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return isMobile ? <MobileLayout /> : <DesktopLayout />;

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
    images(first: 100) {
      edges {
        node {
          url
          altText
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

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
