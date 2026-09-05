# Preserve the previous admin appearance

Labels: wayfinder:task
Type: task
Status: resolved
Assignee: codex
Parent: [Adopt the DataEntropy design across non-admin surfaces](../map.md)
Blocked by: none

## Question

What shared style and portal boundaries must be isolated so admin retains its pre-adoption appearance in both themes? Inspect current callers and the pre-edit baseline, identify the smallest compatible scope, and record evidence. Do not implement the redesign.

## Answer

Admin now uses `admin-shell`, which restores its established light and dark semantic tokens and Plus Jakarta Sans. `Admin` also applies `admin-context` to `body` while mounted so Radix portals and shared notifications inherit the same palette. Cleanup removes the body scope on unmount. This is the smallest boundary covering the page and its portals; existing admin feature behavior remains unchanged.
