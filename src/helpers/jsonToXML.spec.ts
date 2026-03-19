import { describe, expect, it } from "vitest";
import jsonToXML from "./jsonToXML";

describe("jsonToXML", () => {
    it("should convert a simple tag to XML", () => {
        const json = { tagName: "p" };

        expect(jsonToXML(json)).toBe("<p></p>");
    });

    it("should ignore attributes with undefined values", () => {
        const json = {
            tagName: "div",
            attributes: {
                id: "test",
                hidden: undefined,
            },
        };

        expect(jsonToXML(json)).toBe('<div id="test"></div>');
    });

    it("should only add attribute if value is an empty string", () => {
        const json = {
            tagName: "div",
            attributes: {
                id: "test",
                visible: "",
            },
        };

        expect(jsonToXML(json)).toBe('<div id="test" visible></div>');
    });

    it("should convert a tag with content to XML", () => {
        const json = { tagName: "p", content: "text" };

        expect(jsonToXML(json)).toBe("<p>text</p>");
    });

    it("should convert a tag with content and empty attributes to XML", () => {
        const json = { tagName: "p", content: "text", attributes: {} };

        expect(jsonToXML(json)).toBe("<p>text</p>");
    });

    it("should convert a tag with attributes and content to XML", () => {
        const json = {
            tagName: "input",
            content: "text",
            attributes: {
                style: "color:#000;",
                type: "number",
            },
        };

        expect(jsonToXML(json)).toBe(
            '<input style="color:#000;" type="number">text</input>',
        );
    });

    it("should ignore content when children are present", () => {
        const json = {
            tagName: "div",
            content: "this should be ignored",
            children: [{ tagName: "span", content: "child" }],
        };

        expect(jsonToXML(json)).toBe("<div><span>child</span></div>");
    });

    it("should convert a nested structure to XML", () => {
        const json = {
            tagName: "table",
            attributes: {
                class: "test",
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

        expect(jsonToXML(json)).toBe(
            '<table class="test" style="border-collapse:collapse;"><tr><td>1</td><td>2</td></tr></table>',
        );
    });
});
