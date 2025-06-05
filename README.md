# MJML Bar Chart
[![Workflow](https://img.shields.io/github/actions/workflow/status/Freezystem/mjml-bar-chart/test.yml?logo=github)](https://github.com/Freezystem/mjml-bar-chart/actions/workflows/test.yml?query=branch%3Amain)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Freezystem_mjml-bar-chart&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Freezystem_mjml-bar-chart)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Freezystem_mjml-bar-chart&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Freezystem_mjml-bar-chart)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Freezystem_mjml-bar-chart&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Freezystem_mjml-bar-chart)

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

registerComponent(MjBarChart, { registerDependencies: true });
```

with **CJS**:

```js
const { registerComponent } = require("mjml-core");
const MjBarChart = require("mjml-bar-chart").default;

registerComponent(MjBarChart, { registerDependencies: true });
```
> Set the `registerDependencies` option to `true` to automatically declare the `mj-bar-chart` component dependencies 
> to the `mjml-validator` module.

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

![Basic mjml-bar-chart rendering](https://github.com/user-attachments/assets/a65b4e1c-8780-4df0-aff6-159c332e4b7a)

## Customize

### Content

The `<mj-bar-chart>` content must be a valid JSON string with the following structure:
```json
{
  "title": "Annual offset mix in tCO2",
  "source": {
    "url": "#trustmebro",
    "label": "Source: TrustMeBro ↗"
  },
  "datasets": ["2021", "2022", "2023", "2024", "2025"],
  "series": [
    {
      "label": "commute",
      "color": "#adb2d4",
      "data": [3.7,7.5,4.3,15,6.9]
    },
    {
      "label": "travels",
      "color": "#c7d9dd",
      "data": [13.4,7.2,11,20.4,13.2]
    },
    {
      "label": "carbon balance",
      "color": "#d5e5d5",
      "data": [23.4,12.1,40.5,38.1,4]
    },
    {
      "label": "others",
      "color": "#eef1da",
      "data": [4.9,15.2,-4.5,18.8,7]
    }
  ]
}
```
Note that all negative values will be floored to zero.

![Stacked rendering with vertically aligned legends](https://github.com/user-attachments/assets/fc34d1c8-3608-4b7f-8bf3-233cd7efe277)

If you're using TypeScript you can import the `Chart` interface to validate your data structure.

```ts
import type { Chart } from "mjml-bar-chart";

const chart: Chart = {...}
```

### Built-in properties

All the following attributes are optional

| attribute         | coerced type | default value | description                                                                                                                 |
|:------------------|:------------:|:-------------:|:----------------------------------------------------------------------------------------------------------------------------|
| `uid`             |   `string`   |     `""`      | Applies a suffix to chart CSS classes. Useful when styling multiple charts in the same email                                |
| `stacked`         |  `boolean`   |   `"false"`   | Whether to stack dataset values in a single column                                                                          |
| `font-family`     |   `string`   |  `"inherit"`  | Font family to apply to every text element. Can also be set from `<mj-all>` markup                                          |
| `axis-color`      |   `string`   |  `"#d4d4d4"`  | CSS color of axis and scale numbers                                                                                         |
| `height`          |   `number`   |    `"200"`    | Chart height in pixel                                                                                                       |
| `bar-width`       |   `number`   |    `"30"`     | Bar width in pixel                                                                                                          |
| `separator-width` |   `number`   |    `"30"`     | Datasets separator width in pixel                                                                                           |
| `step-count`      |   `number`   |     `"5"`     | Step number on the chart scale, below 2 no steps will be displayed                                                          |
| `show-values`     |  `boolean`   |   `"true"`    | Whether it should display values above each bar                                                                             |
| `align-legends`   |  `boolean`   |   `"false"`   | Whether it should vertically align legend labels                                                                            |
| `max-width`       |   `number`   |    `"600"`    | The max width the chart should take. <br/>If it overflows `bar-width` and `separator-width` are dynamically computed to fit |

### Dynamic resizing when data overflows

Providing the chart attribute `max-width` is strongly advised as the graph will automatically resize to fit when data 
require expanding beyond this threshold.  
  
When the limit is overreached the graph will automatically set the `step-count` to `0` to hide the y-axis to gain space 
and will dynamically recompute the `bar-width` and `separator-width` to fit the limited width.

### Styling through CSS classes

Bar charts are generated with predefined classes that you can use for styling with custom CSS.  
There are two ways of providing CSS overrides for your email charts:
 - [`mj-class`](https://documentation.mjml.io/#mj-attributes): (**recommended**) style will be dynamically retrieved and injected into the `style` attribute for high-priority override.
 - [`mj-style`](https://documentation.mjml.io/#mj-style): to provide a custom CSS declaration that will be applied with a low priority (will not override the CSS set from `style` attributes).

These are all the generated classes that you can use:
 - `mjbc`: the class of the chart root element.
 - `mjbc__title`: the class of the chart title text.
 - `mjbc__source`: the class of the chart source link.
 - `mjbc__label`: the class of the chart labels.
 - `mjbc__legend`: the class of the chart legends.
 - `mjbc__step`: the class of the chart steps.

With their location in the generated chart:
![Schema of the chart layout with dimensions](https://github.com/user-attachments/assets/cfaa6ffa-3de4-435b-93b0-6c0b663a6c9b)

If you have multiple charts in the same email, you can pass a unique identifier to each one to be able to apply different styles.  
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
        <mj-bar-chart uid="1">{{ JSON.stringify(jsonChart1) }}</mj-bar-chart>
        <mj-bar-chart uid="2" stacked align-legends>
          {{ JSON.stringify(jsonChart2) }}
        </mj-bar-chart>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```
