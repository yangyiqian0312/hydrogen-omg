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
  /** @type {LoaderReturnData} */
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData();
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
<div className="flex flex-col mb-6 pb-6 border-b border-gray-100">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
    <div>
      <span className="inline-block px-3 py-1 bg-blue-50 text-pink-300 rounded-full text-sm font-medium mb-3">
        Order {order.name}
      </span>
      <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
      <p className="text-gray-500 mt-2">
        Placed on {new Date(order.processedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>
    </div>
  </div>

  <div className="rounded-lg p-6 mt-6 bg-white">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th scope="col" className="py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">Product</th>
            <th scope="col" className="py-4 text-right font-semibold text-gray-700 text-sm uppercase tracking-wider">Price</th>
            <th scope="col" className="py-4 text-right font-semibold text-gray-700 text-sm uppercase tracking-wider">Quantity</th>
            <th scope="col" className="py-4 text-right font-semibold text-gray-700 text-sm uppercase tracking-wider">Total</th>
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
              <th scope="row" colSpan={3} className="py-4 text-left font-medium">Discounts</th>
              <td className="py-4 text-right font-medium">
                {discountPercentage ? (
                  <span>-{discountPercentage}% OFF</span>
                ) : (
                  discountValue && <Money data={discountValue} />
                )}
              </td>
            </tr>
          )}
          <tr className="border-t border-gray-200">
            <th scope="row" colSpan={3} className="py-4 text-left text-gray-600">Subtotal</th>
            <td className="py-4 text-right text-gray-600"><Money data={order.subtotal} /></td>
          </tr>
          <tr>
            <th scope="row" colSpan={3} className="py-4 text-left text-gray-600">Tax</th>
            <td className="py-4 text-right text-gray-600"><Money data={order.totalTax} /></td>
          </tr>
          <tr className="font-bold text-lg">
            <th scope="row" colSpan={3} className="py-4 text-left text-gray-900">Total</th>
            <td className="py-4 text-right text-gray-900"><Money data={order.totalPrice} /></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>

  <div className="grid md:grid-cols-2 gap-8 mb-8">
    <div className="rounded-lg p-6 bg-white">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Shipping Address
      </h3>
      {order?.shippingAddress ? (
        <address className="not-italic text-gray-600 bg-white p-4 rounded-lg border border-gray-100">
          <p className="font-medium text-gray-800 mb-2">{order.shippingAddress.name}</p>
          {order.shippingAddress.formatted && (
            <p className="mb-2">{order.shippingAddress.formatted}</p>
          )}
          {order.shippingAddress.formattedArea && (
            <p>{order.shippingAddress.formattedArea}</p>
          )}
        </address>
      ) : (
        <p className="text-gray-600 bg-white p-4 rounded-lg border border-gray-100">No shipping address defined</p>
      )}
    </div>
  </div>
</div>


      <div className="flex justify-center mt-10">
        <a
          target="_blank"
          href={order.statusPageUrl}
          rel="noreferrer"
          className="inline-flex items-center px-6 py-3 bg-pink-300 hover:bg-pink-400 text-white font-medium rounded-lg transition duration-150 ease-in-out"
        >
          Track Your Order
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}

/**
 * @param {{lineItem: OrderLineItemFullFragment}}
 */
function OrderLineRow({ lineItem }) {
  return (
    <tr key={lineItem.id}>
      <td>
        <div>
          {lineItem?.image && (
            <div>
              <Image data={lineItem.image} width={96} height={96} />
            </div>
          )}
          <div>
            <p>{lineItem.title}</p>
            <small>{lineItem.variantTitle}</small>
          </div>
        </div>
      </td>
      <td>
        <Money data={lineItem.price} />
      </td>
      <td>{lineItem.quantity}</td>
      <td>
        <Money data={lineItem.totalDiscount} />
      </td>
    </tr>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('customer-accountapi.generated').OrderLineItemFullFragment} OrderLineItemFullFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
