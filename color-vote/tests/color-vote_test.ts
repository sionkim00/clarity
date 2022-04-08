import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.28.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "get-nb-of-voters returns the right number of voters",
  fn(chain: Chain, accounts: Map<string, Account>) {
    const { address } = accounts.get("wallet_1")!;

    const block = chain.mineBlock([
      Tx.contractCall("color-vote", "get-nb-of-voters", [], address),
    ]);
    console.log(block);
    block.receipts[0].result.expectUint(0);
  },
});

Clarinet.test({
  name: "vote - participant can vote only one time",
  fn(chain: Chain, accounts: Map<string, Account>) {
    const { address } = accounts.get("wallet_1")!;
    const vote = [types.uint(5), types.uint(5), types.uint(5), types.uint(5)];
    const block = chain.mineBlock([
      Tx.contractCall("color-vote", "vote", vote, address),
      Tx.contractCall("color-vote", "vote", vote, address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectErr().expectUint(403);
  },
});

Clarinet.test({
  name: "vote - increments the number of voters",
  fn(chain: Chain, accounts: Map<string, Account>) {
    const { address } = accounts.get("wallet_1")!;
    const vote = [types.uint(5), types.uint(5), types.uint(5), types.uint(5)];
    const block = chain.mineBlock([
      Tx.contractCall("color-vote", "vote", vote, address),
      Tx.contractCall("color-vote", "get-nb-of-voters", [], address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectUint(1);
  },
});

Clarinet.test({
  name: "vote - score should be less than max score",
  fn(chain: Chain, accounts: Map<string, Account>) {
    const { address } = accounts.get("wallet_1")!;
    const vote = [types.uint(6), types.uint(7), types.uint(3), types.uint(3)];
    const block = chain.mineBlock([
      Tx.contractCall("color-vote", "vote", vote, address),
    ]);
    block.receipts[0].result.expectErr().expectUint(400);
  },
});

Clarinet.test({
  name: "get-color - returns the right color",
  fn(chain: Chain, accounts: Map<string, Account>) {
    const { address } = accounts.get("wallet_1")!;
    const block = chain.mineBlock([
      Tx.contractCall("color-vote", "get-color", [types.uint(1)], address),
    ]);
    const color = block.receipts[0].result.expectOk().expectTuple();
    assertEquals(color, {
      score: types.uint(0),
      id: types.uint(1),
      value: types.ascii("D1C0A8"),
    });
  },
});

Clarinet.test({
  name: "`get-colors` - returns the array of colors",
  fn(chain: Chain, accounts: Map<string, Account>) {
    const { address } = accounts.get("wallet_1")!;
    const { receipts } = chain.mineBlock([
      Tx.contractCall("color-vote", "get-colors", [], address),
    ]);

    const colors = receipts[0].result.expectList();

    const expectedColors = ["F97316", "D1C0A8", "2563EB", "65A30D"];
    colors.forEach((colorTuple, i) => {
      const color = colorTuple.expectOk().expectTuple();
      color.id.expectUint(i);
      color.value.expectAscii(expectedColors[i]);
    });
  },
});

Clarinet.test({
  name: "vote - set the vote values",
  fn(chain: Chain, accounts: Map<string, Account>) {
    const { address } = accounts.get("wallet_1")!;
    const vote = [types.uint(5), types.uint(4), types.uint(3), types.uint(2)];
    const block = chain.mineBlock([
      Tx.contractCall("color-vote", "vote", vote, address),
      Tx.contractCall("color-vote", "get-color", [types.uint(0)], address),
    ]);
    block.receipts[0].result.expectOk();
    const color = block.receipts[1].result.expectOk().expectTuple();
    color.score.expectUint(5);
  },
});

type CVElected = {
  id: string;
  score: string;
};

Clarinet.test({
  name: "`get-elected` - returns elected",
  // settings "only" is handy when you want to focus on a specific test
  // we'll remove it at the end
  fn(chain: Chain, accounts: Map<string, Account>) {
    const { address } = accounts.get("wallet_1")!;
    const { receipts } = chain.mineBlock([
      Tx.contractCall(
        "color-vote",
        "vote",
        [types.uint(0), types.uint(4), types.uint(0), types.uint(0)],
        address
      ),
      Tx.contractCall("color-vote", "get-elected", [], address),
    ]);

    receipts[0].result.expectOk().expectBool(true);

    // the result can be `none` or `(some ...)` so we use `expectSome()`
    const elected = receipts[1].result.expectSome().expectTuple() as CVElected;
    elected.id.expectUint(1);
    elected.score.expectUint(4);
  },
});
