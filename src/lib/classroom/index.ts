// ============================================================
// ACCULUM — Classroom Data Layer
// ============================================================

export type ClassroomStatus = 'completed' | 'currently-teaching' | 'upcoming';

export interface ClassroomTopic {
  id: string;
  topic: string;
  completedDate?: string;  // e.g. '26 Sep 2026'
  status: ClassroomStatus;
}

export interface ClassroomChapter {
  id: string;
  chapterTitle: string;
  subjectId: string;
  subjectName: string;
  subjectIcon: string;
  subjectColor: string;   // Tailwind text class
  subjectBg: string;      // Tailwind bg class
  topics: ClassroomTopic[];
  overallStatus: ClassroomStatus;
}

export interface TimetablePeriod {
  period: number;
  startTime: string;
  endTime: string;
  subjectName: string;
  subjectIcon: string;
  subjectColor: string;
  subjectBg: string;
  teacher: string;
  room?: string;
}

export interface TimetableDay {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periods: TimetablePeriod[];
}

export interface DailySummaryEntry {
  subjectName: string;
  subjectIcon: string;
  subjectColor: string;
  topicsCovered: string[];
  keyConcepts: string[];
  activity?: string;
  homework?: string;
  upcomingTopic?: string;
}

export interface DailySummary {
  date: string;    // e.g. 'Today, 26 Sep 2026'
  day: string;     // e.g. 'Friday'
  entries: DailySummaryEntry[];
}

// ============================================================
// DEMO DATA
// ============================================================

