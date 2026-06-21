# MuniTwin AI

**MuniTwin AI** is an AI-powered digital twin platform designed for small European municipalities (< 15,000 inhabitants). It enables local governments to build interactive virtual representations of their territory without requiring specialised technical skills or significant investment.

The project aims to bridge the digital gap between large cities and smaller local administrations, enabling data-driven governance, infrastructure monitoring, and citizen transparency.

For product specification, user journey and MVP architecture → [PRODUCT.md](./PRODUCT.md)

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

## Demo Concept

### Scenario: the fictional town of Millbrook
The MVP demo features a **fictional municipality** — Millbrook, ~3,000 inhabitants — with a handful of streets and public buildings. Every asset on the territory is mapped and queryable.

Navigation is designed in **2D** (lightweight and practical).

### Chatbot interface
A simulated chatbot is embedded in the map. Users can type or click pre-built queries:

- *"List streetlights approaching end of life"* → list with ID, street, year installed, priority
- *"Which manholes haven't been inspected in over 12 months?"* → list + map highlight

### Data model
Assets are stored as GeoJSON in `data/assets.json`. Status is computed on-the-fly in the browser from raw fields — no stored status flag. See [PRODUCT.md](./PRODUCT.md) for the full status logic.

---

## Academic References & Potential Partners

- **SCiNDTiLA** — Austrian national research project on digital twins for territories. Potential academic partner for a consortium.
  - Project page: https://research.ustp.at/en/projects/scindtila
  - Website: https://scindtilaproject.wixsite.com/scindtila
