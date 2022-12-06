import { HardhatUserConfig, extendEnvironment } from "hardhat/config";

// PLUGINS
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-deploy";
import "@nomiclabs/hardhat-etherscan";
import "solidity-coverage";

// Process Env Variables
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

const PK = process.env.PK;
const TEST_PK = process.env.TEST_PK;
const ALCHEMY_ID = process.env.ALCHEMY_ID;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",

  // hardhat-deploy
  namedAccounts: {
    deployer: {
      default: 0,
    },
    arrakisDaoAdmin: {
      default: 1,
      matic: "0xd06a7cc1a162fDfB515595A2eC1c47B75743C381",
      mainnet: "0xb9229ea965FC84f21b63791efC643b2c7ffB77Be",
    },
    arrakisDaoOwner: {
      default: 2,
      matic: "0xDEb4C33D5C3E7e32F55a9D6336FE06010E40E3AB",
      mainnet: "0x5108EF86cF493905BcD35A3736e4B46DeCD7de58",
    },
  },

  networks: {
    hardhat: {
      forking: {
        url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`,
        blockNumber: 36468447,
      },
    },

    mainnet: {
      accounts: PK ? [PK] : [],
      chainId: 1,
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_ID}`,
    },

    matic: {
      accounts: PK ? [PK] : [],
      chainId: 137,
      url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`,
    },

    goerli: {
      accounts: TEST_PK ? [TEST_PK] : [],
      chainId: 5,
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_ID}`,
    },

    optimism: {
      accounts: PK ? [PK] : [],
      chainId: 10,
      url: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`,
    },
  },

  etherscan: {
    apiKey: ETHERSCAN_API_KEY ? ETHERSCAN_API_KEY : "",
  },

  solidity: {
    compilers: [
      {
        version: "0.8.13",
        settings: {
          optimizer: { enabled: true, runs: 999999 },
        },
      },
      {
        version: "0.8.7",
        settings: {
          optimizer: { enabled: true, runs: 999999 },
        },
      },
      {
        version: "0.6.11",
        settings: {
          optimizer: { enabled: true, runs: 999999 },
        },
      },
    ],
  },

  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

extendEnvironment((hre) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (hre as any).reset = async (
    jsonRpcUrl: string,
    blockNumber: number
  ): Promise<void> => {
    await hre.network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: jsonRpcUrl,
            blockNumber: blockNumber,
          },
        },
      ],
    });
  };
});

export default config;
