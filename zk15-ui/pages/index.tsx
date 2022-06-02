import type { NextPage } from "next";
import detectEthereumProvider from "@metamask/detect-provider";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { P5Instance } from "react-p5-wrapper";
import { useState } from "react";
import dynamic from "next/dynamic";
import { P5WrapperProps } from "react-p5-wrapper";
export const P5Wrapper = dynamic({
  loader: () =>
    import("react-p5-wrapper").then((mod) => mod.ReactP5Wrapper as any),
  loading: () => <div>Loading...</div>,
  ssr: false,
}) as unknown as React.NamedExoticComponent<P5WrapperProps>;

// import zk15 from "../__contracts/artifacts/contracts/zk15.sol/zk15.json";
import zk15 from "../artifacts/contracts/zk15.sol/zk15.json";
import { Contract, ethers, providers, Wallet } from "ethers";
import { useEffect } from "react";
const snarkjs = require("snarkjs");

const cfg = {
  rinkebyUrl: process.env.NEXT_PUBLIC_RINKEBY_URL,
  harmonyUrl: process.env.NEXT_PUBLIC_HARMONY_URL,
  walletAddress: process.env.NEXT_PUBLIC_WALLET_ADDRESS,
  pKey: process.env.NEXT_PUBLIC_PRIVATE_KEY,
  hmnyMainnet: process.env.NEXT_PUBLIC_MAINNET_ADDRESS,
};

let testcount = 0;
let TILES: any[] = [];
let loaded = false;
let rerender = false;
let solvedBoard: any;
let inProgress: boolean;
let log = "Welcome!";
let highScore = "";
let shuffleCount = 0;
let signer: any;
let minted: boolean;
let finalSteps: number;

interface Tile {
  length: number;
  index: number;
  x: number;
  y: number;
  dY: any;
  dX: any;
  initX: number;
  initY: number;
  targetX: any;
  targetY: any;
  moving: boolean;
  imgX: number;
  imgY: number;
}

