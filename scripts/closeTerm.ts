import hre, { ethers } from "hardhat";
import { PALMTerms } from "../typechain";

// #region input values.
const vault = "0xa03ac44db97159490e17c30bca5a66459ec22121";
const to = "0x3cd4b212a1e3e45fc7b8f0474ed8de96aa752075";
const newOwner = "0x3cd4b212a1e3e45fc7b8f0474ed8de96aa752075";
const newManager = "0x3cd4b212a1e3e45fc7b8f0474ed8de96aa752075";

// #endregion input values.

async function main() {
  if (hre.network.name != "matic") return;
  const [signer] = await ethers.getSigners();

  const terms = (await ethers.getContractAt(
    "PALMTerms",
    "0x631fcec46c08c73aaeb765bf6362a37778d2c2c9",
    signer
  )) as PALMTerms;

  await signer.sendTransaction({
    to: terms.address,
    data: terms.interface.encodeFunctionData("closeTerm", [
      vault,
      to,
      newOwner,
      newManager,
    ]),
  });

  console.log("SUCCESS");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
