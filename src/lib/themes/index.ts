/**
 * Acculum Theme Engine
 * Central source of truth for all interest-based theme content.
 * Cricket is fully implemented. Others show "coming soon" contextually.
 */

import type { Interest } from '@/types';

export interface ThemeConfig {
  id: Interest;
  icon: string;
  label: string;
  // Terminology overrides
  terms: {
    points: string;        // XP → Runs
    quiz: string;          // Quiz → Learning Match
    practice: string;      // Practice → Practice Match
    progress: string;      // Progress → Current Form
    dailyGoal: string;     // Daily Goal → Today's Target
    streak: string;        // Streak → Winning Streak
    correctAnswer: string; // Correct → Four!
    greatAnswer: string;   // Perfect → Six!
    milestone50: string;   // 50% → Half-Century
    milestone100: string;  // 100% → Century!
    assignment: string;    // Assignment → Match
    levelUp: string;       // Level Up! → Promoted to Next XI!
    complete: string;      // Complete → Innings Complete
    peerChallenge: string; // Challenge → Learning Match
  };
  // Motivational messages
  motivations: string[];
  // Score announcements
  scoreAnnouncements: {
    excellent: (score: number) => string;  // >=85
    good: (score: number) => string;       // >=60
    needsWork: (score: number) => string;  // <60
  };
  // Achievement names
  achievements: {
    firstQuiz: string;
    streak7: string;
    streak30: string;
    quizMaster: string;
    helpfulFriend: string;
    fastImprover: string;
    revisionHero: string;
    gkChampion: string;
    courseComplete: string;
    perfectScore: string;
  };
  // Is this theme fully implemented?
  implemented: boolean;
}

