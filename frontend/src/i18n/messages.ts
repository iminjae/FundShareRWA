export type Locale = "en" | "ko";

export type MessageSchema = {
  topbar: {
    protocolLabel: string;
    title: string;
    unknownNetwork: string;
    wrongNetwork: string;
    connect: string;
    disconnect: string;
    noWallet: string;
  };
  sidebar: {
    protocolConsole: string;
    dashboard: string;
    investor: string;
    operator: string;
    admin: string;
  };
  language: {
    label: string;
    en: string;
    ko: string;
  };
  common: {
    loading: string;
    connectedWallet: string;
    notConfigured: string;
    connectRequiredTitle: string;
    connectRequiredDescription: string;
    restrictedTitle: string;
    wrongNetworkTitle: string;
    wrongNetworkDescription: string;
  };
  dashboard: {
    title: string;
    description: string;
    disconnectedTitle: string;
    disconnectedDescription: string;
    totalSupply: string;
    escrowBalance: string;
    nextRequestId: string;
    walletHint: string;
    supplyHint: string;
    escrowHint: string;
    requestIdHint: string;
    contractOverview: string;
    lifecycleOverview: string;
    lifecycleDescription: string;
    recentRequests: string;
    steps: string[];
  };
  investor: {
    title: string;
    description: string;
    notWhitelistedDescription: string;
    balance: string;
    allowance: string;
    whitelistStatus: string;
    whitelisted: string;
    whitelistHint: string;
    balanceHint: string;
    allowanceHint: string;
    approveTitle: string;
    approveDescription: string;
    requestTitle: string;
    requestDescription: string;
    amountLabel: string;
    approveButton: string;
    requestButton: string;
    myRequests: string;
  };
  operator: {
    title: string;
    description: string;
    noRoleDescription: string;
    roleStatus: string;
    roleActive: string;
    escrowedFst: string;
    pendingCount: string;
    queueTitle: string;
    roleHint: string;
    pendingHint: string;
    tabs: {
      all: string;
      requested: string;
      approved: string;
      rejected: string;
      processed: string;
    };
    actions: {
      approve: string;
      reject: string;
      process: string;
      completed: string;
      dash: string;
    };
  };
  admin: {
    title: string;
    description: string;
    noPermissionDescription: string;
    connectedWallet: string;
    tokenAdminStatus: string;
    redemptionAdminStatus: string;
    minterStatus: string;
    targetAddress: string;
    targetPlaceholder: string;
    useMyWallet: string;
    roleAndAccessActions: string;
    whitelistActions: string;
    operatorRoleActions: string;
    protocolControls: string;
    addInvestor: string;
    removeInvestor: string;
    addSystem: string;
    removeSystem: string;
    grantOperator: string;
    revokeOperator: string;
    pauseToken: string;
    unpauseToken: string;
    mintSection: string;
    mintAmount: string;
    mintButton: string;
    targetStatus: string;
    investorWhitelisted: string;
    systemWhitelisted: string;
    operatorRole: string;
    fstBalance: string;
    tokenPauseState: string;
    quickActions: string;
    addMeInvestor: string;
    removeMeInvestor: string;
    grantMeOperator: string;
    revokeMeOperator: string;
    mintToMe: string;
    yes: string;
    no: string;
    active: string;
    paused: string;
    notPaused: string;
    invalidAddress: string;
    amountRequired: string;
  };
  table: {
    requestId: string;
    requester: string;
    amount: string;
    status: string;
    requestedAt: string;
    actions: string;
    emptyRecent: string;
    emptyMy: string;
    emptyQueue: string;
  };
  status: {
    Requested: string;
    Approved: string;
    Rejected: string;
    Processed: string;
  };
  tx: {
    awaiting_wallet: string;
    submitted: string;
    confirming: string;
    success: string;
    error: string;
    pendingHelp: string;
    close: string;
  };
  landing: {
    heroTitle: string;
    heroSubtitle: string;
    ctaDashboard: string;
    ctaConnect: string;
    overviewTitle: string;
    overviewItems: string[];
    walletGuideTitle: string;
    walletGuideSteps: string[];
    networkGuideTitle: string;
    networkGuideDescription: string;
    networkFields: {
      networkName: string;
      chainId: string;
      rpcUrl: string;
      currency: string;
      explorer: string;
    };
    quickAccessTitle: string;
    quickAccessDescription: string;
    quickDashboard: string;
    quickInvestor: string;
    quickOperator: string;
  };
};

