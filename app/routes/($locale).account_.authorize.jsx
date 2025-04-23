/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  const response = await context.customerAccount.authorize();
  return response;
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
