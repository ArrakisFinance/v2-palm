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
    hre.network.name === "binance" ||
    hre.network.name === "base" ||
    hre.network.name === "base_goerli" ||
    hre.network.name === "sepolia" ||
    hre.network.name === "gnosis"
  ) {
    console.log(
      `Deploying PALMTermsMock to ${hre.network.name}. Hit ctrl + c to abort`
    );
    await sleep(10000);
  }

  const { deploy } = deployments;
  const { deployer, arrakisDaoOwner } = await getNamedAccounts();

  const addresses = getAddressBookByNetwork(hre.network.name);

  await deploy("PALMTermsMock", {
    from: deployer,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      viaAdminContract: "TempProxyAdmin",
      execute: {
        init: {
          methodName: "initialize",
          args: [
            arrakisDaoOwner,
            arrakisDaoOwner,
            100,
            addresses.ArrakisV2Resolver,
          ],
        },
      },
    },
    args: [addresses.ArrakisV2Factory],
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
    hre.network.name === "binance" ||
    hre.network.name === "base" ||
    hre.network.name === "base_goerli" ||
    hre.network.name === "sepolia" ||
    hre.network.name === "gnosis";

  return shouldSkip ? true : false;
};

func.tags = ["PALMTermsMock"];
func.dependencies = ["TempProxyAdmin"];
