# Firefly Catch (trainer prototype)

A tiny web game with a **trainer**: an AI reviewer that runs on every push to
`main` and compares your code with [`trainer/SPEC.md`](trainer/SPEC.md). Its
review appears on the run's summary page under the Actions tab. The trainer's
feedback is practice, separate from anything course staff evaluate.

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
commit, open **Actions → Trainer**, and read the summary.

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

[`trainer/review.ts`](trainer/review.ts) sends the spec, your last 20 commit
subjects, the diff being reviewed, and the files in `src/` to the model, with
[`trainer/POLICY.md`](trainer/POLICY.md) as its instructions. Both Markdown
files are yours: edit them to change what the trainer looks for and how it
talks to you.
