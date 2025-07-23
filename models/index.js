const mongoose = require('mongoose');

// Certificate Schema
const certificateSchema = new mongoose.Schema({
  label: { type: String, required: true },
  file: { type: String, required: true },
  type: { type: String, required: true },
  base: { type: String, required: true },
  cloudinaryUrl: String,
  cloudinaryPublicId: String
}, { timestamps: true });

// Image Schema (for stations/gallery)
const imageSchema = new mongoose.Schema({
  src: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  station: { type: String, required: true },
  cloudinaryUrl: String,
  cloudinaryPublicId: String
}, { timestamps: true });

// Journey Steps Schema
const journeyStepSchema = new mongoose.Schema({
  year: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: String,
  icon: { type: String, required: true },
  color: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// Landing Pages Schema
const landingPageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: String,
  liveUrl: String,
  codeUrl: String,
  tech: [String],
  color: String,
  bgGradient: String,
  featured: { type: Boolean, default: false }
}, { timestamps: true });

// LinkedIn Profile Schema
const linkedinProfileSchema = new mongoose.Schema({
  profile: {
    name: String,
    headline: String,
    location: String,
    profileImage: String,
    backgroundImage: String,
    summary: String,
    connectionCount: String,
    profileUrl: String
  },
  experience: [{
    title: String,
    company: String,
    location: String,
    duration: String,
    description: [String],
    skills: [String],
    logo: String
  }],
  education: [{
    degree: String,
    institution: String,
    duration: String,
    description: String,
    gpa: String
  }],
  skills: [{
    name: String,
    endorsements: Number,
    category: String
  }],
  achievements: [String],
  certifications: [{
    name: String,
    issuer: String,
    date: String,
    credentialId: String
  }],
  recommendations: [{
    name: String,
    title: String,
    company: String,
    text: String,
    date: String
  }]
}, { timestamps: true });

// Odoo Module Schema
const odooModuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  version: { type: String, required: true },
  description: { type: String, required: true },
  features: [String],
  technicalSpecs: {
    models: [String],
    views: [String],
    dependencies: [String],
    complexity: String
  },
  screenshots: [String],
  demoUrl: String,
  codeUrl: String,
  status: { type: String, required: true },
  clientsUsing: { type: Number, default: 0 },
  color: String,
  icon: String,
  tags: [String]
}, { timestamps: true });

// Personal Project Schema
const personalProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tech: [String],
  status: { type: String, required: true },
  link: String,
  featured: { type: Boolean, default: false },
  images: [String]
}, { timestamps: true });

// Create models
const Certificate = mongoose.model('Certificate', certificateSchema);
const Image = mongoose.model('Image', imageSchema);
const JourneyStep = mongoose.model('JourneyStep', journeyStepSchema);
const LandingPage = mongoose.model('LandingPage', landingPageSchema);
const LinkedinProfile = mongoose.model('LinkedinProfile', linkedinProfileSchema);
const OdooModule = mongoose.model('OdooModule', odooModuleSchema);
const PersonalProject = mongoose.model('PersonalProject', personalProjectSchema);

module.exports = {
  Certificate,
  Image,
  JourneyStep,
  LandingPage,
  LinkedinProfile,
  OdooModule,
  PersonalProject
};