export const THEMES: Record<Interest, ThemeConfig> = {
  Cricket: {
    id: 'Cricket',
    icon: '🏏',
    label: 'Cricket',
    implemented: true,
    terms: {
      points: 'Runs',
      quiz: 'Learning Match',
      practice: 'Practice Match',
      progress: 'Current Form',
      dailyGoal: "Today's Target",
      streak: 'Winning Streak',
      correctAnswer: 'Four! 🏏',
      greatAnswer: 'Six! 🏏🎉',
      milestone50: 'Half-Century! 🏏',
      milestone100: 'Century! 🏆',
      assignment: 'Match Assignment',
      levelUp: 'Promoted to Next XI! 🏏',
      complete: 'Innings Complete!',
      peerChallenge: 'Learning Match',
    },
    motivations: [
      "🏏 Every great batter started at the crease. Keep going!",
      "🏏 A winning streak is built one learning session at a time!",
      "🏏 Sachin played 200+ Tests. Your consistency matters more than perfection!",
      "🏏 Read the line, play your shot — you've got this!",
      "🏏 Practice today, century tomorrow!",
      "🏏 The best players never stop learning. Neither should you.",
    ],
    scoreAnnouncements: {
      excellent: (s) => `🏏 CENTURY! You scored ${s}% — Outstanding knock!`,
      good: (s) => `🏏 HALF-CENTURY! ${s}% — Good batting, keep building your innings!`,
      needsWork: (s) => `🏏 ${s}% — Wicket down, but the innings isn't over. Revise & come back stronger!`,
    },
    achievements: {
      firstQuiz: '🏏 First Match Played!',
      streak7: '🔥 7-Day Winning Streak',
      streak30: '👑 Month Champion',
      quizMaster: '🧠 Match Winner',
      helpfulFriend: '🤝 Best Teammate',
      fastImprover: '🚀 Rising Star',
      revisionHero: '📚 Revision Champion',
      gkChampion: '🌍 GK All-Rounder',
      courseComplete: '🎓 Course Century',
      perfectScore: '⭐ Perfect Hundred!',
    },
  },
  Football: {
    id: 'Football', icon: '⚽', label: 'Football', implemented: false,
    terms: { points: 'Goals', quiz: 'Match', practice: 'Training', progress: 'Form', dailyGoal: "Today's Match", streak: 'Winning Run', correctAnswer: 'Goal! ⚽', greatAnswer: 'Hat-trick! ⚽', milestone50: 'Half-Time Lead!', milestone100: 'Full-Time Win!', assignment: 'Match Assignment', levelUp: 'Promoted!', complete: 'Match Complete!', peerChallenge: 'Match Challenge' },
    motivations: ["⚽ Train like a champion today, play like one tomorrow!"],
    scoreAnnouncements: { excellent: (s) => `⚽ GOAL! ${s}% — Champion performance!`, good: (s) => `⚽ ${s}% — Good game!`, needsWork: (s) => `⚽ ${s}% — Keep training!` },
    achievements: { firstQuiz: '⚽ First Match!', streak7: '🔥 7-Day Run', streak30: '👑 Season Champion', quizMaster: '🧠 Top Scorer', helpfulFriend: '🤝 Team Player', fastImprover: '🚀 Rising Star', revisionHero: '📚 Training Hero', gkChampion: '🌍 All-Rounder', courseComplete: '🎓 Course Complete', perfectScore: '⭐ Perfect Score!' },
  },
  Music: {
    id: 'Music', icon: '🎵', label: 'Music', implemented: false,
    terms: { points: 'Notes', quiz: 'Performance', practice: 'Rehearsal', progress: 'Current Melody', dailyGoal: "Today's Practice", streak: 'Melody Streak', correctAnswer: 'Perfect Note! 🎵', greatAnswer: 'Masterpiece! 🎵', milestone50: 'Mid-Song Mastery!', milestone100: 'Standing Ovation!', assignment: 'Performance', levelUp: 'Next Octave!', complete: 'Song Complete!', peerChallenge: 'Duet Challenge' },
    motivations: ["🎵 Every maestro started with a single note!"],
    scoreAnnouncements: { excellent: (s) => `🎵 MASTERPIECE! ${s}%!`, good: (s) => `🎵 ${s}% — Good melody!`, needsWork: (s) => `🎵 ${s}% — Keep practising!` },
    achievements: { firstQuiz: '🎵 First Performance!', streak7: '🔥 7-Day Practice', streak30: '👑 Month Maestro', quizMaster: '🧠 Virtuoso', helpfulFriend: '🤝 Duet Partner', fastImprover: '🚀 Rising Star', revisionHero: '📚 Rehearsal Hero', gkChampion: '🌍 All-Rounder', courseComplete: '🎓 Album Complete', perfectScore: '⭐ Perfect Pitch!' },
  },
  Gaming: {
    id: 'Gaming', icon: '🎮', label: 'Gaming', implemented: false,
    terms: { points: 'XP', quiz: 'Boss Battle', practice: 'Training Level', progress: 'Player Stats', dailyGoal: "Today's Quest", streak: 'Combo Streak', correctAnswer: 'Critical Hit! 🎮', greatAnswer: 'COMBO! 🎮', milestone50: 'Level 50 Reached!', milestone100: 'MAX LEVEL!', assignment: 'Quest', levelUp: 'LEVEL UP! 🎮', complete: 'Stage Clear!', peerChallenge: 'PvP Match' },
    motivations: ["🎮 Every legend started at Level 1!"],
    scoreAnnouncements: { excellent: (s) => `🎮 LEGENDARY! ${s}%!`, good: (s) => `🎮 ${s}% — Good stats!`, needsWork: (s) => `🎮 ${s}% — Respawn & retry!` },
    achievements: { firstQuiz: '🎮 First Quest Done!', streak7: '🔥 7-Day Combo', streak30: '👑 Monthly Champion', quizMaster: '🧠 Boss Slayer', helpfulFriend: '🤝 Team Player', fastImprover: '🚀 Speed Runner', revisionHero: '📚 Grinding Hero', gkChampion: '🌍 All-Rounder', courseComplete: '🎓 Game Complete', perfectScore: '⭐ Perfect Run!' },
  },
  Robotics: {
    id: 'Robotics', icon: '🤖', label: 'Robotics', implemented: false,
    terms: { points: 'Circuits', quiz: 'System Test', practice: 'Debug Session', progress: 'System Status', dailyGoal: "Today's Build", streak: 'Uptime Streak', correctAnswer: 'System OK! 🤖', greatAnswer: 'Fully Operational! 🤖', milestone50: 'Half Build!', milestone100: 'Robot Complete!', assignment: 'Build Task', levelUp: 'System Upgrade!', complete: 'Build Complete!', peerChallenge: 'Robot Battle' },
    motivations: ["🤖 Every robot started with a single wire!"],
    scoreAnnouncements: { excellent: (s) => `🤖 FULLY OPERATIONAL! ${s}%!`, good: (s) => `🤖 ${s}% — Systems online!`, needsWork: (s) => `🤖 ${s}% — Debug required!` },
    achievements: { firstQuiz: '🤖 First Build!', streak7: '🔥 7-Day Uptime', streak30: '👑 Month Engineer', quizMaster: '🧠 Master Builder', helpfulFriend: '🤝 Team Builder', fastImprover: '🚀 Fast Compiler', revisionHero: '📚 Debug Hero', gkChampion: '🌍 All-Rounder', courseComplete: '🎓 Project Complete', perfectScore: '⭐ Perfect Build!' },
  },
  Art: {
    id: 'Art', icon: '🎨', label: 'Art', implemented: false,
    terms: { points: 'Strokes', quiz: 'Gallery Test', practice: 'Sketch Session', progress: 'Your Canvas', dailyGoal: "Today's Creation", streak: 'Creative Flow', correctAnswer: 'Masterstroke! 🎨', greatAnswer: 'Masterpiece! 🎨', milestone50: 'Half Canvas!', milestone100: 'Gallery Ready!', assignment: 'Art Project', levelUp: 'New Palette!', complete: 'Artwork Done!', peerChallenge: 'Art Battle' },
    motivations: ["🎨 Every masterpiece starts with a blank canvas!"],
    scoreAnnouncements: { excellent: (s) => `🎨 MASTERPIECE! ${s}%!`, good: (s) => `🎨 ${s}% — Beautiful work!`, needsWork: (s) => `🎨 ${s}% — Keep creating!` },
    achievements: { firstQuiz: '🎨 First Artwork!', streak7: '🔥 7-Day Flow', streak30: '👑 Month Artist', quizMaster: '🧠 Master Artist', helpfulFriend: '🤝 Art Partner', fastImprover: '🚀 Rising Star', revisionHero: '📚 Sketch Hero', gkChampion: '🌍 All-Rounder', courseComplete: '🎓 Exhibition Done', perfectScore: '⭐ Perfect Piece!' },
  },
  Science: {
    id: 'Science', icon: '🔬', label: 'Science', implemented: false,
    terms: { points: 'Discoveries', quiz: 'Experiment', practice: 'Lab Session', progress: 'Research Log', dailyGoal: "Today's Experiment", streak: 'Discovery Streak', correctAnswer: 'Eureka! 🔬', greatAnswer: 'Nobel-Level! 🔬', milestone50: 'Hypothesis Confirmed!', milestone100: 'Nobel Prize!', assignment: 'Lab Report', levelUp: 'New Research Field!', complete: 'Experiment Done!', peerChallenge: 'Science Battle' },
    motivations: ["🔬 Every discovery starts with curiosity!"],
    scoreAnnouncements: { excellent: (s) => `🔬 EUREKA! ${s}%!`, good: (s) => `🔬 ${s}% — Hypothesis confirmed!`, needsWork: (s) => `🔬 ${s}% — Retry the experiment!` },
    achievements: { firstQuiz: '🔬 First Experiment!', streak7: '🔥 7-Day Research', streak30: '👑 Month Scientist', quizMaster: '🧠 Nobel Candidate', helpfulFriend: '🤝 Research Partner', fastImprover: '🚀 Rising Star', revisionHero: '📚 Lab Hero', gkChampion: '🌍 All-Rounder', courseComplete: '🎓 Project Done', perfectScore: '⭐ Perfect Results!' },
  },
  Reading: {
    id: 'Reading', icon: '📚', label: 'Reading', implemented: false,
    terms: { points: 'Pages', quiz: 'Book Quiz', practice: 'Reading Session', progress: 'Reading List', dailyGoal: "Today's Chapter", streak: 'Reading Streak', correctAnswer: 'Page Turner! 📚', greatAnswer: 'Bestseller! 📚', milestone50: 'Half Book!', milestone100: 'Book Complete!', assignment: 'Book Report', levelUp: 'Next Chapter!', complete: 'Chapter Done!', peerChallenge: 'Book Battle' },
    motivations: ["📚 Every reader was once a beginner!"],
    scoreAnnouncements: { excellent: (s) => `📚 BESTSELLER! ${s}%!`, good: (s) => `📚 ${s}% — Great reading!`, needsWork: (s) => `📚 ${s}% — Re-read and try again!` },
    achievements: { firstQuiz: '📚 First Book!', streak7: '🔥 7-Day Reading', streak30: '👑 Month Reader', quizMaster: '🧠 Bookworm', helpfulFriend: '🤝 Reading Buddy', fastImprover: '🚀 Speed Reader', revisionHero: '📚 Revision Hero', gkChampion: '🌍 All-Rounder', courseComplete: '🎓 Library Done', perfectScore: '⭐ Perfect Review!' },
  },
  Technology: {
    id: 'Technology', icon: '💻', label: 'Technology', implemented: false,
    terms: { points: 'Lines of Code', quiz: 'Code Test', practice: 'Debug Session', progress: 'Build Status', dailyGoal: "Today's Sprint", streak: 'Commit Streak', correctAnswer: 'Compiled! 💻', greatAnswer: 'Production Ready! 💻', milestone50: 'Beta Released!', milestone100: 'v1.0 Shipped!', assignment: 'Coding Task', levelUp: 'Framework Unlocked!', complete: 'PR Merged!', peerChallenge: 'Code Battle' },
    motivations: ["💻 Hello, World! Your journey starts here!"],
    scoreAnnouncements: { excellent: (s) => `💻 SHIPPED! ${s}%!`, good: (s) => `💻 ${s}% — Good code!`, needsWork: (s) => `💻 ${s}% — Debug & retry!` },
    achievements: { firstQuiz: '💻 First Commit!', streak7: '🔥 7-Day Streak', streak30: '👑 Month Developer', quizMaster: '🧠 Senior Dev', helpfulFriend: '🤝 Pair Programmer', fastImprover: '🚀 10x Dev', revisionHero: '📚 Refactor Hero', gkChampion: '🌍 All-Rounder', courseComplete: '🎓 App Shipped', perfectScore: '⭐ Zero Bugs!' },
  },
  Space: {
    id: 'Space', icon: '🚀', label: 'Space', implemented: false,
    terms: { points: 'Light Years', quiz: 'Mission', practice: 'Training', progress: 'Mission Status', dailyGoal: "Today's Mission", streak: 'Launch Streak', correctAnswer: 'Orbit Achieved! 🚀', greatAnswer: 'Moon Landing! 🚀', milestone50: 'Halfway to Space!', milestone100: 'Space Station!', assignment: 'Mission Brief', levelUp: 'New Galaxy!', complete: 'Mission Complete!', peerChallenge: 'Space Race' },
    motivations: ["🚀 One small step for learning, one giant leap for your future!"],
    scoreAnnouncements: { excellent: (s) => `🚀 LAUNCH SUCCESS! ${s}%!`, good: (s) => `🚀 ${s}% — Orbit achieved!`, needsWork: (s) => `🚀 ${s}% — Relaunch sequence initiated!` },
    achievements: { firstQuiz: '🚀 First Launch!', streak7: '🔥 7-Day Mission', streak30: '👑 Astronaut', quizMaster: '🧠 Mission Control', helpfulFriend: '🤝 Crew Member', fastImprover: '🚀 Speed of Light', revisionHero: '📚 Training Hero', gkChampion: '🌍 Cosmonaut', courseComplete: '🎓 Mission Done', perfectScore: '⭐ Perfect Trajectory!' },
  },
  Puzzles: {
    id: 'Puzzles', icon: '🧩', label: 'Puzzles', implemented: false,
    terms: { points: 'Pieces', quiz: 'Puzzle Challenge', practice: 'Puzzle Session', progress: 'Puzzle Board', dailyGoal: "Today's Puzzle", streak: 'Solve Streak', correctAnswer: 'Piece Fits! 🧩', greatAnswer: 'Puzzle Solved! 🧩', milestone50: 'Half Complete!', milestone100: 'Puzzle Master!', assignment: 'Puzzle Set', levelUp: 'New Difficulty!', complete: 'Puzzle Done!', peerChallenge: 'Puzzle Race' },
    motivations: ["🧩 Every complex puzzle is solved one piece at a time!"],
    scoreAnnouncements: { excellent: (s) => `🧩 PUZZLE MASTER! ${s}%!`, good: (s) => `🧩 ${s}% — Pieces clicking!`, needsWork: (s) => `🧩 ${s}% — Find the missing piece!` },
    achievements: { firstQuiz: '🧩 First Puzzle!', streak7: '🔥 7-Day Solve', streak30: '👑 Month Solver', quizMaster: '🧠 Grand Master', helpfulFriend: '🤝 Puzzle Buddy', fastImprover: '🚀 Speed Solver', revisionHero: '📚 Review Hero', gkChampion: '🌍 All-Rounder', courseComplete: '🎓 Set Complete', perfectScore: '⭐ Perfect Solve!' },
  },
  Nature: {
    id: 'Nature', icon: '🌱', label: 'Nature', implemented: false,
    terms: { points: 'Seeds', quiz: 'Field Study', practice: 'Garden Session', progress: 'Growth Log', dailyGoal: "Today's Explore", streak: 'Growth Streak', correctAnswer: 'Sprouted! 🌱', greatAnswer: 'Full Bloom! 🌸', milestone50: 'Half Grown!', milestone100: 'Full Harvest!', assignment: 'Field Study', levelUp: 'New Ecosystem!', complete: 'Season Complete!', peerChallenge: 'Nature Quiz' },
    motivations: ["🌱 Every great forest started with a single seed!"],
    scoreAnnouncements: { excellent: (s) => `🌱 FULL BLOOM! ${s}%!`, good: (s) => `🌱 ${s}% — Growing strong!`, needsWork: (s) => `🌱 ${s}% — Water & try again!` },
    achievements: { firstQuiz: '🌱 First Sprout!', streak7: '🔥 7-Day Growth', streak30: '👑 Month Naturalist', quizMaster: '🧠 Botanist', helpfulFriend: '🤝 Eco Buddy', fastImprover: '🚀 Fast Growth', revisionHero: '📚 Study Hero', gkChampion: '🌍 Nature Guide', courseComplete: '🎓 Season Done', perfectScore: '⭐ Perfect Garden!' },
  },
  Movies: {
    id: 'Movies', icon: '🎬', label: 'Movies', implemented: false,
    terms: { points: 'Stars', quiz: 'Film Quiz', practice: 'Script Read', progress: 'Story Arc', dailyGoal: "Today's Scene", streak: 'Screening Streak', correctAnswer: 'Action! 🎬', greatAnswer: 'Oscar Winner! 🎬', milestone50: 'Interval!', milestone100: 'The End!', assignment: 'Scene Work', levelUp: 'Director Mode!', complete: 'Scene Done!', peerChallenge: 'Film Battle' },
    motivations: ["🎬 Every blockbuster started with a single scene!"],
    scoreAnnouncements: { excellent: (s) => `🎬 OSCAR LEVEL! ${s}%!`, good: (s) => `🎬 ${s}% — Good take!`, needsWork: (s) => `🎬 ${s}% — Cut! Retake!` },
    achievements: { firstQuiz: '🎬 First Scene!', streak7: '🔥 7-Day Shoot', streak30: '👑 Month Director', quizMaster: '🧠 Best Director', helpfulFriend: '🤝 Co-Star', fastImprover: '🚀 Speed Actor', revisionHero: '📚 Script Hero', gkChampion: '🌍 Film Critic', courseComplete: '🎓 Film Done', perfectScore: '⭐ Standing Ovation!' },
  },
  Cars: {
    id: 'Cars', icon: '🏎️', label: 'Cars', implemented: false,
    terms: { points: 'Laps', quiz: 'Race Challenge', practice: 'Qualifying', progress: 'Race Position', dailyGoal: "Today's Race", streak: 'Podium Streak', correctAnswer: 'Pit Perfect! 🏎️', greatAnswer: 'Pole Position! 🏎️', milestone50: 'Halfway Through!', milestone100: 'Chequered Flag!', assignment: 'Race Brief', levelUp: 'New Engine!', complete: 'Race Complete!', peerChallenge: 'Drag Race' },
    motivations: ["🏎️ Every champion started in the slow lane!"],
    scoreAnnouncements: { excellent: (s) => `🏎️ PODIUM FINISH! ${s}%!`, good: (s) => `🏎️ ${s}% — Points scored!`, needsWork: (s) => `🏎️ ${s}% — Back to the pit!` },
    achievements: { firstQuiz: '🏎️ First Race!', streak7: '🔥 7-Day Circuit', streak30: '👑 Month Champion', quizMaster: '🧠 Race Winner', helpfulFriend: '🤝 Pit Crew', fastImprover: '🚀 Fastest Lap', revisionHero: '📚 Strategy Hero', gkChampion: '🌍 All-Rounder', courseComplete: '🎓 Season Done', perfectScore: '⭐ Perfect Lap!' },
  },
  Aviation: {
    id: 'Aviation', icon: '✈️', label: 'Aviation', implemented: false,
    terms: { points: 'Flight Hours', quiz: 'Simulator Test', practice: 'Flight Sim', progress: 'Flight Log', dailyGoal: "Today's Flight", streak: 'Flight Streak', correctAnswer: 'Cleared for Takeoff! ✈️', greatAnswer: 'Smooth Landing! ✈️', milestone50: 'Cruising Altitude!', milestone100: 'Perfect Landing!', assignment: 'Flight Plan', levelUp: 'Next Rank!', complete: 'Flight Complete!', peerChallenge: 'Air Race' },
    motivations: ["✈️ Every pilot started by dreaming of the sky!"],
    scoreAnnouncements: { excellent: (s) => `✈️ SMOOTH LANDING! ${s}%!`, good: (s) => `✈️ ${s}% — Cruising!`, needsWork: (s) => `✈️ ${s}% — Go around!` },
    achievements: { firstQuiz: '✈️ First Flight!', streak7: '🔥 7-Day Flying', streak30: '👑 Month Aviator', quizMaster: '🧠 Captain', helpfulFriend: '🤝 Co-Pilot', fastImprover: '🚀 Supersonic', revisionHero: '📚 Nav Hero', gkChampion: '🌍 Air Traffic', courseComplete: '🎓 Wings Earned', perfectScore: '⭐ Perfect Flight!' },
  },
};

