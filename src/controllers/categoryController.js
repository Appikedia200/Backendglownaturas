const Category = require('../infrastructure/database/mongodb/models/Category');

exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const query = {};
    
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    const categories = await Category.find(query)
      .populate('image')
      .sort('displayOrder');
    
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate('image');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    if (category.productCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with products. Reassign or delete products first.'
      });
    }
    
    await category.deleteOne();
    
    res.json({
      success: true,
      message: 'Category deleted'
    });
  } catch (error) {
    next(error);
  }
};

exports.reorderCategories = async (req, res, next) => {
  try {
    const { categories } = req.body;
    
    const updatePromises = categories.map(cat => 
      Category.findByIdAndUpdate(cat.id, { displayOrder: cat.order })
    );
    
    await Promise.all(updatePromises);
    
    res.json({
      success: true,
      message: 'Categories reordered'
    });
  } catch (error) {
    next(error);
  }
};


