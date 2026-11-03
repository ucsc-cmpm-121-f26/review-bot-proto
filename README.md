# Firefly Catch (trainer prototype)

A tiny web game with a **trainer**: an AI reviewer that runs on every push to
`main` and compares your code with [`trainer/SPEC.md`](trainer/SPEC.md). Its
review appears on the run's summary page under the Actions tab. The trainer's
feedback is practice, separate from anything course staff evaluate.

Install [Deno](https://docs.deno.com/runtime/getting_started/installation/)
and [Git](https://git-scm.com/downloads), create your own repository from this
template, clone it, and run `deno task dev`.

## Set up your trainer

1. Sign in at <https://api.bayleaf.dev/dashboard>. Under **Temporary inference
   tokens**, create a token for `openrouter:z-ai/glm-5.3-flash` lasting 30 days,
   and copy it.
2. In your GitHub repository: **Settings → Secrets and variables → Actions →
   New repository secret**. Name it `TRAINER_TOKEN` and paste the token.
3. Push a commit. Open **Actions → Trainer** and read the summary.

The token spends your own BayLeaf allowance and can do nothing except ask that
model questions. Anyone who can push to your repository can use it, so add
only collaborators you trust. When it expires, the run fails and tells you so:
make a new token and replace the secret.

To ask your trainer at your desk before pushing:

```sh
TRAINER_TOKEN=sk-bayleaf-grant-... deno task review
```

No BayLeaf access? Any OpenAI-compatible service works: also set
`TRAINER_BASE_URL` and `TRAINER_MODEL`.

## What gets sent

[`trainer/review.ts`](trainer/review.ts) sends the spec, your last 20 commit
subjects, the diff being reviewed, and the files in `src/` to the model, with
[`trainer/POLICY.md`](trainer/POLICY.md) as its instructions. Both Markdown
files are yours: edit them to change what the trainer looks for and how it
talks to you.