/** Get the theme config for the student's primary interest */
export function getTheme(interests: Interest[]): ThemeConfig {
  const primary = interests[0];
  return THEMES[primary] || THEMES['Science'];
}

/** Get themed term (with fallback for unimplemented themes) */
export function themeTerm(interests: Interest[], termKey: keyof ThemeConfig['terms']): string {
  const theme = getTheme(interests);
  return theme.terms[termKey];
}

/** Get a random motivation message */
export function getMotivation(interests: Interest[]): string {
  const theme = getTheme(interests);
  const msgs = theme.motivations;
  return msgs[Math.floor(Math.random() * msgs.length)];
}

/** Get score announcement */
export function getScoreAnnouncement(interests: Interest[], score: number): string {
  const theme = getTheme(interests);
  if (score >= 85) return theme.scoreAnnouncements.excellent(score);
  if (score >= 60) return theme.scoreAnnouncements.good(score);
  return theme.scoreAnnouncements.needsWork(score);
}

// ============================================================
// CRICKET QUIZ QUESTIONS — Full implementation
// ============================================================

export interface ThemeQuestion {
  id: number;
  topic: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
  // The generic concept behind this question
  concept: string;
}

export const CRICKET_QUIZ_QUESTIONS: ThemeQuestion[] = [
  // Fractions
  {
    id: 1,
    topic: 'Fractions',
    concept: 'Understanding fractions as parts of a whole',
    text: "In a cricket team of 11 players, 3 are bowlers. What fraction of the team are bowlers?",
    options: ["3/8", "3/11", "8/11", "1/3"],
    correct: 1,
    explanation: "There are 3 bowlers out of 11 total players, so the fraction is 3/11. A fraction is always part ÷ whole.",
  },
  {
    id: 2,
    topic: 'Percentage',
    concept: 'Calculating percentage increase',
    text: "A batter scored 40 runs in Match 1 and 50 runs in Match 2. What is the percentage increase in his score?",
    options: ["10%", "20%", "25%", "30%"],
    correct: 2,
    explanation: "Increase = 50 - 40 = 10 runs. Percentage increase = (10/40) × 100 = 25%. Same formula works for any percentage increase problem!",
  },
  {
    id: 3,
    topic: 'Electric Current',
    concept: 'Understanding what carries charge',
    text: "Just like 11 fielders cover a cricket field, tiny particles in a wire carry electric charge. Which particle carries charge?",
    options: ["Protons", "Neutrons", "Electrons", "Atoms"],
    correct: 2,
    explanation: "Electrons carry electric charge through a wire — like fielders sprinting around the boundary, they keep the circuit (game) going!",
  },
  {
    id: 4,
    topic: 'Statistics',
    concept: 'Calculating mean/average',
    text: "Rohit scored 45, 82, 63, and 30 runs in 4 matches. What is his batting average (mean) for these matches?",
    options: ["50", "55", "60", "220"],
    correct: 1,
    explanation: "Average = Total runs ÷ Matches = (45+82+63+30) ÷ 4 = 220 ÷ 4 = 55 runs. This is exactly how batting average works in real cricket!",
  },
  {
    id: 5,
    topic: 'Probability',
    concept: 'Basic probability calculation',
    text: "A batter has a 60% chance of hitting a boundary on each delivery. If he faces 10 balls, how many boundaries are expected?",
    options: ["4", "5", "6", "7"],
    correct: 2,
    explanation: "Expected boundaries = 60% × 10 = 0.6 × 10 = 6 boundaries. Probability tells us what to expect on average!",
  },
  {
    id: 6,
    topic: 'Speed, Distance, Time',
    concept: 'Applying speed-distance-time formula',
    text: "A fielder runs 48 metres to reach the ball in 6 seconds. What is his speed?",
    options: ["6 m/s", "8 m/s", "10 m/s", "42 m/s"],
    correct: 1,
    explanation: "Speed = Distance ÷ Time = 48 ÷ 6 = 8 m/s. This is the exact Speed = D/T formula used everywhere in Physics!",
  },
];

