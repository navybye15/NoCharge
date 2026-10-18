# DESIGN.md — NoCharge

## 1. Product and user
- Product: NoCharge is an Android app that stores a user's free trials and promos, saves a link to each service's cancel/manage page, and sends reminder notifications before the free period ends and the card gets charged.
- Primary user: a Filipino smartphone user (student or young adult) who signs up for many free trials to save money and forgets to cancel before the charge date.
- Primary task: add a trial in under 30 seconds, get reminded in time, and reach the cancel page in one tap.
- Platforms: Android phones only (portrait), built with React Native + Expo. No tablet or iOS layouts for now.
- Tone: friendly, calm, trustworthy, energetic — not alarming, not clinical, not boring.
- Copy language: English with light Filipino touches in friendly microcopy (empty states, confirmations). Keep it short and specific.

## 2. Design principles
1. Reminders first: the countdown and the "Open cancel page" action matter more than anything decorative.
2. One primary action per screen.
3. Calm urgency: show time pressure with clear text and warm yellow, not constant red.
4. Use real user data (their trials, dates, prices), never fake numbers.
5. Reuse existing components before creating new ones.
6. Accessibility is non-negotiable.

## 3. Color tokens
Brand palette (from the reference): green `#32CF7A`, yellow `#FFEB1A`, deep navy `#091B27`, light gray `#D9D9D9`, white `#FFFFFF`.

### Light mode
- `--bg`: #F2FAF5 — page background (base under the gradient)
- `--bg-gradient-start`: #D9F5E5 — top of page gradient
- `--bg-gradient-end`: #F7FBF8 — bottom of page gradient
- `--surface`: #FFFFFF — cards and panels
- `--surface-2`: #F1F5F3 — inputs, secondary panels
- `--border`: #D9D9D9 — borders and dividers
- `--text`: #091B27 — primary text
- `--text-muted`: #4F625C — secondary text
- `--primary`: #32CF7A — primary button fill, active states, ring fill
- `--on-primary`: #091B27 — text and icons on primary fill
- `--primary-strong`: #0F7A3F — green used as TEXT or icons on light surfaces
- `--accent`: #FFEB1A — warning/"ending soon" fill and selected calendar dates
- `--on-accent`: #091B27 — text and icons on accent fill
- `--danger`: #D92D20 — errors, destructive actions, "charged today" state

### Dark mode
- `--bg`: #091B27 — page background (base under the gradient)
- `--bg-gradient-start`: #0B3B2A — top of page gradient (deep green)
- `--bg-gradient-end`: #091B27 — bottom of page gradient
- `--surface`: #13262E — cards and panels
- `--surface-2`: #1B323B — inputs, secondary panels
- `--border`: #24383F — borders and dividers
- `--text`: #FFFFFF — primary text
- `--text-muted`: #A9B8B3 — secondary text
- `--primary`: #32CF7A — same as light
- `--on-primary`: #091B27
- `--primary-strong`: #32CF7A — in dark mode green text may use the primary color
- `--accent`: #FFEB1A
- `--on-accent`: #091B27
- `--danger`: #FF6B5E — errors and destructive actions on dark surfaces

### Shared tokens
- `--hero-start`: #4EE08F and `--hero-end`: #1DB86A — gradient for the Home highlight card only
- `--svc-1` #32CF7A, `--svc-2` #2BB8C7, `--svc-3` #FFEB1A, `--svc-4` #FF9F43, `--svc-5` #4C8DFF, `--svc-6` #F472B6 — colors assigned automatically to each trial's initial-letter circle and card accent. Text on these always uses `--on-primary` (dark).

Rules:
- Use tokens only; do not invent colors. Keep all tokens in one central theme file.
- Support both light and dark mode. Follow the phone's system setting by default, with a manual override (System / Light / Dark) in Settings.
- Never put white text on `--primary` or `--accent`; use `--on-primary` / `--on-accent`.
- Never use `--primary` or `--accent` as text color on light surfaces (low contrast). Use `--primary-strong` for green text on light mode. Yellow is a fill only.
- Maintain WCAG AA contrast (4.5:1 text, 3:1 large text and icons). Verify with a contrast checker, do not assume.
- Gradients are allowed ONLY for the page background and the Home highlight card. No gradient text, no gradient buttons.
- Use one accent color per screen area; yellow means "needs attention soon", green means "go / safe / done".

## 4. Typography
- Display: Manrope, weights 700 and 800 (big numbers, titles)
- Body: Manrope, weights 400, 500 and 600
- Mono: not used

Load Manrope through `@expo-google-fonts/manrope`.

Scale (dp / line height, weight):
- Display number: 40/48, 800 (the "₱ at risk" figure, countdowns)
- H1: 28/36, 700 (screen titles)
- H2: 22/30, 700 (section titles)
- H3: 18/26, 600 (card titles)
- Body: 16/24, 500 (regular text)
- Small: 14/20, 400 (secondary text)
- Caption: 12/16, 500 (chips, labels)

