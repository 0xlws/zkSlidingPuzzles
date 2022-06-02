console.log("\n _ _ _ _ _\n");

import { writeFileSync } from "fs";

let target: number[][];
let tiles: number[][] = [];
let rows = 4;
let cols = 4;
let index = 1;
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    let tile = [index, x, y, x, y];
    tiles.push(tile);
    index++;
  }
}
target = tiles.map((a) => {
  return [...a];
});

let blankX = tiles[15][1];
let blankY = tiles[15][2];

let firstRun: boolean = false;
let prevX = 999;
let prevY = 999;
let moves = 0;

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

function shuffle(n?: number) {
  let num = n ? n : 100;
  for (let i = 0; i < num; i++) {
    if (i == num - 1) {
      i = 0;
    }
    let r1 = Math.floor((Math.random() * 10) % cols);
    let r2 = Math.floor((Math.random() * 100) % rows);
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
  for (let i = 0; i < tiles.length; i++) {
    tiles[i][3] = tiles[i][1];
    tiles[i][4] = tiles[i][2];
    target[i][3] = tiles[i][1];
    target[i][4] = tiles[i][2];
  }
  overlap(tiles);
  return tiles;
}

function overlap(tiles: number[][]) {
  let char = [];
  let count = [];

  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i][1] != tiles[i][3] || tiles[i][2] != tiles[i][4]) {
      throw new Error("Wrong init values");
    }
    let xyixiy = [tiles[i].slice(-4)].join();
    let indexOfxyixiy = char.indexOf(xyixiy);
    if (indexOfxyixiy === -1) {
      char.push(xyixiy);
      count.push(1);
    } else {
      count[indexOfxyixiy] += 1;
    }
  }

  for (let i = 0; i < char.length; i++) {
    console.log(char[i], "-", count[i]);
    if (count[i] > 1) {
      throw new Error(`Duplicate found`);
    }
  }
}

function move(x: number, y: number) {
  let i = findTile(blankX, blankY) as number;
  tiles[i][1] = x;
  tiles[i][2] = y;
  let TO = tiles[i];
  i = findTile(x, y) as number;
  tiles[i][1] = blankX;
  tiles[i][2] = blankY;
  // console.log({blankX})
  let FROM = tiles[i];

  console.log({ FROM });
  console.log({ TO });

  prevX = blankX;
  prevY = blankY;
  blankX = x;
  blankY = y;
  firstRun = false;
  return tiles;
}

function validMove(x: number, y: number) {
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

function sameMove(x: number, y: number) {
  if (prevX == x && prevY == y) {
    return true;
  }
  return false;
}

function findTile(x: number, y: number) {
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i][1] == x && tiles[i][2] == y) {
      console.log({ i });
      return i;
    }
  }
}

function isSolved() {
  if (firstRun) {
    console.log("first run");
    return;
  }
  for (let i = 0; i < tiles.length; i++) {
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

let solved = target;
function createInputJs() {
  const jsonFile = JSON.stringify({ target, random, solved }, null, 2);
  writeFileSync("./oneToFifteen/input.json", jsonFile);
}

function isEqual(sx: any, dx: number, sy: any, dy: number) {
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

function checkEquality(random: any[][]) {
  let i;
  let res = 0;
  for (i = 0; i < random.length; i++) {
    res += isEqual(random[i][1], target[i][1], random[i][2], target[i][2]);
  }
  return `${res}/16`;
}

const random = [...shuffle(100)];
let res = checkEquality(random);

const iOfBlank = findTile(blankX, blankY) as number;
const blankTile = random[iOfBlank];

console.log({ target, random, solved });
console.log(target.length);
console.log(random.length);
console.log(random[15][1], random[15][2]);
console.log({ blankTile });
console.log({ moves });
console.log({ res });

console.log("\n _ _ _ _ _\n");
export default {};

createInputJs();
