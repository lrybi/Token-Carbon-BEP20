
// Unit tests are done locally

import { network, deployments, getNamedAccounts, ethers } from "hardhat";

import { assert, expect } from "chai";

import { developmentChains, networkConfig } from "../../helper-hardhat-config"

import { CARBON } from "../../typechain-types";


!developmentChains.includes(network.name) 
    ? describe.skip                
    : describe("CARBON Unit Tests", function () {
        let carbon: CARBON;

        beforeEach(async () => { 
            const { deployer } = await getNamedAccounts();
            const signerDeploy = await ethers.getSigner(deployer);
            const contracts = await deployments.fixture(["all"]);
            carbon = await ethers.getContractAt("CARBON", contracts["CARBON"].address, signerDeploy);
        });

        describe("Deployment", function () {
            it("Should set the right owner", async function () {
                const { deployer } = await getNamedAccounts();
                const signerDeploy = await ethers.getSigner(deployer);
                console.log("            deployer address:", signerDeploy.address);
                const actualOwner = await carbon.getOwner();
                console.log("            actualOwner address:", actualOwner.toString());
                                
                assert.equal(actualOwner.toString(), signerDeploy.address);
            });
            it("Should have correct name", async () => {
                const actualName = await carbon.name();
                assert.equal(actualName.toString(), "CARBON CREDIT");
            });
            it("Should have correct symbol", async () => {
                const actualSymbol = await carbon.symbol();
                assert.equal(actualSymbol.toString(), "CAR");
            });
            it("Should have correct initial supply", async () => {
                const actualTotalSupply = await carbon.totalSupply();
                assert.equal(actualTotalSupply.toString(), "900000000000000000000000000");
            });
            it("Should have 18 decimals", async () => {
                const actualDecimals = await carbon.decimals();
                assert.equal(actualDecimals.toString(), "18");
            });
            it("Should assign the total supply of tokens to the owner", async () => {
                const { deployer } = await getNamedAccounts();
                const signerDeploy = await ethers.getSigner(deployer);
                
                const actualTotalSupply = await carbon.totalSupply();
                const ownerBalance = await carbon.balanceOf(signerDeploy.address);
                console.log("            ownerBalance:", ownerBalance.toString());
                assert.equal(actualTotalSupply.toString(), ownerBalance.toString());
            });
        });

        describe("Transactions", function () {
            
            it("Should transfer tokens between accounts", async function () {
                const { deployer, user, anotherUser } = await getNamedAccounts();
                const signerDeploy = await ethers.getSigner(deployer);
                const signerUser = await ethers.getSigner(user);
                const signerAnotherUser = await ethers.getSigner(anotherUser);

                console.log("            Transfer 50 tokens from owner to user!");
                await expect(
                    carbon.transfer(signerUser.address, 50)
                ).to.changeTokenBalances(carbon, [signerDeploy.address, signerUser.address], [-50, 50]);

                console.log("            Transfer 50 tokens from user to anotherUser!");
                await carbon.connect(signerUser).transfer(signerAnotherUser.address, 50);

                expect(await carbon.balanceOf(signerAnotherUser.address)).to.equal(50);
                console.log("            Successfully Transfered!");
            });

            it("Should emit Transfer events", async function () {
                const { deployer, user, anotherUser } = await getNamedAccounts();
                const signerDeploy = await ethers.getSigner(deployer);
                const signerUser = await ethers.getSigner(user);
                const signerAnotherUser = await ethers.getSigner(anotherUser);
    
                // Transfer 50 tokens from owner to user
                await expect(carbon.transfer(signerUser.address, 50))
                    .to.emit(carbon, "Transfer")
                    .withArgs(signerDeploy.address, signerUser.address, 50);
    
                // Transfer 50 tokens from user to anotherUser
                await expect(carbon.connect(signerUser).transfer(signerAnotherUser.address, 50))
                    .to.emit(carbon, "Transfer")
                    .withArgs(signerUser.address, signerAnotherUser.address, 50);
            });

            it("Should fail if sender doesn't have enough tokens", async function () {
                const { deployer, user } = await getNamedAccounts();
                const signerDeploy = await ethers.getSigner(deployer);
                const signerUser = await ethers.getSigner(user);
                
                const initialOwnerBalance = await carbon.balanceOf(signerDeploy.address);
    
                // Try to send 1 token from user (0 tokens) to owner.
                // `require` will evaluate false and revert the transaction.
                await expect(
                    carbon.connect(signerUser).transfer(signerDeploy.address, 1)
                ).to.be.revertedWith("BEP20: transfer amount exceeds balance");
    
                // Owner balance shouldn't have changed.
                expect(await carbon.balanceOf(signerDeploy.address)).to.equal(
                    initialOwnerBalance
                );
            });

        });        

        describe("Mint more", function () {
            
            it("Should fail if other users mint the token", async () => {
                const { user } = await getNamedAccounts();
                const signerUser = await ethers.getSigner(user);

                await expect(
                    carbon.connect(signerUser).mint('100000000000000000000')
                ).to.be.revertedWith("Ownable: caller is not the owner");
            });

            it("Should owner could mint more the token", async () => {
                const { deployer } = await getNamedAccounts();
                const signerDeploy = await ethers.getSigner(deployer);

                const initialTotalSupply = await carbon.totalSupply();

                await carbon.mint('100000000000000000000');

                const newTotalSupply = BigInt(initialTotalSupply) + BigInt("100000000000000000000");
                console.log("            newTotalSupply:", newTotalSupply);
                const actualNewTotalSupply = await carbon.totalSupply();
                console.log("            actualNewTotalSupply:", actualNewTotalSupply);

                assert.equal(actualNewTotalSupply.toString(), newTotalSupply.toString());

                expect(await carbon.balanceOf(signerDeploy.address)).to.equal(newTotalSupply);
            });

        });

    })
    

    