// filepath: c:\Users\Lenovo\Desktop\portfolio\server\controllers\journeyController.js
const { JourneyStep } = require('../models');

exports.getAllJourneySteps = async (req, res) => {
  try {
    const journeySteps = await JourneyStep.find().sort({ order: 1, createdAt: 1 });
    res.json(journeySteps);
  } catch (error) {
    console.error('Error fetching journey steps:', error);
    res.status(500).json({ error: 'Failed to fetch journey steps' });
  }
};

exports.getJourneyStepById = async (req, res) => {
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
};

exports.createJourneyStep = async (req, res) => {
  try {
    const { year, title, description, link, icon, color, order } = req.body;
    if (!year || !title || !description || !icon || !color) {
      return res.status(400).json({ error: 'Year, title, description, icon, and color are required' });
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
    res.status(201).json(journeyStep);
  } catch (error) {
    console.error('Error creating journey step:', error);
    res.status(500).json({ error: 'Failed to create journey step' });
  }
};

exports.updateJourneyStep = async (req, res) => {
  try {
    const journeyStep = await JourneyStep.findById(req.params.id);
    if (!journeyStep) {
      return res.status(404).json({ error: 'Journey step not found' });
    }
    const { year, title, description, link, icon, color, order } = req.body;
    if (year !== undefined) journeyStep.year = year;
    if (title !== undefined) journeyStep.title = title;
    if (description !== undefined) journeyStep.description = description;
    if (link !== undefined) journeyStep.link = link;
    if (icon !== undefined) journeyStep.icon = icon;
    if (color !== undefined) journeyStep.color = color;
    if (order !== undefined) journeyStep.order = order;
    await journeyStep.save();
    res.json(journeyStep);
  } catch (error) {
    console.error('Error updating journey step:', error);
    res.status(500).json({ error: 'Failed to update journey step' });
  }
};

exports.deleteJourneyStep = async (req, res) => {
  try {
    const journeyStep = await JourneyStep.findById(req.params.id);
    if (!journeyStep) {
      return res.status(404).json({ error: 'Journey step not found' });
    }
    await JourneyStep.findByIdAndDelete(req.params.id);
    res.json({ message: 'Journey step deleted successfully' });
  } catch (error) {
    console.error('Error deleting journey step:', error);
    res.status(500).json({ error: 'Failed to delete journey step' });
  }
};

exports.reorderJourneySteps = async (req, res) => {
  try {
    const { steps } = req.body;
    if (!Array.isArray(steps)) {
      return res.status(400).json({ error: 'Steps array is required' });
    }
    const updatePromises = steps.map(async (step) => {
      await JourneyStep.findByIdAndUpdate(step.id, { order: step.order });
    });
    await Promise.all(updatePromises);
    const updatedSteps = await JourneyStep.find().sort({ order: 1, createdAt: 1 });
    res.json(updatedSteps);
  } catch (error) {
    console.error('Error reordering journey steps:', error);
    res.status(500).json({ error: 'Failed to reorder journey steps' });
  }
};