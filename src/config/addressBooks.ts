// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getAddressBookByNetwork = (network: string) => {
  switch (network) {
    case "optimism":
      return {
        ArrakisDAOMultiSig: "0xAa2E0c5c85ACb7717e58060AB3c96d2B184EE07C",
        Gelato: "",
        GelatoOps: "",
        FeeDistToken: "",
        UniswapV3SwapRouter: "",
        UniswapV2Router02: "",
        Weth: "",
        GaugeImplementation: "",
        VaultV2Resolver: "",
      };

    case "mainnet":
      return {
        ArrakisDAOMultiSig: "0xAa2E0c5c85ACb7717e58060AB3c96d2B184EE07C",
        Gelato: "0x3CACa7b48D0573D793d3b0279b5F0029180E83b6",
        GelatoOps: "0xB3f5503f93d5Ef84b06993a1975B9D21B962892F",
        FeeDistToken: "0xa6c49FD13E50a30C65E6C8480aADA132011D0613",
        FeeDistributor: "0x0000000000000000000000000000000000000001",
        UniswapV3SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UniswapV2Router02: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        Weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        GaugeImplementation: "",
        VaultV2Resolver: "",
      };

    case "matic":
      return {
        ArrakisDAOMultiSig: "0xd59cc08a65130cd046b83908dff77b434e38508e",
        Gelato: "0x7598e84B2E114AB62CAB288CE5f7d5f6bad35BbA",
        GelatoOps: "0x527a819db1eb0e34426297b03bae11F2f8B3A19E",
        FeeDistToken: "",
        FeeDistributor: "",
        UniswapV3SwapRouter: "",
        UniswapV2Router02: "",
        Weth: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
        GaugeImplementation: "",
        VaultV2Resolver: "0xCffEf731Bd2DfCd60Bac06cE9b4CcE5d779357b4",
      };

    case "goerli":
      return {
        ArrakisDAOMultiSig: "0x2912A06D25CC4D177e5F322BA1c07Cd3F351d1bC",
        FeeDistToken: "",
        FeeDistributor: "",
        UniswapV3SwapRouter: "",
        UniswapV2Router02: "",
        Weth: "",
        Gelato: "0x683913B3A32ada4F8100458A3E1675425BdAa7DF",
        GelatoOps: "0xc1C6805B857Bef1f412519C4A842522431aFed39",
        GaugeImplementation: "",
        VaultV2Resolver: "",
      };
    case "hardhat":
      return {
        ArrakisDAOMultiSig: "0xAa2E0c5c85ACb7717e58060AB3c96d2B184EE07C",
        Gelato: "0x3CACa7b48D0573D793d3b0279b5F0029180E83b6",
        GelatoOps: "0xB3f5503f93d5Ef84b06993a1975B9D21B962892F",
        FeeDistToken: "0xa6c49FD13E50a30C65E6C8480aADA132011D0613",
        FeeDistributor: "0x0000000000000000000000000000000000000001",
        UniswapV3SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UniswapV2Router02: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        Weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        GaugeImplementation: "",
        VaultV2Resolver: "",
      };

    default: {
      throw new Error(`addressBooks: network: ${network} not supported`);
    }
  }
};
