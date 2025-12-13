# Design Guidelines: KreupAI.AuraOS

These guidelines document the design system and styling patterns used in the KreupAI.AuraOS platform. The goal is to maintain a coherent, premium, and sophisticated user experience across all modules.

## Philosophy

Our design philosophy centers on a **premium, "Apple-like" aesthetic** that balances professional utility with visual richness.

-   **Sophisticated**: Clean lines, generous whitespace, and subtle gradients.
-   **Dynamic**: Fluid animations, glassmorphism, and responsive interactions.
-   **Clear**: High contrast for readability, distinct hierarchy for data density.

## Design Tokens

All design tokens are implemented via Tailwind CSS configuration in `apps/web/tailwind.config.ts` and `apps/web/src/styles/globals.css`.

### Colors

We use a custom palette defined in Tailwind config:

#### Brand Colors
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `celestial-indigo` | `#4B3BF5` | Primary actions, brand highlights |
| `quantum-rose` | `#E91E8C` | Secondary actions, creative accents |
| `neural-mint` | `#00D4AA` | Success states, growth indicators |

#### Neutral Spectrum (Moonlight Grays)
Used for backgrounds, borders, and subtle text.
-   `ink-black` (#0A0E27)
-   `deep-space` (#1A1F3A)
-   `twilight` (#404968)
-   `silver-mist` (#8892B0)
-   `cloud` (#CBD5E1)
-   `pearl` (#E8ECF4)
-   `white-glow` (#F7F9FC)

#### Dark Mode (Cosmic Night)
-   `deep-cosmos` (#0A0B1E)
-   `stellar-blue` (#151729)

### Typography

We use a fluid typography scale (`clamp(...)`) to ensure responsiveness across devices without media query jumps.

-   **Headings**: `Clash Display` (Display font), fallback to `Inter`.
-   **Body**: `Inter` (Primary sans-serif).
-   **Code**: `JetBrains Mono` or `Cascadia Code`.

### Layout & Spacing

-   **Grid System**: Use CSS Grid and Flexbox for layouts.
-   **Spacing Scale**: Standard Tailwind spacing, augmented with larger custom values (`18`, `72`, `84`, `96`) for grand layouts.
-   **Border Radius**: Generous rounding (`2xl`, `3xl`, `4xl`) for cards and containers to feel organic and friendly.

### Effects

-   **Glassmorphism**: Use `bg-glass` or `backdrop-blur` utilities to create depth.
-   **Shadows**:
    -   `shadow-glow-indigo`: For primary active elements.
    -   `shadow-card-hover`: For interactive cards.
-   **Gradients**: `bg-aurora-gradient` for brand moments.

## Components

UI components are centralized in the `@aura/ui` package.

-   **Buttons**: Should use `celestial-indigo` for primary actions.
-   **Cards**: Use `bg-white` (light) or `bg-stellar-blue` (dark) with `shadow-card`.
-   **Icons**: We use **Lucide React** (`lucide-react`) for all iconography. Ensure stroke width is consistent (usually `1.5` or `2`).

## CSS & Styling Best Practices

1.  **Tailwind First**: Avoid writing custom CSS in `.css` files unless absolutely necessary (e.g., complex animations).
2.  **Semantic Classes**: Use the mapped semantic colors (`bg-primary`, `text-muted-foreground`) to ensure Dark Mode compatibility automatically.
3.  **Responsive Design**: Mobile-first is good, but ensure the Desktop experience is "Grand" (utilizing the full width of large displays).

## Accessibility

-   **Contrast**: Text on colored backgrounds must meet WCAG AA standards.
-   **Focus States**: All interactive elements must have visible focus rings (`ring-2`).
-   **Semantic HTML**: Use proper `<header>`, `<main>`, `<nav>`, and `<button>` tags.
