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
    <div className="max-w-4xl mx-auto p-6 rounded-lg shadow-md">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order {order.name}</h2>
        <p className="text-gray-600">Placed on {new Date(order.processedAt).toDateString()}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <table className="w-full">
          <thead className="border-b border-pink-200">
            <tr>
              <th scope="col" className="py-3 text-left">Product</th>
              <th scope="col" className="py-3 text-right">Price</th>
              <th scope="col" className="py-3 text-right">Quantity</th>
              <th scope="col" className="py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-100">
            {lineItems.map((lineItem, lineItemIndex) => (
              <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
            ))}
          </tbody>
          <tfoot className="border-t border-pink-200">
            {((discountValue && discountValue.amount) || discountPercentage) && (
              <tr className="text-pink-600">
                <th scope="row" colSpan={3} className="py-3 text-left">Discounts</th>
                <td className="py-3 text-right">
                  {discountPercentage ? (
                    <span>-{discountPercentage}% OFF</span>
                  ) : (
                    discountValue && <Money data={discountValue} />
                  )}
                </td>
              </tr>
            )}
            <tr>
              <th scope="row" colSpan={3} className="py-3 text-left">Subtotal</th>
              <td className="py-3 text-right"><Money data={order.subtotal} /></td>
            </tr>
            <tr>
              <th scope="row" colSpan={3} className="py-3 text-left">Tax</th>
              <td className="py-3 text-right"><Money data={order.totalTax} /></td>
            </tr>
            <tr className="font-semibold">
              <th scope="row" colSpan={3} className="py-3 text-left">Total</th>
              <td className="py-3 text-right"><Money data={order.totalPrice} /></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Shipping Address</h3>
          {order?.shippingAddress ? (
            <address className="not-italic text-gray-600">
              <p className="mb-2">{order.shippingAddress.name}</p>
              {order.shippingAddress.formatted && (
                <p className="mb-2">{order.shippingAddress.formatted}</p>
              )}
              {order.shippingAddress.formattedArea && (
                <p>{order.shippingAddress.formattedArea}</p>
              )}
            </address>
          ) : (
            <p className="text-gray-600">No shipping address defined</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Status</h3>
          <div className="inline-block px-4 py-2 bg-pink-100 text-pink-700 rounded-full">
            <p>{fulfillmentStatus}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <a
          target="_blank"
          href={order.statusPageUrl}
          rel="noreferrer"
          className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium"
        >
          View Order Status
          <span className="ml-2">→</span>
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
