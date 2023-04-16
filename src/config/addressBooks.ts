import { getAddresses, Addresses } from "@arrakisfi/v2-core";

/* eslint-disable @typescript-eslint/naming-convention */
export interface PALMAddresses extends Addresses {
  Gelato: string;
  UniswapV3Amount: string;
  PALMTerms: string;
  PALMManager: string;
}
/* eslint-enable @typescript-eslint/naming-convention */

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getAddressBookByNetwork = (network: string): PALMAddresses => {
  switch (network) {
    case "optimism":
      // eslint-disable-next-line no-case-declarations
      const optimismAddresses: Addresses = getAddresses("optimism");

      // eslint-disable-next-line no-case-declarations
      const optimismPalm: PALMAddresses = {
        ...optimismAddresses,
        Gelato: "0x01051113D81D7d6DA508462F2ad6d7fD96cF42Ef",
        UniswapV3Amount: "",
        PALMTerms: "",
        PALMManager: "",
      };

      return optimismPalm;

    case "mainnet":
      // eslint-disable-next-line no-case-declarations
      const mainnetAddresses: Addresses = getAddresses("mainnet");

      // eslint-disable-next-line no-case-declarations
      const mainnetPalm: PALMAddresses = {
        ...mainnetAddresses,
        Gelato: "0x3CACa7b48D0573D793d3b0279b5F0029180E83b6",
        UniswapV3Amount: "",
        PALMTerms: "",
        PALMManager: "",
      };

      return mainnetPalm;

    case "polygon":
      // eslint-disable-next-line no-case-declarations
      const polygonAddresses: Addresses = getAddresses("polygon");

      // eslint-disable-next-line no-case-declarations
      const polygonPalm: PALMAddresses = {
        ...polygonAddresses,
        Gelato: "0x7598e84B2E114AB62CAB288CE5f7d5f6bad35BbA",
        UniswapV3Amount: "",
        PALMTerms: "",
        PALMManager: "",
      };

      return polygonPalm;

    case "goerli":
      // eslint-disable-next-line no-case-declarations
      const goerliAddresses: Addresses = getAddresses("goerli");

      // eslint-disable-next-line no-case-declarations
      const goerliPalm: PALMAddresses = {
        ...goerliAddresses,
        Gelato: "0x683913B3A32ada4F8100458A3E1675425BdAa7DF",
        UniswapV3Amount: "",
        PALMTerms: "",
        PALMManager: "",
      };

      return goerliPalm;

    case "arbitrum":
      // eslint-disable-next-line no-case-declarations
      const arbitrumAddresses: Addresses = getAddresses("arbitrum");

      // eslint-disable-next-line no-case-declarations
      const arbitrumPalm: PALMAddresses = {
        ...arbitrumAddresses,
        Gelato: "0x4775aF8FEf4809fE10bf05867d2b038a4b5B2146",
        UniswapV3Amount: "",
        PALMTerms: "",
        PALMManager: "",
      };

      return arbitrumPalm;

    case "binance":
      // eslint-disable-next-line no-case-declarations
      // eslint-disable-next-line no-case-declarations
      const binancePalm: PALMAddresses = {
        UniswapV3Factory: "0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7",
        SwapRouter: "",
        WETH: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
        WMATIC: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
        USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        ArrakisV2Implementation: "0xAf0f96e8702cB1b8160e43c8c020C608cD7B134d",
        ArrakisV2Beacon: "0x1D91F6D917ec51dE53A5789c34fFF777a58759B6",
        ArrakisV2Factory: "0xECb8Ffcb2369EF188A082a662F496126f66c8288",
        ArrakisV2Helper: "0x07d2CeB4869DFE17e8D48c92A71eDC3AE564449f",
        ArrakisV2Resolver: "0xb11bb8ad710579Cc5ED16b1C8587808109c1f193",
        Gelato: "0x7C5c4Af1618220C090A6863175de47afb20fa9Df",
        UniswapV3Amount: "",
        PALMTerms: "",
        PALMManager: "",
      };

      return binancePalm;
    case "hardhat":
      // eslint-disable-next-line no-case-declarations
      const hardhatAddresses: Addresses = getAddresses("hardhat");

      // eslint-disable-next-line no-case-declarations
      const hardhatPalm: PALMAddresses = {
        ...hardhatAddresses,
        Gelato: "0x7598e84B2E114AB62CAB288CE5f7d5f6bad35BbA",
        UniswapV3Amount: "0xcCd824d1Baaeb6d6E2B6De867409564F7B8859d2",
        PALMTerms: "",
        PALMManager: "",
      };

      return hardhatPalm;

    default: {
      throw new Error(`addressBooks: network: ${network} not supported`);
    }
  }
};