// Generic (non-themed) quiz questions as fallback
export const GENERIC_QUIZ_QUESTIONS: ThemeQuestion[] = [
  {
    id: 1, topic: 'Electric Current', concept: 'What carries charge',
    text: "What carries the electric charge in a wire?",
    options: ["Protons", "Neutrons", "Electrons", "Atoms"],
    correct: 2,
    explanation: "Electrons are the negatively charged particles that move through conductors to create current.",
  },
  {
    id: 2, topic: 'Electric Current', concept: 'SI unit',
    text: "What is the SI unit of electric current?",
    options: ["Volt", "Watt", "Ampere", "Ohm"],
    correct: 2,
    explanation: "The Ampere (A) is the standard unit of electric current.",
  },
  {
    id: 3, topic: 'Electric Current', concept: 'Conductors',
    text: "Which of these is a good conductor of electricity?",
    options: ["Rubber", "Copper", "Wood", "Glass"],
    correct: 1,
    explanation: "Copper is an excellent conductor and is widely used in electrical wiring.",
  },
];

// ============================================================
// CRICKET ASSIGNMENTS
// ============================================================

export const CRICKET_ASSIGNMENTS = [
  {
    id: 1,
    title: '🏏 Fraction Practice Match',
    subject: 'Mathematics',
    dueDate: 'Today, 5:00 PM',
    status: 'pending',
    type: 'quiz',
    themeNote: 'Calculate batting averages and run rates using fractions!',
  },
  {
    id: 2,
    title: '🏏 Percentage Increase — Player Stats',
    subject: 'Mathematics',
    dueDate: 'Tomorrow, 10:00 AM',
    status: 'pending',
    type: 'practice',
    themeNote: 'Compare player scores across matches using percentage change.',
  },
  {
    id: 3,
    title: '🏏 Electricity & the Stadium',
    subject: 'Science',
    dueDate: 'Completed',
    status: 'completed',
    type: 'lesson',
    themeNote: 'How does a cricket stadium light up? Learn circuits!',
  },
];

