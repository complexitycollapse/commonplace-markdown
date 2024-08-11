import { describe, test, expect } from  "just";
import { parse } from "./parser.js";

describe("parser", () => {
  test("heading", () => {
    const res = parse("# a heading");
    expect(res).toEqual([{type: "heading", level: 1, content: [{ type: "text", content: [2, 10]}]}]);
  });

  test("bold", () => {
    const res = parse("before **bolded** after");
    expect(res).toEqual([{
      type: "paragraph",
      content: [
        { type: "text", content: [0, 6] },
        { type: "bold",
          content: [{type: "text", content: [9, 14]}]
         },
        { type: "text", content: [17, 22]}
      ]
    }]);
  });

  test("italic", () => {
    const res = parse("before *italicized* after");
    expect(res).toEqual([{
      type: "paragraph",
      content: [
        { type: "text", content: [0, 6] },
        { type: "italic",
          content: [{type: "text", content: [8, 17]}]
         },
        { type: "text", content: [19, 24]}
      ]
    }]);
  });

  test("link", () => {
    const res = parse("before [link text](linkhref) after");
    expect(res).toEqual([{
      type: "paragraph",
      content: [
        {type: "text", content: [0, 6]},
        {type: "link", text: [{type: "text", content: [8, 16]}], href: [19, 26]},
        {type: "text", content: [28, 33]}
      ]
    }]);
  });

  test("image", () => {
    const res = parse("before ![alt text](src) after");
    expect(res).toEqual([{
      type: "paragraph",
      content: [
        {type: "text", content: [0, 6]},
        {type: "image", alt: [{type: "text", content: [9, 16]}], src: [19, 21]},
        {type: "text", content: [23, 28]}
      ]
    }]);
  });

  test("ul - dash", () => {
    const res = parse("    - the bullet point");
    expect(res).toEqual([{
      type: "ul",
      indent: 4,
      items: [{type: "li", marker: [4, 4], content: [{type: "text", content: [6, 21]}]}]
    }]);
  });

  test("ul - star", () => {
    const res = parse("    * the bullet point");
    expect(res).toEqual([{
      type: "ul",
      indent: 4,
      items: [{type: "li", marker: [4, 4], content: [{type: "text", content: [6, 21]}]}]
    }]);
  });

  test("ul - list", () => {
    const res = parse("- point 1\n- point 2\n- point 3");
    expect(res).toEqual([{
      type: "ul",
      indent: 0,
      items: [
        {type: "li", marker: [0, 0], content: [{type: "text", content: [2, 8]}]},
        {type: "li", marker: [10, 10], content: [{type: "text", content: [12, 18]}]},
        {type: "li", marker: [20, 20], content: [{type: "text", content: [22, 28]}]}
      ]
    }]);
  });

  test("ol", () => {
    const res = parse("    1. the bullet point");
    expect(res).toEqual([{
      type: "ol",
      indent: 4,
      items: [{type: "li", marker: [4, 5], content: [{type: "text", content: [7, 22]}]}]
    }]);
  });
});
