import {
  api,
} from "@/lib/api";

export type SupportCategory =
  | "ORDER"
  | "DELIVERY"
  | "PAYMENT"
  | "ACCOUNT"
  | "PRODUCT"
  | "RETURNS"
  | "OTHER";

export type SupportStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_FOR_CUSTOMER"
  | "RESOLVED"
  | "CLOSED";

export type SupportPriority =
  | "NORMAL"
  | "IMPORTANT"
  | "URGENT";

export type SupportMessage = {
  id:
    string;

  ticketId:
    string;

  sender:
    "CUSTOMER" |
    "ADMIN";

  senderName:
    string;

  senderEmail:
    string |
    null;

  message:
    string;

  createdAt:
    string;
};

export type SupportTicket = {
  id:
    string;

  ticketNumber:
    string;

  userId:
    string;

  name:
    string;

  email:
    string;

  category:
    SupportCategory;

  subject:
    string;

  orderNumber:
    string |
    null;

  status:
    SupportStatus;

  priority:
    SupportPriority;

  resolvedAt:
    string |
    null;

  createdAt:
    string;

  updatedAt:
    string;

  messages:
    SupportMessage[];
};

export type CreateSupportTicketPayload = {
  category:
    SupportCategory;

  subject:
    string;

  message:
    string;

  orderNumber?:
    string;
};

export const supportService = {
  getMine() {
    return api<
      SupportTicket[]
    >(
      "/account/help/tickets"
    );
  },

  getOne(
    ticketId:
      string
  ) {
    return api<SupportTicket>(
      `/account/help/tickets/${encodeURIComponent(
        ticketId
      )}`
    );
  },

  create(
    payload:
      CreateSupportTicketPayload
  ) {
    return api<SupportTicket>(
      "/account/help/tickets",
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

  reply(
    ticketId:
      string,

    message:
      string
  ) {
    return api<SupportMessage>(
      `/account/help/tickets/${encodeURIComponent(
        ticketId
      )}/replies`,
      {
        method:
          "POST",

        body:
          JSON.stringify({
            message,
          }),
      }
    );
  },
};
