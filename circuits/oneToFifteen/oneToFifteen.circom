pragma circom 2.0.3;

// include "circomlib/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
// include "https://github.com/0xPARC/circom-secp256k1/blob/master/circuits/bigint.circom";

template Add(n) {
    signal input in[n];
    signal output out;

    var sum = 0;

    var i;
    for (i=0;i<n;i++) {
        sum += in[i];
    }

    out <== sum;
}

template oneToFifteen () {
  signal input  target[16][5];
  signal input  random[16][5];
  signal input  solved[16][5];

  var outA;
  var outB;
  var outC;

  component eq1[48];
  component add[16];

  var sum = 0;
  var i;
  var j = 0;
  for(i=0;i<16;i++){
    eq1[j] = IsEqual();
    eq1[j].in[0] <== target[i][1];
    eq1[j].in[1] <== random[i][1];
    outA = eq1[j].out;

    eq1[j+1] =IsEqual();
    eq1[j+1].in[0] <== target[i][2];
    eq1[j+1].in[1] <== random[i][2];
    outB = eq1[j+1].out;

    add[i] = Add(2);
    add[i].in[0] <== outA;
    add[i].in[1] <== outB;
    outC = add[i].out;

    eq1[j+2] =IsEqual();
    eq1[j+2].in[0] <== outC;
    eq1[j+2].in[1]  <== 2;
    sum += eq1[j+2].out;

    j+=3;
  }

  sum === 1;

  component eq2[32];

  sum = 0;
  j = 0;
  var k = 0;
  var x;
  var y;
  for(y=0;y<4;y++){
    for(x=0;x<4;x++){ 
      eq2[j] = IsEqual();
      eq2[j].in[0] <== target[k][1];
      eq2[j].in[1] <== x;
      outA = eq2[j].out;
      eq2[j+1] =IsEqual();
      eq2[j+1].in[0] <== target[k][2];
      eq2[j+1].in[1] <== y;
      outB = eq2[j+1].out;
      j+=2;
      k++;
      sum += outA;
      sum += outB;
    }
  }

  sum === 32;

  component eq3[32];

  sum = 0;
  j = 0;
  k = 0;
  for(y=0;y<4;y++){
    for(x=0;x<4;x++){ 
      target[k][0] === solved[k][0];
      target[k][3] === solved[k][3];
      target[k][4] === solved[k][4];
      random[k][3] === solved[k][3];
      random[k][4] === solved[k][4];
      eq3[j] = IsEqual();
      eq3[j].in[0] <== target[k][1];
      eq3[j].in[1] <== solved[k][1];
      outA = eq3[j].out;
      eq3[j+1] =IsEqual();
      eq3[j+1].in[0] <== target[k][2];
      eq3[j+1].in[1] <== solved[k][2];
      outB = eq3[j+1].out;
      j+=2;
      k++;
      sum += outA;
      sum += outB;
    }
  }
   sum === 32;
}

component main { public [ta] } = oneToFifteen();

/*
INPUT = 
{
  "target": [
    [ 1, 0, 0, 2, 1 ],  [ 2, 1, 0, 2, 2 ],
    [ 3, 2, 0, 3, 0 ],  [ 4, 3, 0, 1, 0 ],
    [ 5, 0, 1, 0, 2 ],  [ 6, 1, 1, 0, 0 ],
    [ 7, 2, 1, 1, 2 ],  [ 8, 3, 1, 3, 1 ],
    [ 9, 0, 2, 2, 0 ],  [ 10, 1, 2, 0, 1 ],
    [ 11, 2, 2, 3, 2 ], [ 12, 3, 2, 1, 3 ],
    [ 13, 0, 3, 2, 3 ], [ 14, 1, 3, 0, 3 ],
    [ 15, 2, 3, 3, 3 ], [ 16, 3, 3, 1, 1 ]
  ],
  "random": [
    [ 1, 2, 1, 2, 1 ],  [ 2, 2, 2, 2, 2 ],
    [ 3, 3, 0, 3, 0 ],  [ 4, 1, 0, 1, 0 ],
    [ 5, 0, 2, 0, 2 ],  [ 6, 0, 0, 0, 0 ],
    [ 7, 1, 2, 1, 2 ],  [ 8, 3, 1, 3, 1 ],
    [ 9, 2, 0, 2, 0 ],  [ 10, 0, 1, 0, 1 ],
    [ 11, 3, 2, 3, 2 ], [ 12, 1, 3, 1, 3 ],
    [ 13, 2, 3, 2, 3 ], [ 14, 0, 3, 0, 3 ],
    [ 15, 3, 3, 3, 3 ], [ 16, 1, 1, 1, 1 ]
  ],
  "solved": [
    [ 1, 0, 0, 2, 1 ],  [ 2, 1, 0, 2, 2 ],
    [ 3, 2, 0, 3, 0 ],  [ 4, 3, 0, 1, 0 ],
    [ 5, 0, 1, 0, 2 ],  [ 6, 1, 1, 0, 0 ],
    [ 7, 2, 1, 1, 2 ],  [ 8, 3, 1, 3, 1 ],
    [ 9, 0, 2, 2, 0 ],  [ 10, 1, 2, 0, 1 ],
    [ 11, 2, 2, 3, 2 ], [ 12, 3, 2, 1, 3 ],
    [ 13, 0, 3, 2, 3 ], [ 14, 1, 3, 0, 3 ],
    [ 15, 2, 3, 3, 3 ], [ 16, 3, 3, 1, 1 ]
  ]
}
*/