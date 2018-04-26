import assertRevert from '../tools/helpers/assertRevert';

const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

export default function shouldMintAndBurnERC721Token(accounts) {
    const firstTokenId = 1;
    const secondTokenId = 2;
    const unknownTokenId = 3;
    const creator = accounts[0];
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

    describe('like a mintable ERC721Token', function () {
        beforeEach(async function () {
            await this.token.mint(creator, firstTokenId, 40, {from: creator});
            await this.token.mint(creator, secondTokenId, 40, {from: creator});
        });

        describe('mint', function () {
            const to = accounts[1];
            const tokenId = unknownTokenId;
            let logs = null;

            describe('when successful', function () {
                beforeEach(async function () {
                    const result = await this.token.mint(to, tokenId, 40);
                    logs = result.logs;
                });

                it('assigns the token to the new owner', async function () {
                    const owner = await this.token.ownerOf(tokenId);
                    owner.should.be.equal(to);
                });

                it('increases the balance of its owner', async function () {
                    const balance = await this.token.balanceOf(to);
                    balance.should.be.bignumber.equal(1);
                });

                it('emits a transfer event', async function () {
                    logs.length.should.be.equal(1);
                    logs[0].event.should.be.eq('Transfer');
                    logs[0].args._from.should.be.equal(ZERO_ADDRESS);
                    logs[0].args._to.should.be.equal(to);
                    logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
                });
            });

            describe('when the given owner address is the zero address', function () {
                it('reverts', async function () {
                    await assertRevert(this.token.mint(ZERO_ADDRESS, tokenId, 50));
                });
            });

            describe('when the given token ID was already tracked by this contract', function () {
                it('reverts', async function () {
                    await assertRevert(this.token.mint(accounts[1], firstTokenId, 40));
                });
            });
        });
    });
};
