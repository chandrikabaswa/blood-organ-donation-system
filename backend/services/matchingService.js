const Donor = require('../models/Donor');
const DonorResponse = require('../models/DonorResponse');

/**
 * Matches available, eligible donors in the same city with the requested blood group.
 * Creates a pending DonorResponse document for each matching donor in MongoDB.
 */
async function matchAndNotifyDonors(request) {
  const { _id: requestId, bloodGroup, city, hospitalId } = request;

  // Search matching donors based on:
  // 1. Blood group match
  // 2. City match (case-insensitive, trimmed)
  // 3. Donor availability = true (ON)
  // 4. Donor eligibility = "Eligible"
  const trimmedCity = (city || '').trim();
  const escapedCity = trimmedCity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const cityRegex = new RegExp(`^\\s*${escapedCity}\\s*$`, 'i');

  const matchingDonors = await Donor.find({
    bloodGroup,
    city: cityRegex,
    isAvailable: true,
    'eligibility.status': 'Eligible',
  });

  const createdResponses = [];
  for (const donor of matchingDonors) {
    const response = await DonorResponse.findOneAndUpdate(
      { requestId, donorId: donor._id },
      {
        $setOnInsert: {
          requestId,
          donorId: donor._id,
          hospitalId,
          status: 'Pending',
          responseDate: null,
        },
      },
      { upsert: true, new: true }
    );
    createdResponses.push(response);
  }

  return {
    matchedCount: matchingDonors.length,
    donors: matchingDonors,
    responses: createdResponses,
  };
}

module.exports = { matchAndNotifyDonors };
