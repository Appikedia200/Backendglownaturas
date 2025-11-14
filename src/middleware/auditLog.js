const AdminLog = require('../models/AdminLog');
const logger = require('../config/logger');

exports.logAdminAction = (action, resource) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.admin) {
        AdminLog.create({
          admin: req.admin._id,
          action,
          resource,
          resourceId: req.params.id || (data.data && data.data._id),
          changes: {
            before: req.originalData,
            after: req.body
          },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          timestamp: new Date()
        }).catch(err => {
          logger.error(`Audit log creation failed: ${err.message}`);
        });
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

exports.logLogin = async (req, admin) => {
  try {
    await AdminLog.create({
      admin: admin._id,
      action: 'login',
      resource: 'admin',
      resourceId: admin._id,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      timestamp: new Date()
    });
  } catch (err) {
    logger.error(`Login audit log failed: ${err.message}`);
  }
};

