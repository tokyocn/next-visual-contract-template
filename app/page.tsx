import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';

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
    variant: 'solid'
  },
  {
    label: 'Request a demo',
    variant: 'outline'
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
  headingLines?: string[];
  body: string;
  ctaLabel: string;
  imageSrc: string;
  imageAlt: string;
  imageFirst?: boolean;
  imageHeight?: number;
};

const FEATURE_SECTIONS: FeatureSection[] = [
  {
    id: 'digital-learning',
    eyebrow: 'Upskill today. Overcome the challenges of tomorrow.',
    heading: 'Digital learning for your workforce',
    headingLines: ['Digital learning for your', 'workforce'],
    body:
      'Learning Plus provides premium e-learning content to you and your employees online and 24/7, meaning they can learn in the environment that suits them best.',
    ctaLabel: 'Manage employees digitally',
    imageSrc: '/images/feature-digital-learning.png',
    imageAlt: 'Digital learning dashboard illustration',
    imageFirst: true,
    imageHeight: 435
  },
  {
    id: 'team-capability',
    heading: 'Uplift team capability',
    body:
      'Investing in your team’s learning and development can improve engagement, reduce turnover and increase productivity. Empower your team to learn with thousands of courses available on-demand.',
    ctaLabel: 'Improve employee engagement',
    imageSrc: '/images/feature-team-capability.png',
    imageAlt: 'Team capability illustration',
    imageHeight: 360
  },
  {
    id: 'pricing',
    heading: 'Pricing that works for you',
    body:
      'Learning Plus is available on Premium and Platinum subscriptions for a small additional employee per month. It’s a cost-effective way to boost your team’s skills and development.',
    ctaLabel: 'Flexible pricing',
    imageSrc: '/images/feature-pricing.png',
    imageAlt: 'Flexible pricing illustration',
    imageFirst: true,
    imageHeight: 435
  }
];

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
  },
  {
    heading: 'Product',
    links: ['Products', 'Solutions', 'Integrations', 'Quick Demos']
  },
  {
    heading: 'Connect',
    links: ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube']
  }
] as const;

