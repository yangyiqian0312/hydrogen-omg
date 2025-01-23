import {CartForm, Image} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from '@remix-run/react';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';

//TODO: Cart aside UI change

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 * @param {{
 *   layout: CartLayout;
 *   line: CartLine;
 * }}
 */
export function CartLineItem({layout, line}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();

  return (
    <li key={id} className="cart-line flex items-center space-x-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-all duration-200 ease-in-out">
      {image && (
        <Image
          alt={title}
          aspectRatio="1/1"
          data={image}
          height={100}
          loading="lazy"
          width={100}
          className="rounded-lg shadow-sm"
        />
      )}

      <div className="flex-1">
        <Link
          prefetch="intent"
          to={lineItemUrl}
          onClick={() => {
            if (layout === 'aside') {
              close();
            }
          }}
          className="text-lg font-semibold text-gray-800 hover:text-pink-600 transition-colors duration-200 ease-in-out"
        >
          <p>
            <strong>{product.title}</strong>
          </p>
        </Link>
        <CartLineQuantity line={line} />
      </div>
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 * @param {{line: CartLine}}
 */
function CartLineQuantity({line}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex items-center space-x-2">
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label="Decrease quantity"
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
          className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-700 rounded-full disabled:bg-gray-300 disabled:text-gray-500 hover:bg-gray-300 transition-all duration-200 ease-in-out"
        >
          <span>&#8722;</span>
        </button>
      </CartLineUpdateButton>

      <span>{quantity}</span> {/* Quantity text */}

      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label="Increase quantity"
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic}
          className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-700 rounded-full disabled:bg-gray-300 disabled:text-gray-500 hover:bg-gray-300 transition-all duration-200 ease-in-out"
        >
          <span>&#43;</span>
        </button>
      </CartLineUpdateButton>

      <ProductPrice price={line?.cost?.totalAmount} />
      
      {/* Remove Item Button */}
      <CartLineRemoveButton 
        lineIds={[lineId]} 
        disabled={!!isOptimistic} 
        className="text-red-600 hover:text-red-800 transition-all duration-200"
      />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 * @param {{
 *   lineIds: string[];
 *   disabled: boolean;
 * }}
 */
function CartLineRemoveButton({lineIds, disabled}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        type="submit"
        className=" bg-pink-200 text-black py-2 px-3 rounded-lg font-bold text-center hover:bg-blue-700 transition duration-300"
      >
        Remove
      </button>
    </CartForm>
  );
}


/**
 * @param {{
 *   children: React.ReactNode;
 *   lines: CartLineUpdateInput[];
 * }}
 */
function CartLineUpdateButton({children, lines}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/** @typedef {OptimisticCartLine<CartApiQueryFragment>} CartLine */

/** @typedef {import('@shopify/hydrogen/storefront-api-types').CartLineUpdateInput} CartLineUpdateInput */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLine} OptimisticCartLine */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
