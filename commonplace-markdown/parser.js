import { lex } from "./lexer.js";

export function parse(str) {
  const lexemes = lex(str);
  const result = parseLexemes(lexemes);
  return result;
}

function parseLexemes(remainingLexemes) {
  let result = [];

  while (remainingLexemes.length > 0) {
    const product = process(remainingLexemes);
    result = result.concat(product);
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
    case "bold":
      result = parseEmphasis(head, lexemes);
      break;
    case "italic":
      result = parseEmphasis(head, lexemes);
      break;
    case "text":
      result = [head];
      break;
    case "text line":
      result = parseTextLine(head, lexemes);
      break;
    case "blank line":
      result = [];
      break;
    default:
      throw new Error("Bad type: " + head.type);
  }

  return result;
}

function parseHeading(heading) {
  return {
    type: "heading",
    level: heading.level,
    content: parseLexemes(heading.content)
  };
}

function parseImage(img) {
  return {
    type: "image",
    alt: parseLexemes(img.alt),
    src: img.src
  };
}

function parseLink(link) {
  return {
    type: "link",
    text: parseLexemes(link.text),
    href: link.href
  };
}

function parseTextLine(line, remainder) {
  let acc = line.content;
  while(remainder.length > 0 && remainder[0].type === "text line") {
    acc = acc.concat(remainder.shift().content);
  }

  return {
    type: "paragraph",
    content: parseLexemes(acc)
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
    type: listType,
    items,
    indent
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

function parseEmphasis(start, remainder) {
  let i = 0;
  
  while (i < remainder.length) {
    if (remainder[i].type === start.type) {
      
      const emphasisedItems = [];

      for(let j = 0; j < i; ++j) {
        emphasisedItems.push(remainder.shift());
      }
      remainder.shift();

      if (emphasisedItems.length === 0) {
        return { type: "text", content: emphasisMarker(start.type) + emphasisMarker(start.type) };
      }

      return {
        type: start.type,
        content: parseLexemes(emphasisedItems)
      };
    }
    ++i;
  }

  return {
    type: "text",
    content: emphasisMarker(start.type)
  };
}

function emphasisMarker(type) {
  if (type === "bold") return "**";
  if (type === "italic") return "*";
  throw new Error("Invalid emphasis type: " + type);
}
