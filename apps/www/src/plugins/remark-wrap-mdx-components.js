/**
 * Wrap imported MDX components with `not-prose` so typography styles only
 * affect the markdown itself.
 */
function wrapMdxComponentsWithNotProse() {
  return (tree) => {
    wrapChildren(tree);
  };
}

function wrapChildren(node, isInsideNotProse = false) {
  if (!node || !Array.isArray(node.children)) {
    return;
  }

  const nextIsInsideNotProse = isInsideNotProse || hasNotProseClass(node);

  node.children = node.children.map((child) => {
    if (nextIsInsideNotProse) {
      wrapChildren(child, true);
      return child;
    }

    if (isCustomMdxComponent(child)) {
      return createNotProseWrapper(child);
    }

    wrapChildren(child, false);
    return child;
  });
}

function isCustomMdxComponent(node) {
  if (
    !node ||
    (node.type !== "mdxJsxFlowElement" && node.type !== "mdxJsxTextElement") ||
    typeof node.name !== "string" ||
    node.name.length === 0
  ) {
    return false;
  }

  const firstCharacter = node.name[0];
  return firstCharacter === firstCharacter.toUpperCase();
}

function hasNotProseClass(node) {
  if (!Array.isArray(node.attributes)) {
    return false;
  }

  return node.attributes.some((attribute) => {
    if (
      !attribute ||
      attribute.type !== "mdxJsxAttribute" ||
      (attribute.name !== "class" && attribute.name !== "className") ||
      typeof attribute.value !== "string"
    ) {
      return false;
    }

    return attribute.value.split(/\s+/).includes("not-prose");
  });
}

function createNotProseWrapper(node) {
  const wrapperType =
    node.type === "mdxJsxTextElement"
      ? "mdxJsxTextElement"
      : "mdxJsxFlowElement";
  const wrapperName = node.type === "mdxJsxTextElement" ? "span" : "div";

  return {
    type: wrapperType,
    name: wrapperName,
    attributes: [
      {
        type: "mdxJsxAttribute",
        name: "class",
        value: "not-prose my-15",
      },
    ],
    children: [node],
  };
}

export default wrapMdxComponentsWithNotProse;
