// NOTE: https://shopify.dev/docs/api/customer/latest/mutations/customerAddressUpdate
export const UPDATE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressUpdate(
    $address: CustomerAddressInput!
    $addressId: ID!
    $defaultAddress: Boolean
 ) {
    customerAddressUpdate(
      address: $address
      addressId: $addressId
      defaultAddress: $defaultAddress
    ) {
      customerAddress {
        id
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

// NOTE: https://shopify.dev/docs/api/customer/latest/mutations/customerAddressDelete
export const DELETE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressDelete(
    $addressId: ID!,
  ) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors {
        code
        field
        message
      }
    }
  }
`;

// NOTE: https://shopify.dev/docs/api/customer/latest/mutations/customerAddressCreate
export const CREATE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressCreate(
    $address: CustomerAddressInput!
    $defaultAddress: Boolean
  ) {
    customerAddressCreate(
      address: $address
      defaultAddress: $defaultAddress
    ) {
      customerAddress {
        id
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ADDRESS_UPDATE_MUTATION = `
  mutation customerAddressUpdate(
    $address: CustomerAddressInput!
    $addressId: ID!
    $defaultAddress: Boolean
  ) {
    customerAddressUpdate(
      address: $address
      addressId: $addressId
      defaultAddress: $defaultAddress
    ) {
      customerAddress {
        id
        address1
        address2
        city
        company
        country
        firstName
        lastName
        phoneNumber
        territoryCode
        zip
        zoneCode
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ADDRESS_CREATE_MUTATION = `
  mutation customerAddressCreate(
    $address: CustomerAddressInput!
  ) {
    customerAddressCreate(
      address: $address
    ) {
      customerAddress {
        id
        address1
        address2
        city
        company
        country
        firstName
        lastName
        phoneNumber
        territoryCode
        zip
        zoneCode
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ADDRESS_DELETE_MUTATION = `
  mutation customerAddressDelete(
    $addressId: ID!
  ) {
    customerAddressDelete(
      addressId: $addressId
    ) {
      deletedAddressId
      userErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ADDRESS_DEFAULT_MUTATION = `
  mutation customerAddressDefault(
    $addressId: ID!
  ) {
    customerAddressDefault(
      addressId: $addressId
    ) {
      customerAddress {
        id
        address1
        address2
        city
        company
        country
        firstName
        lastName
        phoneNumber
        territoryCode
        zip
        zoneCode
      }
      userErrors {
        field
        message
      }
    }
  }
`;
