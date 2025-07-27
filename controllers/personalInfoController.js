const { PersonalProject } = require('../models');
const { deleteFromCloudinary, extractPublicId, extractSecureUrl } = require('../config/cloudinary');

exports.getAllPersonalProjects = async (req, res) => {
  try {
    const { featured, status } = req.query;
    let query = {};
    if (featured === 'true') query.featured = true;
    if (status) query.status = status;
    const personalProjects = await PersonalProject.find(query).sort({ createdAt: -1 });
    res.json(personalProjects);
  } catch (error) {
    console.error('Error fetching personal projects:', error);
    res.status(500).json({ error: 'Failed to fetch personal projects' });
  }
};

exports.getStatuses = async (req, res) => {
  try {
    const statuses = await PersonalProject.distinct('status');
    res.json(statuses);
  } catch (error) {
    console.error('Error fetching statuses:', error);
    res.status(500).json({ error: 'Failed to fetch statuses' });
  }
};

exports.getPersonalProjectById = async (req, res) => {
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
};

exports.createPersonalProject = async (req, res) => {
  try {
    const { title, description, tech, status, link, featured } = req.body;
    if (!title || !description || !status) {
      return res.status(400).json({ error: 'Title, description, and status are required' });
    }
    const personalProjectData = {
      title,
      description,
      status,
      link,
      featured: featured === 'true' || featured === true,
      images: []
    };
    if (tech) {
      personalProjectData.tech = typeof tech === 'string' ? JSON.parse(tech) : tech;
    }
    if (req.files && req.files.length > 0) {
      personalProjectData.images = req.files.map(file => extractSecureUrl(file));
      personalProjectData.imageIds = req.files.map(file => extractPublicId(file));
    }
    const personalProject = new PersonalProject(personalProjectData);
    await personalProject.save();
    res.status(201).json(personalProject);
  } catch (error) {
    console.error('Error creating personal project:', error);
    res.status(500).json({ error: 'Failed to create personal project' });
  }
};

exports.updatePersonalProject = async (req, res) => {
  try {
    const personalProject = await PersonalProject.findById(req.params.id);
    if (!personalProject) {
      return res.status(404).json({ error: 'Personal project not found' });
    }
    const { title, description, tech, status, link, featured } = req.body;
    if (title !== undefined) personalProject.title = title;
    if (description !== undefined) personalProject.description = description;
    if (status !== undefined) personalProject.status = status;
    if (link !== undefined) personalProject.link = link;
    if (featured !== undefined) personalProject.featured = featured === 'true' || featured === true;
    if (tech !== undefined) {
      personalProject.tech = typeof tech === 'string' ? JSON.parse(tech) : tech;
    }
    if (req.files && req.files.length > 0) {
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
    res.json(personalProject);
  } catch (error) {
    console.error('Error updating personal project:', error);
    res.status(500).json({ error: 'Failed to update personal project' });
  }
};

exports.deletePersonalProject = async (req, res) => {
  try {
    const personalProject = await PersonalProject.findById(req.params.id);
    if (!personalProject) {
      return res.status(404).json({ error: 'Personal project not found' });
    }
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
    res.json({ message: 'Personal project deleted successfully' });
  } catch (error) {
    console.error('Error deleting personal project:', error);
    res.status(500).json({ error: 'Failed to delete personal project' });
  }
};

exports.toggleFeaturedPersonalProject = async (req, res) => {
  try {
    const personalProject = await PersonalProject.findById(req.params.id);
    if (!personalProject) {
      return res.status(404).json({ error: 'Personal project not found' });
    }
    personalProject.featured = !personalProject.featured;
    await personalProject.save();
    res.json(personalProject);
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({ error: 'Failed to toggle featured status' });
  }
};