import hre, { ethers } from "hardhat";
import { ERC20, PALMTerms } from "../typechain";

// #region user input values

const feeTier = 10000; // uniswap v3 feeTier.
const token0 = "0x4e1581f01046eFDd7a1a2CDB0F82cdd7F71F2E59"; // token0 address.
const token1 = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"; // token1 address.
const projectTknIsTknZero = true; // eslint-disable-line
const amount0 = ethers.utils.parseUnits("1", 18);
const amount1 = ethers.utils.parseUnits("0.01", 18);
const allocationBps = 250; // percent holdings to use as liquidity (e.g. 2.5%)
const weightRightRange = 2;

// #endregion user input values.

// #region default inputs

const strat = "BOOTSTRAPPING";
const isBeacon = false;
// #endregion default inputs

async function main() {
  if (hre.network.name != "matic") return;
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
    projectTknIsTknZero: projectTknIsTknZero,
    allocationBps: allocationBps,
    weightLeftRange: 1,
    weightRightRange: weightRightRange,
    numberLeftRanges: 2,
    numberRightRanges: 2,
    sizeLeftRanges: 1,
    sizeRightRanges: 1,
    feeTiers: [feeTier],
    strategy: ethers.utils.solidityKeccak256(["string"], [strat]),
    version: 0.1,
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
    },
    ethers.utils.parseUnits("1", 18)
  );

  console.log("SUCCESS");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
