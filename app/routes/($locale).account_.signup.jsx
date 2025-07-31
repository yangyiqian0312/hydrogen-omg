import { json, redirect } from '@shopify/remix-oxygen';
import { createAdminApiClient } from '@shopify/admin-api-client';
import { useNavigate, useActionData, useLoaderData } from '@remix-run/react';
import SignupForm from '~/components/account/SignupForm';
import { useState } from 'react';

export async function loader({ context, request }) {
  const isLoggedIn = await context.customerAccount.isLoggedIn();
  if (isLoggedIn) {
    return redirect('/account/profile');
  }
  const url = new URL(request.url);
  const firstname = url.searchParams.get('firstname') || '';
  const email = url.searchParams.get('email') || '';
  const lastname = url.searchParams.get('lastname') || '';
  return json({ firstname, email, lastname });
}

export const action = async ({ request, context }) => {
  const body = await request.formData();
  const { firstName, lastName, email, phone, password, acceptsMarketing, acceptsUpdates, acceptsTerms } = Object.fromEntries(body);
  const client = createAdminApiClient({
    storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    apiVersion: '2025-04',
    accessToken: context.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
  });
  const mutation = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          email
          phone
          firstName
          lastName
          acceptsMarketing
        }
        customerUserErrors {
          field
          message
          code
        }
      }
    }
  `;

  const variables = {
    input: {
      firstName,
      lastName,
      email,
      phone: phone.startsWith('+1') ? phone : `+1${phone.replace(/\D/g, '')}`,
      password,
      acceptsMarketing: acceptsMarketing === 'on'||acceptsUpdates === 'on',
    },
  };

  try {
    const response = await context.storefront.mutate(mutation, { variables });
    const { customerCreate } = response;

    if (customerCreate?.customer) {
      // Sign in the customer
      await context.customerAccount.login();

      // update customer sms text marketing
      if (acceptsMarketing === 'on'||acceptsUpdates === 'on') {
        //customer id by identifier
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


        // Find user by email
        const adminRes = await client.request(adminQuery, {
          variables: {
            identifier: {
              emailAddress: email
            }
          }
        });
        const existingCustomer = adminRes?.data?.customer;
        console.log("customer id by identifier: ", existingCustomer.id);

        const mutation = `
            mutation customerSmsMarketingConsentUpdate($input: CustomerSmsMarketingConsentUpdateInput!) {
              customerSmsMarketingConsentUpdate(input: $input) {
                customer {
                  id
                  phone
                  smsMarketingConsent {
                    marketingState
                    marketingOptInLevel
                    consentUpdatedAt
                    consentCollectedFrom
                  }
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `;
        const variables = {
          input: {
            customerId: existingCustomer.id,
            smsMarketingConsent: {
              marketingState: acceptsMarketing === 'on' || acceptsUpdates === 'on' ? 'SUBSCRIBED' : 'NOT_SUBSCRIBED',
              marketingOptInLevel: acceptsMarketing === 'on' || acceptsUpdates === 'on' ? 'CONFIRMED_OPT_IN' : 'UNKNOWN',
            }
          },
        };
        try {
          const response3 = await client.request(mutation, { variables });
          const { customerSmsMarketingConsentUpdate } = response3.data;
          console.log("customer sms marketing consent updated: json", JSON.stringify(response3.data));
        } catch (error) {
          console.log("sms update error:", error);
        }
      }
      // Redirect to profile page
      return redirect('/account/profile');

    } else {
      const error = customerCreate?.customerUserErrors?.[0]?.message || customerCreate?.userErrors?.[0]?.message || 'Something went wrong';
      console.log(error);
      return json({
        success: false,
        error: {
          message: error,
          field: customerCreate?.customerUserErrors?.[0]?.field
        }
      }, {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.log(error);
    return json({
      success: false,
      error: {
        message: 'Request failed. Please try again later.',
        field: null
      }
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export default function SignupPage() {
  const navigate = useNavigate();
  const { firstname, email, lastname } = useLoaderData();
  return (
    <div>
      <h1 className="text-xl font-bold text-center">Create Account</h1>
      <SignupForm firstname={firstname} email={email} lastname={lastname} />
    </div>
  );
}
