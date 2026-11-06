import { supabase } from "./supabase";
import type { ApiErrorDetail } from "./types";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiErrorDetail[];

  constructor(message: string, status: number, code = "ERROR", details?: ApiErrorDetail[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

async function request<T>(
  path: string,
  options: RequestOptions = {},
  authenticated = true
): Promise<T> {
  const headers: Record<string, string> = {};

  if (authenticated) {
    const { data, error: sessionError } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (sessionError || !token) {
      throw new ApiError(
        "Your session has expired. Please sign in again.",
        401,
        "UNAUTHORIZED"
      );
    }

    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;

  try {
    response = await fetch(`${BASE}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(
      "Could not reach the Safekey server. Check your connection and try again.",
      0,
      "NETWORK_ERROR"
    );
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const errorPayload = (payload as { error?: { message?: string; code?: string; details?: ApiErrorDetail[] } })
      ?.error;

    throw new ApiError(
      errorPayload?.message ?? "Something went wrong. Please try again.",
      response.status,
      errorPayload?.code ?? "ERROR",
      errorPayload?.details
    );
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  delete: <T>(path: string, body?: unknown) => request<T>(path, { method: "DELETE", body })
};

/**
 * Registration happens before the browser has a Supabase session. The API
 * creates a confirmed Supabase user with the service-role key, then the form
 * signs in with the same email/password.
 */
export function registerAccount(input: {
  email: string;
  password: string;
  fullName: string | null;
}) {
  return request<{ user: { id: string; email: string | null } }>(
    "/api/auth/register",
    { method: "POST", body: input },
    false
  );
}

/**
 * Password recovery is email-match-only: step one checks that the address
 * belongs to an active account. No reset email is sent.
 */
export function checkPasswordResetEmail(email: string) {
  return request<{ ok: true }>(
    "/api/auth/password-reset/check",
    { method: "POST", body: { email } },
    false
  );
}

/** Step two: set a new password directly for the matched email. */
export function resetPasswordWithEmail(input: { email: string; password: string }) {
  return request<void>(
    "/api/auth/password-reset",
    { method: "POST", body: input },
    false
  );
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export function fieldError(error: unknown, field: string): string | undefined {
  if (!(error instanceof ApiError) || !error.details) return undefined;
  return error.details.find((detail) => detail.path === field || detail.path.endsWith(`.${field}`))?.message;
}
