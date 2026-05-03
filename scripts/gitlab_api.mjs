#!/usr/bin/env node

const API_URL = (process.env.GITLAB_API_URL || "https://gitlab.com/api/v4").replace(/\/+$/, "");
const TOKEN =
  process.env.GITLAB_PERSONAL_ACCESS_TOKEN ||
  process.env.GITLAB_TOKEN ||
  process.env.GITLAB_JOB_TOKEN;

function usage() {
  console.error(`Usage: node scripts/gitlab_api.mjs <command> [args] [--key value]

Commands:
  me
  project <project>
  list-mrs [project]
  get-mr <project> <iid>
  mr-diffs <project> <iid>
  mr-files <project> <iid>
  mr-notes <project> <iid>
  create-mr-note <project> <iid> --body <text>
  list-issues [project]
  get-issue <project> <iid>
  issue-notes <project> <iid>
  create-issue-note <project> <iid> --body <text>
  pipelines <project>
  jobs <project> <pipeline_id>
  job-log <project> <job_id>
  file <project> <file_path>
  search-code <project> --search <query>
  api <METHOD> <path>`);
}

function parseArgv(argv) {
  const positional = [];
  const options = {};

  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) {
      positional.push(item);
      continue;
    }

    const raw = item.slice(2);
    const eq = raw.indexOf("=");
    if (eq >= 0) {
      options[toSnake(raw.slice(0, eq))] = raw.slice(eq + 1);
      continue;
    }

    const key = toSnake(raw);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      options[key] = "true";
    } else {
      options[key] = next;
      i += 1;
    }
  }

  return { positional, options };
}

function toSnake(value) {
  return value.replaceAll("-", "_");
}

function encodeProject(project) {
  return encodeURIComponent(decodeURIComponent(project));
}

function cleanOptions(options) {
  const result = {};
  for (const [key, value] of Object.entries(options)) {
    if (value === undefined || value === "") continue;
    result[key] = value;
  }
  return result;
}

function withQuery(path, options = {}) {
  const url = new URL(`${API_URL}${path}`);
  for (const [key, value] of Object.entries(cleanOptions(options))) {
    if (key === "body") continue;
    url.searchParams.set(key, String(value));
  }
  return url;
}

function authHeaders(extra = {}) {
  if (!TOKEN) {
    throw new Error("Missing GitLab token. Set GITLAB_PERSONAL_ACCESS_TOKEN, GITLAB_TOKEN, or GITLAB_JOB_TOKEN.");
  }

  const authHeader = process.env.GITLAB_JOB_TOKEN && !process.env.GITLAB_PERSONAL_ACCESS_TOKEN && !process.env.GITLAB_TOKEN
    ? { "JOB-TOKEN": TOKEN }
    : { "PRIVATE-TOKEN": TOKEN };

  return { ...authHeader, ...extra };
}

