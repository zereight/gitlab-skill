# GitLab Skill User Guide

Translations: [한국어](README.ko.md) | [中文](README.zh.md)

This folder contains a Codex skill that lets you read GitLab information and post comments without running a GitLab MCP server.
Non-developers can use it by copying and running the commands below in Terminal.

## 1. What You Need

You need 3 things.

1. A GitLab account
2. A GitLab Personal Access Token
3. Node.js 18 or later

Check whether Node.js is installed:

```shell
node --version
```

`v18` or later is OK.

## 2. Create a GitLab Token

Create a Personal Access Token in GitLab.

1. Open GitLab
2. Click your profile in the top-right corner
3. Go to Preferences or Edit profile
4. Open Access Tokens
5. Create a new token
6. Select the `api` scope in most cases
7. Copy the generated token

Treat the token like a password. Do not share it in chat, documents, or screen recordings.

## 3. Set the Token

Run this in Terminal:

```shell
export GITLAB_PERSONAL_ACCESS_TOKEN="paste_your_token_here"
```

If you use a company GitLab instead of GitLab.com, also set the API URL:

```shell
export GITLAB_API_URL="https://gitlab.example.com/api/v4"
```

Replace `gitlab.example.com` with your company's GitLab host.

## 4. Open This Folder

Run:

```shell
cd /Users/tao.exe/Documents/gitlab-skill
```

## 5. Check the Connection

Check that your GitLab account can be read:

```shell
node scripts/gitlab_api.mjs me
```

If it works, your account information will be printed as JSON.

If token errors appear, check:

- You ran `export GITLAB_PERSONAL_ACCESS_TOKEN="..."` in the current Terminal window
- The token has the `api` scope

## 6. Project Name Format

You can use either a numeric project ID or a project path.

Examples:

```text
123456
group/project
group/subgroup/project
```

If the GitLab URL is:

```text
https://gitlab.example.com/bank/mobile-app
```

Use this project value:

```text
bank/mobile-app
```

## 7. Common Commands

List open merge requests:

```shell
node scripts/gitlab_api.mjs list-mrs "group/project" --state opened --per-page 30
```

Get one merge request:

```shell
node scripts/gitlab_api.mjs get-mr "group/project" 12
```

List changed files in a merge request:

```shell
node scripts/gitlab_api.mjs mr-files "group/project" 12
```

View merge request diff:

```shell
node scripts/gitlab_api.mjs mr-diffs "group/project" 12 --unidiff true
```

List merge request comments:

```shell
node scripts/gitlab_api.mjs mr-notes "group/project" 12
```

Post a general merge request comment:

```shell
node scripts/gitlab_api.mjs create-mr-note "group/project" 12 --body "Checked."
```

List open issues:

```shell
node scripts/gitlab_api.mjs list-issues "group/project" --state opened --per-page 30
```

Get one issue:

```shell
node scripts/gitlab_api.mjs get-issue "group/project" 34
```

List issue comments:

```shell
node scripts/gitlab_api.mjs issue-notes "group/project" 34
```

Post an issue comment:

```shell
node scripts/gitlab_api.mjs create-issue-note "group/project" 34 --body "Checked."
```

Read a file:

```shell
node scripts/gitlab_api.mjs file "group/project" "README.md" --ref main
```

Search code:

```shell
node scripts/gitlab_api.mjs search-code "group/project" --search "search term" --ref main
```

List pipelines:

```shell
node scripts/gitlab_api.mjs pipelines "group/project" --ref main --per-page 10
```

List jobs in a pipeline:

```shell
node scripts/gitlab_api.mjs jobs "group/project" 123456
```

View a job log:

```shell
node scripts/gitlab_api.mjs job-log "group/project" 987654
```

## 8. Ask Codex to Use It

You can ask Codex like this:

```text
Use $gitlab-skill to review MR 12 in group/project. Do not use MCP.
```

Or:

```text
Use $gitlab-skill to list open MRs in group/project.
```

## 9. Important Notes

- Comment commands write real comments to GitLab.
- Do not save your token in documents.
- If the output is too long, reduce the result count with `--per-page 10`.
- For company GitLab instances, you may need to set `GITLAB_API_URL`.

## 10. Troubleshooting

`Missing GitLab token`:

```shell
export GITLAB_PERSONAL_ACCESS_TOKEN="paste_your_token_here"
```

`401 Unauthorized`:

- The token is wrong or expired.
- Check that the token has the `api` scope.

`404 Not Found`:

- The project path may be wrong.
- Your account may not have access to the project.

If you use company GitLab but requests go to GitLab.com:

```shell
export GITLAB_API_URL="https://your_company_gitlab_host/api/v4"
```
