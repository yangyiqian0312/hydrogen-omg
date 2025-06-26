import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';
import {useAside} from '~/components/layout/Aside';
import {CartLineItem} from '~/components/cart/CartLineItem';
import {CartSummary} from '~/components/cart/CartSummary';
import { useEffect } from 'react';

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 * @param {CartMainProps}
 */
export function CartMain({layout, cart: originalCart, isLoggedIn}) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${layout === 'page' ? '' : ' h-full'} ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity > 0;
  return (
    <div className={className}>
      <CartEmpty hidden={linesCount} layout={layout} />
      <div className="cart-details flex flex-col h-full">
        <div aria-labelledby="cart-lines" className="h-3/4 overflow-hidden">
          <ul className="h-full overflow-y-auto">
            {(cart?.lines?.nodes ?? []).map((line) => (
              <CartLineItem key={line.id} line={line} layout={layout} />
            ))}
          </ul>
        </div>
        {cartHasItems && <CartSummary cart={cart} layout={layout} isLoggedIn={isLoggedIn}/>}
      </div>
    </div>
  );
}

/**
 * @param {{
 *   hidden: boolean;
 *   layout?: CartMainProps['layout'];
 * }}
 */
function CartEmpty({hidden = false}) {
  const {close} = useAside();
  return (
    <div hidden={hidden} className="text-center p-6">
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />           
      <p className="text-lg text-black-600 my-4 font-bold">
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you started!
      </p>
      <br />
      <button className='inline-block bg-pink-200 text-white py-2 px-6 rounded-lg font-bold text-center hover: bg-pink-300 transition duration-300'>
        <Link 
          to="/" 
          onClick={close} 
          prefetch="viewport"
          className="inline-block text-pink-600 font-medium transition-colors duration-200"
        >
          Continue shopping →
        </Link>        
      </button>

    </div>
  );
}

/** @typedef {'page' | 'aside'} CartLayout */
/**
 * @typedef {{
 *   cart: CartApiQueryFragment | null;
 *   layout: CartLayout;
 * }} CartMainProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
