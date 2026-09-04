# Mott and Killebrew canyon run audit

Audit date: 2026-08-28

This audit reconciles the 25 canonical Flurra records currently grouped under
`Mott & Killebrew Canyons` against the checked-in OpenStreetMap snapshot and
the existing official-map source records. The official illustrated map is used
only to review names, difficulty symbols, area restrictions, and organizational
placement. It is not used as geographic geometry.

## Source and classification notes

- **Official source:** `heavenly-official-winter-trail-map`, represented by the
  user-supplied official map and Heavenly's official 2021 winter trail-map PDF.
- **OSM source:** `data/maps/heavenly/osm-features.geojson`, snapshot timestamp
  `2026-08-21T01:35:38Z`, OpenStreetMap ODbL 1.0.
- **Killebrew placement:** the official map places the named run cluster west
  of Rocky Point with the `Killebrew Canyon` terrain label.
- **Mott placement:** the official map places the named run cluster east of
  Rocky Point around the `Mott Canyon` terrain label and Mott Canyon lift.
- **Shared approach/access:** Perimeter, Upper Perimeter, Milky Way Bowl, and
  Milky Way are in the broader combined catalog group, but the source map does
  not conclusively place them inside either printed canyon label. They are not
  forced into a canyon for cartography.
- **Area restriction:** the official map marks Mott and Killebrew collectively
  as experts-only gated terrain. This is separate from each run's canonical
  individual difficulty.

## Complete 25-record audit

