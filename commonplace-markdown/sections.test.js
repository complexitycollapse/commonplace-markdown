import { describe, test, expect } from "just"
import { sectionize } from "./sections.js";
import { parse } from "./parser.js";

describe("sectionize", () => {
  test("leave stuff without headings alone", () => {
    const res = sectionize(parse("para1\n\npara2\n\npara3"));

    expect(res).toHaveLength(3);
    expect(res.map(p => p.type)).toEqual(["paragraph", "paragraph", "paragraph"]);
  });

  test("Top level heading will absorb all following paragraphs into a section", () => {
    const res = sectionize(parse("# head\npara1\n\npara2\n\npara3"));

    expect(res).toHaveLength(1);
    expect(res[0]).toHaveProperty("type", "section");
    expect(res[0].heading.content[0].content).toEqual([2, 5]);
    expect(res[0].content).toHaveLength(3);
  });

  test("Two top level headings will result in two sections, absorbing following paragraphs", () => {
    const products = parse("# head 1\npara1\n# head 2\npara2\n\npara3");
    const res = sectionize(products);

    expect(res).toHaveLength(2);
    expect(res[0]).toHaveProperty("type", "section");
    expect(res[0].heading).toEqual(products[0]);
    expect(res[0].content).toEqual([products[1]]);
    expect(res[1]).toHaveProperty("type", "section");
    expect(res[1].heading).toEqual(products[2]);
    expect(res[1].content).toEqual([products[3], products[4]]);
  });

  test("Nested headings go inside other headings", () => {
    const products = parse("# head 1\npara1\n## head 2\npara2\n\npara3");
    const res = sectionize(products);

    expect(res).toHaveLength(1);
    expect(res[0]).toHaveProperty("type", "section");
    expect(res[0].heading).toEqual(products[0]);
    expect(res[0].content).toEqual([products[1], {type: "section", heading: products[2], content: [products[3], products[4]]}]);
  });
});
