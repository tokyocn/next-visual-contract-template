import { ReactNode } from 'react';

export function PrimaryButton({ children }: { children: ReactNode }) {
  return (
    <a data-test="cta" href="#" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
      {children}
    </a>
  );
}
