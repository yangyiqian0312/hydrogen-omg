import { Link, useLoaderData } from '@remix-run/react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import { json } from '@shopify/remix-oxygen';
import { CUSTOMER_ORDERS_QUERY } from '~/graphql/customer-account/CustomerOrdersQuery';
import { PaginatedResourceSection } from '~/components/PaginatedResourceSection';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{ title: 'Orders' }];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({ request, context }) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const { data, errors } = await context.customerAccount.query(
    CUSTOMER_ORDERS_QUERY,
    {
      variables: {
        ...paginationVariables,
      },
    },
  );

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return json({ customer: data.customer });
}

export default function Orders() {
  /** @type {LoaderReturnData} */
  const { customer } = useLoaderData();
  const { orders } = customer;
  return (
    <div className="orders">
      {orders.nodes.length ? <OrdersTable orders={orders} /> : <EmptyOrders />}
    </div>
  );
}

/**
 * @param {Pick<CustomerOrdersFragment, 'orders'>}
 */
function OrdersTable({ orders }) {
  return (
    <div className="acccount-orders">
      {orders?.nodes.length ? (
        <PaginatedResourceSection connection={orders}>
          {({ node: order }) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders />
      )}
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <h2 className="text-xl font-medium text-gray-900 mb-6">
        You haven't placed any orders yet.
      </h2>
      <Link
        to="/"
        className="flex items-center justify-center bg-pink-200 text-gray-800 font-medium py-3 px-8 rounded-full w-64 transition-all duration-150 hover:bg-pink-300"
      >
        Continue shopping →
      </Link>
    </div>
  );
}


/**
 * @param {{order: OrderItemFragment}}
 */
function OrderItem({ order }) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  return (
    <>
      <fieldset>
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-3 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col">
              <Link
                to={`/account/orders/${btoa(order.id)}`}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                Order #{order.number}
              </Link>
              <div className="text-sm text-gray-500 mt-1">
                {new Date(order.processedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium 
        ${order.financialStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                  order.financialStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'}`}>
                {order.financialStatus}
              </span>

              {fulfillmentStatus && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium 
          ${fulfillmentStatus === 'FULFILLED' ? 'bg-blue-100 text-blue-800' :
                    fulfillmentStatus === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'}`}>
                  {fulfillmentStatus}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <div className="font-medium text-gray-900">
              <Money data={order.totalPrice} />
            </div>

            <Link
              to={`/account/orders/${btoa(order.id)}`}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              View Order
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </fieldset>
    </>
  );
}

/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('customer-accountapi.generated').CustomerOrdersFragment} CustomerOrdersFragment */
/** @typedef {import('customer-accountapi.generated').OrderItemFragment} OrderItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
