import { ReactNode } from 'react';

type Size = 'xl' | '2xl' | '4xl';

export function Heading({ size='4xl', children }: { size?: Size; children: ReactNode }) {
  const map: Record<Size,string> = {
    xl: 'text-2xl leading-8 font-bold',
    '2xl': 'text-3xl leading-9 font-bold',
    '4xl': 'text-4xl leading-10 font-bold'
  };
  return <h1 className={map[size]}>{children}</h1>;
}
