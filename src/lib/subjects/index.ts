export type SubjectId =
  | 'mathematics'
  | 'science'
  | 'science-physics'
  | 'science-chemistry'
  | 'science-biology'
  | 'social-science'
  | 'social-history'
  | 'social-geography'
  | 'social-civics'
  | 'social-economics'
  | 'english'
  | 'kannada'
  | 'hindi'
  | 'computer-science';

export interface Subject {
  id: SubjectId;
  name: string;
  shortName: string;
  icon: string;
  color: string;        // Tailwind text color
  bgColor: string;      // Tailwind bg color
  borderColor: string;  // Tailwind border color
  lightBg: string;      // Tailwind light bg
  parentId?: SubjectId; // For sub-subjects like Physics under Science
  classes: number[];    // which classes have this subject (5-10)
  description: string;
}

export const SUBJECTS: Subject[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    shortName: 'Math',
    icon: '🔢',
    color: 'text-purple-600',
    bgColor: 'bg-purple-600',
    borderColor: 'border-purple-300',
    lightBg: 'bg-purple-50',
    classes: [5, 6, 7, 8, 9, 10],
    description: 'Numbers, algebra, geometry, statistics and more',
  },
  {
    id: 'science',
    name: 'Science',
    shortName: 'Science',
    icon: '🔬',
    color: 'text-teal-600',
    bgColor: 'bg-teal-600',
    borderColor: 'border-teal-300',
    lightBg: 'bg-teal-50',
    classes: [5, 6, 7, 8, 9, 10],
    description: 'Physics, Chemistry and Biology',
  },
  {
    id: 'science-physics',
    name: 'Physics',
    shortName: 'Physics',
    icon: '⚡',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-600',
    borderColor: 'border-yellow-300',
    lightBg: 'bg-yellow-50',
    parentId: 'science',
    classes: [9, 10],
    description: 'Force, Motion, Electricity, Light and more',
  },
  {
    id: 'science-chemistry',
    name: 'Chemistry',
    shortName: 'Chemistry',
    icon: '🧪',
    color: 'text-green-600',
    bgColor: 'bg-green-600',
    borderColor: 'border-green-300',
    lightBg: 'bg-green-50',
    parentId: 'science',
    classes: [9, 10],
    description: 'Atoms, molecules, reactions and matter',
  },
  {
    id: 'science-biology',
    name: 'Biology',
    shortName: 'Biology',
    icon: '🌱',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-600',
    borderColor: 'border-emerald-300',
    lightBg: 'bg-emerald-50',
    parentId: 'science',
    classes: [9, 10],
    description: 'Life, cells, ecosystems and human body',
  },
  {
    id: 'social-science',
    name: 'Social Science',
    shortName: 'Social',
    icon: '🌍',
    color: 'text-orange-600',
    bgColor: 'bg-orange-600',
    borderColor: 'border-orange-300',
    lightBg: 'bg-orange-50',
    classes: [5, 6, 7, 8, 9, 10],
    description: 'History, Geography, Civics and Economics',
  },
  {
    id: 'social-history',
    name: 'History',
    shortName: 'History',
    icon: '🏛️',
    color: 'text-amber-700',
    bgColor: 'bg-amber-700',
    borderColor: 'border-amber-300',
    lightBg: 'bg-amber-50',
    parentId: 'social-science',
    classes: [5, 6, 7, 8, 9, 10],
    description: 'Ancient, medieval and modern history of India and the world',
  },
  {
    id: 'social-geography',
    name: 'Geography',
    shortName: 'Geography',
    icon: '🗺️',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600',
    borderColor: 'border-blue-300',
    lightBg: 'bg-blue-50',
    parentId: 'social-science',
    classes: [5, 6, 7, 8, 9, 10],
    description: 'Physical and human geography of India and the world',
  },
  {
    id: 'social-civics',
    name: 'Civics / Political Science',
    shortName: 'Civics',
    icon: '⚖️',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-600',
    borderColor: 'border-indigo-300',
    lightBg: 'bg-indigo-50',
    parentId: 'social-science',
    classes: [5, 6, 7, 8, 9, 10],
    description: 'Government, democracy and rights of citizens',
  },
  {
    id: 'social-economics',
    name: 'Economics',
    shortName: 'Economics',
    icon: '📊',
    color: 'text-rose-600',
    bgColor: 'bg-rose-600',
    borderColor: 'border-rose-300',
    lightBg: 'bg-rose-50',
    parentId: 'social-science',
    classes: [9, 10],
    description: 'Development, money, markets and the Indian economy',
  },
  {
    id: 'english',
    name: 'English',
    shortName: 'English',
    icon: '📝',
    color: 'text-blue-700',
    bgColor: 'bg-blue-700',
    borderColor: 'border-blue-300',
    lightBg: 'bg-blue-50',
    classes: [5, 6, 7, 8, 9, 10],
    description: 'Reading, writing, grammar and literature',
  },
  {
    id: 'kannada',
    name: 'Kannada',
    shortName: 'ಕನ್ನಡ',
    icon: '🅺',
    color: 'text-red-600',
    bgColor: 'bg-red-600',
    borderColor: 'border-red-300',
    lightBg: 'bg-red-50',
    classes: [5, 6, 7, 8, 9, 10],
    description: 'ಕನ್ನಡ ಭಾಷೆ, ಸಾಹಿತ್ಯ ಮತ್ತು ವ್ಯಾಕರಣ',
  },
  {
    id: 'hindi',
    name: 'Hindi',
    shortName: 'हिन्दी',
    icon: '🇮🇳',
    color: 'text-orange-700',
    bgColor: 'bg-orange-700',
    borderColor: 'border-orange-300',
    lightBg: 'bg-orange-50',
    classes: [5, 6, 7, 8, 9, 10],
    description: 'हिन्दी भाषा, साहित्य और व्याकरण',
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    shortName: 'CS',
    icon: '💻',
    color: 'text-slate-600',
    bgColor: 'bg-slate-600',
    borderColor: 'border-slate-300',
    lightBg: 'bg-slate-50',
    classes: [5, 6, 7, 8, 9, 10],
    description: 'Programming, internet safety and digital literacy',
  },
];

