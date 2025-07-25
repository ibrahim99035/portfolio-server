const express = require('express');
const { LandingPage } = require('../models');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { cache } = require('../config/redis');
const { upload, deleteFromCloudinary, extractPublicId, extractSecureUrl } = require('../config/cloudinary');

const router = express.Router();

// GET /api/landing-pages - Get all landing pages (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { featured } = req.query;
    const cacheKey = featured ? 'landing-pages:featured' : 'landing-pages:all';
    
    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    let query = {};
    if (featured === 'true') {
      query.featured = true;
    }

    const landingPages = await LandingPage.find(query).sort({ createdAt: -1 });
    
    // Cache the result
    await cache.set(cacheKey, landingPages);
    
    res.json(landingPages);
  } catch (error) {
    console.error('Error fetching landing pages:', error);
    res.status(500).json({ error: 'Failed to fetch landing pages' });
  }
});

// GET /api/landing-pages/:id - Get specific landing page
router.get('/:id', async (req, res) => {
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
});

// POST /api/landing-pages - Create new landing page (protected)
router.post('/', authenticate, upload.single('image'), async (req, res) => {
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
      image: '/api/placeholder/600/400' // Default placeholder
    };

    // Parse tech array if it's a string
    if (tech) {
      landingPageData.tech = typeof tech === 'string' ? JSON.parse(tech) : tech;
    }

    // If image was uploaded to Cloudinary
    if (req.file) {
      landingPageData.image = extractSecureUrl(req.file);
      landingPageData.cloudinaryUrl = extractSecureUrl(req.file);
      landingPageData.cloudinaryPublicId = extractPublicId(req.file);
    }

    const landingPage = new LandingPage(landingPageData);
    await landingPage.save();

    // Clear cache
    await cache.del('landing-pages:all');
    await cache.del('landing-pages:featured');

    res.status(201).json(landingPage);
  } catch (error) {
    console.error('Error creating landing page:', error);
    res.status(500).json({ error: 'Failed to create landing page' });
  }
});

// PUT /api/landing-pages/:id - Update landing page (protected)
router.put('/:id', authenticate, upload.single('image'), async (req, res) => {
  try {
    const landingPage = await LandingPage.findById(req.params.id);

    if (!landingPage) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    const { title, description, liveUrl, codeUrl, tech, color, bgGradient, featured } = req.body;

    // Update fields
    if (title !== undefined) landingPage.title = title;
    if (description !== undefined) landingPage.description = description;
    if (liveUrl !== undefined) landingPage.liveUrl = liveUrl;
    if (codeUrl !== undefined) landingPage.codeUrl = codeUrl;
    if (color !== undefined) landingPage.color = color;
    if (bgGradient !== undefined) landingPage.bgGradient = bgGradient;
    if (featured !== undefined) landingPage.featured = featured === 'true' || featured === true;

    // Parse tech array if it's a string
    if (tech !== undefined) {
      landingPage.tech = typeof tech === 'string' ? JSON.parse(tech) : tech;
    }

    // If new image uploaded
    if (req.file) {
      // Delete old image from Cloudinary if exists
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

    // Clear cache
    await cache.del('landing-pages:all');
    await cache.del('landing-pages:featured');

    res.json(landingPage);
  } catch (error) {
    console.error('Error updating landing page:', error);
    res.status(500).json({ error: 'Failed to update landing page' });
  }
});

// DELETE /api/landing-pages/:id - Delete landing page (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const landingPage = await LandingPage.findById(req.params.id);

    if (!landingPage) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    // Delete from Cloudinary if exists
    if (landingPage.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(landingPage.cloudinaryPublicId);
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
      }
    }

    await LandingPage.findByIdAndDelete(req.params.id);

    // Clear cache
    await cache.del('landing-pages:all');
    await cache.del('landing-pages:featured');

    res.json({ message: 'Landing page deleted successfully' });
  } catch (error) {
    console.error('Error deleting landing page:', error);
    res.status(500).json({ error: 'Failed to delete landing page' });
  }
});

// PUT /api/landing-pages/:id/toggle-featured - Toggle featured status (protected)
router.put('/:id/toggle-featured', authenticate, async (req, res) => {
  try {
    const landingPage = await LandingPage.findById(req.params.id);

    if (!landingPage) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    landingPage.featured = !landingPage.featured;
    await landingPage.save();

    // Clear cache
    await cache.del('landing-pages:all');
    await cache.del('landing-pages:featured');// routes/landingPage.js
const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  getAllLandingPages,
  getLandingPageById,
  createLandingPage,
  updateLandingPage,
  deleteLandingPage,
  toggleLandingPageFeatured
} = require('../controllers/landingPageController');

const router = express.Router();

router.get('/', optionalAuth, getAllLandingPages);
router.get('/:id', getLandingPageById);
router.post('/', authenticate, upload.single('image'), createLandingPage);
router.put('/:id', authenticate, upload.single('image'), updateLandingPage);
router.delete('/:id', authenticate, deleteLandingPage);
router.put('/:id/toggle-featured', authenticate, toggleLandingPageFeatured);

module.exports = router;


    res.json(landingPage);
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({ error: 'Failed to toggle featured status' });
  }
});

module.exports = router;