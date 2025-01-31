import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure user can create a workout",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "fitvault-core",
        "create-workout",
        [
          types.utf8("Morning Yoga"),
          types.utf8("Beginner friendly yoga session"),
          types.uint(30),
          types.uint(10)
        ],
        wallet1.address
      )
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    assertEquals(block.receipts[0].result, "(ok u1)");
  }
});

Clarinet.test({
  name: "Ensure user can create and join session",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    // Test implementation
  }
});
