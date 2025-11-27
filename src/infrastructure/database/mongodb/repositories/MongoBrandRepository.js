/**
 * MongoDB Brand Repository Implementation (Adapter)
 * Implements IBrandRepository using Mongoose
 * @version 5.2.1
 */

const IBrandRepository = require('../../../../domain/repositories/IBrandRepository');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const { NotFoundError } = require('../../../../shared/errors/AppError');

class MongoBrandRepository extends IBrandRepository {
  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 100, search, sortBy = 'name', sortOrder = 'asc' } = options;

    const query = { isActive: true };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [brands, total] = await Promise.all([
      Brand.find(query)
        .populate('logo')
        .sort(sort)
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(),
      Brand.countDocuments(query)
    ]);

    return {
      brands,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findById(id) {
    const brand = await Brand.findById(id).populate('logo');
    if (!brand) {
      throw new NotFoundError('Brand');
    }
    return brand;
  }

  async findBySlug(slug) {
    const brand = await Brand.findOne({ slug }).populate('logo').lean();
    if (!brand) {
      throw new NotFoundError('Brand');
    }
    return brand;
  }

  async findByLetter(letter) {
    const targetLetter = letter.toUpperCase();
    const brands = await Brand.find({
      firstLetter: targetLetter,
      isActive: true
    })
      .populate('logo')
      .sort({ name: 1 })
      .lean();
    
    return brands;
  }

  async create(brandData) {
    const brand = new Brand(brandData);
    await brand.save();
    return brand;
  }

  async update(id, updates) {
    const brand = await Brand.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('logo');
    
    if (!brand) {
      throw new NotFoundError('Brand');
    }
    
    return brand;
  }

  async delete(id) {
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) {
      throw new NotFoundError('Brand');
    }
  }

  async syncFromProducts() {
    // Get all distinct brand names from active products
    const brandNames = await Product.distinct('brand', { 
      status: 'active',
      brand: { $exists: true, $ne: '' }
    });

    let created = 0;
    let updated = 0;

    for (const brandName of brandNames) {
      // Find or create brand (case-insensitive)
      let brand = await Brand.findOne({
        name: { $regex: new RegExp(`^${brandName}$`, 'i') }
      });

      // Count products with this brand
      const productCount = await Product.countDocuments({
        brand: { $regex: new RegExp(`^${brandName}$`, 'i') },
        status: 'active'
      });

      if (!brand) {
        // Create new brand
        const firstProduct = await Product.findOne({
          brand: { $regex: new RegExp(`^${brandName}$`, 'i') }
        }).select('_id');

        brand = await Brand.create({
          name: brandName,
          productCount,
          createdFrom: firstProduct?._id
        });
        
        created++;
      } else {
        // Update existing brand product count
        brand.productCount = productCount;
        await brand.save();
        updated++;
      }
    }

    return {
      created,
      updated,
      total: created + updated
    };
  }
}

module.exports = MongoBrandRepository;

