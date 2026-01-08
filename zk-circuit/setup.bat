@echo off
REM ZK Circuit Setup Batch Script for Windows
REM Run this to compile circuit and generate keys

echo Starting ZK Circuit Setup...
echo.

REM Step 1: Check if circom installed
where circom >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: circom not found!
    echo Please install: npm install -g circom snarkjs
    pause
    exit /b 1
)

echo Step 1: Compiling circuit...
circom creditCheck.circom --r1cs --wasm --sym --c -o build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Circuit compilation failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Powers of Tau ceremony...
cd build
snarkjs powersoftau new bn128 14 pot14_0000.ptau -v
snarkjs powersoftau contribute pot14_0000.ptau pot14_0001.ptau --name="First contribution" -v -e="random entropy"
snarkjs powersoftau prepare phase2 pot14_0001.ptau pot14_final.ptau -v

echo.
echo Step 3: Generating proving key...
snarkjs groth16 setup creditCheck.r1cs pot14_final.ptau creditCheck_0000.zkey
snarkjs zkey contribute creditCheck_0000.zkey creditCheck_final.zkey --name="Second contribution" -v -e="more random entropy"

echo.
echo Step 4: Exporting verification key...
snarkjs zkey export verificationkey creditCheck_final.zkey verification_key.json

echo.
echo Step 5: Generating Solidity verifier...
snarkjs zkey export solidityverifier creditCheck_final.zkey ..\..\contracts\contracts\Verifier.sol

echo.
echo Step 6: Copying files to frontend...
if not exist "..\..\frontend\public\zk" mkdir "..\..\frontend\public\zk"
copy /Y "creditCheck_js\creditCheck.wasm" "..\..\frontend\public\zk\"
copy /Y "creditCheck_final.zkey" "..\..\frontend\public\zk\"
copy /Y "verification_key.json" "..\..\frontend\public\zk\"

cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo Files generated:
echo   - build\creditCheck.r1cs (R1CS circuit)
echo   - build\creditCheck_js\creditCheck.wasm (WASM prover)
echo   - build\creditCheck_final.zkey (Proving key)
echo   - build\verification_key.json (Verification key)
echo   - contracts\contracts\Verifier.sol (Solidity verifier)
echo   - frontend\public\zk\* (Files for browser proof generation)
echo.
pause
