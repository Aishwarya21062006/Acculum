import type { CareerPath } from '@/types';

export const CAREER_PATHS: CareerPath[] = [
  {
    id: 'software-dev',
    title: 'Software Developer',
    icon: '💻',
    description: 'Build apps, websites, and software that power the world.',
    requiredSkills: ['Logical Thinking', 'Problem Solving', 'Mathematics', 'Programming', 'Creativity'],
    suggestedSubjects: ['Mathematics', 'Computer Science', 'Physics'],
    aiEvolution: 'AI is automating routine coding. Focus on system design, problem-solving, and AI tool usage.',
    roadmap: [
      { class: 5, focus: 'Basic Computer Skills', skills: ['Typing', 'Internet Safety', 'Basic Logic'] },
      { class: 6, focus: 'Introduction to Algorithms', skills: ['Problem Decomposition', 'Flowcharts'] },
      { class: 7, focus: 'Scratch/Block Coding', skills: ['Variables', 'Loops', 'Conditions'] },
      { class: 8, focus: 'Python Basics', skills: ['Functions', 'Lists', 'Input/Output'] },
      { class: 9, focus: 'Web & App Fundamentals', skills: ['HTML/CSS basics', 'Data Types', 'Mini Projects'] },
      { class: 10, focus: 'Project Building', skills: ['Full Mini-Project', 'Portfolio', 'APIs'] },
      { class: 'Higher Ed', focus: 'B.Tech / BCA / BSc CS', skills: ['DSA', 'Web Dev', 'Database', 'AI basics'] },
      { class: 'Career', focus: 'Software Engineer', skills: ['System Design', 'Cloud', 'AI/ML Tools'] },
    ],
  },
  {
    id: 'scientist',
    title: 'Scientist',
    icon: '🔬',
    description: 'Explore the unknown and push the boundaries of human knowledge.',
    requiredSkills: ['Curiosity', 'Critical Thinking', 'Mathematics', 'Research', 'Analysis'],
    suggestedSubjects: ['Science', 'Mathematics', 'English'],
    aiEvolution: 'AI is accelerating research. Scientists now use AI to analyze data, simulate experiments, and discover patterns.',
    roadmap: [
      { class: 5, focus: 'Scientific Curiosity', skills: ['Observation', 'Questioning', 'Basic Experiments'] },
      { class: 6, focus: 'Scientific Method', skills: ['Hypothesis', 'Testing', 'Recording'] },
      { class: 7, focus: 'Biology & Chemistry Basics', skills: ['Cell Theory', 'Elements', 'Reactions'] },
      { class: 8, focus: 'Physics Fundamentals', skills: ['Force', 'Motion', 'Energy', 'Electricity'] },
      { class: 9, focus: 'Advanced Science', skills: ['Organic Chemistry', 'Genetics', 'Modern Physics'] },
      { class: 10, focus: 'Science Projects', skills: ['Research', 'Science Fairs', 'Lab Skills'] },
      { class: 'Higher Ed', focus: 'B.Sc / B.Tech + Research', skills: ['Specialization', 'Lab Research', 'Publications'] },
      { class: 'Career', focus: 'Research Scientist', skills: ['AI Tools', 'Data Analysis', 'Grant Writing'] },
    ],
  },
  {
    id: 'robotics-engineer',
    title: 'Robotics Engineer',
    icon: '🤖',
    description: 'Design and build the robots that will shape the future.',
    requiredSkills: ['Engineering', 'Programming', 'Physics', 'Mathematics', 'Problem Solving'],
    suggestedSubjects: ['Mathematics', 'Science', 'Computer Science'],
    aiEvolution: 'AI is the brain of modern robots. Robotics engineers increasingly integrate AI/ML into their designs.',
    roadmap: [
      { class: 5, focus: 'Simple Machines', skills: ['Levers', 'Pulleys', 'Basic Circuits'] },
      { class: 6, focus: 'Electronics Basics', skills: ['Components', 'LED circuits', 'Logic'] },
      { class: 7, focus: 'Mechanics & Motion', skills: ['Gears', 'Motors', 'Force'] },
      { class: 8, focus: 'Arduino/Microcontrollers', skills: ['Basic Programming', 'Sensors', 'Actuators'] },
      { class: 9, focus: 'Robot Design', skills: ['CAD Basics', 'Sensors Integration', 'Control Systems'] },
      { class: 10, focus: 'Mini Robot Project', skills: ['Full Build', 'Programming', 'Testing'] },
      { class: 'Higher Ed', focus: 'B.Tech in Robotics/Mechatronics', skills: ['AI/ML', 'Control Systems', 'Computer Vision'] },
      { class: 'Career', focus: 'Robotics Engineer', skills: ['ROS', 'Deep Learning', 'System Integration'] },
    ],
  },
  {
    id: 'doctor',
    title: 'Doctor',
    icon: '🩺',
    description: 'Heal people and make a difference in countless lives.',
    requiredSkills: ['Biology', 'Chemistry', 'Empathy', 'Attention to Detail', 'Communication'],
    suggestedSubjects: ['Science', 'Mathematics', 'English'],
    aiEvolution: 'AI assists doctors with diagnosis and drug discovery. Doctors focus more on patient care, complex decisions, and empathy.',
    roadmap: [
      { class: 5, focus: 'Human Body Basics', skills: ['Organs', 'Systems', 'Health & Hygiene'] },
      { class: 6, focus: 'Disease & Health', skills: ['Germs', 'Immunity', 'First Aid'] },
      { class: 7, focus: 'Biology Fundamentals', skills: ['Cell Biology', 'Plant & Animal Life'] },
      { class: 8, focus: 'Chemistry Basics', skills: ['Elements', 'Compounds', 'Chemical Reactions'] },
      { class: 9, focus: 'Advanced Biology', skills: ['Genetics', 'Nervous System', 'Hormones'] },
      { class: 10, focus: 'Science Foundations', skills: ['Physics', 'Chemistry', 'Biology Preparation for NEET'] },
      { class: 'Higher Ed', focus: 'MBBS / BDS / BAMS', skills: ['Clinical Training', 'Anatomy', 'Pharmacology'] },
      { class: 'Career', focus: 'Doctor / Specialist', skills: ['AI Diagnostics', 'Telemedicine', 'Research'] },
    ],
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    icon: '📊',
    description: 'Turn raw numbers into powerful insights that drive decisions.',
    requiredSkills: ['Statistics', 'Critical Thinking', 'Mathematics', 'Visualization', 'Curiosity'],
    suggestedSubjects: ['Mathematics', 'Computer Science', 'Science'],
    aiEvolution: 'AI automates routine data tasks. Data analysts now focus on insight generation, storytelling, and strategy.',
    roadmap: [
      { class: 5, focus: 'Data & Patterns', skills: ['Bar Graphs', 'Pie Charts', 'Data Collection'] },
      { class: 6, focus: 'Statistics Basics', skills: ['Mean', 'Median', 'Mode'] },
      { class: 7, focus: 'Probability', skills: ['Chance', 'Predictions', 'Experiments'] },
      { class: 8, focus: 'Algebra & Functions', skills: ['Linear Equations', 'Graphs', 'Relationships'] },
      { class: 9, focus: 'Advanced Statistics', skills: ['Standard Deviation', 'Correlation', 'Sampling'] },
      { class: 10, focus: 'Data Projects', skills: ['Excel/Sheets', 'Data Stories', 'Mini Analysis Projects'] },
      { class: 'Higher Ed', focus: 'B.Sc Statistics / Data Science', skills: ['Python', 'SQL', 'ML Basics', 'Visualization'] },
      { class: 'Career', focus: 'Data Analyst / Data Scientist', skills: ['AI Tools', 'Business Intelligence', 'Storytelling'] },
    ],
  },
  {
    id: 'designer',
    title: 'Designer',
    icon: '🎨',
    description: 'Create beautiful experiences that connect with people.',
    requiredSkills: ['Creativity', 'Visual Thinking', 'Communication', 'Attention to Detail', 'Empathy'],
    suggestedSubjects: ['Art', 'English', 'Computer Science'],
    aiEvolution: 'AI tools generate designs, but human creativity, taste, and emotional understanding remain irreplaceable.',
    roadmap: [
      { class: 5, focus: 'Art Foundations', skills: ['Color Theory', 'Drawing', 'Observation'] },
      { class: 6, focus: 'Design Elements', skills: ['Shape', 'Pattern', 'Texture', 'Balance'] },
      { class: 7, focus: 'Digital Art Intro', skills: ['MS Paint/Canva', 'Typography', 'Layouts'] },
      { class: 8, focus: 'Communication Design', skills: ['Posters', 'Infographics', 'Visual Stories'] },
      { class: 9, focus: 'UI/UX Concepts', skills: ['User Thinking', 'Wireframes', 'Prototypes'] },
      { class: 10, focus: 'Portfolio Project', skills: ['Full Design Project', 'Presentation', 'Branding'] },
      { class: 'Higher Ed', focus: 'B.Des / Fine Arts / HCI', skills: ['Figma', 'Adobe Suite', 'User Research'] },
      { class: 'Career', focus: 'UI/UX or Graphic Designer', skills: ['AI Design Tools', 'Motion Design', 'Brand Strategy'] },
    ],
  },
];

export function getCareerById(id: string) {
  return CAREER_PATHS.find(c => c.id === id);
}

export function getCareersByInterest(interests: string[]) {
  const map: Record<string, string[]> = {
    Robotics: ['robotics-engineer', 'software-dev', 'scientist'],
    Technology: ['software-dev', 'data-analyst', 'robotics-engineer'],
    Gaming: ['software-dev', 'designer', 'data-analyst'],
    Science: ['scientist', 'doctor', 'robotics-engineer'],
    Art: ['designer', 'scientist', 'software-dev'],
    Music: ['designer', 'software-dev'],
    Cricket: ['data-analyst', 'doctor', 'scientist'],
    Football: ['data-analyst', 'doctor', 'scientist'],
    Reading: ['doctor', 'scientist', 'designer'],
  };
  const recommendedIds = new Set<string>();
  interests.forEach(i => (map[i] || []).forEach(id => recommendedIds.add(id)));
  if (recommendedIds.size === 0) return CAREER_PATHS.slice(0, 3);
  return CAREER_PATHS.filter(c => recommendedIds.has(c.id)).slice(0, 4);
}
