import { mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "150px",
        parseHTML: (element) => element.getAttribute("width") || "150px",
      },
      height: {
        default: "150px",
        parseHTML: (element) => element.getAttribute("height") || "150px",
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "img",
        getAttrs: (dom: HTMLElement) => ({
          src: dom.getAttribute("src"),
          width: dom.getAttribute("width") || "150px",
          height: dom.getAttribute("height") || "150px",
        }),
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },
});
