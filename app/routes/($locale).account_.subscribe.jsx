import { json} from '@shopify/remix-oxygen';
import {createAdminApiClient} from '@shopify/admin-api-client';
import Modal from '~/components/layout/Modal';
/**
 * Reusable mutation for both sign-up and subscription
 * https://github.com/Shopify/shopify-app-js/tree/main/packages/api-clients/admin-api-client#readme
 * 
 */
const CUSTOMER_CREATE_MUTATION = `
  mutation customerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        email
        emailMarketingConsent {
            marketingState
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
export function loader() {
    return null; 
}
export const action = async ({ request, context }) => {
    const client = createAdminApiClient({
        storeDomain: context.env.PUBLIC_STORE_DOMAIN,
        apiVersion: '2025-04',
        accessToken: context.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
      });
    const body = await request.formData();
    const email = body.get('email');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json(
            { success: false, error: 'Please enter a valid email address' },
            { 
                status: 400,
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    }

    // check if user is already subscribed
    const adminQuery = `
      query($identifier: CustomerIdentifierInput!) {
        customer: customerByIdentifier(identifier: $identifier) {
          id
          email
          defaultEmailAddress {
            emailAddress
            marketingState
            marketingUnsubscribeUrl
          }
        }
      }
    `;

    try {
        // Find user by email
        const adminRes = await client.request(adminQuery, {
            variables: {
                identifier: {
                    emailAddress: email
                }
            }
        });
        const existingCustomer = adminRes?.data?.customer;

        if (existingCustomer) {
            const marketingState = existingCustomer.defaultEmailAddress?.marketingState;

            if (marketingState === 'SUBSCRIBED') {
                return json(
                    {
                        success: false,
                        error: 'Email is already subscribed',
                        field: 'email'
                    },
                    {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
            }else{
                const beforeState =marketingState;
                const updateSubscriptionQuery = `
                    mutation customerEmailMarketingConsentUpdate($input: CustomerEmailMarketingConsentUpdateInput!) {
                        customerEmailMarketingConsentUpdate(input: $input) {
                         customer {
                                id
                                defaultEmailAddress{
                                    emailAddress
                                    marketingState
                                    marketingUnsubscribeUrl
                                }
                            }
                            userErrors {
                                field
                                message
                            }
                        }
                    }
                    `;

                const updateSubscription = await client.request(updateSubscriptionQuery, {
                    variables: {
                        input: {
                            customerId: existingCustomer.id,
                            emailMarketingConsent: {
                                marketingState: 'SUBSCRIBED',
                                marketingOptInLevel: 'CONFIRMED_OPT_IN',
                                consentUpdatedAt: new Date().toISOString(),
                            },
                        },
                    },
                });
                const response_updateSubscription = updateSubscription.data.customerEmailMarketingConsentUpdate;
                if (response_updateSubscription.userErrors.length > 0) {
                    return json(
                        { 
                            success: false, 
                            error: response_updateSubscription.userErrors[0].message 
                        },
                        { 
                            status: 400,
                            headers: { 'Content-Type': 'application/json' } 
                        }
                    );
                }else if (beforeState === 'UNSUBSCRIBED' && response_updateSubscription.customer?.defaultEmailAddress?.marketingState === 'SUBSCRIBED') {
                    return json(
                        { 
                            success: false, 
                            error: 'Thanks For Resubscription!' 
                        },
                        { 
                            status: 400,
                            headers: { 'Content-Type': 'application/json' } 
                        }
                    );
                } else if (response_updateSubscription.customer?.defaultEmailAddress?.marketingState === 'SUBSCRIBED') {
                    return json(
                        { 
                            success: true, 
                            data: response_updateSubscription 
                        },
                        { 
                            status: 200,
                            headers: { 'Content-Type': 'application/json' } 
                        }
                    );
                } else{
                    return json(
                        { 
                            success: true, 
                            data: response_updateSubscription 
                        },
                        { 
                            status: 400,
                            headers: { 'Content-Type': 'application/json' } 
                        }
                    );
                }
            }
        }
    } catch (error) {
        console.error('Subscription Found User error:', error);
        return json(
            {
                success: false,
                error: 'An error occurred while checking subscription status'
            },
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    const variables = {
        input: {
            email,
            emailMarketingConsent: {
                marketingState: 'PENDING',
                marketingOptInLevel: 'CONFIRMED_OPT_IN',
            },
        },
    };
    try {
        const response = await client.request(CUSTOMER_CREATE_MUTATION, { variables });
        const { data } = response;
        console.log('Subscription customerCreate:', data);

        if (data?.customerCreate?.customer) {
            return json(
                { success: true,
                  data: data.customerCreate.customer
                },
                { 
                    status: 200,
                    headers: { 'Content-Type': 'application/json' } 
                }
            );
        } else {
            const error = data?.customerCreate?.userErrors?.[0]?.message || 'Failed to subscribe';
            return json(
                { 
                    success: false, 
                    error: error
                },
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' } 
                }
            );
        }
    } catch (error) {
        console.error('Subscription error:', error);
        return json(
            { 
                success: false, 
                error: 'Something went wrong. Please try again.' 
            },
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    }
};
export default function Subscribe() {
    const [showModal, setShowModal] = useState(false);
    return <Modal onClose={() => setShowModal(false)} />;
}