"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileJson, Download, Share2, CheckCircle2 } from 'lucide-react';
import { getAssignments } from '@/lib/themes';
import { CLASSROOM_PORTIONS, WEEKLY_TIMETABLE, DAILY_SUMMARIES } from '@/lib/classroom';

export function ReportGenerator() {
  const { student } = useAuthStore();
  const [generating, setGenerating] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [reportFilename, setReportFilename] = useState('');
  const [shared, setShared] = useState(false);

  if (!student) return null;

  const generateReport = () => {
    setGenerating(true);
    setShared(false);
    
    // Build the complete student report based on the prompt requirements
    const assignments = getAssignments(student.interests);
    
    const reportData = {
      metadata: {
        reportGenerationDate: new Date().toISOString(),
        platform: "Acculum",
        version: "1.0",
      },
      studentInfo: {
        studentId: student.id,
        name: student.name,
        class: student.class,
        section: student.section,
        school: student.school,
        interests: student.interests,
        preferredLanguage: student.preferredLanguage,
      },
      learningMetrics: {
        learningStreakDays: student.streak,
        totalXP: student.xp,
        currentLevel: student.level,
        badgesEarned: student.badge_count,
        learningTimeMinutes: student.xp * 2, // Mock derived value
        learningAccuracyPercent: 82, // Mock derived value
      },
      subjectProgress: {
        Mathematics: { progressPercent: 75, status: "On Track" },
        Science: { progressPercent: 60, status: "Needs Review" },
        English: { progressPercent: 88, status: "Excellent" },
      },
      chaptersAndPortions: {
        completed: CLASSROOM_PORTIONS.filter(p => p.status === 'completed'),
        currentlyLearning: CLASSROOM_PORTIONS.filter(p => p.status === 'teaching'),
      },
      performance: {
        quizPerformance: [
          { topic: "Fractions", score: 85, total: 100, attempts: 2, confidenceLevel: 4 },
          { topic: "Probability", score: 33, total: 100, attempts: 1, confidenceLevel: 3 },
        ],
        assignmentPerformance: assignments.map(a => ({
          title: a.title,
          subject: a.subject,
          status: a.status,
          score: a.status === 'completed' ? 100 : 0
        })),
      },
      analysis: {
        identifiedStrengths: ["Quick comprehension of visual concepts", "Consistent daily learning routine"],
        identifiedLearningGaps: ["Probability rules", "Fractions subtraction"],
        confidenceInformation: "Student often underestimates performance in Mathematics but matches actual performance in Science.",
        recommendedAreasForImprovement: ["Practice more probability scenarios", "Review classroom notes on electricity"],
      },
      activity: {
        aiCompanionActivity: {
          questionsAsked: 12,
          frequentTopics: ["Photosynthesis", "Algebra"],
        },
        adaptiveLearningActivity: {
          dynamicInterventionsTriggered: 3,
          difficultyAdjustments: "Decreased difficulty for Probability, Increased for English."
        },
        peerCompetitionActivity: {
          matchesPlayed: 5,
          winRatePercent: 60,
          currentRank: 4,
        }
      },
      classroomIntegration: {
        weeklyTimetable: WEEKLY_TIMETABLE,
        recentClassSummaries: DAILY_SUMMARIES,
      },
      facilitatorActions: {
        currentLearningStatus: "Active but struggling with advanced Math topics.",
        interventionRecommendations: [
          "Assign supplemental reading for Probability.",
          "Check in regarding recent low quiz scores.",
          "Acknowledge 5-day learning streak!"
        ],
        reassessmentStatus: "Pending reassessment for Probability next week."
      }
    };

    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Generate filename e.g. Acculum_RahulKumar_Class8_LearningReport_2026-09-26.json
    const dateStr = new Date().toISOString().split('T')[0];
    const safeName = student.name.replace(/[^a-zA-Z0-9]/g, '');
    const filename = `Acculum_${safeName}_Class${student.class}_LearningReport_${dateStr}.json`;
    
    setTimeout(() => {
      setReportUrl(url);
      setReportFilename(filename);
      setGenerating(false);
    }, 800); // Simulate processing time
  };

  const handleShare = () => {
    // In a real app, this would upload the JSON to the backend.
    setShared(true);
    setTimeout(() => setShared(false), 3000);
  };

  return (
    <Card className="border-slate-200 mt-6 bg-blue-50/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <FileJson className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Learning Report</h2>
            <p className="text-slate-600 mb-4 text-sm">
              Generate a complete, structured JSON report of your learning progress, including quiz performance, identified strengths, gaps, and classroom context. Your facilitator can use this to provide targeted support.
            </p>
            
            {!reportUrl ? (
              <Button 
                onClick={generateReport} 
                disabled={generating}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                <FileJson className="w-4 h-4 mr-2" />
                {generating ? 'Generating...' : '📄 Generate My Learning Report'}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href={reportUrl} download={reportFilename} className="flex-1">
                    <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                      <Download className="w-4 h-4 mr-2" />
                      ⬇️ Download JSON Report
                    </Button>
                  </a>
                  <Button 
                    onClick={handleShare}
                    variant={shared ? "default" : "default"}
                    className={`flex-1 font-bold ${shared ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    {shared ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                    {shared ? 'Report Shared!' : 'Share with Facilitator'}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 font-mono break-all">{reportFilename}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
