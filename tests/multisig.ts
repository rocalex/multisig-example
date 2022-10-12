import { NearAccount, Worker } from 'near-workspaces'
describe("multisig", () => {
    let worker: Worker;
    let root: NearAccount;
    let contract: NearAccount;
    let alice: NearAccount;

    before(async () => {
        // Init the worker and start a Sandbox server
        worker = await Worker.init();

        // Deploy contract
        root = worker.rootAccount;
        contract = await root.createSubAccount('multisig');
        // Get wasm file path from package.json test script in folder above
        await contract.deploy(__dirname + '/../contract/target/wasm32-unknown-unknown/release/multisig.wasm');

        alice = await root.createSubAccount("member")
    })

    it("init", async () => {
        await root.call(contract, 'new', {
            members: [
                {
                    account_id: alice.accountId
                }
            ],
            num_confirmations: 1,
        })
    })

    it('add request and confirm', async () => {
        const requestId = await alice.call(contract, 'add_request', {
            request: {
                receiver_id: alice.accountId,
                actions: [
                    {
                        type: "Transfer",
                        amount: "10"
                    }
                ]
            }
        })
        const confirmed = await alice.call(contract, 'confirm', {
            request_id: requestId
        })
        console.log(confirmed)
    })

    it("get members", async () => {
        const members = await contract.view('get_members', {})
        console.log('members:', members)
    })

    it("list_request_ids", async () => {
        const requestIds = await contract.view("list_request_ids", {})
        console.log("request ids:", requestIds)
    })

    after(async () => {
        await worker.tearDown().catch((error) => {
            console.log('Failed to stop the Sandbox:', error);
        });
    })
})