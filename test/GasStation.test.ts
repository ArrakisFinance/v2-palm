import { expect } from "chai";
import { Signer } from "@ethersproject/abstract-signer";
import { Contract } from "@ethersproject/contracts";
import hre = require("hardhat");
import {
  GasStation,
  EIP173Proxy,
  IVaultV2,
  IVaultV2Resolver,
} from "../typechain";
import { getAddressBookByNetwork } from "../src/config";
import { HardhatNetworkConfig } from "hardhat/types/config";

const { ethers, network, deployments } = hre;
const addresses = getAddressBookByNetwork("matic");

const whitelistedExecutor = "0xbd087bccb2e71177b264bf251af2400a20f917da";
const testArrakisVault = "0xF53Ef843FE41c9475FfA8013dB3e81cC81F9aB78"; // vault v2 on polygon
const testArrakisVaultOwner = "0x8d1ce8320A3C2AD13b865a6d7FDd3c083a56b6cE"; // owner of vault above
const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const ALCHEMY_ID_POLYGON = process.env.ALCHEMY_ID_POLYGON;

describe("Test GasStation Contract", function () {
  this.timeout(0);

  let managerProxy: GasStation;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  let GasStationProxy: EIP173Proxy;
  let vault: IVaultV2;
  let gelatoMultiSig: Signer;
  let gelatoContract: Contract;
  let executor: Signer;
  let vaultOwner: Signer;
  let resolver: IVaultV2Resolver;

  before("sets up environment", async function () {
    // VaultV2 is currently only on polygon/matic
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (hre as any).reset(
      `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_ID_POLYGON}`,
      31195290
    );

    await deployments.fixture("GasStation");

    const mpAddress = (await deployments.get("GasStation")).address;
    managerProxy = (await ethers.getContractAt(
      "GasStation",
      mpAddress
    )) as GasStation;

    GasStationProxy = (await ethers.getContractAt(
      "EIP173Proxy",
      managerProxy.address
    )) as EIP173Proxy;

    vault = (await ethers.getContractAt(
      "IVaultV2",
      testArrakisVault
    )) as IVaultV2;

    resolver = (await ethers.getContractAt(
      "IVaultV2Resolver",
      addresses.VaultV2Resolver
    )) as IVaultV2Resolver;

    const [signer] = await ethers.getSigners();

    // impersonate multisig and add ether
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [addresses.ArrakisDAOMultiSig],
    });
    gelatoMultiSig = await ethers.provider.getSigner(
      addresses.ArrakisDAOMultiSig
    );
    await signer.sendTransaction({
      to: await gelatoMultiSig.getAddress(),
      value: ethers.utils.parseEther("100"),
    });

    // impersonate executor whitelisted in Gelato contract
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [whitelistedExecutor],
    });
    executor = await ethers.provider.getSigner(whitelistedExecutor);

    // impersonate vault owner and set balance
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [testArrakisVaultOwner],
    });
    vaultOwner = await ethers.provider.getSigner(testArrakisVaultOwner);
    await network.provider.send("hardhat_setBalance", [
      testArrakisVaultOwner,
      "0x313030303030303030303030303030303030303030",
    ]);

    gelatoContract = await ethers.getContractAt(
      ["function exec(address, bytes memory, address) external"],
      addresses.Gelato
    );

    // add ManagerProxy as operator of vault (for rebalancing)
    await vault.connect(vaultOwner).addOperators([managerProxy.address]);
  });

  describe("GasStation Unit Tests", async () => {
    it("adding vault and ownership", async () => {
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [testArrakisVaultOwner],
      });

      // const signer = await ethers.getSigner(testArrakisVaultOwner);

      await managerProxy.connect(vaultOwner).addVault(vault.address);

      // cannot accept again
      await expect(
        managerProxy.connect(vaultOwner).addVault(vault.address)
      ).to.be.revertedWith("Vault already added");

      await hre.network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [testArrakisVaultOwner],
      });

      // onlyOwner
      await expect(
        managerProxy.connect(gelatoMultiSig).addVault(vault.address)
      ).to.be.revertedWith("ManagerProxyV1: only vault owner");
    });

    it("contract does not receive unallocated eth", async () => {
      await expect(
        vaultOwner.sendTransaction({
          to: managerProxy.address,
          value: ethers.utils.parseEther("1"),
        })
      ).to.be.reverted;
    });

    it("funds vault balance", async () => {
      await managerProxy.fundVaultBalance(vault.address, {
        value: ethers.utils.parseEther("1"),
      });
      const balance = await vaultOwner.provider?.getBalance(
        managerProxy.address
      );
      expect(balance).to.equal(ethers.utils.parseEther("1"));
    });

    it("rebalances correctly", async () => {
      const rangeWeights = {
        range: {
          lowerTick: 196150,
          upperTick: 210100,
          feeTier: 500,
        },
        weight: 1000,
      };

      const rebalanceParams = await resolver.standardRebalance(
        [rangeWeights],
        vault.address
      );

      const payload = managerProxy.interface.encodeFunctionData("rebalance", [
        vault.address,
        rebalanceParams,
        ethers.utils.parseEther("0.01"),
      ]);

      await gelatoContract
        .connect(executor)
        .exec(managerProxy.address, payload, ETH);

      const ranges = await vault.rangesArray();
      expect(ranges.length).to.equal(1);
      expect(ranges[0].upperTick).to.equal(rangeWeights.range.upperTick);
      expect(ranges[0].lowerTick).to.equal(rangeWeights.range.lowerTick);

      const balance = await vaultOwner.provider?.getBalance(
        managerProxy.address
      );
      expect(balance).to.equal(ethers.utils.parseEther("0.99"));
    });

    it("adds ranges and rebalances correctly", async () => {
      const range = {
        lowerTick: 180000,
        upperTick: 220000,
        feeTier: 500,
      };
      const rangeWeights = {
        range: range,
        weight: 2000,
      };

      const rebalanceParams = await resolver.standardRebalance(
        [rangeWeights],
        vault.address
      );

      const payload = managerProxy.interface.encodeFunctionData(
        "addRangeAndRebalance",
        [
          vault.address,
          [range],
          rebalanceParams,
          ethers.utils.parseEther("0.01"),
        ]
      );

      await gelatoContract
        .connect(executor)
        .exec(managerProxy.address, payload, ETH);

      const ranges = await vault.rangesArray();
      expect(ranges.length).to.equal(2);
      expect(ranges[1].upperTick).to.equal(rangeWeights.range.upperTick);
      expect(ranges[1].lowerTick).to.equal(rangeWeights.range.lowerTick);

      const balance = await vaultOwner.provider?.getBalance(
        managerProxy.address
      );
      expect(balance).to.equal(ethers.utils.parseEther("0.98"));
    });

    it("cannot rebalance if not gelato", async () => {
      const rangeWeights = {
        range: {
          lowerTick: 196150,
          upperTick: 210100,
          feeTier: 500,
        },
        weight: 5000,
      };

      const rebalanceParams = await resolver.standardRebalance(
        [rangeWeights],
        vault.address
      );

      await expect(
        managerProxy
          .connect(executor)
          .rebalance(
            vault.address,
            rebalanceParams,
            ethers.utils.parseEther("0.01")
          )
      ).to.be.revertedWith("ManagerProxyV1: onlyGelatoOrOwner");
    });

    it("withdraw vault balance", async () => {
      const balanceBefore = await gelatoMultiSig.provider?.getBalance(
        addresses.ArrakisDAOMultiSig
      );
      await expect(
        managerProxy.withdrawVaultBalance(
          vault.address,
          ethers.utils.parseEther("0.5"),
          addresses.ArrakisDAOMultiSig
        )
      ).to.be.revertedWith("ManagerProxyV1: only vault owner");
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [testArrakisVaultOwner],
      });
      await managerProxy
        .connect(vaultOwner)
        .withdrawVaultBalance(
          vault.address,
          ethers.utils.parseEther("0.5"),
          addresses.ArrakisDAOMultiSig
        );
      await hre.network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [testArrakisVaultOwner],
      });
      const balanceAfter = await gelatoMultiSig.provider?.getBalance(
        addresses.ArrakisDAOMultiSig
      );
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("implements upgraeability correctly", async () => {
      const proxyAdmin = await GasStationProxy.proxyAdmin();
      expect(proxyAdmin.toLowerCase()).to.equal(
        addresses.ArrakisDAOMultiSig.toLowerCase()
      );
      await expect(
        GasStationProxy.upgradeTo(ethers.constants.AddressZero)
      ).to.be.revertedWith("NOT_AUTHORIZED");
      await GasStationProxy.connect(gelatoMultiSig).upgradeTo(
        ethers.constants.AddressZero
      );

      await expect(
        GasStationProxy.transferProxyAdmin(ethers.constants.AddressZero)
      ).to.be.revertedWith("NOT_AUTHORIZED");
      await GasStationProxy.connect(gelatoMultiSig).transferProxyAdmin(
        ethers.constants.AddressZero
      );

      const newProxyAdmin = await GasStationProxy.proxyAdmin();
      expect(newProxyAdmin).to.equal(ethers.constants.AddressZero);
    });
  });

  after("resets network back to the one in hardhat config", async () => {
    const config = network.config as HardhatNetworkConfig;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (hre as any).reset(config.forking?.url, config.forking?.blockNumber);
  });
});
