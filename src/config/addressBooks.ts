/* eslint-disable @typescript-eslint/naming-convention */
export interface Addresses {
  Gelato: string;
  UniswapV3Factory: string;
  ArrakisV2Resolver: string;
  ArrakisV2Factory: string;
  UniswapV3Amount: string;
  PALMTerms: string;
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
      };

    case "mainnet":
      return {
        Gelato: "0x3CACa7b48D0573D793d3b0279b5F0029180E83b6",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "",
        ArrakisV2Factory: "",
        UniswapV3Amount: "",
        PALMTerms: "",
      };

    case "matic":
      return {
        Gelato: "0x7598e84B2E114AB62CAB288CE5f7d5f6bad35BbA",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "0xce3bE976c7c218C15553a4e258CF8734E64A7296",
        ArrakisV2Factory: "0xf5973723eb067F90276d9f9bE80F7C9De67d22af",
        UniswapV3Amount: "0xcCd824d1Baaeb6d6E2B6De867409564F7B8859d2",
        PALMTerms: "0x631fCEC46c08C73AAeB765bF6362A37778D2C2c9",
      };

    case "goerli":
      return {
        Gelato: "0x683913B3A32ada4F8100458A3E1675425BdAa7DF",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "",
        ArrakisV2Factory: "",
        UniswapV3Amount: "",
        PALMTerms: "",
      };
    case "hardhat":
      return {
        Gelato: "0x7598e84B2E114AB62CAB288CE5f7d5f6bad35BbA",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Resolver: "0xce3bE976c7c218C15553a4e258CF8734E64A7296",
        ArrakisV2Factory: "0xf5973723eb067F90276d9f9bE80F7C9De67d22af",
        UniswapV3Amount: "0xcCd824d1Baaeb6d6E2B6De867409564F7B8859d2",
        PALMTerms: "0x631fCEC46c08C73AAeB765bF6362A37778D2C2c9",
      };

    default: {
      throw new Error(`addressBooks: network: ${network} not supported`);
    }
  }
};