function Header() {
  return (
    <div
      data-test="header"
      className="flex flex-col"
      style={{ width: '1440px', height: '74px', boxSizing: 'border-box' }}
    >
      <div
        data-test="header-nav"
        className="flex flex-col"
        style={{
          width: '1440px',
          height: '74px',
          paddingTop: '16px',
          paddingRight: '27px',
          paddingBottom: '18px',
          paddingLeft: '72px',
          boxSizing: 'border-box'
        }}
      >
        <div
          data-test="desktop_navigation-container"
          className="flex items-center justify-between"
          style={{
            width: '1296px',
            height: '41px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'row',
            boxSizing: 'border-box'
          }}
        >
          <div
            data-test="desktop_navigation-main-menu"
            className="flex items-center"
            style={{
              width: '943px',
              height: '40px',
              gap: '74px',
              display: 'flex',
              flexDirection: 'row',
              boxSizing: 'border-box'
            }}
          >
            <div
              data-test="desktop_navigation-logo"
              className="flex flex-col items-center justify-center"
              style={{
                width: '200px',
                height: '36px',
                paddingTop: '4px',
                boxSizing: 'border-box'
              }}
            >
              <Link href="#" className="flex items-center justify-center">
                <Image src="/images/logo-full.svg" alt="LearningPlus" width={200} height={32} priority />
              </Link>
            </div>
            <div
              className="flex items-center"
              style={{
                width: '669px',
                height: '40px',
                paddingTop: '8px',
                paddingRight: '72px',
                paddingBottom: '8px',
                paddingLeft: '0px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div
                data-test="menu_navigation-container"
                className="flex items-center"
                style={{
                  width: '597px',
                  height: '25px',
                  gap: '24px',
                  display: 'flex',
                  flexDirection: 'row',
                  boxSizing: 'border-box'
                }}
              >
                {NAV_LINKS.map(link => (
                  <div
                    key={link}
                    data-test="menu_navigation-main-item"
                    className="flex flex-col items-center justify-center"
                    style={{
                      width: '87px',
                      height: '25px',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                      boxSizing: 'border-box',
                      flex: '0 0 87px'
                    }}
                  >
                    <Link
                      href="#"
                      className="flex items-center justify-center gap-2 text-sm font-medium text-[#212529] transition hover:text-[#000000]"
                    >
                      {link}
                      <span className="inline-flex h-4 w-4 items-center justify-center text-[#171214]">
                        <svg
                          aria-hidden
                          viewBox="0 0 16 16"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 6.25 8 10.25 12 6.25" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            data-test="desktop_navigation-ctas"
            className="flex items-center"
            style={{
              width: '403px',
              height: '41px',
              gap: '12px',
              display: 'flex',
              flexDirection: 'row',
              boxSizing: 'border-box'
            }}
          >
            {NAV_CTAS.map(cta => (
              <div
                key={cta.label}
                data-test={cta.variant === 'solid' ? 'desktop_navigation-primary-cta' : 'desktop_navigation-secondary-cta'}
                className="flex flex-col items-center justify-center"
                style={{
                  width: cta.variant === 'solid' ? '205px' : '186px',
                  height: '41px',
                  boxSizing: 'border-box'
                }}
              >
                <Link
                  href="#"
                  className={[
                    'w-full rounded-full px-6 py-2.5 text-sm font-semibold transition text-center',
                    cta.variant === 'solid'
                      ? 'bg-[#7622D7] text-white shadow-sm hover:bg-[#621aba]'
                      : 'border border-[#171214] text-[#171214] hover:bg-[#f4f4f4]'
                  ].join(' ')}
                >
                  {cta.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
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

function BreadcrumbDividerIcon() {
  return (
    <svg aria-hidden viewBox="0 0 6 10" className="h-2.5 w-1.5 text-[#5B5B5B]" fill="none">
      <path d="M1 1 4.5 5 1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Breadcrumbs() {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[14px] font-medium text-[#212529]">
      {BREADCRUMBS.map((crumb, index) => {
        const isLast = index === BREADCRUMBS.length - 1;
        return (
          <div key={crumb.label} className="flex items-center gap-2">
            <Link
              href={crumb.href}
              className={
                isLast
                  ? 'font-semibold text-[#000000]'
                  : 'text-[#212529] transition hover:text-[#000000]'
              }
            >
              {crumb.label}
            </Link>
            {!isLast && (
              <div
                data-test="breadcrumbs-divider:margin"
                className="flex flex-col items-center justify-center"
                style={{ width: '19px', height: '12px', paddingTop: '3px' }}
              >
                <div
                  data-test="breadcrumbs-divider"
                  className="flex flex-col items-center justify-center"
                  style={{ width: '19px', height: '9px', paddingRight: '7px', paddingLeft: '7px' }}
                >
                  <BreadcrumbDividerIcon />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function HeroSection() {
  return (
    <div
      data-test="hero-container2"
      className="flex items-center"
      style={{
        width: '1040px',
        height: '460px',
        gap: '106px',
        display: 'flex',
        flexDirection: 'row',
        boxSizing: 'border-box'
      }}
    >
      <div
        data-test="hero-content2"
        className="flex flex-col justify-between text-[#000000]"
        style={{ width: '544px', height: '410px', boxSizing: 'border-box' }}
      >
        <div className="space-y-10">
          <h1 className="text-[56px] font-medium leading-[61px] tracking-tight">
            Employee learning
            <br />
            management system.
          </h1>
          <div className="space-y-[1.875rem] text-[24px] font-medium leading-[30px]">
            <p>Embrace growth. Upskill, develop and retain your best.</p>
            <p>Invest in your team and reap the benefits long term. It&apos;s the best decision you&apos;ll ever make.</p>
          </div>
        </div>
        <div
          data-test="hero-ctas"
          className="flex items-center"
          style={{
            width: '546px',
            height: '85px',
            paddingTop: '32px',
            paddingRight: '147px',
            gap: '16px',
            display: 'flex',
            flexDirection: 'row',
            boxSizing: 'border-box'
          }}
        >
          <div
            data-test="hero-cta-primary"
            className="flex flex-col items-center justify-center"
            style={{ width: '182px', height: '53px', boxSizing: 'border-box' }}
          >
            <Link
              data-test="cta-primary"
              href="#"
              className="w-full rounded-[32px] border border-[#7622D7] bg-[#7622D7] px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-[#621aba]"
            >
              Request a demo
            </Link>
          </div>
          <div
            data-test="hero-cta-secondary"
            className="flex flex-col items-center justify-center"
            style={{ width: '201px', height: '53px', boxSizing: 'border-box' }}
          >
            <Link
              data-test="cta-secondary"
              href="#"
              className="w-full rounded-[32px] border border-[#111827] px-8 py-3 text-base font-semibold text-black transition hover:bg-white/60"
            >
              Start your free trial
            </Link>
          </div>
        </div>
      </div>
      <div className="flex w-full justify-center lg:w-auto lg:justify-end">
        <div
          data-test="hero-media"
          className="flex items-center justify-center"
          style={{ width: '390px', height: '460px', boxSizing: 'border-box', display: 'flex', flexDirection: 'row' }}
        >
          <div
            data-test="hero-media2"
            className="flex items-center justify-center"
            style={{
              width: '390px',
              height: '460px',
              paddingTop: '38px',
              paddingBottom: '32px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              backgroundColor: 'transparent',
              borderRadius: '0px',
              boxShadow: 'none'
            }}
          >
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[2.5rem] bg-white shadow-xl">
              <div
                data-test="hero-media-wrapper"
                className="flex flex-col overflow-hidden"
                style={{
                  width: '390px',
                  height: '390px',
                  boxSizing: 'border-box',
                  backgroundColor: 'transparent',
                  borderRadius: '0px'
                }}
              >
                <Image
                  src="/images/hero-visual.png"
                  alt="LearningPlus hero visual"
                  width={390}
                  height={390}
                  unoptimized
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentSections({
  featureOne,
  featureTwo,
  featureThree
}: {
  featureOne: FeatureSection;
  featureTwo: FeatureSection;
  featureThree: FeatureSection;
}) {
  return (
    <div
      data-test="document"
      className="mx-auto flex flex-col overflow-hidden"
      style={{
        width: '1440px',
        height: '2320px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div
        data-test="document-section4"
        className="flex flex-col items-center"
        style={{
          width: '1440px',
          height: '738px',
          backgroundColor: 'rgb(144, 185, 255)',
          paddingTop: '38px',
          paddingBottom: '120px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
      >
        <div className="flex justify-center">
          <div
            data-test="h-container-header1"
            className="flex w-full flex-col"
            style={{
              width: '1440px',
              height: '120px',
              paddingLeft: '176px',
              paddingRight: '176px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box'
            }}
          >
            <div
              data-test="h-container1"
              className="flex w-full flex-col justify-end"
              style={{
                width: '1088px',
                height: '120px',
                paddingTop: '24px',
                paddingRight: '24px',
                paddingBottom: '48px',
                paddingLeft: '24px',
                boxSizing: 'border-box'
              }}
            >
              <Breadcrumbs />
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div
            data-test="h-container-header2"
            className="flex w-full flex-col"
            style={{
              width: '1440px',
              paddingLeft: '176px',
              paddingRight: '176px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box'
            }}
          >
            <div
              data-test="h-container2"
              className="flex w-full flex-col"
              style={{
                width: '1088px',
                paddingLeft: '24px',
                paddingRight: '24px',
                boxSizing: 'border-box'
              }}
            >
              <HeroSection />
            </div>
          </div>
        </div>
      </div>

      <div
        data-test="document-section3"
        className="flex justify-center"
        style={{
          width: '1440px',
          height: '667px',
          backgroundColor: 'rgb(248, 246, 253)',
          paddingTop: '120px',
          paddingRight: '176px',
          paddingLeft: '176px',
          display: 'flex',
          flexDirection: 'row',
          boxSizing: 'border-box'
        }}
      >
        <div
          data-test="h-container-fe"
          style={{
            width: '1088px',
            height: '547px',
            backgroundColor: 'rgb(255, 56, 60)',
            paddingLeft: '24px',
            paddingRight: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '64px',
            boxSizing: 'border-box'
          }}
        >
          <FeatureSectionBlock section={featureOne} highlighted />
        </div>
      </div>

      <div
        data-test="document-section2"
        className="flex justify-center"
        style={{
          width: '1440px',
          height: '360px',
          backgroundColor: 'rgb(248, 246, 253)',
          paddingRight: '176px',
          paddingLeft: '176px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        <div
          data-test="h-container3"
          style={{
            width: '1088px',
            height: '360px',
            paddingLeft: '24px',
            paddingRight: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxSizing: 'border-box'
          }}
        >
          <FeatureSectionBlock section={featureTwo} />
        </div>
      </div>

      <div
        data-test="document-section1"
        className="flex justify-center"
        style={{
          width: '1440px',
          height: '555px',
          backgroundColor: 'rgb(248, 246, 253)',
          paddingRight: '176px',
          paddingLeft: '176px',
          paddingBottom: '120px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        <div
          data-test="h-container4"
          style={{
            width: '1088px',
            height: '435px',
            paddingLeft: '24px',
            paddingRight: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxSizing: 'border-box'
          }}
        >
          <FeatureSectionBlock section={featureThree} />
        </div>
      </div>
    </div>
  );
}

function FeatureSectionBlock({ section, highlighted }: { section: FeatureSection; highlighted?: boolean }) {
  const isHighlighted = Boolean(highlighted);

  const illustrationHeight = section.imageHeight ?? 360;
  const highlightImageHeight = section.imageHeight ?? 435;

  const illustration = (
    <div
      className="flex flex-col items-center justify-center"
      {...(isHighlighted
        ? {
            'data-test': 'image_left_right-image_flex',
            style: {
              width: '460px',
              height: `${highlightImageHeight}px`,
              boxSizing: 'border-box'
            } satisfies CSSProperties
          }
        : {
            style: {
              width: '460px',
              height: `${illustrationHeight}px`,
              boxSizing: 'border-box'
            } satisfies CSSProperties
          })}
    >
      <div
        className="flex h-full w-full overflow-hidden"
        {...(isHighlighted
          ? {
              'data-test': 'image_left_right-image_flex_wrapper',
              style: {
                width: '460px',
                height: `${highlightImageHeight}px`,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                backgroundColor: 'transparent',
                borderRadius: '0px',
                border: 'none',
                boxShadow: 'none'
              } satisfies CSSProperties
            }
          : {
              style: {
                width: '460px',
                height: `${illustrationHeight}px`,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                backgroundColor: 'transparent',
                borderRadius: '0px',
                border: 'none',
                boxShadow: 'none'
              } satisfies CSSProperties
            })}
      >
        <div
          className={[
            'flex h-full w-full',
            'overflow-hidden',
            isHighlighted ? 'rounded-[2.5rem] border border-black/5 bg-white shadow-lg' : ''
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <Image
            src={section.imageSrc}
            alt={section.imageAlt}
            width={460}
            height={isHighlighted ? highlightImageHeight : illustrationHeight}
            className="h-full w-full object-cover object-center"
          />
        </div>
      </div>
    </div>
  );

  const heading = (
    <div
      className="flex flex-col space-y-3"
      {...(isHighlighted
        ? {
            'data-test': 'image_left_right-heading',
            style: {
              width: '400px',
              height: '82px',
              minHeight: '82px',
              paddingRight: '106px',
              paddingBottom: '17px',
              gap: '1px',
              justifyContent: 'space-between',
              boxSizing: 'border-box'
            } satisfies CSSProperties
          }
        : { style: { width: '400px' } satisfies CSSProperties })}
    >
      <h2 className="text-[28px] font-medium leading-[32px] tracking-[-0.01em] text-[#171214] sm:text-[28px]">
        {section.headingLines
          ? section.headingLines.map((line, idx) => (
              <span key={line}>
                {line}
                {idx !== section.headingLines!.length - 1 && <br />}
              </span>
            ))
          : section.heading}
      </h2>
    </div>
  );

  const content = (
    <div
      className="flex flex-col space-y-5 text-left"
      {...(isHighlighted
        ? {
            'data-test': 'image_left_right-content_flex',
            style: {
              width: '554px',
              height: '202px',
              flex: '0 0 554px',
              boxSizing: 'border-box'
            } satisfies CSSProperties
          }
        : {
            style: {
              width: '554px',
              maxWidth: '554px',
              boxSizing: 'border-box'
            } satisfies CSSProperties
          })}
    >
      {heading}
      <p className="text-[18px] leading-[24px] text-[#1f2933]">{section.body}</p>
      <div
        className="flex flex-col"
        {...(isHighlighted
          ? {
              'data-test': 'text-left',
              style: {
                width: '474px',
                height: '25px',
                minHeight: '25px',
                paddingTop: '2px',
                paddingRight: '253px',
                paddingBottom: '2px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center'
              } satisfies CSSProperties
            }
          : { style: { width: '474px' } satisfies CSSProperties })}
      >
        <Link
          href="#"
          className="inline-flex items-center gap-2 text-[16px] font-semibold leading-[20px] text-[#7622D7] transition hover:text-[#621aba]"
        >
          {section.ctaLabel}
          <ArrowRightIcon className="h-4 w-4 text-[#7622D7]" />
        </Link>
      </div>
    </div>
  );

  const innerClass = 'flex flex-row items-center';
  const containerStyle: CSSProperties = isHighlighted
    ? {
        width: '1040px',
        height: '435px',
        paddingRight: '26px',
        display: 'flex',
        boxSizing: 'border-box',
        flexDirection: section.imageFirst ? 'row' : 'row-reverse',
        alignItems: 'center',
        gap: '64px'
      }
    : {
        display: 'flex',
        flexDirection: section.imageFirst ? 'row' : 'row-reverse',
        alignItems: 'center',
        gap: section.imageFirst ? '26px' : '52px'
      };
  containerStyle.backgroundColor = 'transparent';
  containerStyle.borderRadius = '0px';
  containerStyle.boxShadow = 'none';

  const containerProps = isHighlighted
    ? ({
        'data-test': 'image_left_right-container',
        style: containerStyle
      } satisfies { 'data-test': string; style: CSSProperties })
    : ({
        style: containerStyle
      } satisfies { style: CSSProperties });

  const wrapperClass = isHighlighted
    ? 'flex flex-col gap-12'
    : 'flex h-full flex-col justify-center';

  return (
    <div id={section.id} className={wrapperClass}>
      {section.eyebrow && (
        <div className="text-center">
          <p className="text-[32px] font-semibold leading-[1.25] text-[#171214] sm:text-[42px]">
            {section.eyebrow}
          </p>
        </div>
      )}
      <div className={innerClass} {...containerProps}>
        {section.imageFirst ? (
          <>
            {illustration}
            {content}
          </>
        ) : (
          <>
            {content}
            {illustration}
          </>
        )}
      </div>
    </div>
  );
}

function Footer() {
  const socialIcons = ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube'] as const;

  return (
    <div
      data-test="footer"
      className="flex flex-col items-center"
      style={{
        width: '1440px',
        height: '293px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '48px',
        paddingBottom: '48px',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff'
      }}
    >
      <div
        data-test="h-container"
        className="flex w-full flex-col"
        style={{
          width: '1088px',
          paddingTop: '64px',
          paddingRight: '24px',
          paddingBottom: '32px',
          paddingLeft: '24px',
          height: '293px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box'
        }}
      >
        <div
          data-test="footer-columns_desktop"
          className="flex"
          style={{
            width: '1040px',
            height: '197px',
            gap: '59px',
            display: 'flex',
            flexDirection: 'row',
            boxSizing: 'border-box'
          }}
        >
          {FOOTER_COLUMNS.map(column => (
            <div
              key={column.heading}
              data-test="footer-column"
              className="flex flex-col"
              style={{ width: '128px', height: '197px', paddingBottom: '64px', boxSizing: 'border-box' }}
            >
              <div
                data-test="footer-column_container"
                className="flex flex-col"
                style={{ width: '128px', height: '133px', gap: '20px', boxSizing: 'border-box' }}
              >
                <div
                  data-test="footer-column_heading"
                  className="flex flex-col"
                  style={{ width: '128px', height: '25px', paddingRight: '58px', paddingBottom: '1px', boxSizing: 'border-box' }}
                >
                  <h3 className="text-base font-semibold tracking-tight text-gray-900">{column.heading}</h3>
                </div>
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
            </div>
            ))}
          </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {socialIcons.map(icon => (
              <div
                key={icon}
                data-test="footer-column_social_icon"
                className="flex flex-col items-center justify-center text-[#7622D7]"
                style={{ width: '15px', height: '15px', boxSizing: 'border-box' }}
                title={icon}
              >
                <span className="sr-only">{icon}</span>
                <div aria-hidden className="flex h-full w-full items-center justify-center rounded-full bg-[#7622D7]/10" />
              </div>
            ))}
          </div>
          <div
            data-test="text-center"
            className="flex flex-col items-center justify-center"
            style={{
              width: '15px',
              height: '18px',
              paddingRight: '4px',
              paddingLeft: '4px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box'
            }}
          >
            <span className="text-sm font-semibold text-[#171214]">•</span>
          </div>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} LearningPlus. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [featureOne, featureTwo, featureThree] = FEATURE_SECTIONS;

  return (
    <main className="bg-white text-gray-900">
      <Header />
      <DocumentSections
        featureOne={featureOne}
        featureTwo={featureTwo}
        featureThree={featureThree}
      />
      <Footer />
    </main>
  );
}
