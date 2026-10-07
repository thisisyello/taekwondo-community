# Taekwondo Community

태권도 커뮤니티 서비스를 위한 React 기반 프론트엔드 프로젝트입니다.
회원가입과 로그인은 Supabase Auth와 PostgreSQL 회원 테이블에 연결되어 있습니다. 게시글, 댓글, 검색, 정렬, 조회수, 좋아요는 아직 로컬 state로 관리되며 이후 데이터 저장소에 연결할 계획입니다.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Supabase Auth / PostgreSQL

## Features

- 이메일/비밀번호 회원가입, 이메일 인증, 로그인/로그아웃
- 인증 세션 복원과 토큰 갱신
- 공용 닉네임과 본인 전용 개인정보 분리 저장
- 게시글 목록 조회
- 게시판별 게시글 필터링
- 최신순, 오래된순, 댓글 많은순 정렬
- 스크롤 위치에 따라 게시글을 지정 개수만큼 추가 노출
- 게시글 등록
- 게시글 상세 조회
- 게시글 수정
- 게시글 삭제
- 게시글 조회수 표시 및 상세 진입 시 증가
- 게시글 좋아요 수 증가
- 댓글 등록
- 댓글 수정
- 댓글 삭제
- 댓글 수 표시
- 제목, 내용, 작성자 기준 검색
- 검색 결과 수와 검색 결과 없음 상태 표시
- 게시글/댓글 작성 폼 유효성 메시지 표시

## Getting Started

Node.js 24 이상을 권장합니다. `.env.local`에 다음 값을 설정합니다.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

`.env.local`은 Git에서 제외됩니다. 관리자용 secret/service_role 키는 프런트엔드에 넣지 않습니다.

### Supabase Setup

1. Supabase SQL Editor에서 `supabase/migrations/202610070001_member_profiles.sql`을 한 번 실행합니다. 새 프로젝트 기준이며 기존 회원은 자동으로 이전하지 않습니다.
2. Authentication 설정에서 이메일/비밀번호 로그인을 활성화하고 이메일 인증을 유지합니다. 최소 비밀번호 길이는 8자로 설정합니다.
3. URL Configuration의 Site URL을 실제 개발 서버 주소로 설정하고, Redirect URLs에 해당 주소의 `/auth/callback`을 등록합니다. 예: `http://localhost:5173/auth/callback`. 포트나 호스트가 바뀌면 함께 갱신합니다.
4. 일반 사용자에게 인증 메일을 보내려면 Custom SMTP를 설정합니다. 기본 발송은 프로젝트 팀에 등록된 이메일만 지원합니다. [공식 SMTP 안내](https://supabase.com/docs/guides/auth/auth-smtp)

가입 시 DB 트리거가 `profiles`와 `account_details`를 함께 생성합니다. 닉네임은 대소문자와 앞뒤 공백을 무시하고 중복을 금지합니다. 닉네임은 공개 조회 가능하지만 실명, 생년월일, 전화번호는 본인만 조회할 수 있습니다. 역할은 DB에서 기본값 `member`로 부여하며 클라이언트에서 변경할 수 없습니다. 개인정보 입력은 전화번호 본인 인증이나 도장 인증을 의미하지 않습니다.

```bash
npm install
npm run dev
```

## Available Scripts

```bash
npm run dev
npm run build
npm run lint
npm test
npm run preview
```

## Project Structure

- `src/App.tsx`: 전체 상태 관리, 라우팅, 게시글/댓글 이벤트 처리
- `src/lib/supabase.ts`: Supabase 클라이언트와 환경변수 연결
- `src/services/auth.ts`: 인증 요청과 회원 정보 조회
- `src/hooks/useAuth.ts`: 인증 상태 구독과 현재 회원 복원
- `supabase/migrations/`: 회원 테이블, 접근 권한, 가입 트리거 SQL
- `tests/auth.test.mjs`: 입력 검증과 로컬 PostgreSQL 접근 권한 테스트
- `src/pages/auth/`: 로그인과 회원가입 화면
- `src/pages/board/BoardPage.tsx`: 게시글 목록 화면
- `src/pages/board/SearchPage.tsx`: 게시글 검색 화면
- `src/pages/board/PostDetailPage.tsx`: 게시글 상세와 댓글 화면
- `src/pages/board/PostEditorPage.tsx`: 게시글 작성/수정 화면
- `src/pages/dojang/`: 도장 화면
- `src/pages/chat/`: 채팅 화면
- `src/pages/account/`: 내정보 화면
- `src/components/layout/`: 공통 레이아웃, 상단바, 하단바
- `src/components/common/`: 전역 토스트 등 공통 컴포넌트
- `src/components/board/BoardFilter.tsx`: 게시판 필터 버튼
- `src/components/board/PostList.tsx`: 게시글 목록, 정렬, 스크롤 더보기
- `src/components/board/PostItem.tsx`: 게시글 목록 아이템
- `src/components/board/PostForm.tsx`: 게시글 작성/수정 폼
- `src/components/board/CommentForm.tsx`: 댓글 작성 폼
- `src/components/board/CommentList.tsx`: 댓글 목록
- `src/components/board/CommentItem.tsx`: 댓글 아이템과 수정/삭제 메뉴
- `src/data/initialBoardData.ts`: 초기 게시글/댓글 데이터
- `src/types/board.ts`: 게시판, 게시글, 댓글, 검색, 정렬 타입
- `src/utils/postList.ts`: 게시글 필터링, 검색, 정렬, 댓글 수 계산
- `src/utils/date.ts`: 날짜 표시와 수정 여부 처리

## Routes

- `/login`: 로그인
- `/signup`: 회원가입과 이메일 인증 안내
- `/auth/callback`: 이메일 인증 복귀
- `/`: 게시글 목록
- `/search`: 게시글 검색
- `/posts/new`: 게시글 작성
- `/posts/:postId`: 게시글 상세
- `/posts/:postId/edit`: 게시글 수정

## Current Limitations

- 회원 정보와 인증은 Supabase에 저장되며, 게시글과 댓글은 로컬 state로 관리됩니다.
- 새로고침하면 작성한 게시글, 댓글, 조회수, 좋아요 변경이 초기화됩니다.
- 글쓰기와 댓글 작성은 로그인이 필요하고 수정/삭제 버튼은 작성자에게만 표시됩니다. 게시판 데이터의 서버 권한 검증은 게시판 DB 연결 시 구현해야 합니다.
- 비밀번호 재설정과 도장 인증은 아직 연결되지 않았습니다.
- 좋아요 중복 방지는 아직 없습니다.
- 공지와 상단 고정 정책은 아직 확정하지 않았습니다.
- 실제 페이지네이션 API가 아니라 클라이언트 배열을 나누어 보여주는 방식입니다.

## Next Steps

- 비밀번호 재설정
- 게시판 DB 연결과 서버 권한 검증
- 사용자별 좋아요 중복 방지
- 공지와 상단 고정 정책 정리
- API와 데이터 저장소 연동
