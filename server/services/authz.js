class AuthorizationService {
  constructor(db) {
    this.db = db;
  }

  async checkPermission(userId, permissionCode) {
    const result = await this.db.get(`
      SELECT 1 FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      JOIN users u ON u.role_id = rp.role_id
      WHERE u.id = ? AND p.code = ?
    `, [userId, permissionCode]);
    
    return !!result;
  }
}

module.exports = AuthorizationService;