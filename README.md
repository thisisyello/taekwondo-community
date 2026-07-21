# Taekwondo Community

태권도 커뮤니티 서비스를 위한 React 기반 프론트엔드 프로젝트입니다.
현재는 서비스 핵심 흐름을 빠르게 검증하기 위해 로컬 state 기반으로 게시글, 댓글, 검색, 정렬, 조회수, 좋아요 기능을 구현하고 있으며, 이후 인증, 권한, API, 데이터 저장소를 연동해 확장할 계획입니다.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

## Features

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

```bash
npm install
npm run dev
```

## Available Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Project Structure

- `src/App.tsx`: 전체 상태 관리, 라우팅, 게시글/댓글 이벤트 처리
- `src/pages/BoardPage.tsx`: 게시글 목록 화면
- `src/pages/SearchPage.tsx`: 게시글 검색 화면
- `src/pages/PostDetailPage.tsx`: 게시글 상세와 댓글 화면
- `src/pages/PostEditorPage.tsx`: 게시글 작성/수정 화면
- `src/components/BoardFilter.tsx`: 게시판 필터 버튼
- `src/components/PostList.tsx`: 게시글 목록, 정렬, 스크롤 더보기
- `src/components/PostItem.tsx`: 게시글 목록 아이템
- `src/components/PostForm.tsx`: 게시글 작성/수정 폼
- `src/components/CommentForm.tsx`: 댓글 작성 폼
- `src/components/CommentList.tsx`: 댓글 목록
- `src/components/CommentItem.tsx`: 댓글 아이템과 수정/삭제 메뉴
- `src/data/initialBoardData.ts`: 초기 게시글/댓글 데이터
- `src/types/board.ts`: 게시판, 게시글, 댓글, 검색, 정렬 타입
- `src/utils/postList.ts`: 게시글 필터링, 검색, 정렬, 댓글 수 계산
- `src/utils/date.ts`: 날짜 표시와 수정 여부 처리

## Routes

- `/`: 게시글 목록
- `/search`: 게시글 검색
- `/posts/new`: 게시글 작성
- `/posts/:postId`: 게시글 상세
- `/posts/:postId/edit`: 게시글 수정

## Current Limitations

- 현재 단계에서는 데이터가 서버나 DB가 아닌 로컬 state로만 관리됩니다.
- 새로고침하면 작성한 게시글, 댓글, 조회수, 좋아요 변경이 초기화됩니다.
- 인증과 권한이 없어 누구나 게시글과 댓글을 수정/삭제할 수 있습니다.
- 좋아요 중복 방지는 아직 없습니다.
- 공지와 상단 고정 정책은 아직 확정하지 않았습니다.
- 실제 페이지네이션 API가 아니라 클라이언트 배열을 나누어 보여주는 방식입니다.

## Next Steps

- 샘플 데이터 확장
- 로그인/회원 구조 설계
- 작성자 권한 기반 수정/삭제 처리
- 사용자별 좋아요 중복 방지
- 공지와 상단 고정 정책 정리
- API와 데이터 저장소 연동
