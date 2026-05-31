# Jenkins to Oracle Deployment Guide

This repository includes a Jenkins-based artifact deployment pipeline for an Oracle Free Tier VM.

It supports either:

- public IP only over HTTP
- domain + HTTPS later

## Files added

- `Jenkinsfile`
- `deployment/scripts/remote_setup.sh`
- `deployment/scripts/remote_deploy.sh`
- `deployment/nginx.oracle.conf`
- `deployment/bloodconnect-api.service`
- `deployment/oracle-postgres-setup.sql`

## Deployment model

Jenkins runs on your local PC and does this:

1. checks out the repo
2. publishes the .NET API locally
3. builds the Vite frontend locally
4. packages API + web + deployment templates
5. uploads artifacts to Oracle VM over SSH
6. updates the API files and static web files on the VM
7. writes production environment variables to the API env file
8. installs/updates systemd and Nginx config templates
9. restarts API and reloads Nginx
10. optionally runs a health check

The pipeline is designed so the frontend can use same-origin `/api` in production, which means it works whether you access the site by domain or public IP.

## Jenkins prerequisites

Install on the Jenkins machine:

- Git
- .NET SDK 10
- Node.js + npm
- OpenSSH client

Recommended Jenkins plugins:

- Pipeline
- Git
- SSH Agent

## Jenkins credentials required

Create these credentials in Jenkins:

1. SSH private key credential
   - ID: `oracle-vm-ssh`
   - used for SSH/SCP to the Oracle VM

2. Secret text
   - ID: `bloodconnect-db-connection-string`
   - value example:
     - `Host=127.0.0.1;Port=5432;Database=blooddonor;Username=bloodconnect;Password=YOUR_DB_PASSWORD`

3. Secret text
   - ID: `bloodconnect-jwt-signing-key`
   - value: long random string

## One-time server setup

Before first real deployment:

1. Create Oracle VM
2. Point domain DNS to the VM public IP
3. Open ports `22`, `80`, `443`
4. Create Jenkins pipeline from this repo
5. Run pipeline once with:
   - `RUN_REMOTE_SETUP=true`

That installs:

- nginx
- postgresql
- aspnetcore runtime
- swap
- directories and system user

## PostgreSQL setup

After remote setup, create DB manually:

```bash
sudo -u postgres psql
```

Then run the SQL from `deployment/oracle-postgres-setup.sql` after replacing `CHANGE_ME`.

## HTTPS

Install certbot on the VM after DNS is working:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

HTTPS is strongly recommended because the web app uses browser geolocation.

If you deploy using only the Oracle public IP over plain HTTP:

- the app itself can still load and the API can still work
- login, requests, notifications, and most normal API features can work
- browser geolocation-based features may not work reliably on the web app because many browsers require a secure context for location access
- map pinning still works because it does not depend on browser geolocation permission

## Jenkins parameters

- `DEPLOY_HOST`: Oracle VM IP or hostname
- `DEPLOY_USER`: SSH user, usually `ubuntu`
- `DEPLOY_DOMAIN`: public domain or public IP for the app
- `DEPLOY_PORT`: SSH port, usually `22`
- `APP_ROOT`: app root, default `/opt/bloodconnect`
- `WEB_ROOT`: web root, default `/var/www/bloodconnect`
- `RUN_REMOTE_SETUP`: only true for first-time bootstrap or when rebuilding server setup
- `RUN_HEALTHCHECK`: verify `https://domain/health`
- `USE_HTTPS`: use `https://.../health` instead of `http://.../health`

## Notes

- Frontend build does not require a hardcoded production API URL anymore.
- In production it can use same-origin `/api` behind Nginx.
- API runs behind Nginx on `127.0.0.1:8080`
- PostgreSQL stays local on the VM
- Nginx proxy config intentionally uses:
  - `proxy_pass http://127.0.0.1:8080;`
  - without the trailing slash, so `/api/...` routes are preserved

## Operational advice for 1 GB Oracle VM

- do builds on Jenkins, not on the VM
- do not expose PostgreSQL publicly
- keep API behind Nginx
- add swap
- keep Postgres tuned conservatively
- prefer direct deployment over Docker on this VM

## Public IP only deployment

If you do not have a domain yet, use these Jenkins parameters:

- `DEPLOY_HOST=<your oracle public ip>`
- `DEPLOY_DOMAIN=<same public ip>`
- `RUN_REMOTE_SETUP=true` on first run
- `RUN_HEALTHCHECK=true`
- `USE_HTTPS=false`

In that setup:

- access the site at `http://<your-public-ip>/`
- health endpoint is `http://<your-public-ip>/health`
- API is proxied through `http://<your-public-ip>/api/...`

When you later get a domain and HTTPS:

1. point DNS to the VM
2. install Certbot
3. set `DEPLOY_DOMAIN` to the domain
4. set `USE_HTTPS=true`
