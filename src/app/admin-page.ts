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
            --bg: #080c12;
            --panel: #111821;
            --panel-2: #182232;
            --text: #f5f7fb;
            --muted: #99a4b8;
            --line: #2b3443;
            --accent: #69a7ff;
            --accent-strong: #2f88ff;
            --danger: #ff6b6b;
            --ok: #55d187;
            --warn: #ffd166;
            --shadow: 0 18px 45px rgba(0, 0, 0, .22);
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font: 14px/1.45 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: var(--text);
            background:
                radial-gradient(circle at 20% 0%, rgba(47,136,255,.16), transparent 34rem),
                linear-gradient(180deg, #0b111a 0, var(--bg) 18rem);
            min-height: 100vh;
        }
        header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 30px;
            border-bottom: 1px solid var(--line);
            background: rgba(9, 14, 21, .86);
            backdrop-filter: blur(12px);
            position: sticky;
            top: 0;
            z-index: 5;
        }
        main { padding: 28px 30px 46px; }
        h1, h2, h3 { margin: 0; letter-spacing: 0; }
        h1 { font-size: 22px; }
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
        .tab.active, button.primary { border-color: var(--accent); background: #15375d; }
        button:hover:not(:disabled) { border-color: #7baef2; transform: translateY(-1px); }
        button.danger { border-color: rgba(255,107,107,.72); color: #ffdede; }
        button:disabled { opacity: .45; cursor: not-allowed; }
        input, textarea, select {
            width: 100%;
            border: 1px solid var(--line);
            border-radius: 7px;
            background: #0f141c;
            color: var(--text);
            padding: 9px 10px;
        }
        input:focus, textarea:focus, select:focus {
            outline: 2px solid rgba(105,167,255,.22);
            border-color: var(--accent);
        }
        textarea { min-height: 70px; resize: vertical; }
        label { display: grid; gap: 6px; color: var(--muted); }
        .card {
            background: rgba(17,24,33,.92);
            border: 1px solid var(--line);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 16px;
            box-shadow: var(--shadow);
        }
        .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
        .details-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 18px; }
        .host-form { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; align-items: end; }
        .host-index {
            display: inline-flex;
            min-width: 62px;
            justify-content: center;
            border: 1px solid var(--line);
            border-radius: 999px;
            padding: 4px 9px;
            color: var(--muted);
            background: rgba(24,34,50,.76);
            font-size: 12px;
        }
        .device-playlists { display: grid; gap: 10px; min-width: 280px; }
        .device-playlist {
            border: 1px solid rgba(153,164,184,.22);
            border-radius: 7px;
            background: rgba(8,12,18,.42);
            padding: 9px 10px;
        }
        .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
        .summary {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 18px;
        }
        .metric {
            border: 1px solid var(--line);
            background: rgba(17, 24, 33, .78);
            border-radius: 8px;
            padding: 14px;
        }
        .metric span { color: var(--muted); font-size: 12px; display: block; }
        .metric strong { display: block; font-size: 24px; margin-top: 3px; }
        table { width: 100%; border-collapse: collapse; overflow: hidden; }
        th, td { border-bottom: 1px solid var(--line); padding: 11px 12px; text-align: left; vertical-align: top; }
        th { color: var(--muted); font-weight: 600; background: #111720; position: sticky; top: 0; }
        tr:hover td { background: rgba(105, 167, 255, .045); }
        .table-wrap { max-height: 56vh; overflow: auto; border: 1px solid var(--line); border-radius: 8px; }
        .muted { color: var(--muted); }
        .ok { color: var(--ok); }
        .bad { color: var(--danger); }
        .warn { color: var(--warn); }
        .mono { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; word-break: break-all; }
        .hidden { display: none !important; }
        .login {
            max-width: 420px;
            margin: 12vh auto;
        }
        .notice { min-height: 20px; color: var(--muted); margin: 10px 0; }
        .empty {
            color: var(--muted);
            padding: 24px;
            text-align: center;
        }
        .toast {
            position: fixed;
            right: 24px;
            bottom: 24px;
            z-index: 10;
            min-width: min(420px, calc(100vw - 48px));
            border: 1px solid var(--line);
            border-radius: 8px;
            background: #111821;
            color: var(--text);
            box-shadow: var(--shadow);
            padding: 13px 14px;
        }
        .toast.ok { border-color: rgba(85,209,135,.55); }
        .toast.bad { border-color: rgba(255,107,107,.62); }
        .toast strong { display: block; margin-bottom: 2px; }
        @media (max-width: 1000px) {
            .grid, .grid.two, .summary, .host-form { grid-template-columns: 1fr; }
            main { padding: 14px; }
            th, td { min-width: 140px; }
            header { padding: 16px 14px; }
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
            <div class="toolbar">
                <div class="tabs">
                    <button class="tab active" data-tab="codes">Provider Codes</button>
                    <button class="tab" data-tab="devices">Devices</button>
                </div>
                <button id="refreshButton">Refresh</button>
            </div>
            <div class="summary">
                <div class="metric"><span>Provider Codes</span><strong id="metricCodes">0</strong></div>
                <div class="metric"><span>Active Codes</span><strong id="metricActiveCodes">0</strong></div>
                <div class="metric"><span>Devices</span><strong id="metricDevices">0</strong></div>
                <div class="metric"><span>Blocked Devices</span><strong id="metricBlockedDevices">0</strong></div>
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
        const state = { codes: [], devices: [], selectedCodeId: null, hosts: [], codeDevices: [], busy: false };
        const $ = (selector) => document.querySelector(selector);
        const $$ = (selector) => Array.from(document.querySelectorAll(selector));
        const showToast = (title, message = '', tone = 'ok') => {
            document.querySelectorAll('.toast').forEach((toast) => toast.remove());
            const toast = document.createElement('div');
            toast.className = 'toast ' + tone;
            toast.innerHTML = '<strong>' + esc(title) + '</strong>' + (message ? '<span>' + esc(message) + '</span>' : '');
            document.body.appendChild(toast);
            window.setTimeout(() => toast.remove(), tone === 'bad' ? 5200 : 2600);
        };
        const setBusy = (busy) => {
            state.busy = busy;
            $$('button, input, textarea, select').forEach((el) => {
                if (el.id !== 'logoutButton') el.disabled = busy;
            });
            $('#sessionLabel').textContent = busy ? 'Working...' : ($('#appView').classList.contains('hidden') ? '' : 'Signed in');
        };
        const api = async (url, options = {}) => {
            try {
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
            } catch (error) {
                if (error instanceof TypeError) {
                    throw new Error('Network error. Check the Railway deployment and try again.');
                }
                throw error;
            }
        };
        const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[char]));
        const fmt = (value) => value ? new Date(value).toLocaleString() : '';
        const boolText = (ok) => ok ? '<span class="ok">Active</span>' : '<span class="bad">Blocked</span>';
        const formData = (form) => Object.fromEntries(new FormData(form).entries());
        const isoOrNull = (value) => value ? new Date(value).toISOString() : null;
        const empty = (message) => '<div class="empty">' + esc(message) + '</div>';

        function updateMetrics() {
            $('#metricCodes').textContent = state.codes.length;
            $('#metricActiveCodes').textContent = state.codes.filter((code) => code.is_active && !code.is_blocked).length;
            $('#metricDevices').textContent = state.devices.length;
            $('#metricBlockedDevices').textContent = state.devices.filter((device) => device.is_blocked).length;
        }

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
            updateMetrics();
            renderCodes();
            renderDevices();
            if (state.selectedCodeId) await loadCodeDetails(state.selectedCodeId);
        }

        function renderCodes() {
            if (state.codes.length === 0) {
                $('#codesTable').innerHTML = empty('No provider codes yet. Create code 557, then add one or more hidden Xtream hosts.');
                return;
            }
            $('#codesTable').innerHTML = '<table><thead><tr><th>Code</th><th>Store</th><th>Expires</th><th>Devices</th><th>Notes</th><th>Actions</th></tr></thead><tbody>' +
                state.codes.map((code) => '<tr>' +
                    '<td class="mono">' + esc(code.code) + '</td>' +
                    '<td>' + esc(code.store_name) + '</td>' +
                    '<td>' + esc(fmt(code.expires_at)) + '</td>' +
                    '<td>' + esc(code.device_count ?? 0) + '</td>' +
                    '<td>' + esc(code.notes || '') + '</td>' +
                    '<td class="actions">' +
                        '<button data-action="details" data-id="' + esc(code.id) + '">Details</button>' +
                        '<button class="danger" data-action="delete-code" data-id="' + esc(code.id) + '">Delete</button>' +
                    '</td>' +
                '</tr>').join('') + '</tbody></table>';
        }

        function renderDevices(target = '#devicesTable', items = state.devices) {
            if (items.length === 0) {
                $(target).innerHTML = empty('No devices have logged in yet.');
                return;
            }
            $(target).innerHTML = '<table><thead><tr><th>Playlists</th><th>Device Key</th><th>MAC</th><th>Install ID</th><th>Version</th><th>IP</th><th>Last Seen</th><th>Status</th><th>Actions</th></tr></thead><tbody>' +
                items.map((device) => '<tr>' +
                    '<td>' + renderDevicePlaylists(device) + '</td>' +
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

        function renderDevicePlaylists(device) {
            const playlists = Array.isArray(device.playlists) && device.playlists.length
                ? device.playlists
                : [{
                    provider_code: device.provider_code,
                    store_name: device.store_name,
                    username: device.username,
                    password: device.password,
                    resolved_host_used: device.resolved_host_used
                }];
            return '<div class="device-playlists">' + playlists.map((playlist) =>
                '<div class="device-playlist">' +
                    '<strong class="mono">' + esc(playlist.provider_code || '') + '</strong>' +
                    (playlist.store_name ? ' <span class="muted">' + esc(playlist.store_name) + '</span>' : '') +
                    '<div class="mono">User: ' + esc(playlist.username || '') + '</div>' +
                    '<div class="mono">Pass: ' + esc(playlist.password || '') + '</div>' +
                    '<div class="mono muted">' + esc(playlist.resolved_host_used || '') + '</div>' +
                '</div>'
            ).join('') + '</div>';
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
                '<div class="details-head">' +
                    '<div><h2>Provider Code ' + esc(code?.code || '') + '</h2>' +
                    '<div class="muted">Store: ' + esc(code?.store_name || '') + '</div></div>' +
                    '<button data-action="close-details">Close</button>' +
                '</div>' +
                '<h3>Add Host</h3>' +
                '<form id="hostForm" class="host-form">' +
                    '<label>Host URL<input name="host_url" placeholder="https://host.com" required></label>' +
                    '<div class="actions"><button class="primary" type="submit">+ Add Host</button></div>' +
                '</form>' +
                '<h3>Hosts</h3><div class="table-wrap" id="hostsTable"></div>' +
                '<h3>Connected Devices</h3><div class="table-wrap" id="codeDevicesTable"></div>';
            renderHosts();
            renderDevices('#codeDevicesTable', state.codeDevices);
        }

        function renderHosts() {
            if (state.hosts.length === 0) {
                $('#hostsTable').innerHTML = empty('No hosts for this provider code yet.');
                return;
            }
            $('#hostsTable').innerHTML = '<table><thead><tr><th>Order</th><th>Host URL</th><th>Actions</th></tr></thead><tbody>' +
                state.hosts.map((host, index) => '<tr>' +
                    '<td><span class="host-index">Host ' + esc(index + 1) + '</span></td>' +
                    '<td class="mono">' + esc(host.host_url) + '</td>' +
                    '<td class="actions">' +
                        '<button class="danger" data-action="delete-host" data-id="' + esc(host.id) + '">Delete</button>' +
                    '</td>' +
                '</tr>').join('') + '</tbody></table>';
        }

        document.addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.target;
            if (state.busy) return;
            const submittedData = formData(form);
            setBusy(true);
            try {
                if (form.id === 'loginForm') {
                    await api('/admin/api/login', { method: 'POST', body: JSON.stringify(submittedData) });
                    form.reset();
                    await refreshSession();
                    showToast('Signed in');
                }
                if (form.id === 'codeForm') {
                    const data = { ...submittedData };
                    data.expires_at = isoOrNull(data.expires_at);
                    await api('/admin/api/provider-codes', { method: 'POST', body: JSON.stringify(data) });
                    form.reset();
                    await refreshAll();
                    showToast('Provider code created');
                }
                if (form.id === 'editCodeForm') {
                    const data = { ...submittedData };
                    data.expires_at = isoOrNull(data.expires_at);
                    data.is_active = data.is_active === 'true';
                    data.is_blocked = data.is_blocked === 'true';
                    await api('/admin/api/provider-codes/' + state.selectedCodeId, { method: 'PATCH', body: JSON.stringify(data) });
                    await refreshAll();
                    showToast('Provider code saved');
                }
                if (form.id === 'hostForm') {
                    const data = { ...submittedData };
                    data.priority = state.hosts.length + 1;
                    await api('/admin/api/provider-codes/' + state.selectedCodeId + '/hosts', { method: 'POST', body: JSON.stringify(data) });
                    form.reset();
                    await loadCodeDetails(state.selectedCodeId);
                    showToast('Host added');
                }
            } catch (error) {
                $('#loginNotice').textContent = error.message;
                showToast('Action failed', error.message, 'bad');
            } finally {
                setBusy(false);
            }
        });

        document.addEventListener('click', async (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            if (state.busy && button.id !== 'logoutButton') return;
            const action = button.dataset.action;
            const id = button.dataset.id;
            try {
                if (button.dataset.tab) {
                    document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab === button));
                    $('#codesTab').classList.toggle('hidden', button.dataset.tab !== 'codes');
                    $('#devicesTab').classList.toggle('hidden', button.dataset.tab !== 'devices');
                }
                if (button.id === 'refreshButton') {
                    setBusy(true);
                    await refreshAll();
                    showToast('Dashboard refreshed');
                    return;
                }
                if (button.id === 'logoutButton') {
                    setBusy(true);
                    await api('/admin/api/logout', { method: 'POST', body: '{}' });
                    await refreshSession();
                    showToast('Signed out');
                    return;
                }
                if (!action) return;
                setBusy(true);
                if (action === 'details') await loadCodeDetails(id);
                if (action === 'close-details') {
                    state.selectedCodeId = null;
                    $('#codeDetails').classList.add('hidden');
                    return;
                }
                if (action === 'toggle-code') {
                    const code = state.codes.find((item) => item.id === id);
                    await api('/admin/api/provider-codes/' + id, { method: 'PATCH', body: JSON.stringify({ is_blocked: !code.is_blocked }) });
                    await refreshAll();
                    showToast(code.is_blocked ? 'Provider code unblocked' : 'Provider code blocked');
                }
                if (action === 'delete-code' && confirm('Delete this provider code and its hosts?')) {
                    await api('/admin/api/provider-codes/' + id, { method: 'DELETE' });
                    state.selectedCodeId = null;
                    $('#codeDetails').classList.add('hidden');
                    await refreshAll();
                    showToast('Provider code deleted');
                }
                if (action === 'delete-host' && confirm('Delete this host?')) {
                    await api('/admin/api/hosts/' + id, { method: 'DELETE' });
                    await loadCodeDetails(state.selectedCodeId);
                    showToast('Host deleted');
                }
                if (action === 'toggle-device') {
                    const device = state.devices.concat(state.codeDevices).find((item) => item.id === id);
                    await api('/admin/api/devices/' + id, { method: 'PATCH', body: JSON.stringify({ is_blocked: !device.is_blocked }) });
                    await refreshAll();
                    showToast(device.is_blocked ? 'Device unblocked' : 'Device blocked');
                }
                if (action === 'delete-device' && confirm('Delete this device?')) {
                    await api('/admin/api/devices/' + id, { method: 'DELETE' });
                    await refreshAll();
                    showToast('Device deleted');
                }
            } catch (error) {
                showToast('Action failed', error.message, 'bad');
            } finally {
                setBusy(false);
            }
        });

        refreshSession().catch((error) => showToast('Could not load admin panel', error.message, 'bad'));
    </script>
</body>
</html>`;
}
