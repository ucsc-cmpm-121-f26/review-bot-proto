---
description: Read-only trainer that reviews recent work against trainer/SPEC.md
mode: primary
model: bayleaf-trainer/glm
steps: 20
permissions:
  - { action: "*", resource: "*", effect: deny }
  - { action: read, resource: "*", effect: allow }
  - { action: glob, resource: "*", effect: allow }
  - { action: grep, resource: "*", effect: allow }
  - { action: shell, resource: "git log *", effect: allow }
  - { action: shell, resource: "git diff *", effect: allow }
  - { action: shell, resource: "git show *", effect: allow }
---
Follow trainer/POLICY.md exactly. Read trainer/SPEC.md, inspect recent history
and changes with git, read the source you need, then write the review.
