const bcrypt = require('bcryptjs');

// In-Memory Data Store for zero-config local testing before MongoDB is connected
class MockStore {
  constructor() {
    this.users = [];
    this.donors = [];
    this.hospitals = [];
    this.inventories = [];
    this.requests = [];
    this.donorResponses = [];
    this.donationHistories = [];
    this.idCounter = 100;

    this.initDemoData();
  }

  generateId(prefix = 'id') {
    this.idCounter += 1;
    return `${prefix}_${this.idCounter}_${Date.now()}`;
  }

  initDemoData() {
    // Demo password hash for "password123"
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('password123', salt);

    // 1. Seed Demo Donor User
    const donorUserId = 'user_donor_1';
    const donorId = 'donor_1';
    this.users.push({
      _id: donorUserId,
      name: 'Chandrika',
      email: 'donor@demo.com',
      password: demoPasswordHash,
      role: 'donor',
      createdAt: new Date('2025-01-01'),
    });

    this.donors.push({
      _id: donorId,
      userId: donorUserId,
      fullName: 'Chandrika',
      dob: '1998-05-14',
      gender: 'Female',
      bloodGroup: 'O+',
      phone: '9876543210',
      city: 'Hyderabad',
      isAvailable: true,
      weight: 56,
      lastDonationDate: '2026-01-10',
      takingMedication: 'No',
      chronicDisease: 'None',
      otherDiseaseName: '',
      recentSurgery: 'No',
      recentFever: 'No',
      eligibility: {
        status: 'Eligible',
        reason: 'Meets basic eligibility criteria',
        lastCalculated: new Date(),
      },
      createdAt: new Date('2025-01-01'),
    });

    // 2. Seed Demo Hospital User
    const hospitalUserId = 'user_hospital_1';
    const hospitalId = 'hospital_1';
    this.users.push({
      _id: hospitalUserId,
      name: 'City General Hospital',
      email: 'hospital@demo.com',
      password: demoPasswordHash,
      role: 'hospital',
      createdAt: new Date('2025-01-01'),
    });

    this.hospitals.push({
      _id: hospitalId,
      userId: hospitalUserId,
      hospitalName: 'City General Hospital',
      registrationNumber: 'HOSP-HYD-2024-09',
      phone: '040-23456789',
      city: 'Hyderabad',
      address: 'Road No. 1, Banjara Hills, Hyderabad',
      createdAt: new Date('2025-01-01'),
    });

    // 3. Seed Blood Inventory for Demo Hospital across all 8 blood groups
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const initialUnits = {
      'A+': 12,
      'A-': 5,
      'B+': 18,
      'B-': 4,
      'AB+': 7,
      'AB-': 3,
      'O+': 22,
      'O-': 8,
    };

    bloodGroups.forEach((bg) => {
      this.inventories.push({
        _id: this.generateId('inv'),
        hospitalId: hospitalId,
        bloodGroup: bg,
        units: initialUnits[bg] || 0,
        lastUpdated: new Date(),
      });
    });

    // 4. Seed a Sample Blood Request
    const requestId = 'req_demo_1';
    this.requests.push({
      _id: requestId,
      hospitalId: hospitalId,
      hospitalName: 'City General Hospital',
      city: 'Hyderabad',
      patientName: 'Ramesh Rao',
      bloodGroup: 'O+',
      units: 2,
      urgency: 'Urgent',
      requiredDate: '2026-09-28',
      notes: 'Emergency unit needed for urgent scheduled surgery.',
      status: 'Open',
      createdAt: new Date(),
    });

    // 5. Seed Donor Response (Pending for Chandrika)
    this.donorResponses.push({
      _id: 'res_demo_1',
      requestId: requestId,
      donorId: donorId,
      hospitalId: hospitalId,
      status: 'Pending',
      responseDate: null,
      createdAt: new Date(),
    });

    // 6. Seed Donation History for Chandrika
    this.donationHistories.push(
      {
        _id: 'hist_1',
        donorId: donorId,
        hospitalName: 'City General Hospital',
        date: '2026-01-10',
        bloodGroup: 'O+',
        units: 1,
        status: 'Completed',
      },
      {
        _id: 'hist_2',
        donorId: donorId,
        hospitalName: 'Apollo Health City',
        date: '2025-08-15',
        bloodGroup: 'O+',
        units: 1,
        status: 'Completed',
      }
    );
  }

