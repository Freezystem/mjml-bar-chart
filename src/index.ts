import { BodyComponent } from "mjml-core";
import { registerDependencies } from "mjml-validator";
import jsonToXML, { JsonNode } from "./helpers/jsonToXML";

interface Dataset {
	label: string;
	data: number[];
}

interface Attributes {
	title?: string;
	colors: string;
	"dataset-labels": string;
	datasets: string;
	groups: string;
	"axis-color"?: string;
	height?: string;
	"bar-width"?: string;
	"separator-width"?: string;
	"step-count"?: string;
	"show-values"?: string;
}

interface InitialData {
	attributes: Attributes;
	[key: string]: any;
}

export default class MjBarChart extends BodyComponent {
	private readonly title: string;
	private readonly colors: string[];
	private readonly axisColor: string;
	private readonly groups: string[];
	private readonly chartHeight: number;
	private readonly barWidth: number;
	private readonly separatorWidth: number;
	private readonly stepCount: number;
	private readonly showValues: boolean;
	private readonly datasetValues: number[][];
	private readonly datasets: Dataset[];
	private readonly higherValue: number;
	private readonly chartWidth: number;

	constructor(initialData: InitialData) {
		super(initialData);

		this.title = this.getAttribute("title");
		this.colors = this.getAttribute("colors").split(",");
		this.axisColor = this.getAttribute("axis-color");
		this.groups = this.getAttribute("groups").split(",");
		this.chartHeight = parseInt(this.getAttribute("height"), 10);
		this.barWidth = parseInt(this.getAttribute("bar-width"), 10);
		this.separatorWidth = parseInt(this.getAttribute("separator-width"), 10);
		this.stepCount = parseInt(this.getAttribute("step-count"), 10);
		this.showValues = this.getAttribute("show-values") === "true";

		this.datasetValues = JSON.parse(this.getAttribute("datasets"));

		this.datasets = this.getAttribute("dataset-labels")
			.split(",")
			.map((label: string, idx: number) => ({
				label,
				data: this.datasetValues[idx],
			}));

		this.higherValue =
			this.datasetValues
				.reduce((vs, d) => [...vs, ...d], [])
				.sort((a, b) => b - a)
				.shift() || 0;

		this.chartWidth =
			2 +
			this.separatorWidth * (this.groups.length + 1) +
			this.barWidth * this.datasets.length * this.groups.length;
	}

	static componentName = "mj-bar-chart";

	static endingTag = true;

	static dependencies: Record<string, string[]> = {
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

	static override defaultAttributes = {
		"axis-color": "#d4d4d4",
		height: "200",
		"bar-width": "30",
		"separator-width": "30",
		"step-count": "5",
		"show-values": "true",
	};

	private getChartTitle(): JsonNode | undefined {
		if (!this.title) return;

		return {
			tagName: "tr",
			children: [
				{
					tagName: "td",
					attributes: { style: "padding:0" },
					children: [
						{
							tagName: "table",
							attributes: { style: this.styles("chartTitleWrapper") },
							children: [
								{
									tagName: "tr",
									children: [
										{
											tagName: "td",
											attributes: { style: this.styles("chartTitle") },
											content: this.title,
										},
									],
								},
							],
						},
					],
				},
			],
		};
	}

	private getChartBar(datasetIndex: number, dataIndex: number): JsonNode {
		const value = this.datasets[datasetIndex].data[dataIndex];
		const v = value > 0 ? value : 0;
		const plainPartHeight = Math.round((v / this.higherValue) * this.chartHeight);
		const emptyPartHeight = this.chartHeight - plainPartHeight + 16;

		const emptyCellStyle = `${this.styles("emptyCell")}height:${emptyPartHeight}px;`;
		const plainCellStyle =
			this.styles("plainCell") +
			`height:${plainPartHeight}px;background-color:${this.colors[dataIndex]};`;

		return {
			tagName: "td",
			attributes: { style: "padding:0" },
			children: [
				{
					tagName: "table",
					attributes: { style: this.styles("chartBarWrapper") },
					children: [
						{
							tagName: "tr",
							children: [
								{
									tagName: "td",
									attributes: { style: emptyCellStyle },
									content: this.showValues ? `${value}` : "",
								},
							],
						},
						{
							tagName: "tr",
							children: [
								{
									tagName: "td",
									attributes: { style: plainCellStyle },
								},
							],
						},
					],
				},
			],
		};
	}

	private getChartBarSeparator(): JsonNode {
		return { tagName: "td", attributes: { style: this.styles("chartBarSeparator") } };
	}

	private getChartBars(): JsonNode {
		const bars = this.datasets.flatMap((dataset, dsi) => [
			...dataset.data.map((_, di) => this.getChartBar(dsi, di)),
			this.getChartBarSeparator(),
		]);

		return {
			tagName: "tr",
			children: [
				{
					tagName: "td",
					attributes: { style: "padding:0;" },
					children: [
						{
							tagName: "table",
							attributes: { style: this.styles("barChart") },
							children: [
								{ tagName: "tr", children: [this.getChartBarSeparator(), ...bars] },
							],
						},
					],
				},
			],
		};
	}

	private getDatasetLabel(index: number): JsonNode {
		return {
			tagName: "td",
			attributes: { style: this.styles("chartLabel") },
			content: this.datasets[index].label,
		};
	}

	private getChartLabels() {
		const labels = this.datasets.flatMap((_, i) => [
			this.getDatasetLabel(i),
			this.getChartBarSeparator(),
		]);

		return {
			tagName: "tr",
			children: [
				{
					tagName: "td",
					attributes: { style: "padding:0;" },
					children: [
						{
							tagName: "table",
							attributes: { style: this.styles("chartLabelWrapper") },
							children: [
								{
									tagName: "tr",
									children: [this.getChartBarSeparator(), ...labels],
								},
							],
						},
					],
				},
			],
		};
	}

	private getLegend(index: number): JsonNode {
		const content = this.groups[index];
		const color = this.colors[index];
		const style = `${this.styles("legend")}border-left:${this.barWidth}px solid ${color};`;

		return { tagName: "span", attributes: { style }, content };
	}

	private getChartLegend(): JsonNode {
		const legends = this.groups.map((_, i) => this.getLegend(i));

		return {
			tagName: "tr",
			children: [
				{
					tagName: "td",
					attributes: { style: "padding:0;" },
					children: [
						{
							tagName: "table",
							attributes: { style: this.styles("chartLegendWrapper") },
							children: [
								{
									tagName: "tr",
									children: [
										{
											tagName: "td",
											attributes: { style: "padding:0;height:10px;" },
										},
									],
								},
								{
									tagName: "tr",
									children: [
										{
											tagName: "td",
											attributes: { style: "padding:0;" },
											children: [
												{
													tagName: "p",
													attributes: {
														style: this.styles("chartLegend"),
													},
													children: legends,
												},
											],
										},
									],
								},
							],
						},
					],
				},
			],
		};
	}

	private getChart(): JsonNode {
		const chartTitle = this.getChartTitle();
		const children = [this.getChartBars(), this.getChartLabels(), this.getChartLegend()];

		return {
			tagName: "td",
			attributes: { style: "padding:0;" },
			children: [
				{
					tagName: "table",
					attributes: { style: "border-collapse:collapse;" },
					children: chartTitle ? [chartTitle, ...children] : children,
				},
			],
		};
	}

	private getScale(): JsonNode | undefined {
		if (this.stepCount < 2) return;

		const steps = [];

		for (let i = this.stepCount; i > 0; i -= 1) {
			const value = Math.trunc((this.higherValue / (this.stepCount - 1)) * (i - 1));
			const style = i === this.stepCount ? "firstStep" : "otherStep";

			steps.push({
				tagName: "tr",
				children: [
					{
						tagName: "td",
						attributes: { style: this.styles(style) },
						content: `${value}`,
					},
				],
			});
		}

		return {
			tagName: "td",
			attributes: { style: "padding:0;vertical-align:top;" },
			children: [
				{
					tagName: "table",
					attributes: { style: "border-collapse:collapse;" },
					children: steps,
				},
			],
		};
	}

	override getStyles(): object {
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
				"min-width": `${this.separatorWidth}px`,
				"max-width": `${this.separatorWidth}px`,
			},
			chartBarWrapper: {
				padding: "0",
				"min-width": `${this.barWidth}px`,
				"max-width": `${this.barWidth}px`,
			},
			barChart: {
				"border-collapse": "collapse",
				"border-left": `2px solid ${this.axisColor}`,
				"border-bottom": `2px solid ${this.axisColor}`,
			},
			plainCell: {
				padding: "0",
			},
			emptyCell: {
				padding: "0",
				"font-size": "12px",
				"vertical-align": "bottom",
				"text-align": "center",
				"line-height": "16px",
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
				"min-width": `${this.barWidth * this.groups.length}px`,
				"max-width": `${this.barWidth * this.groups.length}px`,
			},
			chartLegendWrapper: {
				"border-collapse": "collapse",
				width: "100%",
			},
			chartLegend: {
				margin: "0",
				padding: "0",
				"max-width": `${this.chartWidth}px`,
				"line-height": "20px",
				"text-align": "center",
			},
			legend: {
				padding: "0 10px",
				height: "20px",
				"font-size": "14px",
			},
			firstStep: {
				padding: "0 5px 0 0",
				height: "56px",
				"vertical-align": "bottom",
				"text-align": "right",
				"font-size": "14px",
				color: this.axisColor,
			},
			otherStep: {
				padding: "0 5px 0 0",
				height: `${(this.chartHeight + 2) / (this.stepCount - 1)}px`,
				"vertical-align": "bottom",
				"text-align": "right",
				"font-size": "14px",
				color: this.axisColor,
			},
		};
	}

	private renderJSON(): JsonNode {
		const scale = this.getScale();
		const chart = this.getChart();

		return {
			tagName: "table",
			attributes: {
				class: "mjmlBarChart",
				style: "border-collapse:collapse;margin:0 auto;",
			},
			children: [{ tagName: "tr", children: scale ? [scale, chart] : [chart] }],
		};
	}

	render() {
		const json = this.renderJSON();
		return jsonToXML(json);
	}
}

registerDependencies(MjBarChart.dependencies);
