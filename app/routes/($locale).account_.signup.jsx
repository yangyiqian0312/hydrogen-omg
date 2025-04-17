import { json, redirect } from '@shopify/remix-oxygen';
import { useNavigate, useActionData, useLoaderData } from '@remix-run/react';
import SignupForm from '~/components/SignupForm';
import { useState } from 'react';

export async function loader({ context }) {
  const isLoggedIn = await context.customerAccount.isLoggedIn();
  if (isLoggedIn) {
    return redirect('/account/profile');
  }
  return json({});
}

export const action = async ({ request, context }) => {
    const body = await request.formData();
    const { firstName, lastName, email, phone, password, acceptsMarketing } = Object.fromEntries(body);

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
            acceptsMarketing: acceptsMarketing === 'on',
        },
    };

    try {
        const response = await context.storefront.mutate(mutation, { variables });
        const { customerCreate } = response;

        if (customerCreate?.customer) {
            // Sign in the customer
            await context.customerAccount.login();
            
            // Redirect to profile page
            return redirect('/account/profile');
        } else {
            const error = customerCreate?.customerUserErrors?.[0]?.message || 'Something went wrong';
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
    return (
      <div>
        <h1 className="text-xl font-bold text-center">Create Account</h1>
        <SignupForm />
      </div>
    );
}
