# GitLab Skill 使用指南

翻译: [English](README.md) | [한국어](README.ko.md)

这个文件夹包含一个 agent skill。它可以在不启动 GitLab MCP 服务器的情况下读取 GitLab 信息，并发布评论。
非开发人员也可以通过复制并运行下面的 Terminal 命令来使用。

## 使用 skills 安装

为所有支持的 agent 全局安装此 skill：

```shell
npx -y skills add <repository-url> -s gitlab-skill --all -g
```

如果使用本地 checkout：

```shell
cd /Users/tao.exe/Documents/gitlab-skill
npx -y skills add . -s gitlab-skill --all -g
```

如果遇到 npm cache 权限错误，请使用临时 cache：

```shell
NPM_CONFIG_CACHE=/private/tmp/skills-cache npx -y skills add . -s gitlab-skill --all -g
```

如果只想安装到某一个 agent，请把 `--all` 替换为 `-a <agent-name>`。

## 1. 你需要准备什么

需要 3 样东西。

1. GitLab 账号
2. GitLab Personal Access Token
3. Node.js 18 或更高版本

检查是否已安装 Node.js：

```shell
node --version
```

显示 `v18` 或更高版本即可。

## 2. 创建 GitLab Token

在 GitLab 中创建 Personal Access Token。

1. 打开 GitLab
2. 点击右上角个人头像
3. 进入 Preferences 或 Edit profile
4. 打开 Access Tokens
5. 创建新的 token
6. 大多数情况下选择 `api` 权限
7. 复制生成的 token

Token 和密码一样重要。不要在聊天、文档或屏幕录制中泄露。

## 3. 设置 Token

在 Terminal 中运行：

```shell
export GITLAB_PERSONAL_ACCESS_TOKEN="在这里粘贴_token"
```

如果使用的是公司 GitLab，而不是 GitLab.com，也要设置 API 地址：

```shell
export GITLAB_API_URL="https://gitlab.example.com/api/v4"
```

把 `gitlab.example.com` 替换成公司的 GitLab 地址。

## 4. 打开这个文件夹

运行：

```shell
cd /Users/tao.exe/Documents/gitlab-skill
```

## 5. 检查连接

检查是否能读取你的 GitLab 账号：

```shell
node scripts/gitlab_api.mjs me
```

如果正常，会以 JSON 格式输出你的账号信息。

如果出现 token 错误，请检查：

- 是否在当前 Terminal 窗口运行了 `export GITLAB_PERSONAL_ACCESS_TOKEN="..."`
- token 是否有 `api` 权限

## 6. 项目名称格式

项目可以使用数字 ID，也可以使用项目路径。

示例：

```text
123456
group/project
group/subgroup/project
```

如果 GitLab URL 是：

```text
https://gitlab.example.com/bank/mobile-app
```

项目值应写成：

```text
bank/mobile-app
```

## 7. 常用命令

查看打开的 Merge Request 列表：

```shell
node scripts/gitlab_api.mjs list-mrs "group/project" --state opened --per-page 30
```

查看单个 Merge Request：

```shell
node scripts/gitlab_api.mjs get-mr "group/project" 12
```

查看 Merge Request 修改的文件列表：

```shell
node scripts/gitlab_api.mjs mr-files "group/project" 12
```

查看 Merge Request diff：

```shell
node scripts/gitlab_api.mjs mr-diffs "group/project" 12 --unidiff true
```

查看 Merge Request 评论列表：

```shell
node scripts/gitlab_api.mjs mr-notes "group/project" 12
```

给 Merge Request 发布普通评论：

```shell
node scripts/gitlab_api.mjs create-mr-note "group/project" 12 --body "Checked."
```

查看打开的 Issue 列表：

```shell
node scripts/gitlab_api.mjs list-issues "group/project" --state opened --per-page 30
```

查看单个 Issue：

```shell
node scripts/gitlab_api.mjs get-issue "group/project" 34
```

查看 Issue 评论列表：

```shell
node scripts/gitlab_api.mjs issue-notes "group/project" 34
```

给 Issue 发布评论：

```shell
node scripts/gitlab_api.mjs create-issue-note "group/project" 34 --body "Checked."
```

读取文件内容：

```shell
node scripts/gitlab_api.mjs file "group/project" "README.md" --ref main
```

搜索代码：

```shell
node scripts/gitlab_api.mjs search-code "group/project" --search "搜索词" --ref main
```

查看 Pipeline 列表：

```shell
node scripts/gitlab_api.mjs pipelines "group/project" --ref main --per-page 10
```

查看 Pipeline 中的 job 列表：

```shell
node scripts/gitlab_api.mjs jobs "group/project" 123456
```

查看 job 日志：

```shell
node scripts/gitlab_api.mjs job-log "group/project" 987654
```

## 8. 让 AI agent 使用它

可以这样告诉你的 AI agent：

```text
Use $gitlab-skill to review MR 12 in group/project. Do not use MCP.
```

或者：

```text
Use $gitlab-skill to list open MRs in group/project.
```

## 9. 注意事项

- 评论命令会真的在 GitLab 上发布评论。
- 不要把 token 保存到文档中。
- 如果输出太长，可以用 `--per-page 10` 减少数量。
- 如果使用公司 GitLab，可能需要设置 `GITLAB_API_URL`。

## 10. 问题排查

`Missing GitLab token`：

```shell
export GITLAB_PERSONAL_ACCESS_TOKEN="在这里粘贴_token"
```

`401 Unauthorized`：

- token 错误或已过期。
- 确认 token 有 `api` 权限。

`404 Not Found`：

- 项目路径可能不正确。
- 你的账号可能没有该项目的访问权限。

如果使用公司 GitLab，但请求似乎发到了 GitLab.com：

```shell
export GITLAB_API_URL="https://公司_gitlab_地址/api/v4"
```
