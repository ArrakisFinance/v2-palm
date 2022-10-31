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
  PALMManager,
  IArrakisV2,
  IArrakisV2Resolver,
  IERC20,
  IUniswapV3Factory,
  IUniswapV3Pool,
  ProjectToken,
  PALMTerms,
} from "../../typechain";
import { BigNumber } from "ethers";

const { ethers, deployments } = hre;

describe("PALMTerms integration test!!!", async function () {
  this.timeout(0);

  let user: Signer;
  let user2: Signer;
  let arrakisDaoOwner: Signer;
  let gelatoCaller: Signer;
  let userAddr: string;
  let addresses: Addresses;
  let terms: PALMTerms;
  let manager: PALMManager;
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
  let lowerTick: number;
  let upperTick: number;

  before("Setting up for V2 functions integration test", async function () {
    if (hre.network.name !== "hardhat") {
      console.error("Test Suite is meant to be run on hardhat only");
      process.exit(1);
    }

    [user, , arrakisDaoOwner, gelatoCaller, user2] = await ethers.getSigners();

    userAddr = await user.getAddress();

    addresses = getAddressBookByNetwork(hre.network.name);
    await deployments.fixture();

    terms = (await ethers.getContract("PALMTerms", user)) as PALMTerms;
    manager = (await ethers.getContract("PALMManager", user)) as PALMManager;
    baseToken = (await ethers.getContract("BaseToken")) as BaseToken;
    projectToken = (await ethers.getContract("ProjectToken")) as ProjectToken;
    v3Factory = (await ethers.getContractAt(
      "IUniswapV3Factory",
      addresses.UniswapV3Factory
    )) as IUniswapV3Factory;

    // const addrPALMManager =
    //   "0x" +
    //   (
    //     await user.provider!.getStorageAt(
    //       (
    //         await ethers.getContract("PALMManager", user)
    //       ).address,
    //       "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
    //     )
    //   )
    //     .toString()
    //     .substring(26);

    // manager = (await ethers.getContractAt(
    //   "PALMManager",
    //   addrPALMManager,
    //   user
    // )) as PALMManager;

    // manager.initialize(await arrakisDaoOwner.getAddress());

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

    await manager.connect(arrakisDaoOwner).whitelistStrat("Bootstrapping");
    await manager
      .connect(arrakisDaoOwner)
      .whitelistStrat("After Bootstrapping");

    await terms.connect(arrakisDaoOwner).setManager(manager.address);

    // TODO check that keccak256(encode packed ) has been added.

    // #endregion whitelist strat.
  });

  it("#0: open PALMTerms", async () => {
    // #region get mintAmount.
    // base token allocation 1000.
    // project token allocation 100000.

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
      amount0: result.amount0,
      amount1: result.amount1,
      datas: ethers.constants.HashZero,
      strat: "Bootstrapping",
      isBeacon: true,
      delegate: ethers.constants.AddressZero,
      routers: [],
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

    expect(await projectToken.balanceOf(vault)).to.be.eq(
      projectTokenAllocation
    );

    expect(await projectToken.balanceOf(await terms.termTreasury())).to.be.eq(
      ethers.constants.Zero
    );

    expect((await manager.getVaultInfo(vault)).strat).to.be.eq(
      ethers.utils.solidityKeccak256(["string"], ["Bootstrapping"])
    );
    expect((await manager.getVaultInfo(vault)).termEnd).to.be.gt(0);

    // #endregion get mintAmount.
  });

  it("#1: Increase Liquidity", async () => {
    const baseTokenAllocation = ethers.utils.parseUnits("100", 18);
    const projectTokenAllocation = ethers.utils.parseUnits("10000", 18);

    const beforeBTB = await baseToken.balanceOf(vault);
    const beforePTB = await projectToken.balanceOf(vault);

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
    expect(beforePTB.add(projectTokenAllocation)).to.be.eq(afterPTB);

    expect(await projectToken.balanceOf(await terms.termTreasury())).to.be.eq(
      ethers.constants.Zero
    );
  });

  it("#2: Rebalance with simple strategy", async () => {
    // #region add caller as operators.

    const gelatoCallerAddr = await gelatoCaller.getAddress();

    await manager.connect(arrakisDaoOwner).addOperators([gelatoCallerAddr]);

    expect(await manager.operators(0)).to.be.eq(gelatoCallerAddr);

    // #endregion add caller as operators.

    // #region fund balance of vault.

    const balance = ethers.utils.parseUnits("100", 18);

    await manager.fundVaultBalance(vault, {
      value: balance,
    });

    expect((await manager.vaults(vault)).balance).to.be.eq(balance);

    // #endregion fund balance of vault.

    // #region do a classical rebalance.

    await pool.initialize(ethers.utils.parseUnits("1", 18));
    await pool.increaseObservationCardinalityNext(1000);

    const slot0 = await pool.slot0();
    const tickSpacing = await pool.tickSpacing();

    lowerTick = slot0.tick - (slot0.tick % tickSpacing) - tickSpacing;
    upperTick = slot0.tick - (slot0.tick % tickSpacing) + 2 * tickSpacing;

    const rebalanceParams = await arrakisV2Resolver.standardRebalance(
      [{ range: { lowerTick, upperTick, feeTier: 500 }, weight: 10000 }],
      vault
    );

    await manager
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
    const beforeBTB = await baseToken.balanceOf(userAddr);
    const beforePTB = await projectToken.balanceOf(userAddr);

    // #region get burn payload

    const vaultERC20 = (await ethers.getContractAt(
      "IERC20",
      vault,
      user
    )) as IERC20;
    const balance = await vaultERC20.balanceOf(terms.address);
    const burnPayloads = await arrakisV2Resolver.standardBurnParams(
      balance.mul(10).div(100),
      vault
    );

    // #endregion get burn payload

    const receipt = await (
      await terms.decreaseLiquidity({
        vault,
        burns: burnPayloads,
        burnAmount: balance.mul(10).div(100),
        amount0Min: ethers.constants.Zero,
        amount1Min: ethers.constants.Zero,
        receiver: userAddr,
      })
    ).wait();

    const decreaseLiquidityEvent = receipt.events?.find(
      (e) => e.event == "DecreaseLiquidity"
    )?.args;

    expect(await baseToken.balanceOf(await terms.termTreasury())).to.be.eq(
      projectTknIsTknZero
        ? decreaseLiquidityEvent?.emolument1
        : decreaseLiquidityEvent?.emolument0
    );

    expect(await projectToken.balanceOf(await terms.termTreasury())).to.be.eq(
      projectTknIsTknZero
        ? decreaseLiquidityEvent?.emolument0
        : decreaseLiquidityEvent?.emolument1
    );

    const afterBTB = await baseToken.balanceOf(userAddr);
    const afterPTB = await projectToken.balanceOf(userAddr);

    // lt because left over is transfered to owner.
    expect(
      beforeBTB.sub(
        projectTknIsTknZero
          ? decreaseLiquidityEvent?.amount1
          : decreaseLiquidityEvent?.amount0
      )
    ).to.be.lt(afterBTB);
    expect(
      beforePTB.sub(
        projectTknIsTknZero
          ? decreaseLiquidityEvent?.amount0
          : decreaseLiquidityEvent?.amount1
      )
    ).to.be.lt(afterPTB);
  });

  it("#4: Close Term", async () => {
    const beforeTreasoryP = await projectToken.balanceOf(
      await terms.termTreasury()
    );

    const beforeTreasoryB = await baseToken.balanceOf(
      await terms.termTreasury()
    );

    const beforeUserP = await projectToken.balanceOf(userAddr);

    const beforeUserB = await baseToken.balanceOf(userAddr);

    const result = await (
      await terms.closeTerm(vault, userAddr, userAddr, userAddr)
    ).wait();

    const closePALMTermsEvent = result.events?.find(
      (e) => e.event == "CloseTerm"
    )?.args;

    const afterTreasoryP = await projectToken.balanceOf(
      await terms.termTreasury()
    );

    const afterTreasoryB = await baseToken.balanceOf(
      await terms.termTreasury()
    );

    const afterUserP = await projectToken.balanceOf(userAddr);

    const afterUserB = await baseToken.balanceOf(userAddr);
    const B = projectTknIsTknZero
      ? closePALMTermsEvent?.amount1.sub(closePALMTermsEvent?.emolument1)
      : closePALMTermsEvent?.amount0.sub(closePALMTermsEvent?.emolument0);
    const P = projectTknIsTknZero
      ? closePALMTermsEvent?.amount0.sub(closePALMTermsEvent?.emolument0)
      : closePALMTermsEvent?.amount1.sub(closePALMTermsEvent?.emolument1);
    expect(afterUserB.sub(beforeUserB)).to.be.eq(B);
    expect(afterUserP.sub(beforeUserP)).to.be.eq(P);

    expect(
      beforeTreasoryB.add(
        projectTknIsTknZero
          ? closePALMTermsEvent?.emolument1
          : closePALMTermsEvent?.emolument0
      )
    ).to.be.equal(afterTreasoryB);
    expect(
      beforeTreasoryP.add(
        projectTknIsTknZero
          ? closePALMTermsEvent?.emolument0
          : closePALMTermsEvent?.emolument1
      )
    ).to.be.equal(afterTreasoryP);

    vaultV2 = (await ethers.getContractAt(
      "IArrakisV2",
      vault,
      user
    )) as IArrakisV2;

    expect(await vaultV2.owner()).to.be.eq(userAddr);
    expect(await vaultV2.manager()).to.be.eq(userAddr);

    expect((await manager.getVaultInfo(vault)).termEnd).to.be.eq(0);

    await expect(terms.vaults(userAddr, 0)).to.be.reverted;
  });

  it("#5: reopen PALMTerms", async () => {
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
      amount0: result.amount0,
      amount1: result.amount1,
      datas: ethers.constants.HashZero,
      strat: "Bootstrapping",
      isBeacon: false,
      delegate: await user2.getAddress(),
      routers: [],
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

    expect(await projectToken.balanceOf(vault)).to.be.eq(
      projectTokenAllocation
    );

    expect((await manager.getVaultInfo(vault)).strat).to.be.eq(
      ethers.utils.solidityKeccak256(["string"], ["Bootstrapping"])
    );
    expect((await manager.getVaultInfo(vault)).termEnd).to.be.gt(0);

    // #endregion get mintAmount.
  });

  it("#6: renew terms", async () => {
    // set data and strat type.

    const newData = ethers.utils.defaultAbiCoder.encode(["string"], ["TEST"]);

    await terms.connect(user2).setVaultData(vault, newData);

    await terms
      .connect(user2)
      .setVaultStratByName(vault, "After Bootstrapping");

    const vaultInfo = await manager.getVaultInfo(vault);

    expect(vaultInfo.strat).to.be.eq(
      ethers.utils.solidityKeccak256(["string"], ["After Bootstrapping"])
    );
    expect(vaultInfo.datas).to.be.eq(newData);

    await expect(terms.renewTerm(vault)).to.be.revertedWith(
      "PALMTerms: term not ended."
    );

    await hre.network.provider.send("evm_setNextBlockTimestamp", [
      vaultInfo.termEnd.toNumber() + 1,
    ]);
    await hre.network.provider.send("evm_mine");

    const beforeBTB = await baseToken.balanceOf(vault);
    const beforePTB = await projectToken.balanceOf(vault);

    const beforeTreasoryP = await projectToken.balanceOf(
      await terms.termTreasury()
    );

    const beforeTreasoryB = await baseToken.balanceOf(
      await terms.termTreasury()
    );

    const result = await (await terms.renewTerm(vault)).wait();

    const extendingEvent = result.events?.find(
      (e) => e.event == "RenewTerm"
    )?.args;

    const afterBTB = await baseToken.balanceOf(vault);
    const afterPTB = await projectToken.balanceOf(vault);

    expect(
      beforeBTB.sub(
        projectTknIsTknZero
          ? extendingEvent?.emolument1
          : extendingEvent?.emolument0
      )
    ).to.be.eq(afterBTB);
    expect(
      beforePTB.sub(
        projectTknIsTknZero
          ? extendingEvent?.emolument0
          : extendingEvent?.emolument1
      )
    ).to.be.eq(afterPTB);

    const afterTreasoryP = await projectToken.balanceOf(
      await terms.termTreasury()
    );

    const afterTreasoryB = await baseToken.balanceOf(
      await terms.termTreasury()
    );

    expect(afterTreasoryP).to.be.gte(beforeTreasoryP);
    expect(afterTreasoryB).to.be.gte(beforeTreasoryB);
  });
});
