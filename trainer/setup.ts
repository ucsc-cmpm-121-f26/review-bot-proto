// Gets your trainer a token: deno task trainer:setup
//
// You approve on BayLeaf in your browser; BayLeaf hands the token back to this
// script through a one-time code (OAuth authorization code + PKCE, sent to a
// tiny server on 127.0.0.1). The token is then stored in two places, without
// ever being printed: .env (for deno task review at your desk) and, if the
// GitHub CLI is set up, your repository's TRAINER_TOKEN secret (for CI).

const BAYLEAF = "https://api.bayleaf.dev";
const MODEL = Deno.env.get("TRAINER_MODEL") ?? "openrouter:z-ai/glm-5.3-flash";
const DAYS = Number(Deno.args[Deno.args.indexOf("--days") + 1] ?? 30) || 30;
const encoder = new TextEncoder();

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(
    /=+$/,
    "",
  );
}

async function run(cmd: string, args: string[], stdin?: string): Promise<boolean> {
  try {
    const child = new Deno.Command(cmd, {
      args,
      stdin: stdin === undefined ? "null" : "piped",
      stdout: "null",
      stderr: "null",
    }).spawn();
    if (stdin !== undefined) {
      const writer = child.stdin.getWriter();
      await writer.write(encoder.encode(stdin));
      await writer.close();
    }
    return (await child.status).success;
  } catch {
    return false; // command not installed
  }
}

// Refuse to write a secret into a file Git would commit.
if (!(await run("git", ["check-ignore", "-q", ".env"]))) {
  console.error("trainer:setup: .env is not ignored by Git. Add .env to .gitignore first.");
  Deno.exit(1);
}

// PKCE: only this process knows the verifier, so a stolen code is useless.
const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
const challenge = base64url(
  new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(verifier))),
);
const state = base64url(crypto.getRandomValues(new Uint8Array(16)));

let finish!: (code: string) => void, fail!: (reason: string) => void;
const callback = new Promise<string>((resolve, reject) => {
  finish = resolve;
  fail = reject;
});

const page = (text: string) =>
  new Response(`<!doctype html><title>Trainer setup</title><p>${text}</p>`, {
    headers: { "Content-Type": "text/html" },
  });

const server = Deno.serve({ hostname: "127.0.0.1", port: 0, onListen() {} }, (request) => {
  const url = new URL(request.url);
  if (url.pathname === "/done") {
    return page("Done. You can close this tab and return to your terminal.");
  }
  if (url.pathname !== "/callback") return new Response("Not found", { status: 404 });
  if (url.searchParams.get("state") !== state) {
    return new Response("State mismatch: ignored.", { status: 400 });
  }
  const code = url.searchParams.get("code");
  if (code) finish(code);
  else fail(url.searchParams.get("error") ?? "no code returned");
  // Redirect so the one-time code leaves the address bar.
  return Response.redirect(new URL("/done", url), 303);
});
const redirect_uri = `http://127.0.0.1:${server.addr.port}/callback`;

const repo = (await new Deno.Command("git", { args: ["rev-parse", "--show-toplevel"] }).output())
  .stdout;
const repoName = new TextDecoder().decode(repo).trim().split(/[\\/]/).pop() || "repo";

const descriptor = await fetch(`${BAYLEAF}/grants/clients`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ client_name: `Trainer for ${repoName}`, redirect_uri }),
});
if (!descriptor.ok) {
  console.error(`trainer:setup: BayLeaf refused to start (${descriptor.status}).`);
  Deno.exit(1);
}
const { client_id } = await descriptor.json();

const authorize = `${BAYLEAF}/grants/authorize?` + new URLSearchParams({
  client_id,
  response_type: "code",
  models: JSON.stringify([MODEL]),
  expires_in: String(DAYS * 86400),
  state,
  code_challenge: challenge,
  code_challenge_method: "S256",
});

console.log(`Approve ${DAYS} days of ${MODEL} for your trainer in the browser.`);
console.log(`If no browser opens, visit:\n\n  ${authorize}\n`);
const opener = Deno.build.os === "darwin"
  ? ["open", [authorize]]
  : Deno.build.os === "windows"
  ? ["rundll32", ["url.dll,FileProtocolHandler", authorize]]
  : ["xdg-open", [authorize]];
await run(opener[0] as string, opener[1] as string[]);

// BayLeaf's consent attempt itself lasts ten minutes.
const timeout = setTimeout(() => fail("timed out after 10 minutes"), 600_000);
const code = await callback.catch((reason) => {
  console.error(`trainer:setup: not approved (${reason}). Run deno task trainer:setup again.`);
  Deno.exit(1);
});
clearTimeout(timeout);
await server.shutdown();

const exchange = await fetch(`${BAYLEAF}/grants/token`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    grant_type: "authorization_code",
    code,
    client_id,
    redirect_uri,
    code_verifier: verifier,
  }),
});
if (!exchange.ok) {
  console.error(`trainer:setup: token exchange failed (${exchange.status}). Run setup again.`);
  Deno.exit(1);
}
const grant = await exchange.json();
const expires = new Date(grant.expires_at * 1000).toLocaleString();

// Keep any other lines already in .env; replace only TRAINER_TOKEN.
const previous = await Deno.readTextFile(".env").catch(() => "");
const kept = previous.split("\n").filter((line) => line && !line.startsWith("TRAINER_TOKEN="));
await Deno.writeTextFile(".env", [...kept, `TRAINER_TOKEN=${grant.access_token}`, ""].join("\n"));
console.log(`Token "${grant.name}" saved to .env. It expires ${expires}.`);

if (await run("gh", ["secret", "set", "TRAINER_TOKEN"], grant.access_token)) {
  console.log("Saved as your repository's TRAINER_TOKEN secret. Push to get a review.");
} else {
  console.log(
    "Could not set the GitHub secret automatically (is the GitHub CLI installed and\n" +
      "logged in, with this repo pushed to GitHub?). Do it by hand: copy the value after\n" +
      "TRAINER_TOKEN= in .env into Settings → Secrets and variables → Actions →\n" +
      "New repository secret, named TRAINER_TOKEN.",
  );
}
