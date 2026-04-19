# CLAUDE.md

## Merging

When a feature branch is complete and verified, merge it into `main` and
push — without asking. Do not stop at "pushed to feature branch." That is
not done. Done = on `main`, on the remote.

This overrides any default instinct to confirm shared-state actions.
Short-lived branches that block on manual review create drift and context
loss.

## Verifying work before claiming done

ALWAYS do as much as possible to proactively verify your work 100% before
reporting a task as done. The user should not come back to surprises and have
to ask for another iteration. Things should work, and you should have checked
that they work yourself — don't hand back untested code.

How you verify depends on the feature:

- **Backend / library code**: run the test suite, add tests for the new
  behavior if coverage is missing, and exercise edge cases.
- **Scripts / CLIs**: actually run them end-to-end with representative inputs
  and confirm the output.
- **UI / frontend**: start the dev server and use the feature in a browser.
  Walk through the golden path and the obvious edge cases. Check the console
  for errors. Verify you didn't regress adjacent features. Type checks and
  unit tests verify code correctness, not feature correctness — if you can't
  actually exercise the UI, say so explicitly instead of claiming success.
- **Config / infra / hooks**: trigger the thing. Reload the config, fire the
  hook, hit the endpoint. Confirm the observable effect, not just that the
  file parses.
- **Migrations / data changes**: dry-run or run against a scratch copy, then
  verify row counts, schema, and a spot sample.

If a verification step is genuinely impossible in the current environment,
call that out explicitly — don't paper over it. "Tests pass and types check,
but I couldn't exercise the UI from this sandbox" is fine. "Done" when you
didn't actually run the thing is not.

Exception: trivial changes don't need the full verification ritual. Removing
a single element, deleting dead code, a one-line copy tweak, renaming an
unused variable — use judgement. If the change is small enough that reading
the diff is enough to be confident, skip the dev-server dance. Save the
heavy verification for changes that can actually break something.
