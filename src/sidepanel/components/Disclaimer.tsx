import { ShieldAlertIcon } from './icons';

export function Disclaimer() {
  return (
    <div className="disclaimer flex gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
      <ShieldAlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
      <p className="text-sm leading-relaxed text-amber-900">
        This is not medical advice. Please consult your healthcare provider for interpretation of
        your results.
      </p>
    </div>
  );
}
