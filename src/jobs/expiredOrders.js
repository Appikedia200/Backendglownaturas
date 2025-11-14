const cron = require('node-cron');
const Order = require('../models/Order');
const Product = require('../models/Product');
const logger = require('../config/logger');

const scheduleExpiredOrdersJob = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      logger.info('Running expired orders job');
      
      const expiredOrders = await Order.find({
        status: 'pending',
        paymentStatus: 'pending',
        expiresAt: { $lt: new Date() }
      }).populate('items.product');
      
      if (expiredOrders.length === 0) {
        logger.debug('No expired orders found');
        return;
      }
      
      for (const order of expiredOrders) {
        try {
          for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
              await product.releaseStock(item.quantity);
              logger.info(`Released ${item.quantity} units of ${product.name} from expired order ${order.orderId}`);
            }
          }
          
          order.status = 'cancelled';
          order.statusHistory.push({
            status: 'cancelled',
            date: new Date(),
            by: 'System',
            note: 'Order expired - payment not received within 6 hours'
          });
          await order.save();
          
          logger.info(`Order ${order.orderId} cancelled due to expiration`);
        } catch (error) {
          logger.error(`Error processing expired order ${order.orderId}: ${error.message}`);
        }
      }
      
      logger.info(`Processed ${expiredOrders.length} expired orders`);
    } catch (error) {
      logger.error(`Expired orders job failed: ${error.message}`);
    }
  });
  
  logger.info('Expired orders cron job scheduled (runs every 15 minutes)');
};

module.exports = scheduleExpiredOrdersJob;

