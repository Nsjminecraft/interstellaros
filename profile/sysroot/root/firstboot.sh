#!/bin/bash
# ServerOS first-boot setup script
# Run once as root after install: /root/firstboot.sh

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[setup]${NC} $*"; }
warn()  { echo -e "${RED}[setup]${NC} $*" >&2; }

# 1. Set root password
info "Set root password:"
passwd root

# 2. Create admin user
read -rp "Create admin user (name, or 'skip'): " ADMIN_NAME
if [[ -n "$ADMIN_NAME" && "$ADMIN_NAME" != "skip" ]]; then
    useradd -m -G wheel -s /bin/bash "$ADMIN_NAME"
    passwd "$ADMIN_NAME"
    # Ensure wheel can sudo without password
    echo "%wheel ALL=(ALL) ALL" > /etc/sudoers.d/wheel
    chmod 440 /etc/sudoers.d/wheel
    info "User '$ADMIN_NAME' created with wheel group."

    # 3. Set up SSH keys for admin
    read -rp "Paste SSH public key for $ADMIN_NAME (or 'skip'): " SSH_KEY
    if [[ -n "$SSH_KEY" && "$SSH_KEY" != "skip" ]]; then
        mkdir -p "/home/$ADMIN_NAME/.ssh"
        echo "$SSH_KEY" > "/home/$ADMIN_NAME/.ssh/authorized_keys"
        chmod 700 "/home/$ADMIN_NAME/.ssh"
        chmod 600 "/home/$ADMIN_NAME/.ssh/authorized_keys"
        chown -R "$ADMIN_NAME:$ADMIN_NAME" "/home/$ADMIN_NAME/.ssh"
        info "SSH key installed for $ADMIN_NAME."
    fi
fi

# 4. Regenerate SSH host keys (unique per install)
info "Regenerating SSH host keys..."
rm -f /etc/ssh/ssh_host_*
ssh-keygen -A

# 5. Set timezone
read -rp "Timezone (e.g. UTC, America/New_York) [UTC]: " TZ_IN
TZ_IN="${TZ_IN:-UTC}"
ln -sf "/usr/share/zoneinfo/$TZ_IN" /etc/localtime
info "Timezone set to $TZ_IN."

# 6. Resize root partition if possible (live ISO — no-op on installed system)
if command -v growpart &>/dev/null; then
    info "Attempting to grow root partition..."
    ROOT_DEV=$(findmnt -no SOURCE /)
    growpart "$ROOT_DEV" 2 2>/dev/null || warn "growpart skipped (no partition to grow)."
fi

# 7. Enable services
systemctl enable sshd docker nftables fail2ban NetworkManager

info "First-boot setup complete. Reboot recommended."
