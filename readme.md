# My UI

My UI is a modular SCSS library built around BEM component classes, configurable design tokens, and light/dark themes. `src/scss/index.scss` is the standard entry point; `src/scss/full.scss` also includes the advanced utilities and third-party integrations.

## Project layout

```text
src/scss/
├── abstracts/   # Functions, mixins, tokens, and component APIs
├── base/        # Reset, root custom properties, and typography
├── components/  # BEM component blocks and their modifiers
├── config/      # Default Sass settings (all public settings use !default)
├── layouts/     # Form and page-layout patterns
├── themes/      # White/light and dark theme overrides
├── utilities/   # Optional utility classes
├── vendor/      # Packages integrations
└── index.scss   # Public full-library entry point
```

The Vite page is a development showcase. `myui.config.scss` is its project-level configuration file; change the values there without editing the library defaults.

## Configure in a project

Create a Sass entry point at the project root and configure the package before using its styles:

```scss
@use 'myui' with (
  $color-primary: #5b4ce2,
  $color-secondary: #334155,
  $color-success: #168a57,
  $color-warning: #c87f0a,
  $color-danger: #c2393d,
  $color-info: #167f9c,
  $color-bg: #ffffff,
  $color-surface: #f8f9fa,
  $color-text: #191919,
  $color-text-muted: #6b7280,
  $color-border: #e5e7eb,
  $dark-bg: #111827,
  $dark-surface: #1f2937,
  $dark-text: #f9fafb,
  $dark-text-muted: #9ca3af,
  $dark-border: #374151
);
```

To include the entire library, use `@use 'myui/scss/full' with (...)` instead. It includes the standard bundle, advanced utilities and the Dropzone and Select2  styles. The package installs their dependencies. Vite resolves them automatically; with the Sass CLI, add `--load-path=node_modules`.

Compile that entry point with Sass and include the resulting CSS in the application. Every setting is optional: omitted values keep the defaults. The Sass module can only be configured once per compilation, so configure it in the application's single root stylesheet.

The generated CSS exposes semantic custom properties such as `--color-primary`, `--color-secondary`, `--color-success`, and `--color-danger`. Set `data-theme="white"` (or the compatible alias `data-theme="light"`) or `data-theme="dark"` on the root element to select a theme. The dark theme can be disabled with `$enable-dark-mode: false`.

Wrap native controls in an element with the `form` class to opt into My UI form styles.

## Utilities

The default bundle includes a compact set of spacing, flexbox, grid, sizing, typography, border, color, and aspect-ratio utilities. Set `$enable-utilities: false` in the root Sass configuration to omit them.

The advanced `row`, `position`, `opacity`, and `prose` partials are included by the full entry and can also be imported individually as `myui/scss/utilities/row`, `myui/scss/utilities/position`, `myui/scss/utilities/opacity`, and `myui/scss/utilities/prose`. The row grid's `gap-0` to `gap-5` modifiers apply whole-rem gaps only when combined with `.row`; other elements keep the standard spacing scale. Other standard gaps also update the row's column calculations.

## Components

Component blocks use BEM modifiers, for example:

```html
<button class="btn btn--primary btn--md">
  <span class="btn__label">Save</span>
</button>
```

Sidebars are collapsible menu blocks: `.sidebar__toggle` switches the icon rail, and each `.sidebar__link--toggle` controls its sibling `.sidebar__submenu`. Add `data-sidebar-storage-key` to persist the collapsed state, or `data-sidebar-accordion="true"` to allow only one open branch at a time.

The shared component API provides size and semantic-color variant generators. Component size modifiers follow `--xs`, `--sm`, `--md`, `--lg`, `--xl`, and `--xxl`; component-specific Sass maps define the dimensions and spacing for each size. Accent modifiers such as `btn--soft-blue` are driven by the configurable `$accents` map.

To add a component, create a partial in `src/scss/components/`, define its block styles, local variant mixins and size map, then forward the partial from `components/_index.scss`. Keep shared helpers in `abstracts/` and project-specific token choices in the root configuration entry point.

Form control styles are opt-in: add the `form` class to a form element to apply My UI field styles.

### JavaScript setup

The JavaScript entry point has no initialization side effects. Import the components and initialize the current document explicitly:

```js
import { initMyUI, Dropdown, ThemeToggle } from 'myui';

initMyUI({ components: { tabs: { autoActivate: false } } });
initMyUI(); // safe to call again after injecting new markup
const dropdown = Dropdown.getOrCreate(document.querySelector('.dropdown'));
dropdown?.destroy();
ThemeToggle.destroy(); // removes listeners installed by initMyUI
```

`initMyUI({ root, theme, components })` initializes matching components under `root` (default: `document`), including `root` itself when it matches. `theme` defaults to `true`. The `components` object accepts per-component options under `accordion`, `drawer`, `dropdown`, `modal`, `pagination`, `sidebar`, `tabs`, `toast`, and `tooltip`. Initialization reuses existing instances. Direct construction with `new Dropdown(element)` throws if an instance already exists; use `Dropdown.getOrCreate(element, options)` to reuse it. Call `destroy()` before removing an initialized element. For script-tag or side-effect usage, import `myui/auto`, which also initializes the bundled icons. Components can also be imported individually from `myui/components/dropdown`, and the Sass entry point is `myui/scss`.

