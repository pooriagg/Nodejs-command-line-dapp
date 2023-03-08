const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const dotEnv = require("dotenv");
const { dai, abi } = require("./data");

dotEnv.config();

const apiKey = process.env.ALCHEMY_API;
const privateKey = process.env.PRIVATE_KEY;
const publicKey = process.env.PUBLIC_KEY;
const alchemyUrl = `https://polygon-mumbai.g.alchemy.com/v2/${apiKey}`;

// ! Please note that :
//1) min dai transfer is 10 DAI
//2) enter dai amount WITH decimals
//3) 1 wei == 10^18 ether
const init = async () => {
    const web3 = createAlchemyWeb3(alchemyUrl);
    const DAI = new web3.eth.Contract(abi, dai);

    const request = process.argv;
    const action = request[2];

    if (action === "mintDaiForVault") {
        
        const daiAmount = web3.utils.toBN(String(request[3]));

        if (daiAmount > 0) {

            let gas = await DAI.methods.mint(publicKey, daiAmount).estimateGas();
            let data = await DAI.methods.mint(publicKey, daiAmount).encodeABI();
            let to = dai;
            let gasPrice = await web3.eth.getGasPrice();
            let nonce = await web3.eth.getTransactionCount(publicKey);
            let chainId = await web3.eth.net.getId();
            let value = web3.utils.numberToHex("0");
            let Tx = {
                to: to,
                value: value,
                data: data,
                gas: gas,
                gasPrice: gasPrice,
                nonce: nonce,
                chainId: chainId
            };

            await web3.eth.accounts.signTransaction(Tx, privateKey, async (err, rawTx) => {
                if (!err) {

                    await web3.eth.sendSignedTransaction(rawTx.rawTransaction, (err, txHash) => {
                        if (!err) {

                            console.log(`\nTransaction hash => ${txHash}\n(request sent to the contract to mint dai for the vault)\n`);
                            process.exit(1);

                        } else {
                            console.log("Failed to send signed tx =>", err.message);
                            process.exit(0);
                        }
                    });

                } else {
                    console.log("Failed to sign the tx =>", err.message);
                    process.exit(0);
                }
            });

        } else {
            console.log("Invalid token amount entered!");
            process.exit(0);
        }

    } else if (action === "getBalance") {

        const address = String(request[3]);

        if (web3.utils.isAddress(address)) {

            let data = await DAI.methods.balanceOf(address).encodeABI();

            let Tx = {
                to: dai,
                data: data
            };

            await web3.eth.call(Tx, (err, res) => {
                if (!err) {

                    let balance = parseInt(res, 16);
                    console.log(`\nAccount dai balance =>   --- ${balance.toLocaleString()} DAI ---   (with 18 decimals)\n`);
                    process.exit(1);

                } else {
                    console.log("Cannot read data =>", err.message);
                    process.exit(0);
                }
            });

        } else {
            console.log("Invalid address entered!");
            process.exit(0);
        }

    } else if (action === "transferDaiTo") {

        const address = String(request[3]);
        const daiAmount = web3.utils.toBN(String(request[4]));

        if (web3.utils.isAddress(address) && daiAmount > web3.utils.toBN("0")) {

            let gas = await DAI.methods.transfer(address, daiAmount).estimateGas({ from: publicKey });
            let data = await DAI.methods.transfer(address, daiAmount).encodeABI({ from: publicKey });
            let to = dai;
            let gasPrice = await web3.eth.getGasPrice();
            let nonce = await web3.eth.getTransactionCount(publicKey);
            let chainId = await web3.eth.net.getId();
            let value = web3.utils.numberToHex("0");
            let Tx = {
                to: to,
                value: value,
                data: data,
                gas: gas,
                gasPrice: gasPrice,
                nonce: nonce,
                chainId: chainId
            };

            await web3.eth.accounts.signTransaction(Tx, privateKey, async (err, rawTx) => {
                if (!err) {

                    await web3.eth.sendSignedTransaction(rawTx.rawTransaction, (err, txHash) => {
                        if (!err) {
                            console.log(`\nTransaction hash => ${txHash}\n(request sent to the contract to transfer dai from vault to the recepient)\n`);
                            process.exit(1);

                        } else {
                            console.log("Failed to send signed tx =>", err.message);
                            process.exit(0);
                        }
                    });

                } else {
                    console.log("Failed to sign the tx =>", err.message);
                    process.exit(0);
                }
            });

        } else {
            console.log("Invalid data entered!");
            process.exit(0);
        }

    } else if (action === "approveTo") {
        
        const approverPrivateKey = String(request[3]);
        const approverPublicKey = String(request[4]);
        const operatorAddress = String(request[5]);
        const daiAmount = web3.utils.toBN(String(request[6]));

        if (web3.utils.isAddress(operatorAddress) && web3.utils.isAddress(approverPublicKey) && daiAmount > web3.utils.toBN("0")) {

            let gas = await DAI.methods.approve(operatorAddress, daiAmount).estimateGas({ from: approverPublicKey });
            let data = await DAI.methods.approve(operatorAddress, daiAmount).encodeABI({ from: approverPublicKey });
            let to = dai;
            let gasPrice = await web3.eth.getGasPrice();
            let nonce = await web3.eth.getTransactionCount(approverPublicKey);
            let chainId = await web3.eth.net.getId();
            let value = web3.utils.numberToHex("0");
            let Tx = {
                to: to,
                value: value,
                data: data,
                gas: gas,
                gasPrice: gasPrice,
                nonce: nonce,
                chainId: chainId
            };

            await web3.eth.accounts.signTransaction(Tx, approverPrivateKey, async (err, rawTx) => {
                if (!err) {

                    await web3.eth.sendSignedTransaction(rawTx.rawTransaction, (err, txHash) => {
                        if (!err) {
                            console.log(`\nTransaction hash => ${txHash}\n(request sent to the contract to approve the operator)\n`);
                            process.exit(1);

                        } else {
                            console.log("Failed to send signed tx =>", err.message);
                            process.exit(0);
                        }
                    });

                } else {
                    console.log("Failed to sign the tx =>", err.message);
                    process.exit(0);
                }
            });

        } else {
            console.log("Invalid data entered!");
            process.exit(0);
        }

    } else if (action === "transferFromTo") {
        
        const operatorPrivateKey = String(request[3]);
        const operatorPublicKey = String(request[4]);
        const fromAddress = String(request[5]);
        const toAddress = String(request[6]);
        const daiAmount = web3.utils.toBN(String(request[7]));

        if (web3.utils.isAddress(fromAddress) && web3.utils.isAddress(toAddress) && daiAmount > web3.utils.toBN("0")) {

            let gas = await DAI.methods.transferFrom(fromAddress, toAddress, daiAmount).estimateGas({ from: operatorPublicKey });
            let data = await DAI.methods.transferFrom(fromAddress, toAddress, daiAmount).encodeABI({ from: operatorPublicKey });
            let to = dai;
            let gasPrice = await web3.eth.getGasPrice();
            let nonce = await web3.eth.getTransactionCount(operatorPublicKey);
            let chainId = await web3.eth.net.getId();
            let value = web3.utils.numberToHex("0");
            let Tx = {
                to: to,
                value: value,
                data: data,
                gas: gas,
                gasPrice: gasPrice,
                nonce: nonce,
                chainId: chainId
            };
            
            await web3.eth.accounts.signTransaction(Tx, operatorPrivateKey, async (err, rawTx) => {
                if (!err) {

                    await web3.eth.sendSignedTransaction(rawTx.rawTransaction, (err, txHash) => {
                        if (!err) {
                            console.log(`\nTransaction hash => ${txHash}\n(request sent to the contract to transfer funds between from and to address)\n`);
                            process.exit(1);

                        } else {
                            console.log("Failed to send signed tx =>", err.message);
                            process.exit(0);
                        }
                    });

                } else {
                    console.log("Failed to sign the tx =>", err.message);
                    process.exit(0);
                }
            });

        } else {
            console.log("Invalid data entered!");
            process.exit(0);
        }

    } else {
        console.log("Invalid input entered!");
        process.exit(0);
    }
}

init();