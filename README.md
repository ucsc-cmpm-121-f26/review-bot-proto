# Firefly Catch (review bot prototype)

A tiny web game with a review bot.

Install [Deno](https://docs.deno.com/runtime/getting_started/installation/) and
[Git](https://git-scm.com/downloads), create your own repository from this template, clone it, and
run `deno task dev`.

## Review bot

On every push to `main`, an AI model reviews your work and comments on your commit. Its feedback is
practice, separate from anything course staff evaluate, and it can be wrong, so weigh what it says.
Reply to a comment to answer it; the next review reads your reply. Tell it what to look for in
[`REVIEWBOT.md`](REVIEWBOT.md).

[The workflow](.github/workflows/review-bot.yml) is the whole bot, and the top of that file explains
how to set it up or opt out. Until you do one or the other, every push gets a reminder and a red X.

The model runs on a throwaway machine where it may do anything, including running your project and
browsing the web. It sees your repository, its history, failure logs from your other workflows, and
comments from people with access. Only the text of its review leaves that machine, and it holds no key
that can change your repository. It can read its own token, so a page or file that fools it could
leak that token, which can only spend your BayLeaf allowance on one model. You can revoke it on the
[dashboard](https://api.bayleaf.dev/dashboard). Comments are public if your repository is.
