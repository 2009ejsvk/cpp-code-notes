# cpp-code-notes
Static web notes for manually organizing and linking C++ source code. <br>
C++ 소스 코드를 직접 정리하고, 파일·함수 간 흐름을 링크로 연결해 보는 정적 웹 노트


# C++ Code Notes (Static)

## Run
- 로컬에서: 이 폴더를 그대로 열고 `index.html`을 브라우저로 실행
- GitHub Pages: `docs/`로 올려서 Pages 활성화

## Edit
1. `content/`에 소스(.h/.cpp)를 넣기
2. `notes/manifest.json`에 파일 목록 추가
3. `notes/annotations.json`에 “링크로 만들 문자열(from)”과 이동 대상(to, toLine)을 수동으로 추가
4. `notes/notes.md`에 전역 정리 작성

## Routing
- URL hash를 사용: `#file=Engine/Engine.h&line=33`
