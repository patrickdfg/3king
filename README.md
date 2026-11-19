# 삼국지: 천하쟁패 (Three Kingdoms Strategy Web Game)

HTML5 Canvas와 순수 JavaScript로 제작된 삼국지 전략 시뮬레이션 웹 게임입니다.
별도의 서버나 빌드 과정 없이 GitHub Pages에 바로 올려 실행할 수 있습니다.

## 폴더 구조

```text
three-kingdoms-webgame/
├── index.html          # 메인 게임 페이지
├── css/
│   └── style.css       # 다크 네이비 & 골드 전략 UI 스타일시트
├── js/
│   └── game.js         # 내정·인재·외교·군사·전투·AI 턴·저장 엔진
└── assets/
    └── images/         # 3D 성곽 디오라마(city_3d.jpg) 및 장수/NPC 초상화 14종
```

## GitHub Pages 배포 방법

1. GitHub에서 새 저장소(Repository, 예: `three-kingdoms-game`)를 생성합니다.
2. 압축을 푼 폴더 안의 모든 파일(`index.html`, `css/`, `js/`, `assets/`, `README.md`)을 저장소 최상단에 업로드(Push)합니다.
3. 저장소의 **Settings → Pages → Build and deployment**에서 **Source: Deploy from a branch**, **Branch: `main` / `/ (root)`**를 선택하고 저장합니다.
4. 1~2분 뒤 `https://<본인아이디>.github.io/<저장소이름>/` 주소에서 바로 플레이할 수 있습니다.

## 커스터마이징 팁

- **장수 이미지 교체/추가**: `assets/images/` 폴더에 새 이미지를 넣고 `js/game.js` 상단의 `PORTRAIT_IMAGES` 객체에 경로를 연결하면 바로 적용됩니다.
- **성곽 배경 교체**: `assets/images/city_3d.jpg`를 원하는 3D 성곽 이미지로 교체할 수 있습니다.
- **단축키**: `←` / `→` (보유 성 전환), `Tab` (천하 지도 열기/닫기)
