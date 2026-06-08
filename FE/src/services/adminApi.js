import { request } from "./apiClient";

const unwrap = (response) => response?.data ?? response?.Data ?? response;

export const getAdminDashboard = async () =>
  unwrap(await request("/api/admin/dashboard"));

export const getAdminUsers = async () =>
  unwrap(await request("/api/admin/users"));

export const getAdminUser = async (id) =>
  unwrap(await request(`/api/admin/users/${id}`));

export const getOwnerHorses = async (userId) =>
  unwrap(await request(`/api/admin/users/${userId}/horses`));

export const getOwnerHorse = async (userId, horseId) =>
  unwrap(await request(`/api/admin/users/${userId}/horses/${horseId}`));

export const updateOwnerHorseStatus = (userId, horseId, payload) =>
  request(`/api/admin/users/${userId}/horses/${horseId}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const setUserActive = (id, isActive) =>
  request(`/api/admin/users/${id}/${isActive ? "reactivate" : "deactivate"}`, {
    method: "POST",
  });

export const approveJockey = (id) =>
  request(`/api/admin/jockeys/${id}/approve`, {
    method: "POST",
  });

export const rejectJockey = (id, reason) =>
  request(`/api/admin/jockeys/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const getAdminTournaments = async () =>
  unwrap(await request("/api/tournaments"));

export const createTournament = (payload) =>
  request("/api/tournaments", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateTournament = (id, payload) =>
  request(`/api/tournaments/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteTournament = (id) =>
  request(`/api/tournaments/${id}`, { method: "DELETE" });

export const getTournamentRounds = async (tournamentId) =>
  unwrap(await request(`/api/tournaments/${tournamentId}/rounds`));

export const createRound = (tournamentId, payload) =>
  request(`/api/tournaments/${tournamentId}/rounds`, {
    method: "POST",
    body: JSON.stringify({ ...payload, tournamentId }),
  });

export const getTournamentRaces = async (tournamentId) =>
  unwrap(await request(`/api/races/management/tournament/${tournamentId}`));

export const createRace = (payload) =>
  request("/api/races/management", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const assignHorseToRace = (raceId, payload) =>
  request(`/api/races/management/${raceId}/assign-horse`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
