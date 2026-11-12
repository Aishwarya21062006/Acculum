const fs = require('fs');
const file = 'src/components/shared/QuickSummarize.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /className="p-6"/,
  "className={p-6 }"
);

// Quick Help heading
code = code.replace(
  /className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2"/,
  "className={	ext-lg font-bold mb-1 flex items-center gap-2 }"
);
code = code.replace(
  /className="text-sm text-slate-500 mb-6"/,
  "className={	ext-sm mb-6 }"
);

// Buttons (Photo/Voice/Type)
code = code.replace(
  /className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border-2 border-slate-100 hover:border-\[var\(--theme-primary\)\] hover:bg-\[var\(--theme-light\)\]\/50 transition-all group relative"/g,
  "className={lex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all group relative }"
);
code = code.replace(
  /className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border-2 border-slate-100 hover:border-\[var\(--theme-primary\)\] hover:bg-\[var\(--theme-light\)\]\/50 transition-all group"/g,
  "className={lex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all group }"
);

code = code.replace(
  /className="text-xs font-bold text-slate-600 group-hover:text-\[var\(--theme-primary\)\] text-center leading-tight"/g,
  "className={	ext-xs font-bold text-center leading-tight transition-colors }"
);

fs.writeFileSync(file, code);
