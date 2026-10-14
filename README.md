# Taekwondo Community

태권도 커뮤니티 서비스를 위한 React 기반 프론트엔드 프로젝트입니다.
회원가입과 로그인은 Supabase Auth와 PostgreSQL 회원 테이블에 연결되어 있습니다. 게시글 목록/상세·댓글 조회와 게시글/댓글 등록도 DB에 연결되어 있으며, 나머지 게시판 저장 기능은 순차적으로 연결할 계획입니다.

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
- 로그인 회원의 게시글 DB 등록과 저장 상태/오류 안내
- 로그인 회원의 댓글 DB 등록, 입력 검증과 댓글 수 즉시 갱신
- 게시판별 게시글 필터링
- 최신순, 오래된순, 댓글 많은순 정렬
- 스크롤 위치에 따라 게시글을 지정 개수만큼 추가 노출
- 게시글 상세 조회
- 상세 진입당 1회 DB 조회수 증가와 갱신된 값 표시
- 게시글/댓글 조회 로딩, 오류, 재시도와 삭제된 게시글 안내
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
3. URL Configuration의 Site URL을 실제 개발 서버 주소로 설정하고, Redirect URLs에 해당 주소의 `/auth/callback`과 `/reset-password`를 등록합니다. 예: `http://localhost:5173/auth/callback`, `http://localhost:5173/reset-password`. 포트나 호스트가 바뀌면 함께 갱신합니다.
4. 일반 사용자에게 인증 메일을 보내려면 Custom SMTP를 설정합니다. 기본 발송은 프로젝트 팀에 등록된 이메일만 지원합니다. [공식 SMTP 안내](https://supabase.com/docs/guides/auth/auth-smtp)

가입 시 DB 트리거가 `profiles`와 `account_details`를 함께 생성합니다. 닉네임은 대소문자와 앞뒤 공백을 무시하고 중복을 금지합니다. 닉네임은 공개 조회 가능하지만 실명, 생년월일, 전화번호는 본인만 조회할 수 있습니다. 역할은 DB에서 기본값 `member`로 부여하며 클라이언트에서 변경할 수 없습니다. 개인정보 입력은 전화번호 본인 인증이나 도장 인증을 의미하지 않습니다.

### Board Database Setup

회원 테이블 생성 후 SQL Editor에서 `supabase/migrations/202610130001_board_posts_comments.sql` 전체를 한 번 실행합니다. 이미 적용한 회원 테이블 SQL은 다시 실행하지 않습니다.

조회수 갱신을 사용하려면 이후 `supabase/migrations/202610140001_post_view_count.sql` 전체를 한 번 실행합니다. 공개 게시글 조회수 증가 함수만 추가하며 기존 데이터를 초기화하지 않습니다.

- `posts`, `comments`는 비로그인도 조회할 수 있고, 로그인 회원은 본인 명의로 작성하고 본인 글만 수정/삭제할 수 있습니다.
- 제목은 200자, 본문은 20,000자, 댓글은 2,000자까지이며 공백만 입력할 수 없습니다.
- ID와 작성/수정 시간은 DB에서 생성합니다. 일반 클라이언트는 작성자, 작성일, 조회수, 댓글의 소속 게시글을 수정할 수 없습니다.
- 게시글 삭제 시 댓글도 삭제합니다. 회원 삭제 시 게시글/댓글은 유지하고 작성자 ID만 비웁니다.
- 내용이나 게시판 변경 시에만 수정일을 갱신합니다. 조회수 변경과 회원 삭제는 수정일에 영향을 주지 않습니다.
- 화면은 게시글 목록/상세, 댓글과 댓글 수를 DB에서 조회합니다. 조회수는 전용 DB 함수로 증가하며 공감 저장은 이후 연결합니다. 현재 SQL에는 관리자 계정의 타인 글 수정/삭제 권한이 없습니다.

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
- `/forgot-password`: 비밀번호 재설정 메일 요청
- `/reset-password`: 메일 링크 인증 후 새 비밀번호 설정
- `/`: 게시글 목록
- `/search`: 게시글 검색
- `/posts/new`: 게시글 작성
- `/posts/:postId`: 게시글 상세
- `/posts/:postId/edit`: 게시글 수정

## Current Limitations

- 게시글/댓글 등록은 DB에 연결되어 있으며, 작성자 ID·작성일은 DB에서 설정합니다. 게시글/댓글 수정·삭제는 아직 연결하지 않았으며 관련 동작을 비활성화했습니다.
- DB가 비어 있으면 빈 목록을 표시합니다. `initialBoardData.ts`의 샘플 데이터는 자동으로 표시하거나 DB에 저장하지 않습니다.
- 조회수는 상세 조회 성공 후 진입당 1회 증가합니다. 재진입/새로고침은 새 조회로 계산하며 동일 사용자의 반복 조회나 자동화 요청을 서버에서 제한하지 않습니다. 갱신 실패 시 기존 조회수로 게시글을 계속 표시합니다. 비공개 게시판 추가 전 조회수 함수의 접근 범위도 재검토해야 합니다. 공감 데이터는 아직 없어 0으로 표시합니다.
- 비밀번호 재설정은 Supabase 메일 링크로 인증한 뒤 진행하며, 완료 후 현재 브라우저에서 로그아웃합니다. 기본 메일 발송 제한에 걸리면 재설정 메일 요청도 제한됩니다.
- 도장 인증은 아직 연결되지 않았습니다.
- 좋아요 중복 방지는 아직 없습니다.
- 공지와 상단 고정 정책은 아직 확정하지 않았습니다.
- DB 데이터는 100개 단위로 전체 조회한 뒤 클라이언트에서 검색·필터·정렬하고 5개씩 추가 노출합니다. 대규모 운영 전 서버 검색·정렬·페이지네이션으로 전환해야 합니다.

## Next Steps

- 게시글/댓글 수정·삭제 연결 및 서버 권한 검증
- 서버 검색·정렬·스크롤 페이지네이션 연결
- 사용자별 좋아요 중복 방지
- 공지와 상단 고정 정책 정리
- API와 데이터 저장소 연동
