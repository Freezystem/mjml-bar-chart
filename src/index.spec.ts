import mjml2html from "mjml";
import { registerComponent } from "mjml-core";
import jsonToXML, { type JsonNode } from "./helpers/jsonToXML";
import MjBarChart from "./index";

function toHtml(mjml: string): string {
    const { html, errors } = mjml2html(mjml);
    return errors.length > 0 ? errors[0].message : html;
}

describe("mjml-bar-chart", () => {
    beforeAll(() => {
        // @ts-ignore
        registerComponent(MjBarChart, { registerDependencies: true });
    });

    const attributes = {
        "dataset-labels": "January,February,March",
        datasets: "[[33,14,27],[18,66,42],[7,15,21]]",
        groups: "support,sales,tech",
        colors: "#ffe5ec,#ffb3c6,#fb6f92",
    };
    const barChart = new MjBarChart({ attributes });

    describe("mjml markup", () => {
        it("should render the bar chart", () => {
            const mjml = `
			  <mjml>
				<mj-body>
				  <mj-section>
					<mj-column>
					  <mj-bar-chart
						title="Sum of Requests by Department"
						dataset-labels="January,February,March" 
						datasets="[[33,14,27],[18,66,42],[7,15,21]]"
						groups="support,sales,tech"
						colors="#ffe5ec,#ffb3c6,#fb6f92"/>
					</mj-column>
				  </mj-section>
				</mj-body>
			  </mjml>
			`;

            expect(toHtml(mjml)).toMatchSnapshot();
        });
    });

    describe("getChartTitle", () => {
        it("should not render chart title if empty", () => {
            const json = barChart["getChartTitle"]();
            expect(json).not.toBeDefined();
        });

        it("should render chart title", () => {
            const barChart = new MjBarChart({
                attributes: {
                    ...attributes,
                    title: "Sum of Requests by Department",
                },
            });
            const json = barChart["getChartTitle"]() as JsonNode;
            const html = jsonToXML(json);

            expect(json).toStrictEqual({
                tagName: "tr",
                children: [
                    {
                        tagName: "td",
                        attributes: { style: "padding:0" },
                        children: [
                            {
                                tagName: "table",
                                attributes: {
                                    style: "width:100%;border-collapse:collapse;",
                                },
                                children: [
                                    {
                                        tagName: "tr",
                                        children: [
                                            {
                                                tagName: "td",
                                                attributes: {
                                                    style: "padding:0;height:40px;font-weight:bold;text-align:center;font-size:20px;font-family:Ubuntu, Helvetica, Arial, sans-serif;",
                                                },
                                                content:
                                                    "Sum of Requests by Department",
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
            expect(html).toBe(
                "<tr>\n" +
                    '  <td style="padding:0">\n' +
                    '    <table style="width:100%;border-collapse:collapse;">\n' +
                    "      <tr>\n" +
                    '        <td style="padding:0;height:40px;font-weight:bold;text-align:center;font-size:20px;font-family:Ubuntu, Helvetica, Arial, sans-serif;">Sum of Requests by Department</td>\n' +
                    "      </tr>\n" +
                    "    </table>\n" +
                    "  </td>\n" +
                    "</tr>",
            );
        });
    });

    describe("getChartBar", () => {
        it("should render chart bar with minimum params", () => {
            const json = barChart["getChartBar"](1, 2);
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toBe(
                '<td style="padding:0">\n' +
                    '  <table style="padding:0;min-width:30px;max-width:30px;">\n' +
                    "    <tr>\n" +
                    '      <td style="padding:0;font-size:12px;font-family:Ubuntu, Helvetica, Arial, sans-serif;vertical-align:bottom;text-align:center;line-height:16px;height:89px;">42</td>\n' +
                    "    </tr>\n" +
                    "    <tr>\n" +
                    '      <td style="padding:0;height:127px;background-color:#fb6f92;"></td>\n' +
                    "    </tr>\n" +
                    "  </table>\n" +
                    "</td>",
            );
        });

        it("should render chart bar with maximum params", () => {
            const barChart = new MjBarChart({
                attributes: {
                    ...attributes,
                    height: "100",
                    "show-values": "false",
                    "bar-width": "20",
                },
            });
            const json = barChart["getChartBar"](0, 1);
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toBe(
                '<td style="padding:0">\n' +
                    '  <table style="padding:0;min-width:20px;max-width:20px;">\n' +
                    "    <tr>\n" +
                    '      <td style="padding:0;font-size:12px;font-family:Ubuntu, Helvetica, Arial, sans-serif;vertical-align:bottom;text-align:center;line-height:16px;height:95px;"></td>\n' +
                    "    </tr>\n" +
                    "    <tr>\n" +
                    '      <td style="padding:0;height:21px;background-color:#ffb3c6;"></td>\n' +
                    "    </tr>\n" +
                    "  </table>\n" +
                    "</td>",
            );
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
                attributes: {
                    ...attributes,
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
                attributes: {
                    ...attributes,
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
                    style: "height:30px;padding:0;font-size:14px;font-family:Ubuntu, Helvetica, Arial, sans-serif;text-align:center;overflow:hidden;min-width:90px;max-width:90px;",
                },
                content: "March",
            });
            expect(html).toBe(
                '<td style="height:30px;padding:0;font-size:14px;font-family:Ubuntu, Helvetica, Arial, sans-serif;text-align:center;overflow:hidden;min-width:90px;max-width:90px;">March</td>',
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
                attributes: {
                    ...attributes,
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

            expect(json).toStrictEqual({
                tagName: "span",
                attributes: {
                    style: "padding:0 10px;height:20px;font-size:14px;font-family:Ubuntu, Helvetica, Arial, sans-serif;border-left:30px solid #ffb3c6;",
                },
                content: "sales",
            });
            expect(html).toBe(
                '<span style="padding:0 10px;height:20px;font-size:14px;font-family:Ubuntu, Helvetica, Arial, sans-serif;border-left:30px solid #ffb3c6;">sales</span>',
            );
        });

        it("should render legend with maximum params", () => {
            const barChart = new MjBarChart({
                attributes: {
                    ...attributes,
                    "bar-width": "40",
                    "font-family": "Menlo",
                },
            });
            const json = barChart["getLegend"](2);
            const html = jsonToXML(json);

            expect(json).toStrictEqual({
                tagName: "span",
                attributes: {
                    style: "padding:0 10px;height:20px;font-size:14px;font-family:Menlo;border-left:40px solid #fb6f92;",
                },
                content: "tech",
            });
            expect(html).toBe(
                '<span style="padding:0 10px;height:20px;font-size:14px;font-family:Menlo;border-left:40px solid #fb6f92;">tech</span>',
            );
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
                attributes: {
                    ...attributes,
                    "bar-width": "20",
                },
            });
            const json = barChart["getChartLegend"]();
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });
    });

    describe("getChart", () => {
        it("should render the chart with minimum params", () => {
            const json = barChart["getChart"]();
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });

        it("should render the chart with maximum params", () => {
            const barChart = new MjBarChart({
                attributes: {
                    title: "Some Stats",
                    "dataset-labels": "September,October,November",
                    datasets: "[[12,76],[38,20],[64,39]]",
                    groups: "legal,hr",
                    colors: "#95d5b2,#52b788",
                    "axis-color": "#e3e3e3",
                    height: "250",
                    "bar-width": "32",
                    "separator-width": "24",
                    "step-count": "8",
                    "show-values": "false",
                },
            });
            const json = barChart["getChart"]();
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });
    });

    describe("getScale", () => {
        it("should render the scale with minimum params", () => {
            const json = barChart["getScale"]() as JsonNode;
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });

        it("should render the scale with maximum params", () => {
            const barChart = new MjBarChart({
                attributes: {
                    ...attributes,
                    datasets: "[[12,76],[38,20],[64,39]]",
                    groups: "legal,hr",
                    colors: "#95d5b2,#52b788",
                    "step-count": "6",
                },
            });
            const json = barChart["getScale"]() as JsonNode;
            const html = jsonToXML(json);

            expect(json).toMatchSnapshot();
            expect(html).toMatchSnapshot();
        });

        it("should not render the scale when step count is lower than 2", () => {
            const barChart = new MjBarChart({
                attributes: {
                    ...attributes,
                    "step-count": "0",
                },
            });
            const json = barChart["getScale"]();

            expect(json).not.toBeDefined();
        });
    });

    describe("renderJSON", () => {
        it("should render the bar chart as JSON with minimum params", () => {
            const json = barChart["renderJSON"]();

            expect(json).toMatchSnapshot();
        });

        it("should render the bar chart as JSON with maximum params", () => {
            const barChart = new MjBarChart({
                attributes: {
                    title: "Some Stats",
                    "dataset-labels": "September,October,November",
                    datasets: "[[12,76],[38,20],[64,39]]",
                    groups: "legal,hr",
                    colors: "#95d5b2,#52b788",
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
                attributes: {
                    title: "Some Stats",
                    "dataset-labels": "September,October,November",
                    datasets: "[[12,76],[38,20],[64,39]]",
                    groups: "legal,hr",
                    colors: "#95d5b2,#52b788",
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
