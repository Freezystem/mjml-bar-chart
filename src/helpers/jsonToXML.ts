export interface JsonNode {
	tagName: string;
	attributes?: Record<string, string>;
	children?: JsonNode[];
	content?: string;
}

const jsonToXML = (
	{ tagName, attributes, children, content }: JsonNode,
	level: number = 0
): string => {
	const indent = new Array(level).fill("  ").join("");
	const subNode = children?.length
		? "\n" + children.map((n) => jsonToXML(n, level + 1)).join("\n") + `\n${indent}`
		: content || "";

	const stringAttrs = Object.keys(attributes || {}).reduce(
		(acc, attr) => `${acc} ${attr}="${attributes?.[attr]}"`,
		""
	);
	return `${indent}<${tagName}${stringAttrs}>${subNode}</${tagName}>`;
};

export default jsonToXML;
