function spanMatch(regex, str, span) {
  regex.lastIndex = span[0];
  const match = regex.exec(str);
  if (!match) return;

  let start = match.index;
  const matches = [...match];
  matches.shift();
  const results = [];

  while (matches.length > 0) {
    let m = matches.shift();
    if (m) {
      results.push([start, start + m.length - 1]);
      start = start + m.length;
    } else {
      results.push([start, -1]);
    }
  }

  if (start - 1 > span[1]) return;

  results.lastIndex = start;
  results.startIndex = match.index;
  return results;
}

function lexHeading(str, indent, levelSpan, space, content) {
  return {
    type: "heading",
    level: levelSpan[1] - levelSpan[0] + 1,
    content : subLineLex(str, content)
  };
}

function lexList(type) {
  return (str, indentSpan, marker, space, content) => {
    return {
      type,
      indent: indentSpan[1] - indentSpan[0] + 1,
      marker,
      content: subLineLex(str, content)
    };
  };
}

function lexBlankLine() {
  return { type: "blank line"};
}

const lineRules = [
  { regex: /(\s*)(#+)( )(.*)((\r?\n)|$)/g, replacement: lexHeading },
  { regex: /( *)(\*|-)( )(.*)((\r?\n)|$)/g, replacement: lexList('ul') },
  { regex: /( *)([0-9]+\.)( )(.*)((\r?\n)|$)/g, replacement: lexList('ol') },
  { regex: /(\s*\n)/g, replacement: lexBlankLine }
];

export function lex(str) {
  let lineSpans = getLineSpans(str);
  const results = lineSpans.map(span => lexLineSpan(str, span));
  return results;
}

function lexLineSpan(str, span) {
  for (const rule of lineRules) {
    const match = spanMatch(rule.regex, str, span);
    if (match && match.startIndex === 0) {
      const product = rule.replacement(str, ...match);
      return product;
    }
  }

  return { type: "text line", content: subLineLex(str, span) };
}

function getLineSpans(str) {
  let index = 0, spans = [];
  while (index < str.length) {
    const unix = str.indexOf("\n", index);
    const win = str.indexOf("\r\n");
    if (unix === -1 && win === -1) {
      spans.push([index, str.length - 1]);
      break;
    }
    const end = unix === -1 ? win : (win === -1 ? unix : Math.min(unix, win));
    end += str[end] === "\n" ? 0 : 1;
    spans.push([index, end - 1]);
    index = end + str[end] === "\n" ? 2 : 3;
  }

  return spans;
}

function lexImage(match, str, span, openSquare, alt, closeAndOpen, src, closeRound) {
  const before = subLineLex(str, [span[0], match.startIndex - 1]);
  const product = {
    type: "image",
    alt: subLineLex(str, alt, true),
    src
  };
  const after = subLineLex(str, [match.lastIndex, span[1]]);

  return before.concat([product], after);
}

function lexLink(match, str, span, openSquare, text, closeAndOpen, href, closeRound) {
  const before = subLineLex(str, [span[0], match.startIndex - 1]);
  const product = {
    type: "link",
    text: subLineLex(str, text, true),
    href
  };
  const after = subLineLex(str, [match.lastIndex, span[1]]);

  return before.concat([product], after);
}

function lexToken(type) {
  return (match, str, span) =>{
    const before = subLineLex(str, [span[0], match.startIndex - 1]);
    return before.concat([{ type }], subLineLex(str, [match.lastIndex, span[1]]));
  }
}

const nonNestingSublineRules = [
  { regex: /(!\[)([^\]]+)(\]\()([^\)]+)(\))/g, replacement: lexImage },
  { regex: /(\[)([^\]]+)(\]\()([^\)]+)(\))/g, replacement: lexLink }
];

const sublineRules = [
  ...nonNestingSublineRules,
  { regex: /(\*\*)/g, replacement: lexToken("bold", 2) },
  { regex: /(\*)/g, replacement: lexToken("italic", 1) }
];

function subLineLex(str, span, noNesting) {
  if (!span || span[0] > span[1]) return [];

  const rules = noNesting ? nonNestingSublineRules : sublineRules;

  for (const rule of rules) {
    const match = spanMatch(rule.regex, str, span);
    if (match) {
      const product = rule.replacement(match, str, span, ...match);
      return product;
    }
  }

  return [{ type: "text", content: span }];
}
