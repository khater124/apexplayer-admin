export function renderAdminPage(): string {
    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Apex Provider Admin</title>
    <style>
        :root {
            color-scheme: dark;
            --bg: #0d1117;
            --panel: #151a23;
            --panel-2: #1d2430;
            --text: #f5f7fb;
            --muted: #99a4b8;
            --line: #2b3443;
            --accent: #69a7ff;
            --danger: #ff6b6b;
            --ok: #55d187;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font: 14px/1.45 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: var(--text);
            background: var(--bg);
        }
        header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 24px;
            border-bottom: 1px solid var(--line);
            background: #10151d;
        }
        main { padding: 24px; }
        h1, h2, h3 { margin: 0; letter-spacing: 0; }
        h1 { font-size: 20px; }
        h2 { font-size: 18px; margin-bottom: 14px; }
        h3 { font-size: 15px; margin: 18px 0 10px; }
        .tabs { display: flex; gap: 8px; margin-bottom: 18px; }
        .tab, button {
            border: 1px solid var(--line);
            border-radius: 7px;
            background: var(--panel-2);
            color: var(--text);
            padding: 9px 12px;
            cursor: pointer;
        }
        .tab.active, button.primary { border-color: var(--accent); background: #183355; }
        button.danger { border-color: var(--danger); color: #ffdede; }
        button:disabled { opacity: .45; cursor: not-allowed; }
        input, textarea, select {
            width: 100%;
            border: 1px solid var(--line);
            border-radius: 7px;
            background: #0f141c;
            color: var(--text);
            padding: 9px 10px;
        }
        textarea { min-height: 70px; resize: vertical; }
        label { display: grid; gap: 6px; color: var(--muted); }
        .card {
            background: var(--panel);
            border: 1px solid var(--line);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
        }
        .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
        table { width: 100%; border-collapse: collapse; overflow: hidden; }
        th, td { border-bottom: 1px solid var(--line); padding: 10px; text-align: left; vertical-align: top; }
        th { color: var(--muted); font-weight: 600; background: #111720; position: sticky; top: 0; }
        .table-wrap { max-height: 56vh; overflow: auto; border: 1px solid var(--line); border-radius: 8px; }
        .muted { color: var(--muted); }
        .ok { color: var(--ok); }
        .bad { color: var(--danger); }
        .mono { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; word-break: break-all; }
        .hidden { display: none !important; }
        .login {
            max-width: 420px;
            margin: 12vh auto;
        }
        .notice { min-height: 20px; color: var(--muted); margin: 10px 0; }
        @media (max-width: 1000px) {
            .grid, .grid.two { grid-template-columns: 1fr; }
            main { padding: 14px; }
            th, td { min-width: 140px; }
        }
    </style>
</head>
<body>
    <header>
        <h1>Apex Provider Admin</h1>
        <div class="actions">
            <span id="sessionLabel" class="muted"></span>
            <button id="logoutButton" class="hidden">Logout</button>
        </div>
    </header>
    <main>
        <section id="loginView" class="login card">
            <h2>Admin Login</h2>
            <div class="notice" id="loginNotice"></div>
            <form id="loginForm" class="grid two">
                <label>Username<input name="username" autocomplete="username" required></label>
                <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
                <div class="actions"><button class="primary" type="submit">Login</button></div>
            </form>
        </section>
        <section id="appView" class="hidden">
            <div class="tabs">
                <button class="tab active" data-tab="codes">Provider Codes</button>
                <button class="tab" data-tab="devices">Devices</button>
            </div>
            <section id="codesTab">
                <div class="card">
                    <h2>Create Provider Code</h2>
                    <form id="codeForm" class="grid">
                        <label>Code<input name="code" placeholder="557" required></label>
                        <label>Store Name<input name="store_name" placeholder="Store name" required></label>
                        <label>Expires At<input name="expires_at" type="datetime-local"></label>
                        <label>Notes<textarea name="notes"></textarea></label>
                        <div class="actions"><button class="primary" type="submit">Create Code</button></div>
                    </form>
                </div>
                <div class="card">
                    <h2>Provider Codes</h2>
                    <div id="codesTable" class="table-wrap"></div>
                </div>
                <div id="codeDetails" class="card hidden"></div>
            </section>
            <section id="devicesTab" class="hidden">
                <div class="card">
                    <h2>Devices</h2>
                    <div id="devicesTable" class="table-wrap"></div>
                </div>
            </section>
        </section>
    </main>
    <script>
        const state = { codes: [], devices: [], selectedCodeId: null, hosts: [], codeDevices: [] };
        const $ = (selector) => document.querySelector(selector);
        const api = async (url, options = {}) => {
            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
                credentials: 'same-origin',
                ...options
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Request failed');
            }
            return response.json();
        };
        const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[char]));
        const fmt = (value) => value ? new Date(value).toLocaleString() : '';
        const boolText = (ok) => ok ? '<span class="ok">Active</span>' : '<span class="bad">Blocked</span>';
        const formData = (form) => Object.fromEntries(new FormData(form).entries());
        const isoOrNull = (value) => value ? new Date(value).toISOString() : null;

        async function refreshSession() {
            const session = await api('/admin/api/session').catch(() => ({ authenticated: false }));
            $('#loginView').classList.toggle('hidden', session.authenticated);
            $('#appView').classList.toggle('hidden', !session.authenticated);
            $('#logoutButton').classList.toggle('hidden', !session.authenticated);
            $('#sessionLabel').textContent = session.authenticated ? 'Signed in' : '';
            if (session.authenticated) await refreshAll();
        }

        async function refreshAll() {
            const [codes, devices] = await Promise.all([
                api('/admin/api/provider-codes'),
                api('/admin/api/devices')
            ]);
            state.codes = codes.items;
            state.devices = devices.items;
            renderCodes();
            renderDevices();
            if (state.selectedCodeId) await loadCodeDetails(state.selectedCodeId);
        }

        function renderCodes() {
            $('#codesTable').innerHTML = '<table><thead><tr><th>Code</th><th>Store</th><th>Status</th><th>Expires</th><th>Devices</th><th>Notes</th><th>Actions</th></tr></thead><tbody>' +
                state.codes.map((code) => '<tr>' +
                    '<td class="mono">' + esc(code.code) + '</td>' +
                    '<td>' + esc(code.store_name) + '</td>' +
                    '<td>' + (code.is_active && !code.is_blocked ? '<span class="ok">Active</span>' : '<span class="bad">Blocked</span>') + '</td>' +
                    '<td>' + esc(fmt(code.expires_at)) + '</td>' +
                    '<td>' + esc(code.device_count ?? 0) + '</td>' +
                    '<td>' + esc(code.notes || '') + '</td>' +
                    '<td class="actions">' +
                        '<button data-action="details" data-id="' + esc(code.id) + '">Details</button>' +
                        '<button data-action="toggle-code" data-id="' + esc(code.id) + '">' + (code.is_blocked ? 'Unblock' : 'Block') + '</button>' +
                        '<button class="danger" data-action="delete-code" data-id="' + esc(code.id) + '">Delete</button>' +
                    '</td>' +
                '</tr>').join('') + '</tbody></table>';
        }

        function renderDevices(target = '#devicesTable', items = state.devices) {
            $(target).innerHTML = '<table><thead><tr><th>Code</th><th>Store</th><th>Username</th><th>Password</th><th>Resolved Host</th><th>Device Key</th><th>MAC</th><th>Install ID</th><th>Version</th><th>IP</th><th>Last Seen</th><th>Status</th><th>Actions</th></tr></thead><tbody>' +
                items.map((device) => '<tr>' +
                    '<td class="mono">' + esc(device.provider_code) + '</td>' +
                    '<td>' + esc(device.store_name || '') + '</td>' +
                    '<td class="mono">' + esc(device.username) + '</td>' +
                    '<td class="mono">' + esc(device.password || '') + '</td>' +
                    '<td class="mono">' + esc(device.resolved_host_used || '') + '</td>' +
                    '<td class="mono">' + esc(device.device_key || '') + '</td>' +
                    '<td class="mono">' + esc(device.mac_address || '') + '</td>' +
                    '<td class="mono">' + esc(device.app_installation_id || '') + '</td>' +
                    '<td>' + esc(device.app_version || '') + '</td>' +
                    '<td>' + esc(device.ip_address || '') + '</td>' +
                    '<td>' + esc(fmt(device.last_seen_at)) + '</td>' +
                    '<td>' + boolText(!device.is_blocked) + '</td>' +
                    '<td class="actions">' +
                        '<button data-action="toggle-device" data-id="' + esc(device.id) + '">' + (device.is_blocked ? 'Unblock' : 'Block') + '</button>' +
                        '<button class="danger" data-action="delete-device" data-id="' + esc(device.id) + '">Delete</button>' +
                    '</td>' +
                '</tr>').join('') + '</tbody></table>';
        }

        async function loadCodeDetails(id) {
            state.selectedCodeId = id;
            const code = state.codes.find((item) => item.id === id);
            const [hosts, devices] = await Promise.all([
                api('/admin/api/provider-codes/' + id + '/hosts'),
                api('/admin/api/provider-codes/' + id + '/devices')
            ]);
            state.hosts = hosts.items;
            state.codeDevices = devices.items;
            $('#codeDetails').classList.remove('hidden');
            $('#codeDetails').innerHTML =
                '<h2>Provider Code ' + esc(code?.code || '') + '</h2>' +
                '<form id="editCodeForm" class="grid">' +
                    '<label>Store Name<input name="store_name" value="' + esc(code?.store_name || '') + '" required></label>' +
                    '<label>Expires At<input name="expires_at" type="datetime-local"></label>' +
                    '<label>Active<select name="is_active"><option value="true">Active</option><option value="false">Inactive</option></select></label>' +
                    '<label>Blocked<select name="is_blocked"><option value="false">Unblocked</option><option value="true">Blocked</option></select></label>' +
                    '<label>Notes<textarea name="notes">' + esc(code?.notes || '') + '</textarea></label>' +
                    '<div class="actions"><button class="primary" type="submit">Save Code</button></div>' +
                '</form>' +
                '<h3>Add Host</h3>' +
                '<form id="hostForm" class="grid">' +
                    '<label>Host URL<input name="host_url" placeholder="https://host.com" required></label>' +
                    '<label>Priority<input name="priority" type="number" value="100" required></label>' +
                    '<label>Notes<textarea name="notes"></textarea></label>' +
                    '<div class="actions"><button class="primary" type="submit">Add Host</button></div>' +
                '</form>' +
                '<h3>Hosts</h3><div class="table-wrap" id="hostsTable"></div>' +
                '<h3>Connected Devices</h3><div class="table-wrap" id="codeDevicesTable"></div>';
            const editForm = $('#editCodeForm');
            editForm.elements.expires_at.value = code?.expires_at ? new Date(code.expires_at).toISOString().slice(0, 16) : '';
            editForm.elements.is_active.value = String(Boolean(code?.is_active));
            editForm.elements.is_blocked.value = String(Boolean(code?.is_blocked));
            renderHosts();
            renderDevices('#codeDevicesTable', state.codeDevices);
        }

        function renderHosts() {
            $('#hostsTable').innerHTML = '<table><thead><tr><th>Host URL</th><th>Priority</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead><tbody>' +
                state.hosts.map((host) => '<tr>' +
                    '<td class="mono">' + esc(host.host_url) + '</td>' +
                    '<td><input data-host-field="priority" data-id="' + esc(host.id) + '" type="number" value="' + esc(host.priority) + '"></td>' +
                    '<td>' + boolText(host.is_active) + '</td>' +
                    '<td><input data-host-field="notes" data-id="' + esc(host.id) + '" value="' + esc(host.notes || '') + '"></td>' +
                    '<td class="actions">' +
                        '<button data-action="save-host" data-id="' + esc(host.id) + '">Save</button>' +
                        '<button data-action="toggle-host" data-id="' + esc(host.id) + '">' + (host.is_active ? 'Disable' : 'Enable') + '</button>' +
                        '<button class="danger" data-action="delete-host" data-id="' + esc(host.id) + '">Delete</button>' +
                    '</td>' +
                '</tr>').join('') + '</tbody></table>';
        }

        document.addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.target;
            try {
                if (form.id === 'loginForm') {
                    await api('/admin/api/login', { method: 'POST', body: JSON.stringify(formData(form)) });
                    form.reset();
                    await refreshSession();
                }
                if (form.id === 'codeForm') {
                    const data = formData(form);
                    data.expires_at = isoOrNull(data.expires_at);
                    await api('/admin/api/provider-codes', { method: 'POST', body: JSON.stringify(data) });
                    form.reset();
                    await refreshAll();
                }
                if (form.id === 'editCodeForm') {
                    const data = formData(form);
                    data.expires_at = isoOrNull(data.expires_at);
                    data.is_active = data.is_active === 'true';
                    data.is_blocked = data.is_blocked === 'true';
                    await api('/admin/api/provider-codes/' + state.selectedCodeId, { method: 'PATCH', body: JSON.stringify(data) });
                    await refreshAll();
                }
                if (form.id === 'hostForm') {
                    const data = formData(form);
                    data.priority = Number(data.priority);
                    await api('/admin/api/provider-codes/' + state.selectedCodeId + '/hosts', { method: 'POST', body: JSON.stringify(data) });
                    form.reset();
                    await loadCodeDetails(state.selectedCodeId);
                }
            } catch (error) {
                $('#loginNotice').textContent = error.message;
                alert(error.message);
            }
        });

        document.addEventListener('click', async (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            const action = button.dataset.action;
            const id = button.dataset.id;
            try {
                if (button.dataset.tab) {
                    document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab === button));
                    $('#codesTab').classList.toggle('hidden', button.dataset.tab !== 'codes');
                    $('#devicesTab').classList.toggle('hidden', button.dataset.tab !== 'devices');
                }
                if (button.id === 'logoutButton') {
                    await api('/admin/api/logout', { method: 'POST', body: '{}' });
                    await refreshSession();
                }
                if (action === 'details') await loadCodeDetails(id);
                if (action === 'toggle-code') {
                    const code = state.codes.find((item) => item.id === id);
                    await api('/admin/api/provider-codes/' + id, { method: 'PATCH', body: JSON.stringify({ is_blocked: !code.is_blocked }) });
                    await refreshAll();
                }
                if (action === 'delete-code' && confirm('Delete this provider code and its hosts?')) {
                    await api('/admin/api/provider-codes/' + id, { method: 'DELETE' });
                    state.selectedCodeId = null;
                    $('#codeDetails').classList.add('hidden');
                    await refreshAll();
                }
                if (action === 'save-host') {
                    const priority = document.querySelector('[data-host-field="priority"][data-id="' + id + '"]').value;
                    const notes = document.querySelector('[data-host-field="notes"][data-id="' + id + '"]').value;
                    await api('/admin/api/hosts/' + id, { method: 'PATCH', body: JSON.stringify({ priority: Number(priority), notes }) });
                    await loadCodeDetails(state.selectedCodeId);
                }
                if (action === 'toggle-host') {
                    const host = state.hosts.find((item) => item.id === id);
                    await api('/admin/api/hosts/' + id, { method: 'PATCH', body: JSON.stringify({ is_active: !host.is_active }) });
                    await loadCodeDetails(state.selectedCodeId);
                }
                if (action === 'delete-host' && confirm('Delete this host?')) {
                    await api('/admin/api/hosts/' + id, { method: 'DELETE' });
                    await loadCodeDetails(state.selectedCodeId);
                }
                if (action === 'toggle-device') {
                    const device = state.devices.concat(state.codeDevices).find((item) => item.id === id);
                    await api('/admin/api/devices/' + id, { method: 'PATCH', body: JSON.stringify({ is_blocked: !device.is_blocked }) });
                    await refreshAll();
                }
                if (action === 'delete-device' && confirm('Delete this device?')) {
                    await api('/admin/api/devices/' + id, { method: 'DELETE' });
                    await refreshAll();
                }
            } catch (error) {
                alert(error.message);
            }
        });

        refreshSession();
    </script>
</body>
</html>`;
}
