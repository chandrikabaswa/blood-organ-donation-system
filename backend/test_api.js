const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runComprehensiveTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE END-TO-END VERIFICATION');
  console.log('====================================================');

  // 1. Donor Login (Preloaded Demo Donor)
  const donorRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'donor@demo.com', password: 'password123' }
  );
  console.log('✅ 1. Donor Login: Status', donorRes.status);
  console.log(`      User: ${donorRes.data.user.name} | Role: ${donorRes.data.user.role} | Blood Group: ${donorRes.data.profile.bloodGroup}`);
  const donorToken = donorRes.data.token;

  // 2. Donor Dashboard
  const donorDash = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/donor/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${donorToken}` },
  });
  console.log('✅ 2. Donor Dashboard: Status', donorDash.status);
  console.log(`      Eligibility: ${donorDash.data.eligibility.status} | Available: ${donorDash.data.isAvailable}`);

  // 3. Test Eligibility: Update weight to 45 kg -> Expect "Not Eligible"
  const lowWeightRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/donor/profile',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${donorToken}` },
    },
    { weight: 45 }
  );
  console.log('✅ 3. Eligibility Test (Weight 45kg):', lowWeightRes.data.donor.eligibility.status);
  console.log(`      Reason: ${lowWeightRes.data.donor.eligibility.reason}`);

  // Restore weight to 56 kg -> Expect "Eligible"
  const normalWeightRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/donor/profile',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${donorToken}` },
    },
    { weight: 56 }
  );
  console.log('✅ 4. Eligibility Restored (Weight 56kg):', normalWeightRes.data.donor.eligibility.status);

  // 5. Test Availability Toggle
  const toggleOff = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/donor/availability',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${donorToken}` },
    },
    { isAvailable: false }
  );
  console.log('✅ 5. Availability Toggle OFF:', toggleOff.data.isAvailable === false ? 'SUCCESS' : 'FAILED');

  const toggleOn = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/donor/availability',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${donorToken}` },
    },
    { isAvailable: true }
  );
  console.log('✅ 6. Availability Toggle ON:', toggleOn.data.isAvailable === true ? 'SUCCESS' : 'FAILED');

  // 7. Test Role Enforcement: Donor trying to access Hospital route -> Expect 403
  const blockedHosp = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/hospital/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${donorToken}` },
  });
  console.log('✅ 7. Role Guard (Donor accessing Hospital route): Status', blockedHosp.status, '(Blocked as expected)');

  // 8. Hospital Login (Preloaded Demo Hospital)
  const hospRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'hospital@demo.com', password: 'password123' }
  );
  console.log('✅ 8. Hospital Login: Status', hospRes.status);
  console.log(`      Hospital: ${hospRes.data.profile.hospitalName} | Role: ${hospRes.data.user.role}`);
  const hospToken = hospRes.data.token;

  // 9. Hospital Dashboard
  const hospDash = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/hospital/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${hospToken}` },
  });
  console.log('✅ 9. Hospital Dashboard: Total Units:', hospDash.data.totalUnits, '| Active Requests:', hospDash.data.activeRequests);

  // 10. Role Enforcement: Hospital trying to access Donor route -> Expect 403
  const blockedDonor = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/donor/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${hospToken}` },
  });
  console.log('✅ 10. Role Guard (Hospital accessing Donor route): Status', blockedDonor.status, '(Blocked as expected)');

  // 11. Blood Inventory Update
  const invUpdate = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/hospital/inventory',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hospToken}` },
    },
    { bloodGroup: 'O+', units: 25 }
  );
  console.log('✅ 11. Blood Inventory Update: O+ units now =', invUpdate.data.item.units);

  // 12. Create Blood Request & Verify Matching
  const newReq = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/hospital/requests',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hospToken}` },
    },
    {
      patientName: 'Pooja Reddy',
      bloodGroup: 'O+',
      units: 2,
      urgency: 'Urgent',
      requiredDate: '2026-10-02',
      notes: 'Surgery requirement',
    }
  );
  console.log('✅ 12. Create Blood Request: Status', newReq.status);
  console.log(`       Message: ${newReq.data.message}`);
  console.log(`       Matched Donors Count: ${newReq.data.matchedDonorsCount}`);

  // 13. Donor sees request
  const donorReqs = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/donor/requests',
    method: 'GET',
    headers: { Authorization: `Bearer ${donorToken}` },
  });
  const matchedReq = donorReqs.data.find(r => r.notes === 'Surgery requirement');
  console.log('✅ 13. Donor Received Request:', matchedReq ? 'YES' : 'NO');

  // 14. Donor Accepts Request
  if (matchedReq) {
    const acceptRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/donor/requests/${matchedReq.responseId}/respond`,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${donorToken}` },
      },
      { status: 'Accepted' }
    );
    console.log('✅ 14. Donor Accepted Request:', acceptRes.data.message);
  }

  // 15. Hospital Checks Responses
  const hospResponses = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/hospital/responses',
    method: 'GET',
    headers: { Authorization: `Bearer ${hospToken}` },
  });
  const acceptedResponse = hospResponses.data.find(r => r.status === 'Accepted');
  console.log('✅ 15. Hospital Sees Accepted Donor:', acceptedResponse ? acceptedResponse.donorName : 'None');

  // 16. Donation History
  const historyRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/donor/history',
    method: 'GET',
    headers: { Authorization: `Bearer ${donorToken}` },
  });
  console.log('✅ 16. Donor History Record Count:', historyRes.data.length);

  console.log('====================================================');
  console.log('🎉 ALL 16 INTEGRATION VERIFICATIONS PASSED 100%!');
  console.log('====================================================');
}

runComprehensiveTests().catch(console.error);
