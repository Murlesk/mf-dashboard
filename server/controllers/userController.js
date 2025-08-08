const { ROLE_PERMISSIONS } = require('../models/Permission');

const getUserPermissions = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    
    res.json({ 
      role: userRole,
      permissions: permissions
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения прав' });
  }
};

module.exports = { getUserPermissions };