const mockStore = require('./mockStore');

/**
 * Matches available, eligible donors in the same city with the requested blood group.
 * Creates a pending DonorResponse for each matching donor.
 */
function matchAndNotifyDonors(request) {
  const { _id: requestId, bloodGroup, city, hospitalId } = request;

  // Search matching donors based on:
  // 1. Blood group match
  // 2. City match
  // 3. Donor availability = true (ON)
  // 4. Donor eligibility = "Eligible"
  const matchingDonors = mockStore.findMatchingDonors({ bloodGroup, city });

  const createdResponses = [];
  for (const donor of matchingDonors) {
    const response = mockStore.createDonorResponse({
      requestId,
      donorId: donor._id,
      hospitalId,
      status: 'Pending',
    });
    createdResponses.push(response);
  }

  return {
    matchedCount: matchingDonors.length,
    donors: matchingDonors,
    responses: createdResponses,
  };
}

module.exports = { matchAndNotifyDonors };
