export function sectionize(products) {
  const results = [];
  processSection(products, 0, 0, results);
  return results;
}

function processSection(products, level, pos, sectionContents) {

  while (pos < products.length) {

    const current = products[pos];

    if (current.type !== "heading") {
      sectionContents.push(current);
      ++pos;
    } else if (current.level <= level) {
        return pos;
    } else {
      const subContent = [];
      pos = processSection(products, current.level, pos + 1, subContent);
      sectionContents.push({ type: "section", heading: current, content: subContent});
    }
  }
}
