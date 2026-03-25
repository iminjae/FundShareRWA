// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {FundShareToken} from "./FundShareToken.sol";

/// @title RedemptionManager
/// @notice 권한형 펀드 지분 토큰의 환매 요청을 에스크로 기반으로 관리합니다.
/// @dev
/// - 요청 시 사용자의 토큰을 이 컨트랙트(시스템 주소)로 예치합니다.
/// - 승인된 요청은 예치 상태를 유지합니다.
/// - 거절 시 예치 토큰을 요청자에게 반환합니다.
/// - 처리 시 오프체인 정산 완료를 가정하고 예치 토큰을 소각합니다.
contract RedemptionManager is AccessControl {
    bytes32 public constant REDEMPTION_OPERATOR_ROLE = keccak256("REDEMPTION_OPERATOR_ROLE");

    enum RedemptionStatus {
        Requested,
        Approved,
        Rejected,
        Processed
    }

    struct RedemptionRequest {
        uint256 id;
        address requester;
        uint256 amount;
        uint256 requestedAt;
        RedemptionStatus status;
    }

    FundShareToken public immutable fundShareToken;
    uint256 private _nextRequestId;
    mapping(uint256 => RedemptionRequest) private _requests;

    error ZeroAddress();
    error InvalidAmount();
    error RequestNotFound(uint256 requestId);
    error InvalidRedemptionStatus(uint256 requestId, RedemptionStatus currentStatus);
    error InsufficientAllowance(address owner, uint256 requiredAmount, uint256 currentAllowance);
    error InsufficientBalance(address owner, uint256 requiredAmount, uint256 currentBalance);

    event RedemptionRequested(uint256 indexed requestId, address indexed requester, uint256 amount);
    event RedemptionApproved(uint256 indexed requestId, address indexed operator, address indexed requester);
    event RedemptionRejected(uint256 indexed requestId, address indexed operator, address indexed requester, uint256 amount);
    event RedemptionProcessed(uint256 indexed requestId, address indexed operator, address indexed requester, uint256 amount);

    /// @notice 환매 관리자 컨트랙트를 초기화하고 관리자/운영자 권한을 부여합니다.
    /// @dev
    /// - 이 컨트랙트는 환매 수명주기에서 에스크로 역할의 시스템 주소로 동작합니다.
    /// - 사용 전 FundShareToken의 시스템 화이트리스트에 이 컨트랙트를 등록해야 합니다.
    /// - 처리(process) 기능 사용 전 FundShareToken의 BURNER_ROLE을 이 컨트랙트에 부여해야 합니다.
    /// @param admin DEFAULT_ADMIN_ROLE 및 초기 REDEMPTION_OPERATOR_ROLE을 받을 주소입니다.
    /// @param tokenAddress 배포된 FundShareToken 컨트랙트 주소입니다.
    constructor(address admin, address tokenAddress) {
        if (admin == address(0) || tokenAddress == address(0)) revert ZeroAddress();

        fundShareToken = FundShareToken(tokenAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REDEMPTION_OPERATOR_ROLE, admin);
        _nextRequestId = 1;
    }

    /// @notice 호출자가 환매 요청을 생성하고 토큰을 이 컨트랙트로 예치합니다.
    /// @dev 요청 생성은 예치와 함께 수행되며, 승인/처리는 별도 단계로 진행됩니다.
    /// @param amount 환매를 요청할 토큰 수량입니다.
    function requestRedemption(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();

        uint256 currentBalance = fundShareToken.balanceOf(msg.sender);
        if (currentBalance < amount) {
            revert InsufficientBalance(msg.sender, amount, currentBalance);
        }

        uint256 currentAllowance = fundShareToken.allowance(msg.sender, address(this));
        if (currentAllowance < amount) {
            revert InsufficientAllowance(msg.sender, amount, currentAllowance);
        }

        fundShareToken.transferFrom(msg.sender, address(this), amount);

        uint256 requestId = _nextRequestId;
        _requests[requestId] = RedemptionRequest({
            id: requestId,
            requester: msg.sender,
            amount: amount,
            requestedAt: block.timestamp,
            status: RedemptionStatus.Requested
        });

        emit RedemptionRequested(requestId, msg.sender, amount);
        unchecked {
            ++_nextRequestId;
        }
    }

    /// @notice 요청 상태가 Requested인 환매 요청을 승인합니다.
    /// @param requestId 환매 요청 ID입니다.
    function approveRedemption(uint256 requestId) external onlyRole(REDEMPTION_OPERATOR_ROLE) {
        RedemptionRequest storage request = _getExistingRequest(requestId);
        if (request.status != RedemptionStatus.Requested) {
            revert InvalidRedemptionStatus(requestId, request.status);
        }

        request.status = RedemptionStatus.Approved;
        emit RedemptionApproved(requestId, msg.sender, request.requester);
    }

    /// @notice 요청 상태가 Requested 또는 Approved인 환매 요청을 거절하고 예치 토큰을 반환합니다.
    /// @param requestId 환매 요청 ID입니다.
    function rejectRedemption(uint256 requestId) external onlyRole(REDEMPTION_OPERATOR_ROLE) {
        RedemptionRequest storage request = _getExistingRequest(requestId);
        if (request.status != RedemptionStatus.Requested && request.status != RedemptionStatus.Approved) {
            revert InvalidRedemptionStatus(requestId, request.status);
        }

        uint256 escrowBalance = fundShareToken.balanceOf(address(this));
        if (escrowBalance < request.amount) {
            revert InsufficientBalance(address(this), request.amount, escrowBalance);
        }

        fundShareToken.transfer(request.requester, request.amount);
        request.status = RedemptionStatus.Rejected;

        emit RedemptionRejected(requestId, msg.sender, request.requester, request.amount);
    }

    /// @notice 승인된 환매 요청을 처리하고 예치 토큰을 소각합니다.
    /// @dev 오프체인 정산이 완료되었다고 가정한 뒤 호출합니다.
    /// @param requestId 환매 요청 ID입니다.
    function processRedemption(uint256 requestId) external onlyRole(REDEMPTION_OPERATOR_ROLE) {
        RedemptionRequest storage request = _getExistingRequest(requestId);
        if (request.status != RedemptionStatus.Approved) {
            revert InvalidRedemptionStatus(requestId, request.status);
        }

        uint256 escrowBalance = fundShareToken.balanceOf(address(this));
        if (escrowBalance < request.amount) {
            revert InsufficientBalance(address(this), request.amount, escrowBalance);
        }

        fundShareToken.burn(address(this), request.amount);
        request.status = RedemptionStatus.Processed;

        emit RedemptionProcessed(requestId, msg.sender, request.requester, request.amount);
    }

    /// @notice 환매 요청 상세 정보를 조회합니다.
    /// @param requestId 환매 요청 ID입니다.
    /// @return 요청 구조체 전체를 반환합니다.
    function getRequest(uint256 requestId) external view returns (RedemptionRequest memory) {
        RedemptionRequest storage request = _getExistingRequest(requestId);
        return request;
    }

    /// @notice 다음에 할당될 환매 요청 ID를 조회합니다.
    /// @return 다음 환매 요청 ID를 반환합니다.
    function getNextRequestId() external view returns (uint256) {
        return _nextRequestId;
    }

    /// @notice 컨트랙트가 특정 인터페이스를 지원하는지 조회합니다.
    /// @param interfaceId 조회할 인터페이스 식별자입니다.
    /// @return 지원 여부를 반환합니다.
    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /// @dev 요청 존재 여부를 검증하고 요청 참조를 반환합니다.
    function _getExistingRequest(uint256 requestId) private view returns (RedemptionRequest storage request) {
        request = _requests[requestId];
        if (request.requester == address(0)) {
            revert RequestNotFound(requestId);
        }
    }
}
