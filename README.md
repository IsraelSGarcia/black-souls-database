# Black Souls Database

A comprehensive browser-based database for exploring game data from the Black Souls series. Currently features complete data for Black Souls II including skills, states, weapons, armors, enemies, and items with live search, detailed breakdowns, and visual icons.

## Features

### Navigation
- **Multi-level Structure**: Navigate from games → sections → detailed content
- **Breadcrumb Navigation**: Smart back button that returns you to the previous level
- **Section Organization**: Data organized into logical categories (Skills, States, Weapons, Armors, Enemies, Items)

### Comprehensive Database
- **990+ Skills**: Complete skill data with damage formulas, effects, and conditions
- **230+ States**: Status effects, buffs, and debuffs with detailed properties
- **371+ Weapons**: Weapon data with stats and special properties
- **Armors**: Armor and defensive equipment information
- **Enemies**: Enemy data and statistics
- **Items**: Consumable items and equipment

### Search & Discovery
- **Live Search**: Instant results as you type across names, descriptions, messages, and notes
- **Multi-field Search**: Search works across all text fields simultaneously
- **Case-insensitive**: Find results regardless of capitalization

### Data Presentation
- **Automatic Translation**: Japanese text and tags automatically translated to English
- **Show Original**: Toggle to view original Japanese text, raw formulas, or technical data
- **Readable Formulas**: Damage formulas converted from code to human-readable format
- **ID Resolution**: All ID references automatically resolved to readable names
- **Smart Filtering**: Placeholder and meaningless data automatically hidden
- **Visual Icons**: Authentic pixel art icons from the game for each item
- **Clean UI**: Modern, dark-themed interface optimized for readability
- **Fully Responsive**: Optimized for all devices - phones, tablets, and desktops
- **Touch-Friendly**: Large tap targets and optimized interactions for mobile devices

## How to Use

Simply open `app/index.html` in your web browser - no installation or server required!

### Navigation Flow
1. **Select a Game**: Start by choosing Black Souls II
2. **Pick a Section**: Choose what type of data to explore (Skills, States, Weapons, etc.)
3. **Browse & Search**: View all items or use the search bar to filter
4. **View Details**: Click any item to see complete information
5. **Toggle Originals**: Use "Show Original" buttons to view raw game data

### Search Tips
- Search works across all text: names, descriptions, messages, and notes
- Results update instantly as you type
- Case-insensitive matching

## Project Structure

```
black-souls-database/
├── app/                          # Main application directory
│   ├── index.html               # Main application
│   ├── style.css                # Styling
│   ├── script.js                # Application logic
│   ├── data.js                  # Processed game data (generated)
│   ├── processed-data.json      # Processed data in JSON format
│   ├── process-data.js          # MV data processing script
│   ├── process-vx-ace-data.js   # VX Ace data processing script
│   ├── extract-scripts.js       # Script extraction utility
│   ├── IconSet.png              # Game icons sprite sheet
│   ├── package.json             # Node.js dependencies
│   └── Battlers/                # Enemy battler images
├── docs/                         # Documentation
│   ├── Data_Analysis_Methodology.md      # How data is extracted and verified
│   ├── Data_Certainty_Analysis.md        # What data is certain vs inferred
│   ├── Source_Verification_System.md     # Source verification system
│   └── Verified_Mappings_With_Sources.md # Verified data mappings
├── original-data/                # Original game data files
│   ├── vx-ace/                  # RPG Maker VX Ace data (.rvdata2 files)
│   │   ├── json-converted/      # Converted JSON files
│   │   └── Maps/                # Map data files
│   ├── mv-converted/            # RPG Maker MV converted data
│   │   ├── Skills.json
│   │   ├── System.json
│   │   ├── States.json
│   │   └── Maps/                # Map data files
│   └── screenshots/             # Editor screenshots for verification
└── README.md                     # This file
```

## Data Processing

The application processes data from RPG Maker VX Ace and MV game files. The data processing pipeline includes:

### Data Sources
- **VX Ace Files** (`.rvdata2`): Original game data in Ruby Marshal format
- **MV Files** (JSON): Converted/processed game data
- **System.json**: Elements, weapon types, and other system data
- **Skills.json**: All skill data
- **States.json**: Status effects and their properties
- **Weapons.json, Armors.json, Items.json, Enemies.json**: Equipment and entity data
- **IconSet.png**: Sprite sheet containing all game icons

### Processing Scripts

#### Processing MV Data
```bash
cd app
npm run process-data
# or
node process-data.js
```

This will:
1. Parse the original JSON files from `original-data/mv-converted/`
2. Translate Japanese text and tags to English
3. Resolve all IDs to readable names
4. Convert formulas to readable format
5. Generate `processed-data.json` and `data.js` for the web application

#### Processing VX Ace Data
```bash
cd app
npm run process-vx-ace-data
# or
node process-vx-ace-data.js
```

