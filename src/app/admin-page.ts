export function renderAdminPage(): string {
    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#080c12">
    <meta name="apple-mobile-web-app-capable" content="yes">
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
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body {
            margin: 0;
            font: 14px/1.45 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: var(--text);
            background:
                radial-gradient(circle at 20% 0%, rgba(47,136,255,.16), transparent 34rem),
                linear-gradient(180deg, #0b111a 0, var(--bg) 18rem);
            min-height: 100vh;
            padding-bottom: env(safe-area-inset-bottom);
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
        .header-subtitle { color: var(--muted); font-size: 13px; margin-top: 4px; }
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
            touch-action: manipulation;
        }
        .tab.active, button.primary { border-color: var(--accent); background: #15375d; }
        @media (hover: hover) {
            button:hover:not(:disabled) { border-color: #7baef2; transform: translateY(-1px); }
        }
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
            padding: 10px 11px;
        }
        .device-playlist-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 8px;
        }
        .playlist-index {
            font-size: 11px;
            color: var(--muted);
            border: 1px solid var(--line);
            border-radius: 999px;
            padding: 2px 8px;
            white-space: nowrap;
        }
        .playlist-field {
            display: grid;
            grid-template-columns: 52px minmax(0, 1fr);
            gap: 8px;
            align-items: start;
            margin-top: 4px;
            font-size: 13px;
        }
        .playlist-field span:first-child { color: var(--muted); }
        .playlist-count {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 8px;
            font-size: 12px;
            color: var(--muted);
        }
        .badge {
            display: inline-flex;
            align-items: center;
            border-radius: 999px;
            padding: 3px 9px;
            font-size: 12px;
            border: 1px solid var(--line);
            background: rgba(24,34,50,.76);
        }
        .badge.ok { color: var(--ok); border-color: rgba(85,209,135,.45); }
        .badge.bad { color: var(--danger); border-color: rgba(255,107,107,.45); }
        .badge.warn { color: var(--warn); border-color: rgba(255,209,102,.45); }
        .search-box {
            max-width: 320px;
            margin-bottom: 14px;
        }
        .filter-row {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 14px;
        }
        .field-copy {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            justify-content: space-between;
        }
        .field-copy .mono { flex: 1; min-width: 0; }
        .copy-btn {
            padding: 4px 8px;
            font-size: 12px;
            white-space: nowrap;
            flex-shrink: 0;
        }
        .host-actions { display: flex; flex-wrap: wrap; gap: 6px; }
        .settings-form { max-width: 520px; }
        .settings-divider {
            border: 0;
            border-top: 1px solid var(--line);
            margin: 22px 0;
        }
        .device-list-mobile { display: none; gap: 12px; }
        .device-card {
            border: 1px solid var(--line);
            border-radius: 8px;
            background: rgba(8,12,18,.55);
            padding: 14px;
        }
        .device-card-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 10px;
        }
        .device-card-meta {
            display: grid;
            gap: 8px;
            margin: 12px 0;
            font-size: 13px;
        }
        .device-card-meta-row {
            display: grid;
            grid-template-columns: 72px minmax(0, 1fr);
            gap: 8px;
            align-items: start;
        }
        .device-card-meta-row > span:first-child { color: var(--muted); }
        .table-scroll-hint {
            display: none;
            color: var(--muted);
            font-size: 12px;
            margin: 0 0 8px;
        }
        .filter-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: end;
            margin-bottom: 14px;
        }
        #appNotice {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
        }
        #dismissNotice {
            padding: 2px 8px;
            min-height: auto;
            flex-shrink: 0;
        }
        .loading-bar {
            height: 3px;
            background: rgba(105,167,255,.15);
            border-radius: 999px;
            overflow: hidden;
            margin-bottom: 14px;
        }
        .loading-bar.active::after {
            content: '';
            display: block;
            height: 100%;
            width: 35%;
            background: linear-gradient(90deg, transparent, var(--accent), transparent);
            animation: loading-slide 1.1s ease-in-out infinite;
        }
        @keyframes loading-slide {
            from { transform: translateX(-120%); }
            to { transform: translateX(320%); }
        }
        .app-notice-wrap {
            min-height: 20px;
            margin-bottom: 12px;
            padding: 10px 12px;
            border-radius: 7px;
            border: 1px solid var(--line);
            background: rgba(24,34,50,.5);
            color: var(--muted);
        }
        .app-notice-wrap.bad {
            color: #ffdede;
            border-color: rgba(255,107,107,.45);
            background: rgba(80, 24, 24, .28);
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
        .desktop-only { display: block; }
        .mobile-only { display: none; }
        @media (max-width: 768px) {
            .grid, .grid.two, .summary, .host-form, .filter-row { grid-template-columns: 1fr; }
            .summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            main { padding: 12px 12px calc(24px + env(safe-area-inset-bottom)); }
            header { padding: 14px 12px; flex-direction: column; align-items: stretch; gap: 10px; }
            .header-subtitle { font-size: 12px; line-height: 1.35; }
            .toolbar { flex-direction: column; align-items: stretch; }
            .tabs {
                overflow-x: auto;
                flex-wrap: nowrap;
                -webkit-overflow-scrolling: touch;
                scrollbar-width: none;
                margin-bottom: 0;
            }
            .tabs::-webkit-scrollbar { display: none; }
            .tab { flex: 0 0 auto; min-height: 44px; }
            #refreshButton { width: 100%; min-height: 44px; }
            button, .tab { min-height: 44px; }
            input, select, textarea { font-size: 16px; }
            .card { padding: 16px; }
            .settings-form { max-width: none; }
            .device-playlists { min-width: 0; }
            .details-head { flex-direction: column; align-items: stretch; }
            .copy-btn { min-height: 40px; padding: 8px 12px; }
            .playlist-field { grid-template-columns: 1fr; gap: 4px; }
            .field-copy { flex-direction: column; align-items: stretch; }
            .host-actions button { flex: 1 1 calc(50% - 6px); min-height: 44px; }
            .toast {
                left: 12px;
                right: 12px;
                bottom: calc(12px + env(safe-area-inset-bottom));
                min-width: 0;
            }
            .table-scroll-hint { display: block; }
            .desktop-only { display: none !important; }
            .mobile-only { display: grid !important; }
            .filter-actions { flex-direction: column; align-items: stretch; }
            .filter-actions button { width: 100%; min-height: 44px; }
            th, td { min-width: 120px; }
        }
        @media (max-width: 1000px) and (min-width: 769px) {
            .grid, .grid.two, .summary, .host-form, .filter-row { grid-template-columns: 1fr; }
            main { padding: 14px; }
            th, td { min-width: 140px; }
            header { padding: 16px 14px; }
        }
    </style>
</head>
<body>
    <header>
        <div>
            <h1>Apex Provider Admin</h1>
            <div class="header-subtitle">Manage provider codes, hidden hosts, and connected devices</div>
        </div>
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
            <div id="loadingBar" class="loading-bar hidden"></div>
            <div id="appNotice" class="app-notice-wrap hidden">
                <span id="appNoticeText"></span>
                <button type="button" id="dismissNotice" aria-label="Dismiss notice">×</button>
            </div>
            <div class="toolbar">
                <div class="tabs">
                    <button class="tab active" data-tab="codes">Provider Codes</button>
                    <button class="tab" data-tab="devices">Devices <span id="devicesTabCount" class="badge">0</span></button>
                    <button class="tab" data-tab="settings">Settings</button>
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
                    <p class="muted" style="margin:0 0 12px">One row per physical device. Multiple playlists on the same install are grouped together.</p>
                    <div class="filter-row">
                        <label>Search
                            <input id="deviceSearch" type="search" placeholder="Code, username, MAC, install ID..." enterkeyhint="search">
                        </label>
                        <label>Status
                            <select id="deviceFilterStatus">
                                <option value="all">All devices</option>
                                <option value="active">Active only</option>
                                <option value="blocked">Blocked only</option>
                            </select>
                        </label>
                        <label>Provider code
                            <select id="deviceFilterCode">
                                <option value="">All codes</option>
                            </select>
                        </label>
                    </div>
                    <div class="filter-actions">
                        <button type="button" id="clearDeviceFilters">Clear filters</button>
                    </div>
                    <div id="devicesFilterSummary" class="muted" style="margin-bottom:10px"></div>
                    <p class="table-scroll-hint">Swipe sideways to see more table columns.</p>
                    <div id="devicesTable" class="table-wrap desktop-only"></div>
                    <div id="devicesCards" class="device-list-mobile mobile-only"></div>
                </div>
            </section>
            <section id="settingsTab" class="hidden">
                <div class="card settings-form">
                    <h2>Account Settings</h2>
                    <p class="muted" style="margin:0 0 14px">Signed in as <strong id="settingsUsername">admin</strong>. Account changes are stored in the database.</p>
                    <h3>Change Username</h3>
                    <form id="changeUsernameForm" class="grid two">
                        <label>New username<input name="new_username" autocomplete="username" pattern="[A-Za-z0-9_.-]+" title="Letters, numbers, dots, underscores, and hyphens only" required></label>
                        <label>Current password<input name="current_password" type="password" autocomplete="current-password" required></label>
                        <div class="actions"><button class="primary" type="submit">Update username</button></div>
                    </form>
                    <hr class="settings-divider">
                    <h3>Change Password</h3>
                    <form id="changePasswordForm" class="grid two">
                        <label>Current password<input name="current_password" type="password" autocomplete="current-password" required></label>
                        <label>New password<input name="new_password" type="password" autocomplete="new-password" minlength="8" required></label>
                        <label>Confirm new password<input name="confirm_password" type="password" autocomplete="new-password" minlength="8" required></label>
                        <div class="actions"><button class="primary" type="submit">Update password</button></div>
                    </form>
                </div>
            </section>
        </section>
    </main>
    <script>
        const state = {
            codes: [],
            devices: [],
            selectedCodeId: null,
            hosts: [],
            codeDevices: [],
            busy: false,
            deviceSearch: '',
            deviceFilterStatus: 'all',
            deviceFilterCode: '',
            adminUsername: 'admin'
        };
        const $ = (selector) => document.querySelector(selector);
        const $$ = (selector) => Array.from(document.querySelectorAll(selector));
        const showToast = (title, message = '', tone = 'ok') => {
            document.querySelectorAll('.toast').forEach((toast) => toast.remove());
            const toast = document.createElement('div');
            toast.className = 'toast ' + tone;
            toast.innerHTML = '<strong>' + esc(title) + '</strong>' + (message ? '<div class="muted" style="margin-top:4px">' + esc(message) + '</div>' : '');
            document.body.appendChild(toast);
            window.setTimeout(() => toast.remove(), tone === 'bad' ? 6200 : 2800);
        };
        const setAppNotice = (message = '', tone = '') => {
            const notice = $('#appNotice');
            const noticeText = $('#appNoticeText');
            if (!notice || !noticeText) return;
            if (!message) {
                noticeText.textContent = '';
                notice.className = 'app-notice-wrap hidden';
                return;
            }
            noticeText.textContent = message;
            notice.className = 'app-notice-wrap' + (tone === 'bad' ? ' bad' : '');
            notice.classList.remove('hidden');
        };
        const ensureOnline = () => {
            if (!navigator.onLine) {
                throw new Error('You appear to be offline. Check your connection and try again.');
            }
        };
        const setLoading = (loading) => {
            $('#loadingBar')?.classList.toggle('active', loading);
            $('#loadingBar')?.classList.toggle('hidden', !loading);
        };
        const handleSessionExpired = () => {
            state.codes = [];
            state.devices = [];
            state.selectedCodeId = null;
            state.hosts = [];
            state.codeDevices = [];
            $('#loginView')?.classList.remove('hidden');
            $('#appView')?.classList.add('hidden');
            $('#logoutButton')?.classList.add('hidden');
            $('#sessionLabel').textContent = '';
            $('#codeDetails')?.classList.add('hidden');
            setAppNotice('');
            showToast('Session expired', 'Please sign in again.', 'bad');
        };
        const setBusy = (busy) => {
            state.busy = busy;
            setLoading(busy);
            $$('button, input, textarea, select').forEach((el) => {
                if (el.id !== 'logoutButton') el.disabled = busy;
            });
            $('#sessionLabel').textContent = busy ? 'Working...' : ($('#appView').classList.contains('hidden') ? '' : 'Signed in');
        };
        const apiErrorMessage = (status, data) => {
            if (status === 401) return 'Your session expired or credentials are invalid.';
            if (status === 404) return data?.error || 'The requested item was not found.';
            if (status === 409) return data?.error || 'This record already exists.';
            if (status === 400) return data?.error || 'Invalid request. Check your input and try again.';
            if (status >= 500) return data?.error || 'Server error. Try again in a moment.';
            return data?.error || 'Request failed (' + status + ').';
        };
        const api = async (url, options = {}) => {
            try {
                ensureOnline();
                const response = await fetch(url, {
                    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
                    credentials: 'same-origin',
                    ...options
                });
                const data = await response.json().catch(() => ({}));
                if (response.status === 401 && !String(url).includes('/admin/api/login')) {
                    handleSessionExpired();
                    throw new Error(apiErrorMessage(401, data));
                }
                if (!response.ok) {
                    throw new Error(apiErrorMessage(response.status, data));
                }
                return data;
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
        const datetimeLocalValue = (value) => {
            if (!value) return '';
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '';
            const pad = (part) => String(part).padStart(2, '0');
            return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
                'T' + pad(date.getHours()) + ':' + pad(date.getMinutes());
        };
        const empty = (message) => '<div class="empty">' + esc(message) + '</div>';
        const copyText = async (value, label) => {
            const text = String(value ?? '').trim();
            if (!text) {
                showToast('Nothing to copy', '', 'bad');
                return;
            }
            const copiedLabel = label ? label + ' copied to clipboard' : 'Value copied to clipboard';
            try {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(text);
                    showToast('Copied', copiedLabel);
                    return;
                }
                throw new Error('Clipboard API unavailable');
            } catch {
                try {
                    const area = document.createElement('textarea');
                    area.value = text;
                    area.setAttribute('readonly', '');
                    area.style.position = 'fixed';
                    area.style.left = '-9999px';
                    document.body.appendChild(area);
                    area.select();
                    const ok = document.execCommand('copy');
                    area.remove();
                    if (ok) {
                        showToast('Copied', copiedLabel);
                        return;
                    }
                } catch {
                    // fall through
                }
                showToast('Copy failed', 'Copy manually or try again in your browser.', 'bad');
            }
        };
        const shortId = (value, size = 14) => {
            const text = String(value ?? '');
            if (!text) return '';
            if (text.length <= size) return text;
            return text.slice(0, size) + '…';
        };
        const getDevicePlaylists = (device) => (
            Array.isArray(device.playlists) && device.playlists.length
                ? device.playlists
                : [{
                    provider_code: device.provider_code,
                    store_name: device.store_name,
                    username: device.username,
                    password: device.password,
                    resolved_host_used: device.resolved_host_used,
                    last_seen_at: device.last_seen_at
                }]
        );
        const deviceMatchesSearch = (device, query) => {
            if (!query) return true;
            const haystack = [
                device.device_key,
                device.mac_address,
                device.app_installation_id,
                device.ip_address,
                device.app_version,
                ...getDevicePlaylists(device).flatMap((playlist) => [
                    playlist.provider_code,
                    playlist.store_name,
                    playlist.username,
                    playlist.resolved_host_used
                ])
            ].join(' ').toLowerCase();
            return haystack.includes(query.toLowerCase());
        };
        const deviceMatchesFilters = (device) => {
            if (state.deviceFilterStatus === 'active' && device.is_blocked) return false;
            if (state.deviceFilterStatus === 'blocked' && !device.is_blocked) return false;
            if (state.deviceFilterCode) {
                const hasCode = getDevicePlaylists(device).some(
                    (playlist) => playlist.provider_code === state.deviceFilterCode
                );
                if (!hasCode) return false;
            }
            return deviceMatchesSearch(device, state.deviceSearch);
        };
        const codeStatusBadge = (code) => {
            const expired = code.expires_at && Date.parse(code.expires_at) <= Date.now();
            if (code.is_blocked) return '<span class="badge bad">Blocked</span>';
            if (!code.is_active) return '<span class="badge warn">Inactive</span>';
            if (expired) return '<span class="badge warn">Expired</span>';
            return '<span class="badge ok">Active</span>';
        };
        const playlistField = (label, value, copyLabel) => {
            if (!value) {
                return '<div class="playlist-field"><span>' + esc(label) + '</span><span class="mono">—</span></div>';
            }
            return '<div class="playlist-field"><span>' + esc(label) + '</span><span class="field-copy">' +
                '<span class="mono">' + esc(value) + '</span>' +
                '<button type="button" class="copy-btn" data-action="copy" data-copy="' + esc(value) + '" data-copy-label="' + esc(copyLabel || label) + '">Copy</button>' +
            '</span></div>';
        };
        const copyCell = (value, label) => {
            if (!value) return '<span class="mono">—</span>';
            return '<span class="field-copy"><span class="mono" title="' + esc(value) + '">' + esc(shortId(value, 18)) + '</span>' +
                '<button type="button" class="copy-btn" data-action="copy" data-copy="' + esc(value) + '" data-copy-label="' + esc(label) + '">Copy</button></span>';
        };

        function renderDeviceFilterOptions() {
            const select = $('#deviceFilterCode');
            if (!select) return;
            const current = state.deviceFilterCode;
            const codes = [...new Set(state.codes.map((code) => code.code))].sort();
            select.innerHTML = '<option value="">All codes</option>' +
                codes.map((code) => '<option value="' + esc(code) + '"' + (code === current ? ' selected' : '') + '>' + esc(code) + '</option>').join('');
        }

        function updateDeviceFilterSummary(shown, total) {
            const summary = $('#devicesFilterSummary');
            if (!summary) return;
            if (total === 0) {
                summary.textContent = '';
                return;
            }
            summary.textContent = shown === total
                ? 'Showing all ' + total + ' device(s).'
                : 'Showing ' + shown + ' of ' + total + ' device(s).';
        }

        function clearDeviceFilters() {
            state.deviceSearch = '';
            state.deviceFilterStatus = 'all';
            state.deviceFilterCode = '';
            const search = $('#deviceSearch');
            const status = $('#deviceFilterStatus');
            const code = $('#deviceFilterCode');
            if (search) search.value = '';
            if (status) status.value = 'all';
            if (code) code.value = '';
            renderDevices();
        }

        function renderDeviceCard(device) {
            return '<article class="device-card">' +
                '<div class="device-card-head">' + boolText(!device.is_blocked) +
                    '<span class="muted">' + esc(fmt(device.last_seen_at) || 'Never seen') + '</span>' +
                '</div>' +
                renderDevicePlaylists(device) +
                '<div class="device-card-meta">' +
                    '<div class="device-card-meta-row"><span>Device</span><span>' + copyCell(device.device_key, 'Device key') + '</span></div>' +
                    '<div class="device-card-meta-row"><span>MAC</span><span>' + copyCell(device.mac_address, 'MAC address') + '</span></div>' +
                    '<div class="device-card-meta-row"><span>Install</span><span>' + copyCell(device.app_installation_id, 'Install ID') + '</span></div>' +
                    '<div class="device-card-meta-row"><span>Version</span><span class="mono">' + esc(device.app_version || '—') + '</span></div>' +
                    '<div class="device-card-meta-row"><span>IP</span><span class="mono">' + esc(device.ip_address || '—') + '</span></div>' +
                '</div>' +
                '<div class="actions">' +
                    '<button data-action="toggle-device" data-id="' + esc(device.id) + '">' + (device.is_blocked ? 'Unblock' : 'Block') + '</button>' +
                    '<button class="danger" data-action="delete-device" data-id="' + esc(device.id) + '">Delete</button>' +
                '</div>' +
            '</article>';
        }

        function updateMetrics() {
            $('#metricCodes').textContent = state.codes.length;
            $('#metricActiveCodes').textContent = state.codes.filter((code) => code.is_active && !code.is_blocked).length;
            $('#metricDevices').textContent = state.devices.length;
            $('#metricBlockedDevices').textContent = state.devices.filter((device) => device.is_blocked).length;
            $('#devicesTabCount').textContent = state.devices.length;
        }

        async function refreshSession() {
            try {
                const session = await api('/admin/api/session').catch(() => ({ authenticated: false }));
                $('#loginView').classList.toggle('hidden', session.authenticated);
                $('#appView').classList.toggle('hidden', !session.authenticated);
                $('#logoutButton').classList.toggle('hidden', !session.authenticated);
                $('#sessionLabel').textContent = session.authenticated ? 'Signed in' : '';
                if (session.username) {
                    state.adminUsername = session.username;
                    const settingsUser = $('#settingsUsername');
                    if (settingsUser) settingsUser.textContent = session.username;
                }
                if (session.authenticated) {
                    await refreshAll();
                }
            } catch (error) {
                showToast('Could not verify session', error.message, 'bad');
            }
        }

        async function refreshAll() {
            try {
                setAppNotice('');
                const [codes, devices] = await Promise.all([
                    api('/admin/api/provider-codes'),
                    api('/admin/api/devices')
                ]);
                state.codes = codes.items || [];
                state.devices = devices.items || [];
                updateMetrics();
                renderDeviceFilterOptions();
                renderCodes();
                renderDevices();
                if (state.selectedCodeId) await loadCodeDetails(state.selectedCodeId);
            } catch (error) {
                setAppNotice(error.message, 'bad');
                throw error;
            }
        }

        function renderCodes() {
            if (state.codes.length === 0) {
                $('#codesTable').innerHTML = empty('No provider codes yet. Create code 557, then add one or more hidden Xtream hosts.');
                return;
            }
            $('#codesTable').innerHTML = '<table><thead><tr><th>Code</th><th>Store</th><th>Status</th><th>Expires</th><th>Devices</th><th>Notes</th><th>Actions</th></tr></thead><tbody>' +
                state.codes.map((code) => '<tr>' +
                    '<td class="mono">' + esc(code.code) + '</td>' +
                    '<td>' + esc(code.store_name) + '</td>' +
                    '<td>' + codeStatusBadge(code) + '</td>' +
                    '<td>' + esc(fmt(code.expires_at) || '—') + '</td>' +
                    '<td>' + esc(code.device_count ?? 0) + '</td>' +
                    '<td>' + esc(code.notes || '—') + '</td>' +
                    '<td class="actions">' +
                        '<button data-action="details" data-id="' + esc(code.id) + '">Details</button>' +
                        '<button class="danger" data-action="delete-code" data-id="' + esc(code.id) + '">Delete</button>' +
                    '</td>' +
                '</tr>').join('') + '</tbody></table>';
        }

        function renderDevices(target = '#devicesTable', items = state.devices) {
            const filtered = items.filter((device) => deviceMatchesFilters(device));
            const isMainList = target === '#devicesTable';
            if (isMainList) {
                updateDeviceFilterSummary(filtered.length, items.length);
            }
            if (items.length === 0) {
                const message = empty('No devices have logged in yet.');
                $(target).innerHTML = message;
                if (isMainList) $('#devicesCards').innerHTML = message;
                return;
            }
            if (filtered.length === 0) {
                const message = empty('No devices match the current filters.');
                $(target).innerHTML = message;
                if (isMainList) $('#devicesCards').innerHTML = message;
                return;
            }
            $(target).innerHTML = '<table><thead><tr><th>Playlists</th><th>Device Key</th><th>MAC</th><th>Install ID</th><th>Version</th><th>IP</th><th>Last Seen</th><th>Status</th><th>Actions</th></tr></thead><tbody>' +
                filtered.map((device) => '<tr>' +
                    '<td>' + renderDevicePlaylists(device) + '</td>' +
                    '<td>' + copyCell(device.device_key, 'Device key') + '</td>' +
                    '<td>' + copyCell(device.mac_address, 'MAC address') + '</td>' +
                    '<td>' + copyCell(device.app_installation_id, 'Install ID') + '</td>' +
                    '<td>' + esc(device.app_version || '—') + '</td>' +
                    '<td>' + esc(device.ip_address || '—') + '</td>' +
                    '<td>' + esc(fmt(device.last_seen_at) || '—') + '</td>' +
                    '<td>' + boolText(!device.is_blocked) + '</td>' +
                    '<td class="actions">' +
                        '<button data-action="toggle-device" data-id="' + esc(device.id) + '">' + (device.is_blocked ? 'Unblock' : 'Block') + '</button>' +
                        '<button class="danger" data-action="delete-device" data-id="' + esc(device.id) + '">Delete</button>' +
                    '</td>' +
                '</tr>').join('') + '</tbody></table>';
            if (isMainList) {
                $('#devicesCards').innerHTML = filtered.map((device) => renderDeviceCard(device)).join('');
            }
        }

        function renderDevicePlaylists(device) {
            const playlists = getDevicePlaylists(device);
            const countLabel = playlists.length === 1 ? '1 playlist' : playlists.length + ' playlists';
            return '<div class="playlist-count"><span class="badge">' + esc(countLabel) + '</span></div>' +
                '<div class="device-playlists">' + playlists.map((playlist, index) =>
                '<div class="device-playlist">' +
                    '<div class="device-playlist-head">' +
                        '<div><strong class="mono">' + esc(playlist.provider_code || '') + '</strong>' +
                        (playlist.store_name ? ' <span class="muted">' + esc(playlist.store_name) + '</span>' : '') +
                        '</div>' +
                        '<span class="playlist-index">#' + esc(index + 1) + '</span>' +
                    '</div>' +
                    playlistField('User', playlist.username, 'Username') +
                    playlistField('Pass', playlist.password, 'Password') +
                    playlistField('Host', playlist.resolved_host_used, 'Host URL') +
                    (playlist.last_seen_at ? '<div class="muted" style="margin-top:6px;font-size:12px">Last seen ' + esc(fmt(playlist.last_seen_at)) + '</div>' : '') +
                '</div>'
            ).join('') + '</div>';
        }

        async function loadCodeDetails(id) {
            try {
                state.selectedCodeId = id;
                const code = state.codes.find((item) => item.id === id);
                if (!code) {
                    throw new Error('Provider code not found in the current list.');
                }
                const [hosts, devices] = await Promise.all([
                    api('/admin/api/provider-codes/' + id + '/hosts'),
                    api('/admin/api/provider-codes/' + id + '/devices')
                ]);
                state.hosts = hosts.items || [];
                state.codeDevices = devices.items || [];
                $('#codeDetails').classList.remove('hidden');
                $('#codeDetails').innerHTML =
                    '<div class="details-head">' +
                        '<div><h2>Provider Code ' + esc(code.code) + '</h2>' +
                        '<div class="muted">Code: <span class="mono">' + esc(code.code) + '</span> · ' + codeStatusBadge(code) + '</div></div>' +
                        '<button data-action="close-details">Close</button>' +
                    '</div>' +
                    '<h3>Edit Provider Code</h3>' +
                    '<form id="editCodeForm" class="grid two">' +
                        '<label>Store Name<input name="store_name" value="' + esc(code.store_name) + '" required></label>' +
                        '<label>Expires At<input name="expires_at" type="datetime-local" value="' + esc(datetimeLocalValue(code.expires_at)) + '"></label>' +
                        '<label>Status<select name="is_active">' +
                            '<option value="true"' + (code.is_active ? ' selected' : '') + '>Active</option>' +
                            '<option value="false"' + (!code.is_active ? ' selected' : '') + '>Inactive</option>' +
                        '</select></label>' +
                        '<label>Blocked<select name="is_blocked">' +
                            '<option value="false"' + (!code.is_blocked ? ' selected' : '') + '>Not blocked</option>' +
                            '<option value="true"' + (code.is_blocked ? ' selected' : '') + '>Blocked</option>' +
                        '</select></label>' +
                        '<label style="grid-column:1/-1">Notes<textarea name="notes">' + esc(code.notes || '') + '</textarea></label>' +
                        '<div class="actions"><button class="primary" type="submit">Save changes</button></div>' +
                    '</form>' +
                    '<h3>Add Host</h3>' +
                    '<form id="hostForm" class="host-form">' +
                        '<label>Host URL<input name="host_url" type="url" placeholder="https://host.example.com" required></label>' +
                        '<div class="actions"><button class="primary" type="submit">+ Add Host</button></div>' +
                    '</form>' +
                    '<h3>Hosts (' + esc(state.hosts.length) + ')</h3><div class="table-wrap" id="hostsTable"></div>' +
                    '<h3>Connected Devices (' + esc(state.codeDevices.length) + ')</h3><div class="table-wrap" id="codeDevicesTable"></div>';
                renderHosts();
                renderDevices('#codeDevicesTable', state.codeDevices);
                $('#codeDetails').scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (error) {
                state.selectedCodeId = null;
                $('#codeDetails').classList.add('hidden');
                throw error;
            }
        }

        function renderHosts() {
            if (state.hosts.length === 0) {
                $('#hostsTable').innerHTML = empty('No hosts for this provider code yet.');
                return;
            }
            $('#hostsTable').innerHTML = '<table><thead><tr><th>Order</th><th>Host URL</th><th>Status</th><th>Actions</th></tr></thead><tbody>' +
                state.hosts.map((host, index) => '<tr>' +
                    '<td><span class="host-index">#' + esc(index + 1) + '</span></td>' +
                    '<td><span class="field-copy"><span class="mono">' + esc(host.host_url) + '</span>' +
                        '<button type="button" class="copy-btn" data-action="copy" data-copy="' + esc(host.host_url) + '" data-copy-label="Host URL">Copy</button></span></td>' +
                    '<td>' + (host.is_active ? '<span class="badge ok">Active</span>' : '<span class="badge warn">Inactive</span>') + '</td>' +
                    '<td class="actions host-actions">' +
                        '<button data-action="move-host-up" data-id="' + esc(host.id) + '"' + (index === 0 ? ' disabled' : '') + '>↑ Up</button>' +
                        '<button data-action="move-host-down" data-id="' + esc(host.id) + '"' + (index === state.hosts.length - 1 ? ' disabled' : '') + '>↓ Down</button>' +
                        '<button data-action="toggle-host" data-id="' + esc(host.id) + '">' + (host.is_active ? 'Disable' : 'Enable') + '</button>' +
                        '<button class="danger" data-action="delete-host" data-id="' + esc(host.id) + '">Delete</button>' +
                    '</td>' +
                '</tr>').join('') + '</tbody></table>';
        }

        async function reorderHosts(hostId, direction) {
            const index = state.hosts.findIndex((host) => host.id === hostId);
            if (index < 0) return;
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= state.hosts.length) return;
            const hostIds = state.hosts.map((host) => host.id);
            const temp = hostIds[index];
            hostIds[index] = hostIds[targetIndex];
            hostIds[targetIndex] = temp;
            await api('/admin/api/provider-codes/' + state.selectedCodeId + '/hosts/reorder', {
                method: 'POST',
                body: JSON.stringify({ host_ids: hostIds })
            });
            await loadCodeDetails(state.selectedCodeId);
            showToast('Host order updated');
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
                    $('#loginNotice').textContent = '';
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
                    if (!data.store_name?.trim()) {
                        throw new Error('Store name is required.');
                    }
                    await api('/admin/api/provider-codes/' + state.selectedCodeId, { method: 'PATCH', body: JSON.stringify(data) });
                    await refreshAll();
                    showToast('Provider code saved');
                }
                if (form.id === 'changeUsernameForm') {
                    const newUsername = String(submittedData.new_username || '').trim();
                    if (!newUsername) {
                        throw new Error('Username is required.');
                    }
                    if (!/^[A-Za-z0-9_.-]+$/.test(newUsername)) {
                        throw new Error('Username may only contain letters, numbers, dots, underscores, and hyphens.');
                    }
                    const result = await api('/admin/api/change-username', {
                        method: 'POST',
                        body: JSON.stringify({
                            new_username: newUsername,
                            current_password: submittedData.current_password
                        })
                    });
                    state.adminUsername = result.username || newUsername;
                    const settingsUser = $('#settingsUsername');
                    if (settingsUser) settingsUser.textContent = state.adminUsername;
                    form.reset();
                    showToast('Username updated', 'You are now signed in as ' + state.adminUsername + '.');
                }
                if (form.id === 'changePasswordForm') {
                    if (submittedData.new_password !== submittedData.confirm_password) {
                        throw new Error('New passwords do not match.');
                    }
                    if (String(submittedData.new_password).length < 8) {
                        throw new Error('New password must be at least 8 characters.');
                    }
                    await api('/admin/api/change-password', {
                        method: 'POST',
                        body: JSON.stringify({
                            current_password: submittedData.current_password,
                            new_password: submittedData.new_password,
                            confirm_password: submittedData.confirm_password
                        })
                    });
                    form.reset();
                    showToast('Password updated', 'Use your new password next time you sign in.');
                }
                if (form.id === 'hostForm') {
                    const data = { ...submittedData };
                    try {
                        new URL(data.host_url);
                    } catch {
                        throw new Error('Enter a valid host URL, including https://');
                    }
                    data.priority = state.hosts.length + 1;
                    await api('/admin/api/provider-codes/' + state.selectedCodeId + '/hosts', { method: 'POST', body: JSON.stringify(data) });
                    form.reset();
                    await loadCodeDetails(state.selectedCodeId);
                    showToast('Host added');
                }
            } catch (error) {
                if (form.id === 'loginForm') {
                    $('#loginNotice').textContent = error.message;
                } else {
                    setAppNotice(error.message, 'bad');
                }
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
                    $('#settingsTab').classList.toggle('hidden', button.dataset.tab !== 'settings');
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
                if (action === 'copy') {
                    await copyText(button.dataset.copy, button.dataset.copyLabel);
                    return;
                }
                setBusy(true);
                if (action === 'details') await loadCodeDetails(id);
                if (action === 'close-details') {
                    state.selectedCodeId = null;
                    $('#codeDetails').classList.add('hidden');
                    return;
                }
                if (action === 'toggle-code') {
                    const code = state.codes.find((item) => item.id === id);
                    if (!code) throw new Error('Provider code not found.');
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
                if (action === 'move-host-up') {
                    await reorderHosts(id, 'up');
                }
                if (action === 'move-host-down') {
                    await reorderHosts(id, 'down');
                }
                if (action === 'toggle-host') {
                    const host = state.hosts.find((item) => item.id === id);
                    if (!host) throw new Error('Host not found.');
                    await api('/admin/api/hosts/' + id, {
                        method: 'PATCH',
                        body: JSON.stringify({ is_active: !host.is_active })
                    });
                    await loadCodeDetails(state.selectedCodeId);
                    showToast(host.is_active ? 'Host disabled' : 'Host enabled');
                }
                if (action === 'toggle-device') {
                    const device = state.devices.concat(state.codeDevices).find((item) => item.id === id);
                    if (!device) throw new Error('Device not found.');
                    const playlistCount = getDevicePlaylists(device).length;
                    const confirmMessage = device.is_blocked
                        ? 'Unblock this device?'
                        : 'Block this device and all ' + playlistCount + ' playlist(s) on it?';
                    if (!confirm(confirmMessage)) return;
                    await api('/admin/api/devices/' + id, { method: 'PATCH', body: JSON.stringify({ is_blocked: !device.is_blocked }) });
                    await refreshAll();
                    showToast(device.is_blocked ? 'Device unblocked' : 'Device blocked');
                }
                if (action === 'delete-device' && confirm('Delete this device and all of its playlists?')) {
                    await api('/admin/api/devices/' + id, { method: 'DELETE' });
                    await refreshAll();
                    showToast('Device deleted');
                }
            } catch (error) {
                setAppNotice(error.message, 'bad');
                showToast('Action failed', error.message, 'bad');
            } finally {
                setBusy(false);
            }
        });

        document.addEventListener('input', (event) => {
            if (event.target?.id === 'deviceSearch') {
                state.deviceSearch = event.target.value.trim();
                renderDevices();
            }
        });

        document.addEventListener('change', (event) => {
            if (event.target?.id === 'deviceFilterStatus') {
                state.deviceFilterStatus = event.target.value;
                renderDevices();
            }
            if (event.target?.id === 'deviceFilterCode') {
                state.deviceFilterCode = event.target.value;
                renderDevices();
            }
        });

        $('#dismissNotice')?.addEventListener('click', () => setAppNotice(''));
        $('#clearDeviceFilters')?.addEventListener('click', () => {
            clearDeviceFilters();
            showToast('Filters cleared');
        });
        window.addEventListener('online', () => setAppNotice(''));
        window.addEventListener('offline', () => {
            setAppNotice('You are offline. Some actions may fail until connection returns.', 'bad');
        });

        refreshSession().catch((error) => showToast('Could not load admin panel', error.message, 'bad'));
    </script>
</body>
</html>`;
}
