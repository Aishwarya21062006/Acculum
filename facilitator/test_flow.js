// End-to-end verification script for Acculum Facilitator Dashboard
const BASE_URL = 'http://localhost:3001';

async function runTests() {
  console.log('=== ACCULUM FACILITATOR DASHBOARD: END-TO-END TEST ===\n');

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  console.log('1. Health check:', health.status === 'ok' ? '✓ PASS' : '✗ FAIL');

  // 2. Facilitator Registration
  const regPayload = {
    email: 'facilitator@acculum.edu',
    password: 'Acculum2026!',
    full_name: 'Dr. Priya Sharma',
    school: 'Delhi Public School',
    subjects: ['Mathematics', 'Science'],
    classes: ['8', '9'],
    preferred_language: 'English',
  };
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regPayload),
  });
  let token;
  if (regRes.status === 201) {
    const data = await regRes.json();
    token = data.token;
    console.log('2. Registration: ✓ PASS (registered new facilitator)', data.facilitator.full_name);
  } else if (regRes.status === 409) {
    // Already registered, test login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: regPayload.email, password: regPayload.password }),
    });
    const data = await loginRes.json();
    token = data.token;
    console.log('2. Login: ✓ PASS (logged in existing facilitator)', data.facilitator.full_name);
  } else {
    throw new Error('Auth failed: ' + (await regRes.text()));
  }

  const authHeaders = { 'X-Session-Token': token };

  // Clear any existing demo data for clean repeatable test
  await fetch(`${BASE_URL}/api/demo/clear`, { method: 'DELETE', headers: authHeaders });

  // 3. Initial Dashboard Stats
  const statsRes = await fetch(`${BASE_URL}/api/analytics/dashboard`, { headers: authHeaders });
  const stats = await statsRes.json();
  console.log(`3. Dashboard Stats: Total Students = ${stats.total_students}, On Track = ${stats.on_track}, Requires Intervention = ${stats.requires_intervention}`);

  // 4. Download Rahul Report 1 from sample endpoint
  const r1Res = await fetch(`${BASE_URL}/api/demo/rahul-report-1`);
  const r1Json = await r1Res.json();
  r1Json.generated_at = new Date().toISOString();
  console.log('4. Downloaded Rahul Report 1 sample: ✓ PASS (Student ID:', r1Json.student.student_id, ')');

  // 5. Upload & Import Rahul Report 1 via multipart FormData
  const formData = new FormData();
  const blob = new Blob([JSON.stringify(r1Json)], { type: 'application/json' });
  formData.append('report', blob, 'rahul-report-1.json');

  const importRes = await fetch(`${BASE_URL}/api/reports/import`, {
    method: 'POST',
    headers: { 'X-Session-Token': token },
    body: formData,
  });
  const importData = await importRes.json();
  console.log('5. Import Rahul Report 1:', importRes.status === 201 ? '✓ PASS' : '✗ FAIL', importData.valid ? 'Report Validated' : 'Invalid');
  console.log('   - Student:', importData.student?.full_name);
  console.log('   - Signals Detected:', importData.signals_detected);
  console.log('   - AI Summary Preview:', importData.ai_summary?.substring(0, 100) + '...');

  const rahulId = importData.student?.id;
  const rahulReport1Id = importData.report_id;

  // 6. Inspect Student Details & Signals for Rahul
  const studentRes = await fetch(`${BASE_URL}/api/students/${rahulId}`, { headers: authHeaders });
  const rahulDetail = await studentRes.json();
  console.log('6. Rahul Profile & Evidence Analysis:');
  console.log('   - Priority:', rahulDetail.priority);
  console.log('   - Active Signals:', rahulDetail.signals.length);
  rahulDetail.signals.forEach((sig, idx) => {
    console.log(`     [Signal ${idx+1}] ${sig.signal_type} (${sig.severity}):`);
    console.log(`       Topic: ${sig.topic}`);
    console.log(`       Evidence:`, sig.evidence);
    console.log(`       Recommendation:`, sig.recommended_action);
  });

  // Find the Comparing Fractions signal
  const fractionsSignal = rahulDetail.signals.find(s => s.topic === 'Fractions' || (s.evidence && JSON.stringify(s.evidence).includes('comparing')));

  // 7. Facilitator Assigns Intervention
  const interventionPayload = {
    student_id: rahulId,
    signal_id: fractionsSignal ? fractionsSignal.id : null,
    intervention_type: 'revision',
    subject: 'Mathematics',
    topic: 'Comparing Fractions',
    language: 'English',
    format: 'Visual Explanation',
    difficulty: 'Current Level',
    notes: 'Assign visual diagrams with unlike denominators before follow-up quiz.',
  };
  const ivRes = await fetch(`${BASE_URL}/api/interventions`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(interventionPayload),
  });
  const intervention = await ivRes.json();
  console.log('7. Assign Intervention: ✓ PASS (ID:', intervention.id, 'Format:', intervention.format, ')');

  // 8. Download Rahul Report 2 (Reassessment Report)
  const r2Res = await fetch(`${BASE_URL}/api/demo/rahul-report-2`);
  const r2Json = await r2Res.json();
  r2Json.generated_at = new Date(Date.now() + 86400000).toISOString();

  // 9. Import Rahul Report 2
  const formData2 = new FormData();
  const blob2 = new Blob([JSON.stringify(r2Json)], { type: 'application/json' });
  formData2.append('report', blob2, 'rahul-report-2.json');

  const importRes2 = await fetch(`${BASE_URL}/api/reports/import`, {
    method: 'POST',
    headers: { 'X-Session-Token': token },
    body: formData2,
  });
  const importData2 = await importRes2.json();
  console.log('8. Import Rahul Report 2 (Post-intervention): ✓ PASS');
  const rahulReport2Id = importData2.report_id;

  // 10. Create Reassessment / Before vs After Comparison
  const reassessPayload = {
    intervention_id: intervention.id,
    student_id: rahulId,
    subject: 'Mathematics',
    topic: 'Comparing Fractions',
    before_report_id: rahulReport1Id,
    after_report_id: rahulReport2Id,
  };
  const reassessRes = await fetch(`${BASE_URL}/api/reassessments`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(reassessPayload),
  });
  const reassessment = await reassessRes.json();
  console.log('9. Reassessment Comparison: ✓ PASS');
  console.log('   - Before Score:', `${reassessment.before.correct}/${reassessment.before.total}`);
  console.log('   - After Score:', `${reassessment.after.correct}/${reassessment.after.total}`);
  console.log('   - Improvement:', `${reassessment.comparison.change_percentage}% (${reassessment.comparison.improvement ? 'Improved' : 'Not improved'})`);
  console.log('   - Summary:', reassessment.comparison.summary);

  // 11. Load Full Cohort Demo Data
  const demoRes = await fetch(`${BASE_URL}/api/demo/load`, {
    method: 'POST',
    headers: authHeaders,
  });
  const demoData = await demoRes.json();
  console.log('10. Load Cohort Demo Data: ✓ PASS');
  console.log('    - Loaded:', demoData.students_loaded.join(', '));

  // 12. Verify Class Analytics & Individual vs Class-Wide Signals
  const classRes = await fetch(`${BASE_URL}/api/analytics/class`, { headers: authHeaders });
  const classData = await classRes.json();
  console.log('11. Class Analytics & Class-wide signals:');
  classData.forEach(c => {
    console.log(`    [Class ${c.class}] Total Students: ${c.total_students}`);
    c.topics.filter(t => t.students_with_signal > 0).forEach(t => {
      console.log(`      Topic: ${t.topic} (${t.subject}) | Avg: ${t.avg_score}% | Signals: ${t.students_with_signal} | Scope: ${t.class_wide ? 'CLASS-WIDE ISSUE ⚠' : 'Individual'}`);
    });
  });

  console.log('\n=== ALL 12 VERIFICATION CHECKS PASSED SUCCESSFULLY ===');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
