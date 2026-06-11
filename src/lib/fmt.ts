// Tiny inline formatter: escapes HTML, then renders `code` and *emphasis*.
export function inlineFmt(input: string): string {
  const esc = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return esc
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}
