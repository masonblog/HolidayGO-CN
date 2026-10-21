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
  if (response.status === 204 && response.ok) return null;
  const text = await response.text();
  if (!text && response.ok && method === "DELETE") return null;
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Cloudflare ${method} ${path} returned an invalid response (HTTP ${response.status}).`);
  }
  if (allowNotFound && response.status === 404) return null;
  if (!response.ok || !data.success) {
    const errors = (data.errors ?? [])
      .map(({ code, message }) => `${code}: ${message}`)
      .join("; ")
      .replaceAll(token, "[REDACTED]");
    throw new Error(
      `Cloudflare ${method} ${path} failed (HTTP ${response.status}): ${errors}. ` +
      "Rules need Zone Read and Single Redirect Edit; DNS changes need DNS Edit; Worker domain changes need Workers Scripts Edit."
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
  let verified = false;
  for (let attempt = 1; attempt <= 12; attempt++) {
    const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15_000) });
    const location = response.headers.get("location");
    await response.body?.cancel();
    if (response.status === 308 && location === "https://holiday.masonhu.org/about?from=old") {
      verified = true;
      break;
    }
    console.log(`Waiting for redirect propagation (${scheme}, attempt ${attempt}, HTTP ${response.status}).`);
    if (attempt < 12) await new Promise((resolve) => setTimeout(resolve, 5_000));
  }
  if (!verified) throw new Error(`Public redirect check failed for ${url}. Worker bindings have not been removed.`);
  console.log(`Verified ${url}: HTTP 308 with expected Location.`);
}

if (process.env.DETACH_LEGACY_WORKER === "true") {
  if (!accountId) throw new Error("CLOUDFLARE_ACCOUNT_ID is required to detach the old Worker domain.");
  const domainPath = `/accounts/${accountId}/workers/domains`;
  const dnsPath = `/zones/${zoneId}/dns_records`;
  const listDns = () => api(`${dnsPath}?name=holiday.masonhu.cc`);
  const domains = await api(`${domainPath}?hostname=holiday.masonhu.cc`);
  if (domains.length > 1 || domains.some((domain) => domain.service !== "holidaygo-cn" || domain.zone_id !== zoneId)) {
    throw new Error("Unexpected Worker bindings for the old hostname; no binding was changed.");
  }
  // Check DNS read access before detaching. Restore the domain if DNS setup fails.
  await listDns();
  const previous = domains[0];
  let detached = false;
  let createdDnsId;
  let changedDns;
  try {
    if (previous) {
      await api(`${domainPath}/${previous.id}`, "DELETE");
      detached = true;
      console.log("Detached holiday.masonhu.cc from holidaygo-cn.");
    }
    const records = (await listDns()).filter((record) => ["A", "AAAA", "CNAME"].includes(record.type));
    if (!records.some((record) => record.proxied)) {
      if (records.length) {
        await api(`${dnsPath}/${records[0].id}`, "PATCH", { proxied: true });
        changedDns = { id: records[0].id, proxied: records[0].proxied };
      } else {
        const created = await api(dnsPath, "POST", {
          type: "A",
          name: "holiday.masonhu.cc",
          content: "192.0.2.1",
          ttl: 1,
          proxied: true,
          comment: "HolidayGO Single Redirect; no origin server required",
        });
        createdDnsId = created.id;
      }
    }
    if (!(await listDns()).some((record) => ["A", "AAAA", "CNAME"].includes(record.type) && record.proxied)) {
      throw new Error("No proxied DNS record exists after detaching the old Worker domain.");
    }
    if ((await api(`${domainPath}?hostname=holiday.masonhu.cc`)).length) {
      throw new Error("The old Worker domain is still attached.");
    }
    for (const scheme of ["http", "https"]) {
      const response = await fetch(`${scheme}://holiday.masonhu.cc/about?from=old`, {
        redirect: "manual",
        signal: AbortSignal.timeout(15_000),
      });
      await response.body?.cancel();
      if (response.status !== 308 || response.headers.get("location") !== "https://holiday.masonhu.org/about?from=old") {
        throw new Error("Redirect verification failed after detaching the old Worker domain.");
      }
    }
    console.log("Verified independent Single Redirect: proxied DNS exists, old Worker binding is absent, HTTP and HTTPS return 308.");
  } catch (error) {
    if (detached) {
      if (createdDnsId) await api(`${dnsPath}/${createdDnsId}`, "DELETE");
      if (changedDns) await api(`${dnsPath}/${changedDns.id}`, "PATCH", { proxied: changedDns.proxied });
      await api(domainPath, "PUT", {
        hostname: previous.hostname,
        service: previous.service,
        environment: previous.environment,
        zone_id: previous.zone_id,
      });
      console.log("Restored the old Worker domain after DNS or redirect verification failed.");
    }
    throw error;
  }
}
