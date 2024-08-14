import { describe, test, expect } from "just";
import { xanify } from "./xanify.js"
import { parse } from "./parser.js";
import { paragraphType } from "@commonplace/document-model";

describe("xanify", () => {
  test("single paragraph", () => {
    let res = xanify("ori", parse("Some text"));
    
    expect(res.clips).toHaveLength(1);
    expect(res.clips[0]).toMatchObject({origin: "ori", start: 0, length: 9});
    expect(res.links).toHaveLength(1);
    expect(res.links[0]).toMatchObject({type: paragraphType, ends: [{name: undefined, pointers: [{origin: "ori", start: 0, length: 9}]}]});
  });
});
