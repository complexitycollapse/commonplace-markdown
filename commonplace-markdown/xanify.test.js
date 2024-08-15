import { describe, test, expect } from "just";
import { xanify } from "./xanify.js"
import { parse } from "./parser.js";
import { emphasisType, listItemType, listType, markupType, paragraphType, strongType } from "@commonplace/document-model";
import { InlinePointer, LinkPointer } from "@commonplace/core";

function getEnd(link, endName) {
  return link.ends.find(e => e.name === endName);
}

describe("xanify", () => {
  test("single paragraph", () => {
    let res = xanify("ori", parse("Some text"));
    
    expect(res.clips).toHaveLength(1);
    expect(res.clips[0]).toMatchObject({origin: "ori", start: 0, length: 9});
    expect([...res.links.values()]).toHaveLength(1);
    expect([...res.links.values()][0]).toMatchObject({
      type: paragraphType,
      ends: [{name: undefined, pointers: [{origin: "ori", start: 0, length: 9}]}]});
  });

  test("bold", () => {
    let res = xanify("ori", parse("**Some text**"));
    
    expect(res.clips).toHaveLength(1);
    expect(res.clips[0]).toMatchObject({origin: "ori", start: 2, length: 9});
    expect([...res.links.values()]).toHaveLength(2);
    expect([...res.links.values()].find(l => l.type === strongType)).toMatchObject({
      type: strongType,
      ends: [{name: undefined, pointers: [{origin: "ori", start: 2, length: 9}]}]});
  });

  test("italic", () => {
    let res = xanify("ori", parse("*Some text*"));
    
    expect(res.clips).toHaveLength(1);
    expect(res.clips[0]).toMatchObject({origin: "ori", start: 1, length: 9});
    expect([...res.links.values()]).toHaveLength(2);
    expect([...res.links.values()].find(l => l.type === emphasisType)).toMatchObject({
      type: emphasisType,
      ends: [{name: undefined, pointers: [{origin: "ori", start: 1, length: 9}]}]});
  });

  test("ul", () => {
    const item1Span = {origin: "ori", start: 2, length: 6};
    const item2Span = {origin: "ori", start: 11, length: 6};

    let res = xanify("ori", parse("- Item 1\n- Item 2"));

    expect(res.clips).toHaveLength(2);
    expect(res.clips[0]).toMatchObject(item1Span);
    expect(res.clips[1]).toMatchObject(item2Span);

    const itemLinks = [...res.links.values()].filter(l => l.type === listItemType);
    expect(itemLinks).toHaveLength(2);
    expect(itemLinks[0].ends).toMatchObject([{name: undefined, pointers: [item1Span]}]);
    expect(itemLinks[1].ends).toMatchObject([{name: undefined, pointers: [item2Span]}]);

    const listLink = [...res.links.values()].filter(l => l.type === listType)[0];
    expect(listLink.ends).toMatchObject([{name: "items", pointers: [LinkPointer("item1"), LinkPointer("item2")]}]);

    const markupLink = [...res.links.values()].filter(l => l.type === markupType)[0];
    expect(getEnd(markupLink, "value").pointers).toMatchObject([InlinePointer("bullets")]);
  });

  test("ol", () => {
    const item1Span = {origin: "ori", start: 3, length: 6};
    const item2Span = {origin: "ori", start: 13, length: 6};

    let res = xanify("ori", parse("1. Item 1\n2. Item 2"));

    expect(res.clips).toHaveLength(2);
    expect(res.clips[0]).toMatchObject(item1Span);
    expect(res.clips[1]).toMatchObject(item2Span);

    const itemLinks = [...res.links.values()].filter(l => l.type === listItemType);
    expect(itemLinks).toHaveLength(2);
    expect(itemLinks[0].ends).toMatchObject([{name: undefined, pointers: [item1Span]}]);
    expect(itemLinks[1].ends).toMatchObject([{name: undefined, pointers: [item2Span]}]);

    const listLink = [...res.links.values()].filter(l => l.type === listType)[0];
    expect(listLink.ends).toMatchObject([{name: "items", pointers: [LinkPointer("item1"), LinkPointer("item2")]}]);

    const markupLink = [...res.links.values()].filter(l => l.type === markupType)[0];
    expect(getEnd(markupLink, "value").pointers).toMatchObject([InlinePointer("numbers")]);
  });
});
