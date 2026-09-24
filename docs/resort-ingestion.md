# Flurra resort registry and ingestion

`data/resorts.ts` is the canonical product registry for resort identity, official facts, photography provenance, routes, capabilities, and publication readiness. UI components read names, stats, support labels, and images from this registry instead of duplicating them.

## Capability rules

- `full-map`: verified local geometry and a reconciled run directory are published. Heavenly is the reference implementation.
- `directory`: a verified run directory is published without interactive geometry.
- `preview`: official resort facts and verified reusable photography are published, while resort-specific trail geometry and directories remain unavailable.
- `coming-soon`: only a discovery record is ready.

A preview resort must never claim a full map. Geometry from one resort must never be cloned or relabeled for another.

## Resort ingestion lifecycle

Every new resort moves through the same reviewable path:

1. **Discover** — reserve a stable resort ID and slug; record aliases and candidate official sources.
2. **Import** — snapshot permitted source data with original identifiers and provenance. Do not scrape official illustrated-map geometry.
3. **Normalize** — standardize fields while retaining original names, tags, source IDs, and licensing information.
4. **Reconcile** — connect imported features to canonical runs with explicit exact, normalized, reviewed-alias, ambiguous, or missing states.
5. **Verify** — manually review facts, naming, difficulty, geometry links, image rights, and resort association.
6. **Publish** — declare the smallest honest capability state and expose only reviewed data.

The `ingestion` object records lifecycle stage, source identifiers, geometry state, reconciliation state, and verification scope. Canonical resort records contain no saved/skied state; personal progress remains in the shared client-side progress store.

## Facts and photography

- Every published mountain fact points to a `sourceId` in the resort's `sources` collection.
- Published facts use current official resort pages or official trail-map facts. They are static reference facts, not live operating status.
- `verified-photo` records include resort association, source page, creator, credit line, license, reuse status, and alt text.
- If reusable resort-specific photography cannot be verified, use `branded-placeholder`. Never imply that a generic mountain image depicts a named resort.
- Community photos and reports are separate sample content and must remain explicitly labeled as samples rather than official or live resort information.

## Adding a resort

Add the registry record first, include exact non-ambiguous search aliases, add official source records, and run the registry tests. A new route can use the reusable preview until its directory and geometry have completed reconciliation. Promote capability and publication fields only after the corresponding data passes validation.