  // --- User Methods ---
  findUserByEmail(email) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find((u) => u._id === id);
  }

  createUser(userData) {
    const newUser = {
      _id: this.generateId('user'),
      ...userData,
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // --- Donor Methods ---
  findDonorByUserId(userId) {
    return this.donors.find((d) => d.userId === userId);
  }

  findDonorById(id) {
    return this.donors.find((d) => d._id === id);
  }

  createDonor(donorData) {
    const newDonor = {
      _id: this.generateId('donor'),
      ...donorData,
      createdAt: new Date(),
    };
    this.donors.push(newDonor);
    return newDonor;
  }

  updateDonor(donorId, updates) {
    const index = this.donors.findIndex((d) => d._id === donorId);
    if (index === -1) return null;
    this.donors[index] = { ...this.donors[index], ...updates };
    return this.donors[index];
  }

  // Find all donors matching criteria (for request distribution)
  findMatchingDonors({ bloodGroup, city }) {
    return this.donors.filter((d) => {
      const bgMatch = d.bloodGroup === bloodGroup;
      const cityMatch = d.city.trim().toLowerCase() === city.trim().toLowerCase();
      const isAvailable = Boolean(d.isAvailable);
      const isEligible = d.eligibility && d.eligibility.status === 'Eligible';
      return bgMatch && cityMatch && isAvailable && isEligible;
    });
  }

  // --- Hospital Methods ---
  findHospitalByUserId(userId) {
    return this.hospitals.find((h) => h.userId === userId);
  }

  findHospitalById(id) {
    return this.hospitals.find((h) => h._id === id);
  }

  createHospital(hospitalData) {
    const newHospital = {
      _id: this.generateId('hosp'),
      ...hospitalData,
      createdAt: new Date(),
    };
    this.hospitals.push(newHospital);

    // Initialize zero inventory for all 8 blood groups
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    bloodGroups.forEach((bg) => {
      this.inventories.push({
        _id: this.generateId('inv'),
        hospitalId: newHospital._id,
        bloodGroup: bg,
        units: 0,
        lastUpdated: new Date(),
      });
    });

    return newHospital;
  }

  // --- Inventory Methods ---
  getInventory(hospitalId) {
    return this.inventories.filter((inv) => inv.hospitalId === hospitalId);
  }

  updateInventoryUnit(hospitalId, bloodGroup, units) {
    let item = this.inventories.find(
      (inv) => inv.hospitalId === hospitalId && inv.bloodGroup === bloodGroup
    );
    if (!item) {
      item = {
        _id: this.generateId('inv'),
        hospitalId,
        bloodGroup,
        units: Math.max(0, Number(units)),
        lastUpdated: new Date(),
      };
      this.inventories.push(item);
      return item;
    }
    item.units = Math.max(0, Number(units));
    item.lastUpdated = new Date();
    return item;
  }

  // --- Request Methods ---
  createRequest(requestData) {
    const newReq = {
      _id: this.generateId('req'),
      ...requestData,
      status: 'Open',
      createdAt: new Date(),
    };
    this.requests.push(newReq);
    return newReq;
  }

  getRequestsByHospital(hospitalId) {
    return this.requests
      .filter((r) => r.hospitalId === hospitalId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getRequestById(id) {
    return this.requests.find((r) => r._id === id);
  }

  // --- Donor Responses Methods ---
  createDonorResponse(data) {
    const newRes = {
      _id: this.generateId('res'),
      ...data,
      status: data.status || 'Pending',
      responseDate: null,
      createdAt: new Date(),
    };
    this.donorResponses.push(newRes);
    return newRes;
  }

  getResponsesForDonor(donorId) {
    // Join with BloodRequest details
    return this.donorResponses
      .filter((dr) => dr.donorId === donorId)
      .map((dr) => {
        const req = this.getRequestById(dr.requestId);
        return {
          ...dr,
          request: req || null,
        };
      })
      .filter((dr) => dr.request !== null)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getResponsesForHospital(hospitalId) {
    // Join with Donor and BloodRequest details
    return this.donorResponses
      .filter((dr) => dr.hospitalId === hospitalId)
      .map((dr) => {
        const donor = this.findDonorById(dr.donorId);
        const req = this.getRequestById(dr.requestId);
        return {
          ...dr,
          donorName: donor ? donor.fullName : 'Anonymous Donor',
          donorBloodGroup: donor ? donor.bloodGroup : 'N/A',
          donorCity: donor ? donor.city : 'N/A',
          donorPhone: donor ? donor.phone : 'N/A',
          request: req || null,
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  updateDonorResponse(responseId, status) {
    const res = this.donorResponses.find((r) => r._id === responseId);
    if (!res) return null;
    res.status = status;
    res.responseDate = new Date();
    return res;
  }

  // --- Donation History Methods ---
  getHistoryForDonor(donorId) {
    return this.donationHistories
      .filter((h) => h.donorId === donorId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  addDonationHistory(data) {
    const newHist = {
      _id: this.generateId('hist'),
      ...data,
    };
    this.donationHistories.push(newHist);
    return newHist;
  }
}

// Export singleton instance
const mockStore = new MockStore();
module.exports = mockStore;
