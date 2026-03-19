export interface JsonNode<T extends string = string> {
    tagName: T;
    attributes?: Record<string, string | undefined>;
    children?: JsonNode[];
    content?: string;
}

const jsonToXML = ({
    tagName,
    attributes,
    children,
    content,
}: JsonNode): string => {
    const buffer: string[] = [`<${tagName}`];

    if (attributes) {
        buffer.push(
            ...Object.entries(attributes).map(([attr, value]) =>
                value !== undefined ? ` ${attr}="${value}"` : ` ${attr}`,
            ),
        );
    }

    buffer.push(">");

    if (Array.isArray(children) && children.length > 0) {
        buffer.push(...children.map(jsonToXML));
    } else if (content !== undefined && content !== null) {
        buffer.push(content);
    }

    buffer.push(`</${tagName}>`);

    return buffer.join("");
};

export default jsonToXML;
