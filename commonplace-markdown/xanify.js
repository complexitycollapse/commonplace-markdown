import { Link, Span, Edl, Image, LinkPointer, InlinePointer } from "@commonplace/core";
import { paragraphType, documentType, strongType, emphasisType, listItemType, listType,
  markupType
 } from "@commonplace/document-model";

export function xanify(originalContent, parsedData) {
  
  let linkNameUnique = 0;
  const links = new Map();

  function addLink(nameish, link) {
    const name = nameish + ++linkNameUnique;
    links.set(name, link);
    return [name, link];
  }

  const convertSpan = (s) => Span(originalContent, s[0], s[1] - s[0] + 1);

  function processData(product) {
    if (Array.isArray(product)) {
      return product.map(processData).flat();
    }

    switch (product.type) {
      case "paragraph":
        return linkAndContent("p", paragraphType, product.content);
        break;
      case "bold":
        return linkAndContent("b", strongType, product.content);
        break;
      case "italic":
        return linkAndContent("i", emphasisType, product.content);
        break;
      case "text":
        return convertSpan(product.content);
        break;
      case "link":
      case "image":
        return Image(product.src);
      case "heading":
      case "ul":
      case "ol":
        return processList(product);
      default:
        throw new Error("Cannot xanify type: " + product.type);
    }
  }

  function linkAndContent(linkNameish, linkType, content) {
    const clips = processData(content);
    const plink = Link(linkType, [undefined, clips]);
    addLink(linkNameish, plink);
    return clips;
  }

  function processList(list) {
    let clips = [], itemLinkNames = [];
    for (const item of list.items) {
      const [itemLink, itemClips] = processListItem(item);
      const [itemLinkName] = addLink("item", itemLink);
      itemLinkNames.push(itemLinkName);
      clips = clips.concat(itemClips);
    }

    const [listLinkName] = addLink(list, Link(listType, ["items", itemLinkNames.map(n => LinkPointer(n))]));

    // And add list marker style markup to distinguish ul from ol
    addLink("list marker", Link(markupType, 
      ["targets", [LinkPointer(listLinkName)]],
      ["attribute", [InlinePointer("list marker")]],
      ["value", [InlinePointer(list.type == "ol" ? "numbers" : "bullets")]],
      ["inheritance", [InlinePointer("direct")]]));

    return clips;
  }

  function processListItem(item) {
    const clips = processData(item.content);
    const link = Link(listItemType, [undefined, clips]);
    return [link, clips];
  }

  const clips = processData(parsedData);

  return Edl(documentType, clips, links);
}
