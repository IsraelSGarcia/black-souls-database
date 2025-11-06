# Black Souls Database

A comprehensive browser-based database for exploring game data from the Black Souls series. Currently features complete skill information for Black Souls II with live search, detailed breakdowns, and visual icons.

## Features

### Navigation
- **Multi-level Structure**: Navigate from games → sections → detailed content
- **Breadcrumb Navigation**: Smart back button that returns you to the previous level
- **Section Organization**: Data organized into logical categories (Skills, Items, etc.)

### Skills Database
- **990+ Skills**: Complete skill data from Black Souls II
- **Live Search**: Instant results as you type across names, descriptions, messages, and notes
- **Visual Icons**: Authentic pixel art icons from the game for each skill
- **Detailed Information**: View complete breakdowns including:
  - Basic stats (cost, target, success rate, hit type, speed, etc.)
  - Damage calculations with readable formulas
  - Status effects and buffs/debuffs
  - Battle messages
  - Special notes and conditions

### Data Presentation
- **Automatic Translation**: Japanese text and tags automatically translated to English
- **Show Original**: Toggle to view original Japanese text, raw formulas, or technical data
- **Readable Formulas**: Damage formulas converted from code to human-readable format
- **Smart Filtering**: Placeholder and meaningless data automatically hidden
- **Clean UI**: Modern, dark-themed interface optimized for readability
- **Fully Responsive**: Optimized for all devices - phones, tablets, and desktops
- **Touch-Friendly**: Large tap targets and optimized interactions for mobile devices

## How to Use

Simply open `index.html` in your web browser - no installation or server required!

### Navigation Flow
1. **Select a Game**: Start by choosing Black Souls II
2. **Pick a Section**: Choose what type of data to explore (e.g., Skills)
3. **Browse & Search**: View all items or use the search bar to filter
4. **View Details**: Click any item to see complete information
5. **Toggle Originals**: Use "Show Original" buttons to view raw game data

### Search Tips
- Search works across all text: names, descriptions, messages, and notes
- Results update instantly as you type
- Case-insensitive matching

## File Structure

```
black-souls-ii-database/
├── index.html           # Main application
├── style.css            # Styling
├── script.js            # Application logic
├── data.js              # Processed game data (generated)
├── process-data.js      # Data processing script
├── IconSet.png          # Game icons sprite sheet
├── README.md            # This file
└── original-data/       # Original RPG Maker JSON files
    ├── Skills.json
    ├── System.json
    ├── States.json
    └── Graphics/
        └── System/
            └── IconSet.png
```

## Data Processing

The application processes data from RPG Maker JSON files found in the game directory:

- **Skills.json**: All skill data
- **System.json**: Elements, weapon types, and other system data
- **States.json**: Status effects and their properties
- **IconSet.png**: Sprite sheet containing all game icons

### Regenerating Data

If you have updated game files and want to refresh the database:

```bash
node process-data.js
```

This will:
1. Parse the original JSON files
2. Translate Japanese text and tags
3. Resolve all IDs to readable names
4. Convert formulas to readable format
5. Generate `data.js` for the web application

### Translation System

The data processing script includes a comprehensive automatic translation system that converts Japanese text to English. The system works in multiple stages:

#### 1. **Japanese Character Detection**
   - Automatically detects Hiragana (ひらがな), Katakana (カタカナ), and Kanji (漢字) characters
   - Flags any untranslated content for review

#### 2. **Pattern-Based Translation** (Priority)
   - Regex patterns match and translate game-specific tags and mechanics
   - Examples:
     - `<クールタイム:5>` → "Cooldown: 5 turns"
     - `<使用後追加行動:92,50>` → "After use: 50% chance to cast [Skill Name]"
     - `<HP回復無効:100>` → "HP recovery disabled (100%)"
   - Resolves skill and state IDs to their actual names
   - Handles complex patterns with parameters

#### 3. **Simple Text Replacement**
   - Direct Japanese-to-English mappings for common phrases
   - Handles location names, item names, and common game terms

#### 4. **Automatic Detection & Reporting**
   - Scans all data fields (names, descriptions, messages, notes)
   - Reports untranslated content with:
     - **Completely untranslated**: No translation found at all
     - **Partially untranslated**: Some patterns translated, but Japanese text remains
   - Provides summary statistics after processing

#### Translation Output Example
```
✓ Processed 990 skills
✓ Processed 230 states
✓ Processed 371 weapons
✓ Saved to processed-data.json

📊 Translation Status:
   Skills: 0 with untranslated content
   States: 0 with untranslated content
   Weapons: 37 with untranslated content
```

#### Adding New Translations

To add translations for new Japanese text:

1. **For Pattern-Based Tags**: Add to the `patterns` array in `process-data.js`
   ```javascript
   { regex: /<新パターン:(\d+)>/g, replacement: (m, p1) => `New pattern: ${p1}` }
   ```

2. **For Simple Text**: Add to the `translations` object
   ```javascript
   "日本語テキスト": "English Text"
   ```

3. **Run the script** to see warnings for any remaining untranslated content:
   ```bash
   node process-data.js
   ```

The system will automatically detect and report any remaining Japanese text, making it easy to identify what needs translation.

### ID Reference Resolution System

Many raw notes and fields reference objects by numeric IDs (for example, `State #17`, `Skill #92`, or `(#123)`). The processor replaces these references with their actual names everywhere they appear in visible text.

What it does:
- Detects ID reference patterns in text:
  - `Skill #123`, `State #456`, `Weapon #789`, `Armor #10`, `Item #11`, `Enemy #12`
  - Bracketed forms: `(#123)` or `[#123]`
  - Standalone `#123` when clearly used as a reference
- Resolves IDs to proper names using the game data
- Applies to all visible fields:
  - Names, descriptions, messages, notes
  - Trait and effect descriptions

Logging:
- Each replacement is logged during processing, e.g.:
  - `🔎 IDRef resolved in state 170 [trait]`
  - `🔎 IDRef resolved in skill 92 [note]`
- If a suspicious `#123`-style reference remains that couldn’t be resolved, a warning is emitted:
  - `🟨 IDRef unresolved in item 55 [effect]: "(#123)..."`

Summary:
After processing, a summary is shown:
```
🔎 ID Reference Resolution:
   Total replacements: <number>
   By type:
     Skills: <number>
     States: <number>
     Weapons: <number>
     Armors: <number>
     Enemies: <number>
     Items: <number>
   Unresolved references detected: <number>
```

Extending:
- The resolver supports all core object types (skills, states, weapons, armors, items, enemies).
- If you introduce new types or custom patterns, add resolvers and detection patterns in `process-data.js`.

## Technical Details

- **Pure Client-Side**: No server required, runs entirely in the browser
- **Vanilla JavaScript**: No frameworks or dependencies
- **Modern CSS**: Responsive design with CSS Grid and Flexbox
- **Icon Sprites**: Efficient CSS sprite system for game icons
- **JSON Data**: Structured data format for easy updates
- **Mobile-First**: Comprehensive responsive design with breakpoints for all device sizes
  - Desktop (1024px+): Two-column layout with side-by-side list and detail panels
  - Tablet (768px-1024px): Single-column layout with centered content
  - Mobile (320px-768px): Optimized compact layout with touch-friendly controls
  - Landscape Mode: Smart layout adjustments to maximize screen space
- **Accessibility**: Minimum 44px touch targets, proper contrast, and readable text sizes

## Credits

Black Souls II is created by Eeny, meeny, miny, moe? (えにみに？).

This database is an unofficial fan-made tool for exploring game data.

## License

MIT License - Free to modify and share!
