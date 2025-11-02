import Image from 'next/image';
import Link from 'next/link';

const NAV_LINKS = [
  'Products',
  'Solutions',
  'Why us',
  'Partners',
  'Pricing',
  'Resources'
] as const;

const NAV_CTAS = [
  {
    label: 'Start your free trial',
    variant: 'outline'
  },
  {
    label: 'Request a demo',
    variant: 'solid'
  }
] as const;

const BREADCRUMBS = [
  { label: 'Home', href: '#' },
  { label: 'Products', href: '#' },
  { label: 'Employee Learning Management System', href: '#' }
] as const;

type FeatureSection = {
  id: string;
  eyebrow?: string;
  heading: string;
  body: string;
  ctaLabel: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
};

const FEATURE_SECTIONS: FeatureSection[] = [
  {
    id: 'digital-learning',
    eyebrow: 'Upskill today. Overcome the challenges of tomorrow.',
    heading: 'Digital learning for your workforce',
    body:
      'Learning Plus provides premium e-learning content to you and your employees online and 24/7, meaning they can learn in the environment that suits them best.',
    ctaLabel: 'Manage employees digitally',
    imageSrc: '/images/feature-digital-learning.svg',
    imageAlt: 'Digital learning dashboard illustration'
  },
  {
    id: 'team-capability',
    heading: 'Uplift team capability',
    body:
      'Investing in your team’s learning and development can improve engagement, reduce turnover and increase productivity. Empower your team to learn with thousands of courses available on-demand.',
    ctaLabel: 'Improve employee engagement',
    imageSrc: '/images/feature-team-capability.svg',
    imageAlt: 'Team capability illustration',
    reverse: true
  },
  {
    id: 'pricing',
    heading: 'Pricing that works for you',
    body:
      'Learning Plus is available on Premium and Platinum subscriptions for a small additional employee per month. It’s a cost-effective way to boost your team’s skills and development.',
    ctaLabel: 'Flexible pricing',
    imageSrc: '/images/feature-pricing.svg',
    imageAlt: 'Flexible pricing illustration'
  }
];

const HERO_MEDIA = {
  src: '/images/hero-illustration.svg',
  alt: 'Employee learning hero illustration'
} as const;

