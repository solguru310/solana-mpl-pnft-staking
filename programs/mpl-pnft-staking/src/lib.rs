use anchor_lang::{ prelude::*, AnchorDeserialize };

pub mod constant;
pub mod error;
pub mod instructions;
pub mod state;
use constant::*;
use error::*;
use instructions::*;
use state::*;

declare_id!("your program ID");

#[program]
pub mod mpl_pnft_staking {
    use super::*;

    /**
     * User can lock pNFTs from specific collection
     */
    pub fn lock_pnft(ctx: Context<LockPNFT>) -> Result<()> {
        lock_pnft::lock_pnft_handler(ctx)
    }

    /**
     * User can unlock pNFTs when they want
     */
    pub fn unlock_pnft(ctx: Context<UnlockPNFT>) -> Result<()> {
        unlock_pnft::unlock_pnft_handler(ctx)
    }
}
