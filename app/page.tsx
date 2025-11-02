'use client';

import { Heading } from '@/components/Heading';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function Page() {
  return (
    <main>
      <section data-test="hero" className="mx-auto max-w-5xl px-8 py-16">
        <Heading size="4xl">Hello, Visual Contract!</Heading>
        <p className="mt-4 text-lg leading-7 text-gray-700">
          Align code with design via measurable contracts.
        </p>
        <div className="mt-8">
          <PrimaryButton>Get Started</PrimaryButton>
        </div>
      </section>
    </main>
  );
}
