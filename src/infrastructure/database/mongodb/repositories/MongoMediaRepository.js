/**
 * MongoDB Media Repository Implementation (Adapter)
 * Implements IMediaRepository using Mongoose
 * @version 5.1.0
 */

const IMediaRepository = require('../../../../domain/repositories/IMediaRepository');
const Media = require('../models/Media');
const { NotFoundError } = require('../../../../shared/errors/AppError');

class MongoMediaRepository extends IMediaRepository {
  async findById(id) {
    const media = await Media.findById(id);
    if (!media) {
      throw new NotFoundError('Media');
    }
    return media;
  }

  async findAll(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      type
    } = options;

    const query = {};
    
    if (type) {
      query.type = type;
    }

    const [media, total] = await Promise.all([
      Media.find(query)
        .populate('uploadedBy', 'name email')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limit)
        .skip((page - 1) * limit),
      Media.countDocuments(query),
    ]);

    return { media, total };
  }

  async create(mediaData) {
    const media = await Media.create(mediaData);
    return media;
  }

  async update(id, updates) {
    const media = await Media.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!media) {
      throw new NotFoundError('Media');
    }
    
    return media;
  }

  async delete(id) {
    const media = await Media.findByIdAndDelete(id);
    if (!media) {
      throw new NotFoundError('Media');
    }
    return media;
  }

  async findByPublicId(publicId) {
    return await Media.findOne({ 'cloudinary.publicId': publicId });
  }

  async findByType(type) {
    return await Media.find({ type });
  }
}

module.exports = MongoMediaRepository;

