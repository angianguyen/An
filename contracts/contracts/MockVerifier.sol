// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockVerifier
 * @notice Mock verifier cho testing (thay thế ZK verifier thật)
 * NOTE: Trong production, file này sẽ được thay bằng Verifier.sol từ ZK circuit
 */
contract MockVerifier {
    // For testing, always return true
    bool public alwaysPass = true;
    
    function verifyProof(
        uint[2] memory,
        uint[2][2] memory,
        uint[2] memory,
        uint[1] memory input
    ) external view returns (bool) {
        if (alwaysPass) {
            return true;
        }
        // In real scenario, check if input[0] == 1 (proof is valid)
        return input[0] == 1;
    }
    
    function setAlwaysPass(bool _alwaysPass) external {
        alwaysPass = _alwaysPass;
    }
}
