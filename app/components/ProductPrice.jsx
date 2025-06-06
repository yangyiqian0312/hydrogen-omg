import {Money} from '@shopify/hydrogen';

/**
 * @param {{
 *   price?: MoneyV2;
 *   compareAtPrice?: MoneyV2 | null;
 * }}
 */
export function ProductPrice({price, compareAtPrice}) {
  const discount = compareAtPrice ? ((compareAtPrice.amount - price.amount) / compareAtPrice.amount) * 100 : 0;
  return (
    <div className="product-price">
      {compareAtPrice ? (
        <div className="product-price-on-sale text-2xl">
          {price ? <Money data={price} /> : null}
          <s>
            <Money data={compareAtPrice} />
          </s>
          <span className="ml-2 text-red-500 font-semibold">{discount.toFixed(0)}% OFF</span>
        </div>
      ) : price ? (
        <Money data={price} />
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */
