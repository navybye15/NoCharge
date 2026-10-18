# NoCharge: Full Build Prompt (Android, React Native + Expo)

Copy everything below into your coding AI in Antigravity.

---

You are my senior mobile developer and mentor. We are building an Android app called **NoCharge**. I am a beginner, so explain what you are doing in simple Taglish (Tagalog-English mix), keep code well commented, and keep things simple. Do not over-engineer.

## 0. BEFORE YOU WRITE ANY CODE
Check my computer using the terminal: Node.js (node -v, npm -v), Git (git --version), and Android Studio/Android SDK (tell me if adb is not found). I already have Android Studio and Git installed. Tell me what is missing and how to fix it. I am using Antigravity IDE and will test on my real Android phone. Do not assume anything works; verify.

## 1. WHAT THE APP IS
I love hunting free trials and promos (Spotify, Netflix, etc.), but I forget to cancel them before the free period ends, so my card gets charged. NoCharge stores all my trials and **reminds me before the charge date** so I can cancel in time.

**Core feature: reliable reminder notifications.** Everything else supports that.

**Hard rules about scope and safety:**
- The app does NOT cancel anything for the user. It only stores a link to the service's cancel/manage page and opens it with one tap.
- The app NEVER stores card numbers, passwords, or any payment credentials. The "payment method" is just a free-text label like "BPI card" or "GCash".
- No backend, no server, no login, no cloud for now. All data stays on the phone.
- No email reminders for now (notification only).
- Do not use real brand logos (Netflix, Spotify, etc.). Use a colored circle with the first letter of the service name.

## 2. TECH STACK
- React Native with Expo, TypeScript, expo-router for navigation
- expo-notifications for local scheduled notifications
- Local storage: AsyncStorage (or expo-sqlite if you think it is better, explain why). Put all storage code in ONE module so it can be swapped later.
- Linking API to open cancel-page URLs
- Android only. The app will be published to the Play Store later, so keep the project Play Store ready (proper package name, app icon, splash).
- If Expo Go cannot reliably test notifications, set up a **development build** (I have Android Studio) and tell me the exact steps.

## 3. DATA MODEL (Trial)
- id (unique)
- serviceName (required)
- startDate (optional)
- endDate (required): the date the free trial ends / the charge date
- priceAfterTrial (number, default currency PHP ₱)
- billingCycle: "monthly" | "yearly" | "one-time"
- cancelLink (optional URL, validate it)
- paymentLabel (optional text, NOT a card number)
- notes (optional)
- reminderOffsetsDays: array of numbers, default [3, 1, 0] (0 = on the day itself)
- status: "active" | "cancelled" | "kept"
- color (auto-assigned from a mint/green-friendly palette)
- createdAt

## 4. SCREENS AND FEATURES

### Bottom tab bar (4 tabs): Home, Trials, Calendar, Settings
Plus a **floating + button** (on Home and Trials) that opens the Add Trial screen.

### Home
- Large title and short subtitle (like "Home" / "Don't get charged by surprise").
- Big highlight card: **"₱X at risk in the next 7 days"** (sum of priceAfterTrial for active trials ending within 7 days), with a circular gauge or progress ring showing days until the nearest charge.
- "Ending soon" list: active trials sorted by nearest endDate, each with a countdown chip ("3 days left", "Tomorrow", "Today"). Chip turns red/orange when 1 day or less.
- "Estimated saved" counter: total priceAfterTrial of trials I marked as cancelled. Label it "estimated" because it is only an estimate.
- Friendly empty state when there are no trials.

### Trials
- Stack of colorful rounded cards, one per trial (similar to a wallet/accounts list): initial-letter circle, service name, end date, price, countdown chip.
- Filter tabs: **All / Ending soon / Cancelled**.
- Sorted by nearest deadline. Tap a card to open the Detail screen.
- Swipe or long-press to delete (with confirmation).

### Add / Edit Trial (form)
- Service name, start date, end date (date picker), or "trial length" shortcut (7 days, 14 days, 30 days, 3 months, 6 months, 1 year, custom) that auto-computes the end date from the start date.
- Price after trial, billing cycle, cancel link, payment label, notes.
- Reminder options: checkboxes for 7 days, 3 days, 1 day, on the day.
- Validation: name and end date required, link must be a valid URL, end date should not be in the past (warn me, but allow it).
- Saving schedules the notifications immediately. Editing reschedules them.

### Trial Detail
- Big countdown ("12 days left"), service name, price, billing cycle, payment label, notes, dates.
- Big primary button: **"Open cancel page"** (opens cancelLink in the browser; if no link, show a hint to add one).
- Two buttons: **"Cancelled na"** (sets status cancelled and cancels its scheduled notifications) and **"Itutuloy ko"** (sets status kept and cancels its notifications).
- Edit and Delete options. Deleting also cancels its notifications.

### Calendar
- Monthly calendar with dots on days where a trial ends or a charge happens.
- Tap a day to see the trials ending that day. Useful for trials that are 3 to 12 months long.

### Settings
- Default reminder time of day (default 9:00 AM) and default reminder offsets.
- Notification permission status with a button to open Android settings if denied.
- Exact alarm / battery optimization help: a short explanation for phones that kill background apps (Xiaomi, Oppo, Realme, Samsung) and how to allow NoCharge.
- Default currency (PHP ₱ for now).
- "About" and a placeholder for Privacy Policy.

## 5. NOTIFICATION REQUIREMENTS (most important)
- Notification text example: "NoCharge: Netflix trial ends tomorrow. ₱549 will be charged." Wording adapts to 3 days / 1 day / today.
- Tapping a notification opens that trial's Detail screen (where the Open cancel page button is).
- Android 13+ POST_NOTIFICATIONS permission: request it at a sensible moment with a short explanation first.
- Create a proper notification channel.
- Handle exact-time scheduling and tell me honestly if any special permission is needed, and how to handle it.
- Reminders must arrive even when the app is fully closed.
- Reminders must survive a phone restart. Verify how expo-notifications behaves here; if scheduled notifications are lost after reboot, reschedule all active trials' reminders on app launch and tell me the limitation honestly.
- Never schedule reminders in the past. Skip them.
- Use my timezone (Asia/Manila) via the device's local time; be careful with date-only values so reminders do not shift by one day.
- Cancel/reschedule notifications whenever a trial is edited, deleted, cancelled, or kept. No duplicates, no orphan notifications.

## 6. DESIGN DIRECTION
- Light mint-green theme: soft mint gradient background, white rounded cards, one main green accent color.
- Large bold numbers, large page titles with a small subtitle, plenty of spacing.
- Bottom tab bar with icons, floating + button in green.
- Clean, modern, calm. Inspired by modern finance apps, but do NOT copy any specific app's exact layout, name, or assets. Make it original.
- Keep a central theme file (colors, spacing, radius, font sizes) so the design is easy to change later. Dark mode can come later.

## 7. HOW WE WORK: PHASES WITH CHECKPOINTS
You decide the details, but follow this order. **After each phase, STOP, tell me exactly how to run and test it on my phone, list what I should see, and wait for me to say "next" before continuing.**

- **Phase 0:** Environment check (section 0).
- **Phase 1:** Project setup + notification proof of concept: one test screen with a button that schedules a notification 1 minute later, works when the app is closed, tapping it opens a screen. Confirm it works on my real phone.
- **Phase 2:** Theme, navigation (4 tabs), data model, storage module, Add Trial form, Trials list.
- **Phase 3:** Real reminder scheduling tied to trials, Trial Detail screen, Open cancel page, Cancelled/Kept actions, edit/delete.
- **Phase 4:** Home screen (at-risk card, ending soon, estimated saved), Calendar, Settings.
- **Phase 5:** Polish and edge cases: empty states, validation, reboot rescheduling, past dates, many trials, battery optimization guidance, app icon and splash.
- **Phase 6:** Play Store readiness: package name, versioning, build an Android App Bundle (AAB) with EAS or locally, a simple privacy policy text (the app stores data only on the device), and a checklist of Play Console requirements. Tell me honestly which Play Store rules I must verify myself in the official Google Play Console help, because policies change.

## 8. RULES FOR YOU
- Don't add features I didn't ask for. If you have a good idea, suggest it and wait for my answer.
- Keep each change small and explain what changed and why in simple terms.
- When there's an error, explain what it means in simple language before fixing it, and fix the smallest thing first.
- Don't claim something works unless we tested it. If you are unsure whether an Expo or Android behavior works a certain way, say so and tell me how to verify it.
- Use Git: initialize a repo, and make a commit at the end of each phase with a clear message.
- Do not put secrets or personal data in the code.

## 9. OUT OF SCOPE FOR NOW (do NOT build)
Email reminders, login/accounts, cloud sync, auto-detecting trials from email, analytics/charts, real brand logos, bank/card connections, sharing with other users, dark mode, iOS.

Start with Phase 0 now.