Rules:
- Maximum one typeface (Manrope), varied by weight.
- Bold for headings and key numbers, lighter weight for secondary text, to create hierarchy.
- No all-caps body text. Small all-caps section labels (Caption) are allowed.
- Text must scale with the Android system font size without clipping, up to 200%.
- No gradient, outline, or animated text. Number count-up animations are allowed (see Motion).

## 5. Spacing and layout
- Base unit: 4dp.
- Allowed spacing: 4, 8, 12, 16, 24, 32, 48, 64.
- Screen horizontal padding: 16dp.
- Single column, portrait. Test at 360dp and 412dp widths.
- Respect safe areas (status bar, gesture/navigation bar).
- Bottom tab bar: rounded bar, 64dp tall, with 4 tabs and a big center button between them. Order: Home, Trials, [center + button], Calendar, Settings. The active tab is shown as a `--primary` tint pill behind its icon and label.
- Center Add button (replaces any floating bottom-right + button; there is only ONE add entry point): circle, 68dp, `--primary` fill, `--on-primary` plus icon (28dp), centered horizontally in the tab bar and raised so it overlaps the top edge of the bar by about 24dp. Surround it with a 4dp ring in `--surface` color and a soft `--primary` glow (low opacity). It appears on every main tab. Tapping it opens the Add Trial screen. Accessibility label: "Add trial".
- Scroll content on every main screen needs bottom padding equal to the tab bar height plus the button overhang, so nothing hides behind the bar.

Rules:
- No arbitrary pixel values.
- Each screen: large H1 title with a small muted subtitle, then one hero element, then supporting content.
- Do not center everything; align content left, center only hero numbers and empty states.

## 6. Components
- Buttons: 16dp radius, 52dp height, 24dp horizontal padding. One primary (filled `--primary`) button per screen. Secondary = outlined with `--border`. Destructive = `--danger` text/outline.
- Cards: 20dp radius, 1px `--border`, `--surface` fill. Light mode may use a soft shadow (low opacity, large blur). Dark mode uses border and slightly lighter surface instead of shadow.
- Trial card (wallet-card look, same component used on Home and Trials): about 16:10 aspect ratio, 20dp radius, filled with the trial's `--svc-*` color (subtle lighter overlay shape for depth, no gradient text), dark `--on-primary` text. Contents: initial-letter circle and service name (H3) at top left, countdown chip at top right, big countdown or price (Display or H2) in the middle, end date, billing cycle and payment label (for example "BPI card", text only, never digits) along the bottom. Cancelled trials show muted with a check chip. Tapping the card opens the Trial Detail screen.
- Home trial carousel ("My Trials" section): horizontally swipeable row of Trial cards with snap scrolling. Each card is about 85% of screen width so the next card peeks in from the right. Page indicator dots below (active dot uses `--primary`). Shows active trials only, sorted by nearest end date, maximum 8, with a final "View all" card that opens the Trials tab. The section header has a "View All" link on the right that does the same.
- Trials tab list: the SAME Trial card, but in a full-width vertical list that scrolls up and down. Cards are NOT horizontally swipeable here. Filter tabs on top: All / Ending soon / Cancelled. Delete is done from the Trial Detail screen or with long-press, not with a swipe gesture.
- Countdown chip (always text, never color alone):
  - 8+ days: neutral, e.g. "12 days left"
  - 2–7 days: `--accent` fill with dark text, e.g. "3 days left"
  - Tomorrow: `--accent` fill with a clock icon, "Tomorrow"
  - Today / overdue: `--danger` fill with white text, "Today" / "Overdue"
  - Cancelled: `--primary` tint with a check icon, "Cancelled"
- Progress ring (Home): 10dp stroke, track in `--surface-2`, fill `--primary`; switches to `--accent` when 3 days or fewer, `--danger` when today.
- Inputs: 14dp radius, 52dp height, visible label above, inline validation message below, `--surface-2` fill.
- Chips and filter tabs: fully rounded, 40dp height, selected state uses `--primary` fill with `--on-primary` text.
- Dates in pickers: selected date uses `--accent` fill.
- Empty states: explain what is missing, why it matters, and the next action (one button). Friendly tone, for example "Wala ka pang trial. Add one so we can watch the date for you."
- Bottom sheets and dialogs: 24dp top radius, confirm before delete.
- Translucent "glass" is allowed ONLY on small pills over the gradient background (top bar buttons). Not on content cards.

Rules:
- Put shared components in `/components` and reuse them. Do not create a new component unless no existing one fits.
- Every interactive element needs pressed, focused, disabled, loading and error states where applicable.
- Show a loading state while storage or notification scheduling is in progress.

