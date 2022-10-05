// import hre = require("hardhat");
// import { PALMTerms } from "../typechain";

// import DefaultProxyAdmin from "./../deployments/matic/DefaultProxyAdmin.json";
// import PALMTerms_Proxy from "./../deployments/matic/PALMTerms_Proxy.json";

// const { ethers, deployments } = hre;

// describe("Backend Test", async function () {
//   this.timeout(0);

//   before("Setting up for V2 functions integration test", async function () {
//     if (hre.network.name !== "hardhat") {
//       console.error("Test Suite is meant to be run on hardhat only");
//       process.exit(1);
//     }

//     await deployments.fixture();

//     const [user] = await ethers.getSigners();

//     const ilanAddress = "0x8310b3a215Fe13a5CAc2291eD9b0e4825dBcc7f2";

//     await hre.network.provider.request({
//       method: "hardhat_impersonateAccount",
//       params: [ilanAddress],
//     });

//     const ilan = await ethers.getSigner(ilanAddress);

//     const termsAddress = "0x631fCEC46c08C73AAeB765bF6362A37778D2C2c9";
//     const terms = (await ethers.getContractAt(
//       "PALMTerms",
//       termsAddress,
//       ilan
//     )) as PALMTerms;

//     const defaultProxyAdmin = new ethers.Contract(
//       "0xa4c9DCfCA6186303219Bb3A96846A7Bdd9a4AFd3",
//       DefaultProxyAdmin.abi,
//       ilan
//     );

//     const vaultAddress = "0xf103111ccede83bce16fa0795bb5d81a744d99bc";

//     const amount0 = ethers.utils.parseUnits("2", 18);
//     const amount1 = ethers.utils.parseUnits("0.001", 18);

//     const token0Address = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"; // wmatic
//     const token1Adress = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"; //weth
//     const token0 = await ethers.getContractAt("ERC20", token0Address, ilan);
//     const token1 = await ethers.getContractAt("ERC20", token1Adress, ilan);

//     const balance0 = await token0.balanceOf(ilanAddress);
//     const balance1 = await token1.balanceOf(ilanAddress);
//     console.log("ilan - balance0: ", balance0.toString());
//     console.log("ilan - balance1: ", balance1.toString());

//     const token0allowance = await token0.allowance(ilanAddress, termsAddress);
//     const token1allowance = await token1.allowance(ilanAddress, termsAddress);
//     console.log("token0allowance: ", token0allowance.toString());
//     console.log("token1allowance: ", token1allowance.toString());
//     console.log("amount0: ", amount0.toString());
//     console.log("amount1: ", amount1.toString());

//     const increaseBalance = {
//       vault: vaultAddress,
//       projectTknIsTknZero: true,
//       amount0: amount0.toString(),
//       amount1: amount1.toString(),
//     };

//     // increase liquidity
//     await terms.increaseLiquidity(
//       increaseBalance,
//       ethers.utils.parseUnits("1000", 18)
//     );

//     await hre.network.provider.request({
//       method: "hardhat_impersonateAccount",
//       params: ["0xDEb4C33D5C3E7e32F55a9D6336FE06010E40E3AB"],
//     });

//     const multi = await ethers.getSigner(
//       "0xDEb4C33D5C3E7e32F55a9D6336FE06010E40E3AB"
//     );

//     await user.sendTransaction({
//       to: "0xDEb4C33D5C3E7e32F55a9D6336FE06010E40E3AB",
//       value: ethers.utils.parseEther("10"),
//     });

//     await defaultProxyAdmin
//       .connect(multi)
//       .changeProxyAdmin(
//         terms.address,
//         "0xDEb4C33D5C3E7e32F55a9D6336FE06010E40E3AB"
//       );

//     const termsProxy = new ethers.Contract(
//       terms.address,
//       PALMTerms_Proxy.abi,
//       multi
//     );

//     await termsProxy.upgradeTo(
//       (
//         await ethers.getContract("PALMManager", ilan)
//       ).address
//     );

//     // await terms.closeTerm(vaultAddress, ilanAddress, ilanAddress, ilanAddress);
//   });

//   it("#0: increase Balance", async () => {});
// });
