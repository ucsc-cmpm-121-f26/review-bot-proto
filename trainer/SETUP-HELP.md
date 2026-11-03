**Your trainer can't review this push yet: REASON**

You can fix this in your browser:

1. On the [BayLeaf dashboard](https://api.bayleaf.dev/dashboard), under **Temporary inference
   tokens**, create a 30-day token for `openrouter:z-ai/glm-5.3-flash` and copy it.
2. Open [this repository's new secret page](https://github.com/REPOSITORY/settings/secrets/actions/new),
   name the secret `TRAINER_TOKEN` (for an old token, edit the existing secret instead), and paste
   the token as its value.
3. Push any commit. A review will appear here in its place.

Or, from a clone of this repository with the [GitHub CLI](https://cli.github.com/) logged in, run
`deno task trainer:setup`.

Your game and its other checks aren't affected. If you don't want a trainer, delete
`.github/workflows/trainer.yml` and this message will stop.