export const messages: Record<Locale, MessageSchema> = {
  en: {
    topbar: {
      protocolLabel: "Protocol Admin Console",
      title: "FundShare RWA",
      unknownNetwork: "Unknown Network",
      wrongNetwork: "Wrong Network",
      connect: "Connect Wallet",
      disconnect: "Disconnect",
      noWallet: "Wallet Not Found",
    },
    sidebar: {
      protocolConsole: "Protocol Console",
      dashboard: "Dashboard",
      investor: "Investor",
      operator: "Operator",
      admin: "Admin",
    },
    language: {
      label: "Language",
      en: "EN",
      ko: "KO",
    },
    common: {
      loading: "Loading...",
      connectedWallet: "Connected Wallet",
      notConfigured: "Not configured",
      connectRequiredTitle: "Connect wallet to continue",
      connectRequiredDescription:
        "Wallet connection is required for interactive protocol actions.",
      restrictedTitle: "Restricted access",
      wrongNetworkTitle: "Wrong network",
      wrongNetworkDescription:
        "Switch wallet network to the configured chain and try again.",
    },
    dashboard: {
      title: "Dashboard",
      description:
        "Protocol health overview for permissioned FST issuance, escrowed redemptions, and role-based operator processing.",
      disconnectedTitle: "Connect wallet for interactive dashboard use",
      disconnectedDescription:
        "You can still view protocol overview data, but write actions require wallet connection.",
      totalSupply: "Total Supply",
      escrowBalance: "Escrow Balance",
      nextRequestId: "Next Request ID",
      walletHint: "Connected account session",
      supplyHint: "Tokenized fund-share supply",
      escrowHint: "Held by RedemptionManager",
      requestIdHint: "Monotonic redemption sequence",
      contractOverview: "Contract Overview",
      lifecycleOverview: "Lifecycle Overview",
      lifecycleDescription:
        "Escrow-based redemption lifecycle from investor intent to processed burn.",
      recentRequests: "Recent Redemption Requests",
      steps: [
        "Approve token allowance",
        "Request redemption",
        "Tokens move into escrow",
        "Authorized operators approve or reject",
        "Process burns escrowed shares",
      ],
    },
    investor: {
      title: "Investor",
      description:
        "Manage allowance and create redemption requests that move selected FST into escrow.",
      notWhitelistedDescription:
        "This wallet is not investor-whitelisted. Contact compliance administrator for access.",
      balance: "My FST Balance",
      allowance: "Allowance to RedemptionManager",
      whitelistStatus: "Whitelist Status",
      whitelisted: "Investor Whitelisted",
      whitelistHint: "Permissioned transfer route enabled",
      balanceHint: "Connected investor account",
      allowanceHint: "Pre-approved transfer capacity",
      approveTitle: "Approve Escrow Access",
      approveDescription:
        "The RedemptionManager must be approved before it can transfer your FST into escrow.",
      requestTitle: "Request Redemption",
      requestDescription:
        "Submitting a request transfers the selected amount of FST into escrow.",
      amountLabel: "Amount",
      approveButton: "Approve",
      requestButton: "Request Redemption",
      myRequests: "My Redemption Requests",
    },
    operator: {
      title: "Operator",
      description:
        "This console is available to accounts granted REDEMPTION_OPERATOR_ROLE for role-based redemption lifecycle actions.",
      noRoleDescription:
        "This account does not hold REDEMPTION_OPERATOR_ROLE. Only authorized operator accounts can access this console.",
      roleStatus: "Connected Account Role",
      roleActive: "Authorized Operator",
      escrowedFst: "Escrowed FST",
      pendingCount: "Pending Requests Count",
      queueTitle: "Redemption Queue",
      roleHint: "Access source: REDEMPTION_OPERATOR_ROLE",
      pendingHint: "Status = Requested",
      tabs: {
        all: "All",
        requested: "Requested",
        approved: "Approved",
        rejected: "Rejected",
        processed: "Processed",
      },
      actions: {
        approve: "Approve",
        reject: "Reject",
        process: "Process",
        completed: "Completed",
        dash: "-",
      },
    },
    admin: {
      title: "Admin Console",
      description:
        "Role-based protocol control plane for interview/demo workflows, permission setup, and access state management.",
      noPermissionDescription:
        "This account does not have eligible control permissions. Required: FundShareToken DEFAULT_ADMIN_ROLE/COMPLIANCE_ROLE/MINTER_ROLE/PAUSER_ROLE or RedemptionManager DEFAULT_ADMIN_ROLE.",
      connectedWallet: "Connected Wallet",
      tokenAdminStatus: "FundShareToken Admin/Compliance",
      redemptionAdminStatus: "RedemptionManager Admin",
      minterStatus: "Minter Role Status",
      targetAddress: "Target Address",
      targetPlaceholder: "0x...",
      useMyWallet: "Use My Wallet",
      roleAndAccessActions: "Access Control Actions",
      whitelistActions: "Whitelist Controls",
      operatorRoleActions: "Operator Role Controls",
      protocolControls: "Protocol Controls",
      addInvestor: "Add Investor Whitelist",
      removeInvestor: "Remove Investor Whitelist",
      addSystem: "Add System Whitelist",
      removeSystem: "Remove System Whitelist",
      grantOperator: "Grant Operator Role",
      revokeOperator: "Revoke Operator Role",
      pauseToken: "Pause Token",
      unpauseToken: "Unpause Token",
      mintSection: "Demo Token Mint",
      mintAmount: "Amount",
      mintButton: "Mint Demo FST",
      targetStatus: "Target Status",
      investorWhitelisted: "Investor Whitelisted",
      systemWhitelisted: "System Whitelisted",
      operatorRole: "Operator Role",
      fstBalance: "Current FST Balance",
      tokenPauseState: "Token Pause State",
      quickActions: "Quick Actions",
      addMeInvestor: "Add Me as Investor",
      removeMeInvestor: "Remove Me as Investor",
      grantMeOperator: "Grant Me Operator Role",
      revokeMeOperator: "Revoke Me Operator Role",
      mintToMe: "Mint Demo FST to Me",
      yes: "Yes",
      no: "No",
      active: "Active",
      paused: "Paused",
      notPaused: "Not Paused",
      invalidAddress: "Please enter a valid target address.",
      amountRequired: "Enter an amount greater than zero.",
    },
    table: {
      requestId: "Request ID",
      requester: "Requester",
      amount: "Amount",
      status: "Status",
      requestedAt: "Requested At",
      actions: "Actions",
      emptyRecent: "No redemption requests",
      emptyMy: "No redemption requests yet",
      emptyQueue: "No requests in this filter",
    },
    status: {
      Requested: "Requested",
      Approved: "Approved",
      Rejected: "Rejected",
      Processed: "Processed",
    },
    tx: {
      awaiting_wallet: "Waiting for wallet confirmation...",
      submitted: "Transaction submitted...",
      confirming: "Waiting for confirmation...",
      success: "Transaction confirmed.",
      error: "Transaction failed.",
      pendingHelp:
        "Please keep this window open while the transaction is being processed.",
      close: "Close",
    },
    landing: {
      heroTitle: "FundShare RWA",
      heroSubtitle:
        "Permissioned fund-share token system with an escrow-based redemption lifecycle for compliant on-chain operations.",
      ctaDashboard: "Go to Dashboard",
      ctaConnect: "Connect Wallet",
      overviewTitle: "Project Overview",
      overviewItems: [
        "FundShareToken is a permissioned ERC-20 representing fund-share ownership.",
        "RedemptionManager coordinates escrow-based redemption requests and lifecycle transitions.",
        "Investor and system addresses are separated to enforce transfer routing and compliance.",
        "One or more authorized operator accounts can approve, reject, or process requests after off-chain settlement checks.",
        "Operator permissions are role-based through AccessControl, separate from the admin role.",
        "Escrow isolates pending redemption balances before final burn processing.",
      ],
      walletGuideTitle: "How to Connect MetaMask",
      walletGuideSteps: [
        "Install MetaMask extension in your browser.",
        "Unlock wallet and select the target account.",
        "Click Connect Wallet in this app.",
        "Approve the connection request in MetaMask.",
      ],
      networkGuideTitle: "Custom Mainnet Setup Guide",
      networkGuideDescription:
        "Use the following network information when adding the custom network to MetaMask.",
      networkFields: {
        networkName: "Network Name",
        chainId: "Chain ID",
        rpcUrl: "RPC URL",
        currency: "Currency Symbol",
        explorer: "Block Explorer URL",
      },
      quickAccessTitle: "Quick Access",
      quickAccessDescription:
        "Jump directly to the operational views once your wallet is connected.",
      quickDashboard: "Dashboard",
      quickInvestor: "Investor Portal",
      quickOperator: "Operator Console",
    },
  },
  ko: {
    topbar: {
      protocolLabel: "프로토콜 관리자 콘솔",
      title: "FundShare RWA",
      unknownNetwork: "알 수 없는 네트워크",
      wrongNetwork: "잘못된 네트워크",
      connect: "지갑 연결",
      disconnect: "연결 해제",
      noWallet: "지갑 없음",
    },
    sidebar: {
      protocolConsole: "프로토콜 콘솔",
      dashboard: "대시보드",
      investor: "투자자",
      operator: "운영자",
      admin: "관리자",
    },
    language: {
      label: "언어",
      en: "EN",
      ko: "KO",
    },
    common: {
      loading: "로딩 중...",
      connectedWallet: "연결 지갑",
      notConfigured: "설정되지 않음",
      connectRequiredTitle: "계속하려면 지갑을 연결하세요",
      connectRequiredDescription:
        "프로토콜 상호작용 기능은 지갑 연결이 필요합니다.",
      restrictedTitle: "접근 제한",
      wrongNetworkTitle: "잘못된 네트워크",
      wrongNetworkDescription:
        "설정된 체인으로 네트워크를 변경한 뒤 다시 시도하세요.",
    },
    dashboard: {
      title: "대시보드",
      description:
        "권한형 FST 발행, 에스크로 환매, 역할 기반 운영자 처리 현황을 한눈에 확인합니다.",
      disconnectedTitle: "대시보드 상호작용을 위해 지갑을 연결하세요",
      disconnectedDescription:
        "개요 조회는 가능하지만, 쓰기 트랜잭션은 지갑 연결이 필요합니다.",
      totalSupply: "총 발행량",
      escrowBalance: "에스크로 잔고",
      nextRequestId: "다음 요청 ID",
      walletHint: "현재 연결 계정 세션",
      supplyHint: "토큰화된 펀드 지분 총량",
      escrowHint: "RedemptionManager 보관 수량",
      requestIdHint: "환매 요청 순차 번호",
      contractOverview: "컨트랙트 개요",
      lifecycleOverview: "라이프사이클 개요",
      lifecycleDescription:
        "투자자 요청부터 소각 처리까지의 에스크로 환매 흐름입니다.",
      recentRequests: "최근 환매 요청",
      steps: [
        "토큰 허용량 승인",
        "환매 요청 제출",
        "토큰 에스크로 이동",
        "권한 보유 운영자 승인 또는 거절",
        "처리 단계에서 에스크로 소각",
      ],
    },
    investor: {
      title: "투자자",
      description:
        "허용량을 관리하고 FST를 에스크로로 이동하는 환매 요청을 생성합니다.",
      notWhitelistedDescription:
        "이 지갑은 투자자 화이트리스트에 없습니다. 컴플라이언스 관리자에게 문의하세요.",
      balance: "내 FST 잔액",
      allowance: "RedemptionManager 허용량",
      whitelistStatus: "화이트리스트 상태",
      whitelisted: "투자자 화이트리스트 등록됨",
      whitelistHint: "권한형 전송 경로 활성화",
      balanceHint: "연결된 투자자 계정",
      allowanceHint: "사전 승인된 전송 한도",
      approveTitle: "에스크로 접근 승인",
      approveDescription:
        "RedemptionManager가 에스크로로 FST를 이동하려면 먼저 승인이 필요합니다.",
      requestTitle: "환매 요청",
      requestDescription:
        "요청을 제출하면 선택한 FST 수량이 에스크로로 이동합니다.",
      amountLabel: "수량",
      approveButton: "승인",
      requestButton: "환매 요청",
      myRequests: "내 환매 요청",
    },
    operator: {
      title: "운영자",
      description:
        "이 콘솔은 REDEMPTION_OPERATOR_ROLE이 부여된 계정이 역할 기반으로 환매 상태를 관리하는 화면입니다.",
      noRoleDescription:
        "이 계정에는 REDEMPTION_OPERATOR_ROLE 권한이 없습니다. 권한 보유 운영자 계정만 이 콘솔에 접근할 수 있습니다.",
      roleStatus: "연결 계정 역할",
      roleActive: "권한 보유 운영자",
      escrowedFst: "에스크로 FST",
      pendingCount: "대기 요청 수",
      queueTitle: "환매 큐",
      roleHint: "접근 근거: REDEMPTION_OPERATOR_ROLE",
      pendingHint: "상태 = Requested",
      tabs: {
        all: "전체",
        requested: "요청됨",
        approved: "승인됨",
        rejected: "거절됨",
        processed: "처리됨",
      },
      actions: {
        approve: "승인",
        reject: "거절",
        process: "처리",
        completed: "완료",
        dash: "-",
      },
    },
    admin: {
      title: "관리자 콘솔",
      description:
        "면접/데모 워크플로우에 맞춘 역할 기반 프로토콜 제어 화면입니다. 권한 설정과 접근 상태를 관리할 수 있습니다.",
      noPermissionDescription:
        "이 계정에는 제어 권한이 없습니다. 필요 권한: FundShareToken DEFAULT_ADMIN_ROLE/COMPLIANCE_ROLE/MINTER_ROLE/PAUSER_ROLE 또는 RedemptionManager DEFAULT_ADMIN_ROLE.",
      connectedWallet: "연결 지갑",
      tokenAdminStatus: "FundShareToken 관리자/컴플라이언스",
      redemptionAdminStatus: "RedemptionManager 관리자",
      minterStatus: "민터 권한 상태",
      targetAddress: "대상 주소",
      targetPlaceholder: "0x...",
      useMyWallet: "내 지갑 사용",
      roleAndAccessActions: "접근 제어 액션",
      whitelistActions: "화이트리스트 제어",
      operatorRoleActions: "운영자 권한 제어",
      protocolControls: "프로토콜 제어",
      addInvestor: "투자자 화이트리스트 추가",
      removeInvestor: "투자자 화이트리스트 제거",
      addSystem: "시스템 화이트리스트 추가",
      removeSystem: "시스템 화이트리스트 제거",
      grantOperator: "운영자 권한 부여",
      revokeOperator: "운영자 권한 해제",
      pauseToken: "토큰 일시정지",
      unpauseToken: "토큰 재개",
      mintSection: "데모 토큰 민트",
      mintAmount: "수량",
      mintButton: "데모 FST 민트",
      targetStatus: "대상 상태 조회",
      investorWhitelisted: "투자자 화이트리스트",
      systemWhitelisted: "시스템 화이트리스트",
      operatorRole: "운영자 권한",
      fstBalance: "현재 FST 잔액",
      tokenPauseState: "토큰 정지 상태",
      quickActions: "빠른 액션",
      addMeInvestor: "내 계정 투자자 추가",
      removeMeInvestor: "내 계정 투자자 제거",
      grantMeOperator: "내 계정 운영자 권한 부여",
      revokeMeOperator: "내 계정 운영자 권한 해제",
      mintToMe: "내 계정으로 데모 FST 민트",
      yes: "예",
      no: "아니오",
      active: "활성",
      paused: "정지됨",
      notPaused: "정상",
      invalidAddress: "올바른 대상 주소를 입력하세요.",
      amountRequired: "0보다 큰 수량을 입력하세요.",
    },
    table: {
      requestId: "요청 ID",
      requester: "요청자",
      amount: "수량",
      status: "상태",
      requestedAt: "요청 시각",
      actions: "액션",
      emptyRecent: "환매 요청이 없습니다",
      emptyMy: "아직 환매 요청이 없습니다",
      emptyQueue: "해당 필터에 요청이 없습니다",
    },
    status: {
      Requested: "요청됨",
      Approved: "승인됨",
      Rejected: "거절됨",
      Processed: "처리됨",
    },
    tx: {
      awaiting_wallet: "지갑 확인을 기다리는 중...",
      submitted: "트랜잭션 제출됨...",
      confirming: "확정 대기 중...",
      success: "트랜잭션이 확정되었습니다.",
      error: "트랜잭션이 실패했습니다.",
      pendingHelp: "트랜잭션 처리 중입니다. 창을 닫지 말아주세요.",
      close: "닫기",
    },
    landing: {
      heroTitle: "FundShare RWA",
      heroSubtitle:
        "컴플라이언스 요구사항을 반영한 권한형 펀드 지분 토큰과 에스크로 환매 라이프사이클을 제공합니다.",
      ctaDashboard: "대시보드 이동",
      ctaConnect: "지갑 연결",
      overviewTitle: "프로젝트 개요",
      overviewItems: [
        "FundShareToken은 펀드 지분을 표현하는 권한형 ERC-20 토큰입니다.",
        "RedemptionManager는 에스크로 기반 환매 요청과 상태 전환을 관리합니다.",
        "투자자 주소와 시스템 주소를 분리해 전송 경로와 컴플라이언스를 강제합니다.",
        "하나 이상의 권한 보유 운영자 계정이 오프체인 정산 확인 후 승인·거절·처리를 수행할 수 있습니다.",
        "운영자 권한은 AccessControl 기반 역할 모델이며 관리자 역할과 분리됩니다.",
        "에스크로는 최종 소각 전 대기 물량을 안전하게 분리 관리합니다.",
      ],
      walletGuideTitle: "MetaMask 연결 가이드",
      walletGuideSteps: [
        "브라우저에 MetaMask 확장 프로그램을 설치합니다.",
        "지갑 잠금을 해제하고 사용할 계정을 선택합니다.",
        "앱에서 지갑 연결 버튼을 클릭합니다.",
        "MetaMask 팝업에서 연결 요청을 승인합니다.",
      ],
      networkGuideTitle: "커스텀 메인넷 설정 가이드",
      networkGuideDescription:
        "아래 네트워크 정보를 MetaMask 네트워크 추가 화면에 입력하세요.",
      networkFields: {
        networkName: "네트워크 이름",
        chainId: "체인 ID",
        rpcUrl: "RPC URL",
        currency: "통화 심볼",
        explorer: "블록 익스플로러 URL",
      },
      quickAccessTitle: "빠른 이동",
      quickAccessDescription:
        "지갑 연결 후 필요한 운영 화면으로 바로 이동할 수 있습니다.",
      quickDashboard: "대시보드",
      quickInvestor: "투자자 포털",
      quickOperator: "운영자 콘솔",
    },
  },
};
