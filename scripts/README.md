# Scripts

Automation and API checks for Talos against a Wazuh instance.

## `check_wazuh_api.sh`

Bash script that confirms the Wazuh REST API is reachable with valid credentials. It performs an authenticated `GET` to `/cluster/status` (JSON), uses `curl -sk` for lab/self-signed TLS, and exits `0` only on HTTP `200` with a parseable JSON body.

### Environment variables

| Variable | Description |
|----------|-------------|
| `WAZUH_API_URL` | Base URL of the API (no path), e.g. `https://127.0.0.1:<PORT>` |
| `WAZUH_API_USER` | API username (optional if `API_USERNAME` is set) |
| `WAZUH_API_PASSWORD` | API password (optional if `API_PASSWORD` is set) |
| `API_USERNAME` | Same names as in official `wazuh-docker` `docker-compose.yml` (`API_*` env block) |
| `API_PASSWORD` | Use these if you want one `.env` that mirrors compose without renaming |

If both `WAZUH_API_USER` and `API_USERNAME` are set, `WAZUH_API_USER` wins (same for password).

If `scripts/.env` exists next to the script, it is sourced automatically (same variables). Copy `scripts/.env.example` to `scripts/.env` on the machine and fill in values. **Do not commit `scripts/.env` or real passwords.**

On the VM, `API_USERNAME` / `API_PASSWORD` should match the `API_USERNAME` / `API_PASSWORD` entries for the Wazuh stack in `~/wazuh-docker-official/single-node/docker-compose.yml`.

### Ubuntu VM (same host as Docker)

1. Find the host port mapped to container port `55000` in `~/wazuh-docker-official/single-node/docker-compose.yml` (look for the Wazuh manager/API service `ports:` entry).
2. From `~/Talos` (after `git pull`), run:

```bash
chmod +x scripts/check_wazuh_api.sh
export WAZUH_API_URL="https://127.0.0.1:<PORT>"
export API_USERNAME="your-api-user"
export API_PASSWORD="your-api-password"
./scripts/check_wazuh_api.sh
```

Or use `scripts/.env` with `WAZUH_API_URL` plus `API_USERNAME` / `API_PASSWORD` (or `WAZUH_API_*`) and run `./scripts/check_wazuh_api.sh`.

### Laptop or other machine

Use the same `<PORT>` and credentials, but set `WAZUH_API_URL` to `https://<EC2_PUBLIC_IP>:<PORT>` if your security group allows inbound TCP to that port from your client. If the port is not open, run the script on the VM over SSH instead.

### Windows

Run this script under **Git Bash**, **WSL**, or another environment that provides `bash` and `curl`. On the EC2 **Ubuntu VM**, use bash as shown above.
