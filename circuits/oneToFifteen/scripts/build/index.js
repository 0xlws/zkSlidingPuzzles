"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
console.log("\n _ _ _ _ _\n");
var fs_1 = require("fs");
var target;
var tiles = [];
var rows = 4;
var cols = 4;
var index = 1;
for (var y = 0; y < rows; y++) {
    for (var x = 0; x < cols; x++) {
        var tile = [index, x, y, x, y];
        tiles.push(tile);
        index++;
    }
}
target = tiles.map(function (a) {
    return __spreadArray([], a, true);
});
var blankX = tiles[15][1];
var blankY = tiles[15][2];
var firstRun = false;
var prevX = 999;
var prevY = 999;
var moves = 0;
// onetoFifteen
// function init() {
//   let index = 1;
//   for (let y = 0; y < rows; y++) {
//     for (let x = 0; x < cols; x++) {
//       let tile = [index, x, y, x, y];
//       tiles.push(tile);
//       target = tiles;
//       index++;
//     }
//   }
//   console.log({ tiles });
//   blankX = tiles[15][1];
//   blankY = tiles[15][2];
//   return tiles;
// }
// init();
// init();
console.log("init run");
// console.log("tiles", tiles)
// tiles.pop()
// p.loop()
//  fifteenToOne
// let index = 0;
// for (let x = 3; x >= 0; x--) {
// for (let y = 3; y >= 0; y--) {
//     let tile = new Tile(index + 1, x, y, x, y);
//     tiles.push(tile);
//     index++;
//   }
// }
//  verticalNumbers
// let index = 0;
// for (let x = 0; x < cols; x++) {
// for (let y = 0; y < rows; y++) {
//     let tile = new Tile(index + 1, x, y, x, y);
//     tiles.push(tile);
//     index++;
//   }
// }
// skipOddtoEven
// let index = 0;
// for (let y = 0; y < 4; y++) {
//   for (let x = 0; x < 4; x++) {
//       let xx=  x== 1? 2:x==2? 1:x
//       let tile = new Tile(index + 1, xx, y, x, y);
//       tiles.push(tile);
//     index++;
//   }
// }
//      verticalOddEven
// let index = 1;
// for (let y = 0; y < 4; y++) {
//   for (let x = 0; x < 4; x++) {
//     let yy =
//       [1, 9, 2, 10].indexOf(index) >= 0
//         ? 0
//         : [3, 11, 4, 12].indexOf(index) >= 0
//         ? 1
//         : [5, 13, 6, 14].indexOf(index) >= 0
//         ? 2
//         : [7, 15, 8, 16].indexOf(index) >= 0
//         ? 3
//         : y;
//     let xx =
//       [1, 3, 5, 7].indexOf(index) >= 0
//         ? 0
//         : [9, 11, 13, 15].indexOf(index) >= 0
//         ? 1
//         : [2, 4, 6, 8].indexOf(index) >= 0
//         ? 2
//         : [10, 12, 14, 16].indexOf(index) >= 0
//         ? 3
//         : x;
//     let tile = new Tile(index, xx, yy, x, y);
//     tiles.push(tile);
//     index++;
//   }
// }
// console.log(tiles);
// p.noLoop();
//  skipOddEven
//   let index = 1;
// for (let y = 0; y < 4; y++) {
//   for (let x = 0; x < 4; x++) {
//     let yy =
//       [1, 4, 5, 8].indexOf(index) >= 0
//         ? 0
//         : [2, 3, 6, 7].indexOf(index) >= 0
//         ? 1
//         : [9, 10, 13, 14].indexOf(index) >= 0
//         ? 2
//         : [16, 11, 12, 15].indexOf(index) >= 0
//         ? 3
//         : y;
//     let xx =
//       [1, 2, 9, 16].indexOf(index) >= 0
//         ? 0
//         : [4, 3, 10, 11].indexOf(index) >= 0
//         ? 1
//         : [5, 6, 13, 12].indexOf(index) >= 0
//         ? 2
//         : [8, 7, 14, 15].indexOf(index) >= 0
//         ? 3
//         : x;
//     let tile = new Tile(index, xx, yy, x, y);
//     tiles.push(tile);
//     index++;
//   }
// }
// console.log(tiles);
// p.noLoop();
// tiles.pop();
// if (board) {
//   for (let i = 0; i < board.length; i++) {
//     let tile = new Tile(board[i].index, board[i].x, board[i].y);
//     tiles.push(tile);
//   }
//   blankX = board[15].x
//   blankY = board[15].y
// }
// if (!board) {
//   // p.noLoop()
// }
// if (board) {
//   p.loop();
//   for (let i = 0; i < board.length; i++) {
//     for (let y = 0; y < rows; y++) {
//       for (let x = 0; x < cols; x++) {
//         let tile = new Tile(board[i].index, board[i].x, board[i].y, x, y);
//         tiles.push(tile);
//       }
//     }
//   }
// }
// tiles.pop();
function shuffle(n) {
    var num = n ? n : 100;
    for (var i = 0; i < num; i++) {
        if (i == num - 1) {
            i = 0;
        }
        var r1 = Math.floor((Math.random() * 10) % cols);
        var r2 = Math.floor((Math.random() * 100) % rows);
        if (!sameMove(r1, r2)) {
            if (validMove(r1, r2)) {
                tiles = move(r1, r2);
                moves++;
                if (moves == num) {
                    break;
                }
            }
        }
    }
    for (var i = 0; i < tiles.length; i++) {
        tiles[i][3] = tiles[i][1];
        tiles[i][4] = tiles[i][2];
        target[i][3] = tiles[i][1];
        target[i][4] = tiles[i][2];
    }
    overlap(tiles);
    return tiles;
}
function overlap(tiles) {
    var char = [];
    var count = [];
    for (var i = 0; i < tiles.length; i++) {
        if (tiles[i][1] != tiles[i][3] || tiles[i][2] != tiles[i][4]) {
            throw new Error("Wrong init values");
        }
        var xyixiy = [tiles[i].slice(-4)].join();
        var indexOfxyixiy = char.indexOf(xyixiy);
        if (indexOfxyixiy === -1) {
            char.push(xyixiy);
            count.push(1);
        }
        else {
            count[indexOfxyixiy] += 1;
        }
    }
    for (var i = 0; i < char.length; i++) {
        console.log(char[i], "-", count[i]);
        if (count[i] > 1) {
            throw new Error("Duplicate found");
        }
    }
}
function move(x, y) {
    var i = findTile(blankX, blankY);
    tiles[i][1] = x;
    tiles[i][2] = y;
    var TO = tiles[i];
    i = findTile(x, y);
    tiles[i][1] = blankX;
    tiles[i][2] = blankY;
    // console.log({blankX})
    var FROM = tiles[i];
    console.log({ FROM: FROM });
    console.log({ TO: TO });
    prevX = blankX;
    prevY = blankY;
    blankX = x;
    blankY = y;
    firstRun = false;
    return tiles;
}
function validMove(x, y) {
    if (blankX == x && blankY == y) {
        return false;
    }
    if (Math.abs(x - blankX) + Math.abs(y - blankY) == 1) {
        // console.log(Math.abs(x - blankX))
        // console.log(Math.abs(y - blankY))
        return true;
    }
    return false;
}
function sameMove(x, y) {
    if (prevX == x && prevY == y) {
        return true;
    }
    return false;
}
function findTile(x, y) {
    for (var i = 0; i < tiles.length; i++) {
        if (tiles[i][1] == x && tiles[i][2] == y) {
            console.log({ i: i });
            return i;
        }
    }
}
function isSolved() {
    if (firstRun) {
        console.log("first run");
        return;
    }
    for (var i = 0; i < tiles.length; i++) {
        if (tiles[i][3] !== tiles[i][1]) {
            return false;
        }
        if (tiles[i][4] !== tiles[i][2]) {
            return false;
        }
    }
    // //console.log("solved");
    // setTimeout(() => {}, 1000);
    return true;
}
var solved = target;
function createInputJs() {
    var jsonFile = JSON.stringify({ target: target, random: random, solved: solved }, null, 2);
    (0, fs_1.writeFileSync)("./oneToFifteen/input.json", jsonFile);
}
function isEqual(sx, dx, sy, dy) {
    if (sx == dx && sy == dy) {
        return 1;
    }
    // let a = 0;
    // let b = 0;
    // if (sx == dx) {
    //   a = 1;
    // }
    // if (sy == dy) {
    //   b = 1;
    // }
    // if (a + b == 2) {
    //   return 1;
    // }
    return 0;
}
function checkEquality(random) {
    var i;
    var res = 0;
    for (i = 0; i < random.length; i++) {
        res += isEqual(random[i][1], target[i][1], random[i][2], target[i][2]);
    }
    return "".concat(res, "/16");
}
var random = __spreadArray([], shuffle(100), true);
var res = checkEquality(random);
var iOfBlank = findTile(blankX, blankY);
var blankTile = random[iOfBlank];
console.log({ target: target, random: random, solved: solved });
console.log(target.length);
console.log(random.length);
console.log(random[15][1], random[15][2]);
console.log({ blankTile: blankTile });
console.log({ moves: moves });
console.log({ res: res });
console.log("\n _ _ _ _ _\n");
exports["default"] = {};
createInputJs();
