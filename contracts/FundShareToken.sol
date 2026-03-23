// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title FundShareToken
/// @notice RWA 프로젝트를 위한 권한형 펀드 지분 토큰입니다.
/// @dev 역할 기반 권한 제어, 일시정지, 화이트리스트 기반 전송 제한을 제공합니다.
contract FundShareToken is ERC20, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    mapping(address => bool) private _whitelisted;

    error ZeroAddress();
    error InvalidAmount();
    error AccountNotWhitelisted(address account);

    event WhitelistUpdated(address indexed account, bool isWhitelisted);
    event FundSharesMinted(address indexed to, uint256 amount);
    event FundSharesBurned(address indexed from, uint256 amount);

    /// @notice 토큰을 배포하고 관리자에게 모든 권한을 부여합니다.
    /// @param admin 관리자 및 운영 권한을 받을 주소입니다.
    constructor(address admin) ERC20("Fund Share Token", "FST") {
        if (admin == address(0)) revert ZeroAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(COMPLIANCE_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(BURNER_ROLE, admin);
    }

    /// @notice 주소의 화이트리스트 포함 여부를 설정합니다.
    /// @param account 설정할 대상 주소입니다.
    /// @param allowed 화이트리스트 허용 여부입니다.
    function setWhitelist(address account, bool allowed) external onlyRole(COMPLIANCE_ROLE) {
        if (account == address(0)) revert ZeroAddress();

        _whitelisted[account] = allowed;
        emit WhitelistUpdated(account, allowed);
    }

    /// @notice 주소가 화이트리스트에 포함되어 있는지 조회합니다.
    /// @param account 조회할 주소입니다.
    /// @return 화이트리스트 포함 여부를 반환합니다.
    function isWhitelisted(address account) external view returns (bool) {
        return _whitelisted[account];
    }

    /// @notice 화이트리스트 주소로 토큰을 발행합니다.
    /// @param to 수령자 주소입니다.
    /// @param amount 발행할 토큰 수량입니다.
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (amount == 0) revert InvalidAmount();
        if (!_whitelisted[to]) revert AccountNotWhitelisted(to);

        _mint(to, amount);
        emit FundSharesMinted(to, amount);
    }

    /// @notice 지정한 주소의 토큰을 소각합니다.
    /// @dev RWA 데모 환경에서 권한을 가진 운영자만 소각을 수행할 수 있습니다.
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

    /// @notice 전송, 발행, 소각 시 일시정지/화이트리스트 규칙을 검사합니다.
    /// @dev ERC20 내부 이동 로직에서 호출됩니다.
    /// @param from 발신자 주소이며 발행 시에는 영 주소입니다.
    /// @param to 수신자 주소이며 소각 시에는 영 주소입니다.
    /// @param value 이동할 토큰 수량입니다.
    function _update(address from, address to, uint256 value) internal override {
        if (paused()) {
            revert EnforcedPause();
        }

        if (from == address(0)) {
            // 발행: 수령자 주소는 반드시 화이트리스트에 포함되어야 합니다.
            if (!_whitelisted[to]) revert AccountNotWhitelisted(to);
        } else if (to == address(0)) {
            // 소각: 권한과 잔액 조건을 만족하면 허용됩니다.
        } else {
            // 일반 전송: 발신자와 수신자 모두 화이트리스트에 포함되어야 합니다.
            if (!_whitelisted[from]) revert AccountNotWhitelisted(from);
            if (!_whitelisted[to]) revert AccountNotWhitelisted(to);
        }

        super._update(from, to, value);
    }
}
