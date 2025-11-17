/**
 * MongoDB Cart Repository Implementation (Adapter)
 * Implements ICartRepository using Mongoose
 * @version 5.1.0
 */

const ICartRepository = require('../../../../domain/repositories/ICartRepository');
const Cart = require('../models/Cart');
const { NotFoundError } = require('../../../../shared/errors/AppError');

class MongoCartRepository extends ICartRepository {
  async findBySessionId(sessionId) {
    return await Cart.findOne({ sessionId })
      .populate('items.product');
  }

  async findByEmail(email) {
    return await Cart.find({ customerEmail: email })
      .populate('items.product');
  }

  async create(cartData) {
    const cart = await Cart.create(cartData);
    await cart.populate('items.product');
    return cart;
  }

  async update(sessionId, updates) {
    const cart = await Cart.findOneAndUpdate(
      { sessionId },
      updates,
      { new: true, runValidators: true }
    ).populate('items.product');
    
    if (!cart) {
      throw new NotFoundError('Cart');
    }
    
    return cart;
  }

  async delete(sessionId) {
    const cart = await Cart.findOneAndDelete({ sessionId });
    if (!cart) {
      throw new NotFoundError('Cart');
    }
  }

  async deleteExpired(expiryDate) {
    const result = await Cart.deleteMany({
      updatedAt: { $lt: expiryDate }
    });
    
    return result.deletedCount;
  }

  async addItem(sessionId, item) {
    let cart = await this.findBySessionId(sessionId);
    
    if (!cart) {
      throw new NotFoundError('Cart');
    }
    
    const existingItem = cart.items.find(
      i => i.product._id.toString() === item.product.toString()
    );
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.items.push(item);
    }
    
    await cart.save();
    await cart.populate('items.product');
    
    return cart;
  }

  async removeItem(sessionId, productId) {
    const cart = await Cart.findOneAndUpdate(
      { sessionId },
      { $pull: { items: { product: productId } } },
      { new: true }
    ).populate('items.product');
    
    if (!cart) {
      throw new NotFoundError('Cart');
    }
    
    return cart;
  }

  async updateItemQuantity(sessionId, productId, quantity) {
    const cart = await this.findBySessionId(sessionId);
    
    if (!cart) {
      throw new NotFoundError('Cart');
    }
    
    const item = cart.items.find(
      i => i.product._id.toString() === productId
    );
    
    if (!item) {
      throw new NotFoundError('Cart item');
    }
    
    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');
    
    return cart;
  }

  async clear(sessionId) {
    const cart = await Cart.findOneAndUpdate(
      { sessionId },
      { items: [] },
      { new: true }
    );
    
    if (!cart) {
      throw new NotFoundError('Cart');
    }
    
    return cart;
  }
}

module.exports = MongoCartRepository;

