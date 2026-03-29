#!/usr/bin/env bash
# Verify Wazuh API reachability (Wazuh 4.x). Uses Basic auth against a lightweight JSON endpoint.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"
if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "${ENV_FILE}"
  set +a
fi

# Official wazuh-docker single-node compose uses API_USERNAME / API_PASSWORD; Talos uses WAZUH_API_*.
WAZUH_API_USER="${WAZUH_API_USER:-${API_USERNAME:-}}"
WAZUH_API_PASSWORD="${WAZUH_API_PASSWORD:-${API_PASSWORD:-}}"

die() {
  echo "check_wazuh_api: $*" >&2
  exit 1
}

[[ -n "${WAZUH_API_URL:-}" ]] || die "WAZUH_API_URL is not set (export it or add scripts/.env)"
[[ -n "${WAZUH_API_USER:-}" ]] || die "WAZUH_API_USER or API_USERNAME is not set (export it or add scripts/.env)"
[[ -n "${WAZUH_API_PASSWORD:-}" ]] || die "WAZUH_API_PASSWORD or API_PASSWORD is not set (export it or add scripts/.env)"

BASE="${WAZUH_API_URL%%/}"
# Lightweight authenticated endpoint returning JSON (Wazuh 4.14 API)
ENDPOINT="${BASE}/cluster/status"

tmpfile=
cleanup() {
  [[ -n "${tmpfile}" && -f "${tmpfile}" ]] && rm -f "${tmpfile}"
}
trap cleanup EXIT

tmpfile="$(mktemp "${TMPDIR:-/tmp}/wazuh_api_check.XXXXXX")"

http_code=
http_code="$(curl -sk --user "${WAZUH_API_USER}:${WAZUH_API_PASSWORD}" \
  -o "${tmpfile}" \
  -w "%{http_code}" \
  --connect-timeout 15 \
  --max-time 60 \
  "${ENDPOINT}")" || die "curl failed to connect to ${ENDPOINT}"

[[ "${http_code}" == "200" ]] || die "expected HTTP 200 from ${ENDPOINT}, got ${http_code}"

if command -v jq >/dev/null 2>&1; then
  jq -e . "${tmpfile}" >/dev/null || die "response body is not valid JSON"
elif command -v python3 >/dev/null 2>&1; then
  python3 -c 'import json,sys; json.load(open(sys.argv[1]))' "${tmpfile}" || die "response body is not valid JSON"
else
  if ! grep -qE '^[[:space:]]*\{' "${tmpfile}"; then
    die "response does not look like JSON (install jq or python3 for validation)"
  fi
fi

echo "OK: Wazuh API responded with HTTP 200 and JSON from ${ENDPOINT}"
exit 0