async function request(method, path, { query = {}, body, raw = false } = {}) {
  const url = withQuery(path, query);
  const headers = body === undefined
    ? authHeaders()
    : authHeaders({ "Content-Type": "application/json" });

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${url.pathname}${url.search} failed: ${response.status} ${response.statusText}\n${text}`);
  }

  if (raw) return text;
  if (!text) return null;

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return JSON.parse(text);

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function print(value) {
  if (typeof value === "string") {
    process.stdout.write(value);
    if (!value.endsWith("\n")) process.stdout.write("\n");
    return;
  }
  console.log(JSON.stringify(value, null, 2));
}

async function main() {
  const { positional, options } = parseArgv(process.argv.slice(2));
  const command = positional.shift();

  if (!command || command === "help" || command === "--help") {
    usage();
    process.exit(command ? 0 : 1);
  }

  switch (command) {
    case "me":
      return print(await request("GET", "/user"));

    case "project": {
      const [project] = positional;
      requireArgs(command, { project });
      return print(await request("GET", `/projects/${encodeProject(project)}`));
    }

    case "list-mrs": {
      const [project] = positional;
      const path = project ? `/projects/${encodeProject(project)}/merge_requests` : "/merge_requests";
      return print(await request("GET", path, { query: options }));
    }

    case "get-mr": {
      const [project, iid] = positional;
      requireArgs(command, { project, iid });
      return print(await request("GET", `/projects/${encodeProject(project)}/merge_requests/${iid}`));
    }

    case "mr-diffs": {
      const [project, iid] = positional;
      requireArgs(command, { project, iid });
      return print(await request("GET", `/projects/${encodeProject(project)}/merge_requests/${iid}/diffs`, { query: options }));
    }

    case "mr-files": {
      const [project, iid] = positional;
      requireArgs(command, { project, iid });
      const diffs = await request("GET", `/projects/${encodeProject(project)}/merge_requests/${iid}/diffs`, { query: options });
      return print(diffs.map((diff) => ({
        old_path: diff.old_path,
        new_path: diff.new_path,
        new_file: diff.new_file,
        renamed_file: diff.renamed_file,
        deleted_file: diff.deleted_file,
      })));
    }

    case "mr-notes": {
      const [project, iid] = positional;
      requireArgs(command, { project, iid });
      return print(await request("GET", `/projects/${encodeProject(project)}/merge_requests/${iid}/notes`, { query: options }));
    }

    case "create-mr-note": {
      const [project, iid] = positional;
      requireArgs(command, { project, iid, body: options.body });
      return print(await request("POST", `/projects/${encodeProject(project)}/merge_requests/${iid}/notes`, {
        body: { body: options.body },
      }));
    }

    case "list-issues": {
      const [project] = positional;
      const path = project ? `/projects/${encodeProject(project)}/issues` : "/issues";
      return print(await request("GET", path, { query: options }));
    }

    case "get-issue": {
      const [project, iid] = positional;
      requireArgs(command, { project, iid });
      return print(await request("GET", `/projects/${encodeProject(project)}/issues/${iid}`));
    }

    case "issue-notes": {
      const [project, iid] = positional;
      requireArgs(command, { project, iid });
      return print(await request("GET", `/projects/${encodeProject(project)}/issues/${iid}/notes`, { query: options }));
    }

    case "create-issue-note": {
      const [project, iid] = positional;
      requireArgs(command, { project, iid, body: options.body });
      return print(await request("POST", `/projects/${encodeProject(project)}/issues/${iid}/notes`, {
        body: { body: options.body },
      }));
    }

    case "pipelines": {
      const [project] = positional;
      requireArgs(command, { project });
      return print(await request("GET", `/projects/${encodeProject(project)}/pipelines`, { query: options }));
    }

    case "jobs": {
      const [project, pipelineId] = positional;
      requireArgs(command, { project, pipelineId });
      return print(await request("GET", `/projects/${encodeProject(project)}/pipelines/${pipelineId}/jobs`, { query: options }));
    }

    case "job-log": {
      const [project, jobId] = positional;
      requireArgs(command, { project, jobId });
      return print(await request("GET", `/projects/${encodeProject(project)}/jobs/${jobId}/trace`, { raw: true }));
    }

    case "file": {
      const [project, filePath] = positional;
      requireArgs(command, { project, filePath });
      const ref = options.ref || "main";
      const file = await request("GET", `/projects/${encodeProject(project)}/repository/files/${encodeURIComponent(filePath)}`, {
        query: { ref },
      });
      if (file && file.content && file.encoding === "base64") {
        file.decoded_content = Buffer.from(file.content, "base64").toString("utf8");
      }
      return print(file);
    }

    case "search-code": {
      const [project] = positional;
      requireArgs(command, { project, search: options.search });
      const query = { ...options, scope: "blobs" };
      return print(await request("GET", `/projects/${encodeProject(project)}/search`, { query }));
    }

    case "api": {
      const [method, rawPath] = positional;
      requireArgs(command, { method, rawPath });
      const normalizedMethod = method.toUpperCase();
      const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
      const body = options.body ? { body: options.body } : undefined;
      return print(await request(normalizedMethod, path, { query: options, body }));
    }

    default:
      usage();
      throw new Error(`Unknown command: ${command}`);
  }
}

function requireArgs(command, values) {
  const missing = Object.entries(values)
    .filter(([, value]) => value === undefined || value === "")
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(`${command}: missing required argument(s): ${missing.join(", ")}`);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
