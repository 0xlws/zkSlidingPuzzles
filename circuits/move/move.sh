#! /bin/bash


# powers of tau
# snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
# # contribute to ceremony (input="random text")
# echo random text | snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v

# snarkjs powersoftau verify pot12_0001.ptau
# # powers of tau phase 2 : slow
# snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v

# snarkjs powersoftau verify pot12_final.ptau




# cd circuit

circom circuit.circom --r1cs --wasm --sym --c
echo
echo "Compiled circuit.circom"
# create input.json file into js dir

# - cd into circuit folder 
cd circuit_js
# copy input.json file into js dir
cp ../input.json .
# generate witness.wtns file
node generate_witness.js circuit.wasm input.json witness.wtns

# cd into parent dir
cd ..
# generate .zkey : fast
snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_0000.zkey

snarkjs zkey new circuit.r1cs pot12_final.ptau circuit_0000.zkey

# contr phase 2 ceremony (input="random text")
echo random text | snarkjs zkey contribute circuit_0000.zkey circuit_0001.zkey --name="1st Contributor Name" -v



snarkjs zkey beacon circuit_0001.zkey circuit_final.zkey 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon phase2"


snarkjs zkey verify circuit.r1cs pot12_final.ptau circuit_final.zkey


# export verification key file
snarkjs zkey export verificationkey circuit_final.zkey verification_key.json


# copy witness.wtns into js dir
cp ./circuit_js/witness.wtns .
# create public file 
snarkjs groth16 prove circuit_final.zkey witness.wtns proof.json public.json
# create proof file
snarkjs groth16 verify verification_key.json public.json proof.json
# create solidity verify smart contract
snarkjs zkey export solidityverifier circuit_0001.zkey verifier.sol
# generate solidity inputs
snarkjs generatecall
# cleanup
# ./clean.sh

