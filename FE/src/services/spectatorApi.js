import { request } from "./apiClient";

export const getTournaments = () => request("/api/tournaments");
export const getActiveTournaments = () => request("/api/tournaments/active");
export const getTournament = (id) => request(`/api/tournaments/${id}`);
export const getRoundsByTournament = (tournamentId) =>
  request(`/api/tournaments/${tournamentId}/rounds`);

export const getRaces = () => request("/api/races");
export const getRace = (id) => request(`/api/races/${id}`);
export const getRaceResult = (id) => request(`/api/races/${id}/result`);

export const getLiveRaceResult = (raceId) =>
  request(`/api/live-results/race/${raceId}`);
export const getLivePositions = (raceId) =>
  request(`/api/live-results/race/${raceId}/positions`);
export const getLiveRanking = (raceId) =>
  request(`/api/live-results/race/${raceId}/ranking`);

export const createPrediction = (payload) =>
  request("/api/predictions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const getMyPredictions = () => request("/api/predictions/mine");
