import Image from 'next/image';

type JobCategory = {
  dataTest: string;
  name: string;
  jobs: string;
  active?: boolean;
};

type FeaturedJob = {
  dataTest: string;
  company: string;
  title: string;
  location: string;
  description: string;
  height: number;
};

const NAV_LINKS = ['Find Jobs', 'Browse Companies'] as const;

const COMPANY_LOGOS = ['Vodafone', 'Intel', 'Tesla', 'AMD', 'Talkit'] as const;

const JOB_CATEGORIES: JobCategory[] = [
  { dataTest: 'job-category1', name: 'Design', jobs: '235 jobs available' },
  { dataTest: 'job-category2', name: 'Sales', jobs: '756 jobs available' },
  { dataTest: 'job-category3', name: 'Marketing', jobs: '140 jobs available', active: true },
  { dataTest: 'job-category4', name: 'Finance', jobs: '325 jobs available' },
  { dataTest: 'job-category5', name: 'Technology', jobs: '436 jobs available' },
  { dataTest: 'job-category6', name: 'Engineering', jobs: '542 jobs available' },
  { dataTest: 'job-category7', name: 'Business', jobs: '211 jobs available' },
  { dataTest: 'job-category8', name: 'Human Resource', jobs: '346 jobs available' }
] as const;

const FEATURED_JOBS: FeaturedJob[] = [
  {
    dataTest: 'featured-jobs-desktop-list-row1-joblist1',
    company: 'Revolut',
    title: 'Email Marketing',
    location: 'Madrid, Spain',
    description:
      'Revolut is looking for an Email Marketing specialist to help the team manage multi-channel campaigns.',
    height: 283
  },
  {
    dataTest: 'featured-jobs-desktop-list-row1-joblist2',
    company: 'Dropbox',
    title: 'Brand Designer',
    location: 'San Francisco, US',
    description:
      'Dropbox is looking for a Brand Designer to help the creative team tell a consistent product story.',
    height: 283
  },
  {
    dataTest: 'featured-jobs-desktop-list-row1-joblist3',
    company: 'Pitch',
    title: 'Email Marketing',
    location: 'Berlin, Germany',
    description:
      'Pitch is looking for an Email Marketing manager to join the marketing team and grow campaign performance.',
    height: 283
  },
  {
    dataTest: 'featured-jobs-desktop-list-row1-joblist4',
    company: 'Blinkist',
    title: 'Visual Designer',
    location: 'Granada, Spain',
    description:
      'Blinkist is looking for a Visual Designer to help the product team craft intuitive in-app experiences.',
    height: 283
  },
  {
    dataTest: 'featured-jobs-desktop-list-row2-joblist1',
    company: 'ClassPass',
    title: 'Product Designer',
    location: 'Manchester, UK',
    description:
      'ClassPass is looking for a Product Designer to collaborate with cross-functional partners on new features.',
    height: 283
  },
  {
    dataTest: 'featured-jobs-desktop-list-row2-joblist2',
    company: 'Canva',
    title: 'Lead Designer',
    location: 'Ontario, Canada',
    description:
      'Canva is looking for a Lead Designer to guide product squads and ship delightful visual experiences.',
    height: 283
  },
  {
    dataTest: 'featured-jobs-desktop-list-row2-joblist3',
    company: 'GoDaddy',
    title: 'Brand Strategist',
    location: 'Marseille, France',
    description:
      'GoDaddy is looking for a Brand Strategist to join the marketing team and evolve the global brand voice.',
    height: 283
  },
  {
    dataTest: 'featured-jobs-desktop-list-row2-joblist4',
    company: 'Twitter',
    title: 'Data Analyst',
    location: 'San Diego, US',
    description:
      'Twitter is looking for a Data Analyst to partner with leadership and surface insights that drive growth.',
    height: 291
  }
] as const;

const SOCIALS = ['LinkedIn', 'Twitter', 'Instagram', 'Facebook', 'Dribbble'] as const;

const FOOTER_LINKS = {
  about: ['Companies', 'Pricing', 'Terms', 'Advice', 'Privacy Policy'],
  resources: ['Help Docs', 'Guide', 'Updates', 'Contact Us']
} as const;

