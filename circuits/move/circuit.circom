pragma circom 2.0.3;

// include "circomlib/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";




template AbsSub (n){
    signal input in[2];
    signal output out;
    signal a;
    signal b;
    signal switch;

    a <-- n + in[0];
    b <-- a - in[1];
    switch <-- b > n? b - n : n - b;

    out <== switch;
}

template Move () {
    signal input target[2];
    signal input blank[2];
    signal output out;


    // check if within bounds (4 x 4)
    component getZero[4];
    component letThree[4];

    var i;
    var j = 0;
    for(i=0;i<4;i+=2){
        getZero[i] = GreaterEqThan(32);
        getZero[i].in[0] <== target[j];
        getZero[i].in[1] <== 0;

        getZero[i].out === 1;
        getZero[i+1] = GreaterEqThan(32);
        getZero[i+1].in[0] <== blank[j];
        getZero[i+1].in[1] <== 0;

        getZero[i+1].out === 1;
        letThree[i] = LessEqThan(32);
        letThree[i].in[0] <== target[j];
        letThree[i].in[1] <== 3;

        letThree[i].out === 1;
        letThree[i+1] = LessEqThan(32);
        letThree[i+1].in[0] <== blank[j];
        letThree[i+1].in[1] <== 3;

        letThree[i+1].out === 1;

        j++;
    }
    
    // check if is neighbour
    component abs[2];
    for(i=0;i<2;i++){
        abs[i] = AbsSub(10);
        abs[i].in[0] <== target[i];
        abs[i].in[1] <== blank[i];
    }

    signal a;
    a <-- abs[0].out + abs[1].out;
    component eq = IsEqual();
        eq.in[0] <== a;
        eq.in[1] <== 1;

        eq.out === 1;

    out <== eq.out;
    
}

component main = Move();
// component main {public [target, blank]} = Move();