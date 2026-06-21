# MuniTwin AI — Product Spec

---

## Persona

**Mario, Technical Manager of the Municipality of Millbrook** (fictional town, ~3,000 inhabitants).
Not an IT specialist — a municipal surveyor who manages maintenance and public assets with limited resources.

---

## User Journey (MVP demo)

```
1. ENTER the map   →  sees the municipality territory in 2D
                       active layers: roads, streetlights, green spaces, networks

2. EXPLORE         →  clicks on a streetlight
                       card appears: ID, year installed, status, last maintenance

3. FILTER          →  activates the "critical assets" filter
                       map highlights assets past end-of-life or with anomalies

4. QUERY           →  opens the chatbot panel
                       types (or clicks a suggested query):
                       "How many streetlights need replacing before year end?"
                       → response with list, updated map, estimated cost

5. PLAN            →  sees a "scheduled works" view
                       simplified calendar with priority ranking

6. SHARE           →  exports or shares the link to the filtered view
```

---

## Demo Use Cases (simulated chatbot)

The chatbot in the MVP is simulated: pre-built queries with hardcoded responses based on JSON data.

| # | Query | Expected response |
|---|---|---|
| 1 | "Streetlights approaching end of life" | List with ID, street, year installed, priority |
| 2 | "Manholes not inspected in over 12 months" | List + map highlight |
| 3 | "Which road section is most degraded?" | Street X, last resurfaced year Y, high priority |
| 4 | "Trees with risk alerts" | N trees, detail by park / street |
| 5 | "Estimated cost of extraordinary maintenance this year" | Total by asset category |

Use cases 1–2 are the core of the demo (operational infrastructure).
Use cases 3–4 show extensibility to new domains.
Use case 5 introduces managerial and economic value.

---

## Data Model

Assets are stored in a single GeoJSON FeatureCollection: `data/assets.json`.

### Common fields (all asset types)

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier (e.g. `SL-001`, `MH-004`) |
| `asset_type` | string | `streetlight` / `manhole` / `road` / `tree` |
| `label` | string | Human-readable name |
| `street` | string | Street or location |
| `notes` | string | Free-text observations |

### Type-specific fields

**Streetlights**

| Field | Type | Description |
|---|---|---|
| `year_installed` | int | Installation year |
| `useful_life_years` | int | Expected service life |
| `lamp_type` | string | `LED` / `sodium` / `mercury` |
| `power_w` | int | Power in watts |
| `last_maintenance` | date | Last maintenance date |

**Manholes**

| Field | Type | Description |
|---|---|---|
| `network_type` | string | `sewer` / `stormwater` / `combined` |
| `last_inspection` | date | Last inspection date |

**Roads** (geometry: `LineString`)

| Field | Type | Description |
|---|---|---|
| `length_m` | int | Segment length in metres |
| `surface_type` | string | `asphalt` / `cobblestone` / etc. |
| `year_last_resurfacing` | int | Year of last resurfacing |
| `degradation_index` | int | 0–10 scale (field-assessed) |

**Trees**

| Field | Type | Description |
|---|---|---|
| `species` | string | Latin name |
| `common_name` | string | Common name |
| `height_m` | float | Height in metres |
| `year_planted` | int | Planting year |
| `alerts` | array | Risk flags: `lean`, `disease`, `root_damage`, `dead_branch` |

### Status — computed on-the-fly in JS (no stored field)

| Asset type | Critical | Warning | OK |
|---|---|---|---|
| Streetlight | `current_year − year_installed >= useful_life_years` | remaining life ≤ 2 years | otherwise |
| Manhole | last inspection > 18 months ago | 12–18 months ago | < 12 months ago |
| Road | `degradation_index >= 7` | `>= 4` | `< 4` |
| Tree | `alerts.length >= 2` | `alerts.length == 1` | `alerts.length == 0` |

---

## MVP Architecture

- **Frontend**: static SPA — HTML / JS / CSS, no backend
- **Map**: Leaflet.js + OpenStreetMap tiles
- **Data**: `data/assets.json` — single GeoJSON FeatureCollection (~60 assets)
- **Chatbot**: simulated, pattern-matched against pre-defined queries and JSON data
- **Hosting**: GitHub Pages or Netlify — shareable link, no login required
