const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5226";

const getAuthToken = () => localStorage.getItem("authToken");

export async function request(path, options = {}) {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers ?? {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  let data;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    if (response.status === 401 && path !== "/api/auth/login") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      window.location.assign("/login");
    }

    const validationMessage =
      data?.errors && typeof data.errors === "object"
        ? Object.values(data.errors).flat().filter(Boolean).join(" ")
        : "";
    const message =
      (typeof data === "string" && data.trim()) ||
      data?.message ||
      data?.error ||
      validationMessage ||
      data?.title ||
      "Request failed.";
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
