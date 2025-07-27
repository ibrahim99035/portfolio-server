const { LinkedinProfile } = require('../models');

exports.getLinkedinProfile = async (req, res) => {
  try {
    const profile = await LinkedinProfile.findOne().sort({ createdAt: -1 });
    if (!profile) {
      return res.status(404).json({ error: 'LinkedIn profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error);
    res.status(500).json({ error: 'Failed to fetch LinkedIn profile' });
  }
};

exports.createOrUpdateLinkedinProfile = async (req, res) => {
  try {
    const profileData = req.body;
    let profile = await LinkedinProfile.findOne().sort({ createdAt: -1 });
    if (profile) {
      Object.assign(profile, profileData);
      await profile.save();
    } else {
      profile = new LinkedinProfile(profileData);
      await profile.save();
    }
    res.json(profile);
  } catch (error) {
    console.error('Error saving LinkedIn profile:', error);
    res.status(500).json({ error: 'Failed to save LinkedIn profile' });
  }
};

exports.updateLinkedinProfileById = async (req, res) => {
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
};

exports.addExperience = async (req, res) => {
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
};

exports.updateExperience = async (req, res) => {
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
};

exports.deleteExperience = async (req, res) => {
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
};

exports.addEducation = async (req, res) => {
  try {
    const profile = await LinkedinProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    profile.education.push(req.body);
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add education' });
  }
};

exports.addSkill = async (req, res) => {
  try {
    const profile = await LinkedinProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    profile.skills.push(req.body);
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add skill' });
  }
};

exports.addCertification = async (req, res) => {
  try {
    const profile = await LinkedinProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    profile.certifications.push(req.body);
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add certification' });
  }
};

exports.deleteLinkedinProfile = async (req, res) => {
  try {
    await LinkedinProfile.findByIdAndDelete(req.params.id);
    res.json({ message: 'LinkedIn profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting LinkedIn profile:', error);
    res.status(500).json({ error: 'Failed to delete LinkedIn profile' });
  }
};