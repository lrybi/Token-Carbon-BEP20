
export interface networkConfigItem { 
    blockConfirmations?: number
}

export interface networkConfigInfo { 
    [key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
    localhost: {},
    hardhat: {},
    sepolia: {
        blockConfirmations: 5,
    },
    bscTestnet: {
        blockConfirmations: 5,
    },
}

export const developmentChains = ["hardhat", "localhost"]