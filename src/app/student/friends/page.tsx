"use client";

import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageCircle, Star, Swords } from 'lucide-react';
import { getTheme } from '@/lib/themes';

const PEERS = [
  { id: 1, name: 'Rahul', avatar: '🐯', strongIn: 'Mathematics', xp: 3400, online: true, class: 8 },
  { id: 2, name: 'Priya', avatar: '🦋', strongIn: 'Science', xp: 800, online: false, class: 8 },
  { id: 3, name: 'Arjun', avatar: '🦅', strongIn: 'Robotics', xp: 5200, online: true, class: 8 },
];

export default function PeersPage() {
  const { student } = useAuthStore();
  if (!student) return null;

  const theme = getTheme(student.interests);
  const isCricket = theme.implemented;
  const isKan = student.preferredLanguage === 'Kannada';

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isCricket ? '🏏 My Cricket Squad' : (isKan ? 'ನನ್ನ ಸ್ನೇಹಿತರು' : 'My Peers')}
          </h1>
          <p className="text-slate-500">
            {isCricket
              ? "Challenge your squad to a Learning Match or help your teammates!"
              : (isKan ? 'ಒಟ್ಟಿಗೆ ಕಲಿಯಿರಿ, ಒಟ್ಟಿಗೆ ಬೆಳೆಯಿರಿ.' : 'Learn together and help each other out.')}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-sm">
          <Users className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PEERS.map((peer) => (
          <Card key={peer.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl relative">
                    {peer.avatar}
                    {peer.online && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{peer.name}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {peer.xp.toLocaleString()} {isCricket ? theme.terms.points : 'XP'}
                    </p>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-full bg-slate-50 hover:bg-[var(--theme-light)] hover:text-[var(--theme-primary)] flex items-center justify-center text-slate-400 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-500">{isCricket ? 'Strongest Subject' : 'Strong in'}</span>
                  <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded">{peer.strongIn}</span>
                </div>
                <button className={`w-full py-2.5 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                  peer.online
                    ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-light)]'
                    : 'border-slate-200 text-slate-400 cursor-not-allowed'
                }`} disabled={!peer.online}>
                  <Swords className="w-4 h-4" />
                  {isCricket
                    ? (peer.online ? '🏏 Create Learning Match' : 'Offline')
                    : (peer.online ? 'Challenge' : 'Offline')}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isCricket && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-5">
            <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">🏏 Learning Match Rules</h3>
            <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
              <li>Both players answer the same 5 questions</li>
              <li>Higher score = <strong>Match Winner</strong> 🏆</li>
              <li>Winner earns <strong>+75 Bonus Runs</strong></li>
              <li>Both players earn XP for participation</li>
              <li>Academic scores are tracked normally</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
