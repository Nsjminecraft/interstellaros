# InterstellarOS archiso profile definition
# Required by mkarchiso

# ISO name pattern (date appended automatically by mkarchiso)
export iso_name="interstellaros"
export iso_label="INTERSTELLAROS_$(date +%Y%m)"
export iso_publisher="InterstellarOS <https://github.com/yourname/interstellaros>"
export iso_application="InterstellarOS Live CD"
export iso_version="$(date +%Y.%m.%d)"

# Build directories
export install_dir="arch"
export arch="x86_64"
export pacman_conf="pacman.conf"

# Boot modes — systemd-boot for UEFI, syslinux for BIOS
export bootmodes=(
    'uefi.systemd-boot'
    'bios.syslinux'
)
