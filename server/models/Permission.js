const PERMISSIONS = {
  ACCESS_LEAD_FORM: 'access_lead_form',
  ACCESS_ORDER_FORM: 'access_order_form',
  ACCESS_ADMIN_PAGE: 'access_admin_page',
  CREATE_USERS: 'create_users',
  VIEW_DASHBOARD: 'view_dashboard'
};

const ROLE_PERMISSIONS = {
  'admin': Object.values(PERMISSIONS),
  'user': [PERMISSIONS.ACCESS_LEAD_FORM, PERMISSIONS.VIEW_DASHBOARD],
  'manager': [PERMISSIONS.ACCESS_ORDER_FORM, PERMISSIONS.VIEW_DASHBOARD]
};

module.exports = { PERMISSIONS, ROLE_PERMISSIONS };