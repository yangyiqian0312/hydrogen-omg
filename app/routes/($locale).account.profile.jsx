import { CUSTOMER_ADDRESS_UPDATE_MUTATION,CUSTOMER_ADDRESS_DEFAULT_MUTATION, CUSTOMER_ADDRESS_CREATE_MUTATION } from '~/graphql/customer-account/CustomerAddressMutations';
import { CUSTOMER_UPDATE_MUTATION } from '~/graphql/customer-account/CustomerUpdateMutation';
import { json } from '@shopify/remix-oxygen';
import { useState } from 'react';
import usStates from '~/data/usStates';
import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from '@remix-run/react';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{ title: 'Profile' }];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({ context }) {
  await context.customerAccount.handleAuthStatus();

  return json({});
}

/**
 * @param {ActionFunctionArgs}
 */
export async function action({ request, context }) {
  const { customerAccount } = context;

  if (request.method !== 'PUT') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const form = await request.formData();

  try {
    const customer = {};
    const address = {};

    // Define all valid input keys
    const validInputKeys = [
      'firstName', 'lastName', // Customer fields
      'address1', 'address2', 'city', 'zoneCode', 'zip', 'territoryCode', 'phoneNumber' // Address fields
    ];

    // Process form entries
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key)) {
        continue;
      }

      if (typeof value === 'string' && value.length) {
        // Handle customer fields
        if (['firstName', 'lastName'].includes(key)) {
          customer[key] = value;
        }
        // Handle address fields
        else {
          address[key] = value;
        }
      }
    }

    // If we have address data, update or create the default address
    if (Object.keys(address).length > 0) {

      address.zoneCode = form.get('zoneCode');
      address.territoryCode = 'US';

      // Copy phone number from customer if not provided
      if (!address.phoneNumber && customer.phoneNumber?.phoneNumber) {
        address.phoneNumber = customer.phoneNumber.phoneNumber;
      }

      // Use create mutation if there's no existing address
      // const mutation = customer.defaultAddress?.id 
      //   ? CUSTOMER_ADDRESS_DEFAULT_MUTATION 
      //   : CUSTOMER_ADDRESS_CREATE_MUTATION;

      const { data: addressData, errors: addressErrors } = await customerAccount.mutate(
        CUSTOMER_ADDRESS_DEFAULT_MUTATION,
        {
          variables: {
            address: {
              ...address,
              customerAccessToken: customerAccount.accessToken
            },
            addressId: customer.defaultAddress?.id,
            defaultAddress: true
          }
        }
      );

      if (addressErrors?.length) {
        throw new Error('Failed to update address');
      }
    }

    // Update customer information
    const { data, errors } = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
        },
      },
    );

    if (errors?.length) {
      throw new Error('Failed to update customer information');
    }

    return json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return json({
      error: 'Failed to update profile. Please try again.'
    }, { status: 400 });
  }
}

export default function AccountProfile() {
  const account = useOutletContext();
  const { state } = useNavigation();
  /** @type {ActionReturnData} */
  const action = useActionData();
  const customer = action?.customer ?? account?.customer;
  console.log(customer)
 
  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900">My Profile</h2>

      <Form method="PUT" className="space-y-8">
        <div>
          <legend className="text-lg font-medium text-gray-900 mb-6">
            Personal Information
          </legend>

          <fieldset className="grid grid-cols-1 gap-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                aria-label="First name"
                defaultValue={customer.firstName ?? ''}
                minLength={2}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Last name"
                aria-label="Last name"
                defaultValue={customer.lastName ?? ''}
                minLength={2}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Phone number"
                aria-label="Phone number"
                defaultValue={customer.phoneNumber?.phoneNumber ?? ''}
                className="block w-full rounded-md border-gray-200 shadow-sm bg-gray-100 sm:text-sm"
                readOnly
              />
            </div>
          </fieldset>

          <legend className="text-lg font-medium text-gray-900 mb-6">
            Default Address Information
          </legend>

          <fieldset className="grid grid-cols-1 gap-6">
            <div>
              <label
                htmlFor="address1"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Address Line 1
              </label>
              <input
                id="address1"
                name="address1"
                type="text"
                autoComplete="address-line1"
                placeholder="Street address"
                aria-label="Address line 1"
                defaultValue={customer.defaultAddress?.address1 ?? ''}
                readOnly
                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="address2"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Address Line 2
              </label>
              <input
                id="address2"
                name="address2"
                type="text"
                autoComplete="address-line2"
                placeholder="Apt, suite, etc."
                aria-label="Address line 2"
                defaultValue={customer.defaultAddress?.address2 ?? ''}
                readOnly
                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                autoComplete="address-level2"
                placeholder="City"
                aria-label="City"
                defaultValue={customer.defaultAddress?.city ?? ''}
                readOnly
                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                State
              </label>
               <select
                  id="state"
                  name="zoneCode"
                  className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm"
                  defaultValue={customer.defaultAddress?.zoneCode ?? ''}
                  readOnly
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <option value="" className="text-lg">Select a state</option>
                  {usStates.map((state) => (
                    <option key={state.code} value={state.code} className="text-lg">
                      {state.name}
                    </option>
                  ))}
                </select>
            </div>

            <div>
              <label
                htmlFor="zip"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ZIP Code
              </label>
              <input
                id="zip"
                name="zip"
                type="text"
                autoComplete="postal-code"
                placeholder="ZIP code"
                aria-label="ZIP code"
                defaultValue={customer.defaultAddress?.zip ?? ''}
                readOnly
                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm"
              />
            </div>


            {/* <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number
              </label
              >
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Phone number"
                aria-label="Phone number"
                defaultValue={customer.defaultAddress?.phoneNumber ?? ''}
                readOnly
                className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm"
              />
            </div> */}
          </fieldset>
        </div>

        {action?.error ? (
          <p className="bg-red-50 border border-red-200 rounded-md p-4">
            <small className="text-red-600">{action.error}</small>
          </p>
        ) : null}

        <button
          type="submit"
          disabled={state !== 'idle'}
          className={`
       inline-flex justify-center rounded-md border border-transparent px-4 py-1 text-sm font-medium text-white shadow-sm
       ${state !== 'idle'
              ? 'bg-pink-200 cursor-not-allowed'
              : 'bg-pink-200 hover:bg-pink-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            }
     `}
        >
          {state !== 'idle' ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Updating
            </>
          ) : 'Update'}
        </button>
      </Form>
    </div>
  );
}

/**
 * @typedef {{
 *   error: string | null;
 *   customer: CustomerFragment | null;
 * }} ActionResponse
 */

/** @typedef {import('customer-accountapi.generated').CustomerFragment} CustomerFragment */
/** @typedef {import('@shopify/hydrogen/customer-account-api-types').CustomerUpdateInput} CustomerUpdateInput */
/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
