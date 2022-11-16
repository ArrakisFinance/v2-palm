/* eslint-disable @typescript-eslint/naming-convention */
export interface Addresses {
  Gelato: string;
  UniswapV3Factory: string;
  ArrakisV2Resolver: string;
  ArrakisV2Factory: string;
  UniswapV3Amount: string;
  PALMTerms: string;
  DevMultisig: string;
  ProxyMultisig: string;
  UniswapV3SwapRouter: string;
}
/* eslint-enable @typescript-eslint/naming-convention */

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getAddressBookByNetwork = (network: string) => {
  switch (network) {
    case "optimism":
      return {
        Gelato: "",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "",
        ArrakisV2Factory: "",
        UniswapV3Amount: "",
        PALMTerms: "",
        DevMultisig: "",
        ProxyMultisig: "",
        UniswapV3SwapRouter: "",
      };

    case "mainnet":
      return {
        Gelato: "0x3CACa7b48D0573D793d3b0279b5F0029180E83b6",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "0x7679028D2135c2cD622D71c891941359aC8339c7",
        ArrakisV2Factory: "0xd9a23005bbe1562856346864BAeb6Ec4d37044Ec",
        UniswapV3Amount: "",
        PALMTerms: "",
        DevMultisig: "0x5108EF86cF493905BcD35A3736e4B46DeCD7de58",
        ProxyMultisig: "0xb9229ea965FC84f21b63791efC643b2c7ffB77Be",
        UniswapV3SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      };

    case "matic":
      return {
        Gelato: "0x7598e84B2E114AB62CAB288CE5f7d5f6bad35BbA",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "0xce3bE976c7c218C15553a4e258CF8734E64A7296",
        ArrakisV2Factory: "0xf5973723eb067F90276d9f9bE80F7C9De67d22af",
        UniswapV3Amount: "0xcCd824d1Baaeb6d6E2B6De867409564F7B8859d2",
        PALMTerms: "0x48C58178121cBD28833149cb808ce045497A8c4d",
        DevMultisig: "0xDEb4C33D5C3E7e32F55a9D6336FE06010E40E3AB",
        ProxyMultisig: "0xd06a7cc1a162fDfB515595A2eC1c47B75743C381",
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
        DevMultisig: "",
        ProxyMultisig: "",
        UniswapV3SwapRouter: "",
      };
    case "hardhat":
      return {
        Gelato: "0x7598e84B2E114AB62CAB288CE5f7d5f6bad35BbA",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "0xce3bE976c7c218C15553a4e258CF8734E64A7296",
        ArrakisV2Factory: "0xf5973723eb067F90276d9f9bE80F7C9De67d22af",
        UniswapV3Amount: "0xcCd824d1Baaeb6d6E2B6De867409564F7B8859d2",
        PALMTerms: "",
        DevMultisig: "0x5108EF86cF493905BcD35A3736e4B46DeCD7de58",
        ProxyMultisig: "0xb9229ea965FC84f21b63791efC643b2c7ffB77Be",
        UniswapV3SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      };

    default: {
      throw new Error(`addressBooks: network: ${network} not supported`);
    }
  }
};
