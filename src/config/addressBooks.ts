/* eslint-disable @typescript-eslint/naming-convention */
export interface Addresses {
  ArrakisDAOMultiSig: string;
  Gelato: string;
  GelatoOps: string;
  FeeDistToken: string;
  UniswapV3SwapRouter02: string;
  UniswapV2Router02: string;
  UniswapV3Factory: string;
  Weth: string;
  GaugeImplementation: string;
  ArrakisV2Resolver: string;
  ArrakisV2Factory: string;
  UniswapV3Amount: string;
  Terms: string;
}
/* eslint-enable @typescript-eslint/naming-convention */

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getAddressBookByNetwork = (network: string) => {
  switch (network) {
    case "optimism":
      return {
        ArrakisDAOMultiSig: "0xAa2E0c5c85ACb7717e58060AB3c96d2B184EE07C",
        Gelato: "",
        GelatoOps: "",
        FeeDistToken: "",
        UniswapV3SwapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
        UniswapV2Router02: "",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        Weth: "",
        GaugeImplementation: "",
        ArrakisV2Resolver: "",
        ArrakisV2Factory: "",
        UniswapV3Amount: "",
        Terms: "",
      };

    case "mainnet":
      return {
        ArrakisDAOMultiSig: "0xAa2E0c5c85ACb7717e58060AB3c96d2B184EE07C",
        Gelato: "0x3CACa7b48D0573D793d3b0279b5F0029180E83b6",
        GelatoOps: "0xB3f5503f93d5Ef84b06993a1975B9D21B962892F",
        FeeDistToken: "0xa6c49FD13E50a30C65E6C8480aADA132011D0613",
        FeeDistributor: "0x0000000000000000000000000000000000000001",
        UniswapV3SwapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
        UniswapV2Router02: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        Weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        GaugeImplementation: "",
        ArrakisV2Resolver: "",
        ArrakisV2Factory: "",
        UniswapV3Amount: "",
        Terms: "",
      };

    case "matic":
      return {
        ArrakisDAOMultiSig: "0xd59cc08a65130cd046b83908dff77b434e38508e",
        Gelato: "0x7598e84B2E114AB62CAB288CE5f7d5f6bad35BbA",
        GelatoOps: "0x527a819db1eb0e34426297b03bae11F2f8B3A19E",
        FeeDistToken: "",
        FeeDistributor: "",
        UniswapV3SwapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
        UniswapV2Router02: "",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        Weth: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
        GaugeImplementation: "",
        ArrakisV2Resolver: "0x8092d0C29296d906896e5F45d2f6989eEBb58AC8",
        ArrakisV2Factory: "0xf5973723eb067F90276d9f9bE80F7C9De67d22af",
        UniswapV3Amount: "0xcCd824d1Baaeb6d6E2B6De867409564F7B8859d2",
        Terms: "0x631fCEC46c08C73AAeB765bF6362A37778D2C2c9",
      };

    case "goerli":
      return {
        ArrakisDAOMultiSig: "0x2912A06D25CC4D177e5F322BA1c07Cd3F351d1bC",
        FeeDistToken: "",
        FeeDistributor: "",
        UniswapV3SwapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
        UniswapV2Router02: "",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        Weth: "",
        Gelato: "0x683913B3A32ada4F8100458A3E1675425BdAa7DF",
        GelatoOps: "0xc1C6805B857Bef1f412519C4A842522431aFed39",
        GaugeImplementation: "",
        ArrakisV2Resolver: "",
        ArrakisV2Factory: "",
        UniswapV3Amount: "",
        Terms: "",
      };
    case "hardhat":
      return {
        ArrakisDAOMultiSig: "0xd59cc08a65130cd046b83908dff77b434e38508e",
        Gelato: "0x7598e84B2E114AB62CAB288CE5f7d5f6bad35BbA",
        GelatoOps: "0x527a819db1eb0e34426297b03bae11F2f8B3A19E",
        FeeDistToken: "",
        FeeDistributor: "",
        UniswapV3SwapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
        UniswapV2Router02: "",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        Weth: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
        GaugeImplementation: "",
        ArrakisV2Resolver: "0x8092d0C29296d906896e5F45d2f6989eEBb58AC8",
        ArrakisV2Factory: "0xf5973723eb067F90276d9f9bE80F7C9De67d22af",
        UniswapV3Amount: "0xcCd824d1Baaeb6d6E2B6De867409564F7B8859d2",
        Terms: "0x631fCEC46c08C73AAeB765bF6362A37778D2C2c9",
      };

    default: {
      throw new Error(`addressBooks: network: ${network} not supported`);
    }
  }
};
