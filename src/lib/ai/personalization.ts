import type { Interest, LearningFormat, Difficulty, PersonalizationProfile, PersonalizationOutput, SignalType } from '@/types';

export const INTEREST_THEMES: Record<Interest, {
  color: string;
  gradient: string;
  icon: string;
  bgPattern: string;
  accentColor: string;
}> = {
  Cricket: { color: 'green', gradient: 'from-green-500 to-emerald-600', icon: '🏏', bgPattern: 'cricket', accentColor: '#10b981' },
  Music: { color: 'purple', gradient: 'from-purple-500 to-violet-600', icon: '🎵', bgPattern: 'music', accentColor: '#8b5cf6' },
  Gaming: { color: 'cyan', gradient: 'from-cyan-500 to-blue-600', icon: '🎮', bgPattern: 'gaming', accentColor: '#06b6d4' },
  Robotics: { color: 'blue', gradient: 'from-blue-500 to-indigo-600', icon: '🤖', bgPattern: 'robotics', accentColor: '#3b82f6' },
  Football: { color: 'orange', gradient: 'from-orange-500 to-amber-600', icon: '⚽', bgPattern: 'football', accentColor: '#f97316' },
  Art: { color: 'pink', gradient: 'from-pink-500 to-rose-600', icon: '🎨', bgPattern: 'art', accentColor: '#ec4899' },
  Science: { color: 'teal', gradient: 'from-teal-500 to-cyan-600', icon: '🚀', bgPattern: 'science', accentColor: '#14b8a6' },
  Reading: { color: 'amber', gradient: 'from-amber-500 to-yellow-600', icon: '📚', bgPattern: 'reading', accentColor: '#f59e0b' },
  Technology: { color: 'slate', gradient: 'from-slate-600 to-gray-700', icon: '💻', bgPattern: 'tech', accentColor: '#64748b' },
};

export const PERSONALIZED_EXAMPLES: Record<string, Record<Interest, string>> = {
  'Probability': {
    Cricket: 'Imagine a batter has a 60% chance of hitting a boundary on each delivery. If he faces 10 balls, how many boundaries can you expect?',
    Music: 'A musician randomly picks from 5 notes — 3 are from the major scale. What is the probability of picking a major scale note?',
    Gaming: 'In a game, you have a 1-in-4 chance of getting a rare weapon drop. If you play 20 rounds, how many drops do you expect?',
    Robotics: 'A robot is at a junction with 3 paths. If it randomly chooses a path each time, what is the probability of it choosing the correct one twice in a row?',
    Football: 'A penalty kick has a 70% success rate. If a team takes 5 penalties, what is the expected number of goals?',
    Art: 'An artist mixes 4 paint colors randomly. If 2 are warm colors, what is the probability of selecting a warm color first?',
    Science: 'In an experiment, a coin lands heads 60% of the time. Is this coin fair? What does probability tell us?',
    Reading: 'In a library of 100 books, 40 are fiction. If you randomly pick a book, what is the probability it is fiction?',
    Technology: 'A password has 4 digits. If each digit is random, what is the probability of guessing it correctly on the first try?',
  },
  'Electricity': {
    Cricket: 'Think of electric current like a team of players running between wickets. The more players (electrons) running, the higher the current!',
    Music: 'Electric current is like the rhythm in music — it flows continuously, creating the energy that powers speakers and makes sound.',
    Gaming: 'Current is like the data packets flowing in a network game. More flow = more power = faster gameplay!',
    Robotics: 'For a robot to move its motors, electric current must flow through its circuits — just like blood flows through your body.',
    Football: 'Current flows through a wire like football players running across a field — the more players (electrons), the stronger the team (current).',
    Art: 'Imagine current as paint flowing through a brush — without steady flow, the artwork (circuit) does not work.',
    Science: 'Electric current is the flow of charged particles (electrons) through a conductor, measured in Amperes.',
    Reading: 'Just as story flows from beginning to end, current flows from positive to negative terminal through a circuit.',
    Technology: 'Every device you use — phone, computer, LED — runs on electric current flowing through carefully designed circuits.',
  },
  'Fractions': {
    Cricket: 'If a team scored 3/4 of their target in 40 overs, how many runs did they score? Fractions help us understand batting rates!',
    Music: 'A song has 16 beats. If you clap for 3/4 of them, how many claps? Musical timing uses fractions!',
    Gaming: 'You have completed 2/5 of a game level. If the level has 50 stages, how many have you finished?',
    Robotics: 'A robot arm can rotate 3/8 of a full circle. How many degrees is that? Fractions guide robot precision!',
    Football: 'A team won 5/8 of their matches. If they played 24 games, how many did they win?',
    Art: 'To make a perfect color mix, you use 1/3 blue and 2/3 yellow. How much of each do you need for 300ml of paint?',
    Science: 'Only 1/5 of Earth is land. If Earth has 510 million sq km surface, how much is land?',
    Reading: 'You have read 3/7 of a book with 210 pages. How many pages have you read?',
    Technology: 'A file download is 2/3 complete. If the file is 900 MB, how many MB have downloaded?',
  },
};

