import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-etherscan";
import * as dotenv from 'dotenv';
dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

export default {
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999
          }
        }
      },
    ],
  },
  gasReporter: {
    currency: 'USD',
    coinmarketcap: 'f7169cda-d705-4f67-9e99-9a3985d713a4',
    gasPrice: 14
  },
  networks: {
    // ropsten: {
    //   url: `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`,
    //   accounts: [`0x${process.env.PRIVATE_KEY}`],
    // },
    // mainnet: {
    //   url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
    //   accounts: [`0x${process.env.PRIVATE_KEY}`],
    // },
    // hardhat: {
    //   forking: {
    //     url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
    //     accounts: [{privateKey: `0x${process.env.PRIVATE_KEY}`, balance: 1000}]
    //   },
    // },
    local: {
      url: `http://127.0.0.1:8545`,
      //accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
  // etherscan: {
  //   // Your API key for Etherscan
  //   // Obtain one at https://etherscan.io/
  //   apiKey: `${process.env.ETHERSCAN_API_KEY}`
  // }
};