import { api } from "@/lib/api";

export type UserRole =
  | "CUSTOMER"
  | "ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image: string | null;
  emailVerified: boolean;
};

export type AuthResponse = {
  message: string;
  user: AuthUser;
};

export type MessageResponse = {
  message: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
};

export const authService = {
  register(
    payload: RegisterPayload
  ) {
    return api<AuthResponse>(
      "/auth/register",
      {
        method: "POST",

        body: JSON.stringify(
          payload
        ),

        skipRefresh: true,
      }
    );
  },

  login(payload: LoginPayload) {
    return api<AuthResponse>(
      "/auth/login",
      {
        method: "POST",

        body: JSON.stringify(
          payload
        ),

        skipRefresh: true,
      }
    );
  },

  me() {
    return api<AuthUser>(
      "/auth/me",
      {
        method: "GET",
      }
    );
  },

  refresh() {
    return api<AuthResponse>(
      "/auth/refresh",
      {
        method: "POST",
        skipRefresh: true,
      }
    );
  },

  logout() {
    return api<MessageResponse>(
      "/auth/logout",
      {
        method: "POST",
        skipRefresh: true,
      }
    );
  },

  logoutAll() {
    return api<MessageResponse>(
      "/auth/logout-all",
      {
        method: "POST",
      }
    );
  },


  verifyEmail(token: string) {
  return api<MessageResponse>(
    "/auth/verify-email",
    {
      method: "POST",

      body: JSON.stringify({
        token,
      }),

      skipRefresh: true,
    }
  );
},

resendVerificationEmail(email: string) {
  return api<MessageResponse>(
    "/auth/resend-verification",
    {
      method: "POST",

      body: JSON.stringify({
        email,
      }),

      skipRefresh: true,
    }
  );
},

  forgotPassword(email: string) {
    return api<MessageResponse>(
      "/auth/forgot-password",
      {
        method: "POST",

        body: JSON.stringify({
          email,
        }),

        skipRefresh: true,
      }
    );
  },

  resetPassword(
    payload: ResetPasswordPayload
  ) {
    return api<MessageResponse>(
      "/auth/reset-password",
      {
        method: "POST",

        body: JSON.stringify(
          payload
        ),

        skipRefresh: true,
      }
    );
  },
};

