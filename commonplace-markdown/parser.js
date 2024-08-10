import { lex } from "./lexer.js";

export function parse(str) {
  const lexemes = lex(str);
  const result = parseLexemes(lexemes);
  return result;
}

function parseLexemes(remainingLexemes) {
  let result = [];

  while (remainingLexemes.length > 0) {
    const {product, remainder} = process(remainingLexemes);
    result = result.concat(product);
    remainingLexemes = remainder;
  }

  return result;
}

function process(lexemes) {
  if (lexemes.length === 0) return [];

  const head = lexemes.shift();
  let result;

  switch (head.type) {
    case "heading":
      result = parseHeading(head, lexemes);
      break;
    case "image":
      result = parseImage(head, lexemes);
      break;
    case "link":
      result = parseLink(head, lexemes);
      break;
    case "ul":
      result = parseList("ul", head, lexemes);
      break;
      case "ol":
        result = parseList("ol", head, lexemes);
        break;
    case "text":
      result = { product: [head], remainder: lexemes };
      break;
    case "text line":
      result = parseTextLine(head, lexemes);
      break;
    case "blank line":
      result = { product: [], lexemes };
      break;
    default:
      throw new Error("Bad type: " + head.type);
  }

  return result;
}

function parseHeading(heading, remainder) {
  return {
    product: [{
      type: "heading",
      level: heading.level,
      content: parseLexemes(heading.content)
    }],
    remainder
  };
}

function parseImage(img, remainder) {
  return {
    product: [{
      type: "image",
      alt: parseLexemes(img.alt),
      src: img.src
    }],
    remainder
  };
}

function parseLink(link, remainder) {
  return {
    product: [{
      type: "link",
      text: parseLexemes(link.text),
      href: link.href
    }],
    remainder
  };
}

function parseTextLine(line, remainder) {
  let acc = line.content;
  while(remainder.length > 0 && remainder[0].type === "text line") {
    acc = acc.concat(remainder.shift().content);
  }

  return {
    product: [{
      type: "paragraph",
      content: parseLexemes(acc)
    }],
    remainder
  };
}

function parseList(listType, item, remainder) {
  remainder.unshift(item);
  const items = [], indent = item.indent;
  
  while (remainder.length > 0 && remainder[0].type === listType) {
    if (indent === remainder[0].indent) {
      const parsedItem = parseListItem(remainder.shift(), remainder);
      items.push(parsedItem);
    } else if (indent < remainder[0].indent) {
      const sublist = parseList(remainder.shift(), remainder);
      items[items.length - 1].content.push(sublist);
    } else {
      break;
    }
  }

  return {
    product: [{
      type: listType,
      items,
      indent
    }],
    remainder
  };
}

function parseListItem(start, remainder) {
  let acc = start.content;
  while(remainder.length > 0 && (remainder[0].type === "text line" || remainder[0].type === "blank line")) {
    acc = acc.concat(remainder.shift()?.content ?? []);
  }

  return {
    type: "li",
    content: parseLexemes(acc),
    marker: start.marker
  };
}