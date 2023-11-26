import { BodyComponent } from "mjml-core";

type dataset = {
	label: string;
	data: number[];
};

export default class MjBarChart extends BodyComponent {
	readonly #title: string;
	readonly #colors: string[];
	readonly #axisColor: string;
	readonly #groups: string[];
	readonly #chartHeight: number;
	readonly #barWidth: number;
	readonly #separatorWidth: number;
	readonly #stepCount: number;
	readonly #showValues: boolean;
	readonly #datasetValues: number[][];
	readonly #datasets: dataset[];
	readonly #higherValue: number;
	readonly #chartWidth: number;

	constructor(initialData = {}) {
		super(initialData);

		this.#title = this.getAttribute("title");
		this.#colors = this.getAttribute("colors").split(",");
		this.#axisColor = this.getAttribute("axis-color");
		this.#groups = this.getAttribute("groups").split(",");
		this.#chartHeight = parseInt(this.getAttribute("height"), 10);
		this.#barWidth = parseInt(this.getAttribute("bar-width"), 10);
		this.#separatorWidth = parseInt(this.getAttribute("separator-width"), 10);
		this.#stepCount = parseInt(this.getAttribute("step-count"), 10);
		this.#showValues = Boolean(this.getAttribute("show-values"));

		this.#datasetValues = JSON.parse(this.getAttribute("datasets"));

		this.#datasets = this.getAttribute("dataset-labels")
			.split(",")
			.map((label: string, idx: number) => ({
				label,
				data: this.#datasetValues[idx],
			}));

		this.#higherValue =
			this.#datasetValues
				.reduce((vs, d) => [...vs, ...d], [])
				.sort((a, b) => b - a)
				.shift() || 0;

		this.#chartWidth =
			2 +
			this.#separatorWidth * (this.#groups.length + 1) +
			this.#barWidth * this.#datasets.length * this.#groups.length;
	}

	static endingTag = true;

	static dependencies = {
		"mj-column": ["mj-bar-chart"],
		"mj-bar-chart": [],
	};

	static allowedAttributes = {
		title: "string",
		"dataset-labels": "string",
		datasets: "string",
		groups: "string",
		colors: "string",
		"axis-color": "color",
		height: "unit(px)",
		"bar-width": "unit(px)",
		"separator-width": "unit(px)",
		"step-count": "enum(0,2,3,4,5,6,7,8)",
		"show-values": "boolean",
	};

	static defaultAttributes = {
		"axis-color": "d4d4d4",
		height: "200",
		"bar-width": "30",
		"separator-width": "30",
		"step-count": "5",
		"show-values": "true",
	};

	#getChartTitle() {
		if (!this.#title) {
			return "";
		}

