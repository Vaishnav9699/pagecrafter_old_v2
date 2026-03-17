// Allow TypeScript to import CSS files (e.g., from third-party packages like grapesjs)
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
