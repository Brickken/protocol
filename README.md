## Brickken protocol

This is the set of smart contracts needed for the Brickken protocol. Contracts are inside the `contracts` directory.

The project is composed by the `BKN` token represented by the `brickken/Brickken.sol` contract. This is an `ERC20` token that has:
- Permit functionalities to cast allowances with meta transactions
- Votes functionalities obtained by `ERC20Votes` from OpenZeppelin
- It is mintable and burnable through Governance

Brickken related token `BKN` will be distributed on a private sale and on subsequent public sale.