The full stylesheet includes the third-party styles, but does not initialize those libraries automatically: Dropzone needs an upload URL and Select2 needs a target element. Their JavaScript is available through `myui/vendor/dropzone`, `myui/vendor/jquery`, and `myui/vendor/select2`. Import and configure them explicitly where needed.

Interactive controls keep their ARIA state in sync. Dropdowns open with Enter, Space, or Arrow Down; Arrow keys/Home/End navigate menu items and Escape closes and restores focus. Tabs use the standard tablist/tab/tabpanel relationships; with `autoActivate: false`, Enter or Space activates the focused tab. Modal and drawer instances remove registered listeners when destroyed. Toast messages are inserted as text; pass plain text rather than HTML.

### Component contracts

| Component | Required markup | Main behavior | Cleanup / notes |
| --- | --- | --- | --- |
| Accordion | `details.accordion`, `.accordion__title`, `.accordion__content` | Native disclosure, optional group closing and animation | Cancels animation on destroy; respects reduced motion |
| Drawer | `.drawer`, optional `.drawer__close`; `data-drawer-target` trigger | Backdrop, Escape close, focus containment and restoration | Destroy removes backdrop and listeners |
| Dropdown | `.dropdown__toggle` and `.dropdown__content` | Click/outside close and keyboard menu navigation | Syncs `aria-controls` and `aria-expanded` |
| Modal | Native `dialog.modal`; `data-modal-target` trigger | Native modal, Escape/backdrop options, focus and scroll-lock handling | Destroy cancels animation and listeners; respects reduced motion |
| Pagination | `.pagination`, `.pagination__list`, `.pagination__link` | Active page and previous/next states | `onChange` callback and `pagination:change` event |
| Sidebar | `.sidebar`, `.sidebar__toggle`, `.sidebar__link--toggle` + `.sidebar__submenu` | Icon rail collapse, submenu disclosure, optional persistence | Closed submenus become inert; destroy removes listeners and generated titles |
| Tabs | `.tabs__nav`, `.tabs__button`, `.tabs__panel`; `aria-controls` maps button to panel | Arrow/Home/End navigation; optional hash persistence | `onChange` callback |
| Toast | Trigger, usually `[data-toast-trigger]` | Timed live-region notification | Title and message are plain text |
| Tooltip | `[data-tooltip]` trigger | Shows on hover/focus and uses `aria-describedby` | Removes generated node and ARIA reference |
| ThemeToggle | `[data-theme-toggle]` controls | Persists choice or follows system preference | `ThemeToggle.destroy()` removes listeners |

Opening buttons for drawers and dialogs receive `aria-controls` and an `aria-expanded` state automatically. Tabs can omit IDs/roles: My UI creates stable-in-page IDs, links each tab to its corresponding panel by `aria-controls` (or by position when omitted), and maintains the roving tab stop.

Avatar markup with an image uses `class="avatar avatar--image"`; table cells containing a select can use `class="table__cell table__cell--select"`. These explicit modifiers avoid relational selectors.

The build targets Chrome 118+, Firefox 146+, and Safari/iOS 17.4+. This reflects the CSS features used by the source (including scoped styles and container queries); older browsers need a separate fallback or polyfill.

### Runtime theme customization

Sass configuration sets compiled defaults. Override CSS custom properties on an app or theme wrapper for runtime branding:

    [data-brand=acme] {
      --color-primary: #4b3cc4;
      --color-on-primary: #fff;
      --spacing-4: 1.125rem;
      --radius: 0.75rem;
    }

Colors, spacing, font sizes, radii, transitions and shadows are emitted as custom properties and consumed by the component and utility classes, so these overrides affect the actual rendered styles. Buttons use `--color-<semantic>-hover` and `--color-<semantic>-active`; their defaults are derived from the runtime semantic color, and dark mode uses lighter interaction shades. Theme selectors override neutral surface/text/border tokens; brand colors remain shared unless overridden. Sass values are build-time defaults, while CSS variables support runtime or scoped overrides.

## Build and package

The development/test toolchain requires Node.js 22.22.2 or newer. The published browser bundle has its own support targets listed above.

```sh
npm run dev
npm run build
npm run build:scss
npm test
npm run test:watch
npm run lint
npm pack --dry-run
```

The package exposes both Sass entries and the compiled `myui/css` and `myui/css/full` stylesheets. `prepare` builds them before Git installs, `npm pack`, or `npm publish`. The repository is prepared for packaging but is not published automatically; choose the package license and verify the npm name before publishing.

Unit tests run with Vitest and jsdom, so interactive component tests exercise a DOM implementation without launching a browser. Use Playwright separately for end-to-end checks in supported browsers.
