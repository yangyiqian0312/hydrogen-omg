import { json, redirect } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';
import { Money, Image, flattenConnection } from '@shopify/hydrogen';
import { CUSTOMER_ORDER_QUERY } from '~/graphql/customer-account/CustomerOrderQuery';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({ data }) => {
  return [{ title: `Order ${data?.order?.name}` }];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({ params, context }) {
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const { data, errors } = await context.customerAccount.query(
    CUSTOMER_ORDER_QUERY,
    {
      variables: { orderId },
    },
  );

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const { order } = data;

  const lineItems = flattenConnection(order.lineItems);
  const discountApplications = flattenConnection(order.discountApplications);

  const fulfillmentStatus =
    flattenConnection(order.fulfillments)[0]?.status ?? 'N/A';

  const firstDiscount = discountApplications[0]?.value;

  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' && firstDiscount;

  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue' &&
    firstDiscount?.percentage;

  return json({
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  });
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData();
  return (
    <div className="max-w-4xl mx-auto p-2 bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1 pb-2 border-b border-gray-100">
        <div>
          {/* <span className="inline-block px-3 py-1 text-gray-700 bg-gray-100 rounded-full text-sm font-medium mb-2">
            Order {order.name}
          </span> */}
          <h2 className="text-xs font-bold text-gray-900">Order Details</h2>
          <p className="text-gray-500 text-xs mt-0.5 opacity-75">
            Placed on {new Date(order.processedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      <div className="rounded-lg p-2 mb-3">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-700 text-xs">Product</th>
                <th className="text-left py-2 text-gray-700 text-xs">Price</th>
                <th className="text-right py-2 text-gray-700 text-xs">Quantity</th>
                <th className="text-right py-2 text-gray-700 text-xs">Discount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lineItems.map((lineItem, lineItemIndex) => (
                <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
              ))}
            </tbody>
            <tfoot>
              {((discountValue && discountValue.amount) || discountPercentage) && (
                <tr className="text-green-600">
                  <th scope="row" colSpan={3} className="py-1 text-left font-medium text-xs">Discounts</th>
                  <td className="py-1 text-right font-medium text-xs">
                    {discountPercentage ? (
                      <span>-{discountPercentage}% OFF</span>
                    ) : (
                      discountValue && <Money data={discountValue} />
                    )}
                  </td>
                </tr>
              )}
              <tr className="border-t border-gray-200">
                <th scope="row" colSpan={3} className="py-1 text-left text-gray-600 text-xs">Subtotal</th>
                <td className="py-1 text-right text-gray-600 text-xs"><Money data={order.subtotal} /></td>
              </tr>
              <tr>
                <th scope="row" colSpan={3} className="py-1 text-left text-gray-600 text-xs">Tax</th>
                <td className="py-1 text-right text-gray-600 text-xs"><Money data={order.totalTax} /></td>
              </tr>
              <tr className="font-bold text-lg">
                <th scope="row" colSpan={3} className="py-2 text-left text-gray-900 text-sm">Total</th>
                <td className="py-2 text-right text-gray-900 text-xs"><Money data={order.totalPrice} /></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        {console.log("Order status URL:", order.statusPageUrl)}
        <a
          target="_blank"
          href={order.statusPageUrl}
          rel="noreferrer"
          className="inline-flex items-center px-3 py-1.5 bg-pink-200 hover:bg-pink-300 text-white text-xs font-medium rounded-lg transition duration-150 ease-in-out"
        >
          Track Your Order
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function OrderLineRow({ lineItem }) {
  return (
    <tr key={lineItem.id}>
      <td className="py-2">
        <div className="flex items-center">
          {lineItem?.image && (
            <div className="mr-3">
              <Image data={lineItem.image} width={80} height={80} />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{lineItem.title}</p>
            {/* <small className="text-gray-600">{lineItem.variantTitle}</small> */}
          </div>
        </div>
      </td>
      <td className="py-2 text-right text-gray-600 text-sm">
        <Money data={lineItem.price} />
      </td>
      <td className="py-2 text-right text-sm">{lineItem.quantity}</td>
      <td className="py-2 text-right text-gray-600 text-sm">
        <Money data={lineItem.totalDiscount} />
      </td>
    </tr>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('customer-accountapi.generated').OrderLineItemFullFragment} OrderLineItemFullFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
