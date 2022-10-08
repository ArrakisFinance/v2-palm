import hre, { ethers } from "hardhat";
import { PALMTerms } from "../typechain";

// #region input values.
const vault = "0x303Afcd07494dc58689F002131b6046d0645BA50";
const to = "0xa3091B9aF492A5366099c881fc4490fb6569f00d";
const newOwner = "0xa3091B9aF492A5366099c881fc4490fb6569f00d";
const newManager = "0xa3091B9aF492A5366099c881fc4490fb6569f00d";

// #endregion input values.

async function main() {
  if (hre.network.name != "matic") return;
  //const [signer] = await ethers.getSigners();

  const terms = (await ethers.getContract("PALMTerms")) as PALMTerms;

  const data = terms.interface.encodeFunctionData("closeTerm", [
    vault,
    to,
    newOwner,
    newManager,
  ]);

  console.log("to: 0x631fcec46c08c73aaeb765bf6362a37778d2c2c9");
  console.log("data:", data);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
