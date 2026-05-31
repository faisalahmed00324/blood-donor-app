#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/opt/bloodconnect}"
WEB_ROOT="${WEB_ROOT:-/var/www/bloodconnect}"
DEPLOY_DOMAIN="${DEPLOY_DOMAIN:-your-domain.com}"

sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib unzip rsync curl gnupg apt-transport-https ca-certificates software-properties-common

if [ ! -f /swapfile ]; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

if ! command -v dotnet >/dev/null 2>&1; then
  wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O /tmp/packages-microsoft-prod.deb
  sudo dpkg -i /tmp/packages-microsoft-prod.deb
  sudo apt update
  sudo apt install -y aspnetcore-runtime-10.0
fi

sudo useradd -r -s /usr/sbin/nologin bloodconnect 2>/dev/null || true
sudo mkdir -p "$APP_ROOT/api" "$APP_ROOT/deployment" "$WEB_ROOT"
sudo chown -R bloodconnect:bloodconnect "$APP_ROOT"
sudo chown -R www-data:www-data "$WEB_ROOT"

sudo ufw allow OpenSSH || true
sudo ufw allow 'Nginx Full' || true

echo "Remote setup complete"
echo "Next steps: create PostgreSQL user/database, install certbot, configure DNS to $DEPLOY_DOMAIN"