export const CLASSROOM_PORTIONS: ClassroomChapter[] = [
  {
    id: 'math-fractions',
    chapterTitle: 'Fractions',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    subjectIcon: '🔢',
    subjectColor: 'text-purple-600',
    subjectBg: 'bg-purple-50',
    overallStatus: 'completed',
    topics: [
      { id: 't1', topic: 'Meaning and Types of Fractions', completedDate: '10 Sep 2026', status: 'completed' },
      { id: 't2', topic: 'Equivalent Fractions', completedDate: '12 Sep 2026', status: 'completed' },
      { id: 't3', topic: 'Comparing Fractions (Like Denominators)', completedDate: '15 Sep 2026', status: 'completed' },
      { id: 't4', topic: 'Comparing Fractions (Unlike Denominators)', completedDate: '17 Sep 2026', status: 'completed' },
      { id: 't5', topic: 'Addition and Subtraction of Fractions', completedDate: '20 Sep 2026', status: 'completed' },
    ],
  },
  {
    id: 'math-linear-eq',
    chapterTitle: 'Linear Equations',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    subjectIcon: '🔢',
    subjectColor: 'text-purple-600',
    subjectBg: 'bg-purple-50',
    overallStatus: 'completed',
    topics: [
      { id: 't6', topic: 'Introduction to Linear Equations', completedDate: '22 Sep 2026', status: 'completed' },
      { id: 't7', topic: 'Solving One-Variable Equations', completedDate: '24 Sep 2026', status: 'completed' },
    ],
  },
  {
    id: 'math-algebra',
    chapterTitle: 'Algebraic Expressions',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    subjectIcon: '🔢',
    subjectColor: 'text-purple-600',
    subjectBg: 'bg-purple-50',
    overallStatus: 'currently-teaching',
    topics: [
      { id: 't8', topic: 'Terms and Factors', completedDate: '25 Sep 2026', status: 'completed' },
      { id: 't9', topic: 'Addition and Subtraction of Expressions', status: 'currently-teaching' },
      { id: 't10', topic: 'Multiplication of Expressions', status: 'upcoming' },
      { id: 't11', topic: 'Algebraic Identities', status: 'upcoming' },
    ],
  },
  {
    id: 'math-geometry',
    chapterTitle: 'Basic Geometry',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    subjectIcon: '🔢',
    subjectColor: 'text-purple-600',
    subjectBg: 'bg-purple-50',
    overallStatus: 'upcoming',
    topics: [
      { id: 't12', topic: 'Lines and Angles', status: 'upcoming' },
      { id: 't13', topic: 'Triangles', status: 'upcoming' },
      { id: 't14', topic: 'Quadrilaterals', status: 'upcoming' },
    ],
  },
  {
    id: 'sci-photosynthesis',
    chapterTitle: 'Nutrition in Plants',
    subjectId: 'science',
    subjectName: 'Science',
    subjectIcon: '🔬',
    subjectColor: 'text-teal-600',
    subjectBg: 'bg-teal-50',
    overallStatus: 'completed',
    topics: [
      { id: 't15', topic: 'Photosynthesis — Process and Significance', completedDate: '8 Sep 2026', status: 'completed' },
      { id: 't16', topic: 'Chlorophyll and Leaf Structure', completedDate: '10 Sep 2026', status: 'completed' },
      { id: 't17', topic: 'Saprophytic and Parasitic Nutrition', completedDate: '12 Sep 2026', status: 'completed' },
    ],
  },
  {
    id: 'sci-force',
    chapterTitle: 'Force and Pressure',
    subjectId: 'science',
    subjectName: 'Science',
    subjectIcon: '🔬',
    subjectColor: 'text-teal-600',
    subjectBg: 'bg-teal-50',
    overallStatus: 'currently-teaching',
    topics: [
      { id: 't18', topic: 'Contact and Non-Contact Forces', completedDate: '23 Sep 2026', status: 'completed' },
      { id: 't19', topic: 'Pressure and its Applications', status: 'currently-teaching' },
      { id: 't20', topic: 'Atmospheric Pressure', status: 'upcoming' },
      { id: 't21', topic: 'Liquid Pressure', status: 'upcoming' },
    ],
  },
  {
    id: 'eng-grammar',
    chapterTitle: 'Grammar Essentials',
    subjectId: 'english',
    subjectName: 'English',
    subjectIcon: '📝',
    subjectColor: 'text-blue-600',
    subjectBg: 'bg-blue-50',
    overallStatus: 'completed',
    topics: [
      { id: 't22', topic: 'Parts of Speech — Revision', completedDate: '5 Sep 2026', status: 'completed' },
      { id: 't23', topic: 'Tenses — Present, Past, Future', completedDate: '9 Sep 2026', status: 'completed' },
      { id: 't24', topic: 'Active and Passive Voice', completedDate: '16 Sep 2026', status: 'completed' },
      { id: 't25', topic: 'Direct and Indirect Speech', completedDate: '22 Sep 2026', status: 'completed' },
    ],
  },
  {
    id: 'eng-writing',
    chapterTitle: 'Writing Skills',
    subjectId: 'english',
    subjectName: 'English',
    subjectIcon: '📝',
    subjectColor: 'text-blue-600',
    subjectBg: 'bg-blue-50',
    overallStatus: 'currently-teaching',
    topics: [
      { id: 't26', topic: 'Descriptive Writing', completedDate: '25 Sep 2026', status: 'completed' },
      { id: 't27', topic: 'Formal Letter Writing', status: 'currently-teaching' },
      { id: 't28', topic: 'Essay Writing', status: 'upcoming' },
    ],
  },
  {
    id: 'soc-french-rev',
    chapterTitle: 'The French Revolution',
    subjectId: 'social-science',
    subjectName: 'Social Science',
    subjectIcon: '🌍',
    subjectColor: 'text-orange-600',
    subjectBg: 'bg-orange-50',
    overallStatus: 'completed',
    topics: [
      { id: 't29', topic: 'Causes of the French Revolution', completedDate: '14 Sep 2026', status: 'completed' },
      { id: 't30', topic: 'Key Events and Timeline', completedDate: '18 Sep 2026', status: 'completed' },
      { id: 't31', topic: 'Impact on Europe and the World', completedDate: '23 Sep 2026', status: 'completed' },
    ],
  },
  {
    id: 'soc-nationalism',
    chapterTitle: 'Rise of Nationalism in Europe',
    subjectId: 'social-science',
    subjectName: 'Social Science',
    subjectIcon: '🌍',
    subjectColor: 'text-orange-600',
    subjectBg: 'bg-orange-50',
    overallStatus: 'upcoming',
    topics: [
      { id: 't32', topic: 'What is Nationalism?', status: 'upcoming' },
      { id: 't33', topic: 'Unification of Germany and Italy', status: 'upcoming' },
      { id: 't34', topic: 'Visualising the Nation', status: 'upcoming' },
    ],
  },
];

