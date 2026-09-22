/**
 * Simplified Student Project Eligibility Logic
 * NOTE: This is a simplified calculation for academic demonstration,
 * not actual medical screening.
 */
function calculateEligibility(healthData = {}) {
  const {
    weight = 55,
    lastDonationDate = null,
    recentFever = 'No',
    recentSurgery = 'No',
    chronicDisease = 'None',
    otherDiseaseName = '',
  } = healthData;

  // 1. Weight criteria: Minimum 50 kg
  const numWeight = Number(weight);
  if (!numWeight || numWeight < 50) {
    return {
      status: 'Not Eligible',
      reason: `Weight must be at least 50 kg (current: ${numWeight || 0} kg)`,
      lastCalculated: new Date(),
    };
  }

  // 2. Donation interval: Minimum 90 days since last donation
  if (lastDonationDate) {
    const lastDate = new Date(lastDonationDate);
    if (!isNaN(lastDate.getTime())) {
      const diffTime = Math.abs(new Date() - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 90) {
        return {
          status: 'Not Eligible',
          reason: `Last donation was too recent (${diffDays} days ago; minimum 90 days required)`,
          lastCalculated: new Date(),
        };
      }
    }
  }

  // 3. Recent fever check
  if (recentFever === 'Yes') {
    return {
      status: 'Not Eligible',
      reason: 'Recent fever reported (must be symptom-free)',
      lastCalculated: new Date(),
    };
  }

  // 4. Recent surgery check
  if (recentSurgery === 'Yes') {
    return {
      status: 'Not Eligible',
      reason: 'Recent surgery reported (minimum 6 months recovery required)',
      lastCalculated: new Date(),
    };
  }

  // 5. Chronic disease check
  // Options: Diabetes, Hypertension, Heart Disease, Kidney Disease, Asthma, Other, None
  if (chronicDisease && chronicDisease !== 'None') {
    const diseaseLabel = chronicDisease === 'Other' && otherDiseaseName
      ? otherDiseaseName
      : chronicDisease;
    return {
      status: 'Not Eligible',
      reason: `Chronic condition reported (${diseaseLabel})`,
      lastCalculated: new Date(),
    };
  }

  // All simplified conditions passed
  return {
    status: 'Eligible',
    reason: 'Meets basic eligibility criteria',
    lastCalculated: new Date(),
  };
}

module.exports = { calculateEligibility };
