# DOOM Visual Design Language Research
## For ASCII Art Generator Web App

**Research Date**: 2026-02-10
**Status**: Complete

---

## 1. DOOM Logo Analysis

### Designer & History
The original DOOM logo was designed by **Don Ivan Punchatz** for id Software in 1993. The logo has become one of the most recognizable in gaming history and has evolved across five major iterations.

### Core Design Elements

**Split-Perspective Typography**
The defining characteristic of the DOOM logo is its "split-perspective" technique. Each letter appears carved from metal or stone, with the left and right halves angled differently to create dimensional depth. This gives every character a sense of physical presence, as if each letter were a massive 3D object viewed from slightly different angles simultaneously.

**Aggressive Angular Forms**
- Extra-bold capital lettering with sharp, angular lines
- Diagonal cuts on the lower portions of each letter, creating pointed bases
- Letters resemble predatory animal teeth -- sharp, jagged, dangerous
- The overall silhouette suggests a gateway or portal (thematically appropriate)

**3D Beveling & Metallic Texture**
- Deep beveling on letter edges creates a sense of carved or forged metal
- The original (1993) featured a micro-chip/circuit-board maze-like pattern in the upper portions
- Gold/bronze tones on the bottom halves with blue-grey on the top
- Thin smooth frame outlines around each letter
- Modern versions (2016+) show brushed metal with scratches, burns, and battle damage
- DOOM Eternal (2020) introduced complex texture layering with varied wear patterns

