export const XP_REWARDS = {
  lessonComplete: 50,
  quizPass: 100,
  quizHighScore: 150,
  dailyGK: 50,
  revision: 30,
  peerHelp: 75,
  streak7: 200,
  streak30: 500,
  firstLogin: 25,
  assignmentComplete: 80,
} as const;

export const LEVELS = [
  { level: 1, title: 'Curious Explorer', minXP: 0 },
  { level: 2, title: 'Knowledge Seeker', minXP: 200 },
  { level: 3, title: 'Quick Learner', minXP: 500 },
  { level: 4, title: 'Bright Scholar', minXP: 1000 },
  { level: 5, title: 'Sharp Mind', minXP: 2000 },
  { level: 6, title: 'Skill Builder', minXP: 3500 },
  { level: 7, title: 'Star Performer', minXP: 5500 },
  { level: 8, title: 'Expert Thinker', minXP: 8000 },
  { level: 9, title: 'Knowledge Master', minXP: 11000 },
  { level: 10, title: 'Acculum Champion', minXP: 15000 },
];

export const ACHIEVEMENTS = [
  { id: 'first_quiz', name: 'First Quiz!', description: 'Completed your first quiz', icon: '🎯', xp_reward: 50, condition: 'quiz_count >= 1' },
  { id: 'streak_7', name: '7 Day Learner', description: '7-day learning streak', icon: '🔥', xp_reward: 200, condition: 'streak >= 7' },
  { id: 'streak_30', name: 'Month Champion', description: '30-day learning streak', icon: '👑', xp_reward: 500, condition: 'streak >= 30' },
  { id: 'quiz_master', name: 'Quiz Master', description: 'Scored 90%+ on 5 quizzes', icon: '🧠', xp_reward: 300, condition: 'high_score_count >= 5' },
  { id: 'helpful_friend', name: 'Helpful Friend', description: 'Helped a peer 3 times', icon: '🤝', xp_reward: 150, condition: 'peer_help_count >= 3' },
  { id: 'fast_improver', name: 'Fast Improver', description: 'Improved score by 30% in one topic', icon: '🚀', xp_reward: 200, condition: 'improvement >= 30' },
  { id: 'revision_hero', name: 'Revision Hero', description: 'Completed 5 revision sessions', icon: '📚', xp_reward: 150, condition: 'revision_count >= 5' },
  { id: 'gk_champion', name: 'GK Champion', description: 'Completed 7 daily GK challenges', icon: '🌍', xp_reward: 200, condition: 'gk_count >= 7' },
  { id: 'course_complete', name: 'Course Conqueror', description: 'Completed your first full course', icon: '🎓', xp_reward: 500, condition: 'course_complete >= 1' },
  { id: 'perfect_score', name: 'Perfect Score!', description: 'Got 100% on a quiz', icon: '⭐', xp_reward: 300, condition: 'perfect_score >= 1' },
];

export function getLevelFromXP(xp: number) {
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXP) currentLevel = level;
  }
  return currentLevel;
}

export function getXPToNextLevel(xp: number) {
  const current = getLevelFromXP(xp);
  const nextIdx = LEVELS.findIndex(l => l.level === current.level + 1);
  if (nextIdx === -1) return { progress: 100, needed: 0, nextLevel: null };
  const next = LEVELS[nextIdx];
  const progressXP = xp - current.minXP;
  const totalNeeded = next.minXP - current.minXP;
  return {
    progress: Math.min(100, Math.round((progressXP / totalNeeded) * 100)),
    needed: next.minXP - xp,
    nextLevel: next,
  };
}
