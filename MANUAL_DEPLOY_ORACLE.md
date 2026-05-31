# Manual Oracle Deployment

This guide is for deploying the project manually to an Oracle Free Tier VM using the server public IP only.

## What to use

The bundle preparation script creates:

- published .NET API
- built frontend static files
- deployment templates and scripts
- one zip file to upload

## 1. Create the bundle locally

From the repo root in PowerShell:

```powershell
./deployment/scripts/manual_prepare_bundle.ps1
```

This creates:

- `publish/manual-deploy/`
- `publish/bloodconnect-manual-deploy.zip`

## 2. Upload the bundle to the Oracle VM

Example using `scp`:

```powershell
scp publish/bloodconnect-manual-deploy.zip ubuntu@YOUR_PUBLIC_IP:/tmp/
```

Then SSH in:

```powershell
ssh ubuntu@YOUR_PUBLIC_IP
```

## 3. Extract the bundle on the VM

```bash
mkdir -p /tmp/bloodconnect-manual-deploy
unzip -o /tmp/bloodconnect-manual-deploy.zip -d /tmp/bloodconnect-manual-deploy
cd /tmp/bloodconnect-manual-deploy
chmod +x deployment/scripts/manual_remote_install.sh
```

## 4. Create PostgreSQL DB/user

Use PostgreSQL shell:

```bash
sudo -u postgres psql
```

Run:

```sql
CREATE USER bloodconnect WITH PASSWORD 'CHANGE_THIS_PASSWORD';
CREATE DATABASE blooddonor OWNER bloodconnect;
GRANT ALL PRIVILEGES ON DATABASE blooddonor TO bloodconnect;
```

## 5. Run the remote install script

Replace placeholders before running:

```bash
sudo DEPLOY_DOMAIN=YOUR_PUBLIC_IP \
APP_ROOT=/opt/bloodconnect \
WEB_ROOT=/var/www/bloodconnect \
PACKAGE_DIR=/tmp/bloodconnect-manual-deploy \
DB_CONNECTION_STRING='Host=127.0.0.1;Port=5432;Database=blooddonor;Username=bloodconnect;Password=CHANGE_THIS_PASSWORD' \
JWT_SIGNING_KEY='PUT_A_LONG_RANDOM_SECRET_HERE' \
./deployment/scripts/manual_remote_install.sh
```

## 6. Verify

Check these URLs:

- `http://YOUR_PUBLIC_IP/`
- `http://YOUR_PUBLIC_IP/health`

Check services:

```bash
sudo systemctl status bloodconnect-api
sudo systemctl status nginx
sudo systemctl status postgresql
sudo journalctl -u bloodconnect-api -n 100 --no-pager
```

## Notes

- The frontend is built to use same-origin `/api` in production.
- Nginx proxies `/api/*` to the backend at `127.0.0.1:8080`.
- PostgreSQL stays local on the VM and should not be exposed publicly.
- Because you are using plain HTTP on a public IP, browser geolocation may not work reliably.
- Map pinning still works.

## Re-deploy later

For later updates:

1. run `./deployment/scripts/manual_prepare_bundle.ps1` again locally
2. upload the new zip
3. extract it on the VM
4. rerun `manual_remote_install.sh`
