function lexHeading(level) {
  return (_, content) => {
    return {
      type: "heading",
      level,
      content: lexSubline(content)
    };
  }
}

function createList(listType) {
  return (_, indent, marker, content) => ({
    type: listType,
    indent: indent.length,
    marker,
    content: lexSubline(content)
  });
}

function lexBlankLine() {
  return { type: "blank line" };
}

const lineRules = [
  { regex: /^# (.*$)/, replacement: lexHeading(1) },
  { regex: /^## (.*$)/, replacement: lexHeading(2) },
  { regex: /^### (.*$)/, replacement: lexHeading(3) },
  { regex: /^#### (.*$)/, replacement: lexHeading(4) },
  { regex: /^##### (.*$)/, replacement: lexHeading(5) },
  { regex: /^###### (.*$)/, replacement: lexHeading(6) },
  { regex: /(^ *)(\*|-) (.*$)/, replacement: createList('ul') },
  { regex: /(^ *)([0-9]\.) (.*$)/, replacement: createList('ol') },
  { regex: /^\s*$/, replacement: lexBlankLine }
];

export function lex(str) {
  const lines = str.split("\n");

  const lexedLines = lines.map(lexLine);

  return lexedLines;
}

function lexLine(line) {

  for (const rule of lineRules) {

    const match = rule.regex.exec(line);
    
    if (match) {
      return rule.replacement(...match);
    }
  }

  return { type: "text line", content: lexSubline(line) };
}

function lexToken(type) {
  return (_, before, after) => {
    const token = {
      type
    };

    return lexSubline(before).concat([token], lexSubline(after));
  }
}

function createImage(_, before, altText, src, after) {
  const image = {
    type: "image",
    alt: lexSubline(altText.trim(), true),
    src: src.trim()
  };
  return lexSubline(before).concat([image], lexSubline(after));
}

function createLink(_, before, text, href, after) {
  const image = {
    type: "link",
    text: lexSubline(text.trim(), true),
    href: href.trim()
  };
  return lexSubline(before).concat([image], lexSubline(after));
}

const nonNestingSublineRules = [
  { regex: /^(.*)!\[([^\]]+)\]\(([^\)]+)\)(.*)$/, replacement: createImage },
  { regex: /^(.*)\[([^\]]+)\]\(([^\)]+)\)(.*)$/, replacement: createLink }
];

const sublineRules = [
  { regex: /^(.*)\*\*(.*)$/, replacement: lexToken("bold") },
  { regex: /^(.*)\*(.*)$/, replacement: lexToken("italic") }
];

function lexSubline(subline, noNesting) {

  const rules = noNesting ? sublineRules : nonNestingSublineRules.concat(sublineRules);

  for (const rule of rules) {

    const match = rule.regex.exec(subline);

    if (match) {
      return rule.replacement(...match);
    }
  }

  return [{ type: "text", content: subline }];
}
