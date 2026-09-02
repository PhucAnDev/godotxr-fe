# GodotXR Project Design Specification (Impeccable Standard)

This document defines the visual identity, typography, spatial layout, and UX laws for the GodotXR Frontend application, enforcing the **Impeccable Design System**.

---

## 🎨 Visual Identity & Brand System

- **Primary Brand Accent:** `#20D0D4` (Teal/Cyan) - Used for active states, key interactive buttons, and primary chart highlights.
- **Secondary Accent:** `#4EACAF` (Deep Teal) / `#FF8E8E` (Coral Red for score stats).
- **Neutral Palette:** Tailwind `Slate` series (`#F8FAFC`, `#F1F5F9`, `#E2E8F0`, `#94A3B8`, `#475569`, `#1E293B`).
- **Surface Elevation:** Subtle cards with `bg-white`, `border border-slate-100`, and soft elevation (`shadow-xs` / `shadow-sm` / `shadow-2xs`).

---

## 📐 Layout & Spatial Rules

1. **Strict Layout Stability:** Interactive toolbars, tabs, and filters MUST be housed in fixed or 2-tier spatial containers (`min-h-[42px]`, `w-52`) to prevent any jittering, layout shifts, or wrapping bugs when toggling options.
2. **Consistent Spacing Scale:** All component gaps and paddings follow a 4px/8px grid system (`p-3`, `p-4`, `p-6`, `gap-2`, `gap-3`, `gap-4`).
3. **Card Hierarchy:** No excessive nested cards. High-level containers use `border-slate-100` dividers and clean background contrast (`bg-slate-50/80`).

---

## ⚡ Typography & Interaction

- **Font Family:** Modern Sans-Serif system stack (`Inter`, `Plus Jakarta Sans`, system-ui).
- **Text Legibility:** WCAG AA compliant contrast ratios. Dark slate headings (`#1E293B`) and slate body text (`#475569`).
- **Interactive Feedback:** All clickable elements must feature explicit hover and active states (`transition-all duration-150`, `hover:bg-slate-100`, `active:scale-98`).