// ============================================================
// TIMETABLE
// ============================================================

export const WEEKLY_TIMETABLE: TimetableDay[] = [
  {
    day: 'Monday',
    periods: [
      { period: 1, startTime: '9:00', endTime: '9:45', subjectName: 'Mathematics', subjectIcon: '🔢', subjectColor: 'text-purple-700', subjectBg: 'bg-purple-100', teacher: 'Mrs. Lakshmi' },
      { period: 2, startTime: '9:45', endTime: '10:30', subjectName: 'Science', subjectIcon: '🔬', subjectColor: 'text-teal-700', subjectBg: 'bg-teal-100', teacher: 'Mr. Ravi' },
      { period: 3, startTime: '11:00', endTime: '11:45', subjectName: 'English', subjectIcon: '📝', subjectColor: 'text-blue-700', subjectBg: 'bg-blue-100', teacher: 'Mrs. Preethi' },
      { period: 4, startTime: '11:45', endTime: '12:30', subjectName: 'Social Science', subjectIcon: '🌍', subjectColor: 'text-orange-700', subjectBg: 'bg-orange-100', teacher: 'Mr. Suresh' },
      { period: 5, startTime: '1:15', endTime: '2:00', subjectName: 'Kannada', subjectIcon: '🇰', subjectColor: 'text-red-700', subjectBg: 'bg-red-100', teacher: 'Mrs. Kavitha' },
      { period: 6, startTime: '2:00', endTime: '2:45', subjectName: 'Computer Science', subjectIcon: '💻', subjectColor: 'text-slate-700', subjectBg: 'bg-slate-100', teacher: 'Mr. Anil' },
    ],
  },
  {
    day: 'Tuesday',
    periods: [
      { period: 1, startTime: '9:00', endTime: '9:45', subjectName: 'Science', subjectIcon: '🔬', subjectColor: 'text-teal-700', subjectBg: 'bg-teal-100', teacher: 'Mr. Ravi' },
      { period: 2, startTime: '9:45', endTime: '10:30', subjectName: 'Mathematics', subjectIcon: '🔢', subjectColor: 'text-purple-700', subjectBg: 'bg-purple-100', teacher: 'Mrs. Lakshmi' },
      { period: 3, startTime: '11:00', endTime: '11:45', subjectName: 'Social Science', subjectIcon: '🌍', subjectColor: 'text-orange-700', subjectBg: 'bg-orange-100', teacher: 'Mr. Suresh' },
      { period: 4, startTime: '11:45', endTime: '12:30', subjectName: 'Hindi', subjectIcon: '🇮🇳', subjectColor: 'text-amber-700', subjectBg: 'bg-amber-100', teacher: 'Mrs. Anitha' },
      { period: 5, startTime: '1:15', endTime: '2:00', subjectName: 'English', subjectIcon: '📝', subjectColor: 'text-blue-700', subjectBg: 'bg-blue-100', teacher: 'Mrs. Preethi' },
      { period: 6, startTime: '2:00', endTime: '2:45', subjectName: 'Kannada', subjectIcon: '🇰', subjectColor: 'text-red-700', subjectBg: 'bg-red-100', teacher: 'Mrs. Kavitha' },
    ],
  },
  {
    day: 'Wednesday',
    periods: [
      { period: 1, startTime: '9:00', endTime: '9:45', subjectName: 'English', subjectIcon: '📝', subjectColor: 'text-blue-700', subjectBg: 'bg-blue-100', teacher: 'Mrs. Preethi' },
      { period: 2, startTime: '9:45', endTime: '10:30', subjectName: 'Social Science', subjectIcon: '🌍', subjectColor: 'text-orange-700', subjectBg: 'bg-orange-100', teacher: 'Mr. Suresh' },
      { period: 3, startTime: '11:00', endTime: '11:45', subjectName: 'Mathematics', subjectIcon: '🔢', subjectColor: 'text-purple-700', subjectBg: 'bg-purple-100', teacher: 'Mrs. Lakshmi' },
      { period: 4, startTime: '11:45', endTime: '12:30', subjectName: 'Science', subjectIcon: '🔬', subjectColor: 'text-teal-700', subjectBg: 'bg-teal-100', teacher: 'Mr. Ravi' },
      { period: 5, startTime: '1:15', endTime: '2:00', subjectName: 'Computer Science', subjectIcon: '💻', subjectColor: 'text-slate-700', subjectBg: 'bg-slate-100', teacher: 'Mr. Anil' },
      { period: 6, startTime: '2:00', endTime: '2:45', subjectName: 'Hindi', subjectIcon: '🇮🇳', subjectColor: 'text-amber-700', subjectBg: 'bg-amber-100', teacher: 'Mrs. Anitha' },
    ],
  },
  {
    day: 'Thursday',
    periods: [
      { period: 1, startTime: '9:00', endTime: '9:45', subjectName: 'Mathematics', subjectIcon: '🔢', subjectColor: 'text-purple-700', subjectBg: 'bg-purple-100', teacher: 'Mrs. Lakshmi' },
      { period: 2, startTime: '9:45', endTime: '10:30', subjectName: 'Kannada', subjectIcon: '🇰', subjectColor: 'text-red-700', subjectBg: 'bg-red-100', teacher: 'Mrs. Kavitha' },
      { period: 3, startTime: '11:00', endTime: '11:45', subjectName: 'Science', subjectIcon: '🔬', subjectColor: 'text-teal-700', subjectBg: 'bg-teal-100', teacher: 'Mr. Ravi' },
      { period: 4, startTime: '11:45', endTime: '12:30', subjectName: 'English', subjectIcon: '📝', subjectColor: 'text-blue-700', subjectBg: 'bg-blue-100', teacher: 'Mrs. Preethi' },
      { period: 5, startTime: '1:15', endTime: '2:00', subjectName: 'Social Science', subjectIcon: '🌍', subjectColor: 'text-orange-700', subjectBg: 'bg-orange-100', teacher: 'Mr. Suresh' },
      { period: 6, startTime: '2:00', endTime: '2:45', subjectName: 'Mathematics', subjectIcon: '🔢', subjectColor: 'text-purple-700', subjectBg: 'bg-purple-100', teacher: 'Mrs. Lakshmi' },
    ],
  },
  {
    day: 'Friday',
    periods: [
      { period: 1, startTime: '9:00', endTime: '9:45', subjectName: 'Science', subjectIcon: '🔬', subjectColor: 'text-teal-700', subjectBg: 'bg-teal-100', teacher: 'Mr. Ravi' },
      { period: 2, startTime: '9:45', endTime: '10:30', subjectName: 'English', subjectIcon: '📝', subjectColor: 'text-blue-700', subjectBg: 'bg-blue-100', teacher: 'Mrs. Preethi' },
      { period: 3, startTime: '11:00', endTime: '11:45', subjectName: 'Hindi', subjectIcon: '🇮🇳', subjectColor: 'text-amber-700', subjectBg: 'bg-amber-100', teacher: 'Mrs. Anitha' },
      { period: 4, startTime: '11:45', endTime: '12:30', subjectName: 'Mathematics', subjectIcon: '🔢', subjectColor: 'text-purple-700', subjectBg: 'bg-purple-100', teacher: 'Mrs. Lakshmi' },
      { period: 5, startTime: '1:15', endTime: '2:00', subjectName: 'Kannada', subjectIcon: '🇰', subjectColor: 'text-red-700', subjectBg: 'bg-red-100', teacher: 'Mrs. Kavitha' },
      { period: 6, startTime: '2:00', endTime: '2:45', subjectName: 'Social Science', subjectIcon: '🌍', subjectColor: 'text-orange-700', subjectBg: 'bg-orange-100', teacher: 'Mr. Suresh' },
    ],
  },
];

