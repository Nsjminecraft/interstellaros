# ServerOS

A hardened, headless server operating system built on [CachyOS](https://cachyos.org/) with the performance-tuned `linux-cachyos` kernel featuring the BORE scheduler and x86-64-v3 optimizations.

Designed for production workloads: NAS, Docker, Kubernetes, web hosting, file/storage servers, container/VM hosting, and network/security appliances.

## Features

- **Performance Kernel** — linux-cachyos with BORE scheduler and x86-64-v3 microarchitectural optimizations
- **Web Management** — Cockpit-based dashboard with system monitoring, terminal, storage, containers, and VM management
- **App Store** — Curated package catalog with one-click install for common server applications
- **Clai TALOS** — Integrated self-hosted AI assistant with web dashboard and Telegram support
- **OTA Updates** — Automated update checking with configurable policies and systemd timer
- **Hardened Security** — Key-only SSH (Ed25519), nftables default-deny firewall, fail2ban intrusion prevention
- **Flexible Storage** — Btrfs, LVM, MD RAID, LUKS encryption, Samba, NFS
- **Container Runtime** — Docker, Podman, Kubernetes (kubectl, kubeadm, kubelet)
- **Web Servers** — Nginx, Caddy, HAProxy
- **Networking** — WireGuard, OpenVPN, dnsmasq, BIND
- **Monitoring** — htop, btop, prometheus-node-exporter

## Prerequisites

You must be running **Arch Linux** or **CachyOS**. Install the build dependency:

```bash
sudo pacman -S archiso
```

## Building

```bash
git clone <repository-url>
cd serveros
sudo ./build.sh
```

The ISO is output to `./out/serveros-YYYY.MM.DD-x86_64.iso` (target size: < 2.5 GB).

The build runs in an isolated work directory (`/tmp/serveros-build-work`) and does **not** modify your host system.

## Testing with QEMU

```bash
qemu-system-x86_64 -cdrom out/serveros-*.iso -m 2048 -enable-kvm
```

## First Boot

Login as `root` (no password) on the live ISO. The first-boot script (`serveros-setup`) runs automatically and guides you through:

1. Setting the root password
2. Creating an admin user with SSH key
3. Regenerating SSH host keys
4. Setting the timezone
5. Enabling core services (sshd, docker, nftables, fail2ban, NetworkManager, cockpit)

To run setup manually at any time:

```bash
serveros-setup
```

## Web Management

Access the Cockpit web UI at `https://<server-ip>:9090` and login with system credentials.

### ServerOS Dashboard

The **ServerOS** sidebar page provides:

| Tab | Description |
|-----|-------------|
| **App Store** | Curated server apps (Nextcloud, Gitea, Vaultwarden, Jellyfin, databases, dev tools) with one-click install |
| **Installed Apps** | View installed packages and remove them |
| **System Resources** | Live CPU, memory, disk, uptime, and top processes |
| **Clai TALOS** | Install, start, stop the AI assistant; view logs; open dashboard on port 8080 |

### Built-in Cockpit Modules

- System monitoring (CPU, memory, disk, network)
- Web terminal (System > Terminal)
- Package updates with visual management
- Storage management (disks, RAID, LVM)
- Container management (Podman/Docker)
- Virtual machine management
- Systemd service management
- System and service logs
- Network configuration and monitoring

## Clai TALOS

ServerOS includes integrated support for [Clai TALOS](https://github.com/VynavinV/Clai_TALOS), a self-hosted AI assistant.

Install it from the ServerOS dashboard or via CLI:

```bash
serveros-talos install   # Download and configure
serveros-talos status    # Check service status
serveros-talos uninstall # Remove
```

Once running, access the TALOS dashboard at `http://<server-ip>:8080`.

## OTA Updates

### Commands

```bash
serveros-update check    # Check for available updates
serveros-update apply    # Apply all updates
serveros-update auto     # Run auto-check and apply (per config)
```

### Configuration

Edit `/etc/serveros/ota.conf`:

```ini
UPDATE_SOURCE="pacman"     # Update source
AUTO_AP=false              # Auto-apply updates
CHECK_INTERVAL=86400       # Check interval in seconds (24 hours)
```

The `serveros-update.timer` systemd unit checks automatically every 24 hours.

View update logs:

```bash
journalctl -u serveros-update.service
```

## Project Layout

```
serveros/
├── build.sh                        # Build script (run as root)
├── LICENSE                         # MIT License
├── CODE_OF_CONDUCT.md              # Contributor Covenant
├── CONTRIBUTING.md                 # Contribution guidelines
├── README.md                       # This file
├── profile/
│   ├── profiledef.sh               # archiso profile definition
│   ├── pacman.conf                 # CachyOS + Arch mirror config
│   ├── packages.x86_64             # Package list
│   ├── efiboot/                    # UEFI boot (systemd-boot)
│   │   ├── loader/loader.conf
│   │   └── entries/01-serveros-linux.conf
│   ├── syslinux/                   # BIOS boot (syslinux)
│   └── sysroot/                    # Overlay files copied to ISO root
│       ├── etc/
│       │   ├── ssh/sshd_config     # Hardened SSH (key-only, Ed25519)
│       │   ├── nftables.conf       # Default-deny firewall
│       │   ├── hostname
│       │   ├── locale.conf
│       │   ├── serveros/ota.conf   # OTA update config
│       │   └── systemd/
│       │       ├── system/         # Custom services and timers
│       │       └── system-preset/  # Service enable/disable presets
│       └── usr/
│           ├── local/bin/
│           │   ├── serveros-setup  # First-boot guided setup
│           │   ├── serveros-update # OTA update script
│           │   └── serveros-talos  # Clai TALOS installer
│           └── share/cockpit/serveros/
│               ├── manifest.json   # Cockpit plugin registration
│               ├── index.html      # Dashboard UI
│               ├── serveros.js     # Dashboard logic
│               └── serveros.css    # Dashboard styles
└── out/                            # Built ISOs (gitignored)
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

## Acknowledgments

- [CachyOS](https://cachyos.org/) — Base distribution and performance-tuned kernel
- [Arch Linux](https://archlinux.org/) — Upstream package ecosystem
- [Cockpit Project](https://cockpit-project.org/) — Web-based server management
- [Clai TALOS](https://github.com/VynavinV/Clai_TALOS) — Self-hosted AI assistant
