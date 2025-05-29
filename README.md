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
        <mj-bar-chart
          title="Sum of Requests by Department"
          dataset-labels="January,February,March"
          datasets="[[33,14,27],[18,66,42],[7,15,21]]"
          groups="support,sales,tech"
          colors="#d8f3dc,#95d5b2,#52b788"/>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

Yay, you're all set!

![Basic mjml-bar-chart rendering](https://repository-images.githubusercontent.com/398511647/a3509d00-707c-48e4-9686-7c1281b2af10)

## Customize

### Built-in properties

| attribute         | required | default value | description                                                                                  |
|:------------------|:--------:|:-------------:|:---------------------------------------------------------------------------------------------|
| `title`           |    ✖️    |    `null`     | Chart title, will not be displayed if null                                                   |
| `dataset-labels`  |    ✔️    |    `null`     | Comma separated labels of each dataset                                                       |
| `datasets`        |    ✔️    |    `null`     | Valid JSON array of same length integer array                                                |
| `groups`          |    ✔️    |    `null`     | Comma separated data group names                                                             |
| `colors`          |    ✔️    |    `null`     | Comma separated CSS colors to apply to each group                                            |
| `axis-color`      |    ✖️    |   `#d4d4d4`   | CSS color of axis and scale numbers                                                          |
| `height`          |    ✖️    |     `200`     | Chart height in pixel                                                                        |
| `bar-width`       |    ✖️    |     `30`      | Bar width in pixel                                                                           |
| `separator-width` |    ✖️    |     `30`      | Separator width in pixel between datasets                                                    |
| `step-count`      |    ✖️    |      `5`      | Step number on the chart scale, below 2 no steps will be displayed                           |
| `show-values`     |    ✖️    |    `true`     | Whether or not it should display values above each bar                                       |
| `instance-id`     |    ✖️    |     `""`      | Applies a suffix to chart CSS classes. Useful when styling multiple charts in the same email |

### Styling through CSS classes

Bar charts are generated with predefined classes that you can use for styling with custom CSS.  
There are two ways of providing CSS overrides for your email charts:
 - [`mj-class`](https://documentation.mjml.io/#mj-attributes): (**recommended**) style will be dynamically retrieved and injected into the `style` attribute for high-priority override.
 - [`mj-style`](https://documentation.mjml.io/#mj-style): to provide a custom CSS declaration that will be applied with a low priority (will not override the CSS set from `style` attributes).

These are the generated classes that you can use:
 - `mjbc`: the class of the chart root element.
 - `mjbc__title`: the class of the chart title text.
 - `mjbc__label`: the class of the chart labels.
 - `mjbc__legend`: the class of the chart legends.
 - `mjbc__step`: the class of the chart steps.

If you have multiple charts in the same email, you can pass an instance id to each one to be able to apply different styles.  
Class `mjbc` will become `mjbc<instanceId>`, `mjbc__title` will become `mjbc<instanceId>__title`, and so on.

For example:
```mjml
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-class name="mjbc1__title" color="#ccc"/>
    </mj-attributes>
  </mj-head>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-bar-chart
          instance="1"
          title="Top 3 contributors"
          dataset-labels="Tom,Bob,Jane"
          datasets="[[18,32,12],[45,75,27],[9,33,12]]"
          groups="pull requests,commits,issues"
          colors="#adb2d4,#c7d9dd,#d5e5d5"/>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```
