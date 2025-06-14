import mjml2html from "mjml";
import { registerComponent } from "mjml-core";
import jsonToXML from "./helpers/jsonToXML";
import MjBarChart, { type Chart } from "./index";

function toHtml(mjml: string): string {
    const { html, errors } = mjml2html(mjml);
    return errors.length > 0 ? errors[0].message : html;
}

describe("mjml-bar-chart", () => {
    beforeAll(() => {
        registerComponent(MjBarChart, { registerDependencies: true });
    });

    const chart1: Chart = {
        title: "Sum of Requests by Department",
        source: {
            url: "#sources",
            label: "source: wikipedia ↗",
        },
        datasets: ["January", "February", "March", "April"],
        series: [
            {
                label: "support",
                color: "#ffe5ec",
                data: [33, 18, -7, 42],
            },
            {
                label: "sales",
                color: "#ffb3c6",
                data: [14, 66, 15, 18],
            },
            {
                label: "tech",
                color: "#fb6f92",
                data: [27, 42, 21, 11],
            },
        ],
    };

    const chart2: Chart = {
        title: "Some Stats",
        datasets: ["September", "October", "November"],
        series: [
            {
                label: "legal",
                color: "#95d5b2",
                data: [12, 38, 64],
            },
            {
                label: "hr",
                color: "#52b788",
                data: [76, 20, 39],
            },
        ],
    };

    const barChart = new MjBarChart({
        content: JSON.stringify(chart1),
    });
    const stackedBarChart = new MjBarChart({
        content: JSON.stringify(chart1),
        attributes: { stacked: "true" },
    });

    describe("mjml markup", () => {
        it("should render the default bar chart", () => {
            const mjml = `
			  <mjml>
				<mj-body>
				  <mj-section>
					<mj-column>
					  <mj-bar-chart>${JSON.stringify(chart1)}</mj-bar-chart>
					</mj-column>
				  </mj-section>
				</mj-body>
			  </mjml>
			`;

            const html = toHtml(mjml);
            expect(html).toMatchSnapshot();
        });

        it("should render the stacked bar chart", () => {
            const mjml = `
			  <mjml>
			    <mj-head>
                  <mj-attributes>
                    <mj-all font-family="Arial, sans-serif" />
                    <mj-class name="mjbc1__source" text-decoration="underlined"/>
                  </mj-attributes>
                </mj-head>
				<mj-body>
				  <mj-section>
					<mj-column>
					  <mj-bar-chart uid="1" stacked align-legends>${JSON.stringify(chart1)}</mj-bar-chart>
					</mj-column>
				  </mj-section>
				</mj-body>
			  </mjml>
			`;

            const html = toHtml(mjml);
            expect(html).toMatchSnapshot();
        });
    });

    describe("getChartTitle", () => {
        it("should render chart title", () => {
            const barChart = new MjBarChart({
                content: JSON.stringify(chart1),
            });
            const json = barChart["getChartTitle"]();
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });
    });

    describe("getChartSource", () => {
        it("should render the scale", () => {
            const json = barChart["getChartSource"]();
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });

        it("should throw when charte source is undefined", () => {
            const barChart = new MjBarChart({
                content: JSON.stringify(chart2),
            });
            const call = () => barChart["getChartSource"]();

            expect(call).toThrow("chart source is undefined");
        });
    });

    describe("getChartBar", () => {
        it("should render chart bar with minimum params", () => {
            const json = barChart["getChartBar"](1, 2);
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });

        it("should render chart bar with maximum params", () => {
            const barChart = new MjBarChart({
                content: JSON.stringify(chart1),
                attributes: {
                    height: "100",
                    "show-values": "false",
                    "bar-width": "20",
                },
            });
            const json = barChart["getChartBar"](0, 1);
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });
    });

    describe("getStackedChartBar", () => {
        it("should render chart bar with minimum params", () => {
            const json = stackedBarChart["getStackedChartBar"](1);
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });

        it("should render chart bar with maximum params", () => {
            const stackedBarChart = new MjBarChart({
                content: JSON.stringify(chart1),
                attributes: {
                    stacked: "true",
                    height: "100",
                    "show-values": "false",
                    "bar-width": "20",
                },
            });
            const json = stackedBarChart["getStackedChartBar"](0);
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });
    });

    describe("getChartBarSeparator", () => {
        it("should render chart bar separator", () => {
            const json = barChart["getChartBarSeparator"]();
            const html = jsonToXML(json);

            expect(json).toStrictEqual({
                tagName: "td",
                attributes: {
                    style: "padding:0;min-width:30px;max-width:30px;",
                },
            });
            expect(html).toBe(
                '<td style="padding:0;min-width:30px;max-width:30px;"></td>',
            );
        });

        it("should render chart bar separator with custom width", () => {
            const barChart = new MjBarChart({
                content: JSON.stringify(chart1),
                attributes: {
                    "separator-width": "40",
                },
            });
            const json = barChart["getChartBarSeparator"]();
            const html = jsonToXML(json);

            expect(json).toStrictEqual({
                tagName: "td",
                attributes: {
                    style: "padding:0;min-width:40px;max-width:40px;",
                },
            });
            expect(html).toBe(
                '<td style="padding:0;min-width:40px;max-width:40px;"></td>',
            );
        });
    });

    describe("getChartBars", () => {
        it("should render chart bars with minimum params", () => {
            const json = barChart["getChartBars"]();
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });

        it("should render chart bars with maximum params", () => {
            const barChart = new MjBarChart({
                content: JSON.stringify(chart1),
                attributes: {
                    height: "100",
                    "show-values": "false",
                    "bar-width": "20",
                    "separator-width": "40",
                },
            });
            const json = barChart["getChartBars"]();
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });
    });

    describe("getDatasetLabel", () => {
        it("should render label", () => {
            const json = barChart["getDatasetLabel"](2);
            const html = jsonToXML(json);

            expect(json).toStrictEqual({
                tagName: "td",
                attributes: {
                    class: "mjbc__label",
                    style: "height:30px;padding:0;font-family:inherit;font-size:14px;text-align:center;min-width:120px;max-width:120px;",
                },
                content: "March",
            });
            expect(html).toBe(
                '<td class="mjbc__label" style="height:30px;padding:0;font-family:inherit;font-size:14px;text-align:center;min-width:120px;max-width:120px;">March</td>',
            );
        });
    });

    describe("getChartLabels", () => {
        it("should render chart labels with minimum params", () => {
            const json = barChart["getChartLabels"]();
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });

        it("should render chart labels with maximum params", () => {
            const barChart = new MjBarChart({
                content: JSON.stringify(chart1),
                attributes: {
                    "separator-width": "40",
                },
            });
            const json = barChart["getChartLabels"]();
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });
    });

    describe("getLegend", () => {
        it("should render legend with minimum params", () => {
            const json = barChart["getLegend"](1);
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });

        it("should render legend with maximum params", () => {
            const barChart = new MjBarChart({
                content: JSON.stringify(chart1),
                attributes: {
                    "bar-width": "40",
                },
            });
            const json = barChart["getLegend"](2);
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });
    });

    describe("getChartLegend", () => {
        it("should render chart legend with minimum params", () => {
            const json = barChart["getChartLegend"]();
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });

        it("should render chart legend with maximum params", () => {
            const barChart = new MjBarChart({
                content: JSON.stringify(chart1),
                attributes: {
                    "bar-width": "20",
                    "align-legends": "true",
                },
            });
            const json = barChart["getChartLegend"]();
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });
    });

    describe("getScale", () => {
        it("should render the scale with minimum params", () => {
            const json = barChart["getScale"]();
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });

        it("should render the scale with maximum params", () => {
            const barChart = new MjBarChart({
                content: JSON.stringify(chart2),
                attributes: {
                    "step-count": "6",
                },
            });
            const json = barChart["getScale"]();
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });

        it("should throw when step count is lower than 2", () => {
            const barChart = new MjBarChart({
                content: JSON.stringify(chart2),
                attributes: {
                    "step-count": "0",
                },
            });
            const call = () => barChart["getScale"]();

            expect(call).toThrow("stepCount must be greater than 1");
        });
    });

    describe("renderJSON", () => {
        it("should render the bar chart as JSON with minimum params", () => {
            const json = barChart["renderJSON"]();

            expect(json).toMatchSnapshot();
        });

        it("should render the bar chart as JSON with maximum params", () => {
            const barChart = new MjBarChart({
                content: JSON.stringify(chart2),
                attributes: {
                    "axis-color": "#e3e3e3",
                    height: "250",
                    "bar-width": "32",
                    "separator-width": "24",
                    "step-count": "8",
                    "show-values": "false",
                },
            });
            const json = barChart["renderJSON"]();

            expect(json).toMatchSnapshot();
        });
    });

    describe("render", () => {
        it("should render the bar chart as HTML with minimum params", () => {
            const html = barChart.render();

            expect(html).toMatchSnapshot();
        });

        it("should render the bar chart as HTML with maximum params", () => {
            const barChart = new MjBarChart({
                content: JSON.stringify(chart2),
                attributes: {
                    "axis-color": "#e3e3e3",
                    height: "100",
                    "bar-width": "20",
                    "separator-width": "40",
                    "step-count": "0",
                    "show-values": "true",
                },
            });
            const html = barChart.render();

            expect(html).toMatchSnapshot();
        });
    });
});
