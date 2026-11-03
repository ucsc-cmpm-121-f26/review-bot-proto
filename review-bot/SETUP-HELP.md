**Your review bot can't review this push yet: REASON**

This comment and the red X on the **Review Bot** workflow come back on every push until you do one of
two things.

### Finish setting up

1. On the [BayLeaf dashboard](https://api.bayleaf.dev/dashboard), under **Temporary inference
   tokens**, open **Create a token**. Choose `openrouter:z-ai/glm-5.3-flash`, set the lifetime to
   `2592000` seconds (30 days; the default is only one hour), create it, and copy it.
2. Open [this repository's new secret page](https://github.com/REPOSITORY/settings/secrets/actions/new),
   name the secret `REVIEW_BOT_TOKEN` (for an old token, edit the existing secret instead), and paste
   the token as its value.
3. Push any commit. A review will appear here in its place.

Or, from a clone of this repository with the [GitHub CLI](https://cli.github.com/) logged in, run
`deno task review-bot:setup`.

### Or opt out

[Edit the workflow](https://github.com/REPOSITORY/edit/main/.github/workflows/review-bot.yml), change
`if: true` to `if: false`, and commit. To remove the review bot completely, follow the instructions at
the top of that file.

Your game and its other checks aren't affected either way.
