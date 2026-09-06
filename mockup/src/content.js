export const site = {
  brand: 'TarsOnlineCafe',
  founder: 'Joshua Coetzer',
  location: 'Johannesburg',
  tagline: 'Automation & integration',
  est: 'EST 2020',
  logo: `${import.meta.env.BASE_URL}logo.png`,
  social: {
    github: 'https://github.com/nottherealtar',
    linkedin: 'https://www.linkedin.com/in/josh-coetzer-31a874239/',
    blog: '/blog/blog.html',
    coffee: 'https://buymeacoffee.com/nottherealtar',
  },
}

export const hero = {
  headline: 'I automate what slows your business down.',
  body: 'Bespoke automation and integration solutions for businesses ready to stop doing things manually.',
  primaryCta: { label: 'See featured work', href: '#work' },
  secondaryCta: { label: 'Start a Project', href: '#contact' },
}

export const nav = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#work' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
]

export const marquee = [
  'Azure Logic Apps',
  'Freshworks',
  'Python',
  'API Integration',
  'Next.js',
  'Google Cloud',
  'Process Automation',
  'CRM / FSM',
  'Web Platforms',
]

export const proof = {
  eyebrow: 'Working together',
  title: 'What you can count on',
  lead: 'I ship integrations and automation the same way I\'d run them in production: clear ownership, observable behavior, and room to evolve when your process changes.',
  items: [
    {
      title: 'End-to-end ownership',
      desc: 'From discovery to handover — design, build, document, and walk your team through it.',
      icon: 'route',
    },
    {
      title: 'Production-minded',
      desc: 'Error paths, retries, and alerts so failures surface instead of silently piling up.',
      icon: 'shield',
    },
    {
      title: 'Plain-language clarity',
      desc: 'Technical depth when you need it, without losing the business thread.',
      icon: 'chat',
    },
    {
      title: 'Systems that compound',
      desc: 'Work designed to connect: APIs, workflows, and data that stay maintainable.',
      icon: 'layers',
    },
  ],
}

export const about = {
  eyebrow: 'About',
  title: 'The person behind the integrations',
  lead: 'I\'m Joshua. I build the glue between your CRM, service desk, operations tools, and cloud so your team spends time on decisions, not copy-paste.',
  terminal: [
    'Name: Joshua Coetzer',
    'Location: Johannesburg, South Africa',
    'Experience: 5+ years',
    'Focus:',
    '- Process & Workflow Automation',
    '- Azure Logic Apps',
    '- Freshworks Integrations',
    '- API Integration',
    'Currently: Working at Wetility, building and improving business process and solutions.',
  ],
  storyTitle: 'How I work with teams',
  story: [
    'I\'ve spent years building systems businesses didn\'t know they needed, and couldn\'t operate without once they had them. From replacing Excel-and-email workflows with real infrastructure to designing commercial ecosystems on Azure from scratch, the through-line is always the same: fewer manual handoffs, clearer data, and workflows your ops team can trust.',
    'Away from the keyboard: time with my wife, the garden, and keeping up with where automation and AI are headed, so recommendations stay grounded in what\'s actually shippable.',
  ],
  pills: ['Documented handovers', 'Measurable outcomes', 'Honest scoping'],
  stack: ['Next.js', 'Python', 'Azure', 'Google Cloud', 'API'],
  recruiter: {
    title: 'For recruiters',
    hint: 'Integrations, APIs, Azure & Python, shipped with a production-first mindset.',
  },
}

export const services = {
  eyebrow: 'Capabilities',
  title: 'What I deliver',
  subtitle:
    'I take ownership from the first conversation through to something your team can run in production — integrations, automation, and web systems built around how you actually work.',
  intro:
    'Most of my work sits where business process meets software: connecting CRMs and service desks, replacing manual syncs with reliable workflows, and shipping client-facing platforms that hold up under real use.',
  items: [
    {
      num: '01',
      title: 'Integrations & workflow automation',
      desc: 'Azure Logic Apps, Freshworks, and custom API pipelines that move data between systems without someone babysitting spreadsheets.',
    },
    {
      num: '02',
      title: 'Internal tools & process automation',
      desc: 'Python services, scheduled jobs, and bespoke tooling that eliminate repetitive work and give ops teams something they can trust.',
    },
    {
      num: '03',
      title: 'Web platforms & client-facing systems',
      desc: 'Production websites and lead-capture flows, structured for conversion, compliance, and the integrations that sit behind them.',
    },
  ],
}

