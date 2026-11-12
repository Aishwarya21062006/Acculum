# Acculum

> An AI-assisted personalized learning platform that adapts to each student's pace, progress, and interests while helping facilitators understand when and how to intervene.

## Code Spark at AMC College of Engineering — Problem Statement: Personalized Learning

**Challenge:** Design a learning platform that adapts to each student's pace, progress, and interests, while helping facilitators understand when and how to intervene.

## Problem

Students learn at different speeds and have different interests, but many learning systems provide the same sequence and difficulty to everyone.

A facilitator may know that a student is struggling without knowing whether the cause is a conceptual gap, repeated mistakes, low confidence, overload, or disengagement.

Acculum addresses this with a closed learning loop:

**Student activity → Learning data → Signal detection → Facilitator insight → Intervention → Reassessment → Updated learning state**

## Solution

Acculum has two connected experiences.

### Student Platform

Students can:

- Learn through subjects, courses and lessons
- Take quizzes and complete assignments
- Track their progress
- Ask an AI learning companion for help
- Receive interest-based examples
- Use classroom, friends and reward features
- Explore career and interest-based content

### Facilitator Dashboard

Facilitators can:

- Review student performance
- See learning signals
- Inspect repeated errors and help-seeking
- Review engagement patterns
- Receive intervention recommendations
- Import reports
- Reassess students after intervention
- Compare performance before and after support

## Personalization

Acculum currently combines explicit interests with performance signals.

Supported interests include:

**Cricket, Music, Gaming, Robotics, Football, Art, Science, Reading and Technology.**

Examples can be adapted to the learner's interests:

- Probability + Cricket
- Electricity + Robotics
- Fractions + Music

Performance also affects the next learning recommendation:

- **85%+** → progress toward the next topic
- **50–84%** → targeted practice
- **Below 50%** → revision and reinforcement

## Learning Signals

The facilitator workflow considers:

- Quiz performance
- Repeated errors
- Repeated attempts
- Hints and help-seeking
- AI companion activity
- Lesson completion
- Skipped or incomplete lessons
- Engagement patterns
- Confidence/performance mismatch
- Hidden strengths

The current signal engine is rule-based and transparent. It produces actionable intervention recommendations while leaving the final decision to the facilitator.

## Architecture

### Student application

- Next.js
- React
- TypeScript
- Tailwind CSS
- SQLite / Better-SQLite3
- Zustand
- SWR
- Recharts
- Framer Motion
- Zod

### Facilitator application

- React
- Vite
- TypeScript
- Tailwind CSS
- Express
- sql.js
- Multer
- Lucide React

### Core flow

```text
Student Platform
       ↓
Learning Data
       ↓
Learning Signal Engine
       ↓
Facilitator Dashboard
       ↓
Intervention Recommendation
       ↓
Reassessment
       ↓
Updated Learning State