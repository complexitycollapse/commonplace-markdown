import { describe, test, expect } from  "just";
import { parse } from "./parser.js";

describe("parser", () => {
  test("heading", () => {
    const res = parse("# a heading");
    expect(res).toEqual([{ type: "heading", level: 1, content: [{type:"text", content: "a heading"}]}]);
  });

  test("bold", () => {
    const res = parse("before **bolded** after");
    expect(res).toEqual([{
      type: "paragraph",
      content: [
        {type: "text", content: "before "},
        {type: "bold", content: [{type:"text", content: "bolded"}]},
        {type: "text", content: " after"}
      ]
    }]);
  });

  test("italic", () => {
    const res = parse("before *italicized* after");
    expect(res).toEqual([{
      type: "paragraph",
      content: [
        {type: "text", content: "before "},
        {type: "italic", content: [{type:"text", content: "italicized"}]},
        {type: "text", content: " after"}
      ]
    }]);
  });

  test("link", () => {
    const res = parse("before [link text](link href) after");
    expect(res).toEqual([{
      type: "paragraph",
      content: [
        {type: "text", content: "before "},
        {type: "link", text: [{type: "text", content: "link text"}], href: "link href"},
        {type: "text", content: " after"}
      ]
    }]);
  });

  test("image", () => {
    const res = parse("before ![alt text](src) after");
    expect(res).toEqual([{
      type: "paragraph",
      content: [
        {type: "text", content: "before "},
        {type: "image", alt: [{type: "text", content: "alt text"}], src: "src"},
        {type: "text", content: " after"}
      ]
    }]);
  });

  test("ul - dash", () => {
    const res = parse("    - the bullet point");
    expect(res).toEqual([{
      type: "ul",
      indent: 4,
      items: [{type: "li", marker: "-", content: [{type: "text", content: "the bullet point"}]}]
    }]);
  });

  test("ul - star", () => {
    const res = parse("    * the bullet point");
    expect(res).toEqual([{
      type: "ul",
      indent: 4,
      items: [{type: "li", marker: "*", content: [{type: "text", content: "the bullet point"}]}]
    }]);
  });

  test("ol", () => {
    const res = parse("    1. the bullet point");
    expect(res).toEqual([{
      type: "ol",
      indent: 4,
      items: [{type: "li", marker: "1.", content: [{type: "text", content: "the bullet point"}]}]
    }]);
  });
});
