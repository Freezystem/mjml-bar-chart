import { describe, expect, it } from "vitest";
import jsonToXML from "./jsonToXML";

describe("jsonToXML", () => {
    it("should return valid XML", () => {
        const json1 = { tagName: "p" };
        expect(jsonToXML(json1)).toBe("<p></p>");

        const json2 = { tagName: "p", content: "text" };
        expect(jsonToXML(json2)).toBe("<p>text</p>");

        const json3 = { tagName: "p", content: "text", attributes: {} };
        expect(jsonToXML(json3)).toBe("<p>text</p>");

        const json4 = {
            tagName: "input",
            content: "text",
            attributes: {
                style: "color:#000;",
                type: "number",
            },
        };
        expect(jsonToXML(json4)).toBe(
            '<input style="color:#000;" type="number">text</input>',
        );

        const json5 = {
            tagName: "table",
            attributes: {
                style: "border-collapse:collapse;",
            },
            children: [
                {
                    tagName: "tr",
                    content: "ignored",
                    children: [
                        {
                            tagName: "td",
                            content: "1",
                        },
                        {
                            tagName: "td",
                            content: "2",
                        },
                    ],
                },
            ],
        };
        expect(jsonToXML(json5)).toBe(
            '<table style="border-collapse:collapse;"><tr><td>1</td><td>2</td></tr></table>',
        );
    });
});
