# YouTube Playlist Maker (YTMix)

YouTube 링크를 추가해서 나만의 플레이리스트를 만들고 관리할 수 있는 웹 애플리케이션입니다.

## 🎵 주요 기능

### 플레이리스트 관리
- **YouTube URL 추가**: 다양한 YouTube URL 형식 지원 (watch, shorts, live, embed 등)
- **드래그 앤 드롭**: 곡 순서를 자유롭게 변경
- **검색 및 필터**: 플레이리스트에서 원하는 곡을 빠르게 찾기
- **로컬 저장**: 브라우저에 플레이리스트 자동 저장

### 재생 기능
- **연속 재생**: 플레이리스트 전체 자동 재생
- **재생 모드**: 한 곡 반복, 전체 반복, 셔플 모드
- **재생 속도 조절**: 0.25x ~ 2x 속도 조절
- **부드러운 프로그레스바**: 실시간 재생 진도 표시

### 공유 기능
- **플레이리스트 공유**: URL을 통한 플레이리스트 공유 (최대 50곡)
- **URL 단축**: TinyURL, is.gd, bit.ly를 통한 짧은 링크 생성
- **자동 로딩**: 공유된 링크 클릭 시 자동으로 플레이리스트 로드

### 기타 기능
- **MP3 내보내기**: 플레이리스트를 다양한 형식으로 내보내기
- **다크/라이트 테마**: 사용자 선호에 따른 테마 지원
- **반응형 디자인**: 데스크톱과 모바일에서 최적화된 UI

## 🚀 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI 라이브러리**: Tailwind CSS, shadcn/ui, Radix UI
- **상태 관리**: React Hooks
- **드래그 앤 드롭**: @hello-pangea/dnd
- **개발 도구**: nodemon, ESLint

## 📦 설치 및 실행

### 요구사항
- Node.js 18+
- npm 또는 yarn

### 설치
```bash
git clone https://github.com/superwhyun/ytmix.git
cd ytmix
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

http://localhost:3000에서 애플리케이션에 접근할 수 있습니다.

### 빌드
```bash
npm run build
npm start
```

## 📖 사용법

### 1. 플레이리스트 만들기
1. YouTube URL을 입력창에 붙여넣기
2. "추가" 버튼 클릭 또는 Enter 키 입력
3. 비디오가 플레이리스트에 자동으로 추가됨

### 2. 플레이리스트 관리
- **순서 변경**: 비디오 카드를 드래그해서 순서 변경
- **곡 삭제**: 각 비디오 카드의 삭제 버튼 클릭
- **검색**: 플레이리스트가 4곡 이상일 때 검색창 표시

### 3. 재생하기
- **개별 재생**: 각 비디오 카드의 재생 버튼 클릭
- **전체 재생**: "전체 재생" 버튼으로 처음부터 연속 재생
- **재생 제어**: 이전/다음 곡, 일시정지/재생, 볼륨 조절

### 4. 공유하기
1. "공유하기" 버튼 클릭
2. "공유 링크 생성" 버튼으로 링크 생성
3. 필요시 "단축 링크 생성"으로 짧은 링크 만들기
4. 복사 버튼으로 링크 복사 후 공유

## 🔧 개발 스크립트

```bash
# 개발 서버 (nodemon 사용)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start

# 린트 검사
npm run lint

# 타입 체크
npm run typecheck
```

## 📁 프로젝트 구조

```
ytmix/
├── app/                    # Next.js 13+ App Router
│   ├── page.tsx           # 메인 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   └── globals.css        # 글로벌 스타일
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui 베이스 컴포넌트
│   ├── audio-player.tsx  # 오디오 플레이어
│   ├── playlist-manager.tsx # 플레이리스트 관리
│   ├── share-dialog.tsx  # 공유 다이얼로그
│   └── video-card.tsx    # 비디오 카드
├── lib/                   # 유틸리티 라이브러리
│   ├── playlist-sharing.ts # 플레이리스트 공유 로직
│   ├── playlist-storage.ts # 로컬 스토리지 관리
│   └── url-shortener.ts   # URL 단축 서비스
├── hooks/                 # 커스텀 React Hook
└── public/               # 정적 파일
```

## 🌟 향후 계획

- [ ] YouTube 검색 API 연동
- [ ] 키보드 단축키 지원
- [ ] 모바일 반응형 최적화
- [ ] 플레이리스트 태그 및 카테고리
- [ ] 사용자 계정 시스템
- [ ] 플레이리스트 협업 기능

## 🤝 기여하기

이슈 신고나 기능 제안은 [GitHub Issues](https://github.com/superwhyun/ytmix/issues)를 통해 해주세요.

## 📄 라이선스

MIT License

## 🙏 감사의 말

이 프로젝트는 [Claude Code](https://claude.ai/code)와 함께 개발되었습니다.