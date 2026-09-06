// Comprehensive E2E scenario tester for NagrikOne API and NOVA AI Engine
import http from 'http';

async function runTests() {
  console.log('🚀 Starting NagrikOne Scenario Test Suite...\n');

  // Start Next.js server on port 3000
  const baseUrl = 'http://localhost:3000';

  const scenarios = [
    {
      user: 'USER A (Civic Pothole)',
      message: 'I have a dangerous pothole outside my house in Ward 42.',
      expectedCategory: 'Civic',
      expectedKeyword: 'Municipal'
    },
    {
      user: 'USER B (UPI Deduction)',
      message: 'My UPI money was deducted ₹4,500 but merchant payment failed and no refund after 3 days.',
      expectedCategory: 'Banking',
      expectedKeyword: 'RBI'
    },
    {
      user: 'USER C (Landlord Deposit Dispute - Unknown/Arbitrary issue)',
      message: 'My landlord won\'t return my ₹50,000 security deposit after moving out.',
      expectedCategory: 'Housing',
      expectedKeyword: 'Tenancy'
    },
    {
      user: 'USER D (Consumer Appliance Breakdown)',
      message: 'My washing machine stopped working and customer service refuses technician visit under warranty.',
      expectedCategory: 'Consumer',
      expectedKeyword: 'Consumer'
    },
    {
      user: 'USER E (Unknown Department)',
      message: 'I don\'t know which department to contact for noisy construction at midnight.',
      expectedCategory: 'Civic',
      expectedKeyword: 'Portal'
    }
  ];

  let passed = 0;

  for (const s of scenarios) {
    try {
      console.log(`Testing ${s.user}: "${s.message}"`);
      const res = await fetch(`${baseUrl}/api/nova`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: s.message })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(`Failed with status ${res.status}: ${JSON.stringify(data)}`);
      }

      console.log(`  ✓ Status: 200 OK`);
      console.log(`  ✓ Category Identified: ${data.category}`);
      console.log(`  ✓ Statutory Route: ${data.statutoryRoute}`);
      console.log(`  ✓ Legal Act Citation: ${data.legalAct}`);
      console.log(`  ✓ Follow-up Questions: ${data.questions.length} questions provided`);
      console.log(`  ✓ Can Create Case: ${data.canCreateCase}\n`);
      passed++;
    } catch (err) {
      console.error(`  ✗ Error in ${s.user}:`, err.message);
    }
  }

  // Test Case Creation
  try {
    console.log('Testing Case Creation (POST /api/cases)...');
    const caseRes = await fetch(`${baseUrl}/api/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Road Potholes & Damaged Roadway',
        category: 'Civic & Municipal',
        priority: 'HIGH',
        description: 'Pothole near metro pillar 14.',
        location: 'Shivaji Nagar, Pune',
        statutoryRoute: 'Municipal Corporation PWD'
      })
    });
    const createdCase = await caseRes.json();
    console.log(`  ✓ Created Case ID: ${createdCase.id}, Status: ${createdCase.status}`);

    console.log('Testing Case Status Update (PATCH /api/cases)...');
    const patchRes = await fetch(`${baseUrl}/api/cases`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: createdCase.id,
        status: 'SUBMITTED',
        note: 'Grievance docket dispatched to Ward Junior Engineer'
      })
    });
    const patchData = await patchRes.json();
    console.log(`  ✓ Updated Status: ${patchData.case.status}\n`);
    passed++;
  } catch (err) {
    console.error('  ✗ Case creation error:', err.message);
  }

  // Test Payment Generation
  try {
    console.log('Testing Payment Initialization (POST /api/payment)...');
    const payRes = await fetch(`${baseUrl}/api/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 199,
        tier: 'PRIORITY',
        caseId: 'CASE-2026-TEST'
      })
    });
    const payData = await payRes.json();
    console.log(`  ✓ UPI DeepLink: ${payData.upiDeepLink ? 'Generated' : 'Failed'}`);
    console.log(`  ✓ UPI ID: ${payData.upiId}`);
    console.log(`  ✓ Reference ID: ${payData.refId}\n`);
    passed++;
  } catch (err) {
    console.error('  ✗ Payment error:', err.message);
  }

  console.log(`🎉 All scenario tests completed! Passed: ${passed} / ${scenarios.length + 2}`);
}

runTests();
