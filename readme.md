# My UI

My UI is a modular SCSS library built around BEM component classes, configurable design tokens, and light/dark themes. The full stylesheet entry point is `src/scss/index.scss`.

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
├── vendor/      # Optional third-party integrations, excluded from npm until dependencies are declared
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

Compile that entry point with Sass and include the resulting CSS in the application. Every setting is optional: omitted values keep the defaults. The Sass module can only be configured once per compilation, so configure it in the application's single root stylesheet.

The generated CSS exposes semantic custom properties such as `--color-primary`, `--color-secondary`, `--color-success`, and `--color-danger`. Set `data-theme="white"` (or the compatible alias `data-theme="light"`) or `data-theme="dark"` on the root element to select a theme. The dark theme can be disabled with `$enable-dark-mode: false`.

Wrap native controls in an element with the `form` class to opt into My UI form styles.

## Utilities

The default bundle includes a compact set of spacing, flexbox, grid, sizing, typography, border, color, and aspect-ratio utilities. Set `$enable-utilities: false` in the root Sass configuration to omit them.

The advanced `row`, `position`, `opacity`, and `prose` partials are not loaded by default. Import one directly only when a project needs it.

## Components

Component blocks use BEM modifiers, for example:

```html
<button class="btn btn--primary btn--md">
  <span class="btn__label">Save</span>
</button>
```

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

`initMyUI({ root, theme, components })` initializes matching components under `root` (default: `document`), including `root` itself when it matches. `theme` defaults to `true`. The `components` object accepts per-component options under `accordion`, `drawer`, `dropdown`, `modal`, `pagination`, `tabs`, `toast`, and `tooltip`. Initialization reuses existing instances. Direct construction with `new Dropdown(element)` throws if an instance already exists; use `Dropdown.getOrCreate(element, options)` to reuse it. Call `destroy()` before removing an initialized element. For script-tag or side-effect usage, import `myui/auto`, which also initializes the bundled icons. Components can also be imported individually from `myui/components/dropdown`, and the Sass entry point is `myui/scss`.

Interactive controls keep their ARIA state in sync. Dropdowns open with Enter, Space, or Arrow Down; Arrow keys/Home/End navigate menu items and Escape closes and restores focus. Tabs use the standard tablist/tab/tabpanel relationships; with `autoActivate: false`, Enter or Space activates the focused tab. Modal and drawer instances remove registered listeners when destroyed. Toast messages are inserted as text; pass plain text rather than HTML.

### Component contracts

| Component | Required markup | Main behavior | Cleanup / notes |
| --- | --- | --- | --- |
| Accordion | `details.accordion`, `.accordion__title`, `.accordion__content` | Native disclosure, optional group closing and animation | Cancels animation on destroy |
| Drawer | `.drawer`, optional `.drawer__close`; `data-drawer-target` trigger | Backdrop, Escape close, focus containment and restoration | Destroy removes backdrop and listeners |
| Dropdown | `.dropdown__toggle` and `.dropdown__content` | Click/outside close and keyboard menu navigation | Syncs `aria-controls` and `aria-expanded` |
| Modal | Native `dialog.modal`; `data-modal-target` trigger | Native modal, Escape/backdrop options and focus handling | Destroy cancels animation and listeners |
| Pagination | `.pagination`, `.pagination__list`, `.pagination__link` | Active page and previous/next states | `onChange` callback and `pagination:change` event |
| Tabs | `.tabs__nav`, `.tabs__button`, `.tabs__panel`; `aria-controls` maps button to panel | Arrow/Home/End navigation; optional hash persistence | `onChange` callback |
| Toast | Trigger, usually `[data-toast-trigger]` | Timed live-region notification | Title and message are plain text |
| Tooltip | `[data-tooltip]` trigger | Shows on hover/focus and uses `aria-describedby` | Removes generated node and ARIA reference |
| ThemeToggle | `[data-theme-toggle]` controls | Persists choice or follows system preference | `ThemeToggle.destroy()` removes listeners |

Opening buttons for drawers and dialogs receive `aria-controls` and an `aria-expanded` state automatically. Tabs can omit IDs/roles: My UI creates stable-in-page IDs, links each tab to its corresponding panel by `aria-controls` (or by position when omitted), and maintains the roving tab stop.

### Runtime theme customization

Sass configuration sets compiled defaults. Override CSS custom properties on an app or theme wrapper for runtime branding:

    [data-brand=acme] {
      --color-primary: #4b3cc4;
      --color-on-primary: #fff;
      --spacing-4: 1.125rem;
      --radius: 0.75rem;
    }

Colors, spacing, font sizes, radii, transitions and shadows are emitted as custom properties and consumed by the component and utility classes, so these overrides affect the actual rendered styles. Theme selectors override neutral surface/text/border tokens; brand colors remain shared unless overridden. Sass values are build-time defaults, while CSS variables support runtime or scoped overrides.

## Build and package

```sh
npm run dev
npm run build
npm run build:scss
npm test
npm run lint
npm pack --dry-run
```

The package metadata points Sass consumers to `src/scss/index.scss` and ships the compiled default stylesheet as `dist/myui.css`. `prepack` builds that stylesheet before `npm pack` or `npm publish`. The repository is prepared for packaging but is not published automatically; choose the package license and verify the npm name before publishing.
