import { ethers } from "hardhat";

// #region user input values
const owner = "";
const feeTier = 10000; // uniswap v3 feeTier.
const token0 = ""; // token0 address.
const token1 = ""; // token1 address.
const amount0 = ethers.utils.parseUnits("1", 18);
const amount1 = ethers.utils.parseUnits("1", 18);
const assetIsTokenZero = true; // eslint-disable-line
const midAllocationBps = 100;
const assetAllocationBps = 300;
const baseAllocationBps = 200;
const rangeSize = 2;
const assetRebalanceThreshold = 1;
const baseRebalanceThreshold = 1;
const delegate = ethers.constants.AddressZero;
// #endregion user input values.

// #region default inputs
const version = 0.4;
const strat = "BOOTSTRAPPING";
const isBeacon = true;
const swapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const twapDuration = 2000;
const maxTwapDeviation = 100;
const maxSlippage = 100;
const baseMaxSwapAmount = 1;
const assetMaxSwapAmount = 1;
const minTick = -700000;
const maxTick = 700000;
// #endregion default inputs

function buf2hex(buffer: any) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

async function main() {
  const stratData = {
    assetIsTokenZero: assetIsTokenZero,
    minTick: minTick,
    maxTick: maxTick,
    feeTiers: [feeTier],
    strategy: ethers.utils.solidityKeccak256(["string"], [strat]),
    midAllocationBps: midAllocationBps,
    assetAllocationBps: assetAllocationBps,
    baseAllocationBps: baseAllocationBps,
    rangeSize: rangeSize,
    assetRebalanceThreshold: assetRebalanceThreshold,
    baseRebalanceThreshold: baseRebalanceThreshold,
    version: version,
    twapDuration: twapDuration,
    maxTwapDeviation: maxTwapDeviation,
    maxSlippage: maxSlippage,
    baseMaxSwapAmount: baseMaxSwapAmount,
    assetMaxSwapAmount: assetMaxSwapAmount,
  };

  const dataFormatted = ethers.utils.toUtf8Bytes(JSON.stringify(stratData));

  const hexData = "0x" + buf2hex(dataFormatted.buffer);

  const setupPayload = {
    // Initialized Payload properties
    feeTiers: [feeTier.toString()],
    token0: token0,
    token1: token1,
    owner: owner,
    amount0: amount0.toString(),
    amount1: amount1.toString(),
    datas: hexData,
    strat: strat,
    isBeacon: isBeacon,
    delegate: delegate,
    routers: [swapRouter],
  };

  const mintAmount = ethers.utils.parseUnits("1", 18);

  const setupValues = Object.values(setupPayload);
  const params = [];
  params.push(JSON.stringify(setupValues));
  params.push(mintAmount.toString());
  console.log("params: ", params);
  console.log("labeled setup params:", setupPayload);
  console.log("labeled strategy params:", stratData);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
