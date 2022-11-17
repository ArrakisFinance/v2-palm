import hre from "hardhat";
// import { PALMTerms } from "../typechain";
// import { getAddressBookByNetwork } from "../src/config/addressBooks";
// import { sleep } from "../src/utils";
const { ethers } = hre;

// const addresses = getAddressBookByNetwork(hre.network.name);

// #region input values

const feeTier = 10000; // uniswap v3 feeTier.
const assetIsTokenZero = true; // eslint-disable-line
const midAllocationBps = 100;
const baseAllocationBps = 200;
const assetAllocationBps = 300;
const rangeSize = 1;
const assetRebalanceThreshold = 1;
const baseRebalanceThreshold = 1;
const baseMinRebalanceAmount = "0";
const assetMinRebalanceAmount = "2";
const baseMaxSwapAmount = "1";
const assetMaxSwapAmount = "1";
const baseMinVwapAmount = "1";
const assetMinVwapAmount = "1";
const maxGasPrice = 5000000000000; // 500 gwei

const version = 0.7;
const strat = "BOOTSTRAPPING";
const twapDuration = 1000;
const maxTwapDeviation = 100;
const maxSlippage = 100;
const minTick = -700000;
const maxTick = 700000;

// const vault = "";
// const txGasPrice = ethers.utils.parseUnits("200", "gwei");

// #endregion input values

function buf2hex(buffer: any) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

async function main() {
  //   if (
  //     hre.network.name === "mainnet" ||
  //     hre.network.name === "matic" ||
  //     hre.network.name === "optimism"
  //   ) {
  //     console.log(`set vault to ${hre.network.name}. Hit ctrl + c to abort`);
  //     await sleep(10000);
  //   }
  //   const [user] = await ethers.getSigners();
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
  console.log("STRAT DATA:");
  console.log(stratData);
  console.log("encoded:", hexData);
  //   const terms = (await ethers.getContractAt(
  //     "PALMTerms",
  //     addresses.PALMTerms,
  //     user
  //   )) as PALMTerms;
  //   const tx = await terms.setVaultData(vault, hexData, {
  //     gasPrice: txGasPrice,
  //     gasLimit: 200000
  //   });
  //   console.log("TX HASH:", tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
