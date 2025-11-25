/**
 * MongoDB Homepage Section Repository Implementation (Adapter)
 * Implements IHomepageSectionRepository using Mongoose
 * @version 5.2.0
 */

const IHomepageSectionRepository = require('../../../../domain/repositories/IHomepageSectionRepository');
const HomepageSection = require('../models/HomepageSection');
const { NotFoundError } = require('../../../../shared/errors/AppError');

class MongoHomepageSectionRepository extends IHomepageSectionRepository {
  async findByType(sectionType) {
    const section = await HomepageSection.findOne({ sectionType })
      .populate({
        path: 'products',
        populate: [
          { path: 'category', select: 'name slug' },
          { path: 'images.mediaId', select: 'cloudinaryUrl filename altText' }
        ],
        select: '-__v'
      });
    
    if (!section) {
      throw new NotFoundError(`Homepage section '${sectionType}' not found`);
    }
    
    return section;
  }

  async findAll(filters = {}) {
    const query = {};
    
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    
    return await HomepageSection.find(query)
      .populate({
        path: 'products',
        populate: [
          { path: 'category', select: 'name slug' },
          { path: 'images.mediaId', select: 'cloudinaryUrl filename altText' }
        ],
        select: '-__v'
      })
      .sort({ displayOrder: 1, createdAt: -1 });
  }

  async create(sectionData) {
    const section = await HomepageSection.create(sectionData);
    return await this.findByType(section.sectionType);
  }

  async update(sectionType, updates) {
    const section = await HomepageSection.findOneAndUpdate(
      { sectionType },
      updates,
      { new: true, runValidators: true }
    ).populate({
      path: 'products',
      populate: [
        { path: 'category', select: 'name slug' },
        { path: 'images.mediaId', select: 'cloudinaryUrl filename altText' }
      ],
      select: '-__v'
    });
    
    if (!section) {
      throw new NotFoundError(`Homepage section '${sectionType}' not found`);
    }
    
    return section;
  }

  async delete(sectionType) {
    const section = await HomepageSection.findOneAndDelete({ sectionType });
    
    if (!section) {
      throw new NotFoundError(`Homepage section '${sectionType}' not found`);
    }
  }
}

module.exports = MongoHomepageSectionRepository;

