---
name: landing-page-developer
description: Create high-converting landing pages with expert frontend development and marketing strategy. Use this skill when asked to build landing pages, sales pages, product launch pages, SaaS marketing pages, app download pages, waitlist pages, or any conversion-focused single-page websites. Combines technical implementation (HTML/CSS/JS, React, Next.js, Tailwind) with marketing psychology, copywriting frameworks, and 2024-2025 design trends to deliver pages that convert visitors into customers.
---

# Landing Page Developer

Create conversion-optimized landing pages that combine exceptional frontend craft with strategic marketing. Every landing page must achieve two goals: look stunning AND drive action.

## Workflow

### 1. Discovery

Before designing, understand the context:

- **Product/Service**: What is being sold? What problem does it solve?
- **Target Audience**: Who is the ideal customer? Pain points? Desires?
- **Conversion Goal**: Newsletter signup? Demo request? Purchase? Download?
- **Brand**: Existing brand guidelines? Tone (professional/playful/luxury/tech)?
- **Competitors**: Any reference sites they like or want to differentiate from?

If context is missing, make strategic assumptions based on industry best practices and state them.

### 2. Strategic Foundation

Define before coding:

- **Value Proposition**: One sentence explaining unique benefit
- **Primary CTA**: Single most important action
- **Objection Handlers**: Top 3 reasons visitors might not convert
- **Social Proof Strategy**: Testimonials, logos, metrics, case studies

### 3. Implementation

Build with modern stack preferences:

- **React/Next.js** for dynamic pages with TypeScript
- **HTML/CSS/JS** for static pages
- **Tailwind CSS** for rapid, consistent styling
- **Framer Motion** for animations in React

## Page Architecture

Structure landing pages using the proven conversion flow:

```
┌─────────────────────────────────────────┐
│  HERO SECTION                           │
│  - Headline (benefit-driven)            │
│  - Subheadline (clarify + support)      │
│  - Primary CTA (high contrast)          │
│  - Hero visual (product/demo/video)     │
└─────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────┐
│  SOCIAL PROOF BAR                       │
│  - Logo strip OR metrics OR press       │
└─────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────┐
│  PROBLEM/SOLUTION                       │
│  - Agitate the pain point               │
│  - Present your solution                │
└─────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────┐
│  FEATURES/BENEFITS                      │
│  - 3-6 key benefits with visuals        │
│  - Focus on outcomes, not specs         │
└─────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────┐
│  HOW IT WORKS (optional)                │
│  - 3-step process                       │
│  - Reduce perceived complexity          │
└─────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────┐
│  TESTIMONIALS/CASE STUDIES              │
│  - Real names, photos, specifics        │
│  - Address different objections         │
└─────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────┐
│  PRICING (if applicable)                │
│  - Clear tiers with recommended         │
│  - Anchor with highest value            │
└─────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────┐
│  FAQ                                    │
│  - Handle remaining objections          │
│  - SEO opportunity                      │
└─────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────┐
│  FINAL CTA                              │
│  - Urgency/scarcity if authentic        │
│  - Repeat value proposition             │
└─────────────────────────────────────────┘
```

## 2024-2025 Design Trends

Apply these current trends strategically:

**Layout & Space**

- Bento grid layouts for feature sections
- Asymmetric hero compositions
- Generous whitespace (luxury feel)
- Full-viewport hero sections with scroll indicators

**Typography**

- Variable fonts with weight animations
- Oversized display headlines (clamp-based responsive)
- Mixed serif + sans-serif pairings
- Kinetic text reveals on scroll

**Visual Effects**

- Glassmorphism for cards and modals
- Gradient meshes and aurora backgrounds
- 3D elements with subtle parallax
- Grain/noise texture overlays for depth
- Cursor-following effects on hero elements

**Micro-interactions**

- Magnetic buttons (cursor attraction)
- Scroll-triggered section reveals (staggered)
- Hover state transformations
- Loading state skeletons

**Color**

- Bold, saturated accent colors
- Dark mode as default option
- Gradient text for headlines
- High contrast CTAs

**Fonts to Consider**

- Display: Clash Display, Cabinet Grotesk, Satoshi, General Sans, Neue Montreal
- Body: Plus Jakarta Sans, DM Sans, Outfit, Manrope

## Copywriting Frameworks

### Headlines (PAS Formula)

- **Problem**: "Tired of [pain point]?"
- **Agitation**: "Every day you [consequence of problem]"
- **Solution**: "[Product] helps you [benefit] in [timeframe]"

### Headlines (4U Formula)

- **Useful**: Clear benefit
- **Urgent**: Time-sensitive element
- **Unique**: What's different
- **Ultra-specific**: Concrete numbers/outcomes

### CTA Best Practices

- Use first person: "Start my free trial" > "Start your free trial"
- Action + Benefit: "Get instant access" > "Submit"
- Reduce friction: "No credit card required"
- Create urgency authentically: "Join 2,000+ teams"

### Feature → Benefit Translation

Transform specs into outcomes:

- ❌ "AI-powered analytics"
- ✅ "See insights in seconds, not hours"

- ❌ "256-bit encryption"
- ✅ "Your data is safer than Fort Knox"

## Technical Excellence

### Performance

- Lazy load below-fold images
- Preload hero fonts and critical CSS
- Use next/image or srcset for responsive images
- Minimize JavaScript for static sections

### SEO

- Semantic HTML structure (one H1, proper heading hierarchy)
- Meta description with value proposition
- Open Graph tags for social sharing
- Schema markup for rich snippets

### Accessibility

- Color contrast ratios (WCAG AA minimum)
- Focus states for all interactive elements
- Alt text for meaningful images
- Keyboard navigable

### Responsive Breakpoints

```css
/* Mobile first approach */
/* sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px */
```

## Anti-Patterns to Avoid

**Design**

- Generic stock photos (use illustrations or real product shots)
- More than 2 fonts
- Rainbow color schemes without strategy
- Tiny, low-contrast CTAs
- Auto-playing video with sound

**Copy**

- Jargon-heavy headlines
- Feature lists without benefits
- Vague claims without proof
- Multiple competing CTAs
- Wall of text without hierarchy

**UX**

- Forms with unnecessary fields
- Hidden pricing
- No mobile optimization
- Slow load times
- Broken scroll hijacking

## Output Checklist

Before delivering, verify:

- [ ] Single, clear conversion goal
- [ ] Headline communicates value in <3 seconds
- [ ] CTA visible above fold
- [ ] Social proof present
- [ ] Mobile responsive
- [ ] Fast loading (<3s)
- [ ] Accessible (contrast, focus states)
- [ ] Consistent brand voice throughout

## References

See `references/design-patterns.md` for component code snippets and visual patterns.
See `references/industry-templates.md` for SaaS, ecommerce, and service business templates.
