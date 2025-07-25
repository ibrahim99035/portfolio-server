const express = require('express');
const { JourneyStep } = require('../models');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { cache } = require('../config/redis');

const router = express.Router();

// GET /api/journey - Get all journey steps (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const cacheKey = 'journey:all';
    
    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const journeySteps = await JourneyStep.find().sort({ order: 1, createdAt: 1 });
    
    // Cache the result
    await cache.set(cacheKey, journeySteps);
    
    res.json(journeySteps);
  } catch (error) {
    console.error('Error fetching journey steps:', error);
    res.status(500).json({ error: 'Failed to fetch journey steps' });
  }
});

// GET /api/journey/:id - Get specific journey step
router.get('/:id', async (req, res) => {
  try {
    const journeyStep = await JourneyStep.findById(req.params.id);
    
    if (!journeyStep) {
      return res.status(404).json({ error: 'Journey step not found' });
    }
    
    res.json(journeyStep);
  } catch (error) {
    console.error('Error fetching journey step:', error);
    res.status(500).json({ error: 'Failed to fetch journey step' });
  }
});

// POST /api/journey - Create new journey step (protected)
router.post('/', authenticate, async (req, res) => {
  try {
    const { year, title, description, link, icon, color, order } = req.body;

    if (!year || !title || !description || !icon || !color) {
      return res.status(400).json({ 
        error: 'Year, title, description, icon, and color are required' 
      });
    }

    const journeyStep = new JourneyStep({
      year,
      title,
      description,
      link,
      icon,
      color,
      order: order || 0
    });

    await journeyStep.save();

    // Clear cache
    await cache.del('journey:all');

    res.status(201).json(journeyStep);
  } catch (error) {
    console.error('Error creating journey step:', error);
    res.status(500).json({ error: 'Failed to create journey step' });
  }
});

// PUT /api/journey/:id - Update journey step (protected)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const journeyStep = await JourneyStep.findById(req.params.id);

    if (!journeyStep) {
      return res.status(404).json({ error: 'Journey step not found' });
    }

    const { year, title, description, link, icon, color, order } = req.body;

    // Update fields
    if (year !== undefined) journeyStep.year = year;
    if (title !== undefined) journeyStep.title = title;
    if (description !== undefined) journeyStep.description = description;
    if (link !== undefined) journeyStep.link = link;
    if (icon !== undefined) journeyStep.icon = icon;
    if (color !== undefined) journeyStep.color = color;
    if (order !== undefined) journeyStep.order = order;

    await journeyStep.save();

    // Clear cache
    await cache.del('journey:all');

    res.json(journeyStep);
  } catch (error) {
    console.error('Error updating journey step:', error);
    res.status(500).json({ error: 'Failed to update journey step' });
  }
});

// DELETE /api/journey/:id - Delete journey step (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const journeyStep = await JourneyStep.findById(req.params.id);

    if (!journeyStep) {
      return res.status(404).json({ error: 'Journey step not found' });
    }

    await JourneyStep.findByIdAndDelete(req.params.id);

    // Clear cache
    await cache.del('journey:all');

    res.json({ message: 'Journey step deleted successfully' });
  } catch (error) {
    console.error('Error deleting journey step:', error);
    res.status(500).json({ error: 'Failed to delete journey step' });
  }
});

// PUT /api/journey/reorder - Reorder journey steps (protected)
router.put('/reorder', authenticate, async (req, res) => {
  try {
    const { steps } = req.body; // Array of { id, order }

    if (!Array.isArray(steps)) {
      return res.status(400).json({ error: 'Steps array is required' });
    }

    // Update order for each step
    const updatePromises = steps.map(async (step) => {
      await JourneyStep.findByIdAndUpdate(step.id, { order: step.order });
    });

    await Promise.all(updatePromises);

    // Clear cache
    await cache.del('journey:all');

    // Return updated steps
    const updatedSteps = await JourneyStep.find().sort({ order: 1, createdAt: 1 });
    res.json(updatedSteps);
  } catch (error) {
    console.error('Error reordering journey steps:', error);
    res.status(500).json({ error: 'Failed to reorder journey steps' });
  }
});

module.exports = router;