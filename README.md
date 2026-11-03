# Firefly Catch (review bot prototype)

A tiny web game with a **review bot**: an AI that reviews every push to `main`
against [`review-bot/SPEC.md`](review-bot/SPEC.md) and posts a public comment on your
commit. The review bot's feedback is practice, separate from anything course staff
evaluate.

Install [Deno](https://docs.deno.com/runtime/getting_started/installation/)
and [Git](https://git-scm.com/downloads), create your own repository from this
template, clone it, and run `deno task dev`.

## Set up your review bot

```sh
deno task review-bot:setup
```

Open the link it prints and approve a 30-day token on BayLeaf. If the
[GitHub CLI](https://cli.github.com/) is installed and logged in, the script
saves the token as your repository's `REVIEW_BOT_TOKEN` secret; otherwise it shows
you how to add it by hand. On a remote machine such as a Codespace, the approval
can't reach the script: follow the browser steps in
[`review-bot/SETUP-HELP.md`](review-bot/SETUP-HELP.md) instead.

Push a commit, wait a couple of minutes, and read the comment on that commit. To
answer the review bot, reply to its comment; the next review reads your reply.

If the token is missing or has expired, the **Review Bot** run goes red and the comment
on your commit says how to fix it, in your browser if you prefer. Red means you
got no review, never that your code did badly.

## Opt out

The review bot is yours to turn off. In
[`.github/workflows/review-bot.yml`](.github/workflows/review-bot.yml), change
`if: true` to `if: false`, or delete that file. The comment at the top of the file
explains both. Until you finish setup or opt out, every push gets a reminder
comment and a red X.

## How it works

It's all in a few short files, yours to read and change:

- [`.github/workflows/review-bot.yml`](.github/workflows/review-bot.yml) runs on each
  push: one job runs the model, a separate job posts its review.
- [`.opencode/agents/review-bot.md`](.opencode/agents/review-bot.md) is the agent's
  instructions and what it may do. [`opencode.jsonc`](opencode.jsonc) names the model.
- [`review-bot/SPEC.md`](review-bot/SPEC.md) is what the software should do.
- [`review-bot/POLICY.md`](review-bot/POLICY.md) is how the review bot should talk to you.

**What reaches the model:** your repository, its Git history, failure logs from
its other workflows, and earlier reviews
and replies from people with access to the repository. Inference runs through
[BayLeaf](https://bayleaf.dev/), using your own allowance. Reviews are public if
your repository is, and the token can be used by anyone who can push to the
repository.

**What the model can do:** read those things and write `review.md`. It never holds
a key that can change your repository, but it can still be wrong, so weigh what it
says.
