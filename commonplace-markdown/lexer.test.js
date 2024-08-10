import { test, describe, expect } from "just";
import { lex } from "./lexer.js";

describe("lexer", () => {
  test("heading level 1", () => {
    expect(lex("# a heading")).toEqual([{type: "heading", level: 1, content: [{ type: "text", content: "a heading"}]}]);
  });

  test("heading level 2", () => {
    expect(lex("## a heading")).toEqual([{type: "heading", level: 2, content: [{ type: "text", content: "a heading"}]}]);
  });

  test("ul", () => {
    expect(lex("  * bullet point")).toEqual([{type: "ul", marker: "*", indent: 2, content: [{ type: "text", content: "bullet point"}]}]);
  });

  test("ol", () => {
    expect(lex("  5. bullet point")).toEqual([{type: "ol", marker: "5.", indent: 2, content: [{ type: "text", content: "bullet point"}]}]);
  });

  test("image", () => {
    expect(lex("before ![alt text](srctext) after")).toEqual([{
      type: "text line",
      content: [
        { type: "text", content: "before " },
        { type: "image", alt: [{type: "text", content: "alt text"}], src: "srctext" },
        { type: "text", content: " after"}]}]);
  });

  test("link", () => {
    expect(lex("before [link text](linkhref) after")).toEqual([{
      type: "text line",
      content: [
        { type: "text", content: "before " },
        { type: "link", text: [{type: "text", content: "link text"}], href: "linkhref" },
        { type: "text", content: " after"}]}]);
  });

  test("bold", () => {
    expect(lex("before ** after")).toEqual([{
      type: "text line",
      content: [
        { type: "text", content: "before " },
        { type: "bold" },
        { type: "text", content: " after"}]}]);
  });

  test("italic", () => {
    expect(lex("before * after")).toEqual([{
      type: "text line",
      content: [
        { type: "text", content: "before " },
        { type: "italic" },
        { type: "text", content: " after"}]}]);
  });
});
