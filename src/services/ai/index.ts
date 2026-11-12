// Acculum AI Service
// Uses env AI_API_KEY if available, else falls back to a rich context-aware mock
// Cricket theme is fully implemented in the mock logic.

export async function generateResponse(message: string, context: any): Promise<string> {
  const apiKey = process.env.AI_API_KEY;

  if (apiKey) {
    // Real implementation placeholder — wire up your LLM here
    // return await callRealAI(message, context, apiKey);
  }

  // ── Mock Intelligence ────────────────────────────────────────────────────────
  const lower = message.toLowerCase();
  const isKan = context.language === 'Kannada';
  const isCricket = context.interest === 'Cricket';

  // ── Greetings ──
  if (/^(hi|hello|hey|ನಮಸ್ಕಾರ)/i.test(lower)) {
    return isKan
      ? `ನಮಸ್ಕಾರ ${context.name}! ನಾನು ನಿಮ್ಮ Acculum AI. ಇಂದು ಯಾವ ವಿಷಯ ಕಲಿಯಲು ಬಯಸುತ್ತೀರಿ?`
      : `Hello ${context.name}! I'm your Acculum AI. ${isCricket ? 'Ready to hit some knowledge boundaries? 🏏' : 'What would you like to learn today?'}`;
  }

  // ── Fractions ──
  if (/fraction|ಭಿನ್ನ/i.test(lower)) {
    if (isCricket) {
      return isKan
        ? `ಕ್ರಿಕೆಟ್ ತಂಡದಲ್ಲಿ 11 ಆಟಗಾರರಿದ್ದಾರೆ, ಅದರಲ್ಲಿ 3 ಬೌಲರ್‌ಗಳು. ಆದ್ದರಿಂದ 3/11 ಭಾಗ ಬೌಲರ್‌ಗಳು. ಭಿನ್ನರಾಶಿ = ಭಾಗ ÷ ಒಟ್ಟು! 🏏`
        : `🏏 Fractions in Cricket: If a team of 11 has 3 bowlers, then 3/11 of the team are bowlers. A fraction = part ÷ whole. Rohit's batting average of 48.6 is also a fraction — total runs ÷ innings! Try it yourself: If Rohit scored 486 runs in 10 innings, what fraction of a century (100 runs) is each innings average?`;
    }
    return isKan
      ? `ಭಿನ್ನರಾಶಿ ಎಂದರೆ ಒಂದು ಪೂರ್ಣದ ಒಂದು ಭಾಗ. ಉದಾ: ½ ಎಂದರೆ ಒಂದರ ಎರಡನೇ ಭಾಗ.`
      : `A fraction represents a part of a whole. For example: ½ means one part out of two equal parts. Numerator ÷ Denominator = Fraction value!`;
  }

  // ── Percentage ──
  if (/percent|percentage|ಶೇಕಡ/i.test(lower)) {
    if (isCricket) {
      return `🏏 Percentage in Cricket: If a batter scored 40 runs in Match 1 and 50 runs in Match 2, the percentage increase is ((50-40)/40) × 100 = 25%! Same formula, cricket context. This is exactly how analysts compare player form across seasons!`;
    }
    return `Percentage means "per hundred". Formula: (Part / Whole) × 100. Example: 40 out of 50 = (40/50) × 100 = 80%.`;
  }

  // ── Probability ──
  if (/probab|chance|ಸಂಭಾವ್ಯ/i.test(lower)) {
    if (isCricket) {
      return `🏏 Probability in Cricket: If a batter has hit a boundary on 30 out of 100 deliveries, the probability of a boundary = 30/100 = 0.3 or 30%. Probability = Favourable outcomes ÷ Total outcomes. This is how commentators say "he has a 60% strike rate"!`;
    }
    return `Probability = (Favourable outcomes) / (Total outcomes). It ranges from 0 (impossible) to 1 (certain). Example: Tossing a coin, P(heads) = 1/2 = 0.5.`;
  }

  // ── Electric Current ──
  if (/electric|current|circuit|ವಿದ್ಯುತ್/i.test(lower)) {
    if (isCricket) {
      return isKan
        ? `ವಿದ್ಯುತ್ ಪ್ರವಾಹವನ್ನು ಕ್ರಿಕೆಟ್ ತಂಡದ ರನ್‌ಗಳ ಹಾಗೆ ಯೋಚಿಸಿ! ಎಲೆಕ್ಟ್ರಾನ್‌ಗಳು ತಂಡದ ಆಟಗಾರರ ಹಾಗೆ ಒಂದೇ ದಿಕ್ಕಿನಲ್ಲಿ ಓಡುತ್ತವೆ. ಹೆಚ್ಚು ಎಲೆಕ್ಟ್ರಾನ್ = ಹೆಚ್ಚು ಪ್ರವಾಹ (ರನ್)! 🏏`
        : `🏏 Electric current is like a cricket team's run rate! Electrons are like batters sprinting between wickets — the more electrons flowing per second, the higher the current (like a higher run rate). Current is measured in Amperes (A). Stadium floodlights need massive current to stay lit during day-night matches — now you know why!`;
    }
    return isKan
      ? `ವಿದ್ಯುತ್ ಪ್ರವಾಹ ಎಂದರೆ ಎಲೆಕ್ಟ್ರಾನ್‌ಗಳ ಹರಿವು. SI ಏಕಮಾನ: ಆಂಪಿಯರ್ (A).`
      : `Electric current is the flow of electrons through a conductor. SI unit = Ampere (A). Measured using an ammeter.`;
  }

  // ── Photosynthesis ──
  if (/photosyn|plant|ದ್ಯುತಿ|ಸಸ್ಯ/i.test(lower)) {
    if (isCricket) {
      return `🏏 Think of photosynthesis like a cricket team's support system! The plant (team) uses sunlight (coach), water (training), and CO₂ (strategy) to produce glucose (runs/energy) and oxygen (wins)! Formula: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Like a team's match equation: Inputs + Training → Victory!`;
    }
    return isKan
      ? `ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ: ಸಸ್ಯಗಳು ಸೂರ್ಯನ ಬೆಳಕು + ನೀರು + CO₂ → ಗ್ಲೂಕೋಸ್ + O₂.`
      : `Photosynthesis: Plants use sunlight + water + CO₂ to make glucose + O₂. It happens in the chloroplast. Equation: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂.`;
  }

  // ── Speed / Motion ──
  if (/speed|distance|time|velocity|ವೇಗ/i.test(lower)) {
    if (isCricket) {
      return `🏏 Speed = Distance ÷ Time — a cricket fielder runs 48m in 6 seconds, so Speed = 48/6 = 8 m/s. A fast bowler delivers at 140-145 km/h — that's about 40 m/s! Same physics formula applies everywhere.`;
    }
    return `Speed = Distance / Time. Distance = Speed × Time. Time = Distance / Speed. Remember: SDT triangle! Example: Car travels 150km in 3 hours → Speed = 150/3 = 50 km/h.`;
  }

  // ── Image/File context ──
  if (/uploaded|image|file|photo/i.test(lower)) {
    if (isCricket) {
      return `🏏 I can see you've shared something! Based on what you uploaded, I'll explain the key concepts using cricket examples where possible. What specific part would you like me to explain?`;
    }
    return `I've received your file! I'll help you understand the key concepts from it. What specific part would you like explained?`;
  }

  // ── Default fallback ──
  return isKan
    ? `ಕ್ಷಮಿಸಿ ${context.name}, ನನಗೆ ಅದು ಸಂಪೂರ್ಣ ಅರ್ಥವಾಗಲಿಲ್ಲ. ನೀವು ಕಲಿಯುತ್ತಿರುವ ಪಾಠದ ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದೇ?`
    : `I can help you with that, ${context.name}! ${isCricket ? '🏏 I\'ll use cricket examples to make it click. ' : ''}Could you be more specific? Try asking about a topic like "fractions", "electric current", "probability", or "photosynthesis".`;
}
