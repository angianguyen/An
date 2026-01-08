# ZK Circuit Setup Script (PowerShell version)
# Compile circuit, generate keys, export Solidity verifier

Write-Host "🔧 Starting ZK Circuit Setup..." -ForegroundColor Cyan

# Step 1: Install dependencies
Write-Host "📦 Installing circom and snarkjs..." -ForegroundColor Yellow
npm install -g circom snarkjs

# Step 2: Compile circuit
Write-Host "⚙️ Compiling circuit..." -ForegroundColor Yellow
circom creditCheck.circom --r1cs --wasm --sym --c -o build

# Step 3: Powers of Tau ceremony
Write-Host "🔑 Generating Powers of Tau..." -ForegroundColor Yellow
Set-Location build
snarkjs powersoftau new bn128 14 pot14_0000.ptau -v
snarkjs powersoftau contribute pot14_0000.ptau pot14_0001.ptau --name="First contribution" -v -e="random entropy"
snarkjs powersoftau prepare phase2 pot14_0001.ptau pot14_final.ptau -v

# Step 4: Generate proving and verification keys
Write-Host "🔐 Generating zkey..." -ForegroundColor Yellow
snarkjs groth16 setup creditCheck.r1cs pot14_final.ptau creditCheck_0000.zkey
snarkjs zkey contribute creditCheck_0000.zkey creditCheck_final.zkey --name="Second contribution" -v -e="more random entropy"

# Step 5: Export verification key
Write-Host "📤 Exporting verification key..." -ForegroundColor Yellow
snarkjs zkey export verificationkey creditCheck_final.zkey verification_key.json

# Step 6: Generate Solidity verifier
Write-Host "📜 Generating Solidity verifier..." -ForegroundColor Yellow
snarkjs zkey export solidityverifier creditCheck_final.zkey ../../contracts/contracts/Verifier.sol

# Step 7: Copy WASM and zkey to frontend
Write-Host "📋 Copying files to frontend..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "../../frontend/public/zk"
Copy-Item "creditCheck_js/creditCheck.wasm" "../../frontend/public/zk/"
Copy-Item "creditCheck_final.zkey" "../../frontend/public/zk/"
Copy-Item "verification_key.json" "../../frontend/public/zk/"

Set-Location ..

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host "📁 Files generated:" -ForegroundColor Cyan
Write-Host "  - build/creditCheck.r1cs (R1CS circuit)"
Write-Host "  - build/creditCheck_js/creditCheck.wasm (WASM prover)"
Write-Host "  - build/creditCheck_final.zkey (Proving key)"
Write-Host "  - build/verification_key.json (Verification key)"
Write-Host "  - contracts/contracts/Verifier.sol (Solidity verifier)"
Write-Host "  - frontend/public/zk/* (Files for browser proof generation)"
