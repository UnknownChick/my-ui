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