export const SCORE_ANNOUNCEMENTS: Record<Interest, (score: number) => string> = {
  Cricket: (s) => `YOU SCORED ${s} RUNS! 🏏 ${s >= 85 ? 'Century incoming!' : s >= 60 ? 'Good knock!' : 'Keep batting!'}`,
  Music: (s) => `${s >= 85 ? 'Perfect note! 🎵' : s >= 60 ? 'Good melody! 🎵' : 'Keep practicing the tune!'}  Score: ${s}%`,
  Gaming: (s) => `${s >= 85 ? 'LEVEL UP! 🎮' : s >= 60 ? 'MISSION PROGRESS! 🎮' : 'RESPAWN & TRY AGAIN! 🎮'}`,
  Robotics: (s) => `System performance: ${s}% 🤖 ${s >= 85 ? 'Robot fully upgraded!' : s >= 60 ? 'Systems operational!' : 'Debug required!'}`,
  Football: (s) => `${s >= 85 ? 'GOAL! ⚽ Champion play!' : s >= 60 ? 'Nice assist! ⚽' : 'Keep dribbling! ⚽'} Score: ${s}%`,
  Art: (s) => `${s >= 85 ? 'Masterpiece! 🎨' : s >= 60 ? 'Beautiful brushwork! 🎨' : 'Keep creating! 🎨'} Score: ${s}%`,
  Science: (s) => `Experiment result: ${s}% accuracy 🚀 ${s >= 85 ? 'Nobel Prize level!' : s >= 60 ? 'Hypothesis confirmed!' : 'Retry the experiment!'}`,
  Reading: (s) => `Chapter complete! 📚 Comprehension: ${s}% ${s >= 85 ? 'You are the author now!' : s >= 60 ? 'Great reading!' : 'Re-read and try again!'}`,
  Technology: (s) => `Code compiled: ${s}% efficiency 💻 ${s >= 85 ? 'Production ready!' : s >= 60 ? 'Beta version!' : 'Debug and redeploy!'}`,
};

export class PersonalizationEngine {
  static getPersonalizedExample(topic: string, interests: Interest[]): string {
    const primaryInterest = interests[0] || 'Science';
    for (const [key, examples] of Object.entries(PERSONALIZED_EXAMPLES)) {
      if (topic.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(topic.toLowerCase())) {
        return examples[primaryInterest] || examples['Science'];
      }
    }
    return `Let's explore ${topic} with a ${primaryInterest}-inspired example to make it more interesting and relatable!`;
  }

  static getTheme(interests: Interest[]) {
    const primaryInterest = interests[0] || 'Science';
    return INTEREST_THEMES[primaryInterest];
  }

  static getScoreAnnouncement(score: number, interests: Interest[]): string {
    const primaryInterest = interests[0] || 'Science';
    return SCORE_ANNOUNCEMENTS[primaryInterest](score);
  }

  static detectLearningSignal(confidence: number, score: number) {
    const gap = (confidence / 5) * 100 - score;

    if (confidence >= 4 && score < 50) {
      return {
        type: 'confidence_mismatch_high' as SignalType,
        label: 'Confidence–Performance Mismatch',
        description: 'Higher confidence than actual performance — this is a Learning Signal! A quick revision can bridge this gap.',
        recommendedAction: 'Revision + Conceptual Practice',
        level: 'red' as const,
      };
    } else if (confidence <= 2 && score >= 75) {
      return {
        type: 'confidence_mismatch_low' as SignalType,
        label: 'Hidden Strength Detected!',
        description: 'You performed better than you thought! Your understanding is stronger than your confidence suggests.',
        recommendedAction: 'Celebrate progress + slightly harder challenges',
        level: 'green' as const,
      };
    } else if (score < 50) {
      return {
        type: 'low_score' as SignalType,
        label: 'Revision Recommended',
        description: 'This topic needs more attention. Let\'s revisit the concepts before moving forward.',
        recommendedAction: 'Concept Review + Practice Questions',
        level: 'red' as const,
      };
    } else if (score >= 85) {
      return {
        type: 'high_score' as SignalType,
        label: 'Ready for Next Level!',
        description: 'Excellent performance! You have mastered this topic and are ready for a challenge.',
        recommendedAction: 'Advanced Challenge + Next Topic',
        level: 'green' as const,
      };
    } else {
      return {
        type: 'low_engagement' as SignalType,
        label: 'Keep Practicing',
        description: 'Good effort! A little more practice will help solidify your understanding.',
        recommendedAction: 'Additional Practice Questions',
        level: 'yellow' as const,
      };
    }
  }

