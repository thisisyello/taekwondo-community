# Taekwondo Community

태권도 커뮤니티 게시판 UI를 연습용으로 구현한 React 프로젝트입니다.
현재는 로컬 state 기반으로 게시글 목록, 게시판 필터, 글 등록/삭제 기능을 다루고 있습니다.

## Tech Stack

- React
- TypeScript
- Vite

## Features

- 게시글 목록 조회
- 게시판별 게시글 필터링
- 게시글 등록
- 게시글 삭제
- `BoardFilter`, `PostList`, `PostForm` 컴포넌트 분리

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

- `src/App.tsx`: 전체 상태 관리와 컴포넌트 조합
- `src/components/BoardFilter.tsx`: 게시판 필터 버튼
- `src/components/PostList.tsx`: 게시글 목록 렌더링
- `src/components/PostForm.tsx`: 게시글 등록 폼
- `src/types/board.ts`: 게시판/게시글 공통 타입

## Current Limitations

- 데이터는 서버나 DB가 아닌 로컬 state로만 관리됩니다.
- 게시글 수정 기능은 아직 없습니다.
- 인증, 권한, 댓글 기능은 구현되어 있지 않습니다.
- 스타일링은 계속 정리 중인 단계입니다.

## Next Steps

- 게시글 수정 기능 추가
- 로컬 저장소 또는 API 연동
- 게시판 이름 표시 방식 개선
- UI 스타일 정리
