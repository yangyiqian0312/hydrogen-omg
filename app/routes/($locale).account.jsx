import { json } from '@shopify/remix-oxygen';
import { Form, NavLink, Outlet, useLoaderData } from '@remix-run/react';
import { CUSTOMER_DETAILS_QUERY } from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({ context }) {
  const { data, errors } = await context.customerAccount.query(
    CUSTOMER_DETAILS_QUERY,
  );

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return json(
    { customer: data.customer },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  /** @type {LoaderReturnData} */
  const { customer } = useLoaderData();

  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}`
      : `Welcome to your account.`
    : 'Account Details';

  return (
    <div className="account">
      <h1>{heading}</h1>
      <AccountMenu />
      <Outlet context={{ customer }} />
    </div>
  );
}

function AccountMenu() {
  function isActiveStyle({ isActive, isPending }) {
    return {
      fontWeight: isActive ? 'bold' : undefined,
      color: isPending ? 'grey' : 'black',
    };
  }

  return (
    <nav role="navigation" className="flex items-center justify-start space-x-8 py-4 mb-8">
      <NavLink
        to="/account/orders"
        className={({ isActive }) =>
          `text-base font-medium transition-colors duration-200 ${isActive
            ? 'text-black border-b-2 border-black'
            : 'text-gray-600 hover:text-black'
          }`
        }
      >
        Orders
      </NavLink>

      <NavLink
        className={({ isActive }) =>
          `text-base font-medium transition-colors duration-200 ${isActive
            ? 'text-black border-b-2 border-black'
            : 'text-gray-600 hover:text-black'
          }`
        }
        to="/account/profile"
      >
        Profile
      </NavLink>

      <Logout className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200" />
    </nav>
  );
}

function Logout() {
  return (
    <Form className="account-logout" method="POST" action="/account/logout">
      &nbsp;<button type="submit">Sign out</button>
    </Form>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */



