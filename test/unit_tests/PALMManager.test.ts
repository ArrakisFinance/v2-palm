import { expect } from "chai";
import hre = require("hardhat");
import {
  Addresses,
  getAddressBookByNetwork,
} from "../../src/config/addressBooks";
import { Signer } from "ethers";
import {
  BaseToken,
  PALMManagerMock,
  IArrakisV2,
  IArrakisV2Factory,
  IUniswapV3Factory,
  ProjectToken,
} from "../../typechain";
import { BigNumber } from "ethers";

const { ethers, deployments } = hre;

describe("PALMManager unit test!!!", async function () {
  this.timeout(0);

  let user: Signer;
  let userAddr: string;
  let user2: Signer;
  let addresses: Addresses;
  let managerMock: PALMManagerMock;
  let arrakisV2Factory: IArrakisV2Factory;
  let baseToken: BaseToken;
  let projectToken: ProjectToken;
  let v3Factory: IUniswapV3Factory;
  // eslint-disable-next-line
  let projectTknIsTknZero: boolean;
  // let pool: IUniswapV3Pool;
  let vault: IArrakisV2;

  beforeEach("Setting up for PALMManager unit test", async function () {
    if (hre.network.name !== "hardhat") {
      console.error("Test Suite is meant to be run on hardhat only");
      process.exit(1);
    }

    [user, user2] = await ethers.getSigners();

    userAddr = await user.getAddress();
    addresses = getAddressBookByNetwork(hre.network.name);
    await deployments.fixture();

    managerMock = (await ethers.getContract(
      "PALMManagerMock",
      user
    )) as PALMManagerMock;

    baseToken = (await ethers.getContract("BaseToken")) as BaseToken;
    projectToken = (await ethers.getContract("ProjectToken")) as ProjectToken;

    arrakisV2Factory = await ethers.getContractAt(
      "IArrakisV2Factory",
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

    await (
      await v3Factory.createPool(projectToken.address, baseToken.address, 500)
    ).wait();

    // pool = (await ethers.getContractAt(
    //   "IUniswapV3Pool",
    //   result.events![0].args!.pool,
    //   user
    // )) as IUniswapV3Pool;

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

    const setup = {
      feeTiers: [500],
      token0: projectTknIsTknZero ? projectToken.address : baseToken.address,
      token1: projectTknIsTknZero ? baseToken.address : projectToken.address,
      owner: userAddr,
      init0: init0,
      init1: init1,
      manager: managerMock.address,
      routers: [],
    };

    const receipt = await (
      await arrakisV2Factory.deployVault(setup, false)
    ).wait();

    vault = (await ethers.getContractAt(
      "IArrakisV2",
      receipt.events![receipt.events!.length - 1].args!.vault,
      user
    )) as IArrakisV2;
  });

  // #region add vault unit test.

  it("#0: test add vault with vault zero", async () => {
    await expect(
      managerMock.addVault(
        ethers.constants.AddressZero,
        ethers.constants.HashZero,
        "Gaussian"
      )
    ).to.be.revertedWith("PALMManager: address Zero");
  });

  it("#1: test add vault with not whitelisted strategy", async () => {
    await expect(
      managerMock
        .connect(user)
        .addVault(vault.address, ethers.constants.HashZero, "Gaussian")
    ).to.be.revertedWith("PALMManager: Not whitelisted");
  });

  it("#2: test add vault with vault already added", async () => {
    await managerMock.whitelistStrat("Gaussian");

    await managerMock
      .connect(user)
      .addVault(vault.address, ethers.constants.HashZero, "Gaussian");

    await expect(
      managerMock
        .connect(user)
        .addVault(vault.address, ethers.constants.HashZero, "Gaussian")
    ).to.be.revertedWith("PALMManager: Vault already added");
  });

  it("#3: test add vault with vault already added", async () => {
    await managerMock.whitelistStrat("Gaussian");

    await expect(
      managerMock
        .connect(user)
        .addVault(vault.address, ethers.constants.HashZero, "Gaussian", {
          value: ethers.utils.parseEther("1"),
        })
    ).to.not.be.reverted;

    expect((await managerMock.vaults(vault.address)).balance).to.be.eq(
      ethers.utils.parseEther("1")
    );
  });

  // #endregion add vault unit test.

  // #region remove vault unit test.

  it("#4: test remove vault with vault zero", async () => {
    await expect(
      managerMock
        .connect(user)
        .removeVault(ethers.constants.AddressZero, userAddr)
    ).to.be.revertedWith("PALMManager: address Zero");
  });

  it("#5: test remove vault with not owner", async () => {
    await expect(
      managerMock.connect(user2).removeVault(vault.address, userAddr)
    ).to.be.revertedWith("PALMManager: only vault owner");
  });

  it("#6: test remove vault with vault not managed", async () => {
    await expect(
      managerMock.connect(user).removeVault(vault.address, userAddr)
    ).to.be.revertedWith("PALMManager: Vault not managed");
  });

  it("#7: test remove vault", async () => {
    await managerMock.whitelistStrat("Gaussian");

    await managerMock
      .connect(user)
      .addVault(vault.address, ethers.constants.HashZero, "Gaussian");

    await expect(managerMock.connect(user).removeVault(vault.address, userAddr))
      .to.not.be.reverted;
  });

  it("#8: test remove vault with fund withdrawal", async () => {
    await managerMock.whitelistStrat("Gaussian");

    await managerMock
      .connect(user)
      .addVault(vault.address, ethers.constants.HashZero, "Gaussian", {
        value: ethers.utils.parseEther("1"),
      });

    const balanceBefore = await user.getBalance();

    await expect(managerMock.connect(user).removeVault(vault.address, userAddr))
      .to.not.be.reverted;

    expect(await user.getBalance()).to.be.gt(balanceBefore);
  });

  // #endregion remove vault unit test.

  // #region set vault data unit test.

  it("#9: test set vault data with vault is Zero Address", async () => {
    await expect(
      managerMock.setVaultData(
        ethers.constants.AddressZero,
        ethers.constants.HashZero
      )
    ).to.be.revertedWith("PALMManager: address Zero");
  });

  it("#10: test set vault data with not owner", async () => {
    await expect(
      managerMock
        .connect(user2)
        .setVaultData(vault.address, ethers.constants.HashZero)
    ).to.be.revertedWith("PALMManager: only vault owner");
  });

  it("#11: test set vault data with no managed vault", async () => {
    await expect(
      managerMock.setVaultData(vault.address, ethers.constants.HashZero)
    ).to.be.revertedWith("PALMManager: Vault not managed");
  });

  it("#11: test set vault data with same data", async () => {
    await managerMock.whitelistStrat("Gaussian");

    await managerMock
      .connect(user)
      .addVault(vault.address, ethers.constants.HashZero, "Gaussian");

    await expect(
      managerMock.setVaultData(vault.address, ethers.constants.HashZero)
    ).to.be.revertedWith("PALMManager: data");
  });

  it("#12: test set vault data", async () => {
    await managerMock.whitelistStrat("Gaussian");

    await managerMock
      .connect(user)
      .addVault(vault.address, ethers.constants.HashZero, "Gaussian");

    const data = ethers.utils.keccak256(ethers.constants.HashZero);

    await expect(managerMock.setVaultData(vault.address, data)).to.not.be
      .reverted;

    expect((await managerMock.vaults(vault.address)).datas).to.be.eq(data);
  });

  // #endregion set vault data unit test.

  // #region set Vault strat by name.

  it("#13: test set vault strat by name with vault is zero address", async () => {
    await expect(
      managerMock.setVaultStraByName(ethers.constants.AddressZero, "Gaussian")
    ).to.be.revertedWith("PALMManager: address Zero");
  });

  it("#14: test set vault strat by name with no owner", async () => {
    await expect(
      managerMock.connect(user2).setVaultStraByName(vault.address, "Gaussian")
    ).to.be.revertedWith("PALMManager: only vault owner");
  });

  it("#15: test set vault strat by name with no managed vault", async () => {
    await expect(
      managerMock.connect(user).setVaultStraByName(vault.address, "Gaussian")
    ).to.be.revertedWith("PALMManager: Vault not managed");
  });

  it("#15: test set vault strat by name with no managed vault", async () => {
    await managerMock.whitelistStrat("Gaussian");

    await managerMock
      .connect(user)
      .addVault(vault.address, ethers.constants.HashZero, "Gaussian");

    await expect(
      managerMock.connect(user).setVaultStraByName(vault.address, "Gaussian 2")
    ).to.be.revertedWith("PALMManager: strat not whitelisted.");
  });

  it("#16: test set vault strat by name", async () => {
    await managerMock.whitelistStrat("Gaussian");

    await managerMock
      .connect(user)
      .addVault(vault.address, ethers.constants.HashZero, "Gaussian");

    await managerMock.whitelistStrat("Gaussian 2");

    await expect(
      managerMock.connect(user).setVaultStraByName(vault.address, "Gaussian 2")
    ).to.not.be.reverted;
  });

  // #endregion set Vault strat by name.

  // #region add operators unit test.

  it("#17: test add operators with operators eq to address zero", async () => {
    await expect(
      managerMock.addOperators([ethers.constants.AddressZero])
    ).to.be.revertedWith("PALMManager: address Zero");
  });

  it("#18: test add operators with not owner", async () => {
    await expect(
      managerMock.connect(user2).addOperators([userAddr])
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("#19: test add operators with already operator", async () => {
    managerMock.addOperators([userAddr]);
    await expect(managerMock.addOperators([userAddr])).to.be.revertedWith(
      "PALMManager: operator"
    );
  });

  it("#20: test add operators", async () => {
    await expect(managerMock.addOperators([userAddr])).to.not.be.reverted;
  });

  // #endregion add operators unit test.

  // #region remove operators unit test.

  it("#21: test remove operators with operators eq to address zero", async () => {
    await expect(
      managerMock.removeOperators([ethers.constants.AddressZero])
    ).to.be.revertedWith("PALMManager: address Zero");
  });

  it("#22: test remove operators with not owner", async () => {
    await expect(
      managerMock.connect(user2).removeOperators([userAddr])
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("#23: test remove operators with already operator", async () => {
    await expect(managerMock.removeOperators([userAddr])).to.be.revertedWith(
      "PALMManager: no operator"
    );
  });

  it("#24: test remove operators", async () => {
    await expect(managerMock.addOperators([userAddr])).to.not.be.reverted;

    await expect(managerMock.removeOperators([userAddr])).to.not.be.reverted;
  });

  // #endregion remove operators unit test.

  // #region withdrawVaultBalance unit test.

  it("#25: test withdraw vault balance with address zero", async () => {
    await expect(
      managerMock.withdrawVaultBalance(
        ethers.constants.AddressZero,
        ethers.utils.parseEther("1"),
        userAddr
      )
    ).to.be.revertedWith("PALMManager: address Zero");
  });

  it("#26: test withdraw vault balance with no vault owner", async () => {
    await expect(
      managerMock
        .connect(user2)
        .withdrawVaultBalance(
          vault.address,
          ethers.utils.parseEther("1"),
          userAddr
        )
    ).to.be.revertedWith("PALMManager: only vault owner");
  });

  it("#27: test withdraw vault balance with no managed vault", async () => {
    await expect(
      managerMock.withdrawVaultBalance(
        vault.address,
        ethers.utils.parseEther("1"),
        userAddr
      )
    ).to.be.revertedWith("PALMManager: Vault not managed");
  });

  it("#28: test withdraw vault balance with to eq Address Zero", async () => {
    await managerMock.whitelistStrat("Gaussian");

    await managerMock.addVault(
      vault.address,
      ethers.constants.HashZero,
      "Gaussian"
    );
    await expect(
      managerMock.withdrawVaultBalance(
        vault.address,
        ethers.utils.parseEther("1"),
        ethers.constants.AddressZero
      )
    ).to.be.revertedWith("PALMManager: address Zero");
  });

  it("#29: test withdraw vault balance with to eq Address Zero", async () => {
    await managerMock.whitelistStrat("Gaussian");

    await managerMock.addVault(
      vault.address,
      ethers.constants.HashZero,
      "Gaussian"
    );

    await expect(
      managerMock.withdrawVaultBalance(
        vault.address,
        ethers.utils.parseEther("1"),
        userAddr
      )
    ).to.be.revertedWith("PALMManager: amount exceeds available balance");
  });

  it("#30: test withdraw vault balance", async () => {
    await managerMock.whitelistStrat("Gaussian");

    await managerMock.addVault(
      vault.address,
      ethers.constants.HashZero,
      "Gaussian",
      {
        value: ethers.utils.parseEther("1"),
      }
    );

    await expect(
      managerMock.withdrawVaultBalance(
        vault.address,
        ethers.utils.parseEther("1"),
        userAddr
      )
    ).to.not.be.reverted;
  });

  // #endregion withdrawVaultBalance unit test.

  // #region fund vault balance unit test.

  it("#31: test fund vault balance with not managed vault", async () => {
    // await managerMock.whitelistStrat("Gaussian");

    // await managerMock.addVault(
    //   vault.address,
    //   ethers.constants.HashZero,
    //   "Gaussian",
    //   {
    //     value: ethers.utils.parseEther("1"),
    //   }
    // );

    await expect(
      managerMock.fundVaultBalance(vault.address, {
        value: ethers.utils.parseEther("1"),
      })
    ).to.be.revertedWith("PALMManager: Vault not managed");
  });

  it("#32: test fund vault balance", async () => {
    await managerMock.whitelistStrat("Gaussian");

    await managerMock.addVault(
      vault.address,
      ethers.constants.HashZero,
      "Gaussian"
    );

    await expect(
      managerMock.fundVaultBalance(vault.address, {
        value: ethers.utils.parseEther("1"),
      })
    ).to.not.be.reverted;
  });

  // #endregion fund vault balance unit test.

  // #region expand MM Term Duration unit test.

  it("#33: test expand MM terms with not terms", async () => {
    await managerMock.whitelistStrat("Gaussian");

    await managerMock.addVault(
      vault.address,
      ethers.constants.HashZero,
      "Gaussian"
    );

    await expect(
      managerMock.connect(user2).renewTerm(vault.address)
    ).to.be.revertedWith("PALMManager: only PALMTerms");
  });

  it("#34: test expand MM terms with vault eq zero address", async () => {
    await expect(
      managerMock.renewTerm(ethers.constants.AddressZero)
    ).to.be.revertedWith("PALMManager: address Zero");
  });

  it("#35: test expand MM terms with no managed vault", async () => {
    await expect(managerMock.renewTerm(vault.address)).to.be.revertedWith(
      "PALMManager: Vault not managed"
    );
  });

  it("#36: test expand MM terms", async () => {
    await managerMock.whitelistStrat("Gaussian");

    await managerMock.addVault(
      vault.address,
      ethers.constants.HashZero,
      "Gaussian"
    );

    await expect(managerMock.renewTerm(vault.address)).to.not.be.reverted;
  });

  // #endregion expand MM Term Duration unit test.

  // #region whitelistStrat unit test.

  it("#41: test whitelistStrat with no owner", async () => {
    await expect(
      managerMock.connect(user2).whitelistStrat("")
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("#42: test whitelistStrat with empty string strat", async () => {
    await expect(managerMock.whitelistStrat("")).to.be.revertedWith(
      "PALMManager: empty string"
    );
  });

  it("#43: test whitelistStrat with already added strat", async () => {
    await managerMock.whitelistStrat("Bootstrapping");

    await expect(
      managerMock.whitelistStrat("Bootstrapping")
    ).to.be.revertedWith("PALMManager: strat whitelisted.");
  });

  it("#44: test whitelistStrat", async () => {
    await expect(managerMock.whitelistStrat("Bootstrapping")).to.not.be
      .reverted;
  });

  // #endregion whitelistStrat unit test.
});
