# Search Prompt: RPG Maker VX Ace Official Documentation

## Purpose
Find official RPG Maker VX Ace documentation that maps numeric trait codes, effect codes, and type codes to their human-readable names.

## Search Query

```
RPG Maker VX Ace official documentation trait codes feature codes mapping list
```

## Alternative Search Queries

1. **For Trait Codes:**
   ```
   RPG Maker VX Ace trait code list feature code reference guide official documentation
   ```

2. **For Effect Codes:**
   ```
   RPG Maker VX Ace skill effect codes list official documentation reference
   ```

3. **For Type Codes:**
   ```
   RPG Maker VX Ace scope types hit types damage types occasion types official documentation
   ```

4. **For Complete Reference:**
   ```
   "RPG Maker VX Ace" "feature codes" OR "trait codes" official documentation reference manual
   ```

## What We're Looking For

### Trait Codes (Feature Codes)
We need documentation that maps numeric codes to names, for example:
- Code 11 = HP Regeneration
- Code 12 = MP Regeneration
- Code 14 = Parameter Rate
- Code 21 = Element Rate
- Code 22 = Debuff Rate
- Code 23 = State Rate
- Code 31 = Normal Attack Times
- Code 32 = Skill Type Seal
- Code 33 = Element Seal
- Code 34 = Action Times+
- Code 41 = Special Flag
- Code 42 = Collapse Type
- Code 43 = Party Ability
- Code 44 = Auto Battle
- Code 45 = Guard Effect Rate
- Code 46 = Substitute
- Code 48 = Physical Damage Rate
- Code 49 = Magical Damage Rate
- Code 54 = Equip Weapon Lock
- Code 55 = Equip Armor Lock
- Code 62 = Action Speed
- Code 63 = Force Action Speed
- Code 64 = Buff Turn Rate
- Code 65 = Instant Death

### Effect Codes (Skill Effects)
We need documentation that maps numeric codes to names, for example:
- Code 11 = Recover HP
- Code 12 = Recover MP
- Code 21 = Add State
- Code 22 = Remove State
- Code 31 = Add Buff
- Code 32 = Add Debuff
- Code 33 = Remove Buff
- Code 34 = Remove Debuff
- Code 41 = Special Effect
- Code 42 = Grow
- Code 43 = Learn Skill
- Code 44 = Common Event

### Type Codes
We need documentation for:
- **Scope Types** (0-14): None, 1 Enemy, All Enemies, Random Enemy, etc.
- **Hit Types** (0-2): Certain Hit, Physical Attack, Magical Attack
- **Occasion Types** (0-3): Always, Battle Screen, Menu Screen, Never
- **Damage Types** (0-6): None, HP Damage, MP Damage, HP Recover, MP Recover, HP Drain, MP Drain
- **Restriction Types** (0-4): None, Cannot Attack, Cannot Guard, Cannot Wait, Cannot Move
- **Auto Removal Timings** (0-2): None, Action End, Turn End

## Where to Search

### Official Sources
1. **Enterbrain/ASCII Media Works** - Official RPG Maker VX Ace documentation
2. **RPG Maker VX Ace Help File** - Built-in help documentation (if available)
3. **RPG Maker VX Ace Manual** - Official user manual/guide
4. **RPG Maker Official Website** - Documentation section

### Community Sources (Secondary)
1. **RPG Maker Forums** - Community discussions and references
2. **RPG Maker Wiki** - Community-maintained wiki
3. **Steam Community Guides** - User-created documentation
4. **GitHub Repositories** - Open-source RPG Maker projects with documentation

### Search Engines
- Google: `site:rpgmakerweb.com OR site:forums.rpgmakerweb.com "VX Ace" "trait code"`
- Google: `"RPG Maker VX Ace" "feature code" OR "trait code" documentation`
- DuckDuckGo: Similar queries

## Specific Documentation Sections to Look For

1. **Feature/Trait Code Reference**
   - Complete list of all trait codes
   - Code number → Name mapping
   - Usage examples

2. **Skill Effect Code Reference**
   - Complete list of all effect codes
   - Code number → Name mapping
   - Parameter descriptions

3. **Type Enumeration Reference**
   - Scope type values
   - Hit type values
   - Damage type values
   - Occasion type values
   - Restriction type values
   - Auto removal timing values

4. **Parameter Reference**
   - Standard Parameters (0-7)
   - Extended Parameters (8-17)
   - Special Parameters (18+)

## What to Extract

For each code mapping found, document:
1. **Code Number**: The numeric code
2. **Name**: The human-readable name
3. **Source**: URL or document reference
4. **Page/Section**: Where in the documentation it appears
5. **Date**: When the documentation was published/updated
6. **Confidence**: Official vs. community source

## Example Search Results Format

If documentation is found, it should be formatted like:

```markdown
### Trait Code 62: Action Speed

**Source:** RPG Maker VX Ace Official Documentation
**URL:** [link if available]
**Section:** Feature Code Reference / Trait Codes
**Evidence:** "Code 62: Action Speed - Modifies action speed by percentage"
**Date:** [publication date if available]
**Confidence:** High (Official Documentation)
```

## Notes

- **Official documentation is preferred** over community sources
- **Multiple sources** should be cross-referenced for verification
- **Community wikis/forums** can be used if official docs are unavailable, but should be marked as lower confidence
- **Script analysis** from the game itself may reveal constants, but this is still inference unless the scripts explicitly document the mappings

## Current Status

All trait codes, effect codes, and type codes currently have `source: "none"` or incomplete `source: "editor-screenshot"` (which only proves the option exists, not the code number).

Finding official documentation would allow us to update the source registry with `source: "rpg-maker-docs"` and proper evidence citations.

---

*This prompt is designed to help locate authoritative sources for RPG Maker VX Ace code mappings to improve the source verification system.*

