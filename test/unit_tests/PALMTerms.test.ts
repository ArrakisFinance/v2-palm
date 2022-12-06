import { expect } from "chai";
import hre = require("hardhat");
import {
  Addresses,
  getAddressBookByNetwork,
} from "../../src/config/addressBooks";
import { Signer } from "ethers";
import {
  BaseToken,
  IArrakisV2Extended,
  IArrakisV2FactoryExtended,
  IUniswapV3Factory,
  IUniswapV3Pool,
  ProjectToken,
  PALMManagerMock,
  PALMTermsMock,
} from "../../typechain";
import { BigNumber } from "ethers";

const { ethers, deployments } = hre;

describe("PALMTerms unit test!!!", async function () {
  this.timeout(0);

  let user: Signer;
  let userAddr: string;
  let owner: Signer;
  let addresses: Addresses;
  let terms: PALMTermsMock;
  let manager: PALMManagerMock;
  let arrakisV2Factory: IArrakisV2FactoryExtended;
  let baseToken: BaseToken;
  let projectToken: ProjectToken;
  let v3Factory: IUniswapV3Factory;
  let pool: IUniswapV3Pool;
  // eslint-disable-next-line
  let projectTknIsTknZero: boolean;
  let vault: IArrakisV2Extended;

  beforeEach("Setting up for PALMTerms unit test", async function () {
    if (hre.network.name !== "hardhat") {
      console.error("Test Suite is meant to be run on hardhat only");
      process.exit(1);
    }

    [user, , owner] = await ethers.getSigners();

    userAddr = await user.getAddress();
    addresses = getAddressBookByNetwork(hre.network.name);
    await deployments.fixture();

    terms = (await ethers.getContract("PALMTermsMock", user)) as PALMTermsMock;
    manager = (await ethers.getContract(
      "PALMManagerMock",
      user
    )) as PALMManagerMock;

    await terms.connect(owner).setManager(manager.address);

    baseToken = (await ethers.getContract("BaseToken")) as BaseToken;
    projectToken = (await ethers.getContract("ProjectToken")) as ProjectToken;

    arrakisV2Factory = await ethers.getContractAt(
      "IArrakisV2FactoryExtended",
      addresses.ArrakisV2Factory,
      user
    );

    v3Factory = (await ethers.getContractAt(
      "IUniswapV3Factory",
      addresses.UniswapV3Factory
    )) as IUniswapV3Factory;

    // #region create uniswap v3 pool.
    projectTknIsTknZero = BigNumber.from(projectToken.address).lt(
      baseToken.address
    );

    const result = await (
      await v3Factory.createPool(projectToken.address, baseToken.address, 500)
    ).wait();

    pool = (await ethers.getContractAt(
      "IUniswapV3Pool",
      result.events![0].args!.pool,
      user
    )) as IUniswapV3Pool;

    const baseTokenAllocation = ethers.utils.parseUnits("1000", 18);
    const projectTokenAllocation = ethers.utils.parseUnits("100000", 18);

    const mintAmount = ethers.utils.parseUnits("1", 18);

    const init0 = ethers.utils.parseUnits("1", 18);
    const init1 = projectTknIsTknZero
      ? projectTokenAllocation
          .mul(ethers.utils.parseUnits("1", 18))
          .div(mintAmount)
      : baseTokenAllocation
          .mul(ethers.utils.parseUnits("1", 18))
          .div(mintAmount);

    const setup = {
      feeTiers: [500],
      token0: projectTknIsTknZero ? projectToken.address : baseToken.address,
      token1: projectTknIsTknZero ? baseToken.address : projectToken.address,
      owner: terms.address,
      init0: init0,
      init1: init1,
      manager: userAddr,
      routers: [],
      burnBuffer: 1000,
    };

    const receipt = await (
      await arrakisV2Factory.deployVault(setup, false)
    ).wait();

    vault = (await ethers.getContractAt(
      "IArrakisV2Extended",
      receipt.events![receipt.events!.length - 1].args!.vault,
      user
    )) as IArrakisV2Extended;
  });

  // #region set Emolument unit test.

  it("#0: setEmolument unit test with no owner", async () => {
    await expect(terms.setEmolument(10)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("#1: setEmolument unit test with emolument > than the previous one", async () => {
    await expect(terms.connect(owner).setEmolument(1000)).to.be.revertedWith(
      "PALMTerms: new emolument >= old emolument"
    );
  });

  it("#2: setEmolument unit test", async () => {
    await expect(terms.connect(owner).setEmolument(50)).to.not.be.reverted;
  });

  // #endregion set Emolument unit test.

  // #region set Term Treasury unit test.

  it("#3: setTermTreasury unit test with no owner", async () => {
    await expect(
      terms.setTermTreasury(ethers.constants.AddressZero)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("#4: setTermTreasury unit test with zero address", async () => {
    await expect(
      terms.connect(owner).setTermTreasury(ethers.constants.AddressZero)
    ).to.be.revertedWith("PALMTerms: address Zero");
  });

  it("#5: setTermTreasury unit test with same term treasury", async () => {
    await expect(
      terms.connect(owner).setTermTreasury(await terms.termTreasury())
    ).to.be.revertedWith("PALMTerms: already term treasury");
  });

  it("#6: setTermTreasury unit test", async () => {
    await expect(terms.connect(owner).setTermTreasury(userAddr)).to.not.be
      .reverted;
  });

  // #endregion set Term Treasury test.

  // #region setResolver unit test.

  it("#6: setResolver unit test with no owner", async () => {
    await expect(
      terms.setResolver(ethers.constants.AddressZero)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("#7: setResolver unit test with zero address", async () => {
    await expect(
      terms.connect(owner).setResolver(ethers.constants.AddressZero)
    ).to.be.revertedWith("PALMTerms: address Zero");
  });

  it("#8: setResolver unit test with same resolver", async () => {
    await expect(
      terms.connect(owner).setResolver(await terms.resolver())
    ).to.be.revertedWith("PALMTerms: already resolver");
  });

  it("#9: setResolver unit test", async () => {
    await expect(terms.connect(owner).setResolver(userAddr)).to.not.be.reverted;
  });

  // #endregion setResolver unit test.

  // #region setManager unit test.

  it("#10: setManager unit test with no owner", async () => {
    await expect(
      terms.setManager(ethers.constants.AddressZero)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("#11: setManager unit test with zero address", async () => {
    await expect(
      terms.connect(owner).setManager(ethers.constants.AddressZero)
    ).to.be.revertedWith("PALMTerms: address Zero");
  });

  it("#12: setManager unit test with same manager", async () => {
    await terms.connect(owner).setManager(userAddr);
    await expect(
      terms.connect(owner).setManager(await terms.manager())
    ).to.be.revertedWith("PALMTerms: already manager");
  });

  it("#13: setManager unit test", async () => {
    await expect(terms.connect(owner).setManager(userAddr)).to.not.be.reverted;
  });

  // #endregion setManager unit test.

  //#region addPools unit test.

  it("#14: addPools unit test with vault zero address", async () => {
    await expect(
      terms.addPools(ethers.constants.AddressZero, [500])
    ).to.be.revertedWith("PALMTerms: address Zero");
  });

  it("#15: addPools unit test with not owner", async () => {
    await expect(
      terms.connect(user).addPools(vault.address, [500])
    ).to.be.revertedWith("PALMTerms: not owner");
  });

  it("#16: addPools unit test", async () => {
    await terms.connect(owner).addVault(vault.address);

    await v3Factory.createPool(projectToken.address, baseToken.address, 3000);

    await expect(terms.connect(owner).addPools(vault.address, [3000])).to.not.be
      .reverted;
  });

  //#endregion addPools unit test.

  // #region removePools unit test.

  it("#17: removePools unit test with vault zero address", async () => {
    await expect(
      terms.removePools(ethers.constants.AddressZero, [pool.address])
    ).to.be.revertedWith("PALMTerms: address Zero");
  });

  it("#18: removePools unit test with not owner", async () => {
    await expect(
      terms.connect(user).removePools(vault.address, [pool.address])
    ).to.be.revertedWith("PALMTerms: not owner");
  });

  it("#19: removePools unit test", async () => {
    await terms.connect(owner).addVault(vault.address);

    const result = await (
      await v3Factory.createPool(projectToken.address, baseToken.address, 3000)
    ).wait();
    await terms.connect(owner).addPools(vault.address, [3000]);

    await expect(
      terms
        .connect(owner)
        .removePools(vault.address, [result.events![0].args!.pool])
    ).to.not.be.reverted;
  });

  // #endregion removePools unit test.

  // #region setVaultData unit test.

  it("#29: setVaultData unit test with vault zero address", async () => {
    await expect(
      terms.setVaultData(
        ethers.constants.AddressZero,
        ethers.constants.HashZero
      )
    ).to.be.revertedWith("PALMTerms: address Zero");
  });

  it("#30: setMaxSlippage unit test with not owner", async () => {
    await expect(
      terms.connect(user).setVaultData(vault.address, ethers.constants.HashZero)
    ).to.be.revertedWith("PALMTerms: not owner");
  });

  it("#31: setMaxSlippage unit test", async () => {
    await terms.connect(owner).addVault(vault.address);

    manager = (await (
      await ethers.getContractFactory("PALMManagerMock", user)
    ).deploy(terms.address, 60 * 60 * 24 * 365, 4750)) as PALMManagerMock;

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [terms.address],
    });

    const s = await ethers.getSigner(terms.address);

    await user.sendTransaction({
      to: terms.address,
      value: ethers.utils.parseEther("1"),
    });

    await manager.connect(s).addVaultMock(vault.address);

    await hre.network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [terms.address],
    });

    await terms.connect(owner).setManager(manager.address);

    await expect(
      terms
        .connect(owner)
        .setVaultData(
          vault.address,
          ethers.utils.keccak256(ethers.constants.HashZero)
        )
    ).to.not.be.reverted;
  });

  // #endregion setVaultData unit test.

  // #region setVaultStratByName unit test.

  it("#32: setVaultStratByName unit test with vault zero address", async () => {
    await expect(
      terms.setVaultStratByName(ethers.constants.AddressZero, "Gaussian")
    ).to.be.revertedWith("PALMTerms: address Zero");
  });

  it("#33: setVaultStratByName unit test with not owner", async () => {
    await expect(
      terms.connect(user).setVaultStratByName(vault.address, "Gaussian")
    ).to.be.revertedWith("PALMTerms: not owner");
  });

  it("#34: setVaultStratByName unit test", async () => {
    await terms.connect(owner).addVault(vault.address);

    manager = (await (
      await ethers.getContractFactory("PALMManagerMock", user)
    ).deploy(terms.address, 60 * 60 * 24 * 365, 4750)) as PALMManagerMock;

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [terms.address],
    });

    const s = await ethers.getSigner(terms.address);

    await user.sendTransaction({
      to: terms.address,
      value: ethers.utils.parseEther("1"),
    });

    await manager.connect(s).addVaultMock(vault.address);

    await hre.network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [terms.address],
    });

    await terms.connect(owner).setManager(manager.address);

    await manager.initialize(userAddr, userAddr);

    await manager.connect(user).whitelistStrat("Gaussian");

    await expect(
      terms.connect(owner).setVaultStratByName(vault.address, "Gaussian")
    ).to.not.be.reverted;
  });

  // #endregion setVaultStratByName unit test.

  // #region withdrawVaultBalance unit test.

  it("#35: withdrawVaultBalance unit test with vault zero address", async () => {
    await expect(
      terms.withdrawVaultBalance(
        ethers.constants.AddressZero,
        ethers.constants.Zero,
        userAddr
      )
    ).to.be.revertedWith("PALMTerms: address Zero");
  });

  it("#36: withdrawVaultBalance unit test with not owner", async () => {
    await expect(
      terms
        .connect(user)
        .withdrawVaultBalance(vault.address, ethers.constants.Zero, userAddr)
    ).to.be.revertedWith("PALMTerms: not owner");
  });

  it("#37: withdrawVaultBalance unit test", async () => {
    await terms.connect(owner).addVault(vault.address);

    manager = (await (
      await ethers.getContractFactory("PALMManagerMock", user)
    ).deploy(terms.address, 60 * 60 * 24 * 365, 4750)) as PALMManagerMock;

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [terms.address],
    });

    const s = await ethers.getSigner(terms.address);

    await user.sendTransaction({
      to: terms.address,
      value: ethers.utils.parseEther("2"),
    });

    await manager
      .connect(s)
      .addVaultMock(vault.address, { value: ethers.utils.parseEther("1") });

    await hre.network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [terms.address],
    });

    await terms.connect(owner).setManager(manager.address);

    await manager.initialize(userAddr, userAddr);

    await expect(
      terms
        .connect(owner)
        .withdrawVaultBalance(
          vault.address,
          ethers.utils.parseUnits("5", 17),
          userAddr
        )
    ).to.not.be.reverted;
  });

  // #endregion withdrawVaultBalance unit test.
});
