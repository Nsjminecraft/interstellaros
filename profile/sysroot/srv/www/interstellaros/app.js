// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// HTML escape to prevent XSS
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Fetch system info
async function fetchSystemInfo() {
    try {
        const res = await fetch('/api/system');
        const data = await res.json();

        document.getElementById('cpu-usage').textContent = data.cpu.usage + '%';
        document.getElementById('cpu-info').textContent = data.cpu.cores + ' cores';

        const memPercent = Math.round((data.memory.used / data.memory.total) * 100);
        document.getElementById('mem-usage').textContent = memPercent + '%';
        document.getElementById('mem-info').textContent = data.memory.used + 'M / ' + data.memory.total + 'M';

        document.getElementById('disk-usage').textContent = data.disk.percent;
        document.getElementById('disk-info').textContent = data.disk.used + ' / ' + data.disk.total;

        document.getElementById('uptime').textContent = data.uptime.replace('up ', '');
        document.getElementById('load-avg').textContent = 'Load: ' + data.load_average.join(', ');
    } catch (err) {
        console.error('Failed to fetch system info:', err);
    }
}

// Fetch installed packages
async function fetchInstalledPackages() {
    try {
        const res = await fetch('/api/packages/installed');
        const data = await res.json();
        const list = document.getElementById('installed-list');
        list.innerHTML = data.packages.map(pkg => `
            <div class="package-item">
                <div class="package-info">
                    <div class="package-name">${escapeHtml(pkg.name)}</div>
                    <div class="package-desc">${escapeHtml(pkg.version)}</div>
                </div>
                <div class="package-actions">
                    <button class="btn btn-danger" onclick="removePackage('${pkg.name.replace(/'/g, "\\'")}')">Remove</button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Failed to fetch packages:', err);
    }
}

// Search packages
async function searchPackages() {
    const query = document.getElementById('search-input').value;
    if (!query) return;

    try {
        const res = await fetch('/api/packages/search?q=' + encodeURIComponent(query));
        const data = await res.json();
        const results = document.getElementById('search-results');

        if (data.packages.length === 0) {
            results.innerHTML = '<p style="text-align:center;color:#a0aec0;">No packages found</p>';
            return;
        }

        results.innerHTML = data.packages.map(pkg => {
            const parts = pkg.repo_name.split('/');
            const name = parts[1] || pkg.repo_name;
            return `
                <div class="package-item">
                    <div class="package-info">
                        <div class="package-name">${escapeHtml(name)}</div>
                        <div class="package-desc">${escapeHtml(pkg.description)}</div>
                    </div>
                    <div class="package-actions">
                        <button class="btn btn-primary" onclick="installPackage('${name.replace(/'/g, "\\'")}')">Install</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Failed to search packages:', err);
    }
}

// Install package
async function installPackage(name) {
    if (!confirm(`Install ${name}?`)) return;
    try {
        await fetch('/api/packages/install', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({package: name})
        });
        alert(`Installing ${name}...`);
    } catch (err) {
        console.error('Failed to install package:', err);
    }
}

// Remove package
async function removePackage(name) {
    if (!confirm(`Remove ${name}? This cannot be undone.`)) return;
    try {
        await fetch('/api/packages/remove', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({package: name})
        });
        alert(`Removing ${name}...`);
        setTimeout(fetchInstalledPackages, 2000);
    } catch (err) {
        console.error('Failed to remove package:', err);
    }
}

// Check TALOS status
async function checkTalosStatus() {
    try {
        const res = await fetch('/api/talos/status');
        const data = await res.json();
        document.getElementById('talos-status').textContent = data.running ? 'Running' : 'Stopped';
        document.getElementById('talos-status').style.color = data.running ? '#10b981' : '#ef4444';
    } catch (err) {
        document.getElementById('talos-status').textContent = 'Unknown';
    }
}

// Event listeners
document.getElementById('search-btn').addEventListener('click', searchPackages);
document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchPackages();
});

// Initial load
fetchSystemInfo();
fetchInstalledPackages();
checkTalosStatus();

// Refresh system info every 5 seconds
setInterval(fetchSystemInfo, 5000);
