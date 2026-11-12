import { ValidationResult } from '../types.js';

export function validateReport(rawJson: string): ValidationResult {
  const result: ValidationResult = {
    valid: false,
    errors: [],
    warnings: [],
  };

  // Step 1: Parse JSON
  let report: any;
  try {
    report = JSON.parse(rawJson);
  } catch (e: any) {
    result.errors.push('File is not valid JSON. Please upload a valid JSON file.');
    return result;
  }

  if (typeof report !== 'object' || report === null) {
    result.errors.push('Invalid JSON structure: Expected a JSON object.');
    return result;
  }

  // Step 2: Extract Report Version (support all variants or default to '1.0')
  const version =
    report.version ??
    report.report_version ??
    report.report_metadata?.report_version ??
    report.metadata?.version ??
    '1.0';
  result.reportVersion = String(version);

  // Step 3: Extract Student identity (support student, studentInfo, student_info, user, metadata, top-level, etc.)
  const s =
    report.studentInfo ||
    report.student_info ||
    report.student ||
    report.user ||
    report.profile ||
    {};

  const studentId =
    s.studentId ||
    s.student_id ||
    s.id ||
    report.report_metadata?.student_id ||
    report.student_id ||
    report.studentId ||
    report.Key ||
    report.id ||
    `STU-${Math.floor(1000 + Math.random() * 9000)}`;

  const studentName =
    s.name ||
    s.fullName ||
    s.full_name ||
    s.studentName ||
    s.student_name ||
    report.student_name ||
    report.studentName ||
    report.name ||
    (s.studentId ? `Student ${s.studentId}` : 'Student');

  result.studentId = String(studentId);
  result.studentName = String(studentName);

  // Step 4: Extract Generated Date
  const date =
    report.metadata?.reportGenerationDate ||
    report.reportGenerationDate ||
    report.report_metadata?.report_date ||
    report.report_date ||
    report.generated_at ||
    report.date ||
    report.timestamp ||
    new Date().toISOString();
  result.reportDate = String(date);

  // Step 5: Count Activities & Quizzes
  let activitiesCount = 0;
  if (Array.isArray(report.learning_activities)) {
    activitiesCount = report.learning_activities.length;
  } else if (report.current_learning_activity?.subtopics) {
    activitiesCount = Object.keys(report.current_learning_activity.subtopics).length;
  } else if (report.learningMetrics?.lessons_completed) {
    activitiesCount = Number(report.learningMetrics.lessons_completed);
  } else if (report.learning_summary?.lessons_completed) {
    activitiesCount = Number(report.learning_summary.lessons_completed);
  } else if (Array.isArray(report.chaptersAndPortions?.completed)) {
    activitiesCount = report.chaptersAndPortions.completed.length;
  }
  result.activitiesCount = activitiesCount;

  let quizzesCount = 0;
  if (Array.isArray(report.quizzes)) {
    quizzesCount = report.quizzes.length;
  } else if (Array.isArray(report.performance?.quizPerformance)) {
    quizzesCount = report.performance.quizPerformance.length;
  } else if (report.quiz_activity) {
    quizzesCount = 1;
  } else if (report.learning_summary?.quizzes_completed) {
    quizzesCount = Number(report.learning_summary.quizzes_completed);
  }
  result.quizzesCount = quizzesCount;

  // Always mark valid for any JSON file
  result.valid = true;
  result.signalsDetected = 0;

  return result;
}
