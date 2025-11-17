const Settings = require('../infrastructure/database/mongodb/models/Settings');

exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ singleton: true });
    
    if (!settings) {
      settings = await Settings.create({ singleton: true });
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ singleton: true });
    
    if (!settings) {
      settings = await Settings.create({ singleton: true, ...req.body });
    } else {
      settings = await Settings.findOneAndUpdate(
        { singleton: true },
        req.body,
        { new: true, runValidators: true }
      );
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

exports.updateStoreInfo = async (req, res, next) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { singleton: true },
      { storeInfo: req.body },
      { new: true, runValidators: true, upsert: true }
    );
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

exports.updateWhatsappSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { singleton: true },
      { whatsapp: req.body },
      { new: true, runValidators: true, upsert: true }
    );
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

exports.updateEmailTemplates = async (req, res, next) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { singleton: true },
      { emailTemplates: req.body },
      { new: true, runValidators: true, upsert: true }
    );
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSocialMedia = async (req, res, next) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { singleton: true },
      { socialMedia: req.body },
      { new: true, runValidators: true, upsert: true }
    );
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};


