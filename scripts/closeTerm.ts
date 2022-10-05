import hre, { ethers } from "hardhat";
import { PALMTerms } from "../typechain";

// #region input values.
const vault = "0x34645df7b69c9944c3406d96bba31f1d023d6732";
const to = "0xF953c3d475dc0a9877329F71e2CE3d2519a519A2";
const newOwner = "0xF953c3d475dc0a9877329F71e2CE3d2519a519A2";
const newManager = "0xF953c3d475dc0a9877329F71e2CE3d2519a519A2";

// #endregion input values.

async function main() {
  if (hre.network.name != "matic") return;
  const [signer] = await ethers.getSigners();

  const terms = (await ethers.getContract("PALMTerms", signer)) as PALMTerms;

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
