import { ethers } from "hardhat"
import { expect } from 'chai'

// users addresses
let owner, addr1, addr2, addr3, addr4;
let brickken;

describe("Brickken", function () {

  this.beforeEach(async () => {
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    const Brickken = await ethers.getContractFactory("Brickken");
    
    brickken = await Brickken.deploy();
    await brickken.deployed();

    expect(await brickken.name()).to.equal("Brickken");
    expect(await brickken.totalSupply()).to.equal(0);
    expect(brickken.address ? true : false).to.true;
  })

  it("Should mint tokens to the deployer", async function () {
    //Mint and wait for tx
    const mint = await brickken.mint(owner.address, 1000);
    await mint.wait();

    //Read contract values
    let balance = await brickken.balanceOf(owner.address);
    balance = balance.toNumber();

    let totalSupply = await brickken.totalSupply();
    totalSupply = totalSupply.toNumber();

    //Validate results
    expect(balance).to.equal(1000);
    expect(totalSupply).to.equal(1000);
  });

  it("Shouldn't let anyone else outside deployer to mint tokens", async function () {
    try {
      //Try to mint from a non allowed address, it should revert
      await brickken.connect(addr1).mint(owner.address, 1000);
      throw new Error("Someone else succeeded in minting")
    } catch(error: any) {
      expect(error.message).to.include(["VM Exception"]);
      expect(error.message).to.include(["AccessControl"]);
    }
  });

  it("Should burn tokens to the deployer", async function () {
    //Mint and wait for tx
    const mint = await brickken.mint(owner.address, 1000);
    await mint.wait();

    //Burn and wait for tx
    const burn = await brickken.burn(1000);
    await burn.wait();

    //Read contract values
    let balance = await brickken.balanceOf(owner.address);
    balance = balance.toNumber();

    let totalSupply = await brickken.totalSupply();
    totalSupply = totalSupply.toNumber();

    //Validate results
    expect(balance).to.equal(0);
    expect(totalSupply).to.equal(0);
  });

  it("Shouldn't let anyone else outside deployer to burn tokens", async function () {
    try {

      //Mint and wait for tx
      const mint = await brickken.mint(addr1.address, 1000);
      await mint.wait();

      //Try to burn from a non allowed address, it should revert
      await brickken.connect(addr1).burn(1000);
      throw new Error("Someone else succeeded in burning")
    } catch(error: any) {
      expect(error.message).to.include(["VM Exception"]);
      expect(error.message).to.include(["AccessControl"]);
    }
  });

  it("It should add a new minter and burner and the new user should be able to mint and burn", async function() {
      
      //Add minter
      const addMinter = await brickken.grantRole(
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("MINTER_ROLE")
        ), 
        addr1.address
      );

      await addMinter.wait();

      //Mint and wait for tx
      const mint = await brickken.connect(addr1).mint(addr1.address, 1000);
      await mint.wait();

      //Read contract values
      let balance = await brickken.balanceOf(addr1.address);
      balance = balance.toNumber();

      let totalSupply = await brickken.totalSupply();
      totalSupply = totalSupply.toNumber();

      //Validate results
      expect(balance).to.equal(1000);
      expect(totalSupply).to.equal(1000);

      //Add burner
      const addBurner = await brickken.grantRole(
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("BURNER_ROLE")
        ), 
        addr1.address
      );

      await addBurner.wait();

      //Burn and wait for tx
      const burn = await brickken.connect(addr1).burn(500);
      await burn.wait();

      //Read contract values
      balance = await brickken.balanceOf(addr1.address);
      balance = balance.toNumber();

      totalSupply = await brickken.totalSupply();
      totalSupply = totalSupply.toNumber();

      //Validate results
      expect(balance).to.equal(500);
      expect(totalSupply).to.equal(500);
  })

  it("It should remove a minter and a burner as admin, the user should not be able nor to burn nor to mint anymore", async function() {
      //Add minter
      const addMinter = await brickken.grantRole(
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("MINTER_ROLE")
        ), 
        addr1.address
      );

      await addMinter.wait();

      //Add burner
      const addBurner = await brickken.grantRole(
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("BURNER_ROLE")
        ), 
        addr1.address
      );

      await addBurner.wait();

      //Mint and wait for tx
      const mint = await brickken.connect(addr1).mint(addr1.address, 1000);
      await mint.wait();

      //Burn and wait for tx
      const burn = await brickken.connect(addr1).burn(500);
      await burn.wait();

      //Read contract values
      let balance = await brickken.balanceOf(addr1.address);
      balance = balance.toNumber();

      let totalSupply = await brickken.totalSupply();
      totalSupply = totalSupply.toNumber();

      //Validate results
      expect(balance).to.equal(500);
      expect(totalSupply).to.equal(500);

      // Now revoke roles
      const revokeMinter = await brickken.revokeRole(
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("MINTER_ROLE")
        ), 
        addr1.address
      );

      await revokeMinter.wait();

      const revokeBurner = await brickken.revokeRole(
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("BURNER_ROLE")
        ), 
        addr1.address
      );

      await revokeBurner.wait();

      // Now try to mint again and expect to fail
      try {      
        const mint = await brickken.connect(addr1).mint(addr1.address, 1000);
        await mint.wait();
      } catch(error: any) {
        expect(error.message).to.include(["VM Exception"]);
        expect(error.message).to.include(["AccessControl"]);
      }

      // Now try to burn again and expect to fail
      try {
        const burn = await brickken.connect(addr1).burn(500);
        await burn.wait();

      } catch(error: any) {
        expect(error.message).to.include(["VM Exception"]);
        expect(error.message).to.include(["AccessControl"]);
      }

      //Read contract values
      balance = await brickken.balanceOf(addr1.address);
      balance = balance.toNumber();

      totalSupply = await brickken.totalSupply();
      totalSupply = totalSupply.toNumber();

      //Validate results
      expect(balance).to.equal(500);
      expect(totalSupply).to.equal(500);
  })

  it("It shouldn't let anyone outside the admin to remove roles", async function() {
      //Add minter
      const addMinter = await brickken.grantRole(
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("MINTER_ROLE")
        ), 
        addr1.address
      );

      await addMinter.wait();

      //Mint and wait for tx
      const mint = await brickken.connect(addr1).mint(addr1.address, 1000);
      await mint.wait();

      //Read contract values
      let balance = await brickken.balanceOf(addr1.address);
      balance = balance.toNumber();

      let totalSupply = await brickken.totalSupply();
      totalSupply = totalSupply.toNumber();

      //Validate results
      expect(balance).to.equal(1000);
      expect(totalSupply).to.equal(1000);

      // Now revoke roles but not as admin, expect to revert
      try {
        const revokeMinter = await brickken.connect(addr1).revokeRole(
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("MINTER_ROLE")
          ), 
          addr1.address
        );
  
        await revokeMinter.wait();
      } catch(error: any) {
        expect(error.message).to.include(["VM Exception"]);
        expect(error.message).to.include(["AccessControl"]);
      }
  })

  it("It should renounce to a role", async function() {
      //Add minter
      const addMinter = await brickken.grantRole(
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("MINTER_ROLE")
        ), 
        addr1.address
      );

      await addMinter.wait();

      //Mint and wait for tx
      const mint = await brickken.connect(addr1).mint(addr1.address, 1000);
      await mint.wait();

      //Read contract values
      let balance = await brickken.balanceOf(addr1.address);
      balance = balance.toNumber();

      let totalSupply = await brickken.totalSupply();
      totalSupply = totalSupply.toNumber();

      //Validate results
      expect(balance).to.equal(1000);
      expect(totalSupply).to.equal(1000);

      //Renounce role
      const renounceRole = await brickken.connect(addr1).renounceRole(
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("MINTER_ROLE")
        ),
        addr1.address
      )

      await renounceRole.wait();

      //Try to mint again and expect it to fail
      try {
        const mint = await brickken.connect(addr1).mint(addr1.address, 1000);
        await mint.wait();
      } catch(error: any) {
        expect(error.message).to.include(["VM Exception"]);
        expect(error.message).to.include(["AccessControl"]);
      }
  })

  it("It should let admin renounce to adminship, after that admin can't add any minter anymore", async function() {
    //Renounce role
    const renounceRole = await brickken.renounceRole(
      ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("DEFAULT_ADMIN_ROLE")
      ),
      owner.address
    )

    await renounceRole.wait();

    //Try to give someone mint role
    try {
      const addMinter = await brickken.grantRole(
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("MINTER_ROLE")
        ), 
        addr1.address
      );

      await addMinter.wait();
    } catch(error: any) {
      expect(error.message).to.include(["VM Exception"]);
      expect(error.message).to.include(["AccessControl"]);
    }
  })

  it("It should let admin transfer adminship, giving other powers to add minters", async function() {
    //Grant role
    const grantRole = await brickken.grantRole(
      await brickken.DEFAULT_ADMIN_ROLE(),
      addr1.address
    )

    await grantRole.wait();

    //Try to give someone mint role from new admin
    const addMinter = await brickken.connect(addr1).grantRole(
      ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("MINTER_ROLE")
      ), 
      addr2.address
    );

    await addMinter.wait();

    // Try to mint from the granted account
    const mint = await brickken.connect(addr2).mint(addr1.address, 1000);
    await mint.wait();
  })

  it("It should allow sending a signed message to increase allowance", async function() {
    // const value = utils.hexZeroPad(BigNumber.from('100').toHexString(), 32);
    // const nonce = utils.hexZeroPad(BigNumber.from('0').toHexString(), 32);
    // const deadline = utils.hexZeroPad(
    //   Buffer.from(
    //     (
    //       new Date("2025-09-01T00:00:00Z").getTime() / 1000
    //     ).toString()
    //   ), 
    //   32
    // );

    // const name = await brickken.name();
    // const verifyingContract = brickken.address;
    // const version = utils.hexZeroPad(BigNumber.from('1').toHexString(), 32);
    // const spender = defaultSpender;
    // const owner = defaultSender;
    // const { chainId } = await ethers.provider.getNetwork();

    // const data = {
    //   primaryType: 'Permit',
    //   types: { EIP712Domain, Permit },
    //   domain: { name, version, chainId, verifyingContract },
    //   message: { owner, spender, value, nonce, deadline },
    // }


    // const signature = ethSigUtil.signTypedMessage(Buffer.from(defaultKey, 'hex'), { data });
    // console.log(signature);

    // const { v, r, s } = fromRpcSig(signature);

    // const receipt = await brickken.permit(owner, spender, value, deadline, v, r, s);
    // console.log(receipt);

    // expect(parseInt(await brickken.nonces(owner))).to.be.equal(1);
    // expect(parseInt(await brickken.allowance(owner, spender))).to.be.equal(value);
  })

  it("It shouldn't allow repeating an allowance tx", async function() {})
  
  it("It should not allow after deadline", async function() {})
  
  it("It should move delegates upon transfer", async function() {
    //Mint and wait for tx
    var mint = await brickken.mint(owner.address, 1000);
    await mint.wait();

    mint = await brickken.mint(addr1.address, 2000);
    await mint.wait();

    //First of all delegate for owner and addr1 to addr2 and add3
    var delegate = await brickken.delegate(addr2.address);
    await delegate.wait()

    delegate = await brickken.connect(addr1).delegate(addr3.address);
    await delegate.wait()

    var blockNumber = (await ethers.provider.getBlock('latest')).number;
    await ethers.provider.send("evm_mine", [])

    var pastVotes = await brickken.getPastVotes(addr2.address, blockNumber);
    var delegate = await brickken.delegates(owner.address);

    expect(pastVotes).to.equal(1000)
    expect(delegate).to.equal(addr2.address);

    pastVotes = await brickken.getPastVotes(addr3.address, blockNumber);
    delegate = await brickken.delegates(addr1.address);

    expect(pastVotes).to.equal(2000);
    expect(delegate).to.equal(addr3.address);

    //Now transfer
    var transferTx = await brickken.transfer(addr1.address, 1000)
    await transferTx.wait();

    blockNumber = (await ethers.provider.getBlock('latest')).number;
    await ethers.provider.send("evm_mine", [])

    pastVotes = await brickken.getPastVotes(addr3.address, blockNumber);
    delegate = await brickken.delegates(addr1.address);

    expect(pastVotes).to.equal(3000);
    expect(delegate).to.equal(addr3.address);

    transferTx = await brickken.connect(addr1).transfer(owner.address, 2000)
    await transferTx.wait();

    blockNumber = (await ethers.provider.getBlock('latest')).number;
    await ethers.provider.send("evm_mine", [])
    
    delegate = await brickken.delegates(owner.address);
    pastVotes = await brickken.getPastVotes(addr2.address, blockNumber);

    expect(pastVotes).to.equal(2000);
    expect(delegate).to.equal(addr2.address);

  })

  it("It should move delegates upon minting", async function() {
    
    //First of all delegate for owner to addr2
    var delegate = await brickken.delegate(addr2.address);
    await delegate.wait()

    var blockNumber = (await ethers.provider.getBlock('latest')).number;
    await ethers.provider.send("evm_mine", [])

    var pastVotes = await brickken.getPastVotes(addr2.address, blockNumber);
    var delegate = await brickken.delegates(owner.address);

    expect(pastVotes).to.equal(0)
    expect(delegate).to.equal(addr2.address);

    //Mint and wait for tx
    var mint = await brickken.mint(owner.address, 1000);
    await mint.wait();

    blockNumber = (await ethers.provider.getBlock('latest')).number;
    await ethers.provider.send("evm_mine", [])

    var pastVotes = await brickken.getPastVotes(addr2.address, blockNumber);
    var delegate = await brickken.delegates(owner.address);

    expect(pastVotes).to.equal(1000)
    expect(delegate).to.equal(addr2.address);
  })

  it("It should move delegates upon burning", async function() {
    
    //First of all delegate for owner to addr2
    var delegate = await brickken.delegate(addr2.address);
    await delegate.wait()

    //Mint and wait for tx
    var mint = await brickken.mint(owner.address, 1000);
    await mint.wait();

    var blockNumber = (await ethers.provider.getBlock('latest')).number;
    await ethers.provider.send("evm_mine", [])

    var pastVotes = await brickken.getPastVotes(addr2.address, blockNumber);
    var delegate = await brickken.delegates(owner.address);

    expect(pastVotes).to.equal(1000)
    expect(delegate).to.equal(addr2.address);

    //Now burn and check delegates moves
    var burn = await brickken.burn(1000);
    await burn.wait();

    blockNumber = (await ethers.provider.getBlock('latest')).number;
    await ethers.provider.send("evm_mine", [])

    var pastVotes = await brickken.getPastVotes(addr2.address, blockNumber);
    var delegate = await brickken.delegates(owner.address);

    expect(pastVotes).to.equal(0)
    expect(delegate).to.equal(addr2.address);
  })
});
