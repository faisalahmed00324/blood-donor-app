#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/opt/bloodconnect}"
WEB_ROOT="${WEB_ROOT:-/var/www/bloodconnect}"
DEPLOY_DOMAIN="${DEPLOY_DOMAIN:-your-domain.com}"
DB_CONNECTION_STRING="${DB_CONNECTION_STRING:-}"
JWT_SIGNING_KEY="${JWT_SIGNING_KEY:-}"
PACKAGE_ZIP="/tmp/bloodconnect-deploy.zip"
WORK_DIR="/tmp/bloodconnect-deploy"
SERVICE_NAME="bloodconnect-api"
API_TARGET_DIR="$APP_ROOT/api"
ENV_FILE="$APP_ROOT/api/.env.production"
NGINX_TEMPLATE="$APP_ROOT/deployment/nginx.oracle.conf"
SYSTEMD_TEMPLATE="$APP_ROOT/deployment/bloodconnect-api.service"

if [ -z "$DB_CONNECTION_STRING" ]; then
  echo "DB_CONNECTION_STRING is required"
  exit 1
fi

if [ -z "$JWT_SIGNING_KEY" ]; then
  echo "JWT_SIGNING_KEY is required"
  exit 1
fi

rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"

python3 - <<'PY'
import os
import zipfile

zip_path = "/tmp/bloodconnect-deploy.zip"
extract_dir = "/tmp/bloodconnect-deploy"

with zipfile.ZipFile(zip_path, "r") as archive:
    archive.extractall(extract_dir)
PY

sudo mkdir -p "$API_TARGET_DIR" "$WEB_ROOT" "$APP_ROOT/deployment"
sudo rsync -a --delete "$WORK_DIR/api/" "$API_TARGET_DIR/"
sudo rsync -a --delete "$WORK_DIR/web/" "$WEB_ROOT/"
sudo rsync -a --delete "$WORK_DIR/deployment/" "$APP_ROOT/deployment/"

sudo tee "$ENV_FILE" > /dev/null <<EOF
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
  "$SYSTEMD_TEMPLATE" > "/etc/systemd/system/$SERVICE_NAME.service"

sudo sed \
  -e "s|__WEB_ROOT__|$WEB_ROOT|g" \
  -e "s|__DEPLOY_DOMAIN__|$DEPLOY_DOMAIN|g" \
  "$NGINX_TEMPLATE" > /etc/nginx/sites-available/bloodconnect

sudo ln -sf /etc/nginx/sites-available/bloodconnect /etc/nginx/sites-enabled/bloodconnect
sudo rm -f /etc/nginx/sites-enabled/default

sudo chown -R www-data:www-data "$WEB_ROOT"
sudo chown -R bloodconnect:bloodconnect "$APP_ROOT"
sudo chmod 600 "$ENV_FILE"

sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl restart "$SERVICE_NAME"
sudo nginx -t
sudo systemctl reload nginx

echo "Deployment complete"
