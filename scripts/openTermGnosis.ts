import hre, { ethers } from "hardhat";
import { Terms } from "../typechain";

// #region user input values

const owner = "0x88215a2794ddC031439C72922EC8983bDE831c78"; // your gnosis safe address
const feeTier = 10000; // uniswap v3 feeTier.
const token0 = "0x15b7c0c907e4C6b9AdaAaabC300C08991D6CEA05"; // token0 address.
const token1 = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"; // token1 address.
const projectTknIsTknZero = true; // eslint-disable-line
const amount0 = ethers.utils.parseUnits("1", 18);
const amount1 = ethers.utils.parseUnits("0.1", 18);
const allocationBps = 250; // percent holdings to use as liquidity (e.g. 10%)
// #endregion user input values.

// #region default inputs

const maxTwapDeviation = 100; // twap deviation max value.
const twapDuration = 2000; // number of seconds.
const maxSlippage = 100; // number of bps.
const strat = "BOOTSTRAPPING";
const isBeacon = false;
// #endregion default inputs

async function main() {
  if (hre.network.name != "matic") return;
  const [signer] = await ethers.getSigners();

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

  const terms = (await ethers.getContract("Terms", signer)) as Terms;

  // await token0ERC20.approve(terms.address, amount0);
  // await token1ERC20.approve(terms.address, amount1);

  const stratData = {
    projectTknIsTknZero: projectTknIsTknZero,
    allocationBps: allocationBps,
    weightLeftRange: 1,
    weightRightRange: 1.5,
    numberLeftRanges: 2,
    numberRightRanges: 2,
    sizeLeftRanges: 1,
    sizeRightRanges: 1,
    feeTiers: [feeTier],
    strategy: ethers.utils.solidityKeccak256(["string"], [strat]),
    version: 0.1,
  };
  const dataFormatted = ethers.utils.toUtf8Bytes(JSON.stringify(stratData));

  const data = terms.interface.encodeFunctionData("openTerm", [
    {
      feeTiers: [feeTier.toString()],
      token0,
      token1,
      projectTknIsTknZero,
      owner: owner,
      maxTwapDeviation,
      twapDuration,
      maxSlippage,
      amount0,
      amount1,
      datas: dataFormatted,
      strat,
      isBeacon: isBeacon,
    },
    ethers.utils.parseUnits("1", 18),
  ]);

  console.log(data);

  // await terms.openTerm(
  //   {
  //     feeTiers: [feeTier.toString()],
  //     token0,
  //     token1,
  //     projectTknIsTknZero,
  //     owner: owner,
  //     maxTwapDeviation,
  //     twapDuration,
  //     maxSlippage,
  //     amount0,
  //     amount1,
  //     datas: dataFormatted,
  //     strat,
  //     isBeacon: isBeacon,
  //   },
  //   ethers.utils.parseUnits("1", 18)
  // );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
