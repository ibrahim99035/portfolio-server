const express = require('express');
const { Image } = require('../models');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { cache } = require('../config/redis');
const { upload, deleteFromCloudinary, extractPublicId, extractSecureUrl } = require('../config/cloudinary');

const router = express.Router();

// GET /api/images - Get all images (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { station } = req.query;
    const cacheKey = station ? `images:station:${station}` : 'images:all';
    
    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    let query = {};
    if (station) {
      query.station = station;
    }

    const images = await Image.find(query).sort({ createdAt: -1 });
    
    // Cache the result
    await cache.set(cacheKey, images);
    
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// GET /api/images/stations - Get unique stations
router.get('/stations', async (req, res) => {
  try {
    const cacheKey = 'images:stations';
    
    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const stations = await Image.distinct('station');
    
    // Cache the result
    await cache.set(cacheKey, stations);
    
    res.json(stations);
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
});

// GET /api/images/:id - Get specific image
router.get('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.json(image);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// POST /api/images - Create new image (protected)
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { title, description, station } = req.body;

    if (!title || !description || !station) {
      return res.status(400).json({ error: 'Title, description, and station are required' });
    }

    const imageData = {
      title,
      description,
      station,
      src: req.file ? '' : '/default-image.jpg' // Will be updated with Cloudinary URL
    };

    // If file was uploaded to Cloudinary
    if (req.file) {
      imageData.src = extractSecureUrl(req.file);
      imageData.cloudinaryUrl = extractSecureUrl(req.file);
      imageData.cloudinaryPublicId = extractPublicId(req.file);
    }

    const image = new Image(imageData);
    await image.save();

    // Clear relevant caches
    await cache.del('images:all');
    await cache.del(`images:station:${station}`);
    await cache.del('images:stations');

    res.status(201).json(image);
  } catch (error) {
    console.error('Error creating image:', error);
    res.status(500).json({ error: 'Failed to create image' });
  }
});

// PUT /api/images/:id - Update image (protected)
router.put('/:id', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { title, description, station } = req.body;
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const oldStation = image.station;

    // Update fields
    if (title) image.title = title;
    if (description) image.description = description;
    if (station) image.station = station;

    // If new image uploaded
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (image.cloudinaryPublicId) {
        try {
          await deleteFromCloudinary(image.cloudinaryPublicId);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      image.src = extractSecureUrl(req.file);
      image.cloudinaryUrl = extractSecureUrl(req.file);
      image.cloudinaryPublicId = extractPublicId(req.file);
    }

    await image.save();

    // Clear relevant caches
    await cache.del('images:all');
    await cache.del(`images:station:${oldStation}`);
    if (station && station !== oldStation) {
      await cache.del(`images:station:${station}`);
    }
    await cache.del('images:stations');

    res.json(image);
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// DELETE /api/images/:id - Delete image (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete from Cloudinary if exists
    if (image.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(image.cloudinaryPublicId);
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
      }
    }

    await Image.findByIdAndDelete(req.params.id);

    // Clear relevant caches
    await cache.del('images:all');
    await cache.del(`images:station:${image.station}`);
    await cache.del('images:stations');

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;