## 7. Imagery and icons
- Icons: `@expo/vector-icons` (Ionicons outline), 24dp (20dp inside chips), one consistent stroke style.
- Service identity: colored circle with the first letter of the service name. No real brand logos (Netflix, Spotify, etc.).
- App logo: bell + shield symbol, mint-green gradient on a dark rounded square (separate asset, not built in code).
- Optional mascot (tarsier) for empty states and celebration moments only, added after the core app works. Must be an original illustration.
- Do not use stock photos of people, avatars, 3D product renders, or abstract gradient blobs.
- Do not copy any other app's exact layout, name, icons, or illustrations. Use the reference apps for style direction only.
- Every image needs an accessibility label; decorative images are hidden from screen readers.

## 8. Motion
- Durations: 150ms for press feedback, 250ms for sheets and tab changes, 400ms maximum for screen transitions and number count-up.
- Easing: ease-out.
- Respect the system "remove animations" setting: skip count-ups and ring animation, show final values immediately.
- No looping or ambient background animations.
- Light haptic feedback on "Cancelled" confirmation is allowed.

## 9. Accessibility
- WCAG 2.2 AA minimum.
- Minimum touch target: 48 × 48dp.
- Full TalkBack support: every control has a label, role and state. Trial cards read as one sentence, for example "Netflix, 3 days left, 549 pesos will be charged."
- Do not rely on color alone for status; always pair with text or an icon.
- Visible focus indicator for keyboard and switch-access navigation.
- Support font scaling to 200% and display size changes without overlapping or clipped text.
- Notifications must have clear, plain text and work without the user opening the app first.

## 10. Explicit bans
Do not use:
- Gradient headline text, gradient buttons, or purple-to-blue gradient backgrounds.
- Glass/translucent effect on content cards.
- Real brand logos or any trademarked artwork.
- Red as the default for everything urgent; reserve `--danger` for errors, destructive actions, and "today/overdue".
- Fake urgency copy, guilt-tripping, or dark patterns.
- Placeholder metrics, fake testimonials, or leftover sample data in release builds.
- Any field for card numbers, CVV, passwords, or bank credentials. Payment method is a free-text label only.
- Buzzwords in copy: seamless, revolutionary, cutting-edge, supercharge, unlock.
- Presenting the "saved" amount as exact; always label it "estimated".

## 11. Definition of done
Before returning output for any screen or feature, confirm:
- [ ] All colors use design tokens, in both light and dark mode.
- [ ] All spacing uses the approved scale.
- [ ] One primary action per screen.
- [ ] Touch targets are at least 48dp and TalkBack reads each element sensibly.
- [ ] Layout works at 360dp and 412dp widths and with large font size.
- [ ] No banned patterns are present.
- [ ] Contrast checked, especially `--primary` and `--accent` usage.
- [ ] Copy is short, specific, and uses no placeholder content.
- [ ] Existing components in `/components` were reused where possible.
- [ ] Tested on a real Android phone, not only an emulator.

## 12. Pre-delivery checklist (adapted for React Native / Android)
Before delivering UI code, verify the items below. Web-only items (hover, cursor-pointer, Tailwind classes, 1440px breakpoints) do not apply to a native Android app and are replaced by their mobile equivalents.

Visual quality
- [ ] No emojis used as icons. Use vector icons only.
- [ ] All icons come from one consistent set (Ionicons via `@expo/vector-icons`).
- [ ] No real brand logos. Service identity is the initial-letter circle.
- [ ] Pressed states do not cause layout shift (no size or margin change on press; use opacity or background change).
- [ ] Theme colors are read directly from the central theme object (for example `theme.colors.primary`), with no scattered hard-coded hex values.

Interaction
- [ ] Every tappable element gives clear pressed feedback (ripple or opacity change).
- [ ] Transitions are smooth, 150 to 300ms (400ms max for screen transitions).
- [ ] Focus is visible for switch-access and keyboard navigation.
- [ ] The carousel on Home snaps cleanly and does not fight vertical scrolling.

Light and dark mode
- [ ] Light mode text has at least 4.5:1 contrast.
- [ ] Translucent (glass) elements are still visible in light mode.
- [ ] Borders are visible in both modes.
- [ ] Both modes were tested on screen before delivery.

Layout
- [ ] Floating elements (center Add button, tab bar) have proper spacing from screen edges and respect the gesture/navigation bar inset.
- [ ] No content is hidden behind the tab bar or the center button.
- [ ] Works at 360dp and 412dp widths and with large font size.
- [ ] No unintended horizontal scroll (the Home carousel is the only intentional one).

Accessibility
- [ ] Every image and icon-only button has an accessibility label.
- [ ] Every form input has a visible label.
- [ ] Color is never the only indicator of status.
