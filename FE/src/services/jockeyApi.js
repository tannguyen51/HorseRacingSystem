import { request } from "./apiClient";

const unwrapResponseData = (response) => response?.data ?? response?.Data ?? response;

const normalizeJockey = (jockey) => ({
  id: jockey.id ?? jockey.Id,
  userId: jockey.userId ?? jockey.UserId,
  fullName: jockey.fullName ?? jockey.FullName ?? "Unnamed jockey",
  email: jockey.email ?? jockey.Email ?? "",
  licenseNumber: jockey.licenseNumber ?? jockey.LicenseNumber ?? "",
  nationality: jockey.nationality ?? jockey.Nationality ?? "",
  experienceYears: jockey.experienceYears ?? jockey.ExperienceYears ?? 0,
  totalRaces: jockey.totalRaces ?? jockey.TotalRaces ?? 0,
  totalWins: jockey.totalWins ?? jockey.TotalWins ?? 0,
  winRate: jockey.winRate ?? jockey.WinRate ?? 0,
  rank: jockey.rank ?? jockey.Rank ?? null,
  status: jockey.status ?? jockey.Status ?? "",
  approvalStatus: jockey.approvalStatus ?? jockey.ApprovalStatus ?? null,
  approvalStatusName:
    jockey.approvalStatusName ?? jockey.ApprovalStatusName ?? "Unknown",
});

export const getAvailableJockeys = async () =>
  (unwrapResponseData(await request("/api/jockeys")) ?? []).map(normalizeJockey);
