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

interface Attributes {
    uid?: string;
    "axis-color"?: string;
    height?: string;
    "bar-width"?: string;
    "separator-width"?: string;
    "step-count"?: string;
    "show-values"?: string;
    "font-family"?: string;
    stacked?: string;
    "align-legends"?: string;
    "max-width"?: string;
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

const truthyValues = new Set(["", "true", "1"]);

export default class MjBarChart extends BodyComponent {
    private readonly uid: string;
    private readonly stacked: boolean;
    private readonly title: string;
    private readonly source: Source | undefined;
    private readonly colors: string[];
    private readonly axisColor: string;
    private readonly dataLabels: string[];
    private readonly chartHeight: number;
    private readonly barWidth: number;
    private readonly separatorWidth: number;
    private readonly stepCount: number;
    private readonly showScale: boolean;
    private readonly showValues: boolean;
    private readonly alignLegends: boolean;
    private readonly datasets: Dataset[];
    private readonly higherValue: number;
    private readonly maxWidth: number;
    private readonly chartWidth: number;
    private readonly globalClasses: GlobalClasses;
    private readonly fontFamily: string;

    constructor(initialData: InitialData) {
        super(initialData);

        const { title, datasets, series, source } = JSON.parse(
            initialData.content?.trim() as string,
        ) as Chart;
        this.title = title;
        this.source = source;
        this.uid = this.getAttribute("uid");
        this.stacked = truthyValues.has(this.getAttribute("stacked"));
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
        this.showScale = this.stepCount > 1;
        this.showValues = truthyValues.has(this.getAttribute("show-values"));
        this.alignLegends = truthyValues.has(
            this.getAttribute("align-legends"),
        );
        this.datasets = datasets.map((label: string, idx: number) => ({
            label,
            data: series.map(({ data }) => Math.max(data[idx], 0)),
        }));

        if (this.stacked) {
            this.higherValue = Math.max(
                ...this.datasets.map(({ data }) =>
                    data.reduce((a, b) => a + b, 0),
                ),
            );
        } else {
            this.higherValue = Math.max(
                ...series.reduce(
                    (vs, { data }) => vs.concat(data),
                    [] as number[],
                ),
            );
        }

        this.maxWidth = Number.parseInt(this.getAttribute("max-width"), 10);
        const separatorCount = this.datasets.length + 1;
        const barCount =
            this.datasets.length * (this.stacked ? 1 : this.dataLabels.length);

        this.chartWidth =
            (this.showScale ? 40 : 0) +
            this.separatorWidth * separatorCount +
            this.barWidth * barCount;

        if (this.chartWidth > this.maxWidth) {
            this.stepCount = 0;
            this.showScale = false;
            this.chartWidth = this.maxWidth;
            this.barWidth = this.separatorWidth =
                this.maxWidth / (separatorCount + barCount);
        }

        this.globalClasses = this.context?.globalData?.classes ?? {};
        this.fontFamily = this.getAttribute("font-family");
    }

    static readonly componentName = "mj-bar-chart";

    static readonly dependencies: Record<string, string[]> = {
        "mj-column": ["mj-bar-chart"],
        "mj-bar-chart": [],
    };

    static readonly allowedAttributes = {
        uid: "string",
        "axis-color": "color",
        height: "integer",
        "bar-width": "integer",
        "separator-width": "integer",
        "step-count": "enum(0,2,3,4,5,6,7,8)",
        "font-family": "string",
        // these last 3 should be booleans, but it breaks mjml-validator when no value is passed
        stacked: "string",
        "show-values": "string",
        "align-legends": "string",
        "max-width": "string",
    };

    static override readonly defaultAttributes = {
        uid: "",
        stacked: "false",
        "axis-color": "#d4d4d4",
        height: "200",
        "bar-width": "30",
        "separator-width": "30",
        "step-count": "5",
        "show-values": "true",
        "align-legends": "false",
        "font-family": "inherit",
        "max-width": "600",
    };

