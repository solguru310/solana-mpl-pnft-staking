import * as anchor from "@coral-xyz/anchor";
import fs from "fs";
import {
  PublicKey,
  Connection,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction as web3Transaction,
} from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";

import {
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PROGRAM_ID as TOKEN_AUTH_RULES_ID } from "@metaplex-foundation/mpl-token-auth-rules";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  signerIdentity,
  publicKey
} from "@metaplex-foundation/umi";
import {
  MPL_CORE_PROGRAM_ID,
  fetchAsset,
} from "@metaplex-foundation/mpl-core";

import {
  METAPLEX,
  MPL_DEFAULT_RULE_SET,
  findTokenRecordPda,
  getAssociatedTokenAccount,
  getMasterEdition,
  getMetadata,
  getUTCTimestamps,
} from "./util";
import {
  GLOBAL_AUTHORITY_SEED
} from "./constant";

export const createInitializeTx = async (
  admin: PublicKey,
  program: anchor.Program
) => {
  const [globalPool] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  console.log("globalPool: ", globalPool.toBase58());

  const tx = await program.methods
    .initialize()
    .accounts({
      admin,
      globalPool,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .transaction();

  return tx;
};


export const createLockPnftTx = async (
  wallet: Wallet,
  nftMint: PublicKey,
  program: anchor.Program,
  connection: Connection
) => {
  const userAddress = wallet.publicKey;

  const nftEdition = await getMasterEdition(nftMint);

  let tokenAccount = await getAssociatedTokenAccount(userAddress, nftMint);

  const mintMetadata = await getMetadata(nftMint);

  const tokenMintRecord = findTokenRecordPda(nftMint, tokenAccount);

  const tx = new web3Transaction();

  const txId = await program.methods
    .lockMission2()
    .accounts({
      user: userAddress,
      tokenMint: nftMint,
      tokenAccount,
      tokenMintEdition: nftEdition,
      tokenMintRecord,
      mintMetadata,
      authRules: MPL_DEFAULT_RULE_SET,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenMetadataProgram: METAPLEX,
      authRulesProgram: TOKEN_AUTH_RULES_ID,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  tx.add(txId);

  tx.feePayer = userAddress;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const txData = await wallet.signTransaction(tx);

  return txData.serialize({ requireAllSignatures: false });
};

export const createUnlockPnftTx = async (
  wallet: Wallet, // Owner or admin
  nftMint: PublicKey,
  program: anchor.Program,
  connection: Connection,
  user?: PublicKey,
) => {
  const userAddress = user ? user : wallet.publicKey;

  const nftEdition = await getMasterEdition(nftMint);

  let tokenAccount = await getAssociatedTokenAccount(userAddress, nftMint);

  const mintMetadata = await getMetadata(nftMint);

  const tokenMintRecord = findTokenRecordPda(nftMint, tokenAccount);

  const tx = new web3Transaction();

  const txId = await program.methods
    .unlockMission2()
    .accounts({
      payer: wallet.publicKey,
      user: userAddress,
      tokenMint: nftMint,
      tokenAccount,
      tokenMintEdition: nftEdition,
      tokenMintRecord,
      mintMetadata,
      authRules: MPL_DEFAULT_RULE_SET,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenMetadataProgram: METAPLEX,
      authRulesProgram: TOKEN_AUTH_RULES_ID,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  tx.add(txId);

  tx.feePayer = wallet.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const txData = await wallet.signTransaction(tx);

  return txData.serialize({ requireAllSignatures: false });
};
