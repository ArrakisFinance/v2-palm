/* eslint-disable @typescript-eslint/naming-convention */
export interface Addresses {
  Gelato: string;
  UniswapV3Factory: string;
  ArrakisV2Resolver: string;
  ArrakisV2Factory: string;
  UniswapV3Amount: string;
  PALMTerms: string;
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
        ArrakisV2Resolver: "",
        ArrakisV2Factory: "",
        UniswapV3Amount: "",
        PALMTerms: "",
        UniswapV3SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      };

    case "mainnet":
      return {
        Gelato: "0x3CACa7b48D0573D793d3b0279b5F0029180E83b6",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "0x7679028D2135c2cD622D71c891941359aC8339c7",
        ArrakisV2Factory: "0xd9a23005bbe1562856346864BAeb6Ec4d37044Ec",
        UniswapV3Amount: "",
        PALMTerms: "",
        UniswapV3SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      };

    case "matic":
      return {
        Gelato: "0x7598e84B2E114AB62CAB288CE5f7d5f6bad35BbA",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "0xddd3B69401e780e3311A6D6c4643Aa791e25137C",
        ArrakisV2Factory: "0x32888bb636Cefe86B812adAfd33C05792d9A0e34",
        UniswapV3Amount: "0xcCd824d1Baaeb6d6E2B6De867409564F7B8859d2",
        PALMTerms: "0x48C58178121cBD28833149cb808ce045497A8c4d",
        UniswapV3SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      };

    case "goerli":
      return {
        Gelato: "0x683913B3A32ada4F8100458A3E1675425BdAa7DF",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "",
        ArrakisV2Factory: "",
        UniswapV3Amount: "",
        PALMTerms: "",
        UniswapV3SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      };
    case "arbitrum":
      return {
        Gelato: "0x4775aF8FEf4809fE10bf05867d2b038a4b5B2146",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "",
        ArrakisV2Factory: "",
        UniswapV3Amount: "",
        PALMTerms: "",
        UniswapV3SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      };
    case "hardhat":
      return {
        Gelato: "0x7598e84B2E114AB62CAB288CE5f7d5f6bad35BbA",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "0xddd3B69401e780e3311A6D6c4643Aa791e25137C",
        ArrakisV2Factory: "0x32888bb636Cefe86B812adAfd33C05792d9A0e34",
        UniswapV3Amount: "0xcCd824d1Baaeb6d6E2B6De867409564F7B8859d2",
        PALMTerms: "",
        UniswapV3SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      };

    default: {
      throw new Error(`addressBooks: network: ${network} not supported`);
    }
  }
};
