/* eslint-disable @typescript-eslint/naming-convention */
export interface Addresses {
  Gelato: string;
  UniswapV3Factory: string;
  ArrakisV2Resolver: string;
  ArrakisV2Factory: string;
  UniswapV3Amount: string;
  PALMTerms: string;
  PALMManager: string;
  UniswapV3SwapRouter: string;
}
/* eslint-enable @typescript-eslint/naming-convention */

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getAddressBookByNetwork = (network: string) => {
  switch (network) {
    case "optimism":
      return {
        Gelato: "0x01051113D81D7d6DA508462F2ad6d7fD96cF42Ef",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "0xb11bb8ad710579Cc5ED16b1C8587808109c1f193",
        ArrakisV2Factory: "0xECb8Ffcb2369EF188A082a662F496126f66c8288",
        UniswapV3Amount: "",
        PALMTerms: "",
        PALMManager: "",
        UniswapV3SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      };

    case "mainnet":
      return {
        Gelato: "0x3CACa7b48D0573D793d3b0279b5F0029180E83b6",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "0xb11bb8ad710579Cc5ED16b1C8587808109c1f193",
        ArrakisV2Factory: "0xECb8Ffcb2369EF188A082a662F496126f66c8288",
        UniswapV3Amount: "",
        PALMTerms: "",
        PALMManager: "",
        UniswapV3SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      };

    case "polygon":
      return {
        Gelato: "0x7598e84B2E114AB62CAB288CE5f7d5f6bad35BbA",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "0x99997Ffe9ac2223921D8C6D06724cDD87093d662",
        ArrakisV2Factory: "0x7C43C9dbAe45da63F7CACce3fc5a6D14D963481B",
        UniswapV3Amount: "",
        PALMTerms: "",
        PALMManager: "",
        UniswapV3SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      };

    case "goerli":
      return {
        Gelato: "0x683913B3A32ada4F8100458A3E1675425BdAa7DF",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "0xb11bb8ad710579Cc5ED16b1C8587808109c1f193",
        ArrakisV2Factory: "0xECb8Ffcb2369EF188A082a662F496126f66c8288",
        UniswapV3Amount: "",
        PALMTerms: "",
        PALMManager: "",
        UniswapV3SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      };
    case "arbitrum":
      return {
        Gelato: "0x4775aF8FEf4809fE10bf05867d2b038a4b5B2146",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "0xb11bb8ad710579Cc5ED16b1C8587808109c1f193",
        ArrakisV2Factory: "0xECb8Ffcb2369EF188A082a662F496126f66c8288",
        UniswapV3Amount: "",
        PALMTerms: "",
        PALMManager: "",
        UniswapV3SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      };
    case "hardhat":
      return {
        Gelato: "0x7598e84B2E114AB62CAB288CE5f7d5f6bad35BbA",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "0x047aF3804618291339a34aB1e46B4b27037C2Ff4",
        ArrakisV2Factory: "0x32888bb636Cefe86B812adAfd33C05792d9A0e34",
        UniswapV3Amount: "0xcCd824d1Baaeb6d6E2B6De867409564F7B8859d2",
        PALMTerms: "",
        PALMManager: "",
        UniswapV3SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      };

    default: {
      throw new Error(`addressBooks: network: ${network} not supported`);
    }
  }
};