**Color Evolution**
| Era | Top Colors | Bottom Colors | Background |
|-----|-----------|---------------|------------|
| 1993 Original | Blue, Grey (#BAC7C4) | Gold, Yellow, Orange | Bloody Red (#880C0E) |
| 2004 DOOM 3 | Smoother metallic gradients | Warmer metallic tones | Dark atmospheric |
| 2016 Reboot | Reinforced steel grey | Hot orange/red underglow | Near-black |
| 2020 Eternal | Complex metallic layering | Ember/fire undertones | Deep space black |
| Modern Flat | Black (#000000) | Black | White (#FFFFFF) |

### The "AmazDooM" Font
A fan-created typeface called **AmazDooM** (by Amazingmax, 2009) replicates the DOOM logo typography. It is free for personal and commercial use, and includes Regular, Bold, Italic, Outline, and Pixel variants. Available on dafont.com.

### Key Takeaways for ASCII Art Generator
- The split-angle perspective is THE defining visual signature
- Letters must feel massive, heavy, and physically present
- Sharp angular bases (pointed/jagged bottoms) are essential
- Metallic gradients (cool top, warm bottom) are iconic
- Battle damage / worn texture adds authenticity

---

## 2. DOOM UI/UX Patterns

### Classic DOOM HUD (1993)
- **Status bar** fixed to the bottom of the screen
- **Doomguy face** centered in the status bar (reactive to damage/health)
- **Health** displayed on the left in large numerals
- **Ammo** displayed on the right in large numerals
- **Armor** and **Arms** indicators flanking the face
- **Red text messages** in the upper-left corner for pickups/events
- **Small yellow font** for secondary messages
- Pixel font aesthetic -- chunky, no anti-aliasing, high contrast

### DOOM 2016 UI
- Ultra-minimalist HUD overlay (health left, ammo right)
- Clean geometric sans-serif font (identified as similar to **Michroma Regular** or **Eurostile/Microgramma**)
- Glowing holographic UI elements
- Blue-white for standard UI, red for damage indicators
- Menu screens use a dark background with bright accent text
- Strong use of horizontal rules and geometric dividers

### DOOM Eternal UI
- Six selectable color schemes:
  - **Default**: Green and Orange
  - **Demons**: Blue and Purple
  - **Exterminator**: All Red
  - **Amber**: Warm golden tones
  - **Sentinel**: Cool steel tones
  - **UAC**: Corporate blue-white
- 20+ HUD customization options
- Scalable text and elements
- Three colorblind modes (protanopia, tritanopia, deuteranopia)

### DOOM Eternal UI Hex Colors (Dashboard Palette)
```
#cb5e29  -- Burnt Orange (primary accent)
#f3ba81  -- Light Peach/Sand (secondary highlight)
#692f17  -- Deep Maroon (dark accent)
#95a94e  -- Olive Green (health/status)
#8b4c0d  -- Saddle Brown (tertiary)
#4c3b39  -- Dark Warm Grey (background elements)
```

### Menu Design Patterns
- Dark, nearly black backgrounds
- Single bright accent color for selected items
- Horizontal navigation bars
- Large, bold typography for menu items
- Subtle glow/bloom effects on selected elements
- Geometric borders and dividers (thin lines, not ornate)
- Sound design reinforces every interaction (not visual but part of "feel")

### Key Takeaways for ASCII Art Generator
- Dark backgrounds are non-negotiable (#0a0a0a to #1a1a1a range)
- Use a single bright accent color (red or orange) against darkness
- Typography should be bold, geometric, sans-serif in the UI (not the generator output)
- Minimalist layout with generous spacing
- Glow effects on interactive elements
- Horizontal rules and geometric dividers for structure

---

## 3. DOOM Color Palette -- Complete Reference

### Brand Colors (Official)
```
Light Grey:   #E8E8E8
Medium Grey:  #BAC7C4
White:        #FFFFFF
Dark Red:     #880C0E
```

### DOOM Slayer Palette (Concept Art Derived)
```
Olive Tan:    #716A4E  -- Armor/environment
Dark Brown:   #4E3B35  -- Shadow/leather
Warm Brown:   #6C4B36  -- Terrain/wood
Burnt Orange: #B45E33  -- Fire/accent
Dark Teal:    #1C3B33  -- Visor/tech accent
```

### PLAYPAL -- Original DOOM 256-Color Game Palette

The complete PLAYPAL palette contains 249 unique colors. Here are the most important color groups for capturing the DOOM aesthetic:

**Reds (Blood, Damage, Hell)**
```
#ff0000  -- Pure Red (damage flash)
#ef0000  -- Bright Red
#e30000
#d70000
#cb0000
#bf0000
#b30000
#a70000
#9b0000
#8b0000
#7f0000
#730000
#670000
#5b0000  -- Darkest Red
```

**Red Tints (Skin, Blood Spray)**
```
#ffb7b7  -- Lightest Pink
#f7abab
#f3a3a3
#eb9797
#e78f8f
#df8787
#db7b7b
#d37373
#cb6b6b
#c76363
#bf5b5b
#bb5757
#b34f4f
#af4747
#a73f3f
#a33b3b
#9b3333
#972f2f
#8f2b2b
#8b2323
#831f1f
#7f1b1b
#771717
#731313
#6b0f0f
#670b0b
#5f0707
#5b0707
#530707
#4f0000
#470000
#430000
```

**Oranges & Yellows (Fire, Explosions, Plasma)**
```
#ffff73  -- Bright Yellow
#ebdb57
#d7bb43
#c39b2f
#af7b1f
#9b5b13
#874307
#732b00  -- Deep Orange-Brown
#ff9f43  -- Bright Orange
#ffe74b  -- Gold Yellow
#ffff00  -- Pure Yellow
```

**Fire/Warm Gradient (Key DOOM Gradient)**
```
#ffebdf  -- Lightest warm
#ffdbc7
#ffc7a7
#ffbb93
#ffb383
#f7ab7b
#efa373
#e79b6b
#df9363
#d78b5b
#cf8353
#cb7f4f
#bf7b4b
#b37347
#ab6f43
#a36b3f
#9b633b
#8f5f37
#875733
#7f532f
#774f2b
#6b4727
#5f4323
#533f1f
#4b371b
#3f2f17
#332b13
#2b230f  -- Darkest warm
```

**Greens (Radiation, Armor, Tech)**
```
#77ff6f  -- Brightest Green
#6fef67
#67df5f
#5fcf57
#5bbf4f
#53af47
#4b9f3f
#439337
#3f832f
#37732b
#2f6323
#27531b
#1f4317
#17330f
#13230b
#0b1707  -- Darkest Green
```

**Blues (Tech, UAC, Plasma)**
```
#e7e7ff  -- Lightest Blue
#c7c7ff
#ababff
#8f8fff
#7373ff
#5353ff
#3737ff
#1b1bff
#0000ff  -- Pure Blue
#0000e3
#0000cb
#0000b3
#00009b
#000083
#00006b
#000053  -- Darkest Blue
```

**Greys (Metal, Concrete, Tech)**
```
#efefef  -- Near White
#e7e7e7
#dfdfdf
#dbdbdb
#d3d3d3
#cbcbcb
#c7c7c7
#bfbfbf
#b7b7b7
#b3b3b3
#ababab
#a7a7a7
#9f9f9f
#979797
#939393
#8b8b8b
#838383
#7f7f7f  -- Mid Grey
#777777
#6f6f6f
#6b6b6b
#636363
#5b5b5b
#575757
#4f4f4f
#474747
#434343
#3b3b3b
#373737
#2f2f2f
#272727
#232323  -- Near Black
```

**Dark Foundation Colors**
```
#000000  -- Pure Black
#070707
#0b0b0b
#131313
#1b1b1b
#1f170b  -- Dark Warm Brown
#170f07  -- Darkest Brown
```

### Palette Tint Effects (PLAYPAL Variants)
DOOM uses 14 complete palette variants stored in PLAYPAL:
- **Palette 0**: Normal rendering
- **Palettes 1-8**: Progressive red tint (damage indicator) -- increasingly saturated red overlay
- **Palette 9**: Yellow tint (item pickup flash)
- **Palettes 10-11**: Green tint (radiation suit)
- **Palette 12**: Bright green (radiation suit at full)
- **Palette 13**: Berserk red (intense red shift)

### Recommended Web App Color System
Based on all research, here is a curated palette for the DOOM ASCII art generator:

```css
:root {
  /* Backgrounds */
  --bg-primary:     #0a0a0a;    /* Near-black, main background */
  --bg-secondary:   #131313;    /* Slightly lighter panels */
  --bg-tertiary:    #1b1b1b;    /* Card/elevated surfaces */
  --bg-surface:     #232323;    /* Input fields, code blocks */

  /* DOOM Reds */
  --red-bright:     #ff0000;    /* Pure DOOM red, sparingly */
  --red-primary:    #cb0000;    /* Primary red accent */
  --red-dark:       #880C0E;    /* Official brand dark red */
  --red-glow:       #ff3f3f;    /* Glow/hover state red */
  --red-muted:      #8b2323;    /* Subtle red for borders */

  /* DOOM Fire/Orange (Key Gradient) */
  --fire-bright:    #ff9f43;    /* Bright flame */
  --fire-primary:   #cb5e29;    /* Primary orange */
  --fire-dark:      #874307;    /* Deep ember */
  --fire-glow:      #ffbb93;    /* Orange glow */

  /* DOOM Yellows */
  --yellow-bright:  #ffff00;    /* Item pickup flash */
  --yellow-primary: #ebdb57;    /* Standard yellow */
  --yellow-muted:   #c39b2f;    /* Muted gold */

  /* DOOM Greens */
  --green-bright:   #77ff6f;    /* Radiation suit */
  --green-primary:  #53af47;    /* Health/status */
  --green-dark:     #2f6323;    /* Dark status */

  /* DOOM Blues */
  --blue-bright:    #5353ff;    /* Plasma/tech */
  --blue-primary:   #0000cb;    /* UAC blue */
  --blue-dark:      #000053;    /* Deep tech */

  /* Text & Neutrals */
  --text-primary:   #efefef;    /* Main text */
  --text-secondary: #b3b3b3;    /* Secondary text */
  --text-muted:     #6b6b6b;    /* Disabled/tertiary */
  --text-dark:      #4b4b4b;    /* Very subtle text */

  /* Metal Gradients (for decorative elements) */
  --metal-light:    #BAC7C4;    /* Brand grey, cool metal */
  --metal-mid:      #7f7f7f;    /* Mid metal */
  --metal-dark:     #3b3b3b;    /* Dark metal */
  --metal-warm:     #6C4B36;    /* Warm rusty metal */
}
```

---

## 4. ASCII Art -- DOOM Aesthetic Techniques

### The FIGlet "Doom" Font
Created by **Frans P. de Vries** in 1996, based on Glenn Chappell's "Big" font. This is the standard ASCII text font named "Doom" used by figlet/toilet tools. It uses standard ASCII characters to create block-letter text.

**Characters used in DOOM-style ASCII art:**
```
Primary structure:  | / \ _ -
Block fills:        # @ = %
Decorative:         * + . : ;
Shadow/depth:       . , ' ` ~
Borders:            [ ] { } ( )
Special fills:      $ & ! ?
```

### Key Techniques for DOOM-Aesthetic ASCII Art

**1. Heavy Block Letters**
Use dense fill characters (#, @, M, W) for the body of letters. These create maximum visual weight matching DOOM's bold typography.

**2. Sharp Angular Edges**
Use / and \ for diagonal cuts at letter bases. This mirrors the pointed/jagged bottoms of the actual DOOM logo letters.

**3. Dripping/Melting Effect**
Extend characters below the baseline using combinations:
```
    |
    :
    .
```
Or for more dramatic dripping:
```
    #
    |
    :
    ;
    .
```

**4. 3D Beveling Simulation**
Create depth by using lighter characters adjacent to heavier ones:
```
  /######\
 /########\
|##########|
|##.::::.##|     (inner bevel using lighter chars)
|##########|
 \########/
  \######/
```

**5. Metal Texture Fills**
Instead of solid fills, use alternating characters to suggest texture:
```
#=#=#=#=#=
=#=#=#=#=#
#=#=#=#=#=
```
Or circuit-board patterns:
```
+-+-+-+-+
|.|.|.|.|
+-+-+-+-+
```

**6. Damage/Distress Effect**
Randomly replace fill characters with spaces or lighter characters:
```
####  ##
# ## ###
## # # #
###  ###
```

**7. Flame Effect Below Text**
```
 ####  ####
  (    (
   )  )
  (  (
   ) )
    (
```

### Example DOOM-Style ASCII Logo Approaches

**Heavy Block Style:**
```
 ######   ######   ######  ##     ##
 ##   ##  ##   ##  ##   ## ###   ###
 ##    ## ##    ## ##    ## #### ####
 ##    ## ##    ## ##    ## ## ### ##
 ##    ## ##    ## ##    ## ##  #  ##
 ##   ##  ##   ##  ##   ## ##     ##
 ######   ######   ######  ##     ##
```

**Angular/Pointed Style (more DOOM-like):**
```
 /\##/\   /\##/\   /\##/\  /\#\ /\#\
|  ##  | |  ##  | |  ##  | | ## ## # |
|  ##  | |  ##  | |  ##  | | # ## #  |
|  ##  | |  ##  | |  ##  | | #    #  |
 \/##\/   \/##\/   \/##\/   \/#\/\#/
   \/       \/       \/       \/  \/
```

### Existing DOOM ASCII Art Resources
- **ascii.co.uk/art/doom** -- Collection of DOOM ASCII art including HUD recreations
- **emojicombos.com/doom-ascii-art** -- Copy-paste DOOM text art
- **textartcopy.com/ascii-doom.html** -- 30+ DOOM ASCII examples
- **gamers.org/~fpv/doombann.html** -- Historical overview of DOOM ASCII banners from the 1990s BBS era
- **github.com/wojciech-graj/doom-ascii** -- Full DOOM game rendered in terminal ASCII
- **patorjk.com/software/taag/** -- Text to ASCII Art Generator with "Doom" font option

---

## 5. Similar Themed Generators & Tools

### DOOM-Specific Generators
| Tool | URL | Features |
|------|-----|----------|
| **FontMeme DOOM Generator** | fontmeme.com/doom-font/ | Text to image in DOOM font |
| **Pixelframe DOOM Generator** | pixelframe.design/doom/ | Full logo generator with hellish background |
| **TextStudio DOOM Effect** | textstudio.com/logo/doom-font-1995 | Fiery/gory DOOM text effects |
| **FontBolt DOOM Generator** | fontbolt.com/font/doom-font/ | Free DOOM font image generation |
| **CoolText DOOM Logo** | cooltext.com | Online since 1998, includes DOOM template |
| **eev.ee DOOM Text Generator** | c.eev.ee/doom-text-generator/ | Advanced: loads WAD fonts, custom colors, ACS escapes, BBCode, bulk generation |
| **Topster ASCII/DOOM** | topster.net/text-to-ascii/doom.html | ASCII text in DOOM figlet font |
| **TextEffectStudio DOOM** | texteffectstudio.com/font-generator/doom | Dark apocalyptic text generation |

### Metal/Horror Logo Generators
| Tool | URL | Style |
|------|-----|-------|
| **Design Iconic Metal Logo Maker** | designiconic.com/maker/metal-logo/ | Death/black/doom metal band logos |
| **Font.st Metal Typography** | fontst.com/metal-typography/ | Heavy/death metal font generation |

### What the Best Generators Do Well
- **Pixelframe**: Renders text on an actual DOOM 2016 hell background with distressed metallic texture
- **eev.ee**: Most technically advanced; supports real DOOM WAD fonts, color translation tables, and ZDoom compatibility
- **CoolText**: Simple but effective glow and bevel effects
- **Design Iconic**: Creates illegible-but-atmospheric metal logos (useful for extreme styling)

### Differentiator Opportunity for Your App
None of the existing tools combine:
1. DOOM-aesthetic UI design (they all use generic web UI)
2. ASCII art output (they generate images, not text)
3. Interactive real-time preview
4. Multiple DOOM-themed ASCII art styles
5. Customizable color rendering in the terminal/web preview

---

## 6. Metal/Horror Typography Analysis

### Font Families That Capture the DOOM Aesthetic

**For the DOOM Logo Recreation (Display/Headline Use)**
- **AmazDooM** -- Direct DOOM logo recreation, free (dafont.com/amazdoom.font)
- **Metal Mania** (Google Fonts) -- Heavy metal album cover style, sharp borders
- **Nosifer** (Google Fonts) -- Bold, aggressive, blood-drip decoration
- **Butcherman** (Google Fonts) -- Horror/metal decorative face

**For DOOM UI Text (Body/Interface Use)**
- **Michroma** (Google Fonts) -- Identified as similar to DOOM 2016 UI font
- **Eurostile** -- Classic tech/sci-fi sans-serif, similar to DOOM UI
- **Microgramma** -- Geometric extended sans-serif, DOOM UI adjacent
- **Orbitron** (Google Fonts) -- Geometric/futuristic, DOOM-adjacent
- **Rajdhani** (Google Fonts) -- Clean technical with slight sharpness
- **Share Tech Mono** (Google Fonts) -- Terminal/monospace with tech feel

**For ASCII Art Display (Monospace Required)**
- **Fira Code** -- Ligatures for special character combinations
- **JetBrains Mono** -- Excellent character distinction
- **IBM Plex Mono** -- Clean with industrial feel
- **Cascadia Code** -- Modern monospace with ligatures
- **Source Code Pro** -- Clear character rendering at all sizes

### Typography Characteristics That Create the DOOM Feel
1. **Weight**: Ultra-bold / Black weight -- visual heaviness is essential
2. **Angles**: Sharp terminals and diagonal cuts (not rounded)
3. **Spacing**: Tight tracking (letters close together = intensity)
4. **Case**: ALL CAPS -- universally used in DOOM branding
5. **Texture**: Distressed, worn, battle-damaged surface treatment
6. **Dimension**: Beveled/embossed appearance through shadows
7. **Color**: Hot-to-cool gradient (orange bottom to steel-grey top)

### Metal Typography Sub-Genres Relevant to DOOM
| Style | Characteristics | DOOM Relevance |
|-------|----------------|----------------|
| **Thrash Metal** | Angular, sharp, aggressive but readable | High -- DOOM is readable aggression |
| **Death Metal** | Organic, dripping, illegible tangles | Medium -- dripping effects only |
| **Black Metal** | Spiky, thorny, runic elements | Low -- too ornate for DOOM |
| **Industrial Metal** | Geometric, technical, clean aggression | High -- matches DOOM tech aesthetic |
| **Doom Metal** (the genre) | Heavy, slow, monolithic letterforms | Medium -- weight matches, style differs |

### Translating to ASCII Art
The metal/horror typography translates to ASCII through:
- **Weight** --> Dense character fills (#, @, M, W, X)
- **Sharp angles** --> Diagonal characters (/, \, <, >, ^, V)
- **Dripping** --> Descending character sequences (|, :, ;, .)
- **Texture** --> Mixed character fills (#=, @*, %&)
- **Damage** --> Random spaces/lighter chars within heavy fills
- **Glow** --> Lighter characters surrounding the main form (., -, ~)

---

## 7. Professional Design References

### Game UI Databases (Screenshot Archives)
- **gameuidatabase.com/gameData.php?id=37** -- DOOM 2016 complete UI screenshots
- **gameuidatabase.com/gameData.php?id=196** -- DOOM Eternal complete UI screenshots
- **interfaceingame.com/games/doom/** -- DOOM 2016 interface gallery
- **interfaceingame.com/games/doom-eternal/** -- DOOM Eternal interface gallery

### Design System References for Dark/Metal Gaming Aesthetic
- **Green Mist UI 2.0** (Figma Community) -- Dark theme UI kit with metal/matrix aesthetic, 20 free components
- **Dark Theme Dashboard UI Kit** (Figma Community) -- Complete design system with typography and colors
- **Doom Emacs Themes** (github.com/doomemacs/themes) -- 80+ programmatic dark themes inspired by DOOM aesthetic

### Doom Emacs "One" Theme Palette (Useful Dark UI Reference)
```
Background:     #282c34
Background Alt: #21242b
Foreground:     #bbc2cf
Red:            #ff6c6b
Orange:         #da8548
Yellow:         #ECBE7B
Green:          #98be65
Teal:           #4db5bd
Blue:           #51afef
Magenta:        #c678dd
Violet:         #a9a1e1
Cyan:           #46D9FF
```

### CSS Implementation References
- **CRTFilter WebGL** (cssscript.com) -- Retro CRT screen effects for web
- **Retro-Futuristic UI Design** (github.com/Imetomi/retro-futuristic-ui-design) -- Web-based retro effects
- **FreeFrontend CSS Glow Effects** (freefrontend.com/css-glow-effects/) -- 61 CSS glow examples
- **CSS Glitch Effects** (subframe.com/tips/css-glitch-effect-examples) -- 10 glitch effect examples

### Key CSS Techniques for DOOM Aesthetic

**Red Glow Text Effect:**
```css
.doom-text {
  color: #ff3f3f;
  text-shadow:
    0 0 7px #ff0000,
    0 0 10px #ff0000,
    0 0 21px #ff0000,
    0 0 42px #cb0000,
    0 0 82px #cb0000,
    0 0 92px #880C0E;
}
```

**Scanline Overlay:**
```css
.scanlines::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 10;
}
```

**Metal Gradient Text:**
```css
.metal-text {
  background: linear-gradient(
    180deg,
    #BAC7C4 0%,
    #7f7f7f 30%,
    #3b3b3b 50%,
    #cb5e29 70%,
    #874307 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));
}
```

**Vignette Effect:**
```css
.vignette::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    transparent 60%,
    rgba(0, 0, 0, 0.6) 100%
  );
  pointer-events: none;
}
```

**Damage Flash Animation:**
```css
@keyframes damage-flash {
  0% { background-color: rgba(255, 0, 0, 0.3); }
  100% { background-color: transparent; }
}
```

---

## 8. Synthesis -- Design System for DOOM ASCII Art Generator

### Visual Identity Pillars
1. **Aggressive Darkness** -- Near-black backgrounds, minimal light surfaces
2. **Infernal Warmth** -- Red and orange accents against cold steel
3. **Industrial Weight** -- Heavy typography, dense visual elements
4. **Battle-Worn Texture** -- Distressed, scratched, damaged surfaces
5. **Technical Precision** -- Clean geometric layout despite aggressive aesthetic

### Recommended Design Decisions

**Layout:**
- Single-page application, no page transitions
- Dark background (#0a0a0a) with subtle noise texture
- Content centered with max-width ~1200px
- ASCII preview area as the hero/focal element
- Controls below or in a sidebar panel
- Vignette effect on the overall page

**Typography Stack:**
- Headlines: AmazDooM or Metal Mania (display)
- UI Text: Michroma or Rajdhani (interface)
- ASCII Output: JetBrains Mono or Fira Code (monospace)
- Fallback: system-ui for performance

**Color Application:**
- Background: #0a0a0a to #131313
- Primary accent: #cb0000 (DOOM dark red)
- Secondary accent: #cb5e29 (DOOM fire orange)
- Interactive hover: #ff3f3f with red glow
- Text: #efefef (primary), #b3b3b3 (secondary)
- Borders: #2f2f2f default, #880C0E for emphasis
- Success/status: #53af47 (DOOM green)
- Warning: #ebdb57 (DOOM yellow)
- Info/tech: #5353ff (DOOM blue)

**Effects:**
- Red glow on hover states (text-shadow with multiple layers)
- Subtle scanline overlay on the ASCII preview area
- Vignette on the page edges
- Optional CRT curvature effect on preview
- Damage flash animation for error states
- Metal gradient on the app title/logo

**Sound (Optional Enhancement):**
- Consider subtle UI sounds on interactions (DOOM menu sound effects)
- Typing sounds during text generation

### ASCII Art Generation Modes to Offer
1. **Block Style** -- Heavy fills, DOOM-weight letters
2. **Angular Style** -- Sharp edges and pointed bases
3. **Dripping Style** -- Melting/blood-drip extensions
4. **Metal Style** -- Textured fills simulating brushed metal
5. **Flame Style** -- Fire effects below and around text
6. **Distressed Style** -- Random damage/wear patterns
7. **Classic FIGlet** -- The standard "Doom" figlet font

---

## Sources

### Logo & Brand Design
- [The Doom Logo History, Colors, Font, And Meaning](https://www.designyourway.net/blog/doom-logo/)
- [Doom Logo, Symbol, Meaning, History](https://logos-world.net/doom-logo/)
- [DOOM Logo History and Evolution](https://fabrikbrands.com/branding-matters/logofile/doom-logo-history-and-evolution/)
- [Doom Logo and Symbol, Meaning, History](https://1000logos.net/doom-logo/)
- [DoomWiki - Logo](https://doomwiki.org/wiki/Logo)
- [Doom Logo: Unveiling the Power](https://thermometerarts.com/doom-logo/)

### Color & Palette
- [DOOM Color Codes - Brand Palettes](https://brandpalettes.com/doom-color-codes/)
- [Doom Slayer Color Palette](https://www.color-hex.com/color-palette/78971)
- [DOOM Eternal UI Palette](https://colorswall.com/palette/52735)
- [PLAYPAL - Lospec](https://lospec.com/palette-list/playpal)
- [How DOOM Renders Colors](https://www.ryanthomson.net/articles/how-doom-renders-colors/)
- [PLAYPAL - DoomWiki](https://doomwiki.org/wiki/PLAYPAL)

### UI/UX Design
- [Game UI Database - DOOM 2016](https://www.gameuidatabase.com/gameData.php?id=37)
- [Game UI Database - DOOM Eternal](https://www.gameuidatabase.com/gameData.php?id=196)
- [DOOM Interface In Game](https://interfaceingame.com/games/doom/)
- [DOOM Eternal Interface In Game](https://interfaceingame.com/games/doom-eternal/)
- [DOOM Eternal Custom HUDs](https://slayersclub.bethesda.net/en/article/2V0erykuLGuV8a8GsmribP/doom-eternal-custom-huds)

### Fonts & Typography
- [AmazDooM Font - dafont.com](https://www.dafont.com/amazdoom.font)
- [DOOM Font Generator - FontMeme](https://fontmeme.com/doom-font/)
- [Death Metal Fonts - Just Creative](https://justcreative.com/death-metal-fonts/)
- [Heavy Metal Fonts](https://www.kseniiakrasilich.com/squarespace-help/best-heavy-metal-fonts)

### ASCII Art
- [DOOM ASCII Art Collection](https://ascii.co.uk/art/doom)
- [DOOM ASCII Banners Overview](https://www.gamers.org/~fpv/doombann.html)
- [The DOOM FIGlet Font](https://www.gamers.org/~fpv/doomfont.html)
- [doom-ascii Terminal Game](https://github.com/wojciech-graj/doom-ascii)
- [Text to ASCII Art Generator (TAAG)](https://patorjk.com/software/taag/)

### Generators & Tools
- [Pixelframe DOOM Logo Generator](https://pixelframe.design/doom/)
- [eev.ee DOOM Text Generator](https://c.eev.ee/doom-text-generator/)
- [TextStudio DOOM Effect](https://www.textstudio.com/logo/doom-font-1995)
- [Design Iconic Metal Logo Maker](https://designiconic.com/maker/metal-logo/)

### CSS & Web Implementation
- [CRTFilter WebGL](https://www.cssscript.com/retro-crt-filter-webgl/)
- [Retro-Futuristic UI Design](https://github.com/Imetomi/retro-futuristic-ui-design)
- [CSS Glow Effects Collection](https://freefrontend.com/css-glow-effects/)
- [CSS Glitch Effects](https://www.subframe.com/tips/css-glitch-effect-examples)
- [Doom Emacs Themes](https://github.com/doomemacs/themes)
