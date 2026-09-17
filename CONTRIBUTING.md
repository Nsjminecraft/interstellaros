# Contributing to InterstellarOS

Thank you for your interest in contributing to InterstellarOS. This document provides guidelines and information for contributors.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How to Contribute

### Reporting Bugs

Before creating a bug report, check existing issues to avoid duplicates. When filing an issue, include:

- A clear, descriptive title
- Steps to reproduce the problem
- Expected vs. actual behavior
- Your environment (Arch/CachyOS version, kernel version)
- Build logs if the issue is build-related

### Suggesting Enhancements

Enhancement suggestions are welcome. Please provide:

- The use case and motivation
- Expected behavior
- Any alternatives you've considered

### Pull Requests

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Test your changes (build the ISO if modifying build files)
5. Submit a pull request with a clear description

## Development Setup

### Prerequisites

- Arch Linux or CachyOS
- `archiso` package installed
- At least 10 GB free disk space

### Building Locally

```bash
git clone https://github.com/<your-username>/interstellaros.git
cd interstellaros
sudo ./build.sh
```

The ISO is output to `./out/interstellaros-*.iso`.

### Testing with QEMU

```bash
qemu-system-x86_64 -cdrom out/interstellaros-*.iso -m 2048 -enable-kvm
```

## Project Structure

See the [README](README.md#project-layout) for the full directory tree. Key areas for contributions:

| Area | Path | Description |
|------|------|-------------|
| Package list | `profile/packages.x86_64` | Add/remove packages included in the ISO |
| Cockpit plugin | `profile/sysroot/usr/share/cockpit/interstellaros/` | Web dashboard UI (HTML, JS, CSS) |
| System scripts | `profile/sysroot/usr/local/bin/` | Setup, update, and TALOS scripts |
| Boot config | `profile/efiboot/`, `profile/syslinux/` | UEFI and BIOS boot entries |
| System config | `profile/sysroot/etc/` | SSH, firewall, hostname, services |

## Style Guidelines

### Shell Scripts

- Use `bash` with `set -e` for error handling
- Quote all variables: `"$VAR"` not `$VAR`
- Use lowercase for local variables, UPPER_CASE for environment/config variables
- Add comments for non-obvious logic

### JavaScript (Cockpit Plugin)

- Use ES5-compatible syntax (no arrow functions in module scope for max compatibility)
- Escape all user-supplied content with the `esc()` function before inserting into `innerHTML`
- Use `cockpit.spawn()` with `{ superuser: 'try', err: 'message' }` for system commands
- Keep the dark theme consistent (use existing CSS variables)

### Configuration Files

- Use INI-style format for `.conf` files
- Document each option with a comment
- Provide sensible defaults

## Commit Messages

Use conventional commit format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(cockpit): add Clai TALOS dashboard link`
- `fix(build): correct squashfs compression flag`
- `docs(readme): update prerequisites section`

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
