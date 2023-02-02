import hre, { getNamedAccounts } from "hardhat";
import { PALMTerms, IERC20 } from "../typechain";
import { getAddressBookByNetwork } from "../src/config/addressBooks";
import { sleep } from "../src/utils";
const { ethers } = hre;

const addresses = getAddressBookByNetwork(hre.network.name);

// #region critical input values VERIFY THESE!

const owner = "";
const feeTier = 10000; // uniswap v3 feeTier.
const token0 = ""; // token0 address.
const token1 = ""; // token1 address.
const isAssetTokenZero = true;
const midAllocationBps = 200; // 2% in BPS
const baseAllocationBps = 100;
const assetAllocationBps = 300;
const rangeSize = 2; // 2 * tickSpacing ticks
const assetRebalanceThreshold = 1.5; // 1.5 * tickSpacing ticks (from outer edge)
const baseRebalanceThreshold = 1;
const maxRebalanceGasPrice = ethers.utils.parseUnits("50", "gwei").toString(); // 50 gwei
const amount0 = "1"; // tiny amounts on first deposit
const amount1 = "1";
const baseMinRebalanceAmount = "0";
const assetMinRebalanceAmount = "2"; // wont rebalance on openTerm since assetMinRebalanceAmount > amount0
const baseMaxSwapAmount = "1";
const assetMaxSwapAmount = "1";
const baseMinVwapAmount = "1";
const assetMinVwapAmount = "1";
const twapDuration = 2000; // 33 min (in seconds)
const maxTwapDeviation = 300; // 300 ticks
const minTick = -700000;
const maxTick = 700000;
const coolDownPeriod = 1000 * 60 * 60; // 60 min (in miliseconds)
const isBeacon = true;
const strat = "BOOTSTRAPPING";
const version = 1.0;
const hasApiData = false;
const apiData = {
  maxFairPriceDeviation: 300,
  coingecko: null, // {base: "<id>", asset: "<id>"}
  coinmarketcap: null, // {base: "<id>", asset: "<id>"}
};

const gasTankAmount = 0; // ethers.utils.parseEther("1");
const hasCustomFeeData = false;
const customFeeData = {
  maxFeePerGas: ethers.utils.parseUnits("30", "gwei"),
  maxPriorityFeePerGas: ethers.utils.parseUnits("1.5", "gwei"),
};

// #endregion critical input values VERIFY THESE!

function buf2hex(buffer: any) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

async function main() {
  const { arrakisDaoOwner: delegate } = await getNamedAccounts();

  const stratData = {
    assetIsTokenZero: isAssetTokenZero,
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
    baseMaxSwapAmount: baseMaxSwapAmount,
    assetMaxSwapAmount: assetMaxSwapAmount,
    baseMinVwapAmount: baseMinVwapAmount,
    assetMinVwapAmount: assetMinVwapAmount,
    baseMinRebalanceAmount: baseMinRebalanceAmount,
    assetMinRebalanceAmount: assetMinRebalanceAmount,
    maxGasPrice: maxRebalanceGasPrice,
    coolDownPeriod: coolDownPeriod,
    apiData: hasApiData ? apiData : null,
  };
  const [user] = await ethers.getSigners();
  const feeData = hasCustomFeeData
    ? customFeeData
    : await user?.provider?.getFeeData();
  if (
    feeData == undefined ||
    feeData.maxFeePerGas == undefined ||
    feeData.maxPriorityFeePerGas == undefined
  ) {
    console.log("ERROR: cannot fetch fee data");
    return;
  }
  if (
    hre.network.name === "mainnet" ||
    hre.network.name === "polygon" ||
    hre.network.name === "optimism" ||
    hre.network.name === "arbitrum"
  ) {
    console.log(`OPEN TERM to ${hre.network.name}. Hit ctrl + c to abort\n\n`);
    console.log("VAULT DATA:");
    console.log(stratData);
    console.log("owner:", owner);
    console.log("token0:", token0);
    console.log("token1:", token1);
    console.log(
      `\nGas Info:\nMaxFeePerGas: ${Number(
        ethers.utils.formatUnits(feeData.maxFeePerGas, "gwei")
      ).toFixed(1)} gwei\nMaxPriorityFeePerGas: ${Number(
        ethers.utils.formatUnits(feeData.maxPriorityFeePerGas, "gwei")
      ).toFixed(1)} gwei\n`
    );
    await sleep(20000);
  }

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
    routers: [],
  };

  const t0 = (await ethers.getContractAt("IERC20", token0, user)) as IERC20;
  const t1 = (await ethers.getContractAt("IERC20", token1, user)) as IERC20;
  const terms = (await ethers.getContractAt(
    "PALMTerms",
    addresses.PALMTerms,
    user
  )) as PALMTerms;
  await t0.approve(addresses.PALMTerms, amount0, {
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
  });
  const tx1 = await t1.approve(addresses.PALMTerms, amount1, {
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
  });
  await tx1.wait();
  const tx2 = await terms.openTerm(setupPayload, {
    value: gasTankAmount,
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    gasLimit: 2000000,
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
