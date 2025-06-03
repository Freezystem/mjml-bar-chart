export interface JsonNode<T extends string = string> {
    tagName: T;
    attributes?: Record<string, string | undefined>;
    children?: JsonNode[];
    content?: string;
}

const jsonToXML = (
    { tagName, attributes, children, content }: JsonNode,
    level = 0,
): string => {
    const indent = new Array(level).fill("  ").join("");
    const subNode = children?.length
        ? `\n${children.map((n) => jsonToXML(n, level + 1)).join("\n")}\n${indent}`
        : (content ?? "");

    const stringAttrs = Object.keys(attributes ?? {}).reduce(
        (acc, attr) => `${acc} ${attr}="${attributes?.[attr]}"`,
        "",
    );
    return `${indent}<${tagName}${stringAttrs}>${subNode}</${tagName}>`;
};

export default jsonToXML;
