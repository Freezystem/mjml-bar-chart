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
    const subNode =
        Array.isArray(children) && children.length > 0
            ? children.map(jsonToXML).join("")
            : (content ?? "");

    const stringAttrs = Object.entries(attributes ?? {}).reduce(
        (acc, [attr, value]) => `${acc} ${attr}="${value}"`,
        "",
    );
    
    return `<${tagName}${stringAttrs}>${subNode}</${tagName}>`;
};

export default jsonToXML;
