import {Money} from '@shopify/hydrogen';

/**
 * @param {{
 *   price?: MoneyV2;
 *   compareAtPrice?: MoneyV2 | null;
 * }}
 */
export function ProductPrice({price, compareAtPrice, layout}) {
  const discount = compareAtPrice ? ((compareAtPrice.amount - price.amount) / compareAtPrice.amount) * 100 : 0;
  return (
    <div className="product-price">
      {compareAtPrice ? (
        <div className={`${layout != 'aside' ? 'md:text-xl' : 'text-sm'} product-price-on-sale text-red-500 font-semibold`}>
          {price ? <Money data={price} /> : null}
          <s className="text-gray-500">
            <Money data={compareAtPrice} />
          </s>
          <span className="ml-6 text-red-500 font-semibold bg-pink-100 px-4  rounded">{discount.toFixed(0)}% OFF</span>
        </div>
      ) : price ? (
        <div className={`${layout !== 'aside' ? 'md:text-xl' : 'text-sm'} product-price font-semibold`}>
          <Money data={price} />
        </div>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */
