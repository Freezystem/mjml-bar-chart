import { BodyComponent } from "mjml-core";
import jsonToXML, { type JsonNode } from "./helpers/jsonToXML";

interface Source {
    label: string;
    url: string;
}

interface Series {
    label: string;
    color: string;
    data: [number, ...number[]];
}

export interface Chart {
    title: string;
    source?: Source;
    datasets: [string, ...string[]];
    series: [Series, ...Series[]];
}

interface Dataset {
    label: string;
    data: number[];
}

type BarChartLayout = "bars" | "stacked-bars";

interface Attributes {
    uid?: string;
    "axis-color"?: string;
    height?: string;
    "bar-width"?: string;
    "separator-width"?: string;
    "step-count"?: string;
    "show-values"?: string;
    layout?: BarChartLayout;
}

type GlobalClasses = Record<string, Record<string, string>>;

interface InitialData {
    attributes?: Attributes;
    children?: string[];
    content?: string;
    context?: {
        globalData?: {
            classes?: GlobalClasses;
        };
    };
    props?: object;
    globalAttributes?: object;
    absoluteFilePath?: string | null;
}

export default class MjBarChart extends BodyComponent {
    private readonly uid: string;
    private readonly layout: BarChartLayout;
    private readonly title: string;
    private readonly source: Source | undefined;
    private readonly colors: string[];
    private readonly axisColor: string;
    private readonly dataLabels: string[];
    private readonly chartHeight: number;
    private readonly barWidth: number;
    private readonly separatorWidth: number;
    private readonly stepCount: number;
    private readonly showValues: boolean;
    private readonly datasets: Dataset[];
    private readonly higherValue: number;
    private readonly chartWidth: number;
    private readonly globalClasses: GlobalClasses;

    constructor(initialData: InitialData) {
        super(initialData);

        const { title, datasets, series, source } = JSON.parse(
            initialData.content?.trim() as string,
        ) as Chart;
        this.title = title;
        this.source = source;
        this.uid = this.getAttribute("uid");
        this.layout = this.getAttribute("layout");
        this.colors = series.map(({ color }) => color);
        this.dataLabels = series.map(({ label }) => label);
        this.axisColor = this.getAttribute("axis-color");
        this.chartHeight = Number.parseInt(this.getAttribute("height"), 10);
        this.barWidth = Number.parseInt(this.getAttribute("bar-width"), 10);
        this.separatorWidth = Number.parseInt(
            this.getAttribute("separator-width"),
            10,
        );
        this.stepCount = Number.parseInt(this.getAttribute("step-count"), 10);
        this.showValues = this.getAttribute("show-values") === "true";
        this.datasets = datasets.map((label: string, idx: number) => ({
            label,
            data: series.map(({ data }) => data[idx]),
        }));
        this.higherValue = Math.max(
            0,
            ...series.reduce((vs, { data }) => vs.concat(data), [] as number[]),
        );

        this.chartWidth =
            2 +
            this.separatorWidth * (this.dataLabels.length + 1) +
            this.barWidth * this.datasets.length * this.dataLabels.length;
        this.globalClasses = this.context?.globalData?.classes ?? {};
    }

    static readonly componentName = "mj-bar-chart";

    static readonly dependencies: Record<string, string[]> = {
        "mj-column": ["mj-bar-chart"],
        "mj-bar-chart": [],
    };

    static readonly allowedAttributes = {
        uid: "string",
        layout: "enum(bars,stacked-bars)",
        "axis-color": "color",
        height: "integer",
        "bar-width": "integer",
        "separator-width": "integer",
        "step-count": "enum(0,2,3,4,5,6,7,8)",
        "show-values": "boolean",
    };

    static override readonly defaultAttributes = {
        uid: "",
        layout: "bars",
        "axis-color": "#d4d4d4",
        height: "200",
        "bar-width": "30",
        "separator-width": "30",
        "step-count": "5",
        "show-values": "true",
        "font-family": "Ubuntu, Helvetica, Arial, sans-serif",
    };

    private getChartSource(): JsonNode | undefined {
        if (!this.source) return;

        return {
            tagName: "tr",
            children: [
                {
                    tagName: "td",
                    attributes: {
                        class: `mjbc${this.uid}__source`,
                        style: this.styles("chartSource"),
                    },
                    children: [
                        {
                            tagName: "a",
                            attributes: {
                                href: this.source.url,
                                target: "_blank",
                                style: "color:inherit; text-decoration:none;",
                            },
                            content: this.source.label,
                        },
                    ],
                },
            ],
        };
    }

    private getChartTitle(): JsonNode {
        const children: JsonNode[] = [
            {
                tagName: "tr",
                children: [
                    {
                        tagName: "td",
                        attributes: {
                            class: `mjbc${this.uid}__title`,
                            style: this.styles("chartTitle"),
                        },
                        content: this.title,
                    },
                ],
            },
        ];

        const source = this.getChartSource();
        if (source) children.push(source);

        return {
            tagName: "tr",
            children: [
                {
                    tagName: "td",
                    attributes: { style: "padding:0" },
                    children: [
                        {
                            tagName: "table",
                            attributes: {
                                style: this.styles("chartTitleWrapper"),
                            },
                            children,
                        },
                    ],
                },
            ],
        };
    }

