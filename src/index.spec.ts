import mjml2html from "mjml";
import { registerComponent } from "mjml-core";
import MjBarChart from "./index";
// @ts-expect-error
import jsonToXML from "mjml-core/lib/helpers/jsonToXML";

function toHtml(mjml: string): string {
	const { html, errors } = mjml2html(mjml);
	return errors.length > 0 ? errors[0].message : html;
}

describe("mjml-bar-chart", () => {
	beforeAll(() => {
		registerComponent(MjBarChart);
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
			expect(html).toBe('<td style="padding:0;min-width:30px;max-width:30px;"></td>');
		});
	});

	describe("getDatasetLabel", () => {
		it("should render label", () => {
			const json = barChart["getDatasetLabel"](2);
			const html = jsonToXML(json);

			expect(json).toStrictEqual({
				tagName: "td",
				attributes: {
					style: "height:30px;padding:0;font-size:14px;text-align:center;overflow:hidden;min-width:90px;max-width:90px;",
				},
				content: "March",
			});
			expect(html).toBe(
				'<td style="height:30px;padding:0;font-size:14px;text-align:center;overflow:hidden;min-width:90px;max-width:90px;">March</td>'
			);
		});
	});

	describe("getLegend", () => {
		it("should render legend", () => {
			const json = barChart["getLegend"](1);
			const html = jsonToXML(json);

			expect(json).toStrictEqual({
				tagName: "span",
				attributes: {
					style: "padding:0 10px;height:20px;font-size:14px;border-left:30px solid #ffb3c6;",
				},
				content: "sales",
			});
			expect(html).toBe(
				'<span style="padding:0 10px;height:20px;font-size:14px;border-left:30px solid #ffb3c6;">sales</span>'
			);
		});
	});

	describe("renderJSON", () => {
		it("should render barChart", () => {
			const json = barChart["renderJSON"]();

			expect(json).toMatchSnapshot();
		});
	});
});
