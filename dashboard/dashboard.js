const endpoints = [
  { name: 'Certificates', url: '/api/certificates', fields: ['label', 'type', 'base'] },
  { name: 'Images', url: '/api/images', fields: ['title', 'description', 'station'] },
  { name: 'Journey', url: '/api/journey', fields: ['year', 'title', 'description', 'icon', 'color', 'order'] },
  { name: 'Landing Pages', url: '/api/landing-pages', fields: ['title', 'description', 'liveUrl', 'codeUrl', 'color', 'bgGradient', 'featured'] },
  { name: 'LinkedIn', url: '/api/linkedin', fields: ['headline', 'summary', 'location'] },
  { name: 'Odoo', url: '/api/odoo', fields: ['name', 'category', 'version', 'description', 'status'] },
  { name: 'Personal Info', url: '/api/personal-info', fields: ['title', 'description', 'status', 'link', 'featured'] },
];

let token = localStorage.getItem('token') || '';

const dashboard = document.getElementById('dashboard');
const authSection = document.getElementById('auth-section');
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

// Auth
loginForm.onsubmit = async (e) => {
  e.preventDefault();
  loginMessage.textContent = '';
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      token = data.token;
      localStorage.setItem('token', token);
      authSection.style.display = 'none';
      renderDashboard();
    } else {
      loginMessage.textContent = data.error || 'Login failed';
    }
  } catch (err) {
    loginMessage.textContent = 'Network error';
  }
};

// Render dashboard after login
function renderDashboard() {
  dashboard.innerHTML = '';
  endpoints.forEach(endpoint => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded shadow p-6 flex flex-col';

    card.innerHTML = `
      <h2 class="text-xl font-semibold mb-2">${endpoint.name}</h2>
      <div class="mb-2">
        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onclick="fetchData('${endpoint.url}', this, '${endpoint.name}')">Fetch Data</button>
      </div>
      <div class="mb-2">
        <form onsubmit="createItem(event, '${endpoint.url}', '${endpoint.name}')" class="flex flex-col gap-2">
          ${endpoint.fields.map(f => `<input name="${f}" placeholder="${f}" class="border rounded px-2 py-1" required>`).join('')}
          <button type="submit" class="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Create</button>
        </form>
      </div>
      <div id="table-${endpoint.name.replace(/\s/g, '')}" class="overflow-x-auto"></div>
      <div id="message-${endpoint.name.replace(/\s/g, '')}" class="text-red-500 mt-2"></div>
    `;
    dashboard.appendChild(card);
  });
}

// Fetch data
window.fetchData = async (url, btn, name) => {
  btn.disabled = true;
  btn.textContent = 'Loading...';
  const msg = document.getElementById(`message-${name.replace(/\s/g, '')}`);
  msg.textContent = '';
  try {
    const res = await fetch(url, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    const data = await res.json();
    renderTable(name, data);
  } catch (err) {
    msg.textContent = 'Error fetching data';
  }
  btn.disabled = false;
  btn.textContent = 'Fetch Data';
};

// Render table
function renderTable(name, data) {
  const tableDiv = document.getElementById(`table-${name.replace(/\s/g, '')}`);
  if (!Array.isArray(data)) {
    tableDiv.innerHTML = `<pre class="bg-gray-100 p-2 rounded text-xs">${JSON.stringify(data, null, 2)}</pre>`;
    return;
  }
  if (data.length === 0) {
    tableDiv.innerHTML = '<div class="text-gray-500">No data found.</div>';
    return;
  }
  const keys = Object.keys(data[0]);
  let html = `<table class="min-w-full text-xs"><thead><tr>${keys.map(k => `<th class="border px-2 py-1">${k}</th>`).join('')}<th class="border px-2 py-1">Actions</th></tr></thead><tbody>`;
  data.forEach(item => {
    html += `<tr>${keys.map(k => `<td class="border px-2 py-1">${item[k]}</td>`).join('')}
      <td class="border px-2 py-1">
        <button class="bg-yellow-500 text-white px-2 py-1 rounded mr-1" onclick="editItem('${name}', '${item._id}')">Edit</button>
        <button class="bg-red-500 text-white px-2 py-1 rounded" onclick="deleteItem('${name}', '${item._id}')">Delete</button>
      </td>
    </tr>`;
  });
  html += '</tbody></table>';
  tableDiv.innerHTML = html;
}

// Create item
window.createItem = async (e, url, name) => {
  e.preventDefault();
  const form = e.target;
  const msg = document.getElementById(`message-${name.replace(/\s/g, '')}`);
  msg.textContent = '';
  const formData = {};
  for (const el of form.elements) {
    if (el.name) formData[el.name] = el.value;
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (res.ok) {
      fetchData(url, form.parentElement.previousElementSibling.querySelector('button'), name);
      form.reset();
    } else {
      msg.textContent = data.error || 'Create failed';
    }
  } catch (err) {
    msg.textContent = 'Network error';
  }
};

// Edit item (simple prompt-based for demo)
window.editItem = async (name, id) => {
  const url = endpoints.find(e => e.name === name).url + '/' + id;
  const msg = document.getElementById(`message-${name.replace(/\s/g, '')}`);
  msg.textContent = '';
  try {
    const res = await fetch(url, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    const data = await res.json();
    if (!res.ok) {
      msg.textContent = data.error || 'Fetch failed';
      return;
    }
    const updates = {};
    for (const key in data) {
      if (key !== '_id' && key !== '__v') {
        const val = prompt(`Edit ${key}:`, data[key]);
        if (val !== null) updates[key] = val;
      }
    }
    const updateRes = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(updates)
    });
    const updateData = await updateRes.json();
    if (updateRes.ok) {
      fetchData(endpoints.find(e => e.name === name).url, document.querySelector(`#table-${name.replace(/\s/g, '')}`).parentElement.querySelector('button'), name);
    } else {
      msg.textContent = updateData.error || 'Update failed';
    }
  } catch (err) {
    msg.textContent = 'Network error';
  }
};

// Delete item
window.deleteItem = async (name, id) => {
  if (!confirm('Are you sure you want to delete this item?')) return;
  const url = endpoints.find(e => e.name === name).url + '/' + id;
  const msg = document.getElementById(`message-${name.replace(/\s/g, '')}`);
  msg.textContent = '';
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    const data = await res.json();
    if (res.ok) {
      fetchData(endpoints.find(e => e.name === name).url, document.querySelector(`#table-${name.replace(/\s/g, '')}`).parentElement.querySelector('button'), name);
    } else {
      msg.textContent = data.error || 'Delete failed';
    }
  } catch (err) {
    msg.textContent = 'Network error';
  }
};

// Auto-login if token exists
if (token) {
  authSection.style.display = 'none';
  renderDashboard();
}