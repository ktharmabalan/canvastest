export default (tagName: string, { attrs = {}, children = [] }) : {} => {
  return {
    tagName,
    attrs,
    children
  };
};