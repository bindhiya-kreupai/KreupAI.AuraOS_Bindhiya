# Design Patterns Reference

Code snippets and patterns for landing page components.

## Hero Sections

### Centered Hero with Gradient Background

```jsx
<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
  {/* Gradient Background */}
  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />

  {/* Content */}
  <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
    <span className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur text-sm text-purple-300 mb-6">
      🚀 Now in Public Beta
    </span>
    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
      Build faster with
      <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {' '}
        AI-powered{' '}
      </span>
      workflows
    </h1>
    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
      Ship products 10x faster. No complex setup. Just results.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button className="px-8 py-4 bg-white text-slate-900 rounded-full font-semibold hover:scale-105 transition-transform">
        Start Free Trial
      </button>
      <button className="px-8 py-4 border border-white/20 text-white rounded-full font-semibold hover:bg-white/10 transition-colors">
        Watch Demo
      </button>
    </div>
  </div>

  {/* Scroll Indicator */}
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
    <ChevronDown className="w-6 h-6 text-white/50" />
  </div>
</section>
```

### Split Hero with Product Screenshot

```jsx
<section className="min-h-screen grid lg:grid-cols-2 gap-12 items-center px-6 lg:px-20 py-20">
  {/* Left: Copy */}
  <div className="max-w-xl">
    <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-4">
      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
      Used by 10,000+ teams
    </div>
    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
      The only tool your team needs
    </h1>
    <p className="text-lg text-slate-600 mb-8">
      Replace 5 tools with one. Manage projects, track time, and collaborate—all in one place.
    </p>
    <form className="flex gap-3">
      <input
        type="email"
        placeholder="Enter your email"
        className="flex-1 px-5 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <button className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors whitespace-nowrap">
        Get Started Free
      </button>
    </form>
    <p className="text-sm text-slate-500 mt-3">No credit card required</p>
  </div>

  {/* Right: Product Image */}
  <div className="relative">
    <div className="absolute -inset-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-3xl -rotate-2" />
    <img
      src="/dashboard.png"
      alt="Product dashboard"
      className="relative rounded-2xl shadow-2xl border border-slate-200"
    />
  </div>
</section>
```

## Social Proof Patterns

### Logo Strip

```jsx
<section className="py-12 border-y border-slate-100">
  <div className="max-w-6xl mx-auto px-6">
    <p className="text-center text-sm text-slate-500 mb-8">Trusted by industry leaders</p>
    <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale">
      {logos.map((logo) => (
        <img key={logo.name} src={logo.src} alt={logo.name} className="h-8" />
      ))}
    </div>
  </div>
</section>
```

### Metrics Bar

```jsx
<section className="py-16 bg-slate-900 text-white">
  <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-center">
    {[
      { value: '10M+', label: 'Active Users' },
      { value: '99.9%', label: 'Uptime SLA' },
      { value: '150+', label: 'Countries' },
      { value: '4.9★', label: 'App Store Rating' },
    ].map((stat) => (
      <div key={stat.label}>
        <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
        <div className="text-slate-400">{stat.label}</div>
      </div>
    ))}
  </div>
</section>
```

## Feature Sections

### Bento Grid Features

