import { expect } from "chai";
import hre = require("hardhat");
import {
  Addresses,
  getAddressBookByNetwork,
} from "../../src/config/addressBooks";
import { Signer } from "ethers";
import { Contract } from "ethers";
import {
  BaseToken,
  GasStation,
  IArrakisV2,
  IArrakisV2Resolver,
  IERC20,
  IUniswapV3Factory,
  IUniswapV3Pool,
  ProjectToken,
  Terms,
} from "../../typechain";
import { BigNumber } from "ethers";

const { ethers, deployments } = hre;

describe("Terms integration test!!!", async function () {
  this.timeout(0);

  let user: Signer;
  let arrakisDaoMultisig: Signer;
  let gelatoCaller: Signer;
  let userAddr: string;
  let addresses: Addresses;
  let terms: Terms;
  let gasStation: GasStation;
  let baseToken: BaseToken;
  let projectToken: ProjectToken;
  let v3Factory: IUniswapV3Factory;
  let arrakisV2Resolver: IArrakisV2Resolver;
  // eslint-disable-next-line
  let projectTknIsTknZero: boolean;
  let pool: IUniswapV3Pool;
  let uniswapV3Amount: Contract;
  let vault: string;
  let vaultV2: IArrakisV2;

  before("Setting up for V2 functions integration test", async function () {
    if (hre.network.name !== "hardhat") {
      console.error("Test Suite is meant to be run on hardhat only");
      process.exit(1);
    }

    [user, arrakisDaoMultisig, gelatoCaller] = await ethers.getSigners();

    userAddr = await user.getAddress();

    addresses = getAddressBookByNetwork(hre.network.name);
    await deployments.fixture();

    terms = (await ethers.getContract("Terms", user)) as Terms;
    gasStation = (await ethers.getContract("GasStation", user)) as GasStation;
    baseToken = (await ethers.getContract("BaseToken")) as BaseToken;
    projectToken = (await ethers.getContract("ProjectToken")) as ProjectToken;
    v3Factory = (await ethers.getContractAt(
      "IUniswapV3Factory",
      addresses.UniswapV3Factory
    )) as IUniswapV3Factory;

    arrakisV2Resolver = (await ethers.getContractAt(
      "IArrakisV2Resolver",
      addresses.ArrakisV2Resolver
    )) as IArrakisV2Resolver;

    // #region create uniswap v3 pool.
    projectTknIsTknZero = BigNumber.from(projectToken.address).lt(
      baseToken.address
    );

    const result = await (
      await v3Factory.createPool(projectToken.address, baseToken.address, 500)
    ).wait();

    pool = await ethers.getContractAt(
      "IUniswapV3Pool",
      result.events![0].args!.pool,
      user
    );

    uniswapV3Amount = await ethers.getContractAt(
      [
        "function computeMintAmounts(uint256 current0_,uint256 current1_,uint256 totalSupply_,uint256 amount0Max_,uint256 amount1Max_) pure returns (uint256 amount0,uint256 amount1,uint256 mintAmount)",
      ],
      addresses.UniswapV3Amount,
      user
    );

    // #endregion create uniswap v3 pool.

    // #region whitelist strat.

    await gasStation
      .connect(arrakisDaoMultisig)
      .whitelistStrat("Bootstrapping");

    await terms.connect(arrakisDaoMultisig).setManager(gasStation.address);

    // TODO check that keccak256(encode packed ) has been added.

    // #endregion whitelist strat.
  });

  it("#0: open Terms", async () => {
    // #region get mintAmount.
    // base token allocation 1000.
    // project token allocation 100000

    const baseTokenAllocation = ethers.utils.parseUnits("1000", 18);
    const projectTokenAllocation = ethers.utils.parseUnits("100000", 18);

    const init0 = ethers.utils.parseUnits("1", 18);
    const init1 = projectTknIsTknZero
      ? baseTokenAllocation
          .mul(ethers.utils.parseUnits("1", 18))
          .div(projectTokenAllocation)
      : projectTokenAllocation
          .mul(ethers.utils.parseUnits("1", 18))
          .div(baseTokenAllocation);

    const result = await uniswapV3Amount.computeMintAmounts(
      init0,
      init1,
      ethers.utils.parseUnits("1", 18),
      projectTknIsTknZero ? projectTokenAllocation : baseTokenAllocation,
      projectTknIsTknZero ? baseTokenAllocation : projectTokenAllocation
    );
    const setup = {
      feeTiers: [500],
      token0: projectTknIsTknZero ? projectToken.address : baseToken.address,
      token1: projectTknIsTknZero ? baseToken.address : projectToken.address,
      projectTknIsTknZero: projectTknIsTknZero,
      owner: userAddr,
      maxTwapDeviation: 100,
      twapDuration: 1,
      maxSlippage: 100,
      amount0: result.amount0,
      amount1: result.amount1,
      datas: ethers.constants.HashZero,
      strat: "Bootstrapping",
    };

    await baseToken.approve(terms.address, baseTokenAllocation);
    await projectToken.approve(terms.address, projectTokenAllocation);

    const receipt = await (
      await terms.openTerm(setup, result.mintAmount)
    ).wait();

    vault = receipt.events![receipt.events!.length - 1].args!.vault;

    const vaultERC20 = (await ethers.getContractAt(
      "IERC20",
      vault,
      user
    )) as IERC20;

    expect(await vaultERC20.balanceOf(terms.address)).to.be.eq(
      result.mintAmount
    );

    expect(await baseToken.balanceOf(vault)).to.be.eq(baseTokenAllocation);

    const feeTaken = projectTokenAllocation
      .mul(await terms.emolument())
      .div(10000)
      .toString();

    expect(await projectToken.balanceOf(vault)).to.be.eq(
      projectTokenAllocation.sub(feeTaken)
    );

    expect(await projectToken.balanceOf(await terms.termTreasury())).to.be.eq(
      feeTaken
    );

    expect((await gasStation.getVaultInfo(vault)).strat).to.be.eq(
      ethers.utils.solidityKeccak256(["string"], ["Bootstrapping"])
    );
    expect((await gasStation.getVaultInfo(vault)).endOfMM).to.be.gt(0);

    // #endregion get mintAmount.
  });

  it("#1: Increase Liquidity", async () => {
    const baseTokenAllocation = ethers.utils.parseUnits("100", 18);
    const projectTokenAllocation = ethers.utils.parseUnits("10000", 18);

    const beforeBTB = await baseToken.balanceOf(vault);
    const beforePTB = await projectToken.balanceOf(vault);

    const beforeTreasoryB = await projectToken.balanceOf(
      await terms.termTreasury()
    );

    await baseToken.approve(terms.address, baseTokenAllocation);
    await projectToken.approve(terms.address, projectTokenAllocation);

    await terms.increaseLiquidity(
      {
        vault: vault,
        projectTknIsTknZero: projectTknIsTknZero,
        amount0: projectTknIsTknZero
          ? projectTokenAllocation
          : baseTokenAllocation,
        amount1: projectTknIsTknZero
          ? baseTokenAllocation
          : projectTokenAllocation,
      },
      ethers.utils.parseUnits("1000", 18)
    );

    const afterBTB = await baseToken.balanceOf(vault);
    const afterPTB = await projectToken.balanceOf(vault);

    expect(beforeBTB.add(baseTokenAllocation)).to.be.eq(afterBTB);
    expect(
      beforePTB.add(projectTokenAllocation.mul(10000 - 100).div(10000))
    ).to.be.eq(afterPTB);

    expect(await projectToken.balanceOf(await terms.termTreasury())).to.be.eq(
      beforeTreasoryB.add(projectTokenAllocation.mul(100).div(10000))
    );
  });

  it("#2: Rebalance with simple strategy", async () => {
    // #region add caller as operators.

    const gelatoCallerAddr = await gelatoCaller.getAddress();

    await gasStation
      .connect(arrakisDaoMultisig)
      .addOperators([gelatoCallerAddr]);

    expect(await gasStation.operators(0)).to.be.eq(gelatoCallerAddr);

    // #endregion add caller as operators.

    // #region fund balance of vault.

    const balance = ethers.utils.parseUnits("100", 18);

    await gasStation.fundVaultBalance(vault, {
      value: balance,
    });

    expect((await gasStation.vaults(vault)).balance).to.be.eq(balance);

    // #endregion fund balance of vault.

    // #region do a classical rebalance.

    await pool.initialize(ethers.utils.parseUnits("1", 18));
    await pool.increaseObservationCardinalityNext(1000);

    const slot0 = await pool.slot0();
    const tickSpacing = await pool.tickSpacing();

    const lowerTick = slot0.tick - (slot0.tick % tickSpacing) - tickSpacing;
    const upperTick = slot0.tick - (slot0.tick % tickSpacing) + 2 * tickSpacing;

    const rebalanceParams = await arrakisV2Resolver.standardRebalance(
      [{ range: { lowerTick, upperTick, feeTier: 500 }, weight: 10000 }],
      vault
    );

    await gasStation
      .connect(gelatoCaller)
      .rebalance(
        vault,
        [{ lowerTick, upperTick, feeTier: 500 }],
        rebalanceParams,
        [],
        ethers.utils.parseUnits("1", 18)
      );

    // #endregion do a classical rebalance.
  });

  it("#3: Decrease Liquidity", async () => {
    const baseTokenAllocation = ethers.utils.parseUnits("100", 18);
    const projectTokenAllocation = ethers.utils.parseUnits("10000", 18);

    const beforeBTB = await baseToken.balanceOf(userAddr);
    const beforePTB = await projectToken.balanceOf(userAddr);

    await terms.decreaseLiquidity(
      {
        vault: vault,
        projectTknIsTknZero: projectTknIsTknZero,
        amount0: projectTknIsTknZero
          ? projectTokenAllocation
          : baseTokenAllocation,
        amount1: projectTknIsTknZero
          ? baseTokenAllocation
          : projectTokenAllocation,
        to: userAddr,
      },
      ethers.utils.parseUnits("1000", 18)
    );

    const afterBTB = await baseToken.balanceOf(userAddr);
    const afterPTB = await projectToken.balanceOf(userAddr);

    // lt because left over is transfered to owner.
    expect(beforeBTB.sub(baseTokenAllocation)).to.be.lt(afterBTB);
    expect(beforePTB.sub(projectTokenAllocation)).to.be.lt(afterPTB);
  });

  it("#4: Close Term", async () => {
    await terms.closeTerm(vault, userAddr, userAddr, userAddr);

    vaultV2 = (await ethers.getContractAt(
      "IArrakisV2",
      vault,
      user
    )) as IArrakisV2;

    expect(await vaultV2.owner()).to.be.eq(userAddr);
    expect(await vaultV2.manager()).to.be.eq(userAddr);

    expect((await gasStation.getVaultInfo(vault)).endOfMM).to.be.eq(0);

    expect(await terms.vaults(userAddr, 0)).to.be.eq(ethers.constants.Zero);
  });
});
