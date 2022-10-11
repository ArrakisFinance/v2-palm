import hre, { ethers } from "hardhat";
import { ERC20, PALMTerms } from "../typechain";

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
// #endregion default inputs

async function main() {
  if (!(hre.network.name == "matic" || hre.network.name == "mainnet")) return;
  const [signer] = await ethers.getSigners();

  const token0ERC20: ERC20 = (await ethers.getContractAt(
    "ERC20",
    token0,
    signer
  )) as ERC20;

  const token1ERC20: ERC20 = (await ethers.getContractAt(
    "ERC20",
    token1,
    signer
  )) as ERC20;

  const terms = (await ethers.getContract("PALMTerms", signer)) as PALMTerms;

  await token0ERC20.approve(terms.address, amount0);
  await token1ERC20.approve(terms.address, amount1);

  const stratData = {
    assetIsTokenZero: true, // since v0.3
    minTick: -700000, // since v0.1
    maxTick: 700000, // since v0.1
    feeTiers: [feeTier], // since v0.1
    strategy: ethers.utils.solidityKeccak256(["string"], [strat]), // since v0.1
    version: 0.3, // since v0.1
    midAllocationBps: 400, // since v0.2
    assetAllocationBps: 1000, // since v0.3
    baseAllocationBps: 500, // since v0.2
    rangeSize: 4, // since v0.2
    assetRebalanceThreshold: 2, // since v0.3
    baseRebalanceThreshold: 1, // since v0.2
    maxSlippage: 500, // since v0.3
    twapDuration: 1000, // since v0.3
    maxTwapDeviation: 100, // since v0.3
  };
  const dataFormatted = ethers.utils.toUtf8Bytes(JSON.stringify(stratData));

  //   const data = terms.interface.encodeFunctionData("openTerm", [
  //       {
  //         feeTiers: [feeTier.toString()],
  //         token0,
  //         token1,
  //         projectTknIsTknZero,
  //         owner: await signer.getAddress(),
  //         maxTwapDeviation,
  //         twapDuration,
  //         maxSlippage,
  //         amount0,
  //         amount1,
  //         datas: dataFormatted,
  //         strat,
  //         isBeacon: isBeacon,
  //       },
  //       ethers.utils.parseUnits("1", 18)
  //     ]
  //   );

  //   console.log(data);

  await terms.openTerm(
    {
      feeTiers: [feeTier.toString()],
      token0,
      token1,
      projectTknIsTknZero,
      owner: await signer.getAddress(),
      amount0,
      amount1,
      datas: dataFormatted,
      strat,
      isBeacon: isBeacon,
      delegate: ethers.constants.AddressZero,
      routers: [],
    },
    ethers.utils.parseUnits("1", 18),
    { gasLimit: 3000000 }
  );

  console.log("SUCCESS");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
