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
  name: "Ensure user can create and join session with participant limit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get("wallet_1")!;
    const wallet2 = accounts.get("wallet_2")!;
    
    // Create workout
    let block = chain.mineBlock([
      Tx.contractCall(
        "fitvault-core",
        "create-workout",
        [types.utf8("Test Workout"), types.utf8("Test Description"), types.uint(30), types.uint(2)],
        wallet1.address
      )
    ]);

    // Create session
    block = chain.mineBlock([
      Tx.contractCall(
        "fitvault-core",
        "create-session",
        [types.uint(1), types.uint(1234567)],
        wallet1.address
      )
    ]);

    // Second user joins session
    block = chain.mineBlock([
      Tx.contractCall(
        "fitvault-core",
        "join-session",
        [types.uint(1)],
        wallet2.address
      )
    ]);
    assertEquals(block.receipts[0].result, "(ok true)");

    // Third user attempts to join full session
    block = chain.mineBlock([
      Tx.contractCall(
        "fitvault-core", 
        "join-session",
        [types.uint(1)],
        accounts.get("wallet_3")!.address
      )
    ]);
    assertEquals(block.receipts[0].result, `(err u102)`);
  }
});
