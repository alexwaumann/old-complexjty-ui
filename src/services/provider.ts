import { ethers } from "ethers";

const localhostUrl = 'http://localhost:8545';
const alchemyUrl = 'https://polygon-mainnet.g.alchemy.com/v2/6YUtaEGT8dEkgjyUSZv8D9hwRHJ2CSDX';

const url = import.meta.env.DEV ? localhostUrl : alchemyUrl;
const network = new ethers.Network('Polygon Mainnet', 137);
const options = { staticNetwork: network };

// SECTION: PUBLIC
export const provider = new ethers.JsonRpcProvider(url, network, options);
