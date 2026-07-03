# Workspace Rules for Black Souls Database

These rules guide the development, refactoring, and compilation of the Black Souls Database project. They are converted from the original Cursor rules for the Antigravity agent system.

---

## 1. Zero Tolerance for Hacks, Workarounds, and Technical Debt

This is the most critical code quality standard in this codebase.

### Forbidden Practices
- **Masking Symptoms:** Never write a quick fix that works around a problem instead of solving the root cause properly.
- **Unconventional/Undocumented Patterns:** Do not use undocumented approaches when proper standard solutions exist.
- **Side Effects and Timing Dependencies:** Avoid introducing dependencies on timing, implementation details, or undefined behavior (e.g. using `setTimeout` or `setInterval` for synchronization instead of proper event-driven or promise-based async patterns).
- **Suppression Tools:** Never use dynamic code execution (`eval()`, `Function()`), type coercion (`==` instead of `===`), or comments like `// eslint-disable` to bypass linter/compiler checks.
- **Code Duplication:** Write reusable abstractions rather than copying and pasting functionality across different sections of the codebase.

### Standards
- **Understand Root Causes:** Investigate until you understand why something behaves the way it does before writing code.
- **Use Proper Design Patterns:** Abstract appropriately and construct clean, modular, and testable code from the start.
- **Refactor Immediately:** If you touch legacy code containing hacks or workarounds, clean it up. Never extend existing hacks.

---

## 2. Mandatory Browser Testing & Verification

Every single change affecting user-visible behavior must be verified in a real browser.

### Rules of Engagement
- **No Assumptions:** Never assume code works because "it should" or "it looks correct." Visual validation is mandatory.
- **Navigate Like a User:** When testing, navigate through user workflows using the application's actual menus and buttons. Do not type direct URLs into the address bar or use bookmarks to skip navigation steps.
- **Clear Browser Cache:** Always perform a hard refresh (`Ctrl + Shift + R` or `Cmd + Shift + R`) to guarantee you are not testing cached assets.
- **Console Check:** Open DevTools and verify that the browser console is completely free of warnings, errors, or unexpected debug logs.
- **Test All Viewports & Edge Cases:** Validate normal, loading, and error states, as well as responsive layouts across desktop and mobile sizes.

---

## 3. Cache Busting for Static Assets

Static assets served via GitHub Pages must load immediately without requiring manual browser clearing.

- **Timestamped Query Parameters:** Whenever modifying `style.css`, `script.js`, or `data.js`, update the cache-buster query parameter (`?v=`) inside `app/index.html`.
- **Formatting:** Use a UTC timestamp format down to the second (e.g., `?v=YYYYMMDDThhmmssZ`).

---

## 4. Proper Local Server Deployment

Do not open raw HTML files directly from the filesystem (e.g. using `file:///` URLs or `start app/index.html`) when testing server-dependent capabilities.

- **HTTP Server:** Use a Node.js-based HTTP server (like `http-server`, `serve`, or a custom Express server) to host and serve the static files locally for testing, ensuring correct path resolution and header policies.

---

## 5. Node compilation workflow

Always run the database compilation pipeline before handing work off to the user.

- **Data Compiler Execution:** If you make changes that affect database mappings, translation tables, or JSON schemas, you must run `node app/process-mv-converted-data.js` and verify that the build succeeds with **0 warnings** and **0 untranslated items** before notifying the user.
