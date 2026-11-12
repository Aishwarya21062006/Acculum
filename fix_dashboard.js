const fs = require('fs');
const file = 'src/app/student/dashboard/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace Header text color
code = code.replace(
  /className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight"/,
  "className={	ext-3xl md:text-4xl font-extrabold tracking-tight }"
);

// Replace Greeting paragraph
code = code.replace(
  /className="text-slate-500 mt-2 text-base"/,
  "className={mt-2 text-base }"
);

// Replace Stats chips
code = code.replace(
  /className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2"/g,
  "className={px-4 py-2 rounded-xl shadow-sm border flex items-center gap-2 }"
);
code = code.replace(
  /className="text-sm font-bold text-slate-700 leading-tight"/g,
  "className={	ext-sm font-bold leading-tight }"
);

// Replace Main Card (Continue Learning)
code = code.replace(
  /Card className="border-0 shadow-lg overflow-hidden bg-white relative"/,
  "Card className={order-0 shadow-lg overflow-hidden relative }"
);
code = code.replace(
  /h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2"/,
  "h2 className={	ext-2xl md:text-3xl font-bold mb-2 }"
);
code = code.replace(
  /className="text-slate-600 mb-6 max-w-lg"/,
  "className={mb-6 max-w-lg }"
);
code = code.replace(
  /className="flex justify-between text-sm font-bold mb-2">[\s\S]*?<span className="text-slate-700">/,
  "className=\"flex justify-between text-sm font-bold mb-2\">\n                    <span className={isCricket ? 'text-green-100' : 'text-slate-700'}>"
);
code = code.replace(
  /className="w-full bg-slate-100 h-3 rounded-full overflow-hidden"/,
  "className={w-full h-3 rounded-full overflow-hidden }"
);
code = code.replace(
  /className="text-sm text-slate-500 font-medium flex items-center gap-1"/,
  "className={	ext-sm font-medium flex items-center gap-1 }"
);
code = code.replace(
  /Button className="w-full sm:w-auto h-12 px-8 text-base bg-\[var\(--theme-primary\)\] hover:opacity-90"/,
  "Button className={w-full sm:w-auto h-12 px-8 text-base font-bold }"
);

// Recommended for you
code = code.replace(
  /h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"/,
  "h3 className={	ext-xl font-bold mb-4 flex items-center gap-2 }"
);
code = code.replace(
  /Card className="hover:border-\[var\(--theme-primary\)\] cursor-pointer group transition-all"/,
  "Card className={cursor-pointer group transition-all }"
);
code = code.replace(
  /h4 className="font-bold text-slate-900 mb-1 group-hover:text-\[var\(--theme-primary\)\] transition-colors"/,
  "h4 className={ont-bold mb-1 transition-colors }"
);
code = code.replace(
  /className="text-sm text-slate-500 mb-4"/,
  "className={	ext-sm mb-4 }"
);
code = code.replace(
  /className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded"/,
  "className={	ext-xs font-bold px-2 py-1 rounded }"
);
// Do it twice for the second card
code = code.replace(
  /Card className="hover:border-indigo-500 cursor-pointer group transition-all"/,
  "Card className={cursor-pointer group transition-all }"
);
code = code.replace(
  /h4 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors"/,
  "h4 className={ont-bold mb-1 transition-colors }"
);
code = code.replace(
  /className="text-sm text-slate-500 mb-4"/,
  "className={	ext-sm mb-4 }"
);
code = code.replace(
  /className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded"/,
  "className={	ext-xs font-bold px-2 py-1 rounded }"
);


// Assignments card
code = code.replace(
  /Card className="border border-slate-200 bg-white shadow-sm"/,
  "Card className={order shadow-sm }"
);
code = code.replace(
  /div className="flex items-center gap-2 text-\[var\(--theme-primary\)\] font-bold text-sm uppercase tracking-wider mb-4"/,
  "div className={lex items-center gap-2 font-bold text-sm uppercase tracking-wider mb-4 }"
);
code = code.replace(
  /div className="p-3 bg-rose-50 text-rose-600 rounded-xl"/,
  "div className={p-3 rounded-xl }"
);
code = code.replace(
  /div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"/,
  "div className={p-3 rounded-xl }"
);
code = code.replace(
  /p className="font-bold text-slate-900 text-sm truncate"/g,
  "p className={ont-bold text-sm truncate }"
);
code = code.replace(
  /Link href="\/student\/assignments" className="text-center text-sm text-\[var\(--theme-primary\)\] font-bold hover:underline block pt-2"/,
  "Link href=\"/student/assignments\" className={	ext-center text-sm font-bold hover:underline block pt-2 }"
);

fs.writeFileSync(file, code);
