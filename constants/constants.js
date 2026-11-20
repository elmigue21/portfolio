export const techStacks = [
  {
    stack: "nextjs",
    extension: "png",
    tooltip: "Next.js",
    alt: "Next.js logo",
  },
  {
    stack: "nodejs",
    extension: "png",
    tooltip: "Node.js",
    alt: "Node.js logo",
  },
  { stack: "reactjs", extension: "png", tooltip: "React", alt: "React logo" },
  {
    stack: "expressjs",
    extension: "png",
    tooltip: "Express.js",
    alt: "Express.js logo",
  },
  { stack: "github", extension: "jpg", tooltip: "GitHub", alt: "GitHub logo" },
  { stack: "git", extension: "png", tooltip: "Git", alt: "Git logo" },
  {
    stack: "typescript",
    extension: "jpg",
    tooltip: "TypeScript",
    alt: "TypeScript logo",
  },
  {
    stack: "tailwind",
    extension: "jpg",
    tooltip: "Tailwind CSS",
    alt: "Tailwind CSS logo",
  },
  {
    stack: "supabase",
    extension: "jpg",
    tooltip: "Supabase",
    alt: "Supabase logo",
  },
  {
    stack: "firebase",
    extension: "png",
    tooltip: "Firebase",
    alt: "Firebase logo",
  },
  {
    stack: "mongodb",
    extension: "png",
    tooltip: "MongoDB",
    alt: "MongoDB logo",
  },
  { stack: "mysql", extension: "png", tooltip: "MySQL", alt: "MySQL logo" },
  { stack: "csharp", extension: "png", tooltip: "C#", alt: "C# logo" },
  { stack: "vue", extension: "jpg", tooltip: "Vue", alt: "Vue logo" },
  {
    stack: "javascript",
    extension: "jpg",
    tooltip: "Javascript",
    alt: "JS logo",
  },
];

 export const projects = [
  {
    name:'Portfolio',
    src:'/portfolio.svg',
    srcAlt:'portfolio',
    techStacks:[
      'nextjs','expressjs','nodejs','groq'
    ]
    ,
    descriptions:[
      'Interactive portfolio with scroll-driven 3D, physics and a light/dark theme',
      'Built Migu, an AI agent that answers questions and navigates the page, with Groq and Gemini as fallbacks'
    ]
  },
    {
      name: "Dempa",
      src: "/dempa.png",
      desc: "",
      srcAlt: "dempa logo",
      techStacks: [
        "nextjs",
        "supabase",
        "reactjs",
        "expressjs",
        "nodejs",
        "git",
        "github",
        "tailwindcss",
      ],
      descriptions:[

        'Lead developer and lead backend developer on a team of 5',
        'Built newsletter email sending with Nodemailer',
        'Added admin controls for employee management',
        'Set up authentication with Supabase Auth',
        'Added report printing and Excel import/export',
        'Paginated 40,000+ subscribers efficiently with TanStack Query',
        'Added request rate limiting',
        'Wrote it in TypeScript for safer, more readable code',
        'Deployed on Vercel'

      ]
    },
    {
      name: "Ypiresia Jireh",
      src: "/yj.png",
      desc: "",
      srcAlt: "yj logo",
      techStacks: ["nextjs", "mongodb", "reactjs", "tailwindcss"],
      descriptions:[
        'Built a RESTful API with Express.js',
        'Implemented JWT-based authentication',
        'Managed app-wide state with Redux',
        'Wrote it in TypeScript for safer, more readable code'
      ]
    },
    {
      name: "The Sideshop",
      src: "/sideshop.png",
      desc: "",
      srcAlt: "sideshop logo",
      techStacks: ["laravel", "mysql", "reactjs"],
      descriptions:["Structured the app with Laravel's MVC pattern for scalability",
        'Built a RESTful API in Laravel',
        'Designed responsive pages',
        'Modeled users, carts and products in MySQL'
      ]
    },
    {
      name: "Bloo's Tales",
      src: "/bloo.png",
      desc: "",
      srcAlt: "bloo",
      techStacks: ["csharp"],
      descriptions:[
        'Lead backend developer on a team of 8',
        'Created classes for characters, skills and status effects',
        'Applied OOP principles for reusable, clean code',
        ''
      ]
    },
    {
      name: "Stratify",
      src: "/bpi.png",
      desc: "",
      srcAlt: "stratify",
      techStacks: ["nextjs", "mongodb", "reactjs"],
      descriptions:[
        'Business assistant website for MSMEs, using Groq for AI prompts and Chart.js for clear data visualizations',
        'Built for BPI DataWave 2024',
        'Lead developer on a team of 4',
      ]
    },
    {
      name: "Likagi",
      src: "/likagi.png",
      desc: "",
      srcAlt: "likagi",
      techStacks: ["vue"],
      descriptions:[
        'Membership website built with Vue and Firebase',
        'Posts and a live messaging system',
        'Firebase Authentication',
        'Responsive design',
      ],
    },
    {
      name: "Kaboom",
      src: "/kaboom.png",
      desc: "",
      srcAlt: "kaboom",
      techStacks: ["javascript"],
    },
  ];

 export const orgs = [
    {
      name: "Startup QC — Verdalyx Technologies",
      role: "Team Member · Silver Awardee",
      src: "startupqc.jpg",
      descriptions:[
        'Startup QC Student Competition, Squad 3 (Sep 2026), by the Quezon City Government',
        'One of 11 Silver Awardees, among 47 winning teams from 153 applicants nationwide',
        'Pitched Verdalyx Technologies with a five-person team from Adamson University\'s Computer Science Department',
      ]
    },
    {
      name: "Adamson Computer Science Society 24-25",
      role: "Logistics Director",
      src: "acomss.jpg",
      descriptions:[
        'Created floor plans for events',
        'Coordinated with university offices on equipment and venues',
      ]
    },
    // {
    //   name: "Amazon Web Services Cloud Club Philippines",
    //   role: "Technology Department Frontend Developer",
    //   src: "awscc.jpg",
    //   descriptions:[
    //     ''
    //   ]
    // },
  ];

  export const jobs = [
    {name:'Hirolabz',
      role:'Junior Developer',
      src:'',
      start:'2026-06',
      descriptions:[]
    },
    {name:'Flowerstore.ph',
      role:'Mobile Application Developer Intern',
      src:'',
      end:'2026-01',
      descriptions:[
        'Integrated payment features, including payment status polling',
        'Integrated Mapbox maps in React Native',
        'Built state stores for the Mapbox components',
        'Wrote queries for the map and payment features',

      ]
    }

  ]

  // Tech Stack section groups (keys match components/TechIcon.tsx).
  export const stackCategories = {
    frontend: ["nextjs", "reactjs", "typescript", "javascript", "tailwind", "vue"],
    backend: ["nodejs", "expressjs", "supabase", "firebase", "mongodb", "mysql", "laravel", "csharp"],
    tools: ["git", "github"],
  }

  // Kept from the old Links & Contacts section for when it is rebuilt.
  export const contacts = [
    {
      name: "GitHub",
      link: "https://github.com/elmigue21",
      text: "https://github.com/elmigue21",
    },
    {
      name: "LinkedIn",
      link: "https://www.linkedin.com/in/mj-caacbay/",
      text: "https://www.linkedin.com/in/mj-caacbay/",
    },
  ]

  // Floating code fragments for the 3D projects background.
  export const aboutSnippets = [
    'const hardworking = true;',
    'function work() {\n  return "Junior Developer";\n}',
    'const company = "Hirolabz"; // since June 2026',
    'const school = "Adamson University";',
    'const course = "BS Computer Science";',
    'const focus = "Data Science";',
    'const stack = ["Next.js", "React", "Node.js", "TypeScript"];',
    'experience.push("FlowerStore.ph — Mobile Dev Intern"); // until Jan 2026',
    'orgs.push("ACOMSS — Logistics Director");',
    'awards.push("Startup QC — Silver Awardee");',
    'const location = "Philippines";',
    'while (learning) { build(); }',
    'if (bug) fix(bug);',
    'const mobile = "React Native";',
    'console.log("Hello, world!");',
    'git commit -m "ship it"',
    'npm run build',
    'export default Miguel;',
    'const coffee = Infinity;',
  ]
