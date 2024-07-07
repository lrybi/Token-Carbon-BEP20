import { HardhatRuntimeEnvironment } from "hardhat/types";

import { DeployFunction } from "hardhat-deploy/types";

import { networkConfig, developmentChains } from "../helper-hardhat-config";

import verify from "../utils/verify";

import "dotenv/config";


const deployCarbon: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network, ethers } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts(); 
    
    log("----------------------------------------------------");
    const args: any[] = [];
    const carbon = await deploy("CARBON", {
        contract: "CARBON",
        from: deployer,
        args: args, 
        log: true, 
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    }); 
    log('CARBON Deployed!');

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) { 
        log("Verifying...");
        await verify(await carbon.address, args); 
    }
    log("------------------------------------------");
}
 
export default deployCarbon;

deployCarbon.tags = ["all", "carbon"];



