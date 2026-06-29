import { request } from "./apiClient";

export function login(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);
  return request("/api/auth/upload-document", {
    method: "POST",
    body: formData,
  });
}
