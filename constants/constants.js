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
    src:'/self.jpg',
    srcAlt:'portfolio',
    techStacks:[
      'nextjs','expressjs','nodejs','groq'
    ]
    ,
    descriptions:[
      'AI Chatbot using groq with Llama model'
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

        'I was the lead developer and lead backend developer',
        'We were a group of 5',
        'Integrated email sending for newsletter using nodemailer',
        'Added admin controls for employee management',
        'Used Supabase Auth for authentication',
        'Integrated printing of reports and import/export of excel files',
        'Utilized Tanstack React Query for efficient pagination of over 40,000 subscribers',
        'Implemented limiter for requests',
        'Used typescript for more readable code and proper data typing',
        'Deployed via vercel'

      ]
    },
    {
      name: "Ypiresia Jireh",
      src: "/yj.png",
      desc: "",
      srcAlt: "yj logo",
      techStacks: ["nextjs", "mongodb", "reactjs", "tailwindcss"],
      descriptions:[
        'Implemented RESTful API using Express.js',
        'Rolled JWT-based auth for secure access',
        'Utilized Redux for efficient state management across components',
        'Used typescript for more readable code and proper data typing'
      ]
    },
    {
      name: "The Sideshop",
      src: "/sideshop.png",
      desc: "",
      srcAlt: "sideshop logo",
      techStacks: ["nextjs", "mysql", "reactjs"],
      descriptions:["Used Laravel's MVC pattern for scalability",
        'Implemented RESTful API using Laravel',
        'Responsive designs for pages',
        'Created tables for users, carts, and products using MySQL'
      ]
    },
    {
      name: "Bloo's Tales",
      src: "/bloo.png",
      desc: "",
      srcAlt: "bloo",
      techStacks: ["csharp"],
      descriptions:[
        'Lead backend developer',
        'We were a group of 8',
        'Created classes for characters, skills, status effects',
        'Applied OOP Concepts for reusability and clean code',
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
        'Business Assistant Website for MSMEs using groq for prompts and chartjs for creating user-friendly visualization of data',
        'This was made as a project for the BPI Datawave 2024',
        'I was the Lead developer',
        'We were a group of 4'
      ]
    },
    {
      name: "Likagi",
      src: "/likagi.png",
      desc: "",
      srcAlt: "likagi",
      techStacks: ["vue"],
      descriptions:[
        'A Membership website built using vue and firebase',
        'has posts functionality',
        'has live a messaging system',
        'uses firebase auth',
        'has responsive design',
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
      name: "Adamson Computer Science Society 24-25",
      role: "Logistics Director",
      src: "acomss.jpg",
      descriptions:[
        'Created floor plans for events',
        'Communicated with offices regarding equipments and venues',
      ]
    },
    {
      name:'Adamson Computer Science Society 25-26',
      role:'Website Head',
      src:'acomss.jpg',
      descriptions:[
        ''
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
    {name:'Flowerstore.ph',
      role:'Mobile Application Developer Intern',
      src:'',
      descriptions:[
        'Worked on integrating payment functionality such as polling',
        'Integrated ReactNative mapbox',
        'Worked on creating stores for mapbox component use',
        'Created queries for mapbox and payment features',
        
      ]
    }

  ]
