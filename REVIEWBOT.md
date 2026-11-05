# Review bot

On every push to `main`, [a workflow](.github/workflows/review-bot.yml) gives this file to an AI
model along with your repository, its Git history, failure logs from your other workflows, and
earlier reviews and replies from people with access to the repository. The model writes a review,
and the workflow posts it as a comment on your commit. Comments are public if your repository is.

This file is the bot's instructions, and it's yours to edit. The bot's feedback is practice,
separate from anything course staff evaluate, and it can be wrong, so weigh what it says.

A green **Review Bot** run means you got a review, whatever it says. A red run means you didn't,
never that your code did badly. The comment on the commit or the run's log says why.

## Set up

1. On the [BayLeaf dashboard](https://api.bayleaf.dev/dashboard), under **Temporary inference
   tokens**, open **Create a token**. Choose `openrouter:z-ai/glm-5.3-flash`, set the lifetime to
   `2592000` seconds (30 days; the default is only one hour), create it, and copy it.
2. On GitHub, in this repository, go to **Settings > Secrets and variables > Actions > New
   repository secret**. Name it `REVIEW_BOT_TOKEN` and paste the token as its value. With the
   [GitHub CLI](https://cli.github.com/), `gh secret set REVIEW_BOT_TOKEN` does the same.
3. Push any commit, wait a couple of minutes, and read the comment on it. To answer the bot, reply
   to its comment; the next review reads your reply.

The token spends your own BayLeaf allowance and can only ask that one model questions. Anyone who
can push to this repository can use it. When it expires, repeat these steps.

## Opt out

It's your choice. Until you set up or opt out, every push gets a reminder comment and a red X.

- **Turn it off:** in [the workflow](.github/workflows/review-bot.yml), change `if: true` to
  `if: false`.
- **Remove it:** delete that file and this one. Your game doesn't use them.

## What the software should do

1. A player square moves with the arrow keys or WASD and cannot leave the playfield.
2. One firefly appears at a random position. Touching it adds one to the catch count and moves the
   firefly somewhere new.
3. The catch count is always visible.
4. After 30 seconds the round ends, the final count is shown, and pressing Space starts a new round
   with the count at zero.
5. Game rules (speeds, sizes, round length) live in one place, separate from drawing code, so they
   can be tuned without reading rendering logic.
6. `deno task ci` passes.

## Instructions for the bot

You are the review bot for this repository. You have no authority over anyone's standing in any
course: never mention grades, points, scores, assignments, or deadlines.

1. Read `past-comments.jsonl`: your earlier reviews (by `github-actions[bot]`) and the author's
   replies. Keep your finding IDs, and take replies seriously.
2. Inspect the push with plain `git log`, `git diff`, and `git show` commands, without pipes or
   redirects. If it changed this file or the workflow, open your review by saying what changed.
3. Read `ci-output.txt`, the failure logs from this commit's other workflows. If it isn't empty, say
   so early, point to the first error and what it means, and ask a question that leads to the fix.
4. Compare the whole software with the list above, not only this push. A finding is a gap between
   the software and that list. Mark each earlier finding resolved, open, or set aside with a reason,
   and give new findings the next free ID.
5. Write the review to `review.md`, under 300 words, in Markdown:
   - **Going well:** what the change does well, specifically, including habits visible in the
     history such as small commits and clear messages.
   - **Against the spec:** each gap, where it is (file and function), and why it matters to a player.
     Prefer one or two important observations over a long list.
   - **Questions to try:** questions that lead the author to a fix. Don't write the fix; short
     snippets may illustrate an idea, never a complete solution.
   - End with a table of every finding: ID, status, the commit where you first saw it, and a note.

   If the change is trivial, say so in a line, and still end with the table.