// Chapters/topics per subject per class
export interface Chapter {
  id: string;
  subjectId: SubjectId;
  class: number;
  title: string;
  topics: string[];
  estimatedWeeks: number;
}

export const CHAPTERS: Chapter[] = [
  // Mathematics Chapters
  { id: 'math-5-1', subjectId: 'mathematics', class: 5, title: 'Numbers and Operations', topics: ['Place Value', 'Addition & Subtraction', 'Multiplication', 'Division'], estimatedWeeks: 3 },
  { id: 'math-5-2', subjectId: 'mathematics', class: 5, title: 'Fractions and Decimals', topics: ['Fractions', 'Equivalent Fractions', 'Decimals', 'Operations on Fractions'], estimatedWeeks: 3 },
  { id: 'math-6-1', subjectId: 'mathematics', class: 6, title: 'Knowing Our Numbers', topics: ['Comparing Numbers', 'Large Numbers', 'Roman Numerals', 'Estimation'], estimatedWeeks: 2 },
  { id: 'math-6-2', subjectId: 'mathematics', class: 6, title: 'Playing with Numbers', topics: ['Factors and Multiples', 'LCM and HCF', 'Prime Numbers', 'Divisibility Rules'], estimatedWeeks: 3 },
  { id: 'math-7-1', subjectId: 'mathematics', class: 7, title: 'Integers', topics: ['Positive and Negative Numbers', 'Operations on Integers', 'Properties of Integers'], estimatedWeeks: 2 },
  { id: 'math-7-2', subjectId: 'mathematics', class: 7, title: 'Fractions and Decimals', topics: ['Multiplication of Fractions', 'Division of Fractions', 'Decimal Operations'], estimatedWeeks: 3 },
  { id: 'math-7-3', subjectId: 'mathematics', class: 7, title: 'Data Handling and Probability', topics: ['Mean, Median, Mode', 'Probability', 'Bar Graphs'], estimatedWeeks: 3 },
  { id: 'math-8-1', subjectId: 'mathematics', class: 8, title: 'Rational Numbers', topics: ['Properties of Rational Numbers', 'Operations', 'Representation on Number Line'], estimatedWeeks: 2 },
  { id: 'math-8-2', subjectId: 'mathematics', class: 8, title: 'Algebraic Expressions', topics: ['Terms and Factors', 'Addition and Subtraction', 'Multiplication', 'Identities'], estimatedWeeks: 3 },
  { id: 'math-9-1', subjectId: 'mathematics', class: 9, title: 'Number Systems', topics: ['Real Numbers', 'Irrational Numbers', 'Representation', 'Laws of Exponents'], estimatedWeeks: 3 },
  { id: 'math-9-2', subjectId: 'mathematics', class: 9, title: 'Polynomials', topics: ['Polynomials in one variable', 'Zeroes of a polynomial', "Remainder Theorem", "Factor Theorem"], estimatedWeeks: 3 },
  { id: 'math-10-1', subjectId: 'mathematics', class: 10, title: 'Real Numbers', topics: ['Euclid\'s Division Lemma', 'Fundamental Theorem of Arithmetic', 'Irrational Numbers', 'Rational Numbers and Decimals'], estimatedWeeks: 2 },
  { id: 'math-10-2', subjectId: 'mathematics', class: 10, title: 'Polynomials', topics: ['Geometric Meaning of Zeroes', 'Relationship between Zeroes and Coefficients', 'Division Algorithm'], estimatedWeeks: 2 },
  { id: 'math-10-3', subjectId: 'mathematics', class: 10, title: 'Quadratic Equations', topics: ['Standard Form', 'Solutions by Factorisation', 'Completing the Square', 'Discriminant'], estimatedWeeks: 3 },
  
  // Science Chapters (Classes 5-8 unified)
  { id: 'sci-5-1', subjectId: 'science', class: 5, title: 'Living and Non-Living Things', topics: ['Characteristics of Living Things', 'Plants', 'Animals', 'Adaptation'], estimatedWeeks: 2 },
  { id: 'sci-5-2', subjectId: 'science', class: 5, title: 'Food and Health', topics: ['Nutrients', 'Food Groups', 'Balanced Diet', 'Hygiene'], estimatedWeeks: 2 },
  { id: 'sci-6-1', subjectId: 'science', class: 6, title: 'Food: Where does it come from?', topics: ['Food Sources', 'Plant Parts as Food', 'Animal Products'], estimatedWeeks: 2 },
  { id: 'sci-7-1', subjectId: 'science', class: 7, title: 'Nutrition in Plants', topics: ['Photosynthesis', 'Saprophytes', 'Parasites', 'Symbiosis'], estimatedWeeks: 2 },
  { id: 'sci-7-2', subjectId: 'science', class: 7, title: 'Heat and Temperature', topics: ['Hot and Cold', 'Thermometer', 'Conduction', 'Convection', 'Radiation'], estimatedWeeks: 3 },
  { id: 'sci-8-1', subjectId: 'science', class: 8, title: 'Crop Production and Management', topics: ['Agricultural Practices', 'Soil', 'Irrigation', 'Weeding', 'Storage'], estimatedWeeks: 2 },
  { id: 'sci-8-2', subjectId: 'science', class: 8, title: 'Force and Pressure', topics: ['Force', 'Pressure', 'Atmospheric Pressure', 'Liquid Pressure'], estimatedWeeks: 2 },
  
  // Physics (Classes 9-10)
  { id: 'phy-9-1', subjectId: 'science-physics', class: 9, title: 'Motion', topics: ['Distance and Displacement', 'Speed and Velocity', 'Acceleration', 'Equations of Motion', 'Graphs'], estimatedWeeks: 3 },
  { id: 'phy-9-2', subjectId: 'science-physics', class: 9, title: 'Force and Laws of Motion', topics: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", 'Inertia', 'Momentum'], estimatedWeeks: 3 },
  { id: 'phy-10-1', subjectId: 'science-physics', class: 10, title: 'Electricity', topics: ['Electric Current', 'Resistance', "Ohm's Law", 'Series and Parallel Circuits', 'Electric Power'], estimatedWeeks: 4 },
  { id: 'phy-10-2', subjectId: 'science-physics', class: 10, title: 'Light — Reflection and Refraction', topics: ['Laws of Reflection', 'Curved Mirrors', 'Refraction', 'Lenses', 'Power of a Lens'], estimatedWeeks: 4 },
  
  // Chemistry (Classes 9-10)
  { id: 'chem-9-1', subjectId: 'science-chemistry', class: 9, title: 'Matter in our Surroundings', topics: ['States of Matter', 'Evaporation', 'Boiling and Melting Points', 'Diffusion'], estimatedWeeks: 2 },
  { id: 'chem-10-1', subjectId: 'science-chemistry', class: 10, title: 'Chemical Reactions and Equations', topics: ['Balancing Equations', 'Types of Reactions', 'Oxidation and Reduction', 'Corrosion'], estimatedWeeks: 3 },
  { id: 'chem-10-2', subjectId: 'science-chemistry', class: 10, title: 'Acids, Bases and Salts', topics: ['Properties of Acids and Bases', 'pH Scale', 'Neutralisation', 'Salts'], estimatedWeeks: 3 },
  
  // Biology (Classes 9-10)
  { id: 'bio-9-1', subjectId: 'science-biology', class: 9, title: 'The Fundamental Unit of Life', topics: ['Cell Structure', 'Cell Organelles', 'Prokaryotic and Eukaryotic Cells', 'Cell Division'], estimatedWeeks: 3 },
  { id: 'bio-10-1', subjectId: 'science-biology', class: 10, title: 'Life Processes', topics: ['Nutrition', 'Respiration', 'Transportation', 'Excretion'], estimatedWeeks: 3 },
  { id: 'bio-10-2', subjectId: 'science-biology', class: 10, title: 'Heredity and Evolution', topics: ['Heredity', 'Mendel\'s Laws', 'Variations', 'Evolution', 'Natural Selection'], estimatedWeeks: 3 },
  
  // Social Science History
  { id: 'hist-5-1', subjectId: 'social-history', class: 5, title: 'Our Past', topics: ['Prehistoric Period', 'Indus Valley Civilisation', 'Vedic Period'], estimatedWeeks: 3 },
  { id: 'hist-8-1', subjectId: 'social-history', class: 8, title: 'How, When and Where', topics: ['Periodisation of Indian History', 'Colonial Rule', 'Sources of History'], estimatedWeeks: 2 },
  { id: 'hist-9-1', subjectId: 'social-history', class: 9, title: 'The French Revolution', topics: ['Causes', 'Events', 'Impact on Europe', 'Napoleon'], estimatedWeeks: 3 },
  { id: 'hist-10-1', subjectId: 'social-history', class: 10, title: 'The Rise of Nationalism in Europe', topics: ['French Revolution and Nation', 'Making of Nationalism', 'Age of Revolutions', 'Nation States'], estimatedWeeks: 3 },
  
  // Geography
  { id: 'geo-5-1', subjectId: 'social-geography', class: 5, title: 'Maps and Globe', topics: ['Cardinal Directions', 'Scale', 'Types of Maps', 'Using a Globe'], estimatedWeeks: 2 },
  { id: 'geo-9-1', subjectId: 'social-geography', class: 9, title: 'India — Size and Location', topics: ['Location', 'Latitudinal and Longitudinal Extent', 'India and the World', 'States and Territories'], estimatedWeeks: 2 },
  { id: 'geo-10-1', subjectId: 'social-geography', class: 10, title: 'Resources and Development', topics: ['Types of Resources', 'Resource Planning', 'Land Resources', 'Soil Types'], estimatedWeeks: 2 },
  
  // English
  { id: 'eng-5-1', subjectId: 'english', class: 5, title: 'Reading and Comprehension', topics: ['Reading Strategies', 'Comprehension Questions', 'Main Idea and Details', 'Inference'], estimatedWeeks: 3 },
  { id: 'eng-7-1', subjectId: 'english', class: 7, title: 'Grammar Essentials', topics: ['Parts of Speech', 'Tenses', 'Voice', 'Reported Speech', 'Clauses'], estimatedWeeks: 4 },
  { id: 'eng-9-1', subjectId: 'english', class: 9, title: 'Literature — Prose', topics: ['Story Analysis', 'Characters', 'Theme', 'Author\'s Purpose'], estimatedWeeks: 3 },
  { id: 'eng-10-1', subjectId: 'english', class: 10, title: 'Writing Skills', topics: ['Formal Letters', 'Articles', 'Descriptive Writing', 'Essay Writing'], estimatedWeeks: 3 },
];

export function getSubjectById(id: SubjectId): Subject | undefined {
  return SUBJECTS.find(s => s.id === id);
}

export function getSubjectsForClass(classNum: number): Subject[] {
  return SUBJECTS.filter(s => s.classes.includes(classNum) && !s.parentId);
}

export function getChaptersForSubjectAndClass(subjectId: SubjectId, classNum: number): Chapter[] {
  return CHAPTERS.filter(c => c.subjectId === subjectId && c.class === classNum);
}

export function getAllSubjectsFlat(): Subject[] {
  return SUBJECTS;
}
