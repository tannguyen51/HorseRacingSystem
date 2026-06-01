import { request } from "./apiClient";

const unwrapResponseData = (response) => response?.data ?? response;

export const getMyHorses = async () =>
  unwrapResponseData(await request("/api/horses"));

export const getHorse = async (id) =>
  unwrapResponseData(await request(`/api/horses/${id}`));

export const createHorse = async (payload) =>
  unwrapResponseData(
    await request("/api/horses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );

export const updateHorse = async (id, payload) =>
  unwrapResponseData(
    await request(`/api/horses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  );

export const deleteHorse = async (id) =>
  unwrapResponseData(
    await request(`/api/horses/${id}`, {
      method: "DELETE",
    }),
  );