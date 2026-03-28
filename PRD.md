# Product Requirements Document (PRD): Manna

**Version:** 1.1  
**Status:** Draft  
**Product Vision:** A private, reverent digital sanctuary for scriptural reflection.

---

## 1. Executive Summary

**Manna** is a minimal, high-privacy mobile application designed for Christians to process their thoughts and struggles. By utilizing AI to infer context from natural language, the app provides a single, high-quality **NIV Bible verse** accompanied by a gentle, soft explanation and a closing prayer prompt.

---

## 2. Core Principles

- **Reverence over Interaction:** The app should feel like a "digital prayer closet," not a chatbot.
- **Privacy First:** User "heart pours" are sacred and must be treated with the highest level of data security.
- **Focus over Volume:** Deliver one powerful word rather than a list of options.

---

## 3. Functional Requirements

### 3.1 Input Experience (The "Pouring" — name subject to change)

- **Clean Text Entry:** A distraction-free, full-screen text area for users to type thoughts freely.
- **Voice-to-Text:** An integrated microphone toggle for users to speak their heart aloud instead of typing.
- **Silent Context Inference:** The system automatically analyzes input to identify underlying themes (e.g., anxiety, grief, finances) without requiring user tags.

### 3.2 Scriptural Output & Content

- **Single-Verse Focus:** The app returns **one** highly relevant NIV verse to encourage deep meditation.
- **Soft Commentary:** A 3–5 sentence empathetic explanation focusing purely on the scripture’s meaning.
- **Guided Prayer:** Every session concludes with a one-sentence prayer based on the selected verse.

### 3.3 Dialogue & History

- **Follow-up Capability:** Users can ask clarifying questions about the verse or its practical application.
- **Persistent Journey:** An encrypted history of "Pourings" and verses received, allowing users to track their spiritual growth.

---

## 4. User Experience (UX) & Design

- **Minimalism:** Clean typography, maximum whitespace, and zero "social media" features.
- **User-Selected Themes:**
  - **Light/Morning:** Soft whites, creams, and airy pastels.
  - **Dark/Sanctuary:** Deep charcoals, midnight blues, and warm amber accents.
- **User-Initiated Only:** **Zero push notifications.** The app is a destination, not a distraction.

---

## 5. Technical Requirements

- **AI Engine:** Claude 4.5 (or Haiku for cost-efficiency) with **Prompt Caching** enabled to minimize token costs.
- **Bible API:** Integration with the **YouVersion Platform API** for NIV access.
- **Security:** AES-256 encryption for all user entries stored in **Supabase**.

---

## 6. Monetization Strategy: "The Sanctuary Model"

### 6.1 Version 1: Absolute Sanctuary

- **100% Ad-Free:** The initial launch will contain zero advertisements to build brand trust and sacredness.
- **Community Support:** A small "Tip Jar" or "Support Manna" button in settings to allow users to voluntarily offset the ~$38/month operating costs.

### 6.2 Version 2: Value-Aligned Sponsorships

As the app scales (targeting 5,000+ users), Manna will transition to a sponsorship model rather than traditional "banner" ads.

- **The "Anchor" Partner:** Seek direct partnerships with faith-based organizations (e.g., Salem Web Network, Bible publishers, or non-profits).
- **Native Integration Only:** Sponsored content must be **Native Units**—meaning they use the app’s specific fonts, colors, and themes to avoid visual clutter.
- **Strategic Placement:** Sponsors may only appear in "non-sacred" zones:
  - At the bottom of the **History** tab.
  - In a small "Message of Hope" card _after_ the final prayer of a session has been read.
- **Privacy Guardrail:** Advertisers never receive "Pouring" text. Targeting is based only on the **App Category** (Christian/Spirituality), not personal user data.

---

## 7. Future Considerations (v3.0)

- **Audio Reflection:** Option to have the verse and prayer read aloud.
- **Offline Mode:** Access to the last 10 entries without an internet connection.
