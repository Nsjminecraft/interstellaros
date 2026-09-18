#!/bin/bash
# InterstellarOS ISO build script
# Runs mkarchiso with isolated work dir — does NOT modify the host system.
# Usage: sudo ./build.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROFILE_DIR="$SCRIPT_DIR/profile"
WORK_DIR="/tmp/interstellaros-build-work"
OUT_DIR="$SCRIPT_DIR/out"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[InterstellarOS]${NC} $*"; }
warn()  { echo -e "${YELLOW}[InterstellarOS]${NC} $*"; }
error() { echo -e "${RED}[InterstellarOS]${NC} $*" >&2; }

# Must run as root (mkarchiso needs it for chroot/pacman)
if [[ $EUID -ne 0 ]]; then
    error "This script must be run as root (sudo ./build.sh)"
    exit 1
fi

# Check prerequisites
for cmd in mkarchiso; do
    if ! command -v "$cmd" &>/dev/null; then
        error "'$cmd' not found. Install archiso: sudo pacman -S archiso"
        exit 1
    fi
done

info "Starting InterstellarOS ISO build..."
info "Profile:  $PROFILE_DIR"
info "Work dir: $WORK_DIR"
info "Output:   $OUT_DIR"

mkdir -p "$OUT_DIR"

# Clean previous work dir
if [[ -d "$WORK_DIR" ]]; then
    warn "Cleaning previous work directory..."
    rm -rf "$WORK_DIR"
fi

mkarchiso -v -w "$WORK_DIR" -o "$OUT_DIR" -m iso "$PROFILE_DIR"

# Cleanup work dir
rm -rf "$WORK_DIR"

ISO_FILE=$(ls -t "$OUT_DIR"/interstellaros-*.iso 2>/dev/null | head -1)
if [[ -n "$ISO_FILE" ]]; then
    # Fix ownership so non-root users can use the ISO
    chown "$(stat -c '%u:%g' "$SCRIPT_DIR")" "$ISO_FILE" 2>/dev/null || true
    ISO_SIZE=$(du -h "$ISO_FILE" | cut -f1)
    info "Build complete!"
    info "ISO: $ISO_FILE ($ISO_SIZE)"
    info "Test with: qemu-system-x86_64 -cdrom $ISO_FILE -m 2048 -enable-kvm"
else
    error "Build finished but no ISO found in $OUT_DIR"
    exit 1
fi