export const GENERIC_ASSIGNMENTS = [
  { id: 1, title: 'Photosynthesis Quiz', subject: 'Science', dueDate: 'Today, 5:00 PM', status: 'pending', type: 'quiz', themeNote: '' },
  { id: 2, title: 'Fractions Practice', subject: 'Mathematics', dueDate: 'Tomorrow, 10:00 AM', status: 'pending', type: 'practice', themeNote: '' },
  { id: 3, title: 'Creative Writing', subject: 'English', dueDate: 'Completed', status: 'completed', type: 'essay', themeNote: '' },
];

// ============================================================
// CRICKET ACHIEVEMENTS
// ============================================================

export const CRICKET_ACHIEVEMENTS = [
  { id: 'first_quiz', icon: '🏏', name: '🏏 First Match Played!', description: 'Stepped onto the learning pitch for the first time', xp_reward: 50 },
  { id: 'streak_7', icon: '🔥', name: '7-Day Winning Streak', description: '7 consecutive days of learning — like a top-order batter!', xp_reward: 200 },
  { id: 'streak_30', icon: '👑', name: 'Month Champion', description: '30-day learning streak — World Cup winning performance!', xp_reward: 500 },
  { id: 'quiz_master', icon: '🏆', name: 'Match Winner', description: 'Scored 90%+ in 5 Learning Matches', xp_reward: 300 },
  { id: 'helpful_friend', icon: '🤝', name: 'Best Teammate', description: 'Helped a peer 3 times — true team spirit!', xp_reward: 150 },
  { id: 'fast_improver', icon: '🚀', name: 'Rising Star', description: 'Improved score by 30% — like a player hitting top form!', xp_reward: 200 },
  { id: 'revision_hero', icon: '📚', name: 'Revision Champion', description: 'Completed 5 revision sessions — solid technique!', xp_reward: 150 },
  { id: 'gk_champion', icon: '🌍', name: 'GK All-Rounder', description: 'Completed 7 daily GK challenges', xp_reward: 200 },
  { id: 'course_complete', icon: '🎓', name: 'Course Century!', description: 'Completed a full course — hit the 100!', xp_reward: 500 },
  { id: 'perfect_score', icon: '⭐', name: 'Perfect Hundred!', description: 'Got 100% in a Learning Match — what a knock!', xp_reward: 300 },
];

