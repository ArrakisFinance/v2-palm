import { deployments, getNamedAccounts } from "hardhat";
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
      `Deploying Terms to ${hre.network.name}. Hit ctrl + c to abort`
    );
    await sleep(10000);
  }

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const addresses = getAddressBookByNetwork("matic");

  await deploy("Terms", {
    from: deployer,
    proxy: {
      proxyContract: "EIP173Proxy",
      owner: addresses.ArrakisDAOMultiSig,
      execute: {
        init: {
          methodName: "initialize",
          args: [
            addresses.ArrakisDAOMultiSig,
            addresses.ArrakisDAOMultiSig,
            100,
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
    hre.network.name === "optimism";

  return shouldSkip ? true : false;
};

func.tags = ["Terms"];
