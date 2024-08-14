import { Link, Span, Edl } from "@commonplace/core";
import { paragraphType, documentType, strongType, emphasisType } from "@commonplace/document-model";

export function xanify(originalContent, parsedData) {
  
  const links = [];

  function getSpans(product) {
    return iterateSpans(product).map(s => Span(originalContent, s[0], s[1] - s[0] + 1));
  }

  function processData(product) {

    switch (product.type) {
      case "paragraph":
        linkForContent(paragraphType, product.content);
        break;
      case "bold":
        linkForContent(strongType, product.content);
        break;
      case "italic":
        linkForContent(emphasisType, product.content);
        break;
      case "text":
        // Nothing to do
        break;
      default:
        throw new Error("Cannot xanify type: " + product.type);
    }
  }

  function linkForContent(linkType, content) {
    const spans = getSpans(content);
    const plink = Link(linkType, [undefined, spans]);
    links.push(plink);
    content.map(processData);
  }

  const clips = parsedData.map(getSpans).flat();

  parsedData.forEach(processData);

  return Edl(documentType, clips, links);
}

function iterateSpans(product) {
  if (Array.isArray(product)){
    return product.map(iterateSpans).flat();
  }

  switch (product.type) {
    case "paragraph":
    case "bold":
    case "italic":
    case "heading":
    case "li":
      return product.content.map(iterateSpans).flat();
    case "link":
      return product.text.map(iterateSpans).flat();
    case "image":
      return product.alt.map(iterateSpans).flat();
    case "ul":
    case "ol":
      return product.items.map(iterateSpans).flat();
    case "text":
      return [product.content];
    default:
      throw new Error("Cannot xanify type: " + product.type);
  }
}