    private getChartBar(datasetIndex: number, dataIndex: number): JsonNode {
        const value = this.datasets[datasetIndex].data[dataIndex];
        const v = Math.max(value, 0);
        const plainPartHeight = Math.round(
            (v / this.higherValue) * this.chartHeight,
        );
        const emptyPartHeight = this.chartHeight - plainPartHeight + 16;

        const emptyCellStyle = `${this.styles("emptyCell")}height:${emptyPartHeight}px;`;
        const plainCellStyle = `${this.styles("plainCell")}height:${plainPartHeight}px;background-color:${this.colors[dataIndex]};`;

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
        return {
            tagName: "td",
            attributes: { style: this.styles("chartBarSeparator") },
        };
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
                                {
                                    tagName: "tr",
                                    children: [
                                        this.getChartBarSeparator(),
                                        ...bars,
                                    ],
                                },
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
            attributes: {
                class: `mjbc${this.uid}__label`,
                style: this.styles("chartLabel"),
            },
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
                            attributes: {
                                style: this.styles("chartLabelWrapper"),
                            },
                            children: [
                                {
                                    tagName: "tr",
                                    children: [
                                        this.getChartBarSeparator(),
                                        ...labels,
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
    }

    private getLegend(index: number): JsonNode {
        const content = this.dataLabels[index];
        const color = this.colors[index];
        const style = `${this.styles("legend")}border-left:${this.barWidth}px solid ${color};`;

        return {
            tagName: "span",
            attributes: {
                class: `mjbc${this.uid}__legend`,
                style,
            },
            content,
        };
    }

    private getChartLegend(): JsonNode {
        const legends = this.dataLabels.map((_, i) => this.getLegend(i));

        return {
            tagName: "tr",
            children: [
                {
                    tagName: "td",
                    attributes: { style: "padding:0;" },
                    children: [
                        {
                            tagName: "table",
                            attributes: {
                                style: this.styles("chartLegendWrapper"),
                            },
                            children: [
                                {
                                    tagName: "tr",
                                    children: [
                                        {
                                            tagName: "td",
                                            attributes: {
                                                style: "padding:0;height:10px;",
                                            },
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
                                                        style: this.styles(
                                                            "chartLegend",
                                                        ),
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
        const children = [
            this.getChartBars(),
            this.getChartLabels(),
            this.getChartLegend(),
        ];

        return {
            tagName: "td",
            attributes: { style: "padding:0;" },
            children: [
                {
                    tagName: "table",
                    attributes: { style: "border-collapse:collapse;" },
                    children: [this.getChartTitle(), ...children],
                },
            ],
        };
    }

    private getScale(): JsonNode | undefined {
        if (this.stepCount < 2) return;

        const steps = [];

        for (let i = this.stepCount; i > 0; i -= 1) {
            const value = Math.trunc(
                (this.higherValue / (this.stepCount - 1)) * (i - 1),
            );
            const style = i === this.stepCount ? "firstStep" : "otherStep";

            steps.push({
                tagName: "tr",
                children: [
                    {
                        tagName: "td",
                        attributes: {
                            class: `mjbc${this.uid}__step`,
                            style: this.styles(style),
                        },
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
                ...this.globalClasses[`mjbc${this.uid}__title`],
            },
            chartSource: {
                padding: "0",
                height: "20px",
                "text-align": "center",
                "font-size": "12px",
                "vertical-align": "top",
                color: "#3e3e3e",
                ...this.globalClasses[`mjbc${this.uid}__source`],
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
                "min-width": `${this.barWidth * this.dataLabels.length}px`,
                "max-width": `${this.barWidth * this.dataLabels.length}px`,
                ...this.globalClasses[`mjbc${this.uid}__label`],
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
                ...this.globalClasses[`mjbc${this.uid}__legend`],
            },
            firstStep: {
                padding: "0 5px 0 0",
                height: this.source ? "76px" : "56px",
                "vertical-align": "bottom",
                "text-align": "right",
                "font-size": "14px",
                color: this.axisColor,
                ...this.globalClasses[`mjbc${this.uid}__step`],
            },
            otherStep: {
                padding: "0 5px 0 0",
                height: `${(this.chartHeight + 2) / (this.stepCount - 1)}px`,
                "vertical-align": "bottom",
                "text-align": "right",
                "font-size": "14px",
                color: this.axisColor,
                ...this.globalClasses[`mjbc${this.uid}__step`],
            },
        };
    }

    private renderJSON(): JsonNode {
        const scale = this.getScale();
        const chart = this.getChart();

        return {
            tagName: "table",
            attributes: {
                class: `mjbc${this.uid}`,
                style: "border-collapse:collapse;margin:0 auto;",
            },
            children: [
                { tagName: "tr", children: scale ? [scale, chart] : [chart] },
            ],
        };
    }

    render() {
        const json = this.renderJSON();
        return jsonToXML(json);
    }
}
