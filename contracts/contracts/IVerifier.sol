// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

interface IVerifier {
    /// @return r  bool true if proof is valid
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[80] memory input
    ) external view returns (bool r);
}

