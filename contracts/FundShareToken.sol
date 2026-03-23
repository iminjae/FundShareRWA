// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title FundShareToken
/// @notice RWA 권한형 펀드 지분 토큰입니다.
contract FundShareToken is ERC20, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    mapping(address => bool) private _investorWhitelisted;
    mapping(address => bool) private _systemWhitelisted;

    error ZeroAddress();
    error InvalidAmount();
    error AddressNotAllowed(address account);
    error InvalidTransferRoute(address from, address to);

    event InvestorWhitelistUpdated(address indexed account, bool allowed);
    event SystemWhitelistUpdated(address indexed account, bool allowed);
    event FundSharesMinted(address indexed to, uint256 amount);
    event FundSharesBurned(address indexed from, uint256 amount);

    /// @notice 토큰을 배포하고 관리자에게 운영 권한을 부여합니다.
    /// @dev 배포 시 관리자 주소를 투자자/시스템 화이트리스트에 자동 등록하지 않습니다.
    /// @param admin 관리자 및 운영 권한을 받을 주소입니다.
    constructor(address admin) ERC20("Fund Share Token", "FST") {
        if (admin == address(0)) revert ZeroAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(COMPLIANCE_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(BURNER_ROLE, admin);
    }

    /// @notice 투자자 화이트리스트 포함 여부를 설정합니다.
    /// @param account 설정할 주소입니다.
    /// @param allowed 투자자 화이트리스트 허용 여부입니다.
    function setInvestorWhitelist(address account, bool allowed) external onlyRole(COMPLIANCE_ROLE) {
        if (account == address(0)) revert ZeroAddress();

        _investorWhitelisted[account] = allowed;
        emit InvestorWhitelistUpdated(account, allowed);
    }

    /// @notice 시스템 화이트리스트 포함 여부를 설정합니다.
    /// @param account 설정할 주소입니다.
    /// @param allowed 시스템 화이트리스트 허용 여부입니다.
    function setSystemWhitelist(address account, bool allowed) external onlyRole(COMPLIANCE_ROLE) {
        if (account == address(0)) revert ZeroAddress();

        _systemWhitelisted[account] = allowed;
        emit SystemWhitelistUpdated(account, allowed);
    }

    /// @notice 주소가 투자자 화이트리스트에 포함되었는지 조회합니다.
    /// @param account 조회할 주소입니다.
    /// @return 투자자 화이트리스트 포함 여부를 반환합니다.
    function isInvestorWhitelisted(address account) external view returns (bool) {
        return _isInvestor(account);
    }

    /// @notice 주소가 시스템 화이트리스트에 포함되었는지 조회합니다.
    /// @param account 조회할 주소입니다.
    /// @return 시스템 화이트리스트 포함 여부를 반환합니다.
    function isSystemWhitelisted(address account) external view returns (bool) {
        return _isSystem(account);
    }

    /// @notice 허용된 투자자 또는 시스템 주소로 토큰을 발행합니다.
    /// @param to 수령자 주소입니다.
    /// @param amount 발행할 토큰 수량입니다.
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (amount == 0) revert InvalidAmount();
        if (!_isAllowedRecipient(to)) revert AddressNotAllowed(to);

        _mint(to, amount);
        emit FundSharesMinted(to, amount);
    }

    /// @notice 지정한 주소의 토큰을 소각합니다.
    /// @param from 소각 대상 주소입니다.
    /// @param amount 소각할 토큰 수량입니다.
    function burn(address from, uint256 amount) external onlyRole(BURNER_ROLE) {
        if (from == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();

        _burn(from, amount);
        emit FundSharesBurned(from, amount);
    }

    /// @notice 토큰 이동 관련 동작을 일시정지합니다.
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @notice 토큰 이동 관련 동작의 일시정지를 해제합니다.
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /// @notice 컨트랙트가 지원하는 인터페이스를 조회합니다.
    /// @param interfaceId 조회할 인터페이스 식별자입니다.
    /// @return 지원 여부를 반환합니다.
    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /// @notice 전송, 발행, 소각 시 일시정지 및 라우팅 규칙을 검사합니다.
    /// @dev
    /// - 발행(from=0): 수령자는 투자자 또는 시스템 화이트리스트여야 합니다.
    /// - 소각(to=0): 허용됩니다.
    /// - 일반 전송: 투자자->투자자, 투자자->시스템, 시스템->투자자만 허용됩니다.
    /// - 시스템->시스템 또는 비화이트리스트 주소가 포함된 경로는 거부됩니다.
    /// @param from 발신자 주소이며 발행 시 0 주소입니다.
    /// @param to 수신자 주소이며 소각 시 0 주소입니다.
    /// @param value 이동할 토큰 수량입니다.
    function _update(address from, address to, uint256 value) internal override {
        if (paused()) {
            revert EnforcedPause();
        }

        if (from == address(0)) {
            if (!_isAllowedRecipient(to)) revert AddressNotAllowed(to);
        } else if (to == address(0)) {
            // 소각은 허용합니다.
        } else {
            bool fromInvestor = _isInvestor(from);
            bool toInvestor = _isInvestor(to);
            bool fromSystem = _isSystem(from);
            bool toSystem = _isSystem(to);

            bool allowedRoute = (fromInvestor && toInvestor)
                || (fromInvestor && toSystem)
                || (fromSystem && toInvestor);

            if (!allowedRoute) {
                revert InvalidTransferRoute(from, to);
            }
        }

        super._update(from, to, value);
    }

    /// @dev 주소가 투자자 화이트리스트에 포함되는지 반환합니다.
    function _isInvestor(address account) internal view returns (bool) {
        return _investorWhitelisted[account];
    }

    /// @dev 주소가 시스템 화이트리스트에 포함되는지 반환합니다.
    function _isSystem(address account) internal view returns (bool) {
        return _systemWhitelisted[account];
    }

    /// @dev 주소가 토큰 수령 가능한 허용 대상(투자자 또는 시스템)인지 반환합니다.
    function _isAllowedRecipient(address account) internal view returns (bool) {
        return _isInvestor(account) || _isSystem(account);
    }
}
