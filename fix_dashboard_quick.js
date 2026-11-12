const fs = require('fs');
const file = 'src/app/student/dashboard/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// The QuickSummarize is currently wrapped in a Card inside dashboard/page.tsx?
// No, looking at the code:
/*
        <div className="lg:col-span-2 space-y-6">

          {/* Quick Summarize ? 3 input widget *}
          <QuickSummarize />
*/
// QuickSummarize itself has a wrapper div.
// Let's check QuickSummarize.tsx wrapper:
// It says <div className="p-6">
// We replaced it with className={p-6 }

// Now I need to fix the other cards in the dashboard.
code = code.replace(
  /div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100"/,
  "div className={lex items-start gap-3 p-3 rounded-xl border }"
);
code = code.replace(
  /h4 className="font-bold text-sm text-slate-900"/g,
  "h4 className={ont-bold text-sm }"
);
code = code.replace(
  /p className="text-xs text-red-600 font-semibold mt-0.5"/,
  "p className={	ext-xs font-semibold mt-0.5 }"
);
code = code.replace(
  /div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"/,
  "div className={lex items-start gap-3 p-3 rounded-xl transition-colors }"
);
code = code.replace(
  /p className="text-xs text-slate-500 mt-0.5"/,
  "p className={	ext-xs mt-0.5 }"
);

code = code.replace(
  /Card className="border-\[var\(--theme-primary\)\] border-2 bg-\[var\(--theme-light\)\]\/50"/,
  "Card className={order-2 }"
);

fs.writeFileSync(file, code);
