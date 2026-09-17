import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("globals.css scrollbar styling", () => {
  const cssPath = path.resolve(__dirname, "globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  it("defines theme-aligned scrollbar CSS variables in :root", () => {
    expect(cssContent).toMatch(/--scrollbar-thumb:\s*#cdc7b9/);
    expect(cssContent).toMatch(/--scrollbar-thumb-hover:\s*#4a7c64/);
    expect(cssContent).toMatch(/--scrollbar-thumb-active:\s*var\(--forest-deep\)/);
    expect(cssContent).toMatch(/--scrollbar-track:\s*transparent/);
  });

  it("applies standard CSS scrollbar properties for cross-browser support", () => {
    expect(cssContent).toMatch(/scrollbar-width:\s*thin/);
    expect(cssContent).toMatch(/scrollbar-color:\s*var\(--scrollbar-thumb\)\s+var\(--scrollbar-track\)/);
  });

  it("applies WebKit custom scrollbar properties with 8px dimensions and rounded pill thumb", () => {
    expect(cssContent).toMatch(/::-webkit-scrollbar\s*\{[^}]*width:\s*8px/);
    expect(cssContent).toMatch(/::-webkit-scrollbar\s*\{[^}]*height:\s*8px/);
    expect(cssContent).toMatch(/::-webkit-scrollbar-thumb\s*\{[^}]*border-radius:\s*(9999px|8px)/);
    expect(cssContent).toMatch(/::-webkit-scrollbar-thumb\s*\{[^}]*background-color:\s*var\(--scrollbar-thumb\)/);
    expect(cssContent).toMatch(/::-webkit-scrollbar-thumb:hover\s*\{[^}]*background-color:\s*var\(--scrollbar-thumb-hover\)/);
    expect(cssContent).toMatch(/::-webkit-scrollbar-thumb:active\s*\{[^}]*background-color:\s*var\(--scrollbar-thumb-active\)/);
  });
});
