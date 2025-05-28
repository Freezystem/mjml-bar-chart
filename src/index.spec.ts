import mjml2html from "mjml";
import { registerComponent } from "mjml-core";
import jsonToXML, { type JsonNode } from "./helpers/jsonToXML";
import MjBarChart, { type Chart } from "./index";

function toHtml(mjml: string): string {
    const { html, errors } = mjml2html(mjml);
    return errors.length > 0 ? errors[0].message : html;
}

describe("mjml-bar-chart", () => {
    beforeAll(() => {
        // @ts-ignore
        registerComponent(MjBarChart, { registerDependencies: true });
    });

    const chart1: Chart = {
        title: "Sum of Requests by Department",
        source: {
            url: "#sources",
            label: "source: wikipedia ↗"
        },
        datasets: ["January", "February", "March"],
        series: [
            {
                label: "support",
                color: "#ffe5ec",
                data: [33, 18, 7],
            },
            {
                label: "sales",
                color: "#ffb3c6",
                data: [14, 66, 15],
            },
            {
                label: "tech",
                color: "#fb6f92",
                data: [27, 42, 21],
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

    describe("mjml markup", () => {
        it("should render the bar chart", () => {
            const mjml = `
			  <mjml>
			    <mj-head>
                  <mj-attributes>
                    <mj-class name="mjbc__title" color="#333"/>
                  </mj-attributes>
                </mj-head>
				<mj-body>
				  <mj-section>
					<mj-column>
					  <mj-bar-chart uid="1">${JSON.stringify(chart1)}</mj-bar-chart>
					</mj-column>
				  </mj-section>
				</mj-body>
			  </mjml>
			`;

            const html = toHtml(mjml);
            // require("node:fs").writeFileSync("test.html", html);
            expect(html).toMatchSnapshot();
        });
    });

    describe("getChartTitle", () => {
        it("should render chart title", () => {
            const barChart = new MjBarChart({
                content: JSON.stringify(chart1),
            });
            const json = barChart["getChartTitle"]() as JsonNode;
            const html = jsonToXML(json);

            expect(json).toStrictEqual({
                "tagName": "tr",
                "children": [
                    {
                        "tagName": "td",
                        "attributes": {
                            "style": "padding:0"
                        },
                        "children": [
                            {
                                "tagName": "table",
                                "attributes": {
                                    "style": "width:100%;border-collapse:collapse;"
                                },
                                "children": [
                                    {
                                        "tagName": "tr",
                                        "children": [
                                            {
                                                "tagName": "td",
                                                "attributes": {
                                                    "class": "mjbc__title",
                                                    "style": "padding:0;height:40px;font-weight:bold;text-align:center;font-size:20px;"
                                                },
                                                "content": "Sum of Requests by Department"
                                            }
                                        ]
                                    },
                                    {
                                        "tagName": "tr",
                                        "children": [
                                            {
                                                "tagName": "td",
                                                "attributes": {
                                                    "class": "mjbc__source",
                                                    "style": "padding:0;height:20px;text-align:center;font-size:12px;vertical-align:top;color:#3e3e3e;"
                                                },
                                                "children": [
                                                    {
                                                        "tagName": "a",
                                                        "attributes": {
                                                            "href": "#sources",
                                                            "target": "_blank",
                                                            "style": "color:inherit; text-decoration:none;"
                                                        },
                                                        "content": "source: wikipedia ↗"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
            expect(html).toBe(
                "<tr>\n" +
                '  <td style="padding:0">\n' +
                '    <table style="width:100%;border-collapse:collapse;">\n' +
                "      <tr>\n" +
                '        <td class="mjbc__title" style="padding:0;height:40px;font-weight:bold;text-align:center;font-size:20px;">Sum of Requests by Department</td>\n' +
                "      </tr>\n" +
                "      <tr>\n" +
                '        <td class="mjbc__source" style="padding:0;height:20px;text-align:center;font-size:12px;vertical-align:top;color:#3e3e3e;">\n' +
                '          <a href="#sources" target="_blank" style="color:inherit; text-decoration:none;">source: wikipedia ↗</a>\n' +
                '        </td>\n' +
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
                    '      <td style="padding:0;font-size:12px;vertical-align:bottom;text-align:center;line-height:16px;height:89px;">42</td>\n' +
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
            expect(html).toBe(
                '<td style="padding:0">\n' +
                    '  <table style="padding:0;min-width:20px;max-width:20px;">\n' +
                    "    <tr>\n" +
                    '      <td style="padding:0;font-size:12px;vertical-align:bottom;text-align:center;line-height:16px;height:95px;"></td>\n' +
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
                    style: "height:30px;padding:0;font-size:14px;text-align:center;overflow:hidden;min-width:90px;max-width:90px;",
                },
                content: "March",
            });
            expect(html).toBe(
                '<td class="mjbc__label" style="height:30px;padding:0;font-size:14px;text-align:center;overflow:hidden;min-width:90px;max-width:90px;">March</td>',
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

            expect(json).toStrictEqual({
                tagName: "span",
                attributes: {
                    class: "mjbc__legend",
                    style: "padding:0 10px;height:20px;font-size:14px;border-left:30px solid #ffb3c6;",
                },
                content: "sales",
            });
            expect(html).toBe(
                '<span class="mjbc__legend" style="padding:0 10px;height:20px;font-size:14px;border-left:30px solid #ffb3c6;">sales</span>',
            );
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

            expect(json).toStrictEqual({
                tagName: "span",
                attributes: {
                    class: "mjbc__legend",
                    style: "padding:0 10px;height:20px;font-size:14px;border-left:40px solid #fb6f92;",
                },
                content: "tech",
            });
            expect(html).toBe(
                '<span class="mjbc__legend" style="padding:0 10px;height:20px;font-size:14px;border-left:40px solid #fb6f92;">tech</span>',
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
                content: JSON.stringify(chart1),
                attributes: {
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
                content: JSON.stringify(chart2),
                attributes: {
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
                content: JSON.stringify(chart2),
                attributes: {
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
