#! /bin/bash

cd oneToFifteen
circom ./oneToFifteen.circom --r1cs --wasm --sym --c
echo
echo "Compiled oneToFifteen.circom"
# create input.json file into js dir
# yarn oneToFifteen
# - cd into oneToFifteen folder 
cd oneToFifteen_js
# copy input.json file into js dir
cp ../input.json .
# generate witness.wtns file
node generate_witness.js oneToFifteen.wasm input.json witness.wtns

# cd into parent dir
cd ..
# powers of tau ( is set to 14 instead of 12 )
snarkjs powersoftau new bn128 14 pot14_0000.ptau -v
# contribute to ceremony (input="random text")
echo random text | snarkjs powersoftau contribute pot14_0000.ptau pot14_0001.ptau --name="First contribution" -v

# powers of tau phase 2 : slow
snarkjs powersoftau prepare phase2 pot14_0001.ptau pot14_final.ptau -v
# generate .zkey : fast
snarkjs groth16 setup oneToFifteen.r1cs pot14_final.ptau oneToFifteen_0000.zkey
# contr phase 2 ceremony (input="random text")
echo random text | snarkjs zkey contribute oneToFifteen_0000.zkey oneToFifteen_0001.zkey --name="1st Contributor Name" -v

# export verification key file
snarkjs zkey export verificationkey oneToFifteen_0001.zkey verification_key.json
# copy witness.wtns into js dir
cp ./oneToFifteen_js/witness.wtns .
# create public file 
snarkjs groth16 prove oneToFifteen_0001.zkey witness.wtns proof.json public.json
# create proof file
snarkjs groth16 verify verification_key.json public.json proof.json
# create solidity verify smart contract
snarkjs zkey export solidityverifier oneToFifteen_0001.zkey verifier.sol
# generate solidity inputs
snarkjs generatecall
# cleanup
# ./clean.sh

