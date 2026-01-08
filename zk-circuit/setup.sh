#!/bin/bash

# ZK Circuit Setup Script
# Compile circuit, generate keys, export Solidity verifier

echo "🔧 Starting ZK Circuit Setup..."

# Step 1: Install dependencies
echo "📦 Installing circom and snarkjs..."
npm install -g circom snarkjs

# Step 2: Compile circuit
echo "⚙️ Compiling circuit..."
circom creditCheck.circom --r1cs --wasm --sym --c -o build

# Step 3: Powers of Tau ceremony (for small circuits, use preset)
echo "🔑 Generating Powers of Tau..."
cd build
snarkjs powersoftau new bn128 14 pot14_0000.ptau -v
snarkjs powersoftau contribute pot14_0000.ptau pot14_0001.ptau --name="First contribution" -v -e="random entropy"
snarkjs powersoftau prepare phase2 pot14_0001.ptau pot14_final.ptau -v

# Step 4: Generate proving and verification keys
echo "🔐 Generating zkey..."
snarkjs groth16 setup creditCheck.r1cs pot14_final.ptau creditCheck_0000.zkey
snarkjs zkey contribute creditCheck_0000.zkey creditCheck_final.zkey --name="Second contribution" -v -e="more random entropy"

# Step 5: Export verification key
echo "📤 Exporting verification key..."
snarkjs zkey export verificationkey creditCheck_final.zkey verification_key.json

# Step 6: Generate Solidity verifier
echo "📜 Generating Solidity verifier..."
snarkjs zkey export solidityverifier creditCheck_final.zkey ../../contracts/contracts/Verifier.sol

# Step 7: Copy WASM and zkey to frontend
echo "📋 Copying files to frontend..."
mkdir -p ../../frontend/public/zk
cp creditCheck_js/creditCheck.wasm ../../frontend/public/zk/
cp creditCheck_final.zkey ../../frontend/public/zk/
cp verification_key.json ../../frontend/public/zk/

echo "✅ Setup complete!"
echo "📁 Files generated:"
echo "  - build/creditCheck.r1cs (R1CS circuit)"
echo "  - build/creditCheck_js/creditCheck.wasm (WASM prover)"
echo "  - build/creditCheck_final.zkey (Proving key)"
echo "  - build/verification_key.json (Verification key)"
echo "  - contracts/contracts/Verifier.sol (Solidity verifier)"
echo "  - frontend/public/zk/* (Files for browser proof generation)"
