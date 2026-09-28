const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  "http://localhost:5000/api";

const API_URL = RAW_API_URL.replace(/\/+$/, "");

type ApiOptions = RequestInit & {
  skipRefresh?: boolean;
};

type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

const NO_REFRESH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
];

function normalizeEndpoint(endpoint: string) {
  return endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
}

function getErrorMessage(
  data: ApiErrorResponse | null,
  fallback: string
) {
  if (Array.isArray(data?.message)) {
    return data.message.join(" ");
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (typeof data?.error === "string") {
    return data.error;
  }

  return fallback;
}

async function parseResponse<T>(
  response: Response
): Promise<T | null> {
  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return null;
  }

  const contentType =
    response.headers.get("content-type");

  if (
    !contentType?.includes("application/json")
  ) {
    return null;
  }

  return (await response.json()) as T;
}

async function refreshSession() {
  const response = await fetch(
    `${API_URL}/auth/refresh`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    }
  );

  return response.ok;
}

export async function api<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const normalizedEndpoint =
    normalizeEndpoint(endpoint);

  const {
    skipRefresh = false,
    headers,
    ...requestOptions
  } = options;

  const isFormData =
    requestOptions.body instanceof FormData;

  const requestHeaders =
    new Headers(headers);

  requestHeaders.set(
    "Accept",
    "application/json"
  );

  if (
    requestOptions.body &&
    !isFormData &&
    !requestHeaders.has("Content-Type")
  ) {
    requestHeaders.set(
      "Content-Type",
      "application/json"
    );
  }

  const requestUrl =
    `${API_URL}${normalizedEndpoint}`;

  let response = await fetch(
    requestUrl,
    {
      ...requestOptions,
      headers: requestHeaders,
      credentials: "include",
    }
  );

  const canRefresh =
    response.status === 401 &&
    !skipRefresh &&
    !NO_REFRESH_ENDPOINTS.some(
      (route) =>
        normalizedEndpoint.startsWith(route)
    );

  if (canRefresh) {
    const refreshed =
      await refreshSession();

    if (refreshed) {
      response = await fetch(
        requestUrl,
        {
          ...requestOptions,
          headers: requestHeaders,
          credentials: "include",
        }
      );
    }
  }

  if (!response.ok) {
    const errorData =
      await parseResponse<ApiErrorResponse>(
        response
      );

    throw new Error(
      getErrorMessage(
        errorData,
        `Request failed with status ${response.status}.`
      )
    );
  }

  const data =
    await parseResponse<T>(
      response
    );

  return data as T;
}

export { API_URL };