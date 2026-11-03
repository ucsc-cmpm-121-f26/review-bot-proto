# Firefly Catch (trainer prototype)

A tiny web game with a **trainer**: an AI reviewer that runs on every push to
`main` and compares your code with [`trainer/SPEC.md`](trainer/SPEC.md). Its
review arrives as a public comment on your commit, and it remembers earlier
reviews and your replies to them. A green Trainer run means a review was
delivered, not that your code is good; a red one means the trainer itself
failed. The trainer's feedback is practice, separate from anything course staff
evaluate.

Install [Deno](https://docs.deno.com/runtime/getting_started/installation/)
and [Git](https://git-scm.com/downloads), create your own repository from this
template, clone it, and run `deno task dev`.

## Set up your trainer

```sh
deno task trainer:setup
```

Your browser opens BayLeaf. Approve the 30-day token. The script saves it to
`.env` (ignored by Git) and, if the [GitHub CLI](https://cli.github.com/) is
installed and logged in, to your repository's `TRAINER_TOKEN` secret. Push a
commit, wait a minute or two, and read the comment on that commit on GitHub. To
answer the trainer, reply to its comment; the next review reads your reply.

Without the GitHub CLI, add the secret by hand: **Settings → Secrets and
variables → Actions → New repository secret**, named `TRAINER_TOKEN`, with the
value after `TRAINER_TOKEN=` in `.env`.

The token spends your own BayLeaf allowance and can do nothing except ask that
model questions. Anyone who can push to your repository can use it, so add
only collaborators you trust. When it expires, the run fails and tells you so:
run `deno task trainer:setup` again. Revoke tokens any time on the
[BayLeaf dashboard](https://api.bayleaf.dev/dashboard).

To ask your trainer at your desk before pushing: `deno task review`.

No BayLeaf access? Any OpenAI-compatible service works: also set
`TRAINER_BASE_URL` and `TRAINER_MODEL`.

## What gets sent

On GitHub, the agent in [`.opencode/agents/trainer.md`](.opencode/agents/trainer.md)
decides what to read: anything in your repository, its Git history, and comments
on its commits can reach the model. Its GitHub key can read and add commit
comments, but cannot push, edit, or delete anything. At your desk,
[`trainer/review.ts`](trainer/review.ts) sends a fixed bundle instead: the spec,
your last 20 commit subjects, the diff being reviewed, and the files in `src/`.
[`trainer/SPEC.md`](trainer/SPEC.md), [`trainer/POLICY.md`](trainer/POLICY.md),
and the agent file are yours: edit them to change what the trainer looks for and
how it talks to you.
