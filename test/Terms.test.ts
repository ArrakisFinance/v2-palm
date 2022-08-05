// import { expect } from "chai";
import { BigNumberish, Signer } from "ethers";
import hre = require("hardhat");
import { Terms, BaseToken, ProjectToken } from "../typechain";

const { ethers, deployments } = hre;

describe("Test Terms Contract", function () {
  this.timeout(0);

  let terms: Terms;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  let baseToken: BaseToken;
  let projectToken: ProjectToken;
  let signer: Signer;

  before("sets up environment", async function () {
    // VaultV2 is currently only on polygon/matic
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    await deployments.fixture();

    terms = (await ethers.getContract("Terms")) as Terms;
    baseToken = (await ethers.getContract("BaseToken")) as BaseToken;
    projectToken = (await ethers.getContract("ProjectToken")) as ProjectToken;

    [signer] = await ethers.getSigners();
  });

  describe("Terms Unit Tests", async () => {
    it("setup a Vault", async () => {
      await projectToken.approve(
        terms.address,
        ethers.utils.parseUnits("1", 19)
      );
      await terms.setupVault(
        {
          feeTiers: [] as BigNumberish[],
          baseToken: baseToken.address,
          projectToken: projectToken.address,
          owner: await signer.getAddress(),
          operators: [],
          init0: ethers.constants.Zero,
          init1: ethers.constants.Zero,
          maxTwapDeviation: 0,
          twapDuration: 0,
          maxSlippage: 0,
          projectTokenAllocation: ethers.utils.parseUnits("1", 19),
          baseTokenAllocation: 0,
        },
        ethers.constants.One
      );
    });
  });
});