		return `
          <tr>
            <td style="padding:0;">
              <table ${this.htmlAttributes({ style: "chartTitleWrapper" })}>
                <tr>
                  <td ${this.htmlAttributes({ style: "chartTitle" })}>${this.#title}</td>
                </tr>
              </table>
            </td>
          </tr>
        `;
	}

	#getChartBar(value: number, color: string) {
		const v = value > 0 ? value : 0;
		const plainPartHeight = Math.round((v / this.#higherValue) * this.#chartHeight);
		const emptyPartHeight = this.#chartHeight - plainPartHeight + 16;

		const emptyCellStyle = {
			padding: "0",
			height: `${emptyPartHeight}px`,
			"font-size": "12px",
			"vertical-align": "bottom",
			"text-align": "center",
			"line-height": "16px",
		};

		const plainCellStyle = {
			padding: "0",
			height: `${plainPartHeight}px`,
			"background-color": color,
		};

		return `
          <td style="padding:0">
            <table ${this.htmlAttributes({ style: "chartBarWrapper" })}>
              <tr>
                <td ${this.htmlAttributes({ style: emptyCellStyle })}>${
					this.#showValues ? value : ""
				}</td>
              </tr>
              <tr>
                <td ${this.htmlAttributes({ style: plainCellStyle })}></td>
              </tr>
            </table>
          </td>
        `;
	}

	#getChartBarSeparator = () =>
		`<td ${this.htmlAttributes({ style: "chartBarSeparator" })}></td>`;

	#getChartBars() {
		const bars = [this.#getChartBarSeparator()];

		this.#datasets.forEach((dataset) => {
			dataset.data.forEach((datum, idx) =>
				bars.push(this.#getChartBar(datum, this.#colors[idx]))
			);
			bars.push(this.#getChartBarSeparator());
		});

		return `
          <tr>
            <td style="padding:0;">
              <table ${this.htmlAttributes({ style: "barChart" })}>
                <tr>
                  ${bars.join("\n")}
                </tr>
              </table>
            </td>
          </tr>
        `;
	}

	#getLabel = (value: string) =>
		`<td ${this.htmlAttributes({ style: "chartLabel" })}>${value}</td>`;

	#getChartLabels() {
		const labels = [this.#getChartBarSeparator()];

		this.#datasets.forEach((dataset) => {
			labels.push(this.#getLabel(dataset.label));
			labels.push(this.#getChartBarSeparator());
		});

		return `
          <tr>
            <td style="padding:0;">
              <table ${this.htmlAttributes({ style: "chartLabelWrapper" })}>
                <tr>
                  ${labels.join("\n")}
                </tr>
              </table>
            </td>
          </tr>
        `;
	}

	#getLegend(value: string, color: string) {
		const legendStyle = {
			padding: "0 10px",
			height: "20px",
			"font-size": "14px",
			"border-left": `${this.#barWidth}px solid ${color}`,
		};

		return `<span ${this.htmlAttributes({ style: legendStyle })}>${value}</span>`;
	}

	#getChartLegend() {
		return `
          <tr>
            <td style="padding:0;">
              <table ${this.htmlAttributes({ style: "chartLegendWrapper" })}>
                <tr>
                  <td style="padding:0;height:10px;"></td>
                </tr>
                <tr>
                  <td style="padding:0;">
                    <p ${this.htmlAttributes({ style: "chartLegend" })}>
                      ${this.#groups.map((g, i) => this.#getLegend(g, this.#colors[i]))}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `;
	}

	#getChart() {
		return `
          <td style="padding:0;">
            <table style="border-collapse:collapse;">
              ${this.#getChartTitle()}
              ${this.#getChartBars()}
              ${this.#getChartLabels()}
              ${this.#getChartLegend()}
            </table>
          </td>
        `;
	}

	#getScale() {
		if (this.#stepCount < 2) {
			return "";
		}

		const steps = [];

		for (let i = this.#stepCount; i > 0; i -= 1) {
			const value = Math.trunc((this.#higherValue / (this.#stepCount - 1)) * (i - 1));
			const style = i === this.#stepCount ? "firstStep" : "otherStep";

			steps.push(`
                <tr>
                  <td ${this.htmlAttributes({ style })}>${value}</td>
                </tr>
              `);
		}

		return `
          <td style="padding:0;vertical-align:top;">
            <table style="border-collapse:collapse;">
              ${steps.join("\n")}
            </table>
          </td>
        `;
	}

	getStyles(): object {
		return {
			chartTitleWrapper: {
				width: "100%",
				"border-collapse": "collapse",
			},
			chartTitle: {
				padding: "0",
				height: "40px",
				"font-weight": "bold",
				"text-align": "center",
				"font-size": "20px",
			},
			chartBarSeparator: {
				padding: "0",
				"min-width": `${this.#separatorWidth}px`,
				"max-width": `${this.#separatorWidth}px`,
			},
			chartBarWrapper: {
				padding: "0",
				"min-width": `${this.#barWidth}px`,
				"max-width": `${this.#barWidth}px`,
			},
			barChart: {
				"border-collapse": "collapse",
				"border-left": `2px solid ${this.#axisColor}`,
				"border-bottom": `2px solid ${this.#axisColor}`,
			},
			chartLabelWrapper: {
				"border-collapse": "collapse",
				"border-left": "2px solid transparent",
			},
			chartLabel: {
				height: "30px",
				padding: "0",
				"font-size": "14px",
				"text-align": "center",
				overflow: "hidden",
				"min-width": `${this.#barWidth * this.#groups.length}px`,
				"max-width": `${this.#barWidth * this.#groups.length}px`,
			},
			chartLegendWrapper: {
				"border-collapse": "collapse",
				width: "100%",
			},
			chartLegend: {
				margin: "0",
				padding: "0",
				"max-width": `${this.#chartWidth}px`,
				"line-height": "20px",
				"text-align": "center",
			},
			firstStep: {
				padding: "0 5px 0 0",
				height: "56px",
				"vertical-align": "bottom",
				"text-align": "right",
				"font-size": "14px",
				color: this.#axisColor,
			},
			otherStep: {
				padding: "0 5px 0 0",
				height: `${(this.#chartHeight + 2) / (this.#stepCount - 1)}px`,
				"vertical-align": "bottom",
				"text-align": "right",
				"font-size": "14px",
				color: this.#axisColor,
			},
		};
	}

	render() {
		return `
          <table class="mjmlBarChart" style="border-collapse:collapse;margin:0 auto;">
            <tr>
              ${this.#getScale()}
              ${this.#getChart()}
            </tr>
          </table>
        `;
	}
}
