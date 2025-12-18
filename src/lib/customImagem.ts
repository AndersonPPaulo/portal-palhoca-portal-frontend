import { mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (element) =>
          element.getAttribute("width") || element.style.width || "100%",
      },
      height: {
        default: "auto",
        parseHTML: (element) =>
          element.getAttribute("height") || element.style.height || "auto",
      },
      style: {
        default: "max-width: 100%; height: auto; display: block;",
        parseHTML: (element) => element.getAttribute("style"),
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "img",
        getAttrs: (dom: HTMLElement) => ({
          src: dom.getAttribute("src"),
          width: dom.getAttribute("width") || dom.style.width || "100%",
          height: dom.getAttribute("height") || dom.style.height || "auto",
          style:
            dom.getAttribute("style") ||
            "max-width: 100%; height: auto; display: block;",
        }),
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const attrs = mergeAttributes(HTMLAttributes, {
      style: `max-width: 100%; height: auto; display: block; ${
        HTMLAttributes.style || ""
      }`,
    });
    return ["img", attrs];
  },
});
