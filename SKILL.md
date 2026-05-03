---
name: gitlab-skill
description: Use this skill to inspect and operate GitLab projects without MCP by calling the GitLab REST API directly. Use it for GitLab merge requests, issues, repository files, code search, pipelines, jobs, and review comments when a GitLab token is available.
metadata:
  short-description: GitLab REST workflows without MCP
---

# GitLab Skill

Use this skill when the user wants GitLab work without running the `gitlab-mcp` MCP server.
The bundled helper calls the GitLab REST API directly with Node's built-in `fetch`.

## Requirements

- Node.js 18+
- Token in one of:
  - `GITLAB_PERSONAL_ACCESS_TOKEN`
  - `GITLAB_TOKEN`
  - `GITLAB_JOB_TOKEN`
- Optional API URL:
  - `GITLAB_API_URL` defaults to `https://gitlab.com/api/v4`

For self-hosted GitLab, set `GITLAB_API_URL` to the full API base, for example:

```shell
GITLAB_API_URL=https://gitlab.example.com/api/v4
```

## Helper

Run from this skill directory:

```shell
node scripts/gitlab_api.mjs <command> [args] [--key value]
```

Project identifiers may be numeric IDs or path IDs such as `group/subgroup/repo`.
The helper URL-encodes project IDs correctly.

## Core Commands

Read-only:

```shell
node scripts/gitlab_api.mjs me
node scripts/gitlab_api.mjs project <project>
node scripts/gitlab_api.mjs list-mrs [project] --state opened --per-page 30
node scripts/gitlab_api.mjs get-mr <project> <iid>
node scripts/gitlab_api.mjs mr-diffs <project> <iid> --unidiff true
node scripts/gitlab_api.mjs mr-files <project> <iid>
node scripts/gitlab_api.mjs mr-notes <project> <iid>
node scripts/gitlab_api.mjs list-issues [project] --state opened --per-page 30
node scripts/gitlab_api.mjs get-issue <project> <iid>
node scripts/gitlab_api.mjs issue-notes <project> <iid>
node scripts/gitlab_api.mjs pipelines <project> --ref main --per-page 10
node scripts/gitlab_api.mjs jobs <project> <pipeline_id>
node scripts/gitlab_api.mjs job-log <project> <job_id>
node scripts/gitlab_api.mjs file <project> <file_path> --ref main
node scripts/gitlab_api.mjs search-code <project> --search "query" --ref main
```

Mutating:

```shell
node scripts/gitlab_api.mjs create-mr-note <project> <iid> --body "comment"
node scripts/gitlab_api.mjs create-issue-note <project> <iid> --body "comment"
```

Only run mutating commands when the user explicitly asks for the write action.
For reviews, inspect MR metadata, changed files, diffs, and notes before commenting.

## Fallback Raw API

When a needed endpoint is not wrapped:

```shell
node scripts/gitlab_api.mjs api GET /projects/<encoded_project_id>/merge_requests
node scripts/gitlab_api.mjs api POST /projects/<encoded_project_id>/merge_requests/1/notes --body "text"
```

The raw `api` command accepts method, API path, and `--key value` options.
Use paths relative to `/api/v4`.

## Output Handling

- The helper prints JSON for API responses.
- Large text responses, such as job logs, are printed as text.
- Prefer `--per-page` to control payload size.
- For code review, summarize findings with exact file paths and line references from the diff.
