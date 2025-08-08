const AuthorizationService = require('../services/authz');

module.exports = (permission) => {
  return async (req, res, next) => {
    const authz = new AuthorizationService(req.db);
    const hasPermission = await authz.checkPermission(req.user.id, permission);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
};