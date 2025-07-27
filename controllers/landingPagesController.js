const { LandingPage } = require('../models');
const { deleteFromCloudinary, extractPublicId, extractSecureUrl } = require('../config/cloudinary');

exports.getAllLandingPages = async (req, res) => {
  try {
    const { featured } = req.query;
    let query = {};
    if (featured === 'true') query.featured = true;
    const landingPages = await LandingPage.find(query).sort({ createdAt: -1 });
    res.json(landingPages);
  } catch (error) {
    console.error('Error fetching landing pages:', error);
    res.status(500).json({ error: 'Failed to fetch landing pages' });
  }
};

exports.getLandingPageById = async (req, res) => {
  try {
    const landingPage = await LandingPage.findById(req.params.id);
    if (!landingPage) {
      return res.status(404).json({ error: 'Landing page not found' });
    }
    res.json(landingPage);
  } catch (error) {
    console.error('Error fetching landing page:', error);
    res.status(500).json({ error: 'Failed to fetch landing page' });
  }
};

exports.createLandingPage = async (req, res) => {
  try {
    const { title, description, liveUrl, codeUrl, tech, color, bgGradient, featured } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    const landingPageData = {
      title,
      description,
      liveUrl,
      codeUrl,
      color,
      bgGradient,
      featured: featured === 'true' || featured === true,
      image: '/api/placeholder/600/400'
    };
    if (tech) {
      landingPageData.tech = typeof tech === 'string' ? JSON.parse(tech) : tech;
    }
    if (req.file) {
      landingPageData.image = extractSecureUrl(req.file);
      landingPageData.cloudinaryUrl = extractSecureUrl(req.file);
      landingPageData.cloudinaryPublicId = extractPublicId(req.file);
    }
    const landingPage = new LandingPage(landingPageData);
    await landingPage.save();
    res.status(201).json(landingPage);
  } catch (error) {
    console.error('Error creating landing page:', error);
    res.status(500).json({ error: 'Failed to create landing page' });
  }
};

exports.updateLandingPage = async (req, res) => {
  try {
    const landingPage = await LandingPage.findById(req.params.id);
    if (!landingPage) {
      return res.status(404).json({ error: 'Landing page not found' });
    }
    const { title, description, liveUrl, codeUrl, tech, color, bgGradient, featured } = req.body;
    if (title !== undefined) landingPage.title = title;
    if (description !== undefined) landingPage.description = description;
    if (liveUrl !== undefined) landingPage.liveUrl = liveUrl;
    if (codeUrl !== undefined) landingPage.codeUrl = codeUrl;
    if (color !== undefined) landingPage.color = color;
    if (bgGradient !== undefined) landingPage.bgGradient = bgGradient;
    if (featured !== undefined) landingPage.featured = featured === 'true' || featured === true;
    if (tech !== undefined) {
      landingPage.tech = typeof tech === 'string' ? JSON.parse(tech) : tech;
    }
    if (req.file) {
      if (landingPage.cloudinaryPublicId) {
        try {
          await deleteFromCloudinary(landingPage.cloudinaryPublicId);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      landingPage.image = extractSecureUrl(req.file);
      landingPage.cloudinaryUrl = extractSecureUrl(req.file);
      landingPage.cloudinaryPublicId = extractPublicId(req.file);
    }
    await landingPage.save();
    res.json(landingPage);
  } catch (error) {
    console.error('Error updating landing page:', error);
    res.status(500).json({ error: 'Failed to update landing page' });
  }
};

exports.deleteLandingPage = async (req, res) => {
  try {
    const landingPage = await LandingPage.findById(req.params.id);
    if (!landingPage) {
      return res.status(404).json({ error: 'Landing page not found' });
    }
    if (landingPage.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(landingPage.cloudinaryPublicId);
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
      }
    }
    await LandingPage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Landing page deleted successfully' });
  } catch (error) {
    console.error('Error deleting landing page:', error);
    res.status(500).json({ error: 'Failed to delete landing page' });
  }
};

exports.toggleFeaturedLandingPage = async (req, res) => {
  try {
    const landingPage = await LandingPage.findById(req.params.id);
    if (!landingPage) {
      return res.status(404).json({ error: 'Landing page not found' });
    }
    landingPage.featured = !landingPage.featured;
    await landingPage.save();
    res.json(landingPage);
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({ error: 'Failed to toggle featured status' });
  }
};