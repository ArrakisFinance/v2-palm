import { deployments, getNamedAccounts, ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getAddressBookByNetwork } from "../src/config";
import { DeployFunction } from "hardhat-deploy/types";
import { sleep } from "../src/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  if (
    hre.network.name === "mainnet" ||
    hre.network.name === "matic" ||
    hre.network.name === "optimism"
  ) {
    console.log(
      `Deploying PALMManager to ${hre.network.name}. Hit ctrl + c to abort`
    );
    await sleep(10000);
  }

  const { deploy } = deployments;
  const { deployer, arrakisDaoAdmin, arrakisDaoOwner } =
    await getNamedAccounts();

  const addresses = getAddressBookByNetwork("matic");

  const oneQuarter = (60 * 60 * 24 * 365) / 4;

  await deploy("PALMManager", {
    from: deployer,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: arrakisDaoAdmin,
      execute: {
        init: {
          methodName: "initialize",
          args: [arrakisDaoOwner],
        },
      },
    },
    args: [
      addresses.Gelato,
      4750,
      (await ethers.getContract("PALMTerms")).address,
      oneQuarter,
    ],
    log: hre.network.name !== "hardhat" ? true : false,
  });
};

export default func;

func.skip = async (hre: HardhatRuntimeEnvironment) => {
  const shouldSkip =
    hre.network.name === "mainnet" ||
    hre.network.name === "goerli" ||
    hre.network.name === "matic" ||
    hre.network.name === "optimism";

  return shouldSkip ? true : false;
};

func.tags = ["PALMManager"];
func.dependencies = ["PALMTerms"];
