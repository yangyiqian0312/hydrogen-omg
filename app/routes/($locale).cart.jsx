import {useLoaderData} from '@remix-run/react';
import {CartForm} from '@shopify/hydrogen';
import {json} from '@shopify/remix-oxygen';
import {CartMain} from '~/components/CartMain';
import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from '@remix-run/react';
import { CUSTOMER_DETAILS_QUERY } from '~/graphql/customer-account/CustomerDetailsQuery';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: `Hydrogen | Cart`}];
};

/**
 * @param {LoaderFunctionArgs}
 * @returns {Promise<Response>}
 */
export async function loader({context}) {
  const {cart, customerAccount} = context;
  
  try {
    const isLoggedIn = await customerAccount.isLoggedIn();
    let customer = null;
    let accessToken = '';
    
    if (isLoggedIn) {
      accessToken = await customerAccount.getAccessToken();
      const { data } = await customerAccount.query(`#graphql
        query getCustomerDetails {
          customer {
            emailAddress{emailAddress}
            phoneNumber{phoneNumber}
          }
        }
      `);
      
      if (data && data.customer) {
        customer = data.customer;
      }
    }
    await cart.updateBuyerIdentity({
      customerAccessToken: isLoggedIn ? accessToken : '',
      email: customer?.emailAddress.emailAddress || '',
      phone: customer?.phoneNumber.phoneNumber || '',
      countryCode: 'US',
    });
    const cartData = await cart.get();

    return json({
      cart: cartData,
    });

  } catch (error) {
    console.error('Error in cart loader:', error);
    throw new Response('Internal Server Error', { status: 500 });
  }
}
     

/**
 * @param {ActionFunctionArgs}
 */
export async function action({request, context}) {
  const {cart, customerAccount} = context;
  
  // const isLoggedIn = await customerAccount.isLoggedIn();
  // if (isLoggedIn) {
  //   const accessToken = await customerAccount.getAccessToken();
  //   await cart.updateBuyerIdentity({
  //     customerAccessToken: accessToken,
  //   })
  // }

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = formDiscountCode ? [formDiscountCode] : [];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesUpdate: {
      const formGiftCardCode = inputs.giftCardCode;

      // User inputted gift card code
      const giftCardCodes = formGiftCardCode ? [formGiftCardCode] : [];

      // Combine gift card codes already applied on cart
      giftCardCodes.push(...inputs.giftCardCodes);

      result = await cart.updateGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return json(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}



export default function Cart() {
  /** @type {LoaderReturnData} */
  const {cart} = useLoaderData();
  
  return (
    <div className="cart">
      <h1>Cart</h1>
      <CartMain layout="page" cart={cart} />
    </div>
  );
}

/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/hydrogen').CartQueryDataReturn} CartQueryDataReturn */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
