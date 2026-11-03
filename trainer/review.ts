// The trainer: one review of recent work against trainer/SPEC.md, guided by
// trainer/POLICY.md. Runs the same way at your desk (deno task review) and in
// GitHub Actions (.github/workflows/trainer.yml). Everything it sends to the
// model is assembled below, so you can read exactly what leaves your machine.

const BASE_URL = Deno.env.get("TRAINER_BASE_URL") ?? "https://api.bayleaf.dev/v1";
const MODEL = Deno.env.get("TRAINER_MODEL") ?? "openrouter:z-ai/glm-5.3-flash";
const TOKEN = Deno.env.get("TRAINER_TOKEN") ?? "";
const IN_CI = Deno.env.get("GITHUB_ACTIONS") === "true";
const MAX_DIFF_CHARS = 40_000;
const MAX_FILE_CHARS = 12_000;

// Advice for every way this can fail, keyed by what the student can do about it.
function stop(message: string, code = 1): never {
  console.error(IN_CI ? `::error title=Trainer::${message}` : `trainer: ${message}`);
  Deno.exit(code);
}

async function git(...args: string[]): Promise<string> {
  const out = await new Deno.Command("git", { args, stdout: "piped", stderr: "piped" }).output();
  if (!out.success) throw new Error(new TextDecoder().decode(out.stderr).trim());
  return new TextDecoder().decode(out.stdout);
}

async function readOr(path: string, fallback: string): Promise<string> {
  try {
    return await Deno.readTextFile(path);
  } catch {
    return fallback;
  }
}

function clip(text: string, limit: number): string {
  return text.length <= limit
    ? text
    : `${text.slice(0, limit)}\n[... clipped at ${limit} characters]`;
}

// What changed. In CI: everything in this push. At your desk: uncommitted work,
// or the latest commit when the working tree is clean.
async function recentChanges(): Promise<{ label: string; diff: string }> {
  const before = Deno.env.get("TRAINER_BEFORE") ?? "";
  if (IN_CI && before && !/^0+$/.test(before)) {
    try {
      return {
        label: `this push (${before.slice(0, 7)}..HEAD)`,
        diff: await git("diff", `${before}..HEAD`),
      };
    } catch { /* force-push or shallow history: fall through */ }
  }
  const uncommitted = await git("diff", "HEAD");
  if (!IN_CI && uncommitted.trim()) return { label: "uncommitted changes", diff: uncommitted };
  return { label: "the latest commit", diff: await git("show", "--format=%H%n%s%n%n%b", "HEAD") };
}

async function sourceFiles(): Promise<string> {
  const tracked = (await git("ls-files", "src", "index.html")).split("\n").filter(Boolean);
  const parts = await Promise.all(
    tracked.map(async (path) =>
      `--- ${path}\n${clip(await Deno.readTextFile(path), MAX_FILE_CHARS)}`
    ),
  );
  return parts.join("\n\n");
}

if (!TOKEN) {
  const setup = "No TRAINER_TOKEN found. See 'Set up your trainer' in README.md.";
  // Opt-in: an unconfigured trainer warns instead of failing your push.
  if (IN_CI) {
    console.log(`::warning title=Trainer not set up::${setup}`);
    Deno.exit(0);
  }
  stop(`${setup}\nAt your desk: TRAINER_TOKEN=sk-bayleaf-grant-... deno task review`);
}

const [spec, policy, log, changes, files] = await Promise.all([
  readOr("trainer/SPEC.md", "(no SPEC.md)"),
  readOr("trainer/POLICY.md", "(no POLICY.md)"),
  git("log", "--format=%h %ad %s", "--date=short", "-n", "20"),
  recentChanges(),
  sourceFiles(),
]);

const prompt = `# SPEC.md (what the software should do)\n${spec}
# Recent history (newest first)\n${log}
# What changed: ${changes.label}\n${clip(changes.diff, MAX_DIFF_CHARS)}
# Current source\n${files}`;

const response = await fetch(`${BASE_URL}/chat/completions`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
  body: JSON.stringify({
    model: MODEL,
    messages: [{ role: "system", content: policy }, { role: "user", content: prompt }],
    max_tokens: 8192,
    reasoning: { effort: "low" },
  }),
}).catch((error) => stop(`Could not reach ${BASE_URL}: ${error.message}`));

if (response.status === 401) {
  stop(
    "Your trainer token expired or was revoked (tokens last at most 30 days, and " +
      "regenerating your BayLeaf API key revokes them). Create a new one at " +
      "https://api.bayleaf.dev/dashboard and update the TRAINER_TOKEN secret.",
  );
}
if (response.status === 403) {
  stop(
    `Your token does not include ${MODEL}. Create a token that selects it, or set TRAINER_MODEL.`,
  );
}
if (response.status === 429) stop("Your BayLeaf allowance is used up for now. Try again later.");
if (!response.ok) {
  stop(`The model service answered ${response.status}: ${clip(await response.text(), 500)}`);
}

const body = await response.json();
const review: string = body.choices?.[0]?.message?.content?.trim() ?? "";
if (!review) {
  stop(`No visible review came back (finish_reason: ${body.choices?.[0]?.finish_reason}).`);
}

const report =
  `## Trainer review of ${changes.label}\n\n${review}\n\n<sub>${MODEL} · reviewed against trainer/SPEC.md</sub>\n`;
console.log(report);
const summary = Deno.env.get("GITHUB_STEP_SUMMARY");
if (summary) await Deno.writeTextFile(summary, report, { append: true });