const FOOTER_COLUMNS = [
  {
    heading: 'Company',
    links: ['About us', 'Careers', 'Become a partner']
  },
  {
    heading: 'Get in Touch',
    links: ['Contact us', 'Sales', 'Report a bug']
  },
  {
    heading: 'Support',
    links: ['Service Centre', 'Help Desk', 'Hero Academy', 'Implementation Hub']
  },
  {
    heading: 'Pick your region',
    links: ['Australia', 'New Zealand', 'United Kingdom', 'Singapore', 'Malaysia']
  }
] as const;

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={className ?? 'h-4 w-4 text-gray-900'}
      fill="none"
    >
      <path d="M4.5 6.5 8 10l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 14 14"
      className={className ?? 'h-3.5 w-3.5'}
      fill="none"
    >
      <path
        d="M1 7h11.25M8 3.75 12.25 7 8 10.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavBar() {
  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex w-full max-w-[81rem] items-center justify-between px-6 py-6 lg:px-16">
        <div className="flex items-center gap-16">
          <Link href="#" className="flex items-center">
            <Image src="/images/logo-full.svg" alt="LearningPlus" width={200} height={32} priority />
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map(link => (
              <Link
                key={link}
                href="#"
                className="flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                <span>{link}</span>
                <ChevronDownIcon className="h-4 w-4 text-gray-600" />
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {NAV_CTAS.map(cta => (
            <Link
              key={cta.label}
              href="#"
              className={[
                'rounded-full px-6 py-2 text-sm font-semibold transition',
                cta.variant === 'solid'
                  ? 'bg-[#7622D7] text-white shadow-sm hover:bg-[#621aba]'
                  : 'border border-gray-900 text-gray-900 hover:bg-gray-100'
              ].join(' ')}
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

function Breadcrumbs() {
  return (
    <nav aria-label="Breadcrumb" className="mb-12 flex flex-wrap items-center gap-2 text-sm text-gray-700">
      {BREADCRUMBS.map((crumb, index) => {
        const isLast = index === BREADCRUMBS.length - 1;
        return (
          <div key={crumb.label} className="flex items-center gap-2">
            <Link
              href={crumb.href}
              className={isLast ? 'font-medium text-gray-900' : 'text-gray-700 transition hover:text-gray-900'}
            >
              {crumb.label}
            </Link>
            {!isLast && <span className="text-gray-600">/</span>}
          </div>
        );
      })}
    </nav>
  );
}

function HeroSection() {
  return (
    <section data-test="hero" className="bg-[#90B9FF]">
      <div className="mx-auto w-full max-w-[68rem] px-6 py-16 sm:py-20 lg:px-16">
        <Breadcrumbs />
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[34rem] space-y-8">
            <h1 className="text-[38px] font-medium leading-[44px] tracking-tight text-black sm:text-[56px] sm:leading-[61px]">
              Employee learning
              <br />
              management system.
            </h1>
            <div className="space-y-6 text-[20px] font-medium leading-[28px] text-black sm:text-[24px] sm:leading-[30px]">
              <p>Embrace growth. Upskill, develop and retain your best.</p>
              <p>Invest in your team and reap the benefits long term. It&apos;s the best decision you&apos;ll ever make.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="#"
                data-test="cta-primary"
                className="rounded-[32px] border border-[#7622D7] bg-[#7622D7] px-8 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-[#621aba]"
              >
                Request a demo
              </Link>
              <Link
                href="#"
                data-test="cta-secondary"
                className="rounded-[32px] border border-gray-900 px-8 py-4 text-base font-semibold text-black transition hover:bg-white/60"
              >
                Start your free trial
              </Link>
            </div>
          </div>
          <div className="flex w-full flex-1 justify-center lg:justify-end">
            <div className="h-80 w-80 overflow-hidden rounded-[2.5rem] border border-black/10 shadow-xl sm:h-[22rem] sm:w-[22rem]">
              <Image
                src={HERO_MEDIA.src}
                alt={HERO_MEDIA.alt}
                width={390}
                height={390}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureSectionBlock({ section }: { section: FeatureSection }) {
  const content = (
    <div className="max-w-[34rem] space-y-6">
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl">{section.heading}</h2>
      </div>
      <p className="text-base leading-7 text-gray-800">{section.body}</p>
      <Link
        href="#"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#7622D7] transition hover:text-[#621aba]"
      >
        {section.ctaLabel}
        <ArrowRightIcon className="h-4 w-4 text-[#7622D7]" />
      </Link>
    </div>
  );

  const illustration = (
    <div className="flex w-full justify-center lg:w-auto">
      <div className="h-72 w-full max-w-md overflow-hidden rounded-[2.5rem] border border-black/5 shadow-lg">
        <Image
          src={section.imageSrc}
          alt={section.imageAlt}
          width={360}
          height={288}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );

  const rowClasses = section.reverse
    ? 'flex flex-col items-center gap-12 lg:flex-row-reverse lg:items-center lg:justify-between'
    : 'flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between';

  return (
    <div id={section.id} className="py-16">
      {section.eyebrow && (
        <div className="mb-12 text-center">
          <p className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-[42px] sm:leading-[1.15]">
            {section.eyebrow}
          </p>
        </div>
      )}
      <div className={rowClasses}>
        {content}
        {illustration}
      </div>
    </div>
  );
}

function FeatureSections() {
  return (
    <section className="bg-[#F8F6FD]">
      <div className="mx-auto w-full max-w-[68rem] px-6 lg:px-16">
        {FEATURE_SECTIONS.map((section, index) => (
          <FeatureSectionBlock key={section.id} section={section} />
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto w-full max-w-[68rem] px-6 py-16 lg:px-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {FOOTER_COLUMNS.map(column => (
            <div key={column.heading} className="space-y-5">
              <h3 className="text-base font-semibold tracking-tight text-gray-900">{column.heading}</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                {column.links.map(link => (
                  <li key={link}>
                    <Link href="#" className="transition hover:text-gray-900">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-black/5 pt-6 text-sm text-gray-500">
          © {new Date().getFullYear()} LearningPlus. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <NavBar />
      <HeroSection />
      <FeatureSections />
      <Footer />
    </main>
  );
}
