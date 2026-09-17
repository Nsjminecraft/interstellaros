(function() {
    'use strict';

    const APPS = [
        { name: "nextcloud", desc: "Self-hosted file sync and share (Google Drive alternative)", category: "Cloud" },
        { name: "gitea", desc: "Lightweight self-hosted Git service", category: "DevOps" },
        { name: "vaultwarden", desc: "Lightweight Bitwarden-compatible password manager", category: "Security" },
        { name: "jellyfin", desc: "Media streaming server (Plex alternative)", category: "Media" },
        { name: "nginx", desc: "High-performance web server", category: "Web" },
        { name: "caddy", desc: "Web server with automatic HTTPS", category: "Web" },
        { name: "postgresql", desc: "Advanced open-source relational database", category: "Database" },
        { name: "mariadb", desc: "Community-developed MySQL fork", category: "Database" },
        { name: "redis", desc: "In-memory data store / cache", category: "Database" },
        { name: "prometheus", desc: "Monitoring and alerting toolkit", category: "Monitoring" },
        { name: "grafana", desc: "Analytics and monitoring dashboard", category: "Monitoring" },
        { name: "fail2ban", desc: "Intrusion prevention (already included)", category: "Security" },
        { name: "wireguard-tools", desc: "Fast modern VPN (already included)", category: "Networking" },
        { name: "openvpn", desc: "Full-featured SSL VPN (already included)", category: "Networking" },
        { name: "dnsmasq", desc: "Lightweight DNS/DHCP server (already included)", category: "Networking" },
        { name: "samba", desc: "SMB/CIFS file sharing (already included)", category: "Storage" },
        { name: "nfs-utils", desc: "NFS file sharing (already included)", category: "Storage" },
        { name: "docker", desc: "Container runtime (already included)", category: "Containers" },
        { name: "podman", desc: "Daemonless container engine (already included)", category: "Containers" },
        { name: "nodejs", desc: "JavaScript runtime (Node.js + npm)", category: "Dev" },
        { name: "python", desc: "Python 3 interpreter", category: "Dev" },
        { name: "go", desc: "Go programming language", category: "Dev" },
        { name: "rustup", desc: "Rust toolchain installer", category: "Dev" },
        { name: "ollama", desc: "Run large language models locally", category: "AI" },
    ];

    const $ = sel => document.querySelector(sel);
    const $$ = sel => document.querySelectorAll(sel);

    function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    function toast(msg, isError) {
        const t = $('#toast');
        t.textContent = msg;
        t.className = 'toast' + (isError ? ' error' : '');
        setTimeout(() => t.className = 'toast hidden', 3000);
    }

    // Tab switching
    $$('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            $$('.tab').forEach(t => t.classList.remove('active'));
            $$('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            $(`#tab-${tab.dataset.tab}`).classList.add('active');
            if (tab.dataset.tab === 'system') refreshSystem();
            if (tab.dataset.tab === 'installed') refreshInstalled();
            if (tab.dataset.tab === 'talos') refreshTalos();
        });
    });

    function run(cmd) {
        return cockpit.spawn(['sh', '-c', cmd], { superuser: 'try', err: 'message' });
    }

    // --- App Store ---
    function renderApps(filter) {
        const list = $('#app-list');
        list.innerHTML = '';
        const f = (filter || '').toLowerCase();
        APPS.filter(a => !f || a.name.includes(f) || a.desc.toLowerCase().includes(f) || a.category.toLowerCase().includes(f))
            .forEach(app => {
                const card = document.createElement('div');
                card.className = 'app-card';
                card.innerHTML = `
                    <span class="category">${app.category}</span>
                    <h4>${app.name}</h4>
                    <div class="desc">${app.desc}</div>
                    <button class="btn btn-primary install-btn" data-pkg="${app.name}">Install</button>
                `;
                list.appendChild(card);
            });
        list.querySelectorAll('.install-btn').forEach(btn => {
            btn.addEventListener('click', () => installApp(btn.dataset.pkg, btn));
        });
        checkInstalled();
    }

    function installApp(pkg, btn) {
        btn.disabled = true;
        btn.textContent = 'Installing...';
        run(`pacman -S --noconfirm --needed ${pkg}`).then(() => {
            toast(`${pkg} installed`);
            btn.textContent = 'Installed';
            btn.className = 'btn btn-success';
            checkInstalled();
        }).catch(e => {
            toast(`Failed: ${e.message || e}`, true);
            btn.disabled = false;
            btn.textContent = 'Install';
        });
    }

    function checkInstalled() {
        run("pacman -Qq").then(out => {
            const installed = new Set(out.trim().split('\n'));
            $('#app-list').querySelectorAll('.install-btn').forEach(btn => {
                if (installed.has(btn.dataset.pkg)) {
                    btn.textContent = 'Installed';
                    btn.className = 'btn btn-success';
                    btn.disabled = true;
                }
            });
        });
    }

    $('#search-apps').addEventListener('input', e => renderApps(e.target.value));
    renderApps();

    // --- Installed Apps ---
    function refreshInstalled() {
        const list = $('#installed-list');
        list.innerHTML = '<p style="color:var(--text-dim)">Loading...</p>';
        run("pacman -Q --info | awk '/^Name/{n=$3} /^Desc/{d=$0; sub(/^Description *: */,\"\",d)} /^Size/{s=$3} /^Installed/{print n\"|\"d\"|\"s}'").then(out => {
            list.innerHTML = '';
            const apps = out.trim().split('\n').filter(Boolean).map(l => {
                const [name, desc, size] = l.split('|');
                return { name, desc: desc || '', size: size || '?' };
            });
            const catalog = {};
            APPS.forEach(a => catalog[a.name] = a);
            apps.forEach(app => {
                const cat = catalog[app.name] || { category: 'System', desc: app.desc };
                const card = document.createElement('div');
                card.className = 'app-card';
                card.innerHTML = `
                    <span class="category">${esc(cat.category || 'System')}</span>
                    <h4>${esc(app.name)}</h4>
                    <div class="desc">${esc(cat.desc || app.desc || 'System package')}</div>
                    <div style="font-size:0.75rem;color:var(--text-dim)">Size: ${esc(app.size)} KB</div>
                    <button class="btn btn-danger uninstall-btn" data-pkg="${esc(app.name)}" style="margin-top:0.5rem">Remove</button>
                `;
                list.appendChild(card);
            });
            list.querySelectorAll('.uninstall-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (!confirm(`Remove ${btn.dataset.pkg}?`)) return;
                    run(`pacman -Rns --noconfirm ${btn.dataset.pkg}`).then(() => {
                        toast(`${btn.dataset.pkg} removed`);
                        refreshInstalled();
                    }).catch(e => toast(`Failed: ${e.message || e}`, true));
                });
            });
        }).catch(e => { list.innerHTML = `<p style="color:var(--danger)">${e}</p>`; });
    }

    // --- System Resources ---
    let sysInterval;
    function refreshSystem() {
        clearInterval(sysInterval);
        sysInterval = setInterval(updateSystem, 2000);
        updateSystem();
    }

    function updateSystem() {
        // CPU
        run("grep 'cpu ' /proc/stat").then(out => {
            const parts = out.trim().split(/\s+/).slice(1).map(Number);
            const total = parts.reduce((a, b) => a + b, 0);
            const idle = parts[3] + (parts[4] || 0);
            const pct = total ? Math.round((1 - idle / total) * 100) : 0;
            $('#cpu-usage').textContent = pct + '%';
        });
        run("nproc").then(n => {
            run("grep 'model name' /proc/cpuinfo | head -1 | cut -d: -f2").then(name => {
                $('#cpu-info').textContent = `${name.trim()} (${n.trim()} cores)`;
            });
        });

        // Memory
        run("free -m | awk '/Mem:/{printf \"%d %d\", $3, $2}'").then(out => {
            const [used, total] = out.trim().split(' ').map(Number);
            const pct = total ? Math.round(used / total * 100) : 0;
            $('#mem-usage').textContent = pct + '%';
            $('#mem-info').textContent = `${used} MB / ${total} MB`;
        });

        // Disk
        run("df -h / | awk 'NR==2{printf \"%s %s\", $3, $2}'").then(out => {
            const [used, total] = out.trim().split(' ');
            run("df / | awk 'NR==2{print $5}'").then(pct => {
                $('#disk-usage').textContent = pct.trim();
                $('#disk-info').textContent = `${used} / ${total}`;
            });
        });

        // Uptime
        run("uptime -p | sed 's/up //'").then(up => {
            $('#uptime-val').textContent = up.trim();
        });
        run("uname -r").then(k => {
            $('#kernel-info').textContent = `Kernel: ${k.trim()}`;
        });

        // Processes
        run("ps -eo pid,user,%cpu,%mem,comm --sort=-%cpu | head -11 | tail -10").then(out => {
            const tbody = $('#proc-body');
            tbody.innerHTML = '';
            out.trim().split('\n').forEach(line => {
                const parts = line.trim().split(/\s+/);
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${parts[0]}</td><td>${parts[1]}</td><td>${parts[2]}</td><td>${parts[3]}</td><td>${parts.slice(4).join(' ')}</td>`;
                tbody.appendChild(tr);
            });
        });
    }

    // --- Talos (Clai TALOS) ---
    function refreshTalos() {
        run("test -f /opt/clai-talos/clai-talos && echo installed || echo missing").then(out => {
            const installed = out.trim() === 'installed';
            if (!installed) {
                $('#talos-state').textContent = 'Not installed';
                $('#talos-state').style.color = 'var(--text-dim)';
                $('#talos-start').disabled = true;
                $('#talos-stop').disabled = true;
                $('#talos-install').disabled = false;
                $('#talos-install').style.display = '';
                $('#talos-dashboard').style.display = 'none';
                return;
            }
            run("systemctl is-active clai-talos 2>/dev/null || echo 'inactive'").then(out => {
                const state = out.trim();
                $('#talos-state').textContent = state;
                $('#talos-state').style.color = state === 'active' ? 'var(--success)' : 'var(--text-dim)';
                $('#talos-start').disabled = state === 'active';
                $('#talos-stop').disabled = state !== 'active';
                $('#talos-install').style.display = 'none';
                $('#talos-dashboard').style.display = '';
                const host = location.hostname || 'localhost';
                $('#talos-dashboard').href = `http://${host}:8080`;
            });
        });
    }

    $('#talos-install').addEventListener('click', () => {
        const btn = $('#talos-install');
        btn.disabled = true;
        btn.textContent = 'Installing...';
        run("serveros-talos install").then(out => {
            toast('Clai TALOS installed');
            $('#talos-logs-output').textContent = out;
            btn.textContent = 'Install Clai TALOS';
            refreshTalos();
        }).catch(e => {
            toast(`Install failed: ${e.message || e}`, true);
            btn.disabled = false;
        });
    });

    $('#talos-start').addEventListener('click', () => {
        run("systemctl start clai-talos").then(() => {
            toast('Clai TALOS started');
            refreshTalos();
        }).catch(e => toast(`Failed: ${e.message || e}`, true));
    });

    $('#talos-stop').addEventListener('click', () => {
        run("systemctl stop clai-talos").then(() => {
            toast('Clai TALOS stopped');
            refreshTalos();
        }).catch(e => toast(`Failed: ${e.message || e}`, true));
    });

    $('#talos-logs').addEventListener('click', () => {
        run("journalctl -u clai-talos --no-pager -n 100 2>/dev/null || echo 'No clai-talos service found'").then(out => {
            $('#talos-logs-output').textContent = out || 'No logs available.';
        }).catch(e => {
            $('#talos-logs-output').textContent = `Error: ${e}`;
        });
    });

    // Initial system refresh if on that tab
    if ($('#tab-system').classList.contains('active')) refreshSystem();
})();