export const work = {
  eyebrow: 'Featured delivery',
  title: 'Work in production',
  subtitle:
    'One recent build you can visit right now — a full client platform, live and handling real enquiries.',
  project: {
    badge: 'Live client site',
    meta: 'Cape Town · Digital agency',
    name: 'WeSolveYourProblem',
    url: 'https://solvemyproblem.co.za/',
    urlLabel: 'solvemyproblem.co.za',
    tagline:
      'End-to-end marketing website for a Cape Town agency specialising in email marketing, lead generation, CRM integration, and business automation, built to convert visitors into qualified enquiries.',
    highlights: [
      'Multi-page site with services, process, FAQ, and quote request flows',
      'Lead capture and enquiry paths tuned for a quote-based, POPIA-compliant business',
      'Clear service positioning across email marketing, automation, and CRM integration',
      'Production deployment — not a concept mockup or side project sitting in a repo',
    ],
    hotspots: [
      { label: 'Lead capture', detail: 'Quote flows tuned for conversion' },
      { label: 'Service map', detail: 'Clear positioning across offers' },
      { label: 'POPIA paths', detail: 'Compliant enquiry handling' },
    ],
    metrics: [
      { value: 'Live', label: 'In production' },
      { value: '24hr', label: 'Response promise' },
      { value: 'POPIA', label: 'Compliant flows' },
    ],
    stack: [
      'Web platform',
      'Lead generation',
      'Email marketing',
      'CRM integration',
      'Business automation',
    ],
    aside:
      'This is the kind of work I want more of: a real business with real customers, a site that has to earn trust on first visit, and delivery that goes from brief to something live on the internet.',
  },
}

export const process = {
  title: 'How it works',
  subtitle: 'A simple, transparent process — from first conversation to delivered solution.',
  steps: [
    {
      title: 'Discovery',
      desc: 'We have a conversation about your problem — what it costs you today, what the ideal state looks like, and whether I\'m the right fit. No commitment required.',
    },
    {
      title: 'Build',
      desc: 'I design, build, and test the solution with your input at each stage. Clean code, documented, and built to last beyond day one.',
    },
    {
      title: 'Deliver',
      desc: 'Handed over with full documentation and a walkthrough session. Ongoing support and iterations available as your needs evolve.',
    },
  ],
}

export const testimonials = {
  title: 'What people say',
  items: [
    {
      quote: 'I love the site. It\'s exactly what I want.',
      name: 'Jacques Trevor Brown',
      role: 'Company Owner · Solve My Problem',
      initials: 'JT',
      linkedin: 'https://www.linkedin.com/in/jacques-trevor-brown/',
      verified: 'Client · solvemyproblem.co.za',
    },
    {
      quote:
        'Josh\'s contributions to CRM configuration, deployments, and internal support have made a noticeable impact. He\'s proactive, works well across teams, and brings composure to challenging work.',
      name: 'Beryl Govender',
      role: 'Head of Customer Experience & Product · Wetility',
      initials: 'BG',
      linkedin: 'https://www.linkedin.com/in/beryl-govender-470450b7/',
      verified: 'Workplace feedback',
    },
    {
      quote:
        'Josh was a great asset to the team, knowledgeable and hardworking, always eager to assist teammates and customers with a smile. Great to have been able to work with you.',
      name: 'Jason Simonis',
      role: 'Strategic Solutions Specialist · GoCanvas',
      initials: 'JS',
      linkedin: 'https://linkedin.com/in/jason-simonis',
      verified: 'Verified LinkedIn Recommendation',
    },
  ],
}

export const contact = {
  title: 'Let\'s work together',
  subtitle: 'Tell me what you\'re trying to solve. I\'ll come back to you within 24 hours.',
  types: [
    'Process Automation',
    'Azure Logic Apps',
    'Freshworks Integration',
    'API / Systems Integration',
    'Other',
  ],
  coffeeText: 'Enjoyed my work? Support me with a coffee!',
}
