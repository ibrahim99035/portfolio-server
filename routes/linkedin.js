const express = require('express');
const { LinkedinProfile } = require('../models');
const { authenticate, optionalAuth } = require('../middleware/auth');
// REMOVE: const { cache } = require('../config/redis');

const router = express.Router();

/**
 * @swagger
 * /api/linkedin:
 *   get:
 *     summary: Get LinkedIn profile
 *     tags: [LinkedIn]
 *     responses:
 *       200:
 *         description: LinkedIn profile object
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    // Get the most recent profile (assuming only one profile exists)
    const profile = await LinkedinProfile.findOne().sort({ createdAt: -1 });

    if (!profile) {
      return res.status(404).json({ error: 'LinkedIn profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error);
    res.status(500).json({ error: 'Failed to fetch LinkedIn profile' });
  }
});

/**
 * @swagger
 * /api/linkedin:
 *   post:
 *     summary: Create or update LinkedIn profile
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: LinkedIn profile object
 */
router.post('/', authenticate, async (req, res) => {
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

    res.json(profile);
  } catch (error) {
    console.error('Error saving LinkedIn profile:', error);
    res.status(500).json({ error: 'Failed to save LinkedIn profile' });
  }
});

/**
 * @swagger
 * /api/linkedin/{id}:
 *   put:
 *     summary: Update LinkedIn profile by ID
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: LinkedIn profile updated
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const profile = await LinkedinProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    Object.assign(profile, req.body);
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error('Error updating LinkedIn profile:', error);
    res.status(500).json({ error: 'Failed to update LinkedIn profile' });
  }
});

/**
 * @swagger
 * /api/linkedin/{id}/experience:
 *   post:
 *     summary: Add experience
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Experience added
 */
router.post('/:id/experience', authenticate, async (req, res) => {
  try {
    const profile = await LinkedinProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    profile.experience.push(req.body);
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error('Error adding experience:', error);
    res.status(500).json({ error: 'Failed to add experience' });
  }
});

/**
 * @swagger
 * /api/linkedin/{id}/experience/{expId}:
 *   put:
 *     summary: Update experience
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: expId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Experience updated
 */
router.put('/:id/experience/:expId', authenticate, async (req, res) => {
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

    res.json(profile);
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ error: 'Failed to update experience' });
  }
});

/**
 * @swagger
 * /api/linkedin/{id}/experience/{expId}:
 *   delete:
 *     summary: Delete experience
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: expId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Experience deleted
 */
router.delete('/:id/experience/:expId', authenticate, async (req, res) => {
  try {
    const profile = await LinkedinProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    profile.experience.id(req.params.expId).remove();
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ error: 'Failed to delete experience' });
  }
});

/**
 * @swagger
 * /api/linkedin/{id}/education:
 *   post:
 *     summary: Add education
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Education added
 */
router.post('/:id/education', authenticate, async (req, res) => {
  try {
    const profile = await LinkedinProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    profile.education.push(req.body);
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add education' });
  }
});

/**
 * @swagger
 * /api/linkedin/{id}/skills:
 *   post:
 *     summary: Add skill
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Skill added
 */
router.post('/:id/skills', authenticate, async (req, res) => {
  try {
    const profile = await LinkedinProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    profile.skills.push(req.body);
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add skill' });
  }
});

/**
 * @swagger
 * /api/linkedin/{id}/certifications:
 *   post:
 *     summary: Add certification
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Certification added
 */
router.post('/:id/certifications', authenticate, async (req, res) => {
  try {
    const profile = await LinkedinProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    profile.certifications.push(req.body);
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add certification' });
  }
});

/**
 * @swagger
 * /api/linkedin/{id}:
 *   delete:
 *     summary: Delete LinkedIn profile
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Profile deleted
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await LinkedinProfile.findByIdAndDelete(req.params.id);
    res.json({ message: 'LinkedIn profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting LinkedIn profile:', error);
    res.status(500).json({ error: 'Failed to delete LinkedIn profile' });
  }
});

module.exports = router;