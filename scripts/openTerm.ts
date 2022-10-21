import hre, { ethers } from "hardhat";
import { PALMTerms } from "../typechain";

// #region user input values

const feeTier = 3000; // uniswap v3 feeTier.
const token0 = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // token0 address.
const token1 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // token1 address.
const projectTknIsTknZero = true; // eslint-disable-line
const amount0 = ethers.utils.parseUnits("20", 6);
const amount1 = ethers.utils.parseUnits("0.01", 18);

// #endregion user input values.

// #region default inputs

const strat = "BOOTSTRAPPING";
const isBeacon = true;
const swapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

// #endregion default inputs

function buf2hex(buffer: any) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

async function main() {
  if (!(hre.network.name == "matic" || hre.network.name == "mainnet")) return;
  const [signer] = await ethers.getSigners();

  const terms: PALMTerms = (await ethers.getContract(
    "PALMTerms",
    signer
  )) as PALMTerms;

  // const token0ERC20: ERC20 = (await ethers.getContractAt(
  //   "ERC20",
  //   token0,
  //   signer
  // )) as ERC20;

  // const token1ERC20: ERC20 = (await ethers.getContractAt(
  //   "ERC20",
  //   token1,
  //   signer
  // )) as ERC20;

  // await token0ERC20.approve(terms.address, amount0);
  // await token1ERC20.approve(terms.address, amount1);

  const stratData = {
    assetIsTokenZero: true,
    minTick: -700000,
    maxTick: 700000,
    feeTiers: [3000],
    strategy: ethers.utils.solidityKeccak256(["string"], ["BOOTSTRAPPING"]),
    midAllocationBps: 100,
    assetAllocationBps: 200,
    baseAllocationBps: 100,
    rangeSize: 2,
    assetRebalanceThreshold: 1,
    baseRebalanceThreshold: 1,
    version: 0.4,
    twapDuration: 2000,
    maxTwapDeviation: 100,
    maxSlippage: 100,
    baseMaxSwapAmount: 1,
    assetMaxSwapAmount: 1,
  };

  const dataFormatted = ethers.utils.toUtf8Bytes(JSON.stringify(stratData));

  const hexData = "0x" + buf2hex(dataFormatted.buffer);

  const setupPayload = {
    // Initialized Payload properties
    feeTiers: [feeTier.toString()],
    token0: token0,
    token1: token1,
    projectTknIsTknZero: projectTknIsTknZero,
    owner: await signer.getAddress(),
    amount0: amount0.toString(),
    amount1: amount1.toString(),
    datas: hexData,
    strat: strat,
    isBeacon: isBeacon,
    delegate: ethers.constants.AddressZero,
    routers: [swapRouter],
  };

  const mintAmount = ethers.utils.parseUnits("1", 18);

  const setupValues = Object.values(setupPayload);
  const params = [];
  params.push(JSON.stringify(setupValues));
  params.push(mintAmount.toString());
  console.log("params: ", params);

  const data = terms.interface.encodeFunctionData("openTerm", [
    setupPayload,
    mintAmount,
  ]);
  console.log("payload: ", data);

  // await terms.openTerm(setupPayload, mintAmount, {
  //   gasLimit: 3000000,
  // });

  console.log("SUCCESS");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
