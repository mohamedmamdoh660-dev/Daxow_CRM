const http = require('http');

async function testApi() {
  // 1. Get token
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'Mohamed@daxow.com', password: 'Mohmed@010' })
  });
  
  if (!loginRes.ok) {
     console.error("Login failed!", await loginRes.text());
     return;
  }
  
  const { access_token } = await loginRes.json();
  
  // 2. Get roles
  const rolesRes = await fetch('http://localhost:3001/api/roles', {
      headers: { 'Authorization': `Bearer ${access_token}` }
  });
  const roles = await rolesRes.json();
  // Find "staff" role
  const staffRole = roles.find(r => r.name === 'staff') || roles[0];
  console.log("Found role:", staffRole.name, staffRole.id);
  
  // 3. Update role with missing 'add'
  const newPerms = staffRole.permissions.map(p => ({module: p.module, action: p.action})).filter(p => p.action !== 'add');
  console.log("Original perms length:", staffRole.permissions.length, "New array length:", newPerms.length);
  
  const updateRes = await fetch(`http://localhost:3001/api/roles/${staffRole.id}`, {
      method: 'PATCH',
      headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ permissions: newPerms })
  });
  
  const updated = await updateRes.json();
  console.log("Update response status:", updateRes.status);
  console.log("Updated perms length after save:", updated.permissions?.length);
}

testApi();
