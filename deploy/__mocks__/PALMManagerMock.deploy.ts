import { deployments, getNamedAccounts } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getAddressBookByNetwork } from "../../src";
import { DeployFunction } from "hardhat-deploy/types";
import { sleep } from "../../src/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  if (
    hre.network.name === "mainnet" ||
    hre.network.name === "goerli" ||
    hre.network.name === "polygon" ||
    hre.network.name === "optimism" ||
    hre.network.name === "arbitrum" ||
    hre.network.name === "binance"
  ) {
    console.log(
      `Deploying PALMManagerMock to ${hre.network.name}. Hit ctrl + c to abort`
    );
    await sleep(10000);
  }

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const addresses = getAddressBookByNetwork(hre.network.name);

  const oneYear = 60 * 60 * 24 * 365;

  await deploy("PALMManagerMock", {
    from: deployer,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      viaAdminContract: "TempProxyAdmin",
      execute: {
        init: {
          methodName: "initialize",
          args: [deployer, addresses.Gelato],
        },
      },
    },
    args: [deployer, oneYear, 4750],
    log: hre.network.name !== "hardhat" ? true : false,
  });
};

export default func;

func.skip = async (hre: HardhatRuntimeEnvironment) => {
  const shouldSkip =
    hre.network.name === "mainnet" ||
    hre.network.name === "goerli" ||
    hre.network.name === "polygon" ||
    hre.network.name === "optimism" ||
    hre.network.name === "arbitrum" ||
    hre.network.name === "binance";

  return shouldSkip ? true : false;
};

func.tags = ["PALMManagerMock"];
func.dependencies = ["TempProxyAdmin"];
