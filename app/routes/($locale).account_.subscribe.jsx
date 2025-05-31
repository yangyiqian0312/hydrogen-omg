import { json} from '@shopify/remix-oxygen';
import {createAdminApiClient} from '@shopify/admin-api-client';
/**
 * Reusable mutation for both sign-up and subscription
 */
const CUSTOMER_CREATE_MUTATION = `
  mutation customerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        emailMarketingConsent {
            marketingState
        }
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`;

export const action = async ({ request, context }) => {
    const client = createAdminApiClient({
        storeDomain: context.env.PUBLIC_STORE_DOMAIN,
        apiVersion: '2025-04',
        accessToken: context.env.PUBLIC_ADMIN_API_ACCESS_TOKEN,
      });
    const body = await request.formData();
    const email = body.get('email');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json(
            { success: false, error: 'Please enter a valid email address' },
            { status: 400 }
        );
    }

    // check if user is already subscribed
    const adminQuery = `
        query getCustomerByEmail($query: String!) {
            customers(first: 1, query: $query) {
            edges {
                node {
                id
                email
                emailMarketingConsent {
                    marketingState
                }
                }
            }
            }
        }
        `;

    
    try {
        // find user by email
        const adminRes = await client.request(adminQuery,
            {
                variables: {
                    query: `email:${email}`,
                },
            });

        const existingCustomer = adminRes?.customers?.edges?.[0]?.node;

        if (existingCustomer) {
            const marketingState = existingCustomer.emailMarketingConsent?.marketingState;

            if (marketingState === 'SUBSCRIBED') {
                return json(
                    {
                        success: false,
                        error: {
                            message: 'Email already subscribed',
                            field: 'email',
                        },
                    },
                    {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
            }
        }
    } catch (error) {
        console.error('Subscription Found User error:', error);
    }

    const variables = {
        input: {
            email,
            emailMarketingConsent: {
                marketingState: 'SUBSCRIBED',
                consentUpdatedAt: new Date().toISOString(),
            },
        },
    };
    try {
        const response = await client.request(CUSTOMER_CREATE_MUTATION, { variables });
        const { customerCreate } = response;

        if (customerCreate?.customer) {
            return json({ success: true });
        } else {
            const error = customerCreate?.customerUserErrors?.[0]?.message || 'Failed to subscribe';
            return json(
                { success: false, error },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Subscription error:', error);
        return json(
            { success: false, error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
};
