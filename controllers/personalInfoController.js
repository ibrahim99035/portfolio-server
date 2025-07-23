const express = require('express');
const { PersonalProject } = require('../models');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { cache } = require('../config/redis');
const { upload, deleteFromCloudinary, extractPublicId, extractSecureUrl } = require('../config/cloudinary');

const router = express.Router();

// GET /api/personal-info - Get all personal projects (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { featured, status } = req.query;
    let cacheKey = 'personal-info:all';
    
    if (featured) cacheKey += `:featured:${featured}`;
    if (status) cacheKey += `:status:${status}`;
    
    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    let query = {};
    if (featured === 'true') query.featured = true;
    if (status) query.status = status;

    const personalProjects = await PersonalProject.find(query).sort({ createdAt: -1 });
    
    // Cache the result
    await cache.set(cacheKey, personalProjects);
    
    res.json(personalProjects);
  } catch (error) {
    console.error('Error fetching personal projects:', error);
    res.status(500).json({ error: 'Failed to fetch personal projects' });
  }
});

// GET /api/personal-info/statuses - Get unique project statuses
router.get('/statuses', async (req, res) => {
  try {
    const cacheKey = 'personal-info:statuses';
    
    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const statuses = await PersonalProject.distinct('status');
    
    // Cache the result
    await cache.set(cacheKey, statuses);
    
    res.json(statuses);
  } catch (error) {
    console.error('Error fetching statuses:', error);
    res.status(500).json({ error: 'Failed to fetch statuses' });
  }
});

// GET /api/personal-info/:id - Get specific personal project
router.get('/:id', async (req, res) => {
  try {
    const personalProject = await PersonalProject.findById(req.params.id);
    
    if (!personalProject) {
      return res.status(404).json({ error: 'Personal project not found' });
    }
    
    res.json(personalProject);
  } catch (error) {
    console.error('Error fetching personal project:', error);
    res.status(500).json({ error: 'Failed to fetch personal project' });
  }
});

// POST /api/personal-info - Create new personal project (protected)
router.post('/', authenticate, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, tech, status, link, featured } = req.body;

    if (!title || !description || !status) {
      return res.status(400).json({ 
        error: 'Title, description, and status are required' 
      });
    }

    const personalProjectData = {
      title,
      description,
      status,
      link,
      featured: featured === 'true' || featured === true,
      images: []
    };

    // Parse tech array if it's a string
    if (tech) {
      personalProjectData.tech = typeof tech === 'string' ? JSON.parse(tech) : tech;
    }

    // If images were uploaded to Cloudinary
    if (req.files && req.files.length > 0) {
      personalProjectData.images = req.files.map(file => extractSecureUrl(file));
      personalProjectData.imageIds = req.files.map(file => extractPublicId(file));
    }

    const personalProject = new PersonalProject(personalProjectData);
    await personalProject.save();

    // Clear cache
    await cache.clearPattern('personal-info:*');

    res.status(201).json(personalProject);
  } catch (error) {
    console.error('Error creating personal project:', error);
    res.status(500).json({ error: 'Failed to create personal project' });
  }
});

// PUT /api/personal-info/:id - Update personal project (protected)
router.put('/:id', authenticate, upload.array('images', 5), async (req, res) => {
  try {
    const personalProject = await PersonalProject.findById(req.params.id);

    if (!personalProject) {
      return res.status(404).json({ error: 'Personal project not found' });
    }

    const { title, description, tech, status, link, featured } = req.body;

    // Update fields
    if (title !== undefined) personalProject.title = title;
    if (description !== undefined) personalProject.description = description;
    if (status !== undefined) personalProject.status = status;
    if (link !== undefined) personalProject.link = link;
    if (featured !== undefined) personalProject.featured = featured === 'true' || featured === true;

    // Parse tech array if it's a string
    if (tech !== undefined) {
      personalProject.tech = typeof tech === 'string' ? JSON.parse(tech) : tech;
    }

    // If new images uploaded
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary if they exist
      if (personalProject.imageIds && personalProject.imageIds.length > 0) {
        for (const publicId of personalProject.imageIds) {
          try {
            await deleteFromCloudinary(publicId);
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }
      }

      personalProject.images = req.files.map(file => extractSecureUrl(file));
      personalProject.imageIds = req.files.map(file => extractPublicId(file));
    }

    await personalProject.save();

    // Clear cache
    await cache.clearPattern('personal-info:*');

    res.json(personalProject);
  } catch (error) {
    console.error('Error updating personal project:', error);
    res.status(500).json({ error: 'Failed to update personal project' });
  }
});

// DELETE /api/personal-info/:id - Delete personal project (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const personalProject = await PersonalProject.findById(req.params.id);

    if (!personalProject) {
      return res.status(404).json({ error: 'Personal project not found' });
    }

    // Delete images from Cloudinary if they exist
    if (personalProject.imageIds && personalProject.imageIds.length > 0) {
      for (const publicId of personalProject.imageIds) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }
    }

    await PersonalProject.findByIdAndDelete(req.params.id);

    // Clear cache
    await cache.clearPattern('personal-info:*');

    res.json({ message: 'Personal project deleted successfully' });
  } catch (error) {
    console.error('Error deleting personal project:', error);
    res.status(500).json({ error: 'Failed to delete personal project' });
  }
});

// PUT /api/personal-info/:id/toggle-featured - Toggle featured status (protected)
router.put('/:id/toggle-featured', authenticate, async (req, res) => {
  try {
    const personalProject = await PersonalProject.findById(req.params.id);

    if (!personalProject) {
      return res.status(404).json({ error: 'Personal project not found' });
    }

    personalProject.featured = !personalProject.featured;
    await personalProject.save();

    // Clear cache
    await cache.clearPattern('personal-info:*');

    res.json(personalProject);
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({ error: 'Failed to toggle featured status' });
  }
});

module.exports = router;