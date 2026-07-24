# Analemma Card for Home Assistant

A custom Lovelace card for Home Assistant that renders the solar analemma (the figure-8 path of the Sun) using HTML5 Canvas, showing the exact current position of the Sun based on today's date.

## Installation

1. Download `analemma-card.js`.
2. Copy it to your Home Assistant directory under `/config/www/analemma-card.js`.
3. Add the resource in Home Assistant (**Settings** -> **Dashboards** -> **Resources**):
   * **URL:** `/local/analemma-card.js?v=1.0`
   * **Resource Type:** `JavaScript Module`

## Usage

Add a manual card to your dashboard:

```yaml
type: custom:analemma-card
