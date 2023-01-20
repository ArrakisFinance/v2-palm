import { deployments, getNamedAccounts } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getAddressBookByNetwork } from "../src";
import { DeployFunction } from "hardhat-deploy/types";
import { sleep } from "../src/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  if (
    hre.network.name === "mainnet" ||
    hre.network.name === "goerli" ||
    hre.network.name === "polygon" ||
    hre.network.name === "optimism" ||
    hre.network.name === "arbitrum"
  ) {
    console.log(
      `Deploying PALMTerms to ${hre.network.name}. Hit ctrl + c to abort`
    );
    await sleep(10000);
  }

  const { deploy } = deployments;
  const { deployer, arrakisDaoAdmin, arrakisDaoOwner } =
    await getNamedAccounts();

  const addresses = getAddressBookByNetwork(hre.network.name);

  await deploy("PALMTerms", {
    from: deployer,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: arrakisDaoAdmin,
      execute: {
        init: {
          methodName: "initialize",
          args: [
            arrakisDaoOwner,
            arrakisDaoOwner,
            25,
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
    hre.network.name === "arbitrum";

  return shouldSkip ? true : false;
};

func.tags = ["PALMTerms"];
