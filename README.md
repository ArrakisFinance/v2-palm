# V2 PALM

Arrakis PALM Smart Contracts

Built on top of [Arrakis V2](https://github.com/ArrakisFinance/v2-core)

[Read the full developer documentation](https://docs.arrakis.fi)

## About

PALM is the first application built on top of the flexible Arrakis V2 Core system, optimized for automated management of protocol owned liquidity (thus, **P**rotocol **A**utomated **L**iquidity **M**anagement).

PALM enables users to:

- Create a "private" vault that is managed by PALMManager who will run automated strategies on behalf of the vault owner. Only vault owners can add and remove liquidity from their private vault.
  Vault owners have the ability to pick from a list of whitelisted strategy templates, and further configure the strategy with custom parameters.

- Vault owners can increase or decrease liquidity deposited in the vault at any time, as well as change the strategy configuration (or delegate this strategy configuration ability to a third party)

- Finally vault owners can remove all of their liquidity and close the vault at any time.

Call `openTerm` to create and configure your vault as well as deposit initial liquidity. Fund the `PALMManager` with some native network tokens (to pay gas for automated rebalances) and your vault will instantly start running the active liquidity provision strategy in Uniswap V3 as you configured it.

Unlike generic Arrakis V2 Core contracts PALM is not entirely free to use. PALM vaults pay a _management fee_ and _performance fee_ for the automated liquidity management services.

#### PALMTerms.sol

The entry point for protocols (or any user) to deploy a vault managed by the `PALMManager`, which runs customizable automated liquidity provision strategies via Gelato Network keeper infrastructure. `PALMTerms` is the owner role of all vaults deployed through it, exposing functions for each vault creator to control their vault (its liquidity, its strategy). Handles a quarterly recurring _management fee_, deducting a small percentage of principal liquidity deposited into PALM vaults.

#### PALMManager.sol

The entry point for the Gelato Network keeper infrastructure to rebalance all PALM vaults according to each vault's defined strategy. PALM vaults must fund the `PALMManager` with the network token (e.g. ETH) for keepers to start executing the LP strategy. Also handles the _performance fee_, a cut of the trading fees earned by vault liquidity in Uniswap that accrues to the manager.

## Setup

Create `.env` file and add `ALCHEMY_ID` (for all relevant environment variables, see `.env.example`)

Repo uses yarn for package management. Don't have yarn? [see here](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)

## Test

install dependencies:

```
yarn
```

compile contracts:

```
yarn compile
```

run tests:

```
yarn test
```

## Audits

Two security audits were recently performed- audit reports coming soon.

## Licensing

The license for Arrakis PALM is the MIT license, see LICENSE.
