const ethers = require('ethers');
const solc = require('solc');
const ganache = require('ganache-core');

const randomWallet = ethers.Wallet.createRandom();
const provider = new ethers.providers.Web3Provider(
    ganache.provider({
        accounts: [
            {
                balance: ethers.utils.parseEther('10').toString(),
                secretKey: randomWallet.privateKey
            }
        ]
    })
);

const wallet = randomWallet.connect(provider);

async function deploy() {
    const content = `
        pragma solidity ^0.8.11;
        contract Contract {
            uint public x;
            constructor(uint _x) {
                x = _x;
            }
        }
    `;  

    const input = {
        language: 'Solidity',
        sources: { 'contract.sol': { content } },
        settings: { outputSelection: { '*': { '*': ['*'] } } }
    };

    const output = JSON.parse(
        solc.compile(JSON.stringify(input))
    );

    const { Contract: { abi, evm: { bytecode } } } = output.contracts['contract.sol'];
    const factory = new ethers.ContractFactory(abi, bytecode.object, wallet);
    const contract = await factory.deploy(5);

    //using .fromSolidity()
    // const { Contract } = output.contracts['contract.sol'];
    // const factory = ethers.ContractFactory.fromSolidity(Contract, wallet);
    // const contract = await factory.deploy(5)

    const x = await contract.x();
    console.log(x.toString());
}

deploy();