#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DOMAIN="${DEPLOY_DOMAIN:-_}"
APP_ROOT="${APP_ROOT:-/opt/bloodconnect}"
WEB_ROOT="${WEB_ROOT:-/var/www/bloodconnect}"
DB_CONNECTION_STRING="${DB_CONNECTION_STRING:-}"
JWT_SIGNING_KEY="${JWT_SIGNING_KEY:-}"
PACKAGE_DIR="${PACKAGE_DIR:-$PWD}"
SERVICE_NAME="bloodconnect-api"

if [ -z "$DB_CONNECTION_STRING" ]; then
  echo "DB_CONNECTION_STRING is required"
  exit 1
fi

if [ -z "$JWT_SIGNING_KEY" ]; then
  echo "JWT_SIGNING_KEY is required"
  exit 1
fi

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
sudo rsync -a --delete "$PACKAGE_DIR/api/" "$APP_ROOT/api/"
sudo rsync -a --delete "$PACKAGE_DIR/web/" "$WEB_ROOT/"
sudo rsync -a --delete "$PACKAGE_DIR/deployment/" "$APP_ROOT/deployment/"

sudo tee "$APP_ROOT/api/.env.production" > /dev/null <<EOF
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://127.0.0.1:8080
ConnectionStrings__DefaultConnection=$DB_CONNECTION_STRING
Jwt__Issuer=BloodDonor.Api
Jwt__Audience=BloodDonor.Web
Jwt__SigningKey=$JWT_SIGNING_KEY
Jwt__AccessTokenMinutes=15
Jwt__RefreshTokenDays=7
EOF

sudo sed \
  -e "s|__APP_ROOT__|$APP_ROOT|g" \
  -e "s|__DEPLOY_DOMAIN__|$DEPLOY_DOMAIN|g" \
  "$APP_ROOT/deployment/bloodconnect-api.service" > "/etc/systemd/system/$SERVICE_NAME.service"

sudo sed \
  -e "s|__WEB_ROOT__|$WEB_ROOT|g" \
  -e "s|__DEPLOY_DOMAIN__|$DEPLOY_DOMAIN|g" \
  "$APP_ROOT/deployment/nginx.oracle.conf" > /etc/nginx/sites-available/bloodconnect

sudo ln -sf /etc/nginx/sites-available/bloodconnect /etc/nginx/sites-enabled/bloodconnect
sudo rm -f /etc/nginx/sites-enabled/default

sudo chown -R bloodconnect:bloodconnect "$APP_ROOT"
sudo chown -R www-data:www-data "$WEB_ROOT"
sudo chmod 600 "$APP_ROOT/api/.env.production"

sudo ufw allow OpenSSH || true
sudo ufw allow 'Nginx Full' || true

sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl restart "$SERVICE_NAME"
sudo nginx -t
sudo systemctl reload nginx

echo "Manual installation complete"
echo "Open: http://$(curl -s ifconfig.me || echo public-ip)/"
echo "Remember to create PostgreSQL DB/user manually if you have not done it yet."
