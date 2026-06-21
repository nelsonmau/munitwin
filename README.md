# MuniTwin AI

**MuniTwin AI** is an AI-powered digital twin platform designed for small European municipalities (< 15,000 inhabitants). It enables local governments to build interactive virtual representations of their territory without requiring specialised technical skills or significant investment.

The project aims to bridge the digital gap between large cities and smaller local administrations, enabling data-driven governance, infrastructure monitoring, and citizen transparency.

---

## Use Cases

### Core layer — Infrastructure & Network Management

The platform's foundation is the **management of municipal infrastructure assets**: inventorying, monitoring, and planning the maintenance of everything the municipality owns or manages on its territory.

| Domain | Assets |
|---|---|
| Public lighting | streetlights, electrical cabinets, energy consumption |
| Roads & pavements | road surface, signage, potholes, scheduled works |
| Underground networks | manholes, sewers, water supply, cables |
| Green spaces | trees, parks, green areas, phytosanitary status |
| Utilities | meters, energy and water consumption of municipal buildings |

This layer allows the administration to answer concrete operational questions:
- *"How many streetlights are approaching end of life and need replacing this year?"*
- *"Which road sections haven't been resurfaced in more than X years?"*
- *"What is the maintenance cost per area for green spaces?"*

### Extended layers — Add-on modules

Additional vertical modules can be built on top of the infrastructure core:

- **Hydrogeological emergency management** — landslide and flood risk monitoring, hydrometric sensors, alerts and coordination during events
- **Citizen dialogue** — issue reporting, consultations, transparency on ongoing works; two-way channel between administration and community
- **Municipal building management** — public property registry, conservation status, regulatory compliance, energy efficiency
- *(further modules to be defined)*

---

## Demo — Millbrook

The MVP demo features **Millbrook**, a fictional municipality of ~3,000 inhabitants.

- `index.html` — landing page (use cases, how data gets in, CTA)
- `demo.html` — interactive 2D map with asset layers, filters, and simulated chatbot

**57 mapped assets** across four domains: streetlights, manholes, road segments, trees. Asset status (critical / warning / ok) is computed on-the-fly in the browser from raw field values — no stored status flag.

**Simulated chatbot** supports 5 pre-built operational queries: end-of-life streetlights, uninspected manholes, worst road sections, trees with risk alerts, estimated maintenance cost.

### Running locally

Requires an HTTP server (fetch won't work from `file://`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Or deploy directly to GitHub Pages / Netlify — zero configuration needed.

---

## Design

JPL-inspired design system. Light theme by default, dark mode via toggle (top-right nav). Preference persisted in `localStorage`. See [`DESIGN.md`](./DESIGN.md) for full token reference and component patterns.

---

## Stack

| Layer | Technology |
|---|---|
| Map | Leaflet.js + CartoDB tiles (light & dark) |
| Styling | Tailwind CDN + CSS custom properties |
| Data | GeoJSON (`data/assets.json`) |
| Theme | CSS variables + `js/theme.js` |
| Chatbot | Simulated — pattern matching on in-memory GeoJSON |
| Hosting | Static — GitHub Pages / Netlify |

---

## Academic References & Potential Partners

- **SCiNDTiLA** — Austrian national research project on digital twins for territories. Potential academic partner for a consortium.
  - Project page: https://research.ustp.at/en/projects/scindtila
  - Website: https://scindtilaproject.wixsite.com/scindtila
