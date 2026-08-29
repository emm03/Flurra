# Heavenly OpenStreetMap data spike

This directory contains the isolated Heavenly geographic-data pipeline consumed
by the prototype map. It does not modify `heavenlyOfficialRuns.ts`.

## Source and scope

- Geometry source: OpenStreetMap only (`© OpenStreetMap contributors`, ODbL 1.0)
- Resort scope: OSM relation `12152028` (`Heavenly Mountain Resort`)
- Snapshot base timestamp: `2026-08-21T01:35:38Z`
- Imported: downhill pistes, lift ways, and named non-downhill piste features
- Not used as geometry: Heavenly/Vail/MyEpic, Trailforks, Skimap.org, or the
  illustrated official trail map

The illustrated official map is used only in the existing catalog and in human
review notes about names. It is not sampled, traced, georeferenced, or otherwise
used to create coordinates here.

## Files

- `osm-features.geojson`: 190 imported OSM features with geometry, OSM object
  type and ID, original name, piste difficulty, complete imported tags, direct
  OSM URL, snapshot timestamp, and ODbL attribution.
- `match-report.json`: conservative reconciliation against the 116 provisional
  Flurra run records. Candidate links remain separate from both source datasets
  so future mapping can be many-to-many.
- `manual-reviewed-matches.json`: explicit review ledger for approved aliases,
  unresolved candidates, and Mott/Killebrew subarea assignments. It preserves
  both source names, OSM references, explanations, and source provenance.
- `mott-killebrew-audit.md`: the 25-record canyon audit used for this review.
- `runtime-map-data.json`: generated, UI-safe bundle containing 104
  exact/normalized matches, five manually reviewed aliases, and 23 lift
  geometries. Canonical Flurra difficulty is attached for rendering; all other
  likely or ambiguous matches remain excluded.
- `scripts/maps/import-heavenly-osm.mjs`: reproducible Overpass importer and
  report generator.
- `scripts/maps/build-heavenly-runtime-map.mjs`: builds the local runtime bundle
  from the snapshot and exact-match report without making a network request.
- `scripts/maps/validate-heavenly-osm.mjs`: structural and cross-reference
  validation.

## Snapshot summary

- 165 downhill OSM features; 131 are named and represent 126 unique labels.
- 104 Flurra records match 109 OSM features exactly or after harmless name
  normalization.
- 5 additional OSM features are included through documented
  `manual-reviewed-alias` decisions, producing 109 verified Flurra records and
  114 verified run geometries in the runtime bundle.
- 11 OSM features produce 12 explicit likely/ambiguous candidate links.
- 3 Flurra records have no exact or candidate OSM geometry.
- 46 downhill OSM features have no Flurra run match, including 34 unnamed ways.
- 8 Flurra records currently correspond to multiple exact or candidate OSM
  ways/segments.
- No downhill piste relations were returned by this snapshot.
- 23 lift ways were found; 22 are named.
- 2 named non-downhill piste features were found.

## Matching policy

Exact comparison normalizes only case, Unicode apostrophe style, and whitespace.
Likely matches come from explicit review rules in the importer; there is no
general fuzzy-matching step. A likely or ambiguous candidate is not an approved
mapping unless it is separately recorded in `manual-reviewed-matches.json` with
source provenance and a review explanation. The Widow Maker / Lone Wolf
map-version conflict remains unresolved and excluded from the runtime map.

Mott and Killebrew subarea assignments are review metadata, not geographic
boundaries. Map label anchors are derived reproducibly from the verified OSM run
geometry assigned to each canyon; no illustrated-map geometry is traced or
copied.

OSM-only map features remain distinct from Flurra run records. For example,
`Groove Park` links to the separate Flurra map-feature catalog, and `Mott Canyon
Trail` is only a review candidate for the parent `Mott Canyon` map feature.

## Reproduce and validate

From the project root, with network access for the import:

```sh
node --no-warnings --experimental-strip-types scripts/maps/import-heavenly-osm.mjs
node --no-warnings --experimental-strip-types scripts/maps/build-heavenly-runtime-map.mjs
node --no-warnings --experimental-strip-types scripts/maps/validate-heavenly-osm.mjs
```

The geometry is sufficient for a useful non-navigational Heavenly prototype,
including recognizable runs and lifts. It is not sufficient for an authoritative
trail map or routing without reviewing composite labels, unnamed ways, missing
runs, duplicated segments, and difficulty disagreements.
