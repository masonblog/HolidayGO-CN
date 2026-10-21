const token = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

if (!token) {
  throw new Error("Missing CLOUDFLARE_API_TOKEN in the cloudflare-workers environment or repository Secrets.");
}

const phase = "http_request_dynamic_redirect";
const ref = "holidaygo_legacy_domain_redirect";
const expression = '(http.host eq "holiday.masonhu.cc")';
const targetExpression = 'concat("https://holiday.masonhu.org", http.request.uri.path)';
const desired = {
  ref,
  description: "HolidayGO legacy domain to holiday.masonhu.org",
  expression,
  action: "redirect",
  enabled: true,
  action_parameters: {
    from_value: {
      target_url: { expression: targetExpression },
      status_code: 308,
      preserve_query_string: true,
    },
  },
};

async function api(path, method = "GET", body, allowNotFound = false) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  const data = await response.json();
  if (allowNotFound && response.status === 404) return null;
  if (!response.ok || !data.success) {
    const errors = (data.errors ?? [])
      .map(({ code, message }) => `${code}: ${message}`)
      .join("; ")
      .replaceAll(token, "[REDACTED]");
    throw new Error(
      `Cloudflare ${method} ${path} failed (HTTP ${response.status}): ${errors}. ` +
      "This operation needs Zone Read and Single Redirect Edit (Dynamic URL Redirects Write) for masonhu.cc. No Worker binding has been removed."
    );
  }
  return data.result;
}

const zones = await api("/zones?name=masonhu.cc&status=active");
if (zones.length !== 1 || (accountId && zones[0].account.id !== accountId)) {
  throw new Error("Expected exactly one active masonhu.cc zone in the configured Cloudflare account.");
}
const zoneId = zones[0].id;
const entrypoint = `/zones/${zoneId}/rulesets/phases/${phase}/entrypoint`;
let ruleset = await api(entrypoint, "GET", undefined, true);

if (!ruleset) {
  await api(`/zones/${zoneId}/rulesets`, "POST", {
    name: "Redirect rules",
    kind: "zone",
    phase,
    rules: [desired],
  });
  console.log("Created Single Redirect ruleset and HolidayGO redirect.");
} else {
  const normalize = (value) => value.replace(/[\s()]/g, "");
  const matches = (ruleset.rules ?? []).filter(
    (rule) => rule.ref === ref || (rule.action === "redirect" && normalize(rule.expression) === normalize(expression))
  );
  if (matches.length > 1) {
    throw new Error("Multiple existing redirects match the legacy hostname. Inspect them before changing rules.");
  }
  const existing = matches[0];
  const first = ruleset.rules?.[0];
  const position = first && first.id !== existing?.id ? { before: first.id } : undefined;
  const body = { ...desired, ...(position ? { position } : {}) };
  const base = `/zones/${zoneId}/rulesets/${ruleset.id}/rules`;
  if (existing) {
    await api(`${base}/${existing.id}`, "PATCH", body);
    console.log("Updated the HolidayGO redirect; other rules were preserved.");
  } else {
    await api(base, "POST", body);
    console.log("Added the HolidayGO redirect; other rules were preserved.");
  }
}

ruleset = await api(entrypoint);
const configured = ruleset.rules?.find((rule) => rule.ref === ref);
const value = configured?.action_parameters?.from_value;
if (
  !configured?.enabled || configured.expression !== expression || configured.action !== "redirect" ||
  value?.target_url?.expression !== targetExpression || value.status_code !== 308 || !value.preserve_query_string
) {
  throw new Error("Cloudflare did not return the expected enabled redirect configuration.");
}
console.log("Verified enabled rule: holiday.masonhu.cc → https://holiday.masonhu.org, 308, path and query preserved.");

for (const scheme of ["http", "https"]) {
  const url = `${scheme}://holiday.masonhu.cc/about?from=old`;
  const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(30_000) });
  if (response.status !== 308 || response.headers.get("location") !== "https://holiday.masonhu.org/about?from=old") {
    throw new Error(`Public redirect check failed for ${url}: HTTP ${response.status}. Worker bindings have not been removed.`);
  }
  await response.body?.cancel();
  console.log(`Verified ${url}: HTTP 308 with expected Location.`);
}
