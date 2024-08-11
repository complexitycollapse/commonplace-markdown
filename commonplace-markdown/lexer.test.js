import { test, describe, expect } from "just";
import { lex } from "./lexer.js";

describe("lexer", () => {
  test("heading level 1", () => {
    expect(lex("# a heading")).toEqual([{type: "heading", level: 1, content: [{ type: "text", content: [2, 10]}]}]);
  });

  test("heading level 2", () => {
    expect(lex("## a heading")).toEqual([{type: "heading", level: 2, content: [{ type: "text", content: [3, 11]}]}]);
  });

  test("ul - star", () => {
    expect(lex("  * bullet point")).toEqual([{type: "ul", marker: [2, 2], indent: 2, content: [{ type: "text", content: [4, 15]}]}]);
  });

  test("ul - dash", () => {
    expect(lex("  - bullet point")).toEqual([{type: "ul", marker: [2, 2], indent: 2, content: [{ type: "text", content: [4, 15]}]}]);
  });

  test("ol", () => {
    expect(lex("  5. bullet point")).toEqual([{type: "ol", marker: [2, 3], indent: 2, content: [{ type: "text", content: [5, 16]}]}]);
  });

  test("image", () => {
    expect(lex("before ![alt text](srctext) after")).toEqual([{
      type: "text line",
      content: [
        { type: "text", content: [0, 6] },
        { type: "image", alt: [{type: "text", content: [9, 16]}], src: [19, 25] },
        { type: "text", content: [27, 32]}]}]);
  });

  test("link", () => {
    expect(lex("before [link text](linkhref) after")).toEqual([{
      type: "text line",
      content: [
        { type: "text", content: [0, 6] },
        { type: "link", text: [{type: "text", content: [8, 16]}], href: [19, 26] },
        { type: "text", content: [28, 33]}]}]);
  });

  test("bold", () => {
    expect(lex("before ** after")).toEqual([{
      type: "text line",
      content: [
        { type: "text", content: [0, 6] },
        { type: "bold" },
        { type: "text", content: [9, 14]}]}]);
  });

  test("italic", () => {
    expect(lex("before * after")).toEqual([{
      type: "text line",
      content: [
        { type: "text", content: [0, 6] },
        { type: "italic" },
        { type: "text", content: [8, 13]}]}]);
  });
});