| Flurra ID | Canonical name | Canonical difficulty | Reviewed subarea | OSM reference | OSM name | OSM difficulty | Pre-change status | In runtime | Proposed action | Evidence/source note |
|---|---|---|---|---|---|---|---|---|---|---|
| `boundary-chutes` | Boundary Chutes | Experts only | Killebrew Canyon | `way/313466516` | Boundry Chutes | expert | Likely | No | Approve reviewed alias | Official map spells `Boundary Chutes`; OSM omits the second `a`. Official-map Killebrew cluster. |
| `outer-limits` | Outer Limits | Most difficult | Killebrew Canyon | `way/313466657` | Outer Limits | expert | Exact | Yes | Keep exact match | Exact name; official-map Killebrew cluster. Preserve canonical individual difficulty. |
| `pipeline` | Pipeline | Most difficult | Killebrew Canyon | `way/1389656303` | Pipeline | expert | Exact | Yes | Keep exact match | Exact name; official-map Killebrew cluster. Preserve canonical individual difficulty. |
| `ramarrahs` | Ramarrah's | Most difficult | Killebrew Canyon | `way/1389656304` | Ramarah's | expert | Likely | No | Approve reviewed alias | Official map uses two `r` characters in `Ramarrah's`; OSM uses one. Official-map Killebrew cluster. |
| `the-fingers` | The Fingers | Most difficult | Killebrew Canyon | `way/1389656309` | The Fingers | expert | Exact | Yes | Keep exact match | Exact name; official-map Killebrew cluster. Preserve canonical individual difficulty. |
| `stateline-chute` | Stateline Chute | Most difficult | Killebrew Canyon | `way/1389656306` | Stateline | expert | Likely | No | Approve reviewed alias | OSM shortens the official-map name by omitting `Chute`. Official-map Killebrew cluster. |
| `bobs-boulevard` | Bob's Boulevard | Most difficult | Killebrew Canyon | `way/1389656305` | Bobs Boulevard | expert | Likely | No | Approve reviewed alias | OSM omits the possessive apostrophe from the official-map name. Official-map Killebrew cluster. |
| `sweetwater` | Sweetwater | Most difficult | Killebrew Canyon | `way/1389656307` | Sweetwater | expert | Exact | Yes | Keep exact match | Exact name; official-map Killebrew cluster. Preserve canonical individual difficulty. |
| `the-y` | The "Y" | Most difficult | Mott Canyon | `way/1389656312` | The "Y" | expert | Exact | Yes | Keep exact match | Exact name; official-map Mott cluster east of Rocky Point. Preserve canonical individual difficulty. |
| `bills` | Bill's | Most difficult | Mott Canyon | `way/313466505` | Bill's | expert | Exact | Yes | Keep exact match | Exact name; official-map Mott cluster east of Rocky Point. Preserve canonical individual difficulty. |
| `snake-eyes` | Snake Eyes | Most difficult | Mott Canyon | `way/313466705` | Snake Eyes | expert | Exact | Yes | Keep exact match | Exact name; official-map Mott cluster east of Rocky Point. Preserve canonical individual difficulty. |
| `lone-wolf` | Lone Wolf | Most difficult | Mott Canyon | `way/313466743` | Widow Maker | expert | Ambiguous | No | Keep unresolved | The canonical record retains `Widow Maker` only as an official map-version conflict. Existing evidence does not prove that this OSM way is the current `Lone Wolf` run. |
| `hully-gully` | Hully Gully | Most difficult | Mott Canyon | `way/313466587` | Hully Gully | expert | Exact | Yes | Keep exact match | Exact name; official-map Mott cluster east of Rocky Point. Preserve canonical individual difficulty. |
| `pinenuts` | Pinenuts | Most difficult | Mott Canyon | `way/313466671` | Pinenuts | expert | Exact | Yes | Keep exact match | Exact name; official-map Mott cluster east of Rocky Point. Preserve canonical individual difficulty. |
| `southern-comfort` | Southern Comfort | Most difficult | Mott Canyon | `way/313466709` | Southern Comfort | expert | Exact | Yes | Keep exact match | Exact name; official-map Mott cluster east of Rocky Point. Preserve canonical individual difficulty. |
| `on-hold` | On Hold | Most difficult | Mott Canyon | `way/313466652` | On Hold | expert | Exact | Yes | Keep exact match | Exact name; official-map Mott cluster east of Rocky Point. Preserve canonical individual difficulty. |
| `promised-land` | Promise Land | Most difficult | Killebrew Canyon | `way/313466683` | Promised Land | expert | Likely | No | Approve reviewed alias | Official map reads `Promise Land`; OSM inserts `d`. Official-map Killebrew cluster. |
| `north-40` | North 40 | Most difficult | Killebrew Canyon | `way/313466640` | North 40 | expert | Exact | Yes | Keep exact match | Exact name; official-map Killebrew cluster. Preserve canonical individual difficulty. |
| `hemlock` | Hemlock | Most difficult | Killebrew Canyon | `way/313466579` | Hemlock | expert | Exact | Yes | Keep exact match | Exact name; official-map Killebrew cluster. Preserve canonical individual difficulty. |
| `ernies` | Ernie's | Most difficult | Killebrew Canyon | `way/313466559` | Ernie's | expert | Exact | Yes | Keep exact match | Exact name; official-map Killebrew cluster. Preserve canonical individual difficulty. |
| `rim-trail` | Rim Trail | Most difficult | Killebrew Canyon | `way/313466691` | Rim Trail | expert | Exact | Yes | Keep exact match | Exact name; official-map Killebrew cluster. Preserve canonical individual difficulty. |
| `perimeter` | Perimeter | More difficult | Shared approach/access | `way/313466668` | Perimeter | intermediate | Exact | Yes | Keep exact; do not force canyon | Exact name and aligned difficulty. Official map shows this as approach/access terrain outside either printed canyon label cluster. |
| `upper-perimeter` | Upper Perimeter | More difficult | Shared approach/access | `way/313466732` | Upper Perimeter | intermediate | Exact | Yes | Keep exact; do not force canyon | Exact name and aligned difficulty. Official map shows this as approach/access terrain outside either printed canyon label cluster. |
| `milky-way-bowl` | Milky Way Bowl | Most difficult | Shared approach/access | `way/313466629` | Milky Way Bowl | advanced | Exact | Yes | Keep exact; do not force canyon | Exact name and aligned difficulty. Official map shows the bowl above the shared canyon gate complex, not conclusively inside one canyon. |
| `milky-way` | Milky Way | Most difficult | Shared approach/access | `way/1382406254` | Milky Way | advanced | Exact | Yes | Keep exact; do not force canyon | Exact name and aligned difficulty. Official map shows the route above the shared canyon gate complex, not conclusively inside one canyon. |

## Audit totals before implementation

- Canonical records accounted for: **25 / 25**
- Exact/normalized runtime matches: **19**
- High-confidence aliases proposed for approval: **5**
- Unresolved map-version conflict: **1** (`Widow Maker` / `Lone Wolf`)
- Confirmed Killebrew organizational records: **13**
- Confirmed Mott organizational records: **8**
- Shared approach/access records not forced into a canyon: **4**

