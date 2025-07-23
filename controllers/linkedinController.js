const { LinkedinProfile } = require('../models');
const { cache } = require('../config/redis');

class LinkedinController {
  // GET /api/linkedin - Get LinkedIn profile (public)
  static async getProfile(req, res) {
    try {
      const cacheKey = 'linkedin:profile';
      
      // Try to get from cache first
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      // Get the most recent profile (assuming only one profile exists)
      const profile = await LinkedinProfile.findOne().sort({ createdAt: -1 });
      
      if (!profile) {
        return res.status(404).json({ error: 'LinkedIn profile not found' });
      }
      
      // Cache the result
      await cache.set(cacheKey, profile);
      
      res.json(profile);
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);
      res.status(500).json({ error: 'Failed to fetch LinkedIn profile' });
    }
  }

  // POST /api/linkedin - Create or update LinkedIn profile (protected)
  static async createOrUpdateProfile(req, res) {
    try {
      const profileData = req.body;

      // Check if profile already exists
      let profile = await LinkedinProfile.findOne().sort({ createdAt: -1 });

      if (profile) {
        // Update existing profile
        Object.assign(profile, profileData);
        await profile.save();
      } else {
        // Create new profile
        profile = new LinkedinProfile(profileData);
        await profile.save();
      }

      // Clear cache
      await cache.del('linkedin:profile');

      res.json(profile);
    } catch (error) {
      console.error('Error saving LinkedIn profile:', error);
      res.status(500).json({ error: 'Failed to save LinkedIn profile' });
    }
  }

  // PUT /api/linkedin/:id - Update specific profile (protected)
  static async updateProfile(req, res) {
    try {
      const profile = await LinkedinProfile.findById(req.params.id);

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      Object.assign(profile, req.body);
      await profile.save();

      // Clear cache
      await cache.del('linkedin:profile');

      res.json(profile);
    } catch (error) {
      console.error('Error updating LinkedIn profile:', error);
      res.status(500).json({ error: 'Failed to update LinkedIn profile' });
    }
  }

  // DELETE /api/linkedin/:id - Delete profile (protected)
  static async deleteProfile(req, res) {
    try {
      await LinkedinProfile.findByIdAndDelete(req.params.id);
      await cache.del('linkedin:profile');
      res.json({ message: 'LinkedIn profile deleted successfully' });
    } catch (error) {
      console.error('Error deleting LinkedIn profile:', error);
      res.status(500).json({ error: 'Failed to delete LinkedIn profile' });
    }
  }

  // POST /api/linkedin/:id/experience - Add experience (protected)
  static async addExperience(req, res) {
    try {
      const profile = await LinkedinProfile.findById(req.params.id);

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      profile.experience.push(req.body);
      await profile.save();

      // Clear cache
      await cache.del('linkedin:profile');

      res.json(profile);
    } catch (error) {
      console.error('Error adding experience:', error);
      res.status(500).json({ error: 'Failed to add experience' });
    }
  }

  // PUT /api/linkedin/:id/experience/:expId - Update experience (protected)
  static async updateExperience(req, res) {
    try {
      const profile = await LinkedinProfile.findById(req.params.id);

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const experience = profile.experience.id(req.params.expId);
      if (!experience) {
        return res.status(404).json({ error: 'Experience not found' });
      }

      Object.assign(experience, req.body);
      await profile.save();

      // Clear cache
      await cache.del('linkedin:profile');

      res.json(profile);
    } catch (error) {
      console.error('Error updating experience:', error);
      res.status(500).json({ error: 'Failed to update experience' });
    }
  }

  // DELETE /api/linkedin/:id/experience/:expId - Delete experience (protected)
  static async deleteExperience(req, res) {
    try {
      const profile = await LinkedinProfile.findById(req.params.id);

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      profile.experience.id(req.params.expId).remove();
      await profile.save();

      // Clear cache
      await cache.del('linkedin:profile');

      res.json(profile);
    } catch (error) {
      console.error('Error deleting experience:', error);
      res.status(500).json({ error: 'Failed to delete experience' });
    }
  }

  // POST /api/linkedin/:id/education - Add education
  static async addEducation(req, res) {
    try {
      const profile = await LinkedinProfile.findById(req.params.id);
      if (!profile) return res.status(404).json({ error: 'Profile not found' });

      profile.education.push(req.body);
      await profile.save();
      await cache.del('linkedin:profile');
      res.json(profile);
    } catch (error) {
      console.error('Error adding education:', error);
      res.status(500).json({ error: 'Failed to add education' });
    }
  }

  // POST /api/linkedin/:id/skills - Add skill
  static async addSkill(req, res) {
    try {
      const profile = await LinkedinProfile.findById(req.params.id);
      if (!profile) return res.status(404).json({ error: 'Profile not found' });

      profile.skills.push(req.body);
      await profile.save();
      await cache.del('linkedin:profile');
      res.json(profile);
    } catch (error) {
      console.error('Error adding skill:', error);
      res.status(500).json({ error: 'Failed to add skill' });
    }
  }

  // POST /api/linkedin/:id/certifications - Add certification
  static async addCertification(req, res) {
    try {
      const profile = await LinkedinProfile.findById(req.params.id);
      if (!profile) return res.status(404).json({ error: 'Profile not found' });

      profile.certifications.push(req.body);
      await profile.save();
      await cache.del('linkedin:profile');
      res.json(profile);
    } catch (error) {
      console.error('Error adding certification:', error);
      res.status(500).json({ error: 'Failed to add certification' });
    }
  }
}

module.exports = LinkedinController;