```jsx
<section className="py-24 px-6">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Everything you need</h2>
    <div className="grid md:grid-cols-3 gap-6">
      {/* Large Feature */}
      <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
        <h3 className="text-2xl font-bold mb-4">AI-Powered Analytics</h3>
        <p className="text-violet-100 mb-6">Get insights automatically surfaced to you.</p>
        <img src="/analytics.png" alt="" className="rounded-xl" />
      </div>

      {/* Stacked Features */}
      <div className="space-y-6">
        <div className="p-8 rounded-3xl bg-slate-100">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
          <p className="text-slate-600">Sub-100ms response times globally.</p>
        </div>
        <div className="p-8 rounded-3xl bg-slate-100">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
          <p className="text-slate-600">SOC 2 Type II certified.</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Feature List with Icons

```jsx
<section className="py-24 px-6 bg-slate-50">
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Why teams love us</h2>
      <p className="text-xl text-slate-600 max-w-2xl mx-auto">
        Everything you need to ship faster and work smarter.
      </p>
    </div>
    <div className="grid md:grid-cols-3 gap-12">
      {features.map((feature) => (
        <div key={feature.title} className="text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6">
            <feature.icon className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
          <p className="text-slate-600">{feature.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

## Testimonials

### Card Grid

```jsx
<section className="py-24 px-6">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Loved by thousands</h2>
    <div className="grid md:grid-cols-3 gap-6">
      {testimonials.map((t, i) => (
        <div
          key={i}
          className="p-8 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-shadow"
        >
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-slate-700 mb-6">"{t.quote}"</p>
          <div className="flex items-center gap-4">
            <img src={t.avatar} alt="" className="w-12 h-12 rounded-full" />
            <div>
              <div className="font-semibold">{t.name}</div>
              <div className="text-sm text-slate-500">{t.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

## Pricing Tables

### Three-Tier with Highlight

```jsx
<section className="py-24 px-6 bg-slate-50">
  <div className="max-w-5xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
      <p className="text-xl text-slate-600">No hidden fees. Cancel anytime.</p>
    </div>
    <div className="grid md:grid-cols-3 gap-8">
      {/* Starter */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200">
        <h3 className="text-xl font-semibold mb-2">Starter</h3>
        <div className="text-4xl font-bold mb-6">
          $9<span className="text-lg text-slate-500 font-normal">/mo</span>
        </div>
        <ul className="space-y-3 mb-8">{/* Features */}</ul>
        <button className="w-full py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50">
          Get Started
        </button>
      </div>

      {/* Pro - Highlighted */}
      <div className="p-8 rounded-2xl bg-slate-900 text-white relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-medium">
          Most Popular
        </div>
        <h3 className="text-xl font-semibold mb-2">Pro</h3>
        <div className="text-4xl font-bold mb-6">
          $29<span className="text-lg text-slate-400 font-normal">/mo</span>
        </div>
        <ul className="space-y-3 mb-8">{/* Features */}</ul>
        <button className="w-full py-3 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100">
          Start Free Trial
        </button>
      </div>

      {/* Enterprise */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200">
        <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
        <div className="text-4xl font-bold mb-6">Custom</div>
        <ul className="space-y-3 mb-8">{/* Features */}</ul>
        <button className="w-full py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50">
          Contact Sales
        </button>
      </div>
    </div>
  </div>
</section>
```

## CTAs

### Final CTA with Background

```jsx
<section className="py-24 px-6">
  <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 md:p-20 relative overflow-hidden">
    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
    <div className="relative">
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to get started?</h2>
      <p className="text-xl text-indigo-100 mb-10 max-w-xl mx-auto">
        Join 10,000+ teams already building faster.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold hover:scale-105 transition-transform">
          Start Free Trial
        </button>
        <button className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10">
          Schedule Demo
        </button>
      </div>
      <p className="text-indigo-200 text-sm mt-6">No credit card required • 14-day free trial</p>
    </div>
  </div>
</section>
```

## Animation Utilities

### Scroll-triggered Fade In (Framer Motion)

```jsx
const FadeInWhenVisible = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};
```

### Staggered Children

```jsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

<motion.div variants={container} initial="hidden" animate="show">
  {items.map((i) => (
    <motion.div key={i} variants={item} />
  ))}
</motion.div>;
```

### Magnetic Button Effect

```jsx
const MagneticButton = ({ children }) => {
  const ref = useRef(null);

  const handleMouse = (e) => {
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) * 0.3;
    const y = (e.clientY - top - height / 2) * 0.3;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const reset = () => {
    ref.current.style.transform = 'translate(0, 0)';
  };

  return (
    <button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      className="transition-transform duration-200"
    >
      {children}
    </button>
  );
};
```

## CSS Utilities

### Gradient Text

```css
.gradient-text {
  background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Glass Card

```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
}
```

### Noise Texture Overlay

```css
.noise-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.05;
  pointer-events: none;
}
```
