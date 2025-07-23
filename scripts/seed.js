const mongoose = require('mongoose');
const dotenv = require('dotenv');
const {
  Certificate,
  Image,
  JourneyStep,
  LandingPage,
  LinkedinProfile,
  OdooModule,
  PersonalProject
} = require('../models');

// Load environment variables
dotenv.config();

// Sample data from your portfolio
const sampleData = {
  certificates: [
    {
      label: "Graduation Certificate",
      file: "graduation-certificate.pdf",
      type: "pdf",
      base: "graduation-certificate"
    },
    {
      label: "GDSC Certification",
      file: "1663759892949.pdf",
      type: "pdf",
      base: "1663759892949"
    }
  ],

  images: [
    {
      src: "/stations/git-course-announcement.jpg",
      title: "Git Crash Course Announcement",
      description: "The Daywe announced the Git Crash Course on Google Developer Student Club Tanta University Facebook page",
      station: "Version Control Unlocked"
    },
    {
      src: "/stations/ai-olympics.jpg",
      title: "AI Olympics Competition",
      description: "Presenting medical diagnosis web app at Helwan University",
      station: "Innovation Station"
    }
  ],

  journeySteps: [
    {
      year: "2nd Year",
      title: "Git & GitHub Crash Course",
      description: "Developed a comprehensive crash course for Git and GitHub as part of Google Developer Student Club",
      link: "https://www.youtube.com/playlist?list=PLB2NCgis8gFcU83UeCWGK7h3doVPZ1zsR",
      icon: "Code",
      color: "from-blue-500 to-cyan-500",
      order: 1
    },
    {
      year: "3rd Year",
      title: "AI Olympics & ICPC Qualifications",
      description: "Participated in AI Olympics at Helwan University with a medical diagnosing web app (Flask + SQLite) and competed in ECPS twice",
      icon: "Trophy",
      color: "from-purple-500 to-pink-500",
      order: 2
    }
  ],

  landingPages: [
    {
      title: "TechFlow SaaS",
      description: "Modern SaaS landing page with glassmorphism design and smooth animations",
      image: "/api/placeholder/600/400",
      liveUrl: "https://techflow-demo.com",
      codeUrl: "https://github.com/ibrahim99035/techflow",
      tech: ["React", "Tailwind CSS", "Framer Motion"],
      color: "from-blue-500 via-purple-500 to-pink-500",
      bgGradient: "from-blue-900/20 to-purple-900/20",
      featured: true
    },
    {
      title: "CryptoVault",
      description: "Cryptocurrency platform with dark theme and neon accents",
      image: "/api/placeholder/600/400",
      liveUrl: "https://cryptovault-demo.com",
      codeUrl: "https://github.com/ibrahim99035/cryptovault",
      tech: ["Next.js", "TypeScript", "Three.js"],
      color: "from-green-400 via-cyan-400 to-blue-500",
      bgGradient: "from-green-900/20 to-cyan-900/20",
      featured: false
    }
  ],

  odooModules: [
    {
      name: "Advanced Inventory Management",
      category: "Inventory",
      version: "16.0.1.0.0",
      description: "Enhanced inventory management with real-time tracking, advanced analytics, and automated reordering systems",
      features: [
        "Real-time stock tracking",
        "Automated reorder points",
        "Advanced reporting dashboard",
        "Multi-warehouse support",
        "Barcode integration"
      ],
      technicalSpecs: {
        models: ["stock.picking", "stock.move", "stock.quant"],
        views: ["kanban", "form", "tree", "pivot", "graph"],
        dependencies: ["stock", "purchase", "sale"],
        complexity: "Advanced"
      },
      screenshots: ["/api/placeholder/800/500"],
      demoUrl: "https://demo.odoo.com/inventory-advanced",
      codeUrl: "https://github.com/ibrahim99035/odoo-inventory-advanced",
      status: "Production Ready",
      clientsUsing: 15,
      color: "from-blue-600 via-cyan-500 to-teal-400",
      icon: "📦",
      tags: ["Inventory", "Analytics", "Automation"]
    },
    {
      name: "Smart CRM Pipeline",
      category: "CRM",
      version: "16.0.2.1.0",
      description: "AI-powered CRM with predictive analytics, automated lead scoring, and intelligent pipeline management",
      features: [
        "AI lead scoring",
        "Predictive analytics",
        "Automated follow-ups",
        "Social media integration",
        "Custom reporting"
      ],
      technicalSpecs: {
        models: ["crm.lead", "crm.stage", "crm.team"],
        views: ["kanban", "form", "tree", "calendar", "pivot"],
        dependencies: ["crm", "mail", "calendar"],
        complexity: "Expert"
      },
      screenshots: ["/api/placeholder/800/500"],
      demoUrl: "https://demo.odoo.com/crm-smart",
      codeUrl: "https://github.com/ibrahim99035/odoo-smart-crm",
      status: "Production Ready",
      clientsUsing: 23,
      color: "from-purple-600 via-pink-500 to-red-400",
      icon: "🎯",
      tags: ["CRM", "AI", "Analytics"]
    }
  ],

  personalProjects: [
    {
      title: "Medical Diagnosis Web App",
      description: "AI-powered medical diagnosis application built with Flask and SQLite for AI Olympics",
      tech: ["Flask", "SQLite", "Python", "AI/ML"],
      status: "Competition Project",
      featured: true
    },
    {
      title: "Smart City Prototype",
      description: "Home automation server as part of comprehensive smart city graduation project",
      tech: ["IoT", "Server Development", "Automation"],
      status: "Graduation Project",
      featured: false
    },
    {
      title: "Git & GitHub Course",
      description: "Comprehensive crash course series for Google Developer Student Club",
      tech: ["Git", "GitHub", "Education"],
      status: "Educational Content",
      link: "https://www.youtube.com/playlist?list=PLB2NCgis8gFcU83UeCWGK7h3doVPZ1zsR",
      featured: true
    }
  ],

  linkedinProfile: {
    profile: {
      name: "Ibrahim Abu Eita",
      headline: "Full Stack Developer | Python & Django Expert | Web Development Specialist",
      location: "Al Maḩallah al Kubrá, Gharbia, Egypt",
      profileImage: "/api/placeholder/150/150",
      backgroundImage: "/api/placeholder/800/300",
      summary: "Passionate Full Stack Developer with expertise in Python, Django, and modern web technologies. Experienced in building scalable web applications, API development, and database design. Strong problem-solving skills and commitment to delivering high-quality software solutions.",
      connectionCount: "500+",
      profileUrl: "https://www.linkedin.com/in/ibrahim-abu-eita-0b2490206/"
    },
    experience: [
      {
        title: "Full Stack Developer",
        company: "Freelance",
        location: "Remote",
        duration: "2022 - Present",
        description: [
          "Developed and maintained multiple web applications using Django and React",
          "Implemented RESTful APIs and integrated third-party services",
          "Optimized database queries and improved application performance by 40%",
          "Collaborated with clients to deliver custom solutions meeting business requirements"
        ],
        skills: ["Python", "Django", "React", "PostgreSQL", "REST APIs"],
        logo: "/api/placeholder/60/60"
      }
    ],
    education: [
      {
        degree: "Bachelor's Degree in Computer Science",
        institution: "Tanta University",
        duration: "2018 - 2022",
        description: "Focused on software engineering, algorithms, database systems, and web development.",
        gpa: "3.8/4.0"
      }
    ],
    skills: [
      { name: "Python", endorsements: 45, category: "Programming" },
      { name: "Django", endorsements: 38, category: "Framework" },
      { name: "React", endorsements: 32, category: "Frontend" }
    ],
    achievements: [
      "Successfully delivered 50+ web development projects",
      "Maintained 99% client satisfaction rate across all projects"
    ],
    certifications: [
      {
        name: "Django Advanced Certification",
        issuer: "Django Software Foundation",
        date: "2023",
        credentialId: "DJ-2023-001"
      }
    ],
    recommendations: []
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Certificate.deleteMany({});
    await Image.deleteMany({});
    await JourneyStep.deleteMany({});
    await LandingPage.deleteMany({});
    await LinkedinProfile.deleteMany({});
    await OdooModule.deleteMany({});
    await PersonalProject.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Seed data
    await Certificate.insertMany(sampleData.certificates);
    console.log('✅ Seeded certificates');

    await Image.insertMany(sampleData.images);
    console.log('✅ Seeded images');

    await JourneyStep.insertMany(sampleData.journeySteps);
    console.log('✅ Seeded journey steps');

    await LandingPage.insertMany(sampleData.landingPages);
    console.log('✅ Seeded landing pages');

    await OdooModule.insertMany(sampleData.odooModules);
    console.log('✅ Seeded Odoo modules');

    await PersonalProject.insertMany(sampleData.personalProjects);
    console.log('✅ Seeded personal projects');

    const linkedinProfile = new LinkedinProfile(sampleData.linkedinProfile);
    await linkedinProfile.save();
    console.log('✅ Seeded LinkedIn profile');

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

const main = async () => {
  await connectDB();
  await seedDatabase();
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { sampleData, seedDatabase };