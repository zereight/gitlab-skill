# GitLab Skill 사용 가이드

번역: [English](README.md) | [中文](README.zh.md)

이 폴더는 GitLab MCP 서버를 켜지 않고도 GitLab 정보를 조회하거나 댓글을 남길 수 있게 만든 agent skill입니다.
비개발자도 터미널에서 아래 명령을 복사해 실행하는 방식으로 사용할 수 있습니다.

## skills로 설치하기

지원되는 모든 agent에 전역 skill로 설치합니다.

```shell
npx -y skills add <repository-url> -s gitlab-skill --all -g
```

로컬 폴더에서 설치할 때:

```shell
cd /Users/tao.exe/Documents/gitlab-skill
npx -y skills add . -s gitlab-skill --all -g
```

npm cache 권한 오류가 나면 임시 cache를 사용합니다.

```shell
NPM_CONFIG_CACHE=/private/tmp/skills-cache npx -y skills add . -s gitlab-skill --all -g
```

특정 agent에만 설치하려면 `--all` 대신 `-a <agent-name>`을 사용합니다.

## 1. 준비물

필요한 것은 3가지입니다.

1. GitLab 계정
2. GitLab Personal Access Token
3. Node.js 18 이상

Node.js가 설치되어 있는지 확인합니다.

```shell
node --version
```

`v18` 이상이면 됩니다.

## 2. GitLab Token 만들기

GitLab에서 Personal Access Token을 만듭니다.

1. GitLab 접속
2. 오른쪽 위 프로필 클릭
3. Preferences 또는 Edit profile 이동
4. Access Tokens 메뉴 이동
5. 새 token 생성
6. 보통 `api` 권한 선택
7. 생성된 token 복사

Token은 비밀번호와 같습니다. 채팅, 문서, 화면 녹화에 노출하지 마세요.

## 3. Token 등록

터미널에서 실행합니다.

```shell
export GITLAB_PERSONAL_ACCESS_TOKEN="여기에_토큰_붙여넣기"
```

GitLab.com이 아니라 회사 GitLab을 쓰면 API 주소도 등록합니다.

```shell
export GITLAB_API_URL="https://gitlab.example.com/api/v4"
```

`gitlab.example.com` 부분은 회사 GitLab 주소로 바꿉니다.

## 4. 폴더 이동

실행합니다.

```shell
cd /Users/tao.exe/Documents/gitlab-skill
```

## 5. 연결 확인

내 GitLab 계정이 조회되는지 확인합니다.

```shell
node scripts/gitlab_api.mjs me
```

정상이라면 내 계정 정보가 JSON 형태로 출력됩니다.

Token 오류가 나면 확인합니다.

- 현재 터미널 창에서 `export GITLAB_PERSONAL_ACCESS_TOKEN="..."` 를 실행했는지
- token에 `api` 권한이 있는지

## 6. 프로젝트 이름 쓰는 법

프로젝트는 숫자 ID 또는 경로로 입력할 수 있습니다.

예시:

```text
123456
group/project
group/subgroup/project
```

GitLab URL이 아래와 같다면:

```text
https://gitlab.example.com/bank/mobile-app
```

프로젝트 값은 이렇게 씁니다.

```text
bank/mobile-app
```

## 7. 자주 쓰는 명령

열린 Merge Request 목록 보기:

```shell
node scripts/gitlab_api.mjs list-mrs "group/project" --state opened --per-page 30
```

Merge Request 하나 보기:

```shell
node scripts/gitlab_api.mjs get-mr "group/project" 12
```

Merge Request 변경 파일 목록 보기:

```shell
node scripts/gitlab_api.mjs mr-files "group/project" 12
```

Merge Request diff 보기:

```shell
node scripts/gitlab_api.mjs mr-diffs "group/project" 12 --unidiff true
```

Merge Request 댓글 목록 보기:

```shell
node scripts/gitlab_api.mjs mr-notes "group/project" 12
```

Merge Request에 일반 댓글 남기기:

```shell
node scripts/gitlab_api.mjs create-mr-note "group/project" 12 --body "확인했습니다."
```

열린 Issue 목록 보기:

```shell
node scripts/gitlab_api.mjs list-issues "group/project" --state opened --per-page 30
```

Issue 하나 보기:

```shell
node scripts/gitlab_api.mjs get-issue "group/project" 34
```

Issue 댓글 목록 보기:

```shell
node scripts/gitlab_api.mjs issue-notes "group/project" 34
```

Issue에 댓글 남기기:

```shell
node scripts/gitlab_api.mjs create-issue-note "group/project" 34 --body "확인했습니다."
```

파일 내용 보기:

```shell
node scripts/gitlab_api.mjs file "group/project" "README.md" --ref main
```

코드 검색:

```shell
node scripts/gitlab_api.mjs search-code "group/project" --search "검색어" --ref main
```

Pipeline 목록 보기:

```shell
node scripts/gitlab_api.mjs pipelines "group/project" --ref main --per-page 10
```

Pipeline의 job 목록 보기:

```shell
node scripts/gitlab_api.mjs jobs "group/project" 123456
```

Job 로그 보기:

```shell
node scripts/gitlab_api.mjs job-log "group/project" 987654
```

## 8. AI agent에게 시킬 때

사용 중인 AI agent에게는 이렇게 말하면 됩니다.

```text
$gitlab-skill 써서 group/project MR 12 리뷰해줘. MCP는 쓰지 마.
```

또는:

```text
$gitlab-skill 써서 group/project 열린 MR 목록 보여줘.
```

## 9. 주의사항

- 댓글 작성 명령은 실제 GitLab에 글을 남깁니다.
- token은 문서에 저장하지 마세요.
- 조회가 너무 길면 `--per-page 10`처럼 개수를 줄이세요.
- 회사 GitLab이면 `GITLAB_API_URL` 설정이 필요할 수 있습니다.

## 10. 문제 해결

`Missing GitLab token` 오류:

```shell
export GITLAB_PERSONAL_ACCESS_TOKEN="여기에_토큰_붙여넣기"
```

`401 Unauthorized` 오류:

- token이 틀렸거나 만료됐습니다.
- token 권한에 `api`가 있는지 확인하세요.

`404 Not Found` 오류:

- 프로젝트 경로가 틀렸을 수 있습니다.
- 해당 프로젝트 접근 권한이 없을 수 있습니다.

회사 GitLab인데 GitLab.com으로 연결되는 것 같을 때:

```shell
export GITLAB_API_URL="https://회사_gitlab_주소/api/v4"
```
