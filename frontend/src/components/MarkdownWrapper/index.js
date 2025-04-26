import React from "react";
import Markdown from "markdown-to-jsx";

const elements = [
	"a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "main", "map", "mark", "marquee", "menu", "menuitem", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr",
	// SVG
	"circle", "clipPath", "defs", "ellipse", "foreignObject", "g", "image", "line", "linearGradient", "marker", "mask", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "stop", "svg", "text", "tspan",
];

const allowedElements = ["a", "b", "blockquote", "strong", "em", "u", "code", "del", "p", "br"];

const CustomLink = ({ children, ...props }) => (
	<a {...props} target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3' }}>
	  {children}
	</a>
  );
  
const CustomBlockquote = ({ children, ...props }) => (
	<blockquote
		{...props}
		style={{
		borderLeft: '4px solid #25D366',
		paddingLeft: '8px',
		backgroundColor: '#f8f8f8',
		margin: '0',
		padding: '0px 4px',
		borderRadius: '0',
		fontSize: 'inherit',
		lineHeight: '1.5',
		display: 'flex',
		color: '#303030'
		}}
	>
		{children}
	</blockquote>
);

const MarkdownWrapper = ({ children, sx }) => {
	const styleProps = sx ? { ...sx } : {};
	const boldRegex = /\*(.*?)\*/g;
	const tildaRegex = /~(.*?)~/g;
	const colonRegex = /([A-Za-z-]+):(\S)/g;

	if (children && children.includes('BEGIN:VCARD')) children = null;
	if (children && children.includes('data:image/')) children = null;

	if (children && boldRegex.test(children)) {
		children = children.replace(boldRegex, "**$1**");
	}
	if (children && tildaRegex.test(children)) {
		children = children.replace(tildaRegex, "~~$1~~");
	}
	if (children && colonRegex.test(children)) {
		children = children.replace(colonRegex, "$1: $2");
	}
		
	if (children && children.includes('>')) {
		children = children.split('\n').map(line => {
			const quoteMatch = line.match(/^>\s*(.*?)$/);
			if (quoteMatch) {
				return `> ${quoteMatch[1]}`;
			}
			return line;
		}).join('\n');
	}

	const options = React.useMemo(() => {
		const markdownOptions = {
			disableParsingRawHTML: true,
			forceInline: false,
			overrides: {
				a: { component: CustomLink },
				blockquote: { component: CustomBlockquote },
				p: {
					component: ({ children, ...props }) => (
						<div {...props} style={{ margin: '0', padding: '0', fontSize: 'inherit', lineHeight: 'inherit', width: '100%' }}>
							{children}
						</div>
					)
				},
			},
		};

		elements.forEach(element => {
			if (!allowedElements.includes(element)) {
				markdownOptions.overrides[element] = el => el.children || null;
			}
		});

		return markdownOptions;
	}, []);

	if (!children) return null;

	return <div style={{ ...styleProps, display: 'inline-block', width: '100%', wordBreak: 'break-word' }}><Markdown options={options}>{children}</Markdown></div>;
};

export default MarkdownWrapper;
