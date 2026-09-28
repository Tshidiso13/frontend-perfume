import {
  api,
} from "@/lib/api";

export type AccountAddress = {
  id:
    string;

  userId:
    string;

  label:
    string |
    null;

  recipientName:
    string;

  phone:
    string;

  addressLine1:
    string;

  addressLine2:
    string |
    null;

  suburb:
    string |
    null;

  city:
    string;

  province:
    string;

  postalCode:
    string;

  country:
    string;

  isDefault:
    boolean;

  createdAt:
    string;

  updatedAt:
    string;
};

export type AddressPayload = {
  label?:
    string;

  recipientName:
    string;

  phone:
    string;

  addressLine1:
    string;

  addressLine2?:
    string;

  suburb?:
    string;

  city:
    string;

  province:
    string;

  postalCode:
    string;

  country?:
    string;

  isDefault?:
    boolean;
};

export const addressesService = {
  getAll() {
    return api<
      AccountAddress[]
    >(
      "/account/addresses"
    );
  },

  getOne(
    addressId:
      string
  ) {
    return api<AccountAddress>(
      `/account/addresses/${encodeURIComponent(
        addressId
      )}`
    );
  },

  create(
    payload:
      AddressPayload
  ) {
    return api<AccountAddress>(
      "/account/addresses",
      {
        method:
          "POST",

        body:
          JSON.stringify(
            payload
          ),
      }
    );
  },

  update(
    addressId:
      string,

    payload:
      Partial<AddressPayload>
  ) {
    return api<AccountAddress>(
      `/account/addresses/${encodeURIComponent(
        addressId
      )}`,
      {
        method:
          "PATCH",

        body:
          JSON.stringify(
            payload
          ),
      }
    );
  },

  setDefault(
    addressId:
      string
  ) {
    return api<AccountAddress>(
      `/account/addresses/${encodeURIComponent(
        addressId
      )}/default`,
      {
        method:
          "PATCH",
      }
    );
  },

  remove(
    addressId:
      string
  ) {
    return api<{
      deleted:
        boolean;
    }>(
      `/account/addresses/${encodeURIComponent(
        addressId
      )}`,
      {
        method:
          "DELETE",
      }
    );
  },
};
