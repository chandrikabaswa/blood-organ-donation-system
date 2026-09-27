const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const BloodInventory = require('../models/BloodInventory');
const BloodRequest = require('../models/BloodRequest');
const DonorResponse = require('../models/DonorResponse');
const DonationHistory = require('../models/DonationHistory');

const seedDemoData = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('password123', salt);

    // 1. Seed Demo Donor
    let demoDonorUser = await User.findOne({ email: 'donor@demo.com' });
    let demoDonorProfile = null;

    if (!demoDonorUser) {
      demoDonorUser = await User.create({
        name: 'Chandrika',
        email: 'donor@demo.com',
        password: demoPasswordHash,
        role: 'donor',
      });
      console.log('✅ Demo Donor User created in MongoDB');
    }

    demoDonorProfile = await Donor.findOne({ userId: demoDonorUser._id });
    if (!demoDonorProfile) {
      demoDonorProfile = await Donor.create({
        userId: demoDonorUser._id,
        fullName: 'Chandrika',
        dob: new Date('1998-05-14'),
        gender: 'Female',
        bloodGroup: 'O+',
        phone: '9876543210',
        city: 'Hyderabad',
        isAvailable: true,
        weight: 56,
        lastDonationDate: new Date('2026-01-10'),
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
      });
      console.log('✅ Demo Donor Profile created in MongoDB');

      // Seed donation history for demo donor
      const historyCount = await DonationHistory.countDocuments({ donorId: demoDonorProfile._id });
      if (historyCount === 0) {
        await DonationHistory.create([
          {
            donorId: demoDonorProfile._id,
            hospitalName: 'City General Hospital',
            date: new Date('2026-01-10'),
            bloodGroup: 'O+',
            units: 1,
            status: 'Completed',
          },
          {
            donorId: demoDonorProfile._id,
            hospitalName: 'Apollo Health City',
            date: new Date('2025-08-15'),
            bloodGroup: 'O+',
            units: 1,
            status: 'Completed',
          },
        ]);
        console.log('✅ Demo Donation History created in MongoDB');
      }
    }

    // 2. Seed Demo Hospital
    let demoHospitalUser = await User.findOne({ email: 'hospital@demo.com' });
    let demoHospitalProfile = null;

    if (!demoHospitalUser) {
      demoHospitalUser = await User.create({
        name: 'City General Hospital',
        email: 'hospital@demo.com',
        password: demoPasswordHash,
        role: 'hospital',
      });
      console.log('✅ Demo Hospital User created in MongoDB');
    }

    demoHospitalProfile = await Hospital.findOne({ userId: demoHospitalUser._id });
    if (!demoHospitalProfile) {
      demoHospitalProfile = await Hospital.create({
        userId: demoHospitalUser._id,
        hospitalName: 'City General Hospital',
        registrationNumber: 'HOSP-HYD-2024-09',
        phone: '040-23456789',
        city: 'Hyderabad',
        address: 'Road No. 1, Banjara Hills, Hyderabad',
      });
      console.log('✅ Demo Hospital Profile created in MongoDB');

      // Seed Blood Inventory for all 8 blood groups
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

      for (const bg of bloodGroups) {
        await BloodInventory.findOneAndUpdate(
          { hospitalId: demoHospitalProfile._id, bloodGroup: bg },
          { $setOnInsert: { units: initialUnits[bg] || 0, lastUpdated: new Date() } },
          { upsert: true }
        );
      }
      console.log('✅ Demo Hospital Inventory initialized in MongoDB');

      // Seed a sample blood request & response
      const existingReq = await BloodRequest.findOne({ hospitalId: demoHospitalProfile._id });
      if (!existingReq && demoDonorProfile) {
        const sampleReq = await BloodRequest.create({
          hospitalId: demoHospitalProfile._id,
          hospitalName: demoHospitalProfile.hospitalName,
          city: demoHospitalProfile.city,
          patientName: 'Ramesh Rao',
          bloodGroup: 'O+',
          units: 2,
          urgency: 'Urgent',
          requiredDate: new Date(Date.now() + 86400000 * 2),
          notes: 'Emergency unit needed for urgent scheduled surgery.',
          status: 'Open',
        });

        await DonorResponse.create({
          requestId: sampleReq._id,
          donorId: demoDonorProfile._id,
          hospitalId: demoHospitalProfile._id,
          status: 'Pending',
          responseDate: null,
        });
        console.log('✅ Demo Blood Request & Pending Donor Response created in MongoDB');
      }
    }
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
};

module.exports = { seedDemoData };