This will:
1. Convert `.rvdata2` binary files to JSON using Ruby Marshal parser
2. Process and normalize data structures
3. Extract and decompress scripts from `Scripts.rvdata2`
4. Save converted files to `original-data/vx-ace/json-converted/`

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
   cd app
   node process-data.js
   ```

The system will automatically detect and report any remaining Japanese text, making it easy to identify what needs translation.

### ID Reference Resolution System

Many raw notes and fields reference objects by numeric IDs (for example, `State #17`, `Skill #92`, or `(#123)`). The processor replaces these references with their actual names everywhere they appear in visible text.

**What it does:**
- Detects ID reference patterns in text:
  - `Skill #123`, `State #456`, `Weapon #789`, `Armor #10`, `Item #11`, `Enemy #12`
  - Bracketed forms: `(#123)` or `[#123]`
  - Standalone `#123` when clearly used as a reference
- Resolves IDs to proper names using the game data
- Applies to all visible fields:
  - Names, descriptions, messages, notes
  - Trait and effect descriptions

**Logging:**
- Each replacement is logged during processing, e.g.:
  - `🔎 IDRef resolved in state 170 [trait]`
  - `🔎 IDRef resolved in skill 92 [note]`
- If a suspicious `#123`-style reference remains that couldn't be resolved, a warning is emitted:
  - `🟨 IDRef unresolved in item 55 [effect]: "(#123)..."`

**Summary:**
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

**Extending:**
- The resolver supports all core object types (skills, states, weapons, armors, items, enemies).
- If you introduce new types or custom patterns, add resolvers and detection patterns in `process-data.js`.

## Data Verification & Methodology

This project follows a rigorous methodology for extracting and verifying game data. All data mappings are verified against multiple sources to ensure accuracy.

### Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Data Analysis Methodology](docs/Data_Analysis_Methodology.md)**: Systematic approach to extracting factual information from game data files, distinguishing between confirmed facts and inferences
- **[Data Certainty Analysis](docs/Data_Certainty_Analysis.md)**: Analysis of what data is certain (directly from source files) versus what is inferred or processed
- **[Source Verification System](docs/Source_Verification_System.md)**: System that challenges all mappings and requires documented sources for everything
- **[Verified Mappings](docs/Verified_Mappings_With_Sources.md)**: Complete list of verified data mappings with their sources

### Core Principles

1. **Facts Over Inferences**: Always distinguish between:
   - **Facts**: Information directly present in data files, editor interfaces, or documented engine specifications
   - **Inferences**: Logical conclusions that may be correct but are not directly confirmed
   - **Guesses**: Assumptions without evidence

2. **Source Verification**: All mappings must have documented sources:
   - `system.json` - Direct from System.json file
   - `editor-screenshot` - From editor screenshots
   - `rpg-maker-docs` - From RPG Maker VX Ace official documentation
   - `none` - No source documented (flagged by detection system)

3. **Transparency**: Clear documentation of what is known, what is inferred, and what remains unknown

### Data Sources

The project uses multiple data sources for verification:
- **Binary Data Files** (`.rvdata2`): Original game data in Ruby Marshal format
- **Processed JSON Files**: Converted data in readable format
- **Script Files**: Decompressed Ruby scripts from `Scripts.rvdata2`
- **Editor Screenshots**: Visual interface showing parameter definitions and structures
- **Documentation**: Official RPG Maker VX Ace documentation and specifications

## Technical Details

### Frontend
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

### Backend/Processing
- **Node.js**: Data processing scripts require Node.js 12.0.0 or higher
- **Ruby Marshal Parser**: Uses `@savannstm/marshal` package to parse `.rvdata2` files
- **JSON Processing**: Converts and normalizes game data structures
- **Script Extraction**: Decompresses zlib-compressed Ruby scripts from game files

### Dependencies
```json
{
  "@savannstm/marshal": "^0.6.3"
}
```

Install dependencies:
```bash
cd app
npm install
```

## Development

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   cd app
   npm install
   ```
3. Place game data files in `original-data/` directory:
   - VX Ace files (`.rvdata2`) in `original-data/vx-ace/`
   - MV files (JSON) in `original-data/mv-converted/`

### Processing Data
1. **Convert VX Ace files** (if needed):
   ```bash
   cd app
   npm run process-vx-ace-data
   ```

2. **Process MV data**:
   ```bash
   cd app
   npm run process-data
   ```

3. **Open the application**:
   - Open `app/index.html` in your web browser
   - Or use a local server (recommended for development):
     ```bash
     cd app
     npm start  # If server.js exists
     ```

### Contributing

When contributing to this project:

1. **Follow the data verification methodology** - See `docs/Data_Analysis_Methodology.md`
2. **Document all sources** - All mappings must have documented sources
3. **Run verification scripts** - Ensure no unmapped parameters or traits
4. **Test translations** - Verify Japanese text is properly translated
5. **Update documentation** - Keep docs in sync with code changes

## Credits

**Black Souls II** is created by **Eeny, meeny, miny, moe?** (えにみに？).

This database is an unofficial fan-made tool for exploring game data. All game assets and data belong to their respective creators.

## License

MIT License - Free to modify and share!

---

*For detailed information about data extraction methodology, verification systems, and data certainty analysis, see the [documentation](docs/) directory.*
