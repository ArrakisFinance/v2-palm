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
      const binanceAddresses: Addresses = getAddresses("binance");

      // eslint-disable-next-line no-case-declarations
      const binancePalm: PALMAddresses = {
        ...binanceAddresses,
        Gelato: "0x7C5c4Af1618220C090A6863175de47afb20fa9Df",
        UniswapV3Amount: "",
        PALMTerms: "",
        PALMManager: "",
      };

      return binancePalm;
    case "sepolia": // TODO: use v2-core lib once updated
      // eslint-disable-next-line no-case-declarations
      const sepoliaAddresses: PALMAddresses = {
        UniswapV3Factory: "0x0227628f3F023bb0B980b67D528571c95c6DaC1c",
        SwapRouter: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
        WETH: "",
        WMATIC: "",
        USDC: "",
        ArrakisV2Implementation: "",
        ArrakisV2Beacon: "0x1D91F6D917ec51dE53A5789c34fFF777a58759B6",
        ArrakisV2Factory: "0xECb8Ffcb2369EF188A082a662F496126f66c8288",
        ArrakisV2Helper: "",
        ArrakisV2Resolver: "0x535C5fDf31477f799366DF6E4899a12A801cC7b8",
        Gelato: "0x7C5c4Af1618220C090A6863175de47afb20fa9Df",
        UniswapV3Amount: "",
        PALMTerms: "",
        PALMManager: "",
      };

      return sepoliaAddresses;
    case "base": // TODO: use v2-core lib once updated
      // eslint-disable-next-line no-case-declarations
      const baseAddresses: PALMAddresses = {
        UniswapV3Factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
        SwapRouter: "0x2626664c2603336E57B271c5C0b26F421741e481",
        WETH: "",
        WMATIC: "",
        USDC: "",
        ArrakisV2Implementation: "",
        ArrakisV2Beacon: "0x1D91F6D917ec51dE53A5789c34fFF777a58759B6",
        ArrakisV2Factory: "0xECb8Ffcb2369EF188A082a662F496126f66c8288",
        ArrakisV2Helper: "",
        ArrakisV2Resolver: "0x535C5fDf31477f799366DF6E4899a12A801cC7b8",
        Gelato: "0x08EFb6D315c7e74C39620c9AAEA289730f43a429",
        UniswapV3Amount: "",
        PALMTerms: "",
        PALMManager: "",
      };

      return baseAddresses;
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
