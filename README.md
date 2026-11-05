# Firefly Catch (review bot prototype)

A tiny web game with a review bot.

Install [Deno](https://docs.deno.com/runtime/getting_started/installation/) and
[Git](https://git-scm.com/downloads), create your own repository from this template, clone it, and
run `deno task dev`.

## Review bot

On every push to `main`, an AI model reviews your work and comments on your commit. Its feedback is
practice, separate from anything course staff evaluate, and it can be wrong, so weigh what it says.
Reply to its comment to answer it; the next review reads your reply.

Until you set it up or opt out, every push gets a comment explaining how, and a red X. Both are
explained at the top of [the workflow](.github/workflows/review-bot.yml), which is the whole bot.
Tell the bot what to look for in [`REVIEWBOT.md`](REVIEWBOT.md). It also follows `AGENTS.md`, if you
add one.

The model runs on a throwaway machine where it may do anything, including running your game and
browsing the web. It sees your repository, its history, failure logs from your other workflows, and
comments from people with access. Only the text of its review leaves that machine, so it holds no key
that can change your repository. It can read its own token, though, so a page or file that fools it
could leak that token. The token can only spend your BayLeaf allowance on one model; revoke it on the
[dashboard](https://api.bayleaf.dev/dashboard) if that worries you. Comments are public if your
repository is.
