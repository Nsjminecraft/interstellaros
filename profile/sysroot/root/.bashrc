# ServerOS root shell config

# Prompt
PS1='[\u@serveros \W]# '

# History
HISTSIZE=10000
HISTFILESIZE=20000
HISTCONTROL=ignoreboth:erasedups
shopt -s histappend cmdsize

# Aliases
alias ll='ls -alFh --color=auto'
alias la='ls -A --color=auto'
alias l='ls -CF --color=auto'
alias ..='cd ..'
alias ...='cd ../../'
alias grep='grep --color=auto'
alias df='df -h'
alias du='du -h'
alias free='free -h'

# ServerOS helpers
alias setup='/root/firstboot.sh'
alias sstatus='systemctl --failed'
alias jf='journalctl -p err -b'

# Auto-run first-boot on very first login (no root password set yet)
if [[ -f /etc/shadow ]] && grep -q '^root::' /etc/shadow 2>/dev/null; then
    echo -e "\n\033[1;33mFirst login detected — running setup...\033[0m\n"
    /root/firstboot.sh
fi
