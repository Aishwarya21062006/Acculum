import { Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Role' },
  { id: 2, label: 'Interests' },
  { id: 3, label: 'Details' },
  { id: 4, label: 'Verify' },
  { id: 5, label: 'Dashboard' },
];

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center" role="navigation" aria-label="Onboarding progress">
      {STEPS.map((step, i) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black
                  transition-all duration-300 ${
                  done   ? 'bg-green-600 text-white' :
                  active ? 'bg-green-600 text-white ring-4 ring-green-100' :
                           'bg-gray-200 text-gray-500'
                }`}
                aria-current={active ? 'step' : undefined}
              >
                {done ? <Check size={14} /> : step.id}
              </div>
              <span className={`text-[10px] mt-1 font-semibold transition-colors ${
                active ? 'text-green-600' : done ? 'text-green-500' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 md:w-14 h-0.5 mb-4 mx-1 transition-all duration-500 ${
                done ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
