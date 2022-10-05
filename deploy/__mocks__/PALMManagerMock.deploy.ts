import { deployments, getNamedAccounts } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getAddressBookByNetwork } from "../../src/config";
import { DeployFunction } from "hardhat-deploy/types";
import { sleep } from "../../src/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  if (
    hre.network.name === "mainnet" ||
    hre.network.name === "matic" ||
    hre.network.name === "optimism"
  ) {
    console.log(
      `Deploying PALMManagerMock to ${hre.network.name}. Hit ctrl + c to abort`
    );
    await sleep(10000);
  }

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const addresses = getAddressBookByNetwork("matic");

  const oneYear = 60 * 60 * 24 * 365;

  await deploy("PALMManagerMock", {
    from: deployer,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      viaAdminContract: "TempProxyAdmin",
      execute: {
        init: {
          methodName: "initialize",
          args: [deployer],
        },
      },
    },
    args: [addresses.Gelato, 100, deployer, oneYear],
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

func.tags = ["PALMManagerMock"];
func.dependencies = ["TempProxyAdmin"];
