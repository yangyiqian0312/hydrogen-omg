import { json, redirect } from '@shopify/remix-oxygen';

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({ request, context }) {
  const { cart, session } = context;
  try {
    const response = await context.customerAccount.login();
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return json({
      success: false,
      error: {
        message: 'Login failed. Please try again.',
        field: null
      }
    }, {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
