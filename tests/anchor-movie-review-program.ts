import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { expect } from "chai";
import { AnchorMovieReviewProgram } from "../target/types/anchor_movie_review_program";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

describe("anchor-movie-review-program", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorMovieReviewProgram as Program<AnchorMovieReviewProgram>;

  const movie = {
    title: "Just a test movie",
    description: "Wow, good movie!",
    rating: 5
  };

  const [movie_pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(movie.title), provider.wallet.publicKey.toBuffer()],
    program.programId
  );

  const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    program.programId
  );

  it("Initialized the reward token", async () => {
    const tx = await program.methods
      .initializeTokenMint()
      .accounts({
        mint: mint,  
      })
      .rpc();
  })

  it("Movie review is added", async () => {
    const tokenAccount = await getAssociatedTokenAddress(mint, provider.wallet.publicKey)
    const tx = await program.methods
    .addMovieReview(movie.title, movie.description, movie.rating)
    .accounts({
      movieReview: movie_pda,
      mint: mint,
      tokenAccount: tokenAccount
    })
    .rpc();
    console.log("Your transaction signature", tx);

    const account = await program.account.movieAccountState.fetch(movie_pda);
    expect(movie.title === account.title);
    expect(movie.description === account.description);
    expect(movie.rating === account.rating);
    expect(provider.wallet.publicKey === account.reviewer);

    const userAta = await getAccount(provider.connection, tokenAccount);
    expect(Number(userAta.amount)).to.equal(10*10^6);
  });

  it("Movie review is updated", async () => {
    const newDescription = "wow, this is new";
    const newRating = 4;

    const tx = await program.methods
    .updateMovieReview(movie.title, movie.description, movie.rating)
    .accounts({
      movieReview: movie_pda
    })
    .rpc();
    console.log("Your transaction signature", tx);

    const account = await program.account.movieAccountState.fetch(movie_pda);
    expect(movie.title === account.title);
    expect(newDescription === account.description);
    expect(newRating === account.rating);
    expect(provider.wallet.publicKey === account.reviewer);
  });

  it("Movie review is deleted", async() => {
    const tx = await program.methods
      .deleteMovieReview(movie.title)
      .accounts({ movieReview: movie_pda })
      .rpc();
  });
});
