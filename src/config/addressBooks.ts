import { getAddresses, Addresses } from "@arrakisfi/v2-core";
/* eslint-disable @typescript-eslint/naming-convention */

export interface PalmAddresses extends Addresses {
  Gelato: string;
  UniswapV3Amount: string;
  PALMTerms: string;
  PALMManager: string;
}
/* eslint-enable @typescript-eslint/naming-convention */

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getAddressBookByNetwork = (network: string): PalmAddresses => {
  switch (network) {
    case "optimism":
      // eslint-disable-next-line no-case-declarations
      const optimismAddresses: Addresses = getAddresses("optimism");

      // eslint-disable-next-line no-case-declarations
      const optimismPalm: PalmAddresses = {
        ...optimismAddresses,
        Gelato: "0x01051113D81D7d6DA508462F2ad6d7fD96cF42Ef",
        UniswapV3Amount: "",
        PALMTerms: "0xB041f628e961598af9874BCf30CC865f67fad3EE",
        PALMManager: "0x0a7D53FF9C56a3bD6A4A369f14ba3Ba523B3013E",
      };

      return optimismPalm;

    case "mainnet":
      // eslint-disable-next-line no-case-declarations
      const mainnetAddresses: Addresses = getAddresses("mainnet");

      // eslint-disable-next-line no-case-declarations
      const mainnetPalm: PalmAddresses = {
        ...mainnetAddresses,
        Gelato: "0x3CACa7b48D0573D793d3b0279b5F0029180E83b6",
        UniswapV3Amount: "",
        PALMTerms: "0xB041f628e961598af9874BCf30CC865f67fad3EE",
        PALMManager: "0x0a7D53FF9C56a3bD6A4A369f14ba3Ba523B3013E",
      };

      return mainnetPalm;

    case "polygon":
      // eslint-disable-next-line no-case-declarations
      const polygonAddresses: Addresses = getAddresses("goerli");

      // eslint-disable-next-line no-case-declarations
      const polygonPalm: PalmAddresses = {
        ...polygonAddresses,
        Gelato: "0x7598e84B2E114AB62CAB288CE5f7d5f6bad35BbA",
        UniswapV3Amount: "0xcCd824d1Baaeb6d6E2B6De867409564F7B8859d2",
        PALMTerms: "0xB041f628e961598af9874BCf30CC865f67fad3EE",
        PALMManager: "0x0a7D53FF9C56a3bD6A4A369f14ba3Ba523B3013E",
      };

      return polygonPalm;

    case "goerli":
      // eslint-disable-next-line no-case-declarations
      const goerliAddresses: Addresses = getAddresses("goerli");

      // eslint-disable-next-line no-case-declarations
      const goerliPalm: PalmAddresses = {
        ...goerliAddresses,
        Gelato: "0x683913B3A32ada4F8100458A3E1675425BdAa7DF",
        UniswapV3Amount: "",
        PALMTerms: "0xB041f628e961598af9874BCf30CC865f67fad3EE",
        PALMManager: "0x0a7D53FF9C56a3bD6A4A369f14ba3Ba523B3013E",
      };

      return goerliPalm;

    case "arbitrum":
      // eslint-disable-next-line no-case-declarations
      const arbitrumAddresses: Addresses = getAddresses("arbitrum");

      // eslint-disable-next-line no-case-declarations
      const arbitrumPalm: PalmAddresses = {
        ...arbitrumAddresses,
        Gelato: "0x4775aF8FEf4809fE10bf05867d2b038a4b5B2146",
        UniswapV3Amount: "",
        PALMTerms: "0xB041f628e961598af9874BCf30CC865f67fad3EE",
        PALMManager: "0x0a7D53FF9C56a3bD6A4A369f14ba3Ba523B3013E",
      };

      return arbitrumPalm;

    case "hardhat":
      // eslint-disable-next-line no-case-declarations
      const addresses: Addresses = getAddresses("hardhat");

      // eslint-disable-next-line no-case-declarations
      const palmAddresses: PalmAddresses = {
        ...addresses,
        Gelato: "0x7598e84B2E114AB62CAB288CE5f7d5f6bad35BbA",
        UniswapV3Amount: "0xcCd824d1Baaeb6d6E2B6De867409564F7B8859d2",
        PALMTerms: "",
        PALMManager: "",
      };

      return palmAddresses;

    default: {
      throw new Error(`addressBooks: network: ${network} not supported`);
    }
  }
};
