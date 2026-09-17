# InterstellarOS

A hardened, headless server operating system built on [CachyOS](https://cachyos.org/) with the performance-tuned `linux-cachyos` kernel featuring the BORE scheduler and x86-64-v3 optimizations.

Designed for production workloads: NAS, Docker, Kubernetes, web hosting, file/storage servers, container/VM hosting, and network/security appliances.

## Features

- **Performance Kernel** — linux-cachyos with BORE scheduler and x86-64-v3 microarchitectural optimizations
- **Web Management** — Custom dashboard with system monitoring, app store, web terminal, and TALOS integration
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
cd interstellaros
sudo ./build.sh
```

The ISO is output to `./out/interstellaros-YYYY.MM.DD-x86_64.iso` (target size: < 2.5 GB).

The build runs in an isolated work directory (`/tmp/interstellaros-build-work`) and does **not** modify your host system.

## Testing with QEMU

```bash
qemu-system-x86_64 -cdrom out/interstellaros-*.iso -m 2048 -enable-kvm
```

## First Boot

Login as `root` (no password) on the live ISO. The first-boot script (`interstellaros-setup`) runs automatically and guides you through:

1. Setting the root password
2. Creating an admin user with SSH key
3. Regenerating SSH host keys
4. Setting the timezone
5. Enabling core services (sshd, docker, nftables, fail2ban, NetworkManager)

To run setup manually at any time:

```bash
interstellaros-setup
```

## Installing to Disk

From the live ISO, install InterstellarOS to your hard drive:

```bash
interstellaros-install
```

The script will:
- Partition and format the target disk (btrfs + EFI/boot)
- Install the base system
- Configure hostname, timezone, locale
- Set root and admin user passwords
- Install bootloader (systemd-boot for UEFI, GRUB for BIOS)
- Enable core services

After installation, reboot and remove the installation media.

## Web Management

Access the InterstellarOS dashboard at `http://<server-ip>`.

### Dashboard Tabs

| Tab | Description |
|-----|-------------|
| **Dashboard** | Live CPU, memory, disk usage, uptime, and load average |
| **App Store** | Search and install packages from Arch/CachyOS repos |
| **Installed** | View and remove installed packages |
| **Terminal** | Full web-based terminal (powered by ttyd) |
| **Clai TALOS** | AI assistant status and access |

### Architecture

- **nginx** reverse proxy (port 80) serving static frontend and proxying API/terminal
- **Python API backend** (port 8081, localhost only) for system info and package management
- **ttyd** web terminal (port 7681, localhost only) for browser-based shell access

## Clai TALOS

InterstellarOS includes integrated support for [Clai TALOS](https://github.com/VynavinV/Clai_TALOS), a self-hosted AI assistant.

Install it from the InterstellarOS dashboard or via CLI:

```bash
interstellaros-talos install   # Download and configure
interstellaros-talos status    # Check service status
interstellaros-talos uninstall # Remove
```

Once running, access the TALOS dashboard at `http://<server-ip>:8080`.

## OTA Updates

### Commands

```bash
interstellaros-update check    # Check for available updates
interstellaros-update apply    # Apply all updates
interstellaros-update auto     # Run auto-check and apply (per config)
```

### Configuration

Edit `/etc/interstellaros/ota.conf`:

```ini
UPDATE_SOURCE="pacman"     # Update source
AUTO_AP=false              # Auto-apply updates
CHECK_INTERVAL=86400       # Check interval in seconds (24 hours)
```

The `interstellaros-update.timer` systemd unit checks automatically every 24 hours.

View update logs:

```bash
journalctl -u interstellaros-update.service
```

## Project Layout

```
interstellaros/
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
│   │   └── entries/01-interstellaros-linux.conf
│   ├── syslinux/                   # BIOS boot (syslinux)
│   └── sysroot/                    # Overlay files copied to ISO root
│       ├── etc/
│       │   ├── ssh/sshd_config     # Hardened SSH (key-only, Ed25519)
│       │   ├── nftables.conf       # Default-deny firewall
│       │   ├── hostname
│       │   ├── locale.conf
│       ├── nginx/nginx.conf      # Reverse proxy config
│       │   ├── interstellaros/ota.conf   # OTA update config
│       │   └── systemd/
│       │       ├── system/         # Custom services and timers
│       │       └── system-preset/  # Service enable/disable presets
│       └── usr/
│           └── local/bin/
│               ├── interstellaros-setup  # First-boot guided setup
│               ├── interstellaros-update # OTA update script
│               ├── interstellaros-talos  # Clai TALOS installer
│               └── interstellaros-api    # WebUI API backend
│       └── srv/
│           └── www/interstellaros/       # WebUI frontend
│               ├── index.html
│               ├── app.js
│               └── style.css
└── out/                            # Built ISOs (gitignored)
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

## Acknowledgments

- [CachyOS](https://cachyos.org/) — Base distribution and performance-tuned kernel
- [Arch Linux](https://archlinux.org/) — Upstream package ecosystem
- [ttyd](https://github.com/tsl0922/ttyd) — Web-based terminal
- [Clai TALOS](https://github.com/VynavinV/Clai_TALOS) — Self-hosted AI assistant
