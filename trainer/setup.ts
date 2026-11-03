// Gets your trainer a token: deno task trainer:setup
//
// You approve on BayLeaf in your browser. BayLeaf sends a one-time code back to
// a tiny server this script runs on your own machine, and the script trades that
// code for a token. This is the OAuth authorization code flow with PKCE: only
// this script knows the secret "verifier", so a stolen code is useless.

const BAYLEAF = "https://api.bayleaf.dev";
const MODEL = "openrouter:z-ai/glm-5.3-flash";
const THIRTY_DAYS = 30 * 24 * 60 * 60;

const base64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const random = () => base64url(crypto.getRandomValues(new Uint8Array(32)));

const verifier = random();
const state = random();
const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));

const { promise: code, resolve: receiveCode } = Promise.withResolvers<string>();
const server = Deno.serve({ hostname: "127.0.0.1", port: 0, onListen() {} }, (request) => {
  const params = new URL(request.url).searchParams;
  if (params.get("state") !== state) return new Response("Wrong state.", { status: 400 });
  const received = params.get("code");
  if (!received) {
    console.error("Not approved. Run deno task trainer:setup to try again.");
    Deno.exit(1);
  }
  receiveCode(received);
  return new Response("Done. You can close this tab and return to your terminal.");
});
const redirect_uri = `http://127.0.0.1:${server.addr.port}/callback`;

async function post(path: string, body: unknown) {
  const response = await fetch(BAYLEAF + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    console.error(`BayLeaf answered ${response.status}: ${await response.text()}`);
    Deno.exit(1);
  }
  return response.json();
}

const { client_id } = await post("/grants/clients", { client_name: "Trainer", redirect_uri });
const approval = new URLSearchParams({
  client_id,
  response_type: "code",
  models: JSON.stringify([MODEL]),
  expires_in: String(THIRTY_DAYS),
  state,
  code_challenge: base64url(new Uint8Array(hash)),
  code_challenge_method: "S256",
});
console.log(
  `Open this link and approve a 30-day token:\n\n${BAYLEAF}/grants/authorize?${approval}\n`,
);

const grant = await post("/grants/token", {
  grant_type: "authorization_code",
  code: await code,
  client_id,
  redirect_uri,
  code_verifier: verifier,
});

// Hand the token to the GitHub CLI directly, so it never appears on screen.
let saved = false;
try {
  const gh = new Deno.Command("gh", {
    args: ["secret", "set", "TRAINER_TOKEN"],
    stdin: "piped",
  }).spawn();
  const writer = gh.stdin.getWriter();
  await writer.write(new TextEncoder().encode(grant.access_token));
  await writer.close();
  saved = (await gh.status).success;
} catch { /* the GitHub CLI is not installed */ }

if (saved) {
  console.log("Saved as your repository's TRAINER_TOKEN secret. Push a commit to get a review.");
} else {
  console.log(
    "Could not save it with the GitHub CLI. Treat this token like a password:\n\n" +
      `${grant.access_token}\n\n` +
      "On GitHub, go to Settings > Secrets and variables > Actions > New repository secret,\n" +
      "and save it with the name TRAINER_TOKEN.",
  );
}
Deno.exit(0);
