const { ROLE_PERMISSIONS } = require('../models/Permission');

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    const userPermissions = ROLE_PERMISSIONS[userRole] || [];
    
    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({ 
        message: 'Недостаточно прав',
        required: requiredPermission,
        userRole: userRole,
        userPermissions: userPermissions
      });
    }

    next();
  };
};

module.exports = { checkPermission };