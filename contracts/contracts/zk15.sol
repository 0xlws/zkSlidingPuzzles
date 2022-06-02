// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./IVerifier.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract zk15 is ERC721, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    IVerifier public verifier;
    // map a uint to Attr struct containing the name and description

    mapping(uint256 => Attr) private attributes;

    uint8[5][16] random = [
        [1, 2, 1, 2, 1],
        [2, 2, 2, 2, 2],
        [3, 3, 0, 3, 0],
        [4, 1, 0, 1, 0],
        [5, 0, 2, 0, 2],
        [6, 0, 0, 0, 0],
        [7, 1, 2, 1, 2],
        [8, 3, 1, 3, 1],
        [9, 2, 0, 2, 0],
        [10, 0, 1, 0, 1],
        [11, 3, 2, 3, 2],
        [12, 1, 3, 1, 3],
        [13, 2, 3, 2, 3],
        [14, 0, 3, 0, 3],
        [15, 3, 3, 3, 3],
        [16, 1, 1, 1, 1]
    ];

    struct Attr {
        string game;
        string score;
    }

    struct Tile {
        uint256 index;
        uint256 x;
        uint256 y;
    }

    struct User {
        uint256 steps;
        uint256 score;
        // uint256 board;
    }

    struct Game {
        uint256 id;
        Tile[16] board;
        uint256 _randomSteps;
    }

    uint256 public randomSteps;
    uint256 public gameCount = 0;
    uint256[] public scores;
    uint256 rn;

    mapping(uint256 => User) users;
    mapping(uint256 => Game) games;

    uint256[10] randomNumbersArr = [14, 21, 6, 93, 63, 48, 74, 29, 22, 37];

    constructor(address _verifier) ERC721("zk15PuzzleNFT", "zk15") {
        verifier = IVerifier(_verifier);
    }



    function getBoard() public view returns (uint8[5][16] memory) {
        return random;
    }

    function getScores() public view returns(uint256[] memory){
        return scores;
    }

    function setupTiles() internal returns (Tile[16] memory) {
        Tile[16] memory _tiles;
        uint256 index = 1;
        for (uint256 y = 0; y < 4; y++) {
            for (uint256 x = 0; x < 4; x++) {
                _tiles[index] = Tile(index, x, y);
                index++;
            }
        }
        return _tiles;
    }

    function pseuRanCoords() internal view returns (uint256[2][1000] memory) {
        uint256 r1;
        uint256 r2;
        uint256 j = 0;
        uint256[2][1000] memory _rc;
        uint256 _rn = rn;
        for (uint256 i = 0; i < 1000; i++) {
            j += 3;
            r1 =
                uint256(
                    keccak256(
                        abi.encodePacked(
                            block.difficulty,
                            block.timestamp,
                            randomNumbersArr[j % 10]
                        )
                    )
                ) %
                4;
            r2 =
                uint256(
                    keccak256(
                        abi.encodePacked(
                            block.difficulty,
                            block.timestamp,
                            randomNumbersArr[i % 10]
                        )
                    )
                ) %
                4;
            _rc[i] = [r1, r2];
        }
        return _rc;
    }

    function randMoveIsValid(
        uint256 x,
        uint256 y,
        uint256 blankX,
        uint256 blankY,
        uint256 prevX,
        uint256 prevY
    ) internal returns (bool) {
        if (x == blankX && y == blankY) {
            return false;
        }
        if (x == prevX && y == prevY) {
            return false;
        }
        if (absSub(x, blankX) + absSub(y, blankY) == 1) {
            return true;
        }
    }

    function move() public returns (Tile[16] memory) {
        uint256 blankX = 3;
        uint256 blankY = 3;
        uint256 prevX;
        uint256 prevY;
        uint256 _stepsMade;
        Tile[16] memory _tiles = setupTiles();
        uint256[2][1000] memory _rc = pseuRanCoords();

        for (uint256 i = 0; i < _rc.length; i++) {
            if (
                randMoveIsValid(
                    _rc[i][0],
                    _rc[i][1],
                    blankX,
                    blankY,
                    prevX,
                    prevY
                )
            ) {
                uint256 foundTile = findTile(_tiles, _rc[i][0], _rc[i][1]);
                _tiles[foundTile].x = blankX;
                _tiles[foundTile].y = blankY;
                prevX = blankX;
                prevY = blankY;
                _tiles[15].x = _rc[i][0];
                _tiles[15].y = _rc[i][1];
                blankX = _rc[i][0];
                blankY = _rc[i][1];
                _stepsMade++;
            }
            continue;
        }

        // if (saveState) {
        //     registerGame(gameCount, _stepsMade);
        // }

        return _tiles;
    }

    function findTile(
        Tile[16] memory _tiles,
        uint256 x,
        uint256 y
    ) public view returns (uint256) {
        for (uint256 i = 0; i < _tiles.length; i++) {
            if (_tiles[i].x == x && _tiles[i].y == y) {
                return i;
            }
        }
    }

    function registerGame(uint256 _id, uint256 _stepsMade) private {
        gameCount++;
        games[gameCount - 1].id = gameCount;
        // games[gameCount - 1].board = tiles;
        games[gameCount - 1]._randomSteps = randomSteps;
    }

    function moveIsValid(
        uint256 x,
        uint256 y,
        uint256 blankX,
        uint256 blankY
    ) public view returns (bool) {
        if (x == blankX && y == blankY) {
            return false;
        }
        if (absSub(x, blankX) + absSub(y, blankY) == 1) {
            return true;
        }
        return false;
    }

    function absSub(uint256 _x, uint256 _y) private view returns (uint256) {
        int256 x = int256(_x);
        int256 y = int256(_y);
        return uint256(x - y >= 0 ? x - y : (x - y) * -1);
    }

    function NFTsMinted() public view returns (Counters.Counter memory) {
        return _tokenIds;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        attributes[tokenId].game,
                        '",',
                        '"steps": ',
                        attributes[tokenId].score,
                        '",',
                        "},"
                    )
                )
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[80] memory input,
        uint256 _steps
    ) public returns (bool) {
        require(verifier.verifyProof(a, b, c, input), "verification failed");
        mintNFT(_steps);
        return true;
    }

    function mintNFT(
        uint256 _steps
    )
        internal
        returns (
            uint256
        )
    {
        address to = msg.sender;
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        uint256 _score = 50000 /_steps;
        users[newTokenId].steps = _steps;
        users[newTokenId].score = _score;
        scores.push(_score);
        // users[newTokenId].game = board;

        _safeMint(to, newTokenId);
        attributes[newTokenId] = Attr(
            "zk15",
            Strings.toString(users[newTokenId].score)
        );
        return newTokenId;
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }
}
