# 🧩 Autism Learning Platform

> A calm, data-driven, sensory-friendly local web platform designed to support early cognitive, linguistic, spatial, and daily routine learning for a 5-year-old child on the autism spectrum.

---

## 📖 Table of Contents

1. [Motivation & Pedagogical Philosophy](#1-motivation--pedagogical-philosophy)
2. [Sensory & Autism-Friendly Accommodations](#2-sensory--autism-friendly-accommodations)
3. [Mouse-Free Accessible Input & Controller Architecture](#3-mouse-free-accessible-input--controller-architecture)
   - [Why Eliminate the Mouse?](#why-eliminate-the-mouse)
   - [Visual Size Profiles (Pedagogical Stimulus Fading)](#visual-size-profiles-pedagogical-stimulus-fading)
   - [The 4-Button + Enter + Escape Interaction Paradigm](#the-4-button--enter--escape-interaction-paradigm)
   - [Supported Interaction Models](#supported-interaction-models)
   - [Customizable Keycap Overlays & Controller HUD](#customizable-keycap-overlays--controller-hud)
   - [Hardware Feasibility: Buy vs. Build](#hardware-feasibility-buy-vs-build)
4. [Detailed Activity Catalog](#4-detailed-activity-catalog)
   - [Activity 1: 🔍 Receptive Identification ("Find & Match")](#activity-1--receptive-identification-find--match)
   - [Activity 2: 🧭 Spatial Concepts & Prepositions](#activity-2--spatial-concepts--prepositions)
   - [Activity 3: 🎨 Colors & Visual Discrimination](#activity-3--colors--visual-discrimination)
   - [Activity 4: ☀️ Time Phases & Calendar Understanding](#activity-4--time-phases--calendar-understanding)
   - [Activity 5: 🧩 Pattern Completion ("Complete a Suite")](#activity-5--pattern-completion-complete-a-suite)
   - [Activity 6: 🔤 Spell the Word (Letter Selection)](#activity-6--spell-the-word-letter-selection)
   - [Activity 7: 🦷 Routine Steps & Task Analysis](#activity-7--routine-steps--task-analysis)
   - [Activity 8: 🔢 Counting & Basic Visual Math](#activity-8--counting--basic-visual-math)
   - [Activity 9: 🔤 Letter Inset Puzzle ("Puzzle d'encastrement")](#activity-9--letter-inset-puzzle-puzzle-dencastrement)
5. [User Feedback, Session Tracking & Child Progress Monitoring](#5-user-feedback-session-tracking--child-progress-monitoring)
   - [Lightweight User Identification (Nickname & Device/IP)](#lightweight-user-identification-nickname--deviceip)
   - [In-Activity Child & Parent Feedback Mechanism](#in-activity-child--parent-feedback-mechanism)
   - [Session Statistics & Calibrated Response Latency](#session-statistics--calibrated-response-latency)
   - [Parent Dashboard & Progress Monitoring (`/parent.html`)](#parent-dashboard--progress-monitoring-parenthtml)
   - [Adaptive Activity Selection & Progressive Difficulty](#adaptive-activity-selection--progressive-difficulty)
6. [Technical Architecture](#6-technical-architecture)
7. [Project Structure](#7-project-structure)
8. [Data-Driven Design (How to Add Custom Content & Photos)](#8-data-driven-design-how-to-add-custom-content--photos)
9. [Running the Platform Locally & on Tablets](#9-running-the-platform-locally--on-tablets)
10. [Automated Testing](#10-automated-testing)
11. [Iterative Testing Milestones with the Child](#11-iterative-testing-milestones-with-the-child)
12. [Future Roadmap & Backlog](#12-future-roadmap--backlog)

---

## 1. Motivation & Pedagogical Philosophy

Commercial educational apps are often poorly adapted for young autistic children:
- **Overstimulating:** Too many bright flashes, loud cartoon buzzers, spinning popups, and intrusive reward animations that lead to sensory overload and meltdowns.
- **Punitive Error Feedback:** Harsh red "X" icons and buzzing error alarms create task-avoidance, anxiety, and frustration.
- **Rigid & Abstract:** Stock cartoon drawings often fail to bridge to the real world. Autistic learners often need to see their *actual* toothbrush, their *actual* shoes, or their *actual* classroom to generalize understanding.
- **Distracting & Commercialized:** External ads, locked paywalls, in-app purchases, and internet dependencies break the child's focus.

### The Purpose of This Platform
This platform was built to provide a **safe, predictable, local, distraction-free environment** tailored for a 5-year-old child with autism. It acts as an interactive digital companion to early ABA therapy, Speech & Language Therapy (SLT), and Occupational Therapy (OT), while remaining 100% extensible by parents and therapists.

---

## 2. Sensory & Autism-Friendly Accommodations

| Feature | Design Implementation | Benefit for the Child |
| :--- | :--- | :--- |
| **Soft Pastel Palette** | Grayish-blue (`#F7F9FC`), mint teal, warm peach, soft lavender. | Minimizes optical fatigue and avoids sensory over-arousal. |
| **Non-Punitive Feedback** | Gentle card wobble with soft woodblock tone (`260Hz → 180Hz`). No red marks or buzzers. | Promotes errorless learning, curiosity, and reduces frustration. |
| **Harmonic Reward Tones** | Soft C-E-G major chord using Web Audio API sine waves (no clicks, no harsh spikes). | Soothing, predictable auditory reward without sudden sound bursts. |
| **Discrete Trial Training (DTT)** | Selectable choice count: **2 choices** (target + 1 distractor), **3 choices**, or **4 choices**. | Allows starting at the simplest baseline and fading prompts as mastery grows. |
| **Full Bilingual Support** | Instant toggle between 🇬🇧 **English** and 🇫🇷 **French** across text, prompts, and TTS. | Supports dual-language households and therapy environments seamlessly. |
| **Native Text-to-Speech (TTS)** | Calibrated speech rate (0.9x cadence, friendly pitch) using native browser speech engines. | Reinforces verbal comprehension and phonics with an audio repeat button (🗣️). |
| **Oversized Touch Targets** | Minimum 150px cards, disabled double-tap zoom, prevented accidental text selection. | Ideal for developing fine-motor skills and iPad/tablet interaction. |
| **Visual Size Profiles** | Configurable sizes: **Normal**, **Large** (+40%), and **XL Giant** (+85%). | Allows starting with oversized high-salience images and progressively fading down to standard size. |

---

## 3. Mouse-Free Accessible Input & Controller Architecture

### Why Eliminate the Mouse?
Standard computer mice pose significant barriers for young neurodiverse children:
- **Fine-motor strain:** Requiring a precise finger grip while coordinating a separate index-finger click.
- **Spatial abstraction:** Moving a physical mouse horizontally across a desk while mapping cursor movement to a vertical screen causes cognitive disconnect.
- **Inadvertent misclicks & drag-drops:** Unintended cursor drift and dragging frequently trigger frustration and task disruption.

To provide an autonomous, sensory-adapted experience, the platform includes a universal **Input Manager (`public/js/input-manager.js`)** that translates standard USB keyboards, gamepads, and custom assistive macropads into an intuitive, mouse-free interaction system.

### Visual Size Profiles (Pedagogical Stimulus Fading)

Children with autism or visual processing differences frequently benefit from larger, more prominent visual stimuli when first encountering a new concept. As familiarity and discrimination improve, therapists use a technique known as **stimulus fading** to transition toward standard dimensions:

| Size Profile | Illustration Size | Card Dimensions | Best Suited For |
| :--- | :--- | :--- | :--- |
| **XL (Giant)** | **~195px** (+85%) | ~225px – 320px | **Early learners & Baseline:** Maximum visual salience, clear details, zero visual search strain. |
| **Large** | **~145px** (+40%) | ~180px – 245px | **Intermediate:** Comfortable intermediate step as visual confidence and scanning develop. |
| **Normal** | **~100px** (Standard)| ~140px – 190px | **Mastery:** Standard compact density preparing the child for everyday digital environments. |

- **Instant Switching:** Toggled via the bottom toolbar pills (`[Normal] [Large] [XL]`) or the floating Controller HUD dropdown.
- **Universal & Responsive:** Powered by CSS custom variables (`--img-size`, `--card-width`, etc.) and `clamp()`, dynamically scaling across smartphones, iPads, and desktop displays without layout breakage.
- **Persistent:** Saved in `localStorage` (`alp_size_profile`) across reloads.

### The 4-Button + Enter + Escape Interaction Paradigm

The physical device utilizes **4 primary action buttons**, one **Enter (Validate)** button, and one **Escape (Return/Quit)** button:

| Physical Control | Default Keyboard Keys | Gamepad Mapping | Universal In-Platform Action |
| :--- | :--- | :--- | :--- |
| **Button 1** | `ArrowLeft`, `1`, `A` | D-Pad Left / `X` (Square) | **Move Selection Left / Prev** (or direct Option 1) |
| **Button 2** | `ArrowUp`, `2`, `W` | D-Pad Up / `Y` (Triangle) | **Move Selection Up** (or direct Option 2) |
| **Button 3** | `ArrowDown`, `3`, `S` | D-Pad Down / `A` (Cross) | **Move Selection Down** (or direct Option 3) |
| **Button 4** | `ArrowRight`, `4`, `D` | D-Pad Right / `B` (Circle) | **Move Selection Right / Next** (or direct Option 4) |
| **Enter Button** | `Enter`, `Space` | `A` (Cross) / `Start` | **Validate / Confirm Highlighted Selection** |
| **Escape Button** | `Escape`, `Backspace` | `B` (Circle) / `Select` | **Return to Home Portal / Exit Activity** |
| *(Bonus Utility)* | `KeyR` | `L1` (Left Bumper) | **Repeat Spoken Audio Prompt** (🗣️) |

---

### Supported Interaction Models

#### 1. Selection Cursor Navigation (Move & Enter) - *Default & Universal*
- **Visible from Round Start:** The first entry always begins with a vibrant, high-contrast focus ring (`.is-controller-focused`).
- **Unrestricted Movement Across Entries:** Pressing **Left / Right / Up / Down** shifts the focus ring smoothly across available items without submitting an accidental answer.
- **Multi-Entry Flexibility:** Works seamlessly even when there are more than 4 items. For example, in **Spell the Word (`/spelling.html`)** for French word **CHAT** (5 letters in tray: `C`, `H`, `A`, `T`, plus a distractor), the child can press Right to move across letters until **`T`** is highlighted, then press **Enter** to validate.
- **Automatic Focus Advance:** When an item is placed (e.g. correct letter placed in a word slot), it is marked `.used`, and the focus ring automatically shifts to the next available unused letter.

#### 2. Direct 1-to-1 Selection Mode
- Intended for receptive identification activities (`/game.html`, `/colors.html`, `/math.html`) presenting 2 to 4 choices.
- Buttons 1, 2, 3, and 4 map directly to cards 1, 2, 3, and 4 for rapid discrete trial training (ABA) with zero cursor traversal.

---

### Customizable Keycap Overlays & Controller HUD

The on-screen **Controller HUD Bar** at the bottom of the screen offers real-time visual feedback and customization:
- **Active Press Illumination:** Whenever a hardware button or key is pressed, the matching on-screen tile illuminates with a tactile bounce animation, verifying device communication.
- **Physical Keycap Overlays:** Switchable via dropdown to match custom button stickers or relegendable caps:
  - **Auto / Smart:** Contextually applies arrows (`⬅️⬆️⬇️➡️`) in spatial activities, letters (`ABCD`) in spelling, and dual-cue badges (`1 🔴`, `2 🟢`) on cards.
  - **Numbers:** `1`, `2`, `3`, `4`
  - **Colors:** `🔴 Red`, `🟢 Green`, `🔵 Blue`, `🟡 Yellow`
  - **Directions:** `⬅️ Left`, `⬆️ Up`, `⬇️ Down`, `➡️ Right`
  - **Letters:** `A`, `B`, `C`, `D`

---

### Hardware Feasibility: Buy vs. Build

#### Option A: Buying Off-the-Shelf
- **USB Arcade Fightstick / Macro Keypad:** (e.g., Mayflash F300 or programmable 6-key USB macro pads). Recognizes natively as a USB Keyboard or Gamepad with durable 30mm arcade buttons that accept printed inserts under clear caps.
- **Xbox Adaptive Controller:** Connects via USB; provides 3.5mm jacks for giant external assistive switches (Jelly Bean / Big Red switches).

#### Option B: Building a Custom Assistive Controller (Tailored Ergonomics)
- **Microcontroller:** Raspberry Pi Pico (RP2040) or Arduino Pro Micro (ATmega32U4) connected via USB. Runs standard CircuitPython or QMK firmware emitting standard USB HID keyboard scancodes (`ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`, `Enter`, `Escape`). Requires zero PC drivers or extensions.
- **Pushbuttons:** 60mm or 100mm Big Dome Arcade Buttons (Red, Green, Blue, Yellow, White) with removable transparent caps for custom pictograms (PECS) or color discs.
- **Enclosure:** Angled wooden or laser-cut acrylic box with 50mm spacing between buttons to prevent accidental palm presses, fitted with non-slip silicone feet.

---

## 4. Detailed Activity Catalog

### Activity 1: 🔍 Receptive Identification ("Find & Match" / "Trouve l'image")
* **Route:** `/game.html` (or `/game.html?category=[category]`)
* **Hub Position:** Integrated directly into the main hub's **Structured Learning Activities** (*Activités logiques*) grid.
* **Target Skills:** Visual discrimination, receptive language, vocabulary generalization.
* **Category Filtering & Mixed Mode:**
  - 🌟 **All Categories / Tout mélanger (Default):** Mixes items across all categories for varied, unpredictable vocabulary practice.
  - In-activity filter pills at the top allow isolating any individual category at any time:
    1. 🚗 **Transport** (`transport.json`): Car, Bicycle, Airplane, Boat, Bus, Train
    2. 🐶 **Animals** (`animals.json`): Dog, Cat, Bird, Fish, Rabbit, Duck
    3. 🦷 **Daily Routines** (`routines.json`): Brush Teeth, Wash Hands, Shoes, Eat Meal, Drink Water, Sleep
    4. 🔢 **Numbers** (`numbers.json`): Number 1, 2, 3, 4, 5
    5. 🍎 **Fruits** (`fruits.json`): Apple, Banana, Orange, Strawberry, Grapes, Watermelon
    6. 🔺 **Shapes** (`shapes.json`): Circle, Square, Triangle, Star, Heart
    7. 👕 **Clothes** (`clothes.json`): T-Shirt, Pants, Socks, Hat, Jacket
* **How It Works:** The child hears *"Find the Dog"* or *"Trouve : Chien"*. The screen presents target and distractor cards. Selecting the correct card plays a gentle harmonic chime and vocalizes the word.

---

### Activity 2: 🧭 Guide the Animal ("Guide l'animal" - Concrete Spatial Navigation)
* **Route:** `/spatial.html`
* **Target Skills:** Spatial orientation, vertical elevation (Up/Down, Climb/Descend), directional concepts, pre-coding cause-and-effect.
* **Dual Spatial Modes (Top Switcher):**
  1. **🗺️ 2D Grid Maze (*Grille 2D*):**
     - Concrete 4x4 navigation matrix where the child steers an animal toward their goal.
     - **Infinite Random Spawning:** Coordinates are randomized on every round (minimum travel distance $\ge 2$) across 10 animal pairs (Cat ➔ Fish, Rabbit ➔ Carrot, Bee ➔ Flower, Dog ➔ Bone, Car ➔ Garage, Monkey ➔ Banana, Mouse ➔ Cheese, Bear ➔ Honey, Frog ➔ Lilypad, Bird ➔ Nest).
     - Controlled via 4-way tactile D-Pad, Arrow keys, or 4-button controller.
  2. **🪜 Ascending Staircase (*Escalier - HAUT & BAS*):**
     - A 5-step ascending diagonal staircase designed specifically to build vertical spatial comprehension.
     - Targets are placed at the top landing (🌟 *En HAUT*) or the bottom pond (💧 *En BAS*).
     - Tactile 2-button vertical controls (`⬆️ MONTER` & `⬇️ DESCENDRE`).
     - **Acoustic Elevation:** Ascending frequency spring sound (260Hz ➔ 520Hz) when jumping UP, descending step sound (420Hz ➔ 200Hz) when jumping DOWN.
     - Scenarios: Frog jumps UP to the Star, Frog jumps DOWN to the Pond, Rabbit climbs UP for Carrot, Cat climbs DOWN for Milk, Kangaroo bounds UP to the Flag, Child walks DOWN for Teddy.
* **Real-Time Spoken Directional Feedback:**
  - Every movement speaks the direction immediately without speech lag:
    - 🇬🇧 English: *"Up"*, *"Down"*, *"Left"*, *"Right"*
    - 🇫🇷 French: *"Haut"*, *"Bas"*, *"Gauche"*, *"Droite"*
* **Multisensory Feedback:**
  - Tactile wood-pop sounds, pulsating target beacons, and Web Audio API harmonic major chords upon arrival with verbal praise (*"Bravo ! Tout en HAUT !"* / *"Hooray! All the way UP!"*).
* **Accessible Controller & Sizing:** Fully playable via on-screen controls, standard keyboard arrows, or the 4-button accessible controller (Buttons 1–4), with full scaling across Normal, Large, and XL Giant size profiles.

---

### Activity 3: 🎨 Colors & Visual Discrimination
* **Route:** `/colors.html`
* **Target Skills:** Color recognition, naming, sorting by visual attributes.
* **Colors Included:** Red, Blue, Yellow, Green, Orange, Purple (*Rouge, Bleu, Jaune, Vert, Orange, Violet*).
* **How It Works:** Clean color swatches with spoken prompts (*"Find the color: Blue"* / *"Trouve la couleur : Bleu"*). Variable choice density (2 to 4 options).

---

### Activity 4: ☀️ Time Phases & Calendar Understanding ("Le temps & les moments")
* **Route:** `/time.html`
* **Target Skills:** Temporal orientation, daily circadian cycles, visual weekly scheduling, chronological sequence.
* **Concrete Visuals with Consistent Character:**
  - Rather than isolated abstract emojis, each moment illustrates the young boy character in familiar daily actions paired with window/sky lighting:
    1. 🌅 **Le Matin (Morning):** Bright golden sunrise through bedroom window + waking up and stretching in bed (`time-morning.svg`).
    2. ☀️ **L'Après-midi (Afternoon):** Bright daytime blue sky + playing outside in the park with a soccer ball (`time-afternoon.svg`).
    3. 🌇 **Le Soir (Evening):** Warm sunset glow through window + wearing cozy pajamas and reading a storybook (`time-evening.svg`).
    4. 🌙 **La Nuit (Night):** Dark sky with crescent moon and twinkling stars + sleeping peacefully in bed (`time-night.svg`).
* **Three Concrete Sub-Activities (Top Switcher):**
  1. **☀️ Moments du jour:** Interactive horizontal day-cycle bar (`🌅 Matin ➔ ☀️ Après-midi ➔ 🌇 Soir ➔ 🌙 Nuit`) with target highlight + matching daily life scenes.
  2. **📅 Jours de la semaine:** 7-day strip anchored to real-life routines (*maternelle* visual schedule):
     - **School Days (`Lundi, Mardi, Jeudi, Vendredi`):** Blue/green with backpack/school icon (`🏫`).
     - **Wednesday (`Mercredi`):** Yellow with park/ball icon (`⚽`) anchoring the mid-week play break.
     - **Weekend (`Samedi, Dimanche`):** Warm coral/peach with home icon (`🏡`).
     - Contextual questions: *"Quel jour vient juste après Lundi ?"* / *"Touche Mercredi (Parc / Jeux)"*.
  3. **🚂 L'ordre de la semaine:** Placing `Lundi` through `Dimanche` into 7 chronological slots.

---

### Activity 5: 🧩 Pattern Completion ("Complete a Suite")
* **Route:** `/pattern.html`
* **Target Skills:** Executive functioning, logical reasoning, pattern recognition, working memory.
* **How It Works:** Displays an A-B-A-B or ascending sequence (e.g., `[ Apple ] [ Banana ] [ Apple ] [ Banana ] [ ❓ ]`). The child taps the missing item from the choice tray below. Correct selection smoothly fills the slot with musical affirmation.

---

### Activity 6: 🔤 Spell the Word (Letter Selection)
* **Route:** `/spelling.html`
* **Target Skills:** Letter-sound correspondence (phonics), letter recognition, left-to-right reading direction, early spelling.
* **How It Works:** Shows a clear visual illustration (e.g. 🐱 Cat / Chat, 🐶 Dog / Chien) with empty letter slots `[ _ ] [ _ ] [ _ ]`. The child taps letter buttons from a scrambled tray. Each tapped letter sounds out its name. Once complete, the platform pronounces the whole synthesized word.

---

### Activity 7: 🦷 Routine Steps & Task Analysis ("Étapes du quotidien")
* **Route:** `/sequence.html`
* **Target Skills:** Task analysis, daily self-care autonomy, procedural memory, chronological sequencing.
* **Pedagogical Upgrades for Executive Functioning:**
  - **Concrete Story Goal Banner:** Displays the destination mission at the top (e.g. *"Mission : Avoir les dents propres ✨"* or *"Mission : Aller aux toilettes 🚽"*), giving logical purpose to why Step 1 must happen first.
  - **Scaffolding Difficulty Toggle:**
    - **⭐ 3 Étapes (*D'abord / Ensuite / Enfin*):** Subsets routines into 3 clear anchor steps (*First ➔ Next ➔ Last*) to build baseline chronological confidence without working-memory fatigue.
    - **🌟 Toutes les étapes:** Full 4–5 step task analysis for detailed mastery.
  - **Left-to-Right Directional Arrows (`➡️`):** Explicit visual connectors between timeline slots, reinforcing chronological flow.
  - **Action Verb Captions & Spoken Phonics:** 2–3 word verb captions (*"1. Ouvrir la porte"*, *"2. S'asseoir"*) spoken aloud automatically on placement.
* **10 Comprehensive Daily Life Routines:**
  1. 🚽 **Going to the Toilet** (*Aller aux toilettes* - 5 steps): Go to bathroom ➔ Sit on toilet ➔ Wipe with paper ➔ Flush toilet ➔ Wash hands with soap.
  2. 🦷 **Brushing Teeth** (*Se brosser les dents* - 4 steps): Toothpaste on brush ➔ Brush all teeth ➔ Rinse mouth with water ➔ Clean bright smile!
  3. 👕 **Getting Dressed** (*S'habiller* - 4 steps): Put on pants ➔ Put on shirt ➔ Put on socks ➔ Put on shoes.
  4. 🫧 **Washing Hands** (*Se laver les mains* - 5 steps): Soap & bubbles ➔ Scrub together ➔ Rinse with water ➔ Dry with towel ➔ Clean hands!
  5. 🌙 **Bedtime Routine** (*Se coucher* - 4 steps): Put on cozy pajamas ➔ Brush teeth ➔ Read bedtime story ➔ Close eyes and sleep.
  6. 🍽️ **Setting the Table** (*Mettre la table* - 4 steps): Put placemat on table ➔ Put plate on placemat ➔ Put cup and fork ➔ Table is ready!
  7. 👟 **Going Outside** (*Sortir dehors* - 3 steps): Put on shoes ➔ Put on warm coat ➔ Open door to go out.
  8. 🍎 **Eating a Snack** (*Prendre le goûter* - 4 steps): Wash hands ➔ Sit calmly at table ➔ Eat delicious snack ➔ Wipe mouth and hands.
  9. 🎒 **Packing Backpack** (*Préparer son sac* - 4 steps): Open backpack ➔ Put lunchbox inside ➔ Put water bottle inside ➔ Zip backpack closed.
  10. 🧸 **Cleaning Up Toys** (*Ranger les jouets* - 4 steps): Open toy box ➔ Pick up toys from floor ➔ Put toys into box ➔ Close box.

---

### Activity 8: 🔢 Counting & Basic Visual Math
* **Route:** `/math.html`
* **Target Skills:** One-to-one correspondence, cardinal numbers (1–5), visual addition.
* **Modes:**
  - **🍎 Visual Counting:** 1 to 5 visual items on screen. The child can tap each item directly to count aloud (*"1! 2! 3!"* with musical pop tones), then confirm with the corresponding number card.
  - **➕ Simple Addition:** Combines two groups of items (e.g., `[ 🍎 🍎 ] + [ 🍎 ] = ?`), visually demonstrating the concept of adding quantities together.

---

### Activity 9: 🔤 Letter Inset Puzzle ("Puzzle d'encastrement")
* **Route:** `/letters.html`
* **Target Skills:** Letter recognition, phonics foundation, form-fitting visual-spatial discrimination, fine-motor coordination.
* **Montessori Inset Design:**
  - An ivory-and-wood recessed puzzle board featuring hollow cutout slots (*empreintes*), each with faint letter watermarks and dashed contour guides.
  - Below is a tray of 3D-styled wooden letter pieces displaying the uppercase letter, signature color, and associated illustration or emoji.
* **Progressive Boards:**
  - Small, manageable chunks: **A-B-C**, **D-E-F**, **G-H-I**, **J-K-L**, **M-N-O**, **P-Q-R**, **S-T-U**, and **V-W-X-Y-Z**.
* **Multisensory Phonics Feedback:**
  - Snapping the piece into its cutout triggers a satisfying tactile wood-snap tone followed by a gentle harmonic chime.
  - Spoken phonics reinforcement: e.g. *"A ! Comme Avion !"* / *"A ! As in Airplane!"*.
  - Full board completion triggers an ensemble bounce animation and celebratory voice praise before smoothly advancing.
* **Accessibility:** Fully playable with touch, mouse, or the 4-button accessible controller (Left/Right + Enter), and responsive across Normal, Large, and XL Giant size profiles.

---

### Activity 10: 🖍️ Match & Colour ("Colorie le modèle")
* **Route:** `/coloring.html`
* **Target Skills:** Colour recognition, visual-model reproduction, fine-motor association, artistic autonomy.
* **3-Row Interface Architecture with Direct Controller Palette Control:**
  - **Row 1 – Reference Models (`.coloring-models-row`):** Displays 3 or 4 fully-coloured reference objects with color name tags (e.g. Red Apple, Yellow Banana, Green Pear). The target model has an illuminated blue focus ring and pointing arrow (`⬇️`), and completed models receive checkmark badges (`✅`).
  - **Row 2 – Single Focused Object (`.coloring-single-canvas-card`):** Displays **only one** large, centered, uncoloured drawing at a time to eliminate cognitive clutter and multi-row navigation friction.
  - **Row 3 – Colour Palette (`.coloring-palette-row`):** Tactile 3D-styled colour pencils (Red, Yellow, Green, Orange, Blue, Purple, Pink, Brown).
* **Direct Arrow Key & Controller Mapping:**
  - Arrow keys (`⬅️` / `➡️`) directly steer the color cursor across the pencil palette in Row 3.
  - Pressing `Enter` (or tapping any pencil directly) paints the active object in Row 2 with a smooth vector colour wash.
* **Pedagogical Interaction & Non-Punitive Flow:**
  - Applying a colour speaks the color name aloud (*"Rouge !"* / *"Red !"*).
  - Matching the model plays a gentle chime, marks that model with a checkmark badge in Row 1, and smoothly transitions Row 2 to the next item in the set.
  - Completing all models in the set triggers a harmonic major chord fanfare and celebratory speech praise (*"Bravo ! Tous les modèles sont coloriés ! 🌟"*) before advancing to the next challenge.
* **Progressive Difficulty:** **⭐ 3 Modèles** (3 Models) and **🌟 4 Modèles** (4 Models).

---

### Activity 11: ⚖️ Learning Comparison Concepts ("Les Contraires & Comparaisons")
* **Route:** `/comparisons.html`
* **Target Skills:** Relational reasoning, basic comparison concepts, vocabulary of opposites, visual discrimination.
* **12 Concrete Opposite Concepts with 36 Rotating Pairs (3 Variants per Concept):**
  1. **Big / Small** (*Grand / Petit*): Elephant vs. Mouse, Whale vs. Ladybug, Watermelon vs. Cherry.
  2. **Tall / Short** (*Haut / Bas*): Tall Giraffe vs. Low Hedgehog, Tall Pine Tree vs. Low Mushroom, Tall Building vs. Low Tent.
  3. **Long / Short** (*Long / Court*): Train vs. Small Car, Snake vs. Caterpillar, Long Scarf vs. Short Sock.
  4. **Heavy / Light** (*Lourd / Léger*): Big Rock vs. Floating Feather, Bowling Ball vs. Soap Bubble, Hippo vs. Butterfly.
  5. **Hot / Cold** (*Chaud / Froid*): Steaming Soup vs. Cold Ice Cream, Hot Sun vs. Snowman, Fire vs. Freezing Ice Cube.
  6. **Fast / Slow** (*Rapide / Lent*): Race Car vs. Turtle, Rocket vs. Snail, Airplane vs. Bicycle.
  7. **Full / Empty** (*Plein / Vide*): Full Lunchbox vs. Empty Plate (`🍽️`), Full Battery vs. Empty Battery (`🪫`), Full Popcorn vs. Empty Bowl (`🥣`).
  8. **More / Less** (*Beaucoup / Peu*): Many Apples vs. One Apple, Many Stars vs. One Star, Many Fish vs. One Fish.
  9. **High / Low** (*En haut / En bas*): Airplane high in sky vs. Boat on sea, Sun up in sky vs. Flower down on ground, Flying Bird vs. Crab on sand.
  10. **Near / Far** (*Près / Loin*): House close by vs. House far away (`🏡` vs. `🏠`), Dog right here vs. Dog far away, Car close by vs. Car far away.
  11. **Thick / Thin** (*Épais / Fin*): Thick Stack of Books vs. Thin Sheet of Paper (`📚` vs. `📄`), Thick Burger vs. Thin Crêpe (`🍔` vs. `🥞`), Thick Tree Trunk vs. Thin Twig (`🌳` vs. `🌿`).
  12. **Wide / Narrow** (*Large / Étroit*): Wide Road vs. Narrow Footpath, Wide Bed vs. Narrow Chair, Wide Bus vs. Narrow Bicycle.
* **Visual Contrast Scaffolding & Audio:**
  - Dynamic visual scaling transforms (`.size-big`, `.dist-near`, `.height-tall`, `.weight-heavy`, `.pos-high`, etc.) applied to the icon stage to physically reinforce size, distance, and weight on screen.
  - Spoken affirmative confirmation on match (*"Oui ! La baleine est immense ! 🐋"* / *"Yes! The whale is huge! 🐋"*).
* **Top Concept Pills:** Parents/therapists can isolate any of the 12 opposite pairs or select **🎲 Tout mélanger / Mix All**.

---

### Activity 12: 🔮 Ball Labyrinth ("Labyrinthe à billes")
* **Route:** `/labyrinth.html`
* **Target Skills:** Visual-spatial planning, detour reasoning, motor inhibition, cause-and-effect steering.
* **Inspired by Classic Wooden Magnetic Ball Mazes:**
  - **Solid Black Wall Cells (`#2B2D42`):** Physical barriers placed throughout the grid that block direct paths, requiring the child to navigate detours around corners.
  - **Multiple Balls & Matching Target Pockets:** Each board contains 2 to 4 colored (or numbered) marble balls that must each be guided into their matching target pocket.
  - **Tap-to-Switch Control:** One ball is actively controlled at a time (highlighted with a glowing yellow beacon ring). Tapping any marble ball or top status chip switches steering focus instantly—just like moving a magnetic wand.
  - **Non-Punitive Navigation:** Pressing into a wall, board edge, or another ball simply keeps the marble in place with a soft step tone and zero harsh error buzzers.
* **Progressive Levels:**
  1. **Niveau 1 (2 Billes):** Red and Blue balls with a central dividing wall.
  2. **Niveau 2 (Détours):** 3 balls (Red, Orange, Green) with corner obstacles.
  3. **Niveau 3 (4 Couleurs):** 4 balls (Red, Blue, Green, Purple) in a 6x6 maze.
  4. **Niveau 4 (Chiffres 1-2-3-4):** Numbered balls matching numbered target pockets (1, 2, 3, 4).
* **Controls & Speech:**
  - Tactile on-screen D-Pad or standard keyboard arrows (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` / `1`–`4`).
  - Spoken directional voice on each step (*"Haut"*, *"Bas"*, *"Gauche"*, *"Droite"* / *"Up"*, *"Down"*, *"Left"*, *"Right"*).
  - Harmonic major chord celebration on level completion.

---

### Activity 13: 🔊 Sound Identification ("Reconnaître les sons")
* **Route:** `/sounds.html`
* **Target Skills:** Auditory discrimination, receptive association, sound-to-image mapping, attention.
* **4 Sound Categories:**
  - 🐾 **Animals (*Animaux*):** Dog bark, Cat meow, Cow moo, Bird chirp, Duck quack, Sheep bleat.
  - 🚗 **Transport (*Transports*):** Train whistle, Motorbike engine, Car horn, Airplane jet, Boat horn, Firetruck siren.
  - 🌿 **Nature (*Nature*):** Ocean waves, Wind gust, Thunderstorm, Rain.
  - 🎸 **Instruments (*Instruments*):** Piano chord, Drum roll, Guitar strum, Trumpet fanfare.
* **Hybrid Audio Engine:**
  - Automatically loads and plays `.mp3` files from `assets/sounds/` if available.
  - Features an integrated **Web Audio API procedural sound synthesizer** capable of generating authentic sound effects on the fly with zero external audio assets or network latency.
* **Tactile Replay & Feedback:**
  - Prominent hero replay button (`[ 🔉 Écouter le son ]`) with audio wave pulsing animation.
  - Errorless support: tapping a non-target card replays the sound gently without negative error alarms.

---

### Activity 14: 🎢 Wooden Ball Circuit / Marble Run ("Circuit à billes")
* **Route:** `/circuit.html`
* **Target Skills:** Color recognition, auditory phonics, fine-motor coordination, cause-and-effect tracking.
* **Inspired by Classic Wooden Zig-Zag Ramp Towers:**
  - **5 Alternating Slanted Ramps:** A vector wooden ramp tower with top entry funnel and bottom collection track.
  - **Physics-Like Zig-Zag Animation:** When the requested ball color is tapped, the marble drops into the funnel, rolls across all 5 ramps, and stacks neatly at the bottom collector track.
  - **Realistic Wooden Click-Clack Audio:** Procedural Web Audio synthesis produces authentic wooden clatter and pitch shifts at each ramp drop.
* **3 Progressive Modes:**
  1. 🎨 **4 Couleurs:** 4 foundational colors with visual prompt swatch.
  2. 🌈 **6 Couleurs:** Full rainbow set (Red, Blue, Yellow, Green, Orange, Purple).
  3. 👂 **Écoute seule (Listening Mode):** Hides the visual color swatch in the prompt to focus purely on auditory color name recognition and phonics.

---

### Activity 15: ⚡ Cause & Effect Lab ("Cause & Effet")
* **Route:** `/causality.html`
* **Target Skills:** Intentional action and logical consequence, physical reasoning, receptive language following, motor intentionality.
* **6 Interactive Physical Scenes:**
  1. 🚪 **La Porte (The Door):** Green Open button slides doors open to reveal a friendly boy smiling inside; Red Close button closes the doors with status light feedback.
  2. 🛗 **L'Ascenseur (The Elevator):** Up and Down buttons navigate the elevator cabin between 3 distinct building floors with realistic shaft animations and floor indicator lights.
  3. 🐦 **L'Oiseau (The Bird Cage):** Open button swings the cage door open as the cute yellow bird flaps and flies out to the sunny window; Close button brings the bird gently back.
  4. 🚰 **Le Robinet (The Water Tap):** Turn tap button rotates the faucet handle, pouring a clear water stream into the glass until full; Empty button clears the glass.
  5. 🥛 **Le Verre Fragile (The Fragile Glass):** Drop button tips the glass over the table edge with quadratic gravity and rotation, breaking it into clean pieces with crystalline audio; New Glass button places a fresh intact glass.
  6. 💡 **La Lumière (The Light Switch):** Switch On illuminates the bedroom with warm light cone rays on the teddy bear and day sky window; Switch Off sets a peaceful dark night atmosphere.
* **2 Complementary Modes:**
  - 🎮 **Mode Libre (Découvrir):** Child freely explores cause and effect by tapping any tactile action button at their own pace.
  - 🎯 **Mode Mission (Défi):** Spoken and written prompts present intentional challenges (e.g. *"Ouvre la porte pour laisser entrer le garçon !"*).
* **Live Cause ➔ Effect Equation Banner:** Prominent feedback strip (`[ 👆 Action ] ➡️ [ ✨ Résultat ]`) explaining the causal relationship in real time.
* **Full Controller Support:** Native keyboard/gamepad navigation (`1` and `2` keys or D-Pad navigation on `.cause-btn`).

---

### Activity 16: 🏗️ Building Logic ("Logique de Construction")
* **Route:** `/builder.html`
* **Target Skills:** Spatial reasoning, part-to-whole perception, size seriation, fine-motor planning.
* **3 Progressive Construction Challenges:**
  1. 🌉 **Le Pont (The Bridge):** Complete missing geometric blocks over the river. Once completed, a car drives across the span and honks joyfully.
  2. 🥤 **La Pyramide (The Pyramid):** Stack 6 stacking cups row-by-row from bottom (3) to middle (2) to peak (1), unlocking celebratory crown and floating stars.
  3. 🗼 **La Tour (Grand → Petit / Size Tower):** Construct a balanced tower by identifying and selecting the largest remaining block first, ending with a little bird landing on the summit.
* **Controller Support:** Native keyboard/gamepad navigation (`1` to `4` number keys or D-Pad navigation on `.piece-card`).

---

### Activity 17: 🏀 Basket Shape ("Basket des Formes")
* **Route:** `/basket.html`
* **Target Skills:** Geometric shape discrimination, receptive shape vocabulary, cause-and-effect physics engagement.
* **Dynamic Morphing Hoop:** The basketball backboard hoop dynamically transforms into a Circle, Square, Triangle, Rectangle, Star, or Diamond.
* **Parabolic Arc Physics:**
  - **On Match:** Ball arcs across the court, swishes through the net with springy net deformation, golden stars, and procedural net swish audio.
  - **On Mismatch:** Gentle rim bounce back down to starting position without harsh buzzers, repeating the target shape name.
* **2 Difficulty Levels:** 🔷 4 Shapes vs. ⭐ 6 Shapes.
* **Controller Support:** Native keyboard/gamepad navigation (`1` to `3` number keys or D-Pad navigation on `.ball-launch-btn`).

---

### Activity 18: 🎵 Music Partition ("Partition Musicale")
* **Route:** `/music.html`
* **Target Skills:** Auditory-visual correspondence, musical memory, melodic pattern copying, color-pitch association.
* **1-to-1 Column Alignment:** Player row sits directly below the model row so children can match notes column-by-column.
* **Animated Marimba Demo Playback:** Model notes bounce and light up in sync with warm marimba/piano tones on round start or tap.
* **5 French Comptines:**
  1. 🔔 *Frère Jacques*
  2. 🌙 *Au clair de la lune*
  3. 🎭 *Ainsi font, font, font*
  4. ⭐ *Ah ! vous dirai-je, maman* (*Twinkle Little Star*)
  5. 🎶 *J'ai du bon tabac*
* **3 Length Levels:** ⭐ 3 Notes, ⭐⭐ 5 Notes, ⭐⭐⭐ 8 Notes.
* **Dancing Melody Reward:** Completing the partition triggers an animated stage where the comptine character dances in time with a full 11-to-14-note extract of the song.
* **Controller Support:** Native keyboard/gamepad navigation (`1` to `7` number keys for Do to Si or D-Pad navigation on `.key-block-btn`).

---

### Activity 19: 🗂️ Classification & Sorting ("Classification & Tri")
* **Route:** `/classification.html`
* **Target Skills:** Categorization, semantic association, visual comparison, task completion endurance.
* **Tap-to-Sort Mechanic:** One item appears in a central spotlight card; the child taps the matching destination basket below.
* **Fly-In Physics & Visible Collection:** Each correct tap animates the card shrinking and flying into the basket, building a visible collection of badges inside the category.
* **6 Themes:**
  1. 🎨 *Couleurs* (Red/Blue, Yellow/Green)
  2. 🍎 *Fruits / 🥕 Légumes*
  3. 🔤 *Lettres / 🔢 Chiffres*
  4. 🐾 *Animaux / 🐝 Insectes*
  5. 🦅 *Vole / 🐟 Nage* (Ciel vs. Eau)
  6. 🌸 *Fleurs / 🪨 Cailloux*
* **Controller Support:** Native keyboard/gamepad navigation (`1` for Left Basket, `2` for Right Basket, or D-Pad navigation on `.sort-basket`).

---

### Activity 20: 🔍 Visual Hide & Seek ("Cache-Cache Visuel")
* **Route:** `/hide-and-seek.html`
* **Target Skills:** Visual discrimination, figure-ground perception, visual scanning, sustained attention.
* **Visual Similarity Distractors:** Distractors intentionally share color palettes, silhouettes, or semantic domains with the target to train discerning visual focus.
* **Calm Error Elimination:** Non-matching tapped cells gently dim without buzzers, turning trial-and-error into structured visual elimination.
* **3 Progressive Densities:** ⭐ 3×3 Grid (9 cells), ⭐⭐ 4×4 Grid (16 cells), ⭐⭐⭐ 5×4 Grid (20 cells).
* **6 Thematic Hunt Suites:**
  1. 🦊 *Animaux proches* (Fox, Dog, Cat, Bear, Lion, Tiger / Green reptiles)
  2. 🍎 *Objets rouges* (Apple, Tomato, Strawberry, Cherries, Watermelon, Rose)
  3. 🐝 *Petites bêtes* (Bee, Ladybug, Butterfly, Caterpillar, Ant, Beetle)
  4. 🚒 *Transports* (Fire Truck, Car, Taxi, Bus, Van, Tractor)
  5. 🥳 *Visages* (Party, Smile, Sunglasses, Star-eyes, Surprised)
  6. 🔤 *Lettres & Chiffres* (B, D, P, R, 8 / 6, 9, 0, 5, 3)
* **Controller Support:** Native keyboard/gamepad navigation (`1`–`9` keys or D-Pad navigation on `.search-cell`).

---

### Activity 21: 〰️ Magic Lines ("Lignes Magiques")
* **Route:** `/lines.html`
* **Target Skills:** Pre-writing graphomotor skill development, visual-motor integration, trajectory planning, line contour recognition (horizontal, vertical, zigzag, sinusoidal waves, castle crenels).
* **1-to-1 Blueprint Model:** Top blueprint card displays Point A, Point B, and the complete continuous model line.
* **Interactive Segment Assembly:** Children pick matching segment motifs from the selection tray to lock into progressive dashed slots between Point A and Point B.
* **Trajectory Travel Physics & Star Trail Reward:** Upon completing the line, the character (car, boat, rabbit, rocket, knight) smoothly animates along the exact mathematical curve from start to destination, emitting a sparkling particle star trail accompanied by melodic Web Audio tone sweeps and victory chimes.
* **5 Concrete Storytelling Trajectories:**
  1. ➖ *Horizontale* (🚗 La voiture rejoint la maison)
  2. 🌊 *Vagues / Sinusoïdale* (⛵ Le bateau navigue vers l'île)
  3. ⚡ *Zigzag* (🐰 Le lapin sautille vers la carotte)
  4. 丨 *Verticale* (🚀 La fusée décolle vers l'étoile)
  5. 🏰 *Créneaux / Ponts* (🏰 Le chevalier marche vers la couronne)
* **Controller Support:** Native keyboard/gamepad navigation (`1`–`3` keys or D-Pad navigation on `.motif-card`).

---

### Activity 22: 🦋 Body Parts ("Le Corps Humain")
* **Route:** `/body.html`
* **Target Skills:** Body schema awareness, receptive & expressive anatomical vocabulary, fine-motor spatial pointing, self-concept development.
* **The Magic Butterfly 🦋 Companion:** An animated glowing butterfly with fluttering wings and rainbow stardust flight trails that guides the child across anatomical targets.
* **Dual Game Modes:**
  1. 🏷️ *Nommer la partie (Name It)*: The butterfly lands softly on a body part; the target pulses with a warm beacon and the child selects the matching body part from picture+text choice cards.
  2. 🎯 *Pose le papillon (Touch & Fly)*: The audio prompt asks the child to land the butterfly on a specific body part; the child taps the character's body hotspot, and the butterfly swoops dynamically across the screen to land on their touch!
* **3 Anatomical Tiers + Mix All:**
  - 😊 *Le Visage (Face)*: Eyes, Nose, Mouth, Ears, Hair, Head.
  - 💪 *Haut du corps (Upper Body)*: Shoulders, Arms, Hands, Belly/Tummy.
  - 🦵 *Bas du corps (Lower Body)*: Legs, Knees, Feet.
* **Milestone Butterfly Meadow Reward:** Every 5 completed items triggers a sensory celebration with a swarm of colorful dancing butterflies, floral confetti, and celebratory fanfare chimes.
* **Controller Support:** Native keyboard/gamepad navigation (`1`–`4` keys or D-Pad navigation on `.body-choice-btn` and `.body-hotspot`).

---

## 5. User Feedback, Session Tracking & Child Progress Monitoring

To continuously evaluate activity effectiveness and help parents/therapists understand learning patterns, strengths, and engagement, the platform provides an integrated, privacy-conscious tracking and analytics architecture.

### Lightweight User Identification (Nickname & Device/IP)
- **Zero Friction:** No mandatory account creation, email, or passwords.
- **Nickname Prompt:** On arrival, users enter a nickname (e.g. *Ilyen*, *Sarah*) or select an existing avatar card with one click.
- **Profile Switching:** A top-level chip (`[ 🦊 Ilyen ⇄ ]`) allows switching child profiles instantly.
- **Privacy-Conscious Local Storage:** All metrics and feedback are saved strictly inside the local project directory (`storage/profiles.json`, `storage/sessions.json`, `storage/feedback.json`). Zero data is transmitted to external cloud servers or analytics trackers (COPPA/GDPR-K aligned).

### In-Activity Child & Parent Feedback Mechanism
Every activity includes an unobtrusive feedback widget docked at the top right:
- **Child-Friendly Reactions:** Simple, cheerful **👍 (Like)** and **👎 (Unlike)** buttons to capture whether the child enjoys an activity.
- **Strictly 1 Vote per User per Activity:** Reactions are idempotent. Tapping 👍 records 1 like for the current identified child profile and illuminates the button in soft green (`.active`). Tapping it again toggles the vote off. Tapping 👎 switches the vote from like to unlike. A user cannot artificially inflate counters by repeatedly tapping.
- **YouTube-Style Like Counters on Hub (`/index.html`):** Each activity card on the home dashboard features an aggregate like counter badge (`👍 14`) docked at the bottom right, celebrating the family's most appreciated games.
- **Live Reaction Counters:** Shows deduplicated positive and negative feedback counts on both the activity widget and parent dashboard.
- **Therapist / Parent Observation Note (💬):** A dedicated dialog to record qualitative notes during sessions (e.g., *"Very engaged today, recognized animals without verbal prompts"* or *"Tired after 10 minutes"*). Notes can be logged across sessions without overwriting past observations.

### Session Statistics & Calibrated Response Latency
Metrics tracked per question and aggregated across sessions:
- **Accuracy Rate (%):** Correct answers vs. gentle retry nudges.
- **Attempts per Trial:** Distinguishes first-try mastery from multi-attempt errorless discovery.
- **Calibrated Response Latency:** Measures elapsed time from prompt delivery to selection, safely filtering out motor hesitations or pauses so processing speed is observed without penalizing fine-motor delays.
- **Session Duration & Trial Counts:** Tracks active time and completed vs. abandoned activities.

### Parent Dashboard & Progress Monitoring (`/parent.html`)
Accessible via the header button (`[ 📊 Espace Parents / Parent Dashboard ]`):
- **Child Profile Filter:** Review metrics for a specific child or view consolidated data across all learners.
- **Key Performance Indicators (KPIs):** Total time spent, overall accuracy %, questions completed, and average response time.
- **Adaptive Recommendations:** Pedagogical suggestions categorized into Confidence Boosters, Consolidation, and Accommodations.
- **Activity Breakdown Table:** Detailed rows per activity with visual accuracy progress bars, attempt ratios, response latency, and like/dislike counts.
- **Observations Log:** Chronological record of notes entered by parents and therapists during sessions.
- **Data Export & Import Backup:** Download full JSON snapshots of child metrics and restore progress onto other devices.

---

### Privacy-Safe Direct Feedback Delivery (Without Exposing Personal Email)
Parents, educators, and therapists can submit feedback, game suggestions, and accessibility needs directly via the `[ 💬 Donner mon avis / Feedback ]` button:
- **Zero Email Exposure:** Your email address is **never** written in code, HTML, or git commits.
- **Cloudflare Edge Function (`functions/api/send-feedback.js`):** Receives feedback securely on the Cloudflare server edge and forwards it to your private inbox.
- **1-Minute Setup in Cloudflare Pages:**
  1. Go to your **Cloudflare Dashboard** -> **Workers & Pages** -> **autism-learning-platform** -> **Settings** -> **Environment variables**.
  2. Add your secret key:
     - Variable Name: `WEB3FORMS_ACCESS_KEY` (free instant key from [web3forms.com](https://web3forms.com)) or `RESEND_API_KEY` + `FEEDBACK_RECIPIENT_EMAIL`.
  3. Every suggestion submitted by users arrives directly in your personal email inbox, while your identity and address remain completely hidden from the public repo and website!

### Cross-Device Likes & Global Total Connections Counter (Cloudflare Pages)
Activity likes, reactions, and total connection counters synchronize seamlessly across all user devices (tablets, phones, computers) when hosted on Cloudflare Pages:
- **Global Like Synchronization (`functions/api/feedback/`):** When a child or parent taps 👍 on any device, the reaction is aggregated globally and reflected on the Hub activity card badges across all other connected devices.
- **Anonymous Multi-Device Voter Isolation:** Devices without a designated child profile are identified by unique anonymous device keys (`deviceId`), preventing two unnamed tablets from overwriting each other's votes.
- **Total Connections Counter (`functions/api/session/`):** Displays real-time total visits / connections in the Hub footer (`🌐 1 420 connexions`), automatically localized in French and English.
- **1-Minute Cloudflare KV Activation:**
  1. In **Cloudflare Dashboard** -> **Workers & Pages** -> **KV**, click **Create namespace** named `ALP_KV`.
  2. Go to **Workers & Pages** -> **autism-learning-platform** -> **Settings** -> **Functions** -> **KV namespace bindings**.
  3. Click **Add binding** -> Variable name: `ALP_KV` -> Select KV namespace: `ALP_KV`.
  4. Save and re-deploy! *(If KV is not yet bound, resilient edge memory and device-local fallback keep the app functional without errors).*

### Adaptive Activity Selection & Progressive Difficulty
Based on performance and feedback, the engine dynamically calculates learning recommendations and tags dashboard cards:
- **💚 Favori / Confidence Booster:** Activities with high mastery (≥80%) and positive feedback. Recommended for beginning sessions on a positive, empowering note.
- **⭐ Conseillé / Active Practice:** Emerging skills with moderate mastery (60%–80%). Recommended for active consolidation.
- **🎯 À consolider / Needs Accommodation:** Activities with higher retry counts or lower accuracy (<60%). The engine recommends reducing choice count to 2 (DTT baseline) and enabling XL image size before re-challenging.

---

## 6. Technical Architecture

- **Backend:** Node.js + Express with modular REST APIs (`/api/profiles`, `/api/session/*`, `/api/feedback/*`, `/api/parent/dashboard`).
- **Local Data Persistence (`server/storage.js`):** Lightweight JSON-based store in `storage/` directory (profiles, sessions, trial events, feedback). Zero external databases or internet dependencies.
- **Frontend Tracking Engine (`public/js/tracker.js`):** Modular client tracker coordinating session lifecycles, latency timers, trial attempts, feedback widgets, and dashboard recommendation badges.
- **Parent Analytics UI (`public/js/parent-dashboard.js`):** Dedicated analytics dashboard with bilingual data tables, KPI cards, and qualitative note history.
- **Accessible Controller & Input Architecture (`public/js/input-manager.js`):**
  - Native DOM keydown hook supporting directional scancodes (`ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`), validation (`Enter`, `Space`), and return (`Escape`).
  - Standard Gamepad API polling loop (`navigator.getGamepads()`) providing zero-config compatibility with USB arcade sticks and game controllers.
  - Idempotent MutationObserver tracking active interactive elements (options, cards, letter buttons), clamping focus bounds, and updating high-visibility focus highlights (`.is-controller-focused`).
- **Audio Synthesis:**
  - **Web Audio API:** Generates gentle sine-wave musical chords procedurally without relying on heavy external audio files.
  - **Web Speech API (`window.speechSynthesis`):** Automatically selects localized French (`fr-FR`) or English (`en-US`) voices at a steady, calm rate (0.9x speed).
- **Responsive Layout:** Responsive Grid and Flexbox with viewport clamping (`clamp()`), making cards touch-friendly on screens from smartphones to large iPads.
- **State Persistence:** Local storage (`localStorage`) saves language (`alp_lang`), sound toggle (`alp_sound`), choice density (`alp_options`), visual size profile (`alp_size_profile`), controller overlay style (`alp_controller_overlay`), and navigation mode (`alp_controller_nav_mode`) between reloads.

---

## 7. Project Structure

```text
autism-learning-platform/
├── server.js                     # Local Express server with REST APIs
├── server/
│   └── storage.js                # Privacy-conscious local JSON persistence & analytics
├── storage/                      # Local session data, profiles, and feedback (git-ignored)
├── package.json                  # Node.js configuration & test runner
├── test-input-manager.js         # Automated test suite for input & spelling navigation
├── test-tracker.js               # Automated test suite for session tracking & parent analytics
├── README.md                     # Documentation & concept blueprint
└── public/
    ├── index.html                # Main Dashboard Hub with adaptive badges
    ├── parent.html               # Dedicated Parent Dashboard & Progress Monitoring
    ├── game.html                 # Receptive Identification / Find & Match
    ├── letters.html              # Letter Inset Puzzle / Puzzle d'encastrement
    ├── spatial.html              # Space & Directions (Up/Down, Left/Right, On/Under)
    ├── colors.html               # Color Matching & Discrimination
    ├── time.html                 # Time Phases, Day Moments & Calendar
    ├── pattern.html              # Pattern Completion / Suites logiques
    ├── spelling.html             # Word Spelling / Letter Selection
    ├── sequence.html             # Daily Routine Task Analysis
    ├── math.html                 # Visual Counting & Simple Addition
    ├── css/
    │   └── style.css             # Unified pastel styling, focus rings & parent dashboard
    ├── js/
    │   ├── tracker.js            # User identification, session tracking & feedback widget
    │   ├── parent-dashboard.js   # Parent analytics, KPI cards & notes engine
    │   ├── input-manager.js      # Universal 4-Button controller & keyboard navigation engine
    │   ├── game-engine.js        # Find & Match engine (with category mixing & filters)
    │   ├── letters-engine.js     # Letter Inset Puzzle engine (Montessori encastrement)
    │   ├── spatial-engine.js     # Spatial concept engine
    │   ├── colors-engine.js      # Colors engine
    │   ├── time-engine.js        # Time & calendar engine
    │   ├── pattern-engine.js     # Pattern completion engine
    │   ├── spelling-engine.js    # Spelling & letter builder engine
    │   ├── sequence-engine.js    # Routine sequencing engine
    │   └── math-engine.js        # Counting & math engine
    ├── data/
    │   ├── letters.json          # Letter Inset Puzzle boards & phonics dataset
    │   ├── transport.json        # Transport vehicles dataset
    │   ├── animals.json          # Animals dataset
    │   ├── routines.json         # Routines dataset
    │   ├── numbers.json          # Numbers 1-5 dataset
    │   ├── fruits.json           # Fruits dataset
    │   ├── shapes.json           # Shapes dataset
    │   ├── clothes.json          # Clothes dataset
    │   ├── colors.json           # Colors dataset
    │   ├── spatial.json          # Spatial prepositions dataset
    │   ├── time.json             # Day phases & week/weekend dataset
    │   ├── patterns.json         # Pattern sequences dataset
    │   ├── words.json            # Spelling words dataset
    │   └── sequences.json        # Step-by-step routine task analysis
    └── assets/
        └── photos/               # 68+ SVG vector illustrations & real photos
```

---

## 8. Data-Driven Design (How to Add Custom Content & Photos)

Because data is decoupled from the user interface, you can customize any category with photos of your child's actual environment without writing JavaScript or HTML.

### Step 1: Add the Photo
Take a photo of your son's actual shoes or toothbrush, and save it in `public/assets/photos/`:
```text
public/assets/photos/my-shoes.jpg
```

### Step 2: Edit the Matching JSON File
Open `public/data/routines.json` (or any other JSON file in `public/data/`):
```json
{
  "id": "shoes",
  "label": {
    "en": "Put on Shoes",
    "fr": "Mettre les chaussures"
  },
  "image": "assets/photos/my-shoes.jpg"
}
```
Refresh the browser. The platform will automatically load his personal photo with bilingual labels and speech synthesis.

---

## 8. Running the Platform Locally & on Tablets

### Starting the Server
1. Open a terminal in the project directory:
   ```bash
   cd ~/soft/autism-learning-platform
   npm start
   ```
2. Open your computer's browser at:
   ```text
   http://localhost:3000
   ```

### Playing on an iPad or Tablet (Home Wi-Fi)
1. Find your computer's local IP address (e.g. by running `ip addr` or checking Wi-Fi settings, e.g. `192.168.1.50`).
2. On your iPad or Android tablet connected to the same Wi-Fi, open Safari or Chrome and navigate to:
   ```text
   http://192.168.1.50:3000
   ```
3. **Full-screen Web App mode:** In Safari, tap the **Share** button ➔ **Add to Home Screen**. When opened from the home screen icon, the platform runs in full-screen mode without browser bars or distractions.

---

## 9. Automated Testing

To verify controller mappings, focus ring traversal, spelling tray selection (such as spelling French word **CHAT** by navigating to `T` and validating), and escape home navigation:

```bash
npm test
```

---

## 10. Iterative Testing Milestones with the Child

Because every child on the autism spectrum has unique sensory profiles and learning paces, test changes iteratively using these four milestones:

### Milestone 1: Receptive Identification & Sensory Baseline
* **Objective:** Verify comfort with the visual palette, sound levels, and tap response.
* **What to observe:**
  - Does the child tolerate the audio chime, or does he prefer muting (`🔇`)?
  - Start with **2 choices** (target + 1 distractor). Does he scan both cards before tapping?
  - Does he show interest in specific categories (e.g. Transport or Animals)?

### Milestone 2: Spatial Concepts & Real-Life Generalization
* **Objective:** Connect on-screen concepts with physical objects.
* **What to observe:**
  - Practice `/spatial.html` (*On / Under*).
  - Mirror the activity in the real room: place his favorite toy *on* the table, then *under* the table.
  - Gauge whether seeing real photos of his own furniture helps comprehension.

### Milestone 3: Routine Steps & Real Schedule Linking
* **Objective:** Reinforce daily self-care routines using `/sequence.html`.
* **What to observe:**
  - Practice the *Brushing Teeth* sequence before bathroom time.
  - Check if ordering the 4 steps digitally helps him anticipate the physical steps in the bathroom.

### Milestone 4: Emerging Phonics & Counting
* **Objective:** Introduce letter-by-letter spelling (`/spelling.html`) and touch-to-count (`/math.html`).
* **What to observe:**
  - Can he associate the letter sound with the letter tile?
  - Does tapping each apple to count aloud (*"1, 2, 3"*) reinforce one-to-one correspondence?

---

## 11. Future Roadmap & Backlog

This document serves as the foundation for future extensions. Potential features to prototype and evaluate:

1. **🎙️ Parent Voice Recording:**
   - Allow parents to record their own voice saying *"Find the shoes"* or *"Mets tes chaussures"* so the child hears a familiar, reassuring voice.
2. **📸 Parent Photo Upload UI:**
   - A simple in-browser admin page (`/parent-admin.html`) where parents can take a photo with the iPad camera and assign it to an item directly.
3. **🎭 Emotions & Social Stories:**
   - Identifying basic facial expressions: Happy, Sad, Tired, Calm, Overwhelmed (*Content, Triste, Fatigué, Calme*).
4. **✋ Tactile Tracing & Fine Motor:**
   - Canvas-based finger tracing for basic shapes and letters with sensory particle trails.
5. **📊 Discrete Trial Progress Tracker (Local Only):**
   - Storing session data locally (number of independent trials vs. prompted trials) to provide objective data for his therapists.
6. **🎵 Calming Sensory Zone:**
   - A low-stimulation calming mode featuring soothing background ambient soundscapes (white noise, rain, gentle harp) with floating shapes.

---

## 📄 License
ISC License. Created with care for personal, educational, and therapeutic use.
