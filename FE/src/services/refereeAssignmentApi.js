import { request } from "./apiClient";

/**
 * Respond to a referee assignment (accept or reject)
 * @param {number} assignmentId - The ID of the referee assignment
 * @param {string} response - "Accept" or "Reject"
 * @returns {Promise} - Response from the API
 */
export function respondToRefereeAssignment(assignmentId, response) {
  return request("/api/referee/assign/respond", {
    method: "POST",
    body: JSON.stringify({
      assignmentId,
      response, // "Accept" or "Reject"
    }),
  });
}

/**
 * Get pending referee assignments for the current referee
 * @returns {Promise} - List of pending assignments
 */
export function getPendingRefereeAssignments() {
  return request("/api/referee/assignments/pending");
}

/**
 * Get all referee assignments (accepted, rejected, pending)
 * @returns {Promise} - List of all assignments
 */
export function getAllRefereeAssignments() {
  return request("/api/referee/assignments");
}
