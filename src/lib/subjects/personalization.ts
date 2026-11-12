import type { Interest } from '@/types';

// For each subject+interest combination, generate a personalized framing/example
export const CROSS_SUBJECT_EXAMPLES: Record<string, Record<Interest | 'default', string>> = {
  // MATHEMATICS examples
  'mathematics-fractions': {
    Cricket: 'Anisha\'s team scored 120 runs in 20 overs. In the last 5 overs, they scored 1/4 of their total. How many runs did they score in the last 5 overs?',
    Football: 'A football team played 20 matches. They won 3/5 of them. How many matches did they win?',
    Music: 'A song has 32 beats. The chorus takes up 3/8 of the song. How many beats is the chorus?',
    Gaming: 'You have 240 coins. You spend 5/12 on upgrades. How many coins do you spend?',
    Robotics: 'A robot arm can rotate 2/3 of a full circle. How many degrees is that?',
    Art: 'A canvas is 60 cm wide. You paint 3/4 of it blue. How wide is the blue section?',
    Science: '1/5 of Earth\'s surface is land. If Earth has surface area ~510 million km², how much is land?',
    Reading: 'You have read 3/7 of a 210-page book. How many pages have you read?',
    Technology: 'A download is 5/8 complete for a 400 MB file. How many MB have downloaded?',
    Space: 'A spacecraft completes 3/5 of its journey. If the total is 1000 km, how far has it travelled?',
    Puzzles: 'A puzzle has 500 pieces. You have placed 2/5 of them. How many are placed?',
    Nature: 'A forest has 360 trees. 1/4 are oak trees. How many oak trees are there?',
    Movies: 'A 2-hour movie has 3/4 of the story in the first part. How many minutes is the first part?',
    Cars: 'A fuel tank holds 60 litres. It is 5/6 full. How many litres are there?',
    Aviation: 'A flight of 3000 km has completed 2/3 of the journey. How far is left?',
    default: 'If you have 3/4 of a pizza and eat 1/2 of your share, how much of the whole pizza did you eat?',
  },
  'mathematics-statistics': {
    Cricket: 'Rohit scored 45, 82, 63, and 30 runs in 4 matches. What is his batting average? Use mean = total ÷ matches.',
    Football: 'A team scored 2, 4, 1, 3, 5 goals in 5 games. Find the mean score.',
    Music: '5 singers scored 78, 85, 90, 72, and 80 marks. What is the average score?',
    Gaming: 'Your scores in 5 rounds are 320, 450, 280, 510, 390. What is your mean score?',
    default: 'Find the mean, median and mode of: 12, 15, 18, 15, 20, 15, 22.',
  },
  'mathematics-probability': {
    Cricket: 'A batter has hit a boundary 3 out of every 10 balls faced. What is the probability of hitting a boundary on the next ball?',
    Football: 'A goalkeeper saves 7 out of 10 penalties on average. What is the probability of saving the next one?',
    Gaming: 'A game gives a rare item with 1 in 20 chance. What is the probability of getting it in one attempt?',
    default: 'A bag has 4 red, 3 blue, and 2 green balls. What is the probability of picking a blue ball?',
  },
  
  // SCIENCE - PHYSICS examples
  'physics-force-motion': {
    Cricket: 'When a bowler bowls at 140 km/h and hits the bat, the ball decelerates rapidly. This is Newton\'s Second Law: Force = Mass × Acceleration. The bat applies a huge force to change the ball\'s velocity!',
    Football: 'When a footballer kicks a ball, the force applied makes it accelerate. A heavier ball needs more force to achieve the same acceleration — that is Newton\'s Second Law in action!',
    default: 'A 2 kg ball is pushed with 10 N of force. Calculate its acceleration using F = ma.',
  },
  'physics-electricity': {
    Cricket: 'Floodlights in a cricket stadium need enormous electric current. If 50 floodlights each use 5 Amps, the total current needed is 250 Amps. This is how we calculate circuit current!',
    Gaming: 'Your gaming PC draws 3 Amps from a 230 V supply. Calculate the power it uses (P = V × I). This is exactly how electricity bills are calculated!',
    default: 'A 60 W bulb operates at 230 V. Calculate the current flowing through it using P = VI.',
  },
  
  // SCIENCE - BIOLOGY examples
  'biology-photosynthesis': {
    Cricket: 'Just like a cricket team needs energy to bat, bowl and field — plants need energy too. They make their own food using sunlight, water, and CO₂ through photosynthesis. It is like the sun being the coach giving the team its energy!',
    Nature: 'Photosynthesis is nature\'s most important process. Plants are solar-powered food factories — they take CO₂ and water, add sunlight, and produce glucose and oxygen for all life on Earth.',
    default: '6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂. This is the photosynthesis equation — explain each component.',
  },
  
  // SOCIAL SCIENCE - HISTORY examples
  'history-nationalism': {
    Cricket: 'Just like a cricket team representing India fills every Indian with national pride, the concept of nationalism brings people together under a common identity, language, and culture. The French Revolution was the first major spark of modern nationalism.',
    default: 'Nationalism is the feeling of belonging to a nation. The French Revolution (1789) spread the ideas of liberty, equality and fraternity that inspired nationalist movements worldwide.',
  },
  'history-french-revolution': {
    Cricket: 'Just as a cricket team\'s performance depends on all players — batsmen, bowlers, fielders — France\'s society had three estates. When 97% (the Third Estate) were burdened with all the taxes while 3% had all the power, it was like only one player doing all the work. That unfairness led to revolution!',
    default: 'The French Revolution (1789-1799) was caused by financial crisis, social inequality (Three Estates), food scarcity, and Enlightenment ideas about rights and democracy.',
  },
  
  // ENGLISH examples
  'english-writing': {
    Cricket: 'Write a short article: "The Day India Won the World Cup" — describe the atmosphere, the key moments, the emotions of players and fans. Use vivid adjectives and action verbs to bring the scene to life.',
    Football: 'Describe your favourite football match in 150 words. Include the setting, key moments, emotions of players, and the final result using sensory language.',
    default: 'Write a descriptive paragraph about a festival you attended. Include at least 5 adjectives and 3 action verbs.',
  },
  'english-grammar': {
    Cricket: 'Convert these active voice sentences to passive voice: 1. Virat Kohli scored a century. 2. The bowler dismissed the batsman. 3. The umpire raised the red flag.',
    default: 'Convert to passive voice: 1. The teacher explained the lesson. 2. The students completed the assignment. 3. The chef cooked a delicious meal.',
  },
  
  // GEOGRAPHY
  'geography-resources': {
    Cricket: 'Cricket bats are made from willow wood — a natural resource. The leather for the ball comes from cattle — a biotic resource. The iron for stadium structures comes from ore — an abiotic resource. Resources are all around us!',
    default: 'Resources are substances or things in the environment that satisfy human needs. They can be natural (air, water, minerals) or human-made (roads, buildings).',
  },
};

// Get a personalized example for a given concept and interest
export function getPersonalizedExample(
  subjectId: string,
  concept: string,
  interest: Interest
): string {
  // Build lookup key: subjectId-concept (simplified)
  const conceptKey = concept.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
  const subjectKey = subjectId.replace('social-', '').replace('science-', '');
  
  // Try full key first, then partial match
  for (const [key, examples] of Object.entries(CROSS_SUBJECT_EXAMPLES)) {
    if (key.includes(conceptKey) || key.includes(subjectKey)) {
      return examples[interest] || examples['default'] || `Learn ${concept} through the lens of ${interest}!`;
    }
  }
  
  return `Let's explore ${concept} using a ${interest}-inspired example to make it relatable and fun!`;
}
