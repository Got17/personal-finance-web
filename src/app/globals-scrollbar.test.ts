import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("globals.css scrollbar styling", () => {
  const cssPath = path.resolve(__dirname, "globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  it("defines theme-aligned scrollbar CSS variables in :root", () => {
    expect(cssContent).toMatch(/--scrollbar-thumb:\s*#8fb59f/);
    expect(cssContent).toMatch(/--scrollbar-thumb-hover:\s*var\(--forest\)/);
    expect(cssContent).toMatch(/--scrollbar-thumb-active:\s*var\(--forest-deep\)/);
    expect(cssContent).toMatch(/--scrollbar-track:\s*transparent/);
  });

  it("applies standard CSS scrollbar properties to html, body, and all elements", () => {
    expect(cssContent).toMatch(/html,\s*body,\s*\*\s*\{[^}]*scrollbar-width:\s*thin/);
    expect(cssContent).toMatch(/scrollbar-color:\s*var\(--scrollbar-thumb\)\s+var\(--scrollbar-track\)/);
  });

  it("applies WebKit custom scrollbar properties uniformly to root and all elements with 8px dimensions", () => {
    expect(cssContent).toMatch(/::-webkit-scrollbar,\s*html::-webkit-scrollbar,\s*body::-webkit-scrollbar,\s*\*::-webkit-scrollbar\s*\{[^}]*width:\s*8px/);
    expect(cssContent).toMatch(/::-webkit-scrollbar,\s*html::-webkit-scrollbar,\s*body::-webkit-scrollbar,\s*\*::-webkit-scrollbar\s*\{[^}]*height:\s*8px/);
    expect(cssContent).toMatch(/::-webkit-scrollbar-thumb,\s*html::-webkit-scrollbar-thumb,\s*body::-webkit-scrollbar-thumb,\s*\*::-webkit-scrollbar-thumb\s*\{[^}]*border-radius:\s*(9999px|8px)/);
    expect(cssContent).toMatch(/::-webkit-scrollbar-thumb,\s*html::-webkit-scrollbar-thumb,\s*body::-webkit-scrollbar-thumb,\s*\*::-webkit-scrollbar-thumb\s*\{[^}]*background-color:\s*var\(--scrollbar-thumb\)/);
    expect(cssContent).toMatch(/::-webkit-scrollbar-thumb:hover,\s*html::-webkit-scrollbar-thumb:hover,\s*body::-webkit-scrollbar-thumb:hover,\s*\*::-webkit-scrollbar-thumb:hover\s*\{[^}]*background-color:\s*var\(--scrollbar-thumb-hover\)/);
    expect(cssContent).toMatch(/::-webkit-scrollbar-thumb:active,\s*html::-webkit-scrollbar-thumb:active,\s*body::-webkit-scrollbar-thumb:active,\s*\*::-webkit-scrollbar-thumb:active\s*\{[^}]*background-color:\s*var\(--scrollbar-thumb-active\)/);
  });

  it("ensures Dropdown and Modal components do not override global custom scrollbars", () => {
    const dropdownCssPath = path.resolve(__dirname, "../components/ui/dropdowns/Dropdown.module.css");
    const dropdownCss = fs.readFileSync(dropdownCssPath, "utf-8");
    expect(dropdownCss).not.toContain("scrollbar-color");
    expect(dropdownCss).not.toContain("::-webkit-scrollbar");

    const modalCssPath = path.resolve(__dirname, "../components/ui/modals/Modal.module.css");
    const modalCss = fs.readFileSync(modalCssPath, "utf-8");
    expect(modalCss).not.toContain("scrollbar-color");
    expect(modalCss).not.toContain("::-webkit-scrollbar");
  });
});