function CategoryCard({ category }: { category: JobCategory }) {
  const isActive = Boolean(category.active);

  return (
    <div
      data-test={category.dataTest}
      style={{
        width: '274px',
        height: '214px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        padding: '32px',
        boxSizing: 'border-box',
        borderRadius: '0px',
        border: isActive ? 'none' : '1px solid #D6DDEB',
        backgroundColor: isActive ? '#4640DE' : '#FFFFFF',
        color: isActive ? '#FFFFFF' : '#25324B'
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0px',
          border: isActive ? '1px solid rgba(255,255,255,0.4)' : '1px solid #D6DDEB',
          fontWeight: 600,
          fontSize: '16px'
        }}
      >
        {category.name[0]}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span style={{ fontSize: '24px', fontWeight: 600 }}>{category.name}</span>
        <span style={{ fontSize: '18px', color: isActive ? 'rgba(255,255,255,0.8)' : '#7C8493' }}>
          {category.jobs}
        </span>
      </div>
    </div>
  );
}

function FeaturedJobCard({ job }: { job: FeaturedJob }) {
  return (
    <div
      data-test={job.dataTest}
      style={{
        width: '274px',
        height: `${job.height}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        boxSizing: 'border-box',
        borderRadius: '0px',
        border: '1px solid #D6DDEB',
        backgroundColor: '#FFFFFF',
        boxShadow: 'none'
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0px',
          border: '1px solid #D6DDEB',
          fontWeight: 600,
          fontSize: '14px',
          color: '#4640DE'
        }}
      >
        {job.company.slice(0, 2)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '18px', fontWeight: 600 }}>{job.title}</span>
        <span style={{ fontSize: '16px', color: '#515B6F' }}>{job.company}</span>
        <span style={{ fontSize: '16px', color: '#7C8493' }}>{job.location}</span>
      </div>
      <p style={{ fontSize: '14px', lineHeight: '22px', color: '#7C8493', flexGrow: 1 }}>{job.description}</p>
      <span style={{ fontSize: '14px', fontWeight: 600, color: '#4640DE' }}>Full Time</span>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#4640DE" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#4640DE" strokeWidth="1.5">
      <path d="M12 21s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10Z" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#4640DE" strokeWidth="1.5">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export default function JobPage() {
  return (
    <main className="flex justify-center bg-white text-[#25324B]">
      <div className="flex w-[1440px] flex-col items-stretch">
        <div
          data-test="header-desktop"
          style={{
            width: '1440px',
            height: '794px',
            backgroundColor: '#F8F8FD',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div
            data-test="top-nav"
            style={{
              height: '78px',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '124px',
              paddingRight: '124px',
              gap: '165px',
              boxSizing: 'border-box'
            }}
          >
            <div
              data-test="menu"
              style={{
                width: '452px',
                height: '78px',
                display: 'flex',
                alignItems: 'center',
                gap: '48px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#4640DE',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '16px'
                  }}
                >
                  JH
                </div>
                <span style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.01em' }}>JobHuntly</span>
              </div>
              <nav style={{ display: 'flex', alignItems: 'center', gap: '32px', fontSize: '16px', fontWeight: 500 }}>
                {NAV_LINKS.map(link => (
                  <a key={link} href="#" style={{ color: '#515B6F', textDecoration: 'none' }}>
                    {link}
                  </a>
                ))}
              </nav>
            </div>
            <div
              data-test="buttons"
              style={{
                width: '232px',
                height: '78px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '16px'
              }}
            >
              <a href="#" style={{ fontSize: '16px', fontWeight: 600, color: '#4640DE', textDecoration: 'none' }}>
                Login
              </a>
              <button
                type="button"
                style={{
                  height: '48px',
                  padding: '0 24px',
                  backgroundColor: '#4640DE',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 600,
                  border: 'none'
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
          <div
            style={{
              height: '716px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '94px',
              paddingLeft: '124px',
              paddingRight: '124px',
              boxSizing: 'border-box'
            }}
          >
            <div
              data-test="title"
              style={{
                width: '629px',
                height: '531px',
                display: 'flex',
                flexDirection: 'column',
                gap: '23px',
                marginTop: '72px'
              }}
            >
              <div
                data-test="title-area"
                style={{
                  width: '533px',
                  height: '290px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <h1 style={{ fontSize: '72px', lineHeight: '1.1', fontWeight: 600 }}>
                  Discover more than 5000+ Jobs
                </h1>
                <div style={{ width: '455px', height: '40px', backgroundColor: '#26A4FF', opacity: 0.1 }} />
              </div>
              <p style={{ width: '533px', fontSize: '18px', lineHeight: '1.6', color: '#515B6F' }}>
                Great platform for the job seeker that searching for new career heights and passionate about startups.
              </p>
              <div
                data-test="search"
                style={{
                  width: '852px',
                  height: '131px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div
                  data-test="search-bar"
                  style={{
                    width: '852px',
                    height: '89px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    padding: '16px',
                    boxSizing: 'border-box',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '0px',
                    boxShadow: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '0 0 260px' }}>
                    <SearchIcon />
                    <span style={{ fontSize: '16px', color: '#7C8493' }}>Job title or keyword</span>
                  </div>
                  <div style={{ width: '1px', height: '40px', backgroundColor: '#D6DDEB' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '0 0 260px' }}>
                    <LocationIcon />
                    <span style={{ fontSize: '16px', fontWeight: 500, color: '#25324B' }}>Florence, Italy</span>
                  </div>
                  <button
                    type="button"
                    style={{
                      height: '57px',
                      padding: '0 32px',
                      backgroundColor: '#4640DE',
                      color: '#FFFFFF',
                      fontSize: '16px',
                      fontWeight: 600,
                      border: 'none'
                    }}
                  >
                    Search my job
                  </button>
                </div>
                <p style={{ fontSize: '14px', lineHeight: '26px', color: 'rgba(32,36,48,0.7)' }}>
                  Popular : UI Designer, UX Researcher, Android, Admin
                </p>
              </div>
            </div>
            <div
              data-test="pic"
              style={{
                width: '501px',
                height: '707px',
                position: 'relative',
                borderRadius: '0px',
                boxShadow: 'none',
                marginTop: '9px'
              }}
            >
              <Image
                src="/images/hero-visual.png"
                alt="Team collaborating illustration"
                fill
                sizes="501px"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>

        <section
          data-test="company-desktop"
          style={{
            width: '1440px',
            height: '197px',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            padding: '48px 122px 48px 124px',
            boxSizing: 'border-box'
          }}
        >
          <span style={{ fontSize: '18px', color: 'rgba(32,36,48,0.5)' }}>Companies we helped grow</span>
          <div
            data-test="featured-company"
            style={{
              width: '1194px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '37px'
            }}
          >
            {COMPANY_LOGOS.map(logo => (
              <span key={logo} style={{ fontSize: '24px', fontWeight: 600, color: 'rgba(32,36,48,0.3)' }}>
                {logo}
              </span>
            ))}
          </div>
        </section>

        <section
          data-test="category-desktop"
          style={{
            width: '1440px',
            height: '705px',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '48px',
            padding: '72px 124px',
            boxSizing: 'border-box'
          }}
        >
          <div
            data-test="category-title"
            style={{
              width: '1192px',
              height: '53px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '10px'
            }}
          >
            <h2 style={{ fontSize: '48px', fontWeight: 600, lineHeight: '1.1' }}>Explore by category</h2>
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: 600,
                color: '#4640DE',
                background: 'none',
                border: 'none'
              }}
            >
              Show all jobs
              <ArrowIcon />
            </button>
          </div>
          <div
            data-test="category-content"
            style={{
              width: '1192px',
              height: '460px',
              display: 'flex',
              flexDirection: 'column',
              gap: '32px'
            }}
          >
            <div
              data-test="category-content-row1"
              style={{ width: '1192px', height: '214px', display: 'flex', gap: '32px' }}
            >
              {JOB_CATEGORIES.slice(0, 4).map(category => (
                <CategoryCard key={category.dataTest} category={category} />
              ))}
            </div>
            <div
              data-test="category-content-row2"
              style={{ width: '1192px', height: '214px', display: 'flex', gap: '32px' }}
            >
              {JOB_CATEGORIES.slice(4).map(category => (
                <CategoryCard key={category.dataTest} category={category} />
              ))}
            </div>
          </div>
        </section>

        <section
          data-test="featured-jobs-desktop"
          style={{
            width: '1440px',
            height: '779px',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '48px',
            padding: '0 124px 72px 124px',
            boxSizing: 'border-box'
          }}
        >
          <div
            data-test="featured-jobs-desktop-title"
            style={{
              width: '1192px',
              height: '53px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '10px'
            }}
          >
            <h2 style={{ fontSize: '48px', fontWeight: 600, lineHeight: '1.1' }}>Featured jobs</h2>
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: 600,
                color: '#4640DE',
                background: 'none',
                border: 'none'
              }}
            >
              Show all jobs
              <ArrowIcon />
            </button>
          </div>
          <div
            data-test="featured-jobs-desktop-list"
            style={{
              width: '1192px',
              height: '606px',
              display: 'flex',
              flexDirection: 'column',
              gap: '32px'
            }}
          >
            <div
              data-test="featured-jobs-desktop-list-row1"
              style={{ width: '1192px', height: '283px', display: 'flex', gap: '32px' }}
            >
              {FEATURED_JOBS.slice(0, 4).map(job => (
                <FeaturedJobCard key={job.dataTest} job={job} />
              ))}
            </div>
            <div
              data-test="featured-jobs-desktop-list-row2"
              style={{ width: '1192px', height: '291px', display: 'flex', gap: '32px' }}
            >
              {FEATURED_JOBS.slice(4).map(job => (
                <FeaturedJobCard key={job.dataTest} job={job} />
              ))}
            </div>
          </div>
        </section>

        <footer
          data-test="footer"
          style={{
            width: '1440px',
            height: '497px',
            backgroundColor: '#202430',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#FFFFFF',
            padding: '72px 124px',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              width: '1192px',
              display: 'flex',
              gap: '64px',
              alignItems: 'flex-start'
            }}
          >
            <div
              data-test="footer-left"
              style={{
                width: '376px',
                height: '146px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: 600 }}>
                <span
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    fontSize: '18px',
                    fontWeight: 600
                  }}
                >
                  JH
                </span>
                JobHuntly
              </div>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: '26px' }}>
                Great platform for the job seeker that passionate about startups. Find your dream job easier.
              </p>
            </div>
            <div
              data-test="footer-menu"
              style={{
                width: '295px',
                height: '241px',
                display: 'flex',
                gap: '48px'
              }}
            >
              <div
                data-test="footer-menu-first-column"
                style={{
                  width: '105px',
                  height: '241px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: 600 }}>About</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '16px' }}>
                  {FOOTER_LINKS.about.map(link => (
                    <a key={link} href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                      {link}
                    </a>
                  ))}
                </div>
              </div>
              <div
                data-test="footer-menu-second-column"
                style={{
                  width: '97px',
                  height: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: 600 }}>Resources</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '16px' }}>
                  {FOOTER_LINKS.resources.map(link => (
                    <a key={link} href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div
              data-test="footer-right"
              style={{
                width: '362px',
                height: '189px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                borderRadius: '0px',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '24px',
                boxSizing: 'border-box',
                backgroundColor: 'transparent'
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>Get job notifications</span>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: '26px' }}>
                The latest job news, articles, sent to your inbox weekly.
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div
                  style={{
                    flex: 1,
                    height: '45px',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '16px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'rgba(255,255,255,0.6)'
                  }}
                >
                  Email Address
                </div>
                <button
                  type="button"
                  style={{
                    height: '45px',
                    padding: '0 24px',
                    backgroundColor: '#4640DE',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div
            data-test="footer-divider"
            style={{
              width: '1192px',
              height: '0px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              marginTop: '48px',
              marginBottom: '32px'
            }}
          />
          <div
            style={{
              width: '1192px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div
              data-test="footer-social-icons"
              style={{
                width: '256px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              {SOCIALS.map(network => (
                <a
                  key={network}
                  href="#"
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    fontSize: '12px'
                  }}
                >
                  {network[0]}
                </a>
              ))}
            </div>
            <div
              data-test="footer-copyright"
              style={{
                width: '295px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.6)'
              }}
            >
              2021 @ JobHuntly. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
