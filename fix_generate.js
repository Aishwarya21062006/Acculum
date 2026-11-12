const fs = require('fs');
const file = 'src/components/shared/QuickSummarize.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add state
code = code.replace(
  "const [showDemoVideo, setShowDemoVideo] = useState(false);",
  "const [showDemoVideo, setShowDemoVideo] = useState(false);\n  const [isVideoGenerating, setIsVideoGenerating] = useState(false);"
);

// Add playDemoVideo function
code = code.replace(
  "const handleVoiceEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {",
  "const playDemoVideo = () => {\n    setIsVideoGenerating(true);\n    setTimeout(() => {\n      setIsVideoGenerating(false);\n      setShowDemoVideo(true);\n    }, 2000);\n  };\n\n  const handleVoiceEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {"
);

// Replace setShowDemoVideo(true) with playDemoVideo() where applicable
// 1. handleVoiceEnter
code = code.replace(
  /setShowDemoVideo\(true\);\s*setVoiceReady\(false\);/g,
  "playDemoVideo();\n      setVoiceReady(false);"
);
// 2. Text mode onKeyDown
code = code.replace(
  /setShowDemoVideo\(true\);\s*\}/g,
  "playDemoVideo();\n                  }"
);
// 3. Text mode Play button onClick
code = code.replace(
  /if \(text\.trim\(\)\) setShowDemoVideo\(true\);/g,
  "if (text.trim()) playDemoVideo();"
);
// 4. callAI (Photo upload) -> when mode is text it used to call setShowDemoVideo(true) but callAI isn't called for text anymore anyway. Let's just update it there too just in case.
code = code.replace(
  /if \(isImage \|\| mode === 'text'\) setShowDemoVideo\(true\);/g,
  "if (isImage || mode === 'text') playDemoVideo();"
);

// Add the Generating Video UI
const generatingUI = 
        {/* -- VIDEO GENERATING STATE --------------------------------- */}
        {isVideoGenerating && (
          <div className="flex flex-col items-center justify-center gap-4 py-10 bg-slate-900 rounded-2xl border-2 border-[var(--theme-primary)] shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-yellow-400 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl">??</span>
                </div>
              </div>
              <p className="font-bold text-white text-sm animate-pulse">
                {isKan ? '?????? ??????????????...' : isCricket ? 'Generating Cricket Video...' : 'Generating Video...'}
              </p>
              <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-yellow-400 animate-pulse rounded-full" style={{ width: '60%', transition: 'width 2s linear' }}></div>
              </div>
            </div>
          </div>
        )}
;

code = code.replace(
  "{/* -- DEFAULT VIDEO PLAYER (after photo summary, voice Enter, or text Enter) -- */}",
  generatingUI + "\n        {/* -- DEFAULT VIDEO PLAYER (after photo summary, voice Enter, or text Enter) -- */}"
);

fs.writeFileSync(file, code);
