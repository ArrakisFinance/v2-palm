import hre, { ethers } from "hardhat";
import { Terms } from "../typechain";

async function main() {
  if (hre.network.name != "matic") return;
  const [signer] = await ethers.getSigners();

  const terms = (await ethers.getContract("Terms", signer)) as Terms;

  const vaultAddress = "0x303Afcd07494dc58689F002131b6046d0645BA50";
  const stratData = {
    projectTknIsTknZero: true,
    allocationBps: 250,
    weightLeftRange: 2,
    weightRightRange: 3,
    numberLeftRanges: 2,
    numberRightRanges: 2,
    sizeLeftRanges: 1,
    sizeRightRanges: 1,
    feeTiers: [10000],
    strategy: ethers.utils.solidityKeccak256(["string"], ["BOOTSTRAPPING"]),
    version: 0.1,
  };
  const dataFormatted = ethers.utils.toUtf8Bytes(JSON.stringify(stratData));

  const data = terms.interface.encodeFunctionData("setVaultData", [
    vaultAddress,
    dataFormatted,
  ]);

  console.log(data);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
