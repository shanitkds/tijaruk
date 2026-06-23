import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export const loginApi = axios.create({
  baseURL,
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL,
  withCredentials: true,
});

const AUTH_STORAGE_KEY = "tijaruk-auth";
let refreshPromise = null;

function getStoredSessionValue() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    window.localStorage.getItem(AUTH_STORAGE_KEY) ||
    window.sessionStorage.getItem(AUTH_STORAGE_KEY) ||
    ""
  );
}

function getStoredAccessToken() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const session = getStoredSessionValue();
    return session ? JSON.parse(session)?.access || "" : "";
  } catch {
    return "";
  }
}

function getStoredRefreshToken() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const session = getStoredSessionValue();
    return session ? JSON.parse(session)?.refresh || "" : "";
  } catch {
    return "";
  }
}

function updateStoredAccessToken(accessToken) {
  if (typeof window === "undefined" || !accessToken) {
    return;
  }

  const storage = window.localStorage.getItem(AUTH_STORAGE_KEY)
    ? window.localStorage
    : window.sessionStorage.getItem(AUTH_STORAGE_KEY)
      ? window.sessionStorage
      : null;

  if (!storage) {
    return;
  }

  try {
    const session = JSON.parse(storage.getItem(AUTH_STORAGE_KEY) || "{}");
    storage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ ...session, access: accessToken }),
    );
  } catch {
    // If the stored session is malformed, the next auth check will redirect.
  }
}

function storeAccessToken(response) {
  const accessToken = response.data?.access;

  if (accessToken) {
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    updateStoredAccessToken(accessToken);
  }

  return response;
}

api.interceptors.request.use((config) => {
  if (config.skipAuth) {
    if (config.headers) {
      config.headers.delete?.("Authorization");
      config.headers.delete?.("authorization");
      delete config.headers.Authorization;
      delete config.headers.authorization;
    }
    return config;
  }

  const accessToken = getStoredAccessToken();
  const currentAuthorization = config.headers?.Authorization;

  if (accessToken && !currentAuthorization) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  storeAccessToken,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      originalRequest.url !== "/accounts/refresh/" &&
      !originalRequest.skipAuthRedirect &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          const refreshToken = getStoredRefreshToken();
          refreshPromise = refreshApi
            .post(
              "/accounts/refresh/",
              refreshToken ? { refresh: refreshToken } : undefined,
            )
            .finally(() => {
              refreshPromise = null;
            });
        }

        const response = await refreshPromise;
        const accessToken = response.data?.access;

        if (!accessToken) {
          throw new Error("Refresh response did not include an access token");
        }

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        updateStoredAccessToken(accessToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

loginApi.interceptors.response.use(storeAccessToken);

export default api;
