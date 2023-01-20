import hre from "hardhat";
// import { PALMTerms } from "../typechain";
// import { getAddressBookByNetwork } from "../src/config/addressBooks";
// import { sleep } from "../src/utils";
// const addresses = getAddressBookByNetwork(hre.network.name);
const { ethers } = hre;

// #region input values

const feeTier = 10000; // uniswap v3 feeTier.
const isAssetTokenZero = true;
const midAllocationBps = 100;
const baseAllocationBps = 200;
const assetAllocationBps = 300;
const rangeSize = 2;
const assetRebalanceThreshold = 1;
const baseRebalanceThreshold = 1;
const maxRebalanceGasPrice = 5000000000000; // 500 gwei
const baseMinRebalanceAmount = "0";
const assetMinRebalanceAmount = "2";
const baseMaxSwapAmount = "1";
const assetMaxSwapAmount = "1";
const baseMinVwapAmount = "1";
const assetMinVwapAmount = "1";
const twapDuration = 1000;
const maxTwapDeviation = 100;
const maxSlippage = 100;
const minTick = -700000;
const maxTick = 700000;
const maxFairPriceDeviation = 350;
const cmcBase = "";
const cmcAsset = "";
const strat = "BOOTSTRAPPING";
const version = 0.8;

// #endregion input values

// #region transaction values (uncomment if calling tx)

// const vault = "";
// const txGasPrice = ethers.utils.parseUnits("20", "gwei");

// #endregion transaction values (uncomment if calling tx)

function buf2hex(buffer: any) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

async function main() {
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
    maxSlippage: maxSlippage,
    baseMaxSwapAmount: baseMaxSwapAmount,
    assetMaxSwapAmount: assetMaxSwapAmount,
    baseMinVwapAmount: baseMinVwapAmount,
    assetMinVwapAmount: assetMinVwapAmount,
    baseMinRebalanceAmount: baseMinRebalanceAmount,
    assetMinRebalanceAmount: assetMinRebalanceAmount,
    maxGasPrice: maxRebalanceGasPrice,
    apiData: {
      maxFairPriceDeviation: maxFairPriceDeviation,
      coinmarketcap: {
        base: cmcBase,
        asset: cmcAsset,
      },
    },
  };

  const dataFormatted = ethers.utils.toUtf8Bytes(JSON.stringify(stratData));

  const hexData = "0x" + buf2hex(dataFormatted.buffer);
  console.log("VAULT DATA:");
  console.log(stratData);
  console.log("\n\nencoded vaultData:", hexData);

  // if (
  //   hre.network.name === "mainnet" ||
  //   hre.network.name === "polygon" ||
  //   hre.network.name === "optimism"
  // ) {
  //   console.log(`\n\nset vault data on ${hre.network.name}. Hit ctrl + c to abort`);
  //   await sleep(10000);
  // }
  // const [user] = await ethers.getSigners();
  // const terms = (await ethers.getContractAt(
  //   "PALMTerms",
  //   addresses.PALMTerms,
  //   user
  // )) as PALMTerms;
  // const tx = await terms.setVaultData(vault, hexData, {
  //   gasPrice: txGasPrice,
  //   gasLimit: 200000
  // });
  // console.log("TX HASH:", tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
