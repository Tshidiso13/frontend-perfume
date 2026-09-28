import {
  api,
} from "@/lib/api";

export type AccountSession = {
  id:
    string;

  userAgent:
    string |
    null;

  ipAddress:
    string |
    null;

  expiresAt:
    string;

  createdAt:
    string;

  updatedAt:
    string;

  isCurrent:
    boolean;
};

export type SecurityOverview = {
  email:
    string;

  hasPassword:
    boolean;

  googleConnected:
    boolean;

  emailVerified:
    boolean;

  lastLoginAt:
    string |
    null;

  memberSince:
    string;

  activeSessionCount:
    number;

  sessions:
    AccountSession[];
};

export type ChangePasswordPayload = {
  currentPassword?:
    string;

  newPassword:
    string;
};

export const securityService = {
  getOverview() {
    return api<SecurityOverview>(
      "/account/security"
    );
  },

  changePassword(
    payload:
      ChangePasswordPayload
  ) {
    return api<{
      message:
        string;

      requiresReauthentication:
        boolean;
    }>(
      "/account/security/password",
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

  revokeSession(
    sessionId:
      string
  ) {
    return api<{
      revoked:
        boolean;

      isCurrent:
        boolean;
    }>(
      `/account/security/sessions/${encodeURIComponent(
        sessionId
      )}`,
      {
        method:
          "DELETE",
      }
    );
  },

  revokeOtherSessions() {
    return api<{
      revoked:
        number;
    }>(
      "/account/security/sessions/revoke-others",
      {
        method:
          "POST",
      }
    );
  },

  revokeAllSessions() {
    return api<{
      revoked:
        number;

      requiresReauthentication:
        boolean;
    }>(
      "/account/security/sessions",
      {
        method:
          "DELETE",
      }
    );
  },
};
