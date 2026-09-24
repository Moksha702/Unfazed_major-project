require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Therapist = require('./src/models/Therapist');
const Client = require('./src/models/Client');
const Session = require('./src/models/Session');
const SessionNote = require('./src/models/SessionNote');
const Availability = require('./src/models/Availability');
const Payment = require('./src/models/Payment');
const Package = require('./src/models/Package');
const SubscriptionTierConfig = require('./src/models/SubscriptionTierConfig');
const { DEFAULT_CONFIGS } = require('./src/services/entitlementService');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/unfazed');
    console.log('[Seeder] Connected to database');

    // Clear existing data
    await Promise.all([
      Therapist.deleteMany({}),
      Client.deleteMany({}),
      Session.deleteMany({}),
      SessionNote.deleteMany({}),
      Availability.deleteMany({}),
      Payment.deleteMany({}),
      Package.deleteMany({}),
      SubscriptionTierConfig.deleteMany({})
    ]);

    console.log('[Seeder] Cleared previous records');

    // 1. Seed Subscription Tiers
    for (const key of Object.keys(DEFAULT_CONFIGS)) {
      await SubscriptionTierConfig.create(DEFAULT_CONFIGS[key]);
    }
    console.log('[Seeder] Seeded subscription tier configurations');

    // 2. Seed Demo Therapist
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('Password123!', salt);

    const therapist = await Therapist.create({
      name: 'Dr. Ananya Sharma',
      email: 'dr.sharma@unfazed.in',
      password_hash,
      slug: 'dr-sharma',
      bio: 'Licensed Clinical Psychologist with 8+ years specializing in Anxiety Disorders, CBT, and Mindfulness-based Stress Reduction. Empowering individuals to build emotional resilience.',
      specializations: ['Cognitive Behavioral Therapy (CBT)', 'Generalized Anxiety', 'Burnout & Work Stress', 'Depression'],
      languages: ['English', 'Hindi'],
      qualifications: 'M.Phil Clinical Psychology (NIMHANS), RCI Certified',
      experienceYears: 8,
      hourlyRate: 2000,
      currency: 'INR',
      tier: 'growth', // growth plan enables SOAP notes & packages
      avatarUrl: 'https://images.unsplash.com/photo-1594824813572-c5112beec021?w=800&auto=format&fit=crop&q=80',
      customTheme: {
        primaryColor: '#4f46e5',
        bannerUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&auto=format&fit=crop&q=80'
      }
    });

    console.log(`[Seeder] Seeded Therapist: ${therapist.name} (Slug: /${therapist.slug})`);

    // 3. Seed Availability
    await Availability.create({
      therapist_id: therapist._id,
      timezone: 'Asia/Kolkata',
      weeklySchedule: [
        { dayOfWeek: 1, isWorkingDay: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
        { dayOfWeek: 2, isWorkingDay: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
        { dayOfWeek: 3, isWorkingDay: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
        { dayOfWeek: 4, isWorkingDay: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
        { dayOfWeek: 5, isWorkingDay: true, slots: [{ startTime: '10:00', endTime: '17:00' }] },
        { dayOfWeek: 6, isWorkingDay: true, slots: [{ startTime: '11:00', endTime: '15:00' }] },
        { dayOfWeek: 0, isWorkingDay: false, slots: [] }
      ],
      bufferMinutes: 15,
      sessionDurations: [45, 60]
    });

    // 4. Seed Packages
    const pkg1 = await Package.create({
      therapist_id: therapist._id,
      title: '3-Session Anxiety Reset',
      description: 'Foundational CBT tools to de-escalate acute panic and establish daily regulation.',
      totalSessions: 3,
      price: 5400,
      discountPercent: 10,
      validityDays: 60
    });

    const pkg2 = await Package.create({
      therapist_id: therapist._id,
      title: '6-Session Deep Transformation',
      description: 'Comprehensive psychological recalibration, thought restructuring, and relapse prevention.',
      totalSessions: 6,
      price: 10200,
      discountPercent: 15,
      validityDays: 120
    });

    // 5. Seed Clients
    const client1 = await Client.create({
      therapist_id: therapist._id,
      name: 'Aarav Patel',
      email: 'aarav.patel@gmail.com',
      phone: '+91 98201 12345',
      status: 'active',
      tags: ['Anxiety', 'Weekly'],
      intakeData: {
        age: 29,
        gender: 'Male',
        presentingConcern: 'Chronic workplace burnout, recurring panic attacks during team presentations.',
        medicalHistory: 'No chronic physical conditions. Mild insomnia past 4 months.',
        currentMedications: 'None',
        emergencyContact: {
          name: 'Meera Patel',
          relationship: 'Spouse',
          phone: '+91 98201 54321'
        }
      },
      consentAgreed: true,
      consentTimestamp: new Date(Date.now() - 20 * 86400000)
    });

    const client2 = await Client.create({
      therapist_id: therapist._id,
      name: 'Pooja Verma',
      email: 'pooja.v@outlook.com',
      phone: '+91 98450 67890',
      status: 'active',
      tags: ['CBT', 'Bi-weekly'],
      intakeData: {
        age: 34,
        gender: 'Female',
        presentingConcern: 'Social anxiety, fear of negative evaluation in group settings.',
        medicalHistory: 'Asthma (controlled with inhaler)',
        currentMedications: 'Inhaler as needed',
        emergencyContact: {
          name: 'Vikram Verma',
          relationship: 'Brother',
          phone: '+91 98450 11223'
        }
      },
      consentAgreed: true,
      consentTimestamp: new Date(Date.now() - 15 * 86400000)
    });

    const client3 = await Client.create({
      therapist_id: therapist._id,
      name: 'Rohan Mehta',
      email: 'rohan.mehta@yahoo.com',
      phone: '+91 97112 33445',
      status: 'active',
      tags: ['Mindfulness', 'Stress'],
      intakeData: {
        age: 41,
        gender: 'Male',
        presentingConcern: 'Executive stress and sleep fragmentation.',
        medicalHistory: 'None',
        currentMedications: 'Melatonin occasional',
        emergencyContact: {
          name: 'Sunita Mehta',
          relationship: 'Wife',
          phone: '+91 97112 99887'
        }
      },
      consentAgreed: true,
      consentTimestamp: new Date(Date.now() - 10 * 86400000)
    });

    console.log('[Seeder] Seeded 3 clients with intake & consent forms');

    // 6. Seed Sessions
    const pastDate1 = new Date(Date.now() - 7 * 86400000);
    const pastDate2 = new Date(Date.now() - 2 * 86400000);
    const tomorrow = new Date(Date.now() + 1 * 86400000);
    tomorrow.setHours(11, 0, 0, 0);
    const dayAfter = new Date(Date.now() + 2 * 86400000);
    dayAfter.setHours(15, 0, 0, 0);

    const s1 = await Session.create({
      therapist_id: therapist._id,
      client_id: client1._id,
      startTime: pastDate1,
      endTime: new Date(pastDate1.getTime() + 60 * 60000),
      durationMinutes: 60,
      status: 'completed',
      meetingLink: 'https://meet.jit.si/unfazed-dr-sharma-aarav'
    });

    const s2 = await Session.create({
      therapist_id: therapist._id,
      client_id: client2._id,
      startTime: pastDate2,
      endTime: new Date(pastDate2.getTime() + 60 * 60000),
      durationMinutes: 60,
      status: 'completed',
      meetingLink: 'https://meet.jit.si/unfazed-dr-sharma-pooja'
    });

    const s3 = await Session.create({
      therapist_id: therapist._id,
      client_id: client1._id,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 60 * 60000),
      durationMinutes: 60,
      status: 'scheduled',
      meetingLink: 'https://meet.jit.si/unfazed-dr-sharma-aarav'
    });

    const s4 = await Session.create({
      therapist_id: therapist._id,
      client_id: client3._id,
      startTime: dayAfter,
      endTime: new Date(dayAfter.getTime() + 60 * 60000),
      durationMinutes: 60,
      status: 'scheduled',
      meetingLink: 'https://meet.jit.si/unfazed-dr-sharma-rohan'
    });

    // 7. Seed Payments
    const pay1 = await Payment.create({
      gateway_transaction_id: 'pay_rzp_mock_001',
      therapist_id: therapist._id,
      client_id: client1._id,
      session_id: s1._id,
      amount: 2000,
      platform_fee: 100,
      net_amount: 1900,
      currency: 'INR',
      status: 'captured',
      invoiceNumber: 'UNF-982101',
      invoiceUrl: '/api/payments/invoice/by-number/UNF-982101',
      createdAt: pastDate1
    });

    const pay2 = await Payment.create({
      gateway_transaction_id: 'pay_rzp_mock_002',
      therapist_id: therapist._id,
      client_id: client2._id,
      session_id: s2._id,
      amount: 2000,
      platform_fee: 100,
      net_amount: 1900,
      currency: 'INR',
      status: 'captured',
      invoiceNumber: 'UNF-982102',
      invoiceUrl: '/api/payments/invoice/by-number/UNF-982102',
      createdAt: pastDate2
    });

    const pay3 = await Payment.create({
      gateway_transaction_id: 'pay_rzp_mock_003',
      therapist_id: therapist._id,
      client_id: client3._id,
      package_id: pkg1._id,
      amount: 5400,
      platform_fee: 270,
      net_amount: 5130,
      currency: 'INR',
      status: 'captured',
      invoiceNumber: 'UNF-982103',
      invoiceUrl: '/api/payments/invoice/by-number/UNF-982103',
      createdAt: new Date(Date.now() - 3 * 86400000)
    });

    // 8. Seed Clinical Notes (Private vs Shared demonstration)
    // Note 1: Confidential Clinical Private Note (Therapist eyes only)
    await SessionNote.create({
      session_id: s1._id,
      therapist_id: therapist._id,
      client_id: client1._id,
      type: 'private',
      title: 'Initial Intake Clinical Evaluation',
      format: 'soap',
      soapData: {
        subjective: 'Client reports intense apprehension regarding upcoming Q3 management review. Physical sensations include palpitations and diaphragmatic tension.',
        objective: 'Affect appears anxious, speech pace slightly elevated. Good eye contact maintained throughout.',
        assessment: 'Generalized Anxiety with acute situational panic triggers. High introspective capacity and motivated for CBT homework.',
        plan: '1. Introduce 4-7-8 physiological sigh technique. 2. Client to maintain Thought Record daily for catastrophic thoughts.'
      }
    });

    // Note 2: Shared Takeaways (Visible to client in their portal)
    await SessionNote.create({
      session_id: s1._id,
      therapist_id: therapist._id,
      client_id: client1._id,
      type: 'shared',
      title: 'Session 1: Key Takeaways & Action Plan',
      format: 'freeform',
      content: 'Great work today Aarav. Remember: Anxiety is a physiological surge, not a prophecy of failure. Practice the 4-7-8 breathing exercise whenever you feel chest tightness, and note down your automatic thoughts in the workbook before next Tuesday.'
    });

    console.log('[Seeder] Seeded sessions, payments, and private vs. shared clinical notes');
    console.log('----------------------------------------------------');
    console.log('  SUCCESS! Seed database ready.');
    console.log('  Therapist Login: dr.sharma@unfazed.in');
    console.log('  Password:        Password123!');
    console.log(`  Public Link:     http://localhost:5173/dr-sharma`);
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('[Seeder Error]:', err);
    process.exit(1);
  }
};

seedData();
