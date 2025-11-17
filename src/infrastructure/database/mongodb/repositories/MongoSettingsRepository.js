/**
 * MongoDB Settings Repository Implementation (Adapter)
 * Implements ISettingsRepository using Mongoose
 * @version 5.1.0
 */

const ISettingsRepository = require('../../../../domain/repositories/ISettingsRepository');
const Settings = require('../models/Settings');

class MongoSettingsRepository extends ISettingsRepository {
  async get() {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await this.initialize();
    }
    
    return settings;
  }

  async update(updates) {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create(updates);
    } else {
      settings = await Settings.findOneAndUpdate(
        {},
        updates,
        { new: true, runValidators: true }
      );
    }
    
    return settings;
  }

  async initialize() {
    const defaultSettings = {
      siteName: 'GlowNatura',
      siteDescription: 'Natural skincare products',
      contactEmail: 'hello@glownaturas.com',
      contactPhone: '',
      currency: 'NGN',
      taxRate: 0,
      shippingFee: 0,
      freeShippingThreshold: 0,
      lowStockThreshold: 10,
      orderPrefix: 'ORD',
      maintenanceMode: false,
    };
    
    return await Settings.create(defaultSettings);
  }
}

module.exports = MongoSettingsRepository;

