const initialRoles = [
  {
    name: 'admin',
    permissions: ['manage_users', 'delete_content', 'view_reports']
  },
  {
    name: 'moderator',
    permissions: ['delete_content', 'view_reports']
  }
];

async function seed() {
  for (const roleData of initialRoles) {
    const roleId = await createRole(roleData.name);
    for (const permCode of roleData.permissions) {
      await assignPermission(roleId, permCode);
    }
  }
}