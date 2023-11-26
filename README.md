# MJML Bar Chart

## Getting started

First you'll have to install `mjml-bar-chart` in your project.

```
npm i -S @freezystem/mjml-bar-chart
```

Then add the package to your `.mjmlconfig` file:

```json
{
	"packages": ["mjml-bar-chart/lib/index.js"]
}
```

You can now use the `mjml-bar-chart` component in your MJML templates:

```xml
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

Yay, you're all set !

![Basic mjml-bar-chart rendering](https://repository-images.githubusercontent.com/398511647/a3509d00-707c-48e4-9686-7c1281b2af10)

## Customize

| attribute         | required |  default  | description                                                        |
| :---------------- | :------: | :-------: | :----------------------------------------------------------------- |
| `title`           |    ✖️    |  `null`   | Chart title, if null will not display                              |
| `dataset-labels`  |    ✔️    |  `null`   | Comma separated labels of each dataset                             |
| `datasets`        |    ✔️    |  `null`   | Valid JSON array of same length integer array                      |
| `groups`          |    ✔️    |  `null`   | Comma separated data group names                                   |
| `colors`          |    ✔️    |  `null`   | Comma separated CSS colors of each group                           |
| `axis-color`      |    ✖️    | `#d4d4d4` | CSS color of axis and scale numbers                                |
| `height`          |    ✖️    |   `200`   | Chart height in pixel                                              |
| `bar-width`       |    ✖️    |   `30`    | Bar width in pixel                                                 |
| `separator-width` |    ✖️    |   `30`    | Separator width in pixel between datasets                          |
| `step-count`      |    ✖️    |    `5`    | Step number on the chart scale, below 2 no steps will be displayed |
| `show-values`     |    ✖️    |  `true`   | Whether or not it should display values above each bar             |