  static getAdaptiveRecommendation(score: number) {
    if (score >= 85) {
      return { next: 'next_topic', message: '🎉 Outstanding! You are ready to tackle the next topic.', actions: ['Start Next Topic', 'Try Hard Challenge'] };
    } else if (score >= 50) {
      return { next: 'practice', message: '👍 Good work! Some additional practice will make you even stronger.', actions: ['Practice Questions', 'Review Concepts'] };
    } else {
      return { next: 'revision', message: '📖 Let\'s revisit this topic together. Revision makes perfect!', actions: ['Review Concept', 'Try 5 Practice Questions'] };
    }
  }

  static getMotivationalMessage(interests: Interest[], streak: number): string {
    const interest = interests[0] || 'Science';
    const messages: Record<Interest, string[]> = {
      Cricket: ['Every great batter started with practice. Keep going! 🏏', `${streak} day streak — you're on a batting spree! 🏏`, 'Today\'s learning is tomorrow\'s century! 🏏'],
      Music: ['Every master musician once played their first note. Keep practicing! 🎵', `${streak} days of learning — your knowledge symphony is building! 🎵`, 'Learning is your daily composition. Make it beautiful! 🎵'],
      Gaming: ['Every level teaches you something new. Keep playing! 🎮', `${streak} day combo streak! You're on fire! 🎮`, 'In the game of knowledge, you\'re leveling up! 🎮'],
      Robotics: ['Every engineer starts by learning the basics. Keep building! 🤖', `${streak} days of learning — your knowledge circuits are firing! 🤖`, 'Debugging is learning. Every mistake makes you smarter! 🤖'],
      Football: ['Consistent training makes champions. Keep going! ⚽', `${streak} day learning streak — you're in top form! ⚽`, 'Study hard, play hard — be the best! ⚽'],
      Art: ['Every masterpiece starts with a single brushstroke. Keep creating! 🎨', `${streak} days of coloring your mind with knowledge! 🎨`, 'Your learning is your canvas — paint it beautifully! 🎨'],
      Science: ['Science starts with curiosity. Keep questioning! 🚀', `${streak} days of exploring — you're on a discovery mission! 🚀`, 'Every experiment teaches something new. Keep exploring! 🚀'],
      Reading: ['Every page you read opens a new world. Keep reading! 📚', `${streak} days — your knowledge library is growing! 📚`, 'Readers become leaders. Keep going! 📚'],
      Technology: ['Every coder started with Hello World. Keep building! 💻', `${streak} days of learning — your skills are compiling! 💻`, 'Technology changes the world. You\'re learning to change it too! 💻'],
    };
    const msgs = messages[interest];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }

  static personalize(profile: PersonalizationProfile, topic: string, score?: number): PersonalizationOutput {
    const theme = this.getTheme(profile.interests);
    const example = this.getPersonalizedExample(topic, profile.interests);
    const motivation = this.getMotivationalMessage(profile.interests, 0);
    const announcement = score !== undefined ? this.getScoreAnnouncement(score, profile.interests) : '';
    
    const avgPerformance = Object.values(profile.performancePattern).length > 0
      ? Object.values(profile.performancePattern).reduce((a, b) => a + b, 0) / Object.values(profile.performancePattern).length
      : 60;
    
    const recommendedDifficulty: Difficulty = avgPerformance >= 80 ? 'Hard' : avgPerformance >= 60 ? 'Medium' : 'Easy';
    
    const formatPriority: Record<Interest, LearningFormat> = {
      Cricket: 'Video', Music: 'Audio', Gaming: 'Simulation', Robotics: 'Simulation',
      Football: 'Video', Art: 'Video', Science: 'Simulation', Reading: 'Text', Technology: 'Text',
    };
    const recommendedFormat = formatPriority[profile.interests[0] as Interest] || 'Video';
    
    return {
      recommendedLesson: topic,
      recommendedDifficulty,
      recommendedFormat,
      personalizedExample: example,
      revisionRecommended: avgPerformance < 60,
      motivationalMessage: motivation,
      themeColor: theme.accentColor,
      themeIcon: theme.icon,
      scoreAnnouncement: announcement,
    };
  }
}
