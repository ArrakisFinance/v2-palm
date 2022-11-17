import hre from "hardhat";
import { PALMTerms, IERC20 } from "../typechain";
import { getAddressBookByNetwork } from "../src/config/addressBooks";
import { sleep } from "../src/utils";
const { ethers } = hre;

const addresses = getAddressBookByNetwork(hre.network.name);

// #region critical input values VERIFY THESE!
const owner = "";
const feeTier = 500; // uniswap v3 feeTier.
const token0 = ""; // token0 address.
const token1 = ""; // token1 address.
const amount0 = 1; // ethers.utils.parseUnits("0.01", 18);
const amount1 = 1; // ethers.utils.parseUnits("0.01", 6);
const assetIsTokenZero = true; // eslint-disable-line
const midAllocationBps = 500;
const assetAllocationBps = 1500;
const baseAllocationBps = 1000;
const rangeSize = 10;
const assetRebalanceThreshold = 1;
const baseRebalanceThreshold = 1;
const baseMinVwapAmount = 300000;
const assetMinVwapAmount = 300000;
const maxGasPrice = 0; // ethers.utils.parseUnits("500", "gwei")
const baseMinRebalanceAmount = 1; // ethers.utils.parseUnits("0.1", 18);
const assetMinRebalanceAmount = 1; // ethers.utils.parseUnits("0.1", 6);
// #endregion critical input values VERIFY THESE!

// #region default inputs
const version = 0.7;
const strat = "BOOTSTRAPPING";
const isBeacon = true;
const swapRouter = addresses.UniswapV3SwapRouter;
const delegate = addresses.DevMultisig;
const twapDuration = 600;
const maxTwapDeviation = 200;
const maxSlippage = 200;
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
  if (
    hre.network.name === "mainnet" ||
    hre.network.name === "matic" ||
    hre.network.name === "optimism"
  ) {
    console.log(`OPEN TERM to ${hre.network.name}. Hit ctrl + c to abort`);
    await sleep(10000);
  }
  const [user] = await ethers.getSigners();
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
    baseMinVwapAmount: baseMinVwapAmount,
    assetMinVwapAmount: assetMinVwapAmount,
    baseMinRebalanceAmount: baseMinRebalanceAmount,
    assetMinRebalanceAmount: assetMinRebalanceAmount,
    maxGasPrice: maxGasPrice,
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

  const mintAmount = ethers.utils.parseEther("1");
  const t0 = (await ethers.getContractAt("IERC20", token0, user)) as IERC20;
  const t1 = (await ethers.getContractAt("IERC20", token1, user)) as IERC20;
  const terms = (await ethers.getContractAt(
    "PALMTerms",
    addresses.PALMTerms,
    user
  )) as PALMTerms;
  await t0.approve(addresses.PALMTerms, amount0, {
    gasPrice: ethers.utils.parseUnits("80", "gwei"),
  });
  const tx1 = await t1.approve(addresses.PALMTerms, amount1, {
    gasPrice: ethers.utils.parseUnits("80", "gwei"),
  });
  await tx1.wait();
  const tx2 = await terms.openTerm(setupPayload, mintAmount, {
    value: ethers.utils.parseEther("2"),
    gasPrice: ethers.utils.parseUnits("80", "gwei"),
  });
  console.log("OPENING TERMS:");
  console.log("TX HASH:", tx2.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
