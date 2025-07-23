const express = require('express');
const { OdooModule } = require('../models');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { cache } = require('../config/redis');
const { upload, deleteFromCloudinary, extractPublicId, extractSecureUrl } = require('../config/cloudinary');

const router = express.Router();

// GET /api/odoo - Get all Odoo modules (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, status } = req.query;
    let cacheKey = 'odoo:all';
    
    if (category) cacheKey += `:category:${category}`;
    if (status) cacheKey += `:status:${status}`;
    
    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    const odooModules = await OdooModule.find(query).sort({ createdAt: -1 });
    
    // Cache the result
    await cache.set(cacheKey, odooModules);
    
    res.json(odooModules);
  } catch (error) {
    console.error('Error fetching Odoo modules:', error);
    res.status(500).json({ error: 'Failed to fetch Odoo modules' });
  }
});

// GET /api/odoo/categories - Get unique categories
router.get('/categories', async (req, res) => {
  try {
    const cacheKey = 'odoo:categories';
    
    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const categories = await OdooModule.distinct('category');
    
    // Cache the result
    await cache.set(cacheKey, categories);
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/odoo/stats - Get module statistics
router.get('/stats', async (req, res) => {
  try {
    const cacheKey = 'odoo:stats';
    
    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const totalModules = await OdooModule.countDocuments();
    const modulesByCategory = await OdooModule.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const modulesByStatus = await OdooModule.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const totalClients = await OdooModule.aggregate([
      { $group: { _id: null, total: { $sum: '$clientsUsing' } } }
    ]);

    const stats = {
      totalModules,
      modulesByCategory,
      modulesByStatus,
      totalClients: totalClients[0]?.total || 0
    };
    
    // Cache the result
    await cache.set(cacheKey, stats);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/odoo/:id - Get specific Odoo module
router.get('/:id', async (req, res) => {
  try {
    const odooModule = await OdooModule.findById(req.params.id);
    
    if (!odooModule) {
      return res.status(404).json({ error: 'Odoo module not found' });
    }
    
    res.json(odooModule);
  } catch (error) {
    console.error('Error fetching Odoo module:', error);
    res.status(500).json({ error: 'Failed to fetch Odoo module' });
  }
});

// POST /api/odoo - Create new Odoo module (protected)
router.post('/', authenticate, upload.array('screenshots', 5), async (req, res) => {
  try {
    const {
      name, category, version, description, features, technicalSpecs,
      demoUrl, codeUrl, status, clientsUsing, color, icon, tags
    } = req.body;

    if (!name || !category || !version || !description || !status) {
      return res.status(400).json({ 
        error: 'Name, category, version, description, and status are required' 
      });
    }

    const odooModuleData = {
      name,
      category,
      version,
      description,
      demoUrl,
      codeUrl,
      status,
      clientsUsing: parseInt(clientsUsing) || 0,
      color,
      icon,
      screenshots: ['/api/placeholder/800/500'] // Default placeholder
    };

    // Parse JSON fields
    if (features) odooModuleData.features = typeof features === 'string' ? JSON.parse(features) : features;
    if (technicalSpecs) odooModuleData.technicalSpecs = typeof technicalSpecs === 'string' ? JSON.parse(technicalSpecs) : technicalSpecs;
    if (tags) odooModuleData.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;

    // If screenshots were uploaded to Cloudinary
    if (req.files && req.files.length > 0) {
      odooModuleData.screenshots = req.files.map(file => extractSecureUrl(file));
      odooModuleData.screenshotIds = req.files.map(file => extractPublicId(file));
    }

    const odooModule = new OdooModule(odooModuleData);
    await odooModule.save();

    // Clear cache
    await cache.clearPattern('odoo:*');

    res.status(201).json(odooModule);
  } catch (error) {
    console.error('Error creating Odoo module:', error);
    res.status(500).json({ error: 'Failed to create Odoo module' });
  }
});

// PUT /api/odoo/:id - Update Odoo module (protected)
router.put('/:id', authenticate, upload.array('screenshots', 5), async (req, res) => {
  try {
    const odooModule = await OdooModule.findById(req.params.id);

    if (!odooModule) {
      return res.status(404).json({ error: 'Odoo module not found' });
    }

    const {
      name, category, version, description, features, technicalSpecs,
      demoUrl, codeUrl, status, clientsUsing, color, icon, tags
    } = req.body;

    // Update fields
    if (name !== undefined) odooModule.name = name;
    if (category !== undefined) odooModule.category = category;
    if (version !== undefined) odooModule.version = version;
    if (description !== undefined) odooModule.description = description;
    if (demoUrl !== undefined) odooModule.demoUrl = demoUrl;
    if (codeUrl !== undefined) odooModule.codeUrl = codeUrl;
    if (status !== undefined) odooModule.status = status;
    if (clientsUsing !== undefined) odooModule.clientsUsing = parseInt(clientsUsing) || 0;
    if (color !== undefined) odooModule.color = color;
    if (icon !== undefined) odooModule.icon = icon;

    // Parse JSON fields
    if (features !== undefined) {
      odooModule.features = typeof features === 'string' ? JSON.parse(features) : features;
    }
    if (technicalSpecs !== undefined) {
      odooModule.technicalSpecs = typeof technicalSpecs === 'string' ? JSON.parse(technicalSpecs) : technicalSpecs;
    }
    if (tags !== undefined) {
      odooModule.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }

    // If new screenshots uploaded
    if (req.files && req.files.length > 0) {
      // Delete old screenshots from Cloudinary if they exist
      if (odooModule.screenshotIds && odooModule.screenshotIds.length > 0) {
        for (const publicId of odooModule.screenshotIds) {
          try {
            await deleteFromCloudinary(publicId);
          } catch (error) {
            console.error('Error deleting old screenshot:', error);
          }
        }
      }

      odooModule.screenshots = req.files.map(file => extractSecureUrl(file));
      odooModule.screenshotIds = req.files.map(file => extractPublicId(file));
    }

    await odooModule.save();

    // Clear cache
    await cache.clearPattern('odoo:*');

    res.json(odooModule);
  } catch (error) {
    console.error('Error updating Odoo module:', error);
    res.status(500).json({ error: 'Failed to update Odoo module' });
  }
});

// DELETE /api/odoo/:id - Delete Odoo module (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const odooModule = await OdooModule.findById(req.params.id);

    if (!odooModule) {
      return res.status(404).json({ error: 'Odoo module not found' });
    }

    // Delete screenshots from Cloudinary if they exist
    if (odooModule.screenshotIds && odooModule.screenshotIds.length > 0) {
      for (const publicId of odooModule.screenshotIds) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (error) {
          console.error('Error deleting screenshot:', error);
        }
      }
    }

    await OdooModule.findByIdAndDelete(req.params.id);

    // Clear cache
    await cache.clearPattern('odoo:*');

    res.json({ message: 'Odoo module deleted successfully' });
  } catch (error) {
    console.error('Error deleting Odoo module:', error);
    res.status(500).json({ error: 'Failed to delete Odoo module' });
  }
});

// PUT /api/odoo/:id/clients - Update client count (protected)
router.put('/:id/clients', authenticate, async (req, res) => {
  try {
    const { clientsUsing } = req.body;
    const odooModule = await OdooModule.findById(req.params.id);

    if (!odooModule) {
      return res.status(404).json({ error: 'Odoo module not found' });
    }

    odooModule.clientsUsing = parseInt(clientsUsing) || 0;
    await odooModule.save();

    // Clear cache
    await cache.clearPattern('odoo:*');

    res.json(odooModule);
  } catch (error) {
    console.error('Error updating client count:', error);
    res.status(500).json({ error: 'Failed to update client count' });
  }
});

module.exports = router;