export const GENERIC_ACHIEVEMENTS = [
  { id: 'first_quiz', icon: '🎯', name: 'First Quiz!', description: 'Completed your first quiz', xp_reward: 50 },
  { id: 'streak_7', icon: '🔥', name: '7 Day Learner', description: '7-day learning streak', xp_reward: 200 },
  { id: 'streak_30', icon: '👑', name: 'Month Champion', description: '30-day learning streak', xp_reward: 500 },
  { id: 'quiz_master', icon: '🧠', name: 'Quiz Master', description: 'Scored 90%+ on 5 quizzes', xp_reward: 300 },
  { id: 'helpful_friend', icon: '🤝', name: 'Helpful Friend', description: 'Helped a peer 3 times', xp_reward: 150 },
  { id: 'fast_improver', icon: '🚀', name: 'Fast Improver', description: 'Improved score by 30%', xp_reward: 200 },
  { id: 'revision_hero', icon: '📚', name: 'Revision Hero', description: 'Completed 5 revision sessions', xp_reward: 150 },
  { id: 'gk_champion', icon: '🌍', name: 'GK Champion', description: 'Completed 7 daily GK challenges', xp_reward: 200 },
  { id: 'course_complete', icon: '🎓', name: 'Course Conqueror', description: 'Completed your first full course', xp_reward: 500 },
  { id: 'perfect_score', icon: '⭐', name: 'Perfect Score!', description: 'Got 100% on a quiz', xp_reward: 300 },
];

/** Get achievements based on interest */
export function getAchievements(interests: Interest[]) {
  const theme = getTheme(interests);
  return theme.implemented ? CRICKET_ACHIEVEMENTS : GENERIC_ACHIEVEMENTS;
}

/** Get assignments based on interest */
export function getAssignments(interests: Interest[]) {
  const theme = getTheme(interests);
  return theme.implemented ? CRICKET_ASSIGNMENTS : GENERIC_ASSIGNMENTS;
}

/** Get quiz questions based on interest and language */
export function getQuizQuestions(interests: Interest[], language: string) {
  const theme = getTheme(interests);
  if (!theme.implemented) return GENERIC_QUIZ_QUESTIONS;
  // Return cricket questions (same for both languages in this impl; full Kannada can be added)
  return CRICKET_QUIZ_QUESTIONS;
}
