import hre, { ethers } from "hardhat";
import { ERC20, Terms } from "../typechain";

// #region input values.

const feeTier = 500; // uniswap v3 feeTier.
const token0 = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"; // token0 address. token0 < token1 USDC on polygon
const token1 = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"; // token1 address. token0 < token1 WETH on polygon
const projectTknIsTknZero = true; // eslint-disable-line
const maxTwapDeviation = 100; // twap deviation max value.
const twapDuration = 2000; // number of seconds.
const maxSlippage = 100; // number of seconds.
const strat = "BOOTSTRAPPING";
const amount0 = ethers.utils.parseUnits("1", 17);
const amount1 = ethers.utils.parseUnits("1", 15);
// #endregion input values.

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

  const terms = (await ethers.getContract("Terms", signer)) as Terms;

  await token0ERC20.approve(terms.address, amount0);
  await token1ERC20.approve(terms.address, amount1);

  const stratData = {
    projectTknIsTknZero: true,
    allocationBps: 200,
    weightLeftRange: 1,
    weightRightRange: 2,
    numberLeftRanges: 2,
    numberRightRanges: 2,
    sizeLeftRanges: 1,
    sizeRightRanges: 1,
    feeTiers: [3000],
    strategy:
      "0xdd2e3f45234182539bc4dd532d9fae3a4d63dbc7adf96452f541fce8539504f1",
    version: 0.1,
  };
  const dataFormatted = ethers.utils.toUtf8Bytes(JSON.stringify(stratData));

  await terms.openTerm(
    {
      feeTiers: [feeTier.toString()],
      token0,
      token1,
      projectTknIsTknZero,
      owner: await signer.getAddress(),
      maxTwapDeviation,
      twapDuration,
      maxSlippage,
      amount0,
      amount1,
      datas: dataFormatted,
      strat,
      isBeacon: false,
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