const Home: NextPage = () => {
  const [gradientBg, setGradientBg] = useState(false);
  const [gradientCanvas, setGradientCanvas] = useState(false);
  const [imgBg, setImgbg] = useState(false);
  const [wAndH, setWAndH] = useState<number[]>([0, 0]);
  const [color, setColor] = useState(["white", "white"]);
  const [connected, setConnected] = useState(false);
  const [proofMade, setProof] = useState<any>();
  const [challenge, setChallenge] = useState<any>();

  async function connectWallet() {
    // console.log("pressed");
    const provider = (await detectEthereumProvider()) as any;
    await provider.request({ method: "eth_requestAccounts" });
    const ethersProvider = new providers.Web3Provider(provider);
    // const signer = provider.getSigner();
    const _signer = ethersProvider.getSigner();
    const network = await ethersProvider.getNetwork();
    const networkName = network.name;
    const networkId = network.chainId;
    console.log({ networkName });
    console.log({ networkId });
    // if (networkId == 31337) {
    if (networkId == 4) {
      signer = _signer;
      setConnected(true);
      return;
    }
    signer = "";
    setConnected(false);
    window.alert("please connect to rinkeby testnet");
    // const provider = new providers.JsonRpcProvider(`${cfg.rinkebyUrl}`);
    // const contractOwner = contract.connect(signer);
    // setSigner(signer);
    // setConnected(true);
  }

  const contract = new Contract(
    "0x73Bad55a239234a56edba9668473537223126716",
    zk15.abi
  );

  useEffect(() => {
    if (connected) {
      setColor(["goldenrod", "goldenrod"]);
    } else {
      setColor(["white", "white"]);
    }
  }, [connected]);

  useEffect(() => {}, [challenge]);
  useEffect(() => {
    getHighScore();
  }, []);

  async function getChallenge() {
    // localhost
    // const provider = new providers.JsonRpcProvider(`http://localhost:8545`);
    // const signer = new Wallet(
    //   `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`,
    //   provider
    // );

    // rinkeby
    const provider = new providers.JsonRpcProvider(`${cfg.rinkebyUrl}`);
    const signer = new Wallet(`${cfg.pKey}`, provider);
    try {
      const contractOwner = contract.connect(signer);
      let challenge = await contractOwner.getBoard();
      setChallenge(challenge);
      return challenge;
    } catch (e) {
      console.log(e);
    }
  }

  async function getHighScore() {
    // localhost
    // const provider = new providers.JsonRpcProvider(`http://localhost:8545`);
    // const signer = new Wallet(
    //   `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`,
    //   provider
    // );

    // rinkeby
    const provider = new providers.JsonRpcProvider(`${cfg.rinkebyUrl}`);
    const signer = new Wallet(`${cfg.pKey}`, provider);

    const contractOwner = contract.connect(signer);
    let scores = await contractOwner.getScores();

    try {
      scores = scores.map((bn: any) => parseInt(bn));
      highScore = Math.max.apply(null, scores).toString();
    } catch (e) {
      console.log(e);
    }
    return challenge;
  }

  if (!challenge) {
    // connectWallet()
    getChallenge();

    return null;
  }

  function handleMint() {
    let board: any[] = [];
    let temp;

    for (let i = 0; i < TILES.length; i++) {
      temp = [
        TILES[i].index,
        TILES[i].x,
        TILES[i].y,
        TILES[i].initX,
        TILES[i].initY,
      ];
      board.push(temp);
    }

    solvedBoard = board;

    Mint();
  }

  // ONCHAIN
  async function verifyMove(
    x: number,
    y: number,
    blankX: number,
    blankY: number
  ) {
    // localhost
    // const provider = new providers.JsonRpcProvider(`http://localhost:8545`);
    // const signer = new Wallet(
    //   `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`,
    //   provider
    // );

    // rinkeby
    const provider = new providers.JsonRpcProvider(`${cfg.rinkebyUrl}`);
    const signer = new Wallet(`${cfg.pKey}`, provider);

    const contractOwner = contract.connect(signer);
    let res = await contractOwner.moveIsValid(x, y, blankX, blankY);
    // console.log({ res });
    return res;
  }

  // SNARK
  // async function verifyMove(
  //   x: number,
  //   y: number,
  //   blankX: number,
  //   blankY: number
  // ) {
  //   console.log("validating");
  //   const { proof, publicSignals } = await await snarkjs.groth16.fullProve(
  //     { target: [x, y], blank: [blankX, blankY] },
  //     "./zkproof/circuit.wasm",
  //     "./zkproof/circuit_final.zkey"
  //   );
  //   console.log({ proof });
  //   return true;
  // }

  async function Mint() {
    if (minted) {
      setConnected(false);
      return;
    }

    // console.log({ finalSteps });
    if (finalSteps == 0) {
      finalSteps = 1;
    }
    // localhost
    // const provider = new providers.JsonRpcProvider(`http://localhost:8545`);
    // const signer = new Wallet(
    //   `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`,
    //   provider
    // );

    // rinkeby
    // const provider = new providers.JsonRpcProvider(`${cfg.rinkebyUrl}`);
    // const signer = new Wallet(`${cfg.pKey}`, provider);

    const contractOwner = contract.connect(signer);
    if (shuffleCount == 0) {
      return;
    }
    if (inProgress) {
      window.alert("Minting already in progress");
      return;
    }
    try {
      let h;
      let i;
      h = solvedBoard;
      i = challenge;
      inProgress = true;
      window.alert("generating proof");
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        { target: h, random: i, solved: h },
        "./zkproof/oneToFifteen.wasm",
        "./zkproof/oneToFifteen_final.zkey"
      );
      window.alert("Sit back and relax...");
      console.log("Proof: ");
      console.log(JSON.stringify(proof, null, 1));

      const vKey = await (
        await fetch("./zkproof/oneToFifteen_key.json")
      ).json();

      const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

      if (res === true) {
        window.alert("Verification OK");
        const { proofList, a, b, c } = getSolidityProofArray(proof);
        window.alert("Minting NFT...");
        let call = await contractOwner.verifyProof(
          a,
          b,
          c,
          publicSignals,
          finalSteps,
          {
            gasLimit: 2000000,
          }
        );
        let tx = await call.wait();

        // console.log(tx);
        if (!call) {
          window.alert(
            "Something went wrong :'), please check if metamask is connected."
          );
        }
        window.alert("zk15 NFT Minted ;)");
        // setAlreadyMinted(true);
        finalSteps = 0;
        minted = true;
        inProgress = false;
      } else {
        window.alert("Invalid proof");
      }
    } catch (e) {
      inProgress = false;
      // setInProgress(false);
      window.alert(e);
    }
  }

  const getSolidityProofArray = (proof: any) => {
    let proofList = [
      proof["pi_a"][0],
      proof["pi_a"][1],
      proof["pi_b"][0][1],
      proof["pi_b"][0][0],
      proof["pi_b"][1][1],
      proof["pi_b"][1][0],
      proof["pi_c"][0],
      proof["pi_c"][1],
    ];

    let a = [proofList[0], proofList[1]];
    let b = [
      [proofList[2], proofList[3]],
      [proofList[4], proofList[5]],
    ];
    let c = [proofList[6], proofList[7]];
    // return {proofList, };
    return { proofList, a, b, c };
  };

  function switch1() {
    setGradientBg(!gradientBg);
    if (gradientCanvas) {
      setGradientCanvas(false);
    }
  }

  function switch2() {
    setGradientCanvas(!gradientCanvas);
    if (gradientBg) {
      setGradientBg(false);
    }
    if (imgBg) {
      setImgbg(false);
    }
  }

  function switch3() {
    setImgbg(!imgBg);
    if (gradientCanvas) {
      setGradientCanvas(false);
    }
  }

  // async function getBoard() {
  //   let data: { index: number; x: number; y: number }[];
  //   data = await contract.newGame();
  //   // data = await contract.getChallenge(0);
  //   // data = await contract.getTiles();
  //   // data = await contract.getTiles2();
  //   data = data.map((a: any) => {
  //     return {
  //       index: parseInt(a.index),
  //       x: parseInt(a.x),
  //       y: parseInt(a.y),
  //     };
  //   });
  //   console.log(data);
  //   // return data;
  // }

  async function showScores() {
    window.alert("Coming very soon... ");
  }

  async function showInfo() {
    window.alert(`
    Try to solve the puzzle in the least moves possible. 
    Scores will be on the blockchain.
    Everybody gets the same challenge/board for now.
    After verification, NFT is minted,
    soon users can add their names and score to the board.

    - In disconnected mode, shuffle may break the counter
    - reload the page before playing again to mint again
    Have fun
                                               :)
    `);
  }

  let rendercount = 0;
  const Sketch = () => (p: P5Instance) => {
    rendercount++;
    if (rendercount == 0) {
      rendercount = 0;
      return;
    }

    if (connected) {
      shuffleCount = 0;
    }

    let tiles: any[] = [];

    let source: any;
    let cols = 4;
    let rows = 4;
    let w: number, h: number;
    let counter = 0;
    let speed = 0.3;
    let moving = false;
    let blankX: number;
    let blankY: number;
    let prevX = 999;
    let prevY = 999;
    let PRO = false;
    let firstRun = true;
    let shuffling = false;
    let shuffleCounter = 0;
    let timeOutArr = [];
    let log = "Welcome";

    class Tile {
      index: number;
      x: number;
      y: number;
      dY: any;
      dX: any;
      initX: number;
      initY: number;
      targetX: any;
      targetY: any;
      moving: boolean;
      imgX: number;
      imgY: number;
      constructor(
        index: number,
        x: number,
        y: number,
        initX: number,
        initY: number
      ) {
        this.x = x;
        this.y = y;
        this.index = index;
        this.initX = initX;
        this.initY = initY;
        this.imgX = 5;
        this.imgY = 5;
        this.moving = false;
      }

      update() {
        if (this.moving) {
          this.targetX += this.dX * speed;
          this.targetY += this.dY * speed;
          if (
            this.dX * (this.targetX - this.x * w) > 0 ||
            this.dY * (this.targetY - this.y * h) > 0
          ) {
            this.moving = false;
            moving = false;
          }
        }
      }

      move(x: number, y: number, dx: number, dy: number) {
        moving = true;
        this.moving = true;
        this.targetX = this.x * w;
        this.targetY = this.y * h;
        this.dX = this.x < x ? 150 : this.x > x ? -150 : 0;
        this.dY = this.y < y ? 150 : this.y > y ? -150 : 0;
        this.x = x;
        this.y = y;
      }

      show() {
        let x = this.moving ? this.targetX : this.x * w;
        let y = this.moving ? this.targetY : this.y * h;
        if (!gradientBg && !gradientCanvas && !imgBg) {
          p.stroke(100);
        } else if (imgBg) {
          p.stroke(0);
        }

        p.image(source, x, y, w, h, this.imgX * w, this.imgY * h, w, h);

        p.noFill();
        p.rect(x, y, w, h);

        p.fill(`${color[0]}`);
        p.strokeWeight(2);

        if (this.index == 16) {
          return;
        }
        p.text(`${this.index}`, x, y, w, h);
      }
    }

    p.preload = () => {
      if (imgBg) {
        // source = p.loadImage("keith-misner.jpeg");
        source = p.createImage(400, 400);
      } else if (!imgBg) {
        source = p.createImage(400, 400);
        source.loadPixels();
        for (let x = 0; x < source.width / cols; x++) {
          for (let y = 0; y < source.height; y++) {
            let a = p.map(x, 100, 0, 50, 25);
            source.set(x, y, [255, 0, 0, a]);
            source.set(x - 200, y, [255, 0, 0, a]);
          }
        }

        source.updatePixels();
      } else {
      }
    };

    p.setup = () => {
      let dancing = p.loadFont("fonts/Dancing script.ttf");
      let medici = p.loadFont("fonts/Medici Text.ttf");
      let parisienne = p.loadFont("fonts/Parisienne-Regular.ttf");
      let rise = p.loadFont("fonts/Rise of Kingdom.ttf");
      let scriptina = p.loadFont("fonts/SCRIPTIN.ttf");
      p.textFont(rise);
      p.textSize(50);
      p.textAlign(p.CENTER, p.CENTER);
      p.stroke(0);

      let sourceWidth;
      if (p.windowWidth < 500) {
        sourceWidth = 280;
      } else {
        sourceWidth = 400;
      }
      if (wAndH[0] !== sourceWidth) {
        setWAndH([sourceWidth, p.height]);
      }

      let canvas = p.createCanvas(sourceWidth, 400);
      source.resize(sourceWidth, p.height);
      if (gradientCanvas) {
        canvas.style(`  
          background: linear-gradient(
            -45deg,
            #221002d1, #ba6a34fc, #500a3ab3, #a14e06c7 
            );
            background-size: 400% 400%;
            animation: gradient 10s ease infinite;
            `);
      }

      if (gradientBg && !imgBg) {
        canvas.style(`
          background-color:#222;
          `);
      }

      // p.resizeCanvas(400,400)

      canvas.style(`
        border-radius: 5px;
          box-shadow: 0 0 100px black;
          `);
      w = p.width / cols;
      h = p.height / rows;

      // console.log({ rerender });
      // console.log(TILES);
      try {
        if (connected && challenge) {
          // console.log({ challenge });
          for (let i = 0; i < challenge.length; i++) {
            let tile = new Tile(
              challenge[i][0],
              challenge[i][1],
              challenge[i][2],
              challenge[i][3],
              challenge[i][4]
            );
            tiles.push(tile);
          }
        } else {
          // onetoFifteen
          let index = 1;
          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              let tile = new Tile(index, x, y, x, y);
              tiles.push(tile);
              index++;
            }
          }
        }

        // ___ init ___

        let i = 0;
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            tiles[i].imgX = x;
            tiles[i].imgY = y;
            i++;
          }
        }

        // debug challenge / Mint

        // if (challenge) {
        //   console.log(challenge);
        //   let index = 1;
        //   for (let y = 0; y < rows; y++) {
        //     for (let x = 0; x < cols; x++) {
        //       let tile = new Tile(
        //         index,
        //         x,
        //         y,
        //         challenge[index - 1][3],
        //         challenge[index - 1][4]
        //       );
        //       tiles.push(tile);
        //       index++;
        //     }
        //   }
        // }

        //  fifteenToOne

        // let index = 1;
        // for (let x = 3; x >= 0; x--) {
        // for (let y = 3; y >= 0; y--) {
        //     let tile = new Tile(index, x, y, x, y);
        //     tiles.push(tile);
        //     index++;
        //   }
        // }

        //  verticalNumbers

        // let index = 1;
        // for (let x = 0; x < cols; x++) {
        // for (let y = 0; y < rows; y++) {
        //     let tile = new Tile(index, x, y, x, y);
        //     tiles.push(tile);
        //     index++;
        //   }
        // }

        //  skipOddtoEven

        // let index = 1;
        // for (let y = 0; y < 4; y++) {
        //   for (let x = 0; x < 4; x++) {
        //       let xx=  x== 1? 2:x==2? 1:x
        //       let tile = new Tile(index, xx, y, x, y);
        //       tiles.push(tile);
        //     index++;
        //   }
        // }

        //  verticalOddEven

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

        let counterDiv = p.createDiv("0").id("counter");
        counterDiv.style(`
          flex-direction: row;
          z-index: 100;
          padding: 8px 16px;
          margin: 4px;
          font-weight:bold;
          background-color: rgba(255, 0, 0, 0.5);
          // width:92px;
          // box-shadow: 0 0 2px white;
          background-color: #0056b800;
          border: 1px solid white;
          border-radius: 5px;
          text-align: center;
          color: white;
          `);

        let logger = p.createButton("").parent("logger").hide();
      } catch (e) {
        let logger = p.createButton("Failure, see console").parent("logs");
        console.log(e);
      }

      // }
      if (!connected) {
        let btn1 = p.createButton(`Shuffle`);
        btn1.parent("#buttonLeft");
        btn1.style(`
        font:inherit;
        flex-direction: row;
        z-index: 10;
        padding: 8px 16px;
        margin-top: 9px;
        width: 92px;
        box-shadow: 0 0 2px ${color[1]};
        background-color: #0056b800;
        border: 0;
        border-radius: 5px;
        text-align: center;
        cursor: pointer;
        color: ${color[1]};`);
        btn1.mousePressed(() => {
          shuffle(1000);
        });
        if (rendercount == 1) {
          shuffle(1500);
        }
      }
      blankX = tiles[15].x;
      blankY = tiles[15].y;
      loaded = true;
      rerender = true;
      TILES = tiles;
    };

    p.mouseReleased = () => {
      testcount++;
      let x = p.floor(p.mouseX / w);
      let y = p.floor(p.mouseY / h);
      // console.log(x, y);
      if (outOfBoard(x, y)) {
        return;
      } else {
        move(x, y);
      }
    };

    function shuffle(n: number) {
      if (connected) {
        return;
      }
      p.loop();

      shuffling = true;
      let j = 0;
      for (let i = 0; i < 10000; i++) {
        timeOutArr[i] = setTimeout(() => {
          if (j == n) {
            shuffling = false;
            firstRun = true;
            shuffleCount++;
            return;
          }

          let r1 = p.floor(p.random(cols));
          let r2 = p.floor(p.random(rows));
          if (!sameMove(r1, r2)) {
            move(r1, r2);
            j++;
          }
        }, i + 2);
      }
    }

    function outOfBoard(x: number, y: number) {
      if (x < 0) {
        return true;
      }
      if (x >= cols) {
        return true;
      }
      if (y < 0) {
        return true;
      }
      if (y >= rows) {
        return true;
      }
    }

    function sendMint() {
      let board: any[] = [];
      let tmp;
      for (let i = 0; i < tiles.length; i++) {
        tmp = [
          tiles[i].index,
          tiles[i].x,
          tiles[i].y,
          tiles[i].initX,
          tiles[i].initY,
        ];

        board.push(tmp);
        solvedBoard = board;
      }
      if (solvedBoard) {
        Mint();
      }
      return;
    }
    async function move(x: number, y: number) {
      let tile;
      if (moving) {
        return;
      }

      // console.log({ firstRun });
      if (isSolved() && !firstRun) {
        if (!connected || shuffling || minted) {
          firstRun = true;
          window.alert(
            "Solved!    Press shuffle to play again or connect wallet for fixed challenge."
          );
          return;
        }
        if (firstRun) {
          counter = 0;
        }
        firstRun = false;

        sendMint();

        return;
      }
      if (!connected) {
        if (validMove(x, y)) {
          tile = findTile(x, y);
          tile.move(blankX, blankY);
          if (shuffling) {
            shuffleCounter += 1;
            counter = 0;
            // //console.log(shuffleCounter);
          } else {
            if (!sameMove(x, y) && !shuffling) {
              counter += 1;
            }
          }
          // counter+=1

          prevX = blankX;
          prevY = blankY;
          blankX = x;
          blankY = y;

          p.select("#counter")?.html(`${counter}`);
        }
      } else if (connected) {
        // counter+=1
        if (proofMade) {
          p.select("#logger")?.html(
            "Smart contract verification in progress..."
          );
        }
        try {
          moving = true;
          p.select("#logger")?.html("Validating move...");
          let tx = await verifyMove(x, y, blankX, blankY);
          // console.log({ tx });
          if (tx) {
            counter += 1;
            p.select("#logger")?.html("Move OK");
            tile = findTile(x, y);
            tile.move(blankX, blankY);
            prevX = blankX;
            prevY = blankY;
            blankX = x;
            blankY = y;
            tiles[15].x = blankX;
            tiles[15].y = blankY;
            TILES = tiles;
            finalSteps = counter;
            // console.log({ finalSteps });
            p.select("#counter")?.html(`${counter}`);
            moving = false;
          } else {
            throw new Error(tx);
          }
        } catch (e) {
          moving = false;
          p.select("#logger")?.html("Invalid move");
          console.log(e);

          return;
        }
      }
    }

    function validMove(x: number, y: number) {
      if (outOfBoard(x, y)) {
        return false;
      }
      if (blankX == x && blankY == y) {
        return false;
      }
      if (p.abs(x - blankX) + p.abs(y - blankY) == 1) {
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
        if (tiles[i].x == x && tiles[i].y == y) {
          return tiles[i];
        }
      }
    }

    p.draw = () => {
      p.resizeCanvas(cols * w, rows * h);
      for (let i = 0; i < tiles.length; i++) {
        tiles[i].show();
        tiles[i].update();
      }
    };

    function isSolved() {
      if (shuffleCount == 0) {
        return;
      }
      if (firstRun) {
        // console.log({firstRun});
        return;
      }

      for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].x !== tiles[i].imgX) {
          return false;
        }
        if (tiles[i].y !== tiles[i].imgY) {
          return false;
        }
      }

      // let i = 0;
      // for (let y = 0; y < 4; y++) {
      //   for (let x = 0; x < 4; x++) {
      //     if (tiles[i].x !== x && tiles[i].y !== y) {
      //       return false;
      //     }
      //     i++;
      //   }
      // return false;
      // }

      log = "Solved! Press Mint to mint an NFT";
      setTimeout(() => {
        p.noLoop();
      }, 1000);
      return true;
    }
    if (!connected) {
      p.select("#logger")?.html(highScore);
    }
  };

  return (
    <>
      <div>
        {gradientBg ? (
          <style jsx global>
            {`
              body {
                /* background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab); */
                background: linear-gradient(
                  -45deg,
                  // #ba3f0fbc,
                  // #5a171b6a,
                  // #5328147e,
                  // #a019738f
                  #dc12128e,
                  #856c106a,
                  #820f5c7e,
                  #884f0a8f
                );
                background-size: 400% 400%;
                animation: gradient 20s ease infinite;
              }

              @keyframes gradient {
                0% {
                  background-position: 0% 50%;
                }
                50% {
                  background-position: 100% 50%;
                }
                100% {
                  background-position: 0% 50%;
                }
              }
            `}
          </style>
        ) : (
          ""
        )}
      </div>

      <div className={styles.container}>
        <Head>
          <title>zk15Puzzle</title>
          {/* <meta name="description" content="Generated by create next app" /> */}
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main
          className={styles.main}
          style={
            {
              // backgroundColor: "black",
            }
          }
        >
          {/* <Image
           style={{
             zIndex:"-10",
             width:"100vw",
            // height:"100vh",
            filter:"blur(3px)",
            position:"absolute",
            overflow:"hidden",
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
          src={"/keith-misner.jpeg"} layout="fill"></Image>
        */}

          <div
            style={{
              display: "flex",
              position: "relative",
              top: "0",
              width: "100vw",
              maxHeight: "50px",
              flexDirection: "row",
              justifyContent: "space-between",
              backgroundColor: "#333",
              margin: "0px 5px 0px 5px",
              padding: "0px 5px 0px 5px",
              boxShadow: "0 0 10px black",
            }}
          >
            <div
              style={{
                height: "50px",
                flexWrap: "wrap-reverse",
                justifyContent: "center",
                alignContent: "center",
              }}
            >
              {!connected ? (
                <div id="buttonLeft" className={styles.button}></div>
              ) : connected ? (
                <div
                  style={{ padding: "8px 16px" }}
                  onClick={() => handleMint()}
                  className={styles.goldenBtn}
                >
                  Mint
                </div>
              ) : (
                ""
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignContent: "center",
                margin: "0",
                top: "100%",
              }}
            >
              <h1
                className={styles.title}
                style={{
                  WebkitTextStroke: "0.5px black",
                  color: `${color[0]}`,
                }}
              >
                zk15Puzzle
              </h1>
            </div>
            <style jsx>
              {`
                @media only screen and (min-width: 0px) and (max-device-width: 500px) {
                  // #buttons {
                  //   max-width: 280px;
                  //   flex-direction: row;
                  //   position: absolute;
                  // }
                }
              `}
            </style>
            <div
              id="buttons"
              style={{
                display: "flex",
                height: "50px",
                flexWrap: "wrap-reverse",
                justifyContent: "center",
                alignContent: "center",
              }}
            >
              {!connected ? (
                <div
                  onClick={() => connectWallet()}
                  style={{
                    boxShadow: "0 0 2px white",
                    color: `${color[0]}`,
                    padding: "8px 16px",
                  }}
                  className={styles.button}
                >
                  Connect
                </div>
              ) : (
                <div
                  onClick={() => setConnected(false)}
                  style={{
                    color: `${color[0]}`,
                    padding: "8px 2px",
                    boxShadow: "0 0 2px goldenrod",
                  }}
                  className={styles.button}
                >
                  Disconnect
                </div>
              )}
            </div>
          </div>

          <div
            className="buttons"
            style={{ display: "flex", flexDirection: "row", maxWidth: "400" }}
          >
            <div
              className={styles.buttonSmall}
              style={{ color: `${color[0]}`, boxShadow: `0 0 2px ${color[0]}` }}
              onClick={() => showScores()}
            >
              Scores
            </div>
            <div
              id="logger"
              style={{
                width: "184px",
                color: `rgb(225, 0, 0)`,
                boxShadow: `0 0 2px ${color[0]}`,
              }}
              className={styles.buttonSmall}
            ></div>
            <div
              className={styles.buttonSmall}
              style={{ color: `${color[0]}`, boxShadow: `0 0 2px ${color[0]}` }}
              onClick={() => showInfo()}
            >
              Info
            </div>
          </div>

          {gradientCanvas && !gradientBg ? (
            <style jsx>
              {`
                @keyframes gradient {
                  0% {
                    background-position: 0% 50%;
                  }
                  50% {
                    background-position: 100% 50%;
                  }
                  100% {
                    background-position: 0% 50%;
                  }
                }
              `}
            </style>
          ) : (
            ""
          )}

          <div className={styles.boardDiv}>
            <P5Wrapper sketch={Sketch()} />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          ></div>
        </main>
      </div>
    </>
  );
};

export default Home;
