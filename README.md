# FundShareRWA

권한형 RWA 펀드 지분 토큰(FST)과 에스크로 기반 환매 라이프사이클을 구현한 Hardhat + Next.js 프로젝트입니다.

## 1. 프로젝트 구성

- 스마트 컨트랙트: `contracts/`
  - `FundShareToken.sol`
  - `RedemptionManager.sol`
- 테스트: `test/`
  - `FundShareToken.test.ts`
  - `RedemptionManager.test.ts`
- 배포 스크립트: `scripts/deploy.ts`
- 프론트엔드: `frontend/` (Next.js App Router + TypeScript + Tailwind + ethers v6)

## 2. 핵심 기능

### FundShareToken
- 역할 기반 권한:
  - `DEFAULT_ADMIN_ROLE`
  - `MINTER_ROLE`
  - `COMPLIANCE_ROLE`
  - `PAUSER_ROLE`
  - `BURNER_ROLE`
- 화이트리스트 분리:
  - 투자자(`investor`)
  - 시스템(`system`)
- 전송 라우팅 규칙:
  - investor -> investor 허용
  - investor -> system 허용
  - system -> investor 허용
  - system -> system 금지

### RedemptionManager
- 환매 흐름:
  1. `requestRedemption(amount)` (에스크로 입금)
  2. `approveRedemption(requestId)` 또는 `rejectRedemption(requestId)`
  3. `processRedemption(requestId)` (승인 건 소각 처리)
- AccessControl 기반 운영자 모델:
  - `REDEMPTION_OPERATOR_ROLE`
  - 다중 운영자 계정 지원
- 운영 이벤트에 `operator(msg.sender)` 기록:
  - `RedemptionApproved`
  - `RedemptionRejected`
  - `RedemptionProcessed`

## 3. 사전 요구사항

- Node.js 18+ 권장
- npm
- MetaMask(프론트 사용 시)

## 4. 루트 환경변수 설정

루트 `.env` 파일 예시:

```env
MAINNET_RPC_URL=https://your-rpc-url
PRIVATE_KEY=0xyour_private_key
MAINNET_CHAIN_ID=6158
```

`hardhat.config.ts`의 `mainnet` 네트워크가 위 값을 사용합니다.

## 5. 설치

루트 의존성 설치:

```bash
npm install
```

프론트 의존성 설치:

```bash
cd frontend
npm install
```

## 6. 테스트

루트에서:

```bash
npx hardhat test
```

## 7. 배포

루트에서:

```bash
npx hardhat run scripts/deploy.ts --network mainnet
```

배포 스크립트가 수행하는 작업:

1. `FundShareToken` 배포
2. `RedemptionManager` 배포
3. `RedemptionManager`를 `system whitelist`에 등록
4. `BURNER_ROLE` 부여
5. (선택) `sampleInvestors` 화이트리스트 등록
6. 프론트용 파일 자동 생성/동기화:
   - `frontend/src/config/deployedContracts.json`
   - `frontend/src/abi/FundShareToken.json`
   - `frontend/src/abi/RedemptionManager.json`
   - `frontend/.env.local` (`NEXT_PUBLIC_*` 값 업서트)

## 8. 프론트 실행

반드시 `frontend` 디렉토리에서 실행:

```bash
cd frontend
npm run dev
```

접속:
- `http://localhost:3000/` (랜딩)
- `http://localhost:3000/dashboard`
- `http://localhost:3000/investor`
- `http://localhost:3000/operator`
- `http://localhost:3000/admin`

## 9. 프론트 주요 페이지

- `/` 랜딩
  - 프로젝트 개요, 지갑 연결 가이드, 네트워크 설정 가이드
- `/dashboard`
  - 총 발행량, 에스크로 잔고, 요청 현황
- `/investor`
  - approve / requestRedemption
  - 투자자 whitelist 계정만 사용 가능
- `/operator`
  - approve / reject / process
  - `REDEMPTION_OPERATOR_ROLE` 보유 계정만 사용 가능
- `/admin`
  - 인터뷰/데모 편의용 제어 콘솔
  - whitelist/role/mint/pause/unpause 관리
  - 아래 권한 중 하나 이상 필요:
    - FundShareToken: `DEFAULT_ADMIN_ROLE`, `COMPLIANCE_ROLE`, `MINTER_ROLE`, `PAUSER_ROLE`
    - RedemptionManager: `DEFAULT_ADMIN_ROLE`

## 10. 지갑/네트워크 동작

- 자동 지갑 연결 없음 (수동 Connect 버튼)
- 읽기 전용 조회는 설정된 RPC(`NEXT_PUBLIC_READ_RPC_URL` 또는 배포 JSON의 `rpcUrl`) 사용
- 쓰기 트랜잭션은 BrowserProvider + signer 사용
- 잘못된 네트워크 연결 시 접근 제한 상태 표시

## 11. 다국어(i18n)

- 한국어/영어 지원 (`ko` / `en`)
- 상단 언어 스위처 제공
- 주요 텍스트(네비게이션/페이지/상태/모달) 번역 적용

## 12. 트랜잭션 UX

- 공통 트랜잭션 모달 사용
  - wallet 승인 대기
  - tx 제출
  - 컨펌 대기
  - 성공/실패 상태
- pending 중 중복 클릭 방지 및 인터랙션 제한

## 13. 주의사항

- 현재 `.env`의 개인키는 절대 공개 저장소에 커밋하면 안 됩니다.
- 운영 환경에서는 신규 배포 후 반드시:
  1. `deployedContracts.json`/ABI 동기화 확인
  2. 프론트 `.env.local` 값 확인
  3. 프론트 서버 재시작

