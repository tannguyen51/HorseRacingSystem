import { request } from "./apiClient";

const unwrapResponseData = (response) => response?.data ?? response;

export const getOwnerProfile = async () =>
  unwrapResponseData(await request("/api/auth/me"));

export const getOwnerTournaments = async () =>
  unwrapResponseData(await request("/api/tournaments"));
