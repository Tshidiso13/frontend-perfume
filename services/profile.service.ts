import {
  api,
} from "@/lib/api";

export type AccountProfile = {
  id:
    string;

  name:
    string;

  email:
    string;

  image:
    string |
    null;

  role:
    string;

  emailVerified:
    boolean;

  createdAt:
    string;

  updatedAt:
    string;
};

export type UpdateAccountProfilePayload = {
  name?:
    string;

  email?:
    string;
};

export const profileService = {
  getProfile() {
    return api<AccountProfile>(
      "/account/profile"
    );
  },

  updateProfile(
    payload:
      UpdateAccountProfilePayload
  ) {
    return api<AccountProfile>(
      "/account/profile",
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
};
