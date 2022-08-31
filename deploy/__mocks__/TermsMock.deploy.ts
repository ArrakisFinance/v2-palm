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
      `Deploying TermsMock to ${hre.network.name}. Hit ctrl + c to abort`
    );
    await sleep(10000);
  }

  const { deploy } = deployments;
  const { deployer, arrakisDaoOwner } = await getNamedAccounts();

  const addresses = getAddressBookByNetwork("matic");

  await deploy("TermsMock", {
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
    hre.network.name === "matic" ||
    hre.network.name === "optimism";

  return shouldSkip ? true : false;
};

func.tags = ["TermsMock"];
func.dependencies = ["TempProxyAdmin"];