// ============================================================
// DAILY SUMMARY
// ============================================================

export const DAILY_SUMMARIES: DailySummary[] = [
  {
    date: 'Today, 26 Sep 2026',
    day: 'Friday',
    entries: [
      {
        subjectName: 'Mathematics',
        subjectIcon: '🔢',
        subjectColor: 'text-purple-600',
        topicsCovered: ['Addition of Algebraic Expressions', 'Subtraction of Algebraic Expressions'],
        keyConcepts: ['Like and unlike terms', 'Collecting like terms before simplifying', 'Sign rules during subtraction'],
        activity: 'Solved 5 problems from the textbook in pairs',
        homework: 'Exercise 12.2 — Q1 to Q8 (page 196)',
        upcomingTopic: 'Multiplication of Algebraic Expressions',
      },
      {
        subjectName: 'Science',
        subjectIcon: '🔬',
        subjectColor: 'text-teal-600',
        topicsCovered: ['Pressure and its Applications'],
        keyConcepts: ['Pressure = Force ÷ Area', 'Why sharp objects pierce easily (smaller area → more pressure)', 'Applications: buildings, tyres, skis'],
        activity: 'Demonstration with an inflated balloon and a pin board',
        homework: 'Read pages 112–115 and write definitions of pressure, thrust, and pascal',
        upcomingTopic: 'Atmospheric Pressure',
      },
      {
        subjectName: 'English',
        subjectIcon: '📝',
        subjectColor: 'text-blue-600',
        topicsCovered: ['Formal Letter Writing — Format and Structure'],
        keyConcepts: ['Sender address, date, receiver address, subject, salutation, body, closing'],
        activity: 'Drafted a formal letter to the school principal requesting a library visit',
        homework: 'Write a formal letter to the editor of a newspaper about a local issue (min 120 words)',
        upcomingTopic: 'Essay Writing — Introduction and Structure',
      },
    ],
  },
  {
    date: 'Yesterday, 25 Sep 2026',
    day: 'Thursday',
    entries: [
      {
        subjectName: 'Mathematics',
        subjectIcon: '🔢',
        subjectColor: 'text-purple-600',
        topicsCovered: ['Terms and Factors in Algebraic Expressions'],
        keyConcepts: ['Variables, constants, coefficients', 'Monomials, binomials, trinomials', 'Identifying terms in an expression'],
        activity: 'Group activity — classifying expressions into categories',
        homework: 'Exercise 12.1 — all questions',
        upcomingTopic: 'Addition and Subtraction of Algebraic Expressions',
      },
      {
        subjectName: 'Science',
        subjectIcon: '🔬',
        subjectColor: 'text-teal-600',
        topicsCovered: ['Contact and Non-Contact Forces — Revision', 'Introduction to Pressure'],
        keyConcepts: ['Friction, tension, normal force (contact)', 'Gravity, magnetic force (non-contact)', 'Pressure concept introduction'],
        activity: 'Quiz on Force chapter (5 questions)',
        homework: 'No homework — prepare for tomorrow\'s demonstration',
        upcomingTopic: 'Pressure and its Applications',
      },
      {
        subjectName: 'Social Science',
        subjectIcon: '🌍',
        subjectColor: 'text-orange-600',
        topicsCovered: ['Impact of French Revolution on the World'],
        keyConcepts: ['Spread of ideals to neighbouring countries', 'Napoleon and legal reforms', 'Influence on Indian freedom movement'],
        activity: 'Class discussion on the quote: "Liberty, Equality, Fraternity"',
        homework: 'Chapter 1 revision — prepare 5 important questions for tomorrow\'s revision',
        upcomingTopic: 'Rise of Nationalism in Europe — Introduction',
      },
    ],
  },
];

// ============================================================
// HELPERS
// ============================================================

export function getStatusLabel(status: ClassroomStatus): string {
  switch (status) {
    case 'completed': return 'Completed';
    case 'currently-teaching': return 'Currently Teaching';
    case 'upcoming': return 'Upcoming';
  }
}

export function getStatusStyles(status: ClassroomStatus): { badge: string; dot: string } {
  switch (status) {
    case 'completed':
      return { badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' };
    case 'currently-teaching':
      return { badge: 'bg-blue-100 text-blue-700 border border-blue-200', dot: 'bg-blue-500 animate-pulse' };
    case 'upcoming':
      return { badge: 'bg-slate-100 text-slate-500 border border-slate-200', dot: 'bg-slate-300' };
  }
}

export function getTodayDayName(): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
}

export function getTodayTimetable(): TimetableDay | undefined {
  const today = getTodayDayName();
  return WEEKLY_TIMETABLE.find(d => d.day === today);
}

export function getSubjectsByStatus(status: ClassroomStatus): ClassroomChapter[] {
  return CLASSROOM_PORTIONS.filter(c => c.overallStatus === status);
}
