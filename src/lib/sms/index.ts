export interface SMSProvider {
  sendSMS(to: string, message: string): Promise<{ success: boolean; id?: string; error?: string }>;
}

export class MockSMSProvider implements SMSProvider {
  async sendSMS(to: string, message: string) {
    console.log(`[MOCK SMS] To: ${to} | Message: ${message}`);
    return { success: true, id: `mock_${Date.now()}` };
  }
}

export const smsService = new MockSMSProvider();

export const SMS_TEMPLATES = {
  assignmentReminder: (studentName: string, subject: string) =>
    `Hi! Reminder for ${studentName}: Your ${subject} assignment is due today. Log in to Acculum to complete it.`,
  quizReminder: (studentName: string, topic: string) =>
    `Hi! ${studentName}, your ${topic} quiz is scheduled for today. Practice well! — Acculum`,
  teacherAlert: (teacherName: string, studentName: string, topic: string) =>
    `${teacherName}, ${studentName} may need support in ${topic}. Check the Acculum dashboard for details.`,
  weeklyReport: (studentName: string, score: number) =>
    `Weekly update: ${studentName} completed ${score}% of assigned activities this week. Great job! — Acculum`,
  parentReport: (studentName: string, subject: string) =>
    `This week ${studentName} excelled in ${subject}. Keep encouraging their curiosity! — Acculum`,
};