    private getChartSource(): JsonNode<"tr"> {
        if (!this.source) throw new Error("chart source is undefined");

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
                                style: "color:inherit;text-decoration:none;",
                            },
                            content: this.source.label,
                        },
                    ],
                },
            ],
        };
    }

    private getChartTitle(): JsonNode<"tr"> {
        return {
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
        };
    }

    private getChartBar(
        datasetIndex: number,
        dataIndex: number,
    ): JsonNode<"td"> {
        const value = this.datasets[datasetIndex].data[dataIndex];
        const plainPartHeight = Math.round(
            (value / this.higherValue) * (this.chartHeight - 18),
        );
        const emptyPartHeight = this.chartHeight - 2 - plainPartHeight;

        const emptyCellStyle = `${this.styles("emptyCell")}height:${emptyPartHeight}px;`;
        const plainCellStyle = `padding:0;height:${plainPartHeight}px;background-color:${this.colors[dataIndex]};`;

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
                                    attributes: {
                                        class: `mjbc${this.uid}__bar`,
                                        style: plainCellStyle,
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        };
    }

    private getStackedChartBar(datasetIndex: number): JsonNode<"td"> {
        const data = this.datasets[datasetIndex].data;
        const sum = data.reduce((a, b) => a + b, 0);
        const plainPartHeight = Math.round(
            (sum / this.higherValue) * (this.chartHeight - 18),
        );
        const emptyPartHeight = this.chartHeight - 2 - plainPartHeight;

        const emptyCellStyle = `${this.styles("emptyCell")}height:${emptyPartHeight}px;`;
        const getPlainCellStyleByIndex = (v: number, i: number) => {
            const height = Math.round((v / sum) * plainPartHeight);
            return `padding:0;height:${height}px;background-color:${this.colors[i]};`;
        };

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
                                    content: this.showValues ? `${sum}` : "",
                                },
                            ],
                        },
                        ...data.map(
                            (v, i): JsonNode => ({
                                tagName: "tr",
                                children: [
                                    {
                                        tagName: "td",
                                        attributes: {
                                            class: `mjbc${this.uid}__bar`,
                                            style: getPlainCellStyleByIndex(
                                                v,
                                                i,
                                            ),
                                        },
                                    },
                                ],
                            }),
                        ),
                    ],
                },
            ],
        };
    }

    private getChartBarSeparator(): JsonNode<"td"> {
        return {
            tagName: "td",
            attributes: { style: this.styles("chartBarSeparator") },
        };
    }

    private getChartLabelOffset(): JsonNode<"td"> {
        return {
            tagName: "td",
            attributes: { style: this.styles("chartLabelOffset") },
        };
    }

    private getChartBars(): JsonNode<"td"> {
        let bars: JsonNode[] = [];

        if (this.stacked) {
            bars = this.datasets.flatMap((_, dsi) => [
                this.getStackedChartBar(dsi),
                this.getChartBarSeparator(),
            ]);
        } else {
            bars = this.datasets.flatMap((dataset, dsi) => [
                ...dataset.data.map((_, di) => this.getChartBar(dsi, di)),
                this.getChartBarSeparator(),
            ]);
        }

        return {
            tagName: "td",
            attributes: { style: "padding:0;" },
            children: [
                {
                    tagName: "table",
                    attributes: { style: "border-collapse:collapse;" },
                    children: [
                        {
                            tagName: "tr",
                            attributes: {
                                style: `border-bottom:2px solid ${this.axisColor}`,
                            },
                            children: [this.getChartBarSeparator(), ...bars],
                        },
                    ],
                },
            ],
        };
    }

    private getDatasetLabel(index: number): JsonNode<"td"> {
        const barCount = this.stacked ? 1 : this.dataLabels.length;
        const width = `${this.barWidth * barCount + this.separatorWidth}px`;
        const style = `${this.styles("chartLabel")}min-width:${width};max-width:${width};`;

        return {
            tagName: "td",
            attributes: {
                class: `mjbc${this.uid}__label`,
                style,
            },
            content: this.datasets[index].label,
        };
    }

    private getChartLabels(): JsonNode<"tr"> {
        const labels = this.datasets.map((_, i) => this.getDatasetLabel(i));
        const children: JsonNode<"td">[] = [];

        if (this.showScale)
            children.push({
                tagName: "td",
                attributes: {
                    style: "padding:0;min-width:40px;max-width:40px;",
                },
            });

        children.push({
            tagName: "td",
            attributes: { style: "padding:0;" },
            children: [
                {
                    tagName: "table",
                    attributes: {
                        style: "border-collapse:collapse;",
                    },
                    children: [
                        {
                            tagName: "tr",
                            children: [
                                this.getChartLabelOffset(),
                                ...labels,
                                this.getChartLabelOffset(),
                            ],
                        },
                    ],
                },
            ],
        });

        return {
            tagName: "tr",
            children,
        };
    }

    private getLegend(index: number): JsonNode<"span"> {
        const content = this.dataLabels[index];
        const color = this.colors[index];
        const style = `${this.styles("legend")}border-left:${this.barWidth}px solid ${color};margin:0 auto;`;

        return {
            tagName: "span",
            attributes: {
                class: `mjbc${this.uid}__legend`,
                style,
            },
            content,
        };
    }

    private getChartLegend(): JsonNode<"tr"> {
        const legends = this.dataLabels.map((_, i) => this.getLegend(i));
        const children: JsonNode[] = [];

        if (this.alignLegends) {
            children.push({
                tagName: "table",
                attributes: { style: "margin:0 auto;" },
                children: [
                    {
                        tagName: "tr",
                        children: [
                            {
                                tagName: "td",
                                children: legends.map((legend) => ({
                                    tagName: "p",
                                    attributes: {
                                        style: `${this.styles("chartLegend")}text-align:left;padding-bottom:5px;`,
                                    },
                                    children: [legend],
                                })),
                            },
                        ],
                    },
                ],
            });
        } else {
            children.push({
                tagName: "p",
                attributes: {
                    style: `${this.styles("chartLegend")}text-align:center;`,
                },
                children: legends,
            });
        }

        return {
            tagName: "tr",
            children: [
                {
                    tagName: "td",
                    attributes: {
                        style: "padding:10px 0 0 0;",
                    },
                    children,
                },
            ],
        };
    }

    private getScale(): JsonNode<"td"> {
        if (!this.showScale)
            throw new Error("stepCount must be greater than 1");

        const steps = [];

        for (let i = this.stepCount; i > 0; i -= 1) {
            const value = Math.trunc(
                (this.higherValue / (this.stepCount - 1)) * (i - 1),
            );

            steps.push({
                tagName: "tr",
                children: [
                    {
                        tagName: "td",
                        attributes: {
                            class: `mjbc${this.uid}__step`,
                            style: this.styles("step"),
                        },
                        content: `${value}`,
                    },
                    {
                        tagName: "td",
                        attributes: {
                            style: `height:14px;padding:0;min-width:5px;border-bottom:2px solid ${this.axisColor};`,
                        },
                    },
                ],
            });

            if (i > 1) {
                steps.push({
                    tagName: "tr",
                    children: [
                        {
                            tagName: "td",
                            attributes: {
                                colspan: "2",
                                style: `${this.styles("stepOffset")}`,
                            },
                        },
                    ],
                });
            }
        }

        return {
            tagName: "td",
            attributes: {
                style: `max-height:${this.chartHeight}px;padding:0;vertical-align:top;`,
            },
            children: [
                {
                    tagName: "table",
                    attributes: {
                        style: `height:${this.chartHeight}px;border-collapse:collapse;border-right:2px solid ${this.axisColor};`,
                    },
                    children: steps,
                },
            ],
        };
    }

    private getChart(): JsonNode<"tr"> {
        const children: JsonNode<"td">[] = [];

        if (this.showScale) children.push(this.getScale());
        children.push(this.getChartBars());

        return {
            tagName: "tr",
            children: [
                {
                    tagName: "td",
                    children: [
                        {
                            tagName: "table",
                            attributes: {
                                style: "border-collapse:collapse;margin:0 auto;",
                            },
                            children: [
                                {
                                    tagName: "tr",
                                    children,
                                },
                                this.getChartLabels(),
                            ],
                        },
                    ],
                },
            ],
        };
    }

    override getStyles() {
        return {
            chartTitle: {
                "min-width": "100%",
                "max-width": "100%",
                padding: "0",
                height: "40px",
                "font-weight": "bold",
                "text-align": "center",
                "font-family": this.fontFamily,
                "font-size": "20px",
                ...this.globalClasses[`mjbc${this.uid}__title`],
            },
            chartSource: {
                "min-width": "100%",
                "max-width": "100%",
                padding: "0",
                height: "30px",
                "text-align": "center",
                "font-family": this.fontFamily,
                "font-size": "12px",
                color: "#3e3e3e",
                "vertical-align": "top",
                ...this.globalClasses[`mjbc${this.uid}__source`],
            },
            chartBarSeparator: {
                padding: "0",
                "min-width": `${this.separatorWidth}px`,
                "max-width": `${this.separatorWidth}px`,
            },
            chartLabelOffset: {
                padding: "0",
                "min-width": `${this.separatorWidth / 2}px`,
                "max-width": `${this.separatorWidth / 2}px`,
            },
            chartBarWrapper: {
                padding: "0",
                "min-width": `${this.barWidth}px`,
                "max-width": `${this.barWidth}px`,
            },
            chart: {
                "max-width":
                    this.chartWidth < this.maxWidth
                        ? "100%"
                        : `${this.maxWidth}px`,
                "min-width":
                    this.chartWidth < this.maxWidth
                        ? "100%"
                        : `${this.maxWidth}px`,
                "border-collapse": "collapse",
                margin: "0 auto",
            },
            emptyCell: {
                padding: "0",
                "font-family": this.fontFamily,
                "font-size": "12px",
                "vertical-align": "bottom",
                "text-align": "center",
                "line-height": "16px",
                overflow: "hidden",
                "white-space": "nowrap",
                "min-width": `${this.barWidth}px`,
                "max-width": `${this.barWidth}px`,
            },
            chartLabel: {
                height: "30px",
                padding: "0",
                "font-family": this.fontFamily,
                "font-size": "14px",
                "text-align": "center",
                ...this.globalClasses[`mjbc${this.uid}__label`],
            },
            chartLegend: {
                margin: "0",
                padding: "0",
                "max-width": `${this.chartWidth}px`,
                "line-height": "20px",
                height: "20px",
                "min-width": "100%",
            },
            legend: {
                display: "inline-block",
                padding: "0 10px",
                height: "20px",
                "font-family": this.fontFamily,
                "font-size": "14px",
                "white-space": "nowrap",
                ...this.globalClasses[`mjbc${this.uid}__legend`],
            },
            step: {
                padding: "0",
                height: "14px",
                "line-height": "14px",
                "min-width": "33px",
                "max-width": "33px",
                "vertical-align": "bottom",
                "text-align": "right",
                "font-family": this.fontFamily,
                "font-size": "14px",
                overflow: "hidden",
                "white-space": "nowrap",
                color: this.axisColor,
                "border-bottom": "2px solid transparent",
                ...this.globalClasses[`mjbc${this.uid}__step`],
            },
            stepOffset: {
                padding: "0",
                width: "38px",
                height: `${(this.chartHeight - this.stepCount * 16) / (this.stepCount - 1)}px`,
            },
        };
    }

    private renderJSON(): JsonNode<"table"> {
        const children: JsonNode<"tr">[] = [];

        children.push(this.getChartTitle());
        if (this.source) children.push(this.getChartSource());

        children.push(this.getChart());
        children.push(this.getChartLegend());

        return {
            tagName: "table",
            attributes: {
                class: `mjbc${this.uid}`,
                style: this.styles("chart"),
            },
            children,
        };
    }

    render() {
        const json = this.renderJSON();
        return jsonToXML(json);
    }
}
