# Existing repository guidance maintenance

Plugin installation does not rewrite repository instructions. Initialization remains
no-overwrite; explicitly authorized maintenance is a separate operation. Reuse the
user's existing authorization for the intended documents. Source hashes bind the reviewed
bytes and are not a new human approval gate. Do not migrate unrelated consumer repos.

## Inspect and choose existing sources

```bash
node <plugin>/scripts/harness.mjs upgrade --root <repo>
node <plugin>/scripts/harness.mjs check --root <repo>
node <plugin>/scripts/harness.mjs init --root <repo> --spec-path planning/requirements.md --state-path planning/current.md
```

`upgrade` without a plan inventories only root guidance, the Harness supplement and
current spec/state candidates, reporting bytes, lines, hashes and possible old rules.
It does not enumerate or read all Sprint history. Legacy matches are prompts for a
semantic inspection, not proof that every conflicting instruction was detected.
`init` creates only missing root guidance/config, a short specification index and
current state when none is discovered. It never seeds six domain documents or
CONTEXT.md. It recognizes conventional source names and relevant root guidance
links; PROJECT.md, legacy docs/sprints/current.md and linked current.md are reused
rather than creating a second current-state document. Explicit source flags support
other layouts. Multiple existing candidates
are reported rather than replaced. Follow the project's actual canonical source;
do not treat every candidate as a required read. Use explicit flags when checking
or initializing a layout that discovery cannot identify.

## Prepare the reviewed candidate

The acting Agent reads the current source, the relevant specification and only the
history needed to resolve contradictions. It prepares replacement Markdown and a
JSON plan outside the target documents. The CLI does not infer a semantic summary
or decide which customer rules can be removed. For a managed block, replace only
that block and retain all surrounding bytes in `content`. An unknown document needs
an explicit scoped candidate. Never change runtime configuration or Agent definitions
through this maintenance command.

```json
{
  "version": 1,
  "id": "guidance-20260912-a1",
  "files": [{
    "path": "AGENTS.md",
    "beforeSha256": "<SHA256 of the exact current bytes>",
    "content": "<complete reviewed UTF-8 replacement>",
    "preserve": ["<exact existing custom rule or active constraint>"],
    "retire": ["<exact superseded instruction removed from the candidate>"]
  }]
}
```

Every entry names an existing Markdown document inside the repository, including
custom canonical layouts such as `planning/current.md`. No deletions, config,
Agent definitions, hidden directories, plugin implementation, path traversal, symlink destinations or duplicate paths are
accepted. `preserve` and `retire` are required arrays: populate them with the rules
relevant to the change. Preserve effective approvals, constraints and unresolved
items verbatim; the command additionally checks unchecked tasks and recognized
unresolved/approval/constraint sections. This mechanical check does not recognize
all natural-language decisions. The reviewing Agent must check any other active
rules and state meaning, then include exact important fragments in `preserve`.

For a large state, start from the latest explicit user instruction and current sources.
Search across the source for the relevant work's approvals, constraints, unresolved
items, counters and return destination; do not truncate inspection at the first 200
lines or require an audit of every past Sprint. Retain the original purpose and
completion condition, current work, unresolved/held items, next action, interruption
exit/return destination when relevant, authorization/constraints, specification links
and validation revision/evidence. Keep current counters without resetting them for
cleanup; do not infer approvals, verdicts or budgets from historical duplicates.
Distinguish implemented, verified and deployed. Do not create competing current
state in NEXT_SESSION/PROJECT. The original state remains in the migration archive.
When the candidate needs a historical link, choose the optional stable `id` before
writing the candidate (8-64 lowercase letters/digits/hyphens, unique per plan), then
link `.harness/migrations/<id>/originals/<original-path>` relative to the live document.
Preview permits only those exact archive targets that this plan will preserve;
post-apply checks verify that they exist. This avoids making the archive link depend
on the hash of its own content. Without an explicit `id`, a plan hash supplies the id.
Link that archive only when the original historical detail is needed. Do not turn
an approximate size target into a stopping condition or compress into giant lines.
A replaced decision must be identified as superseded in its relevant specification
or decision record, with the old decision retained in history.

Put the live values in one fixed `## 現在地` section at the start of the same canonical
state. Mark any retained old body as `旧状態（履歴・現行値は先頭の現在地へ移管済み）`;
old Current IDs and counters are historical, not competing current values. On future
resume read that current section and necessary references, not the whole old body or
archive. Resolve a specific contradiction against the latest human instruction and
current sources; leave uncertain authority pending and continue authorized independent work.

## Preview, apply, verify

```bash
node <plugin>/scripts/harness.mjs upgrade --root <repo> --plan <reviewed.json>
node <plugin>/scripts/harness.mjs upgrade --root <repo> --plan <reviewed.json> --apply
```

Preview writes nothing and prints the exact before/after document text, paths,
byte counts and hashes. Review changes within the authorized scope, including
custom rules, obsolete constraints and links. Apply rejects stale source hashes,
missing protected text, retained `retire` rules, unsafe paths and broken relative
file links in the candidates. Markdown anchors and prose semantics need Agent review.
The command uses no Git reset/stash/index writes, preserves unrelated dirty files,
and records exact original bytes plus the plan under
`.harness/migrations/<plan-id>/originals/<original-path>` with an applied result.
Those archived originals are byte-preserved audit copies, not relocated live specs:
resolve their historical relative links from their original paths recorded by the
plan. Check live-document links, not links inside raw backup copies. The archive may
contain private project context; it belongs to that project and is not a public fixture.

Apply checks output hashes and links, then reports the recovery path. Repeating a
fully applied plan is a no-op. A changed source requires a new candidate and preview,
not overwriting with an old plan. Partial/failed applies retain backups; inspect the
reported archive before recovery. In-process failures attempt rollback only while
the document still equals this command's output, so another writer's edit is not
reverted. This is a local maintenance operation, not a crash-proof transaction.

If a compact candidate fails protection checks, retain the exact original body and
prepare a fallback candidate in the same state: one short `## 現在地` section followed
by the explicitly marked old body. If a current section already exists, replace it
rather than stacking another one. Reuse preview/apply and preserve protected text;
do not weaken checks, build a summarizer, or start an all-history investigation.
Record `整理未完了`, the protection failure and a separate maintenance follow-up in the
current section, together with the authorized independent next action and any held
operation whose approval is unknown. This fallback establishes current meaning but
does not claim that archival cleanup succeeded. If it also fails, leave the source
untouched and report the specific blocker; continue work independent of that write.
Do not repeatedly archive the unchanged old body merely to meet a size target.

Finish by checking the relevant current source/spec references, unresolved items,
active approvals, old rules and the requested product behavior. Record the migrated
revision and evidence by replacing the current section at handoff, completion, review
or return. Keep dated reports and full verification output in existing progress,
feedback or reports, with only necessary links in state. Do not update installed caches or unrelated repositories
unless authorized separately.
