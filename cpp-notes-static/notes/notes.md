# Global Notes

- 이 파일은 “전체 프로젝트 정리”를 자유롭게 적는 공간입니다.
- 파일별 요약은 `notes/manifest.json`의 `notes`에 짧게 두고,
  길고 구조적인 정리는 여기로 모으는 것을 권장합니다.

## 링크 작성 규칙(수동)

- `notes/annotations.json`에서 특정 파일의 특정 라인에 대해
  - `from`: 코드에서 링크로 감쌀 문자열(정확히 일치해야 함)
  - `to`: 이동할 파일 경로(`content/` 기준)
  - `toLine`: 이동할 라인 번호
  를 직접 등록합니다.

예:
```json
{
  "Client/main.cpp": [
    { "line": 12, "from": "CEngine::GetInst()", "to": "Engine/Engine.h", "toLine": 33 }
  ]
}
```
