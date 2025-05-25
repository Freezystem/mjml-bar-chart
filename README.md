# MJML Bar Chart
[![Workflow](https://img.shields.io/github/actions/workflow/status/Freezystem/mjml-bar-chart/test.yml?logo=github)](https://github.com/Freezystem/mjml-bar-chart/actions/workflows/test.yml?query=branch%3Amain)
![Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/wiki/Freezystem/mjml-bar-chart/coverage-diff-badge.json&logo=jest)

## Getting started

First you'll have to install `mjml-bar-chart` in your project.

```sh
npm install --save mjml mjml-core mjml-bar-chart
```

Then import it and manually register the plugin.

with **ESM**:

```js
import { registerComponent } from "mjml-core";
import MjBarChart from "mjml-bar-chart";

registerComponent(MjBarChart);
```

with **CJS**:

```js
const { registerComponent } = require("mjml-core");
const MjBarChart = require("mjml-bar-chart").default;

registerComponent(MjBarChart);
```

You can now use the `mjml-bar-chart` component in your MJML templates:

```mjml
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-bar-chart>
          {
            "title":"Sum of Requests by Department",
            "datasets":["January","February","March"],
            "series":[
              {"label":"support","color":"#d8f3dc","data":[33,18,7]},
              {"label":"sales","color":"#95d5b2","data":[14,66,15]},
              {"label":"tech","color":"#52b788","data":[27,42,21]}
            ]
          }
        </mj-bar-chart>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

Yay, you're all set!

![Basic mjml-bar-chart rendering](https://repository-images.githubusercontent.com/398511647/a3509d00-707c-48e4-9686-7c1281b2af10)

## Customize

### Content

The `<mj-bar-chart>` content must be a valid JSON string with the following structure:
```json
{
  "title": "Open-Source contributions per Year",
  "datasets": ["2022", "2023", "2024", "2025"],
  "series": 
    [
      {
        "label": "pull requests",
        "color": "#adb2d4",
        "data": [3,7,4,15]
      },
      {
        "label": "issues fixed",
        "color": "#c7d9dd",
        "data": [23,12,40,38]
      },
      {
        "label": "reviews",
        "color": "#d5e5d5",
        "data": [4,15,11,18]
      }
    ]
}
```

If you're using TypeScript you can import the `Chart` interface to validate your object.

```ts
import type { Chart } from "mjml-bar-chart";

const chart: Chart = {...}
```

### Built-in properties

| attribute         | required | default value | description                                                                                  |
|:------------------|:--------:|:-------------:|:---------------------------------------------------------------------------------------------|
| `uid`             |    ✖️    |     `""`      | Applies a suffix to chart CSS classes. Useful when styling multiple charts in the same email |
| `axis-color`      |    ✖️    |   `#d4d4d4`   | CSS color of axis and scale numbers                                                          |
| `height`          |    ✖️    |     `200`     | Chart height in pixel                                                                        |
| `bar-width`       |    ✖️    |     `30`      | Bar width in pixel                                                                           |
| `separator-width` |    ✖️    |     `30`      | Datasets separator width in pixel                                                            |
| `step-count`      |    ✖️    |      `5`      | Step number on the chart scale, below 2 no steps will be displayed                           |
| `show-values`     |    ✖️    |    `true`     | Whether or not it should display values above each bar                                       |

### Styling through CSS classes

Bar charts are generated with predefined classes that you can use for styling with custom CSS.  
There are two ways of providing CSS overrides for your email charts:
 - [`mj-class`](https://documentation.mjml.io/#mj-attributes): (**recommended**) style will be dynamically retrieved and injected into the `style` attribute for high-priority override.
 - [`mj-style`](https://documentation.mjml.io/#mj-style): to provide a custom CSS declaration that will be applied with a low priority (will not override the CSS set from `style` attributes).

These are all the generated classes that you can use:
 - `mjbc`: the class of the chart root element.
 - `mjbc__title`: the class of the chart title text.
 - `mjbc__label`: the class of the chart labels.
 - `mjbc__legend`: the class of the chart legends.
 - `mjbc__step`: the class of the chart steps.

If you have multiple charts in the same email, you can pass an uid to each one to be able to apply different styles.  
Class `mjbc` will become `mjbc<uid>`, `mjbc__title` will become `mjbc<uid>__title`, and so on.

For example:
```mjml
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-class name="mjbc1__title" color="lightcoral" font-weight="bold"/>
      <mj-class name="mjbc2__title" color="rebeccapurple" font-family="Menlo"/>
    </mj-attributes>
  </mj-head>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-bar-chart uid="1">{{ jsonChart1 }}</mj-bar-chart>
        <mj-bar-chart uid="2">{{ jsonChart2 }}</mj-bar-chart>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```
