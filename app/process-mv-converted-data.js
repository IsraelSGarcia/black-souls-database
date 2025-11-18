const fs = require('fs');
const path = require('path');

// ============================================================================
// ⚠️ PROJECT PRINCIPLE: HIDING INFORMATION IS UNACCEPTABLE ⚠️
// ============================================================================
// This entire project operates on the principle that hiding information is forbidden.
// Suppressing warnings, adding exceptions, using heuristics to hide problems, or making
// assumptions about what should or shouldn't be reported is unacceptable. Every piece of
// data must be visible and properly mapped with documented sources. Nothing should be
// hidden from view, regardless of context, "known ranges", or convenience.
// ============================================================================

// ============================================================================
// IMPORTANT: TP (Technical Points) REMOVAL NOTICE
// ============================================================================
// TP (Technical Points) has been completely removed from this database.
// DO NOT add any TP-related functionality back, including:
// - Effect code 13 (Gain TP)
// - Trait code 13 (TP Regeneration)
// - Trait code 47 (TP Charge Rate)
// - Parameter IDs 31 (TP Gain Rate) and 32 (TP Charge Rate)
// - tpCost and tpGain properties on skills
// ============================================================================

// Load data files
const dataDir = path.join(__dirname, '..', 'original-data', 'mv-converted');
const systemData = JSON.parse(fs.readFileSync(path.join(dataDir, 'System.json'), 'utf8'));
const statesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'States.json'), 'utf8'));
const skillsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'Skills.json'), 'utf8'));
const weaponsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'Weapons.json'), 'utf8'));
const armorsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'Armors.json'), 'utf8'));
const enemiesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'Enemies.json'), 'utf8'));
const itemsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'Items.json'), 'utf8'));

// Translate Japanese element names to English
const elementTranslations = {
    "物理": "Physical",
    "吸収": "Absorption",
    "炎": "Fire",
    "氷": "Ice",
    "雷": "Lightning",
    "": "Water", // Element #6 (empty in Japanese, but named Water)
    "睡眠特攻": "Sleep Bonus",
    "光": "Light",
    "闇": "Dark",
    "出血２倍": "Bleed x2",
    "獣特攻": "Beast Bonus",
    "ジャバウォック特攻": "Jabberwock Bonus",
    "スタン２倍": "Stun x2",
    "無防備特攻": "Vulnerable Bonus",
    "落下": "Fall",
    "毒特攻": "Poison Bonus",
    "レイピア特攻": "Rapier Bonus"
};

// Map element IDs to icon indices
// Icon indices based on actual icons used in the game data
// Derived from analyzing skills, states, and items that use each element
const elementIconMap = {
    1: 116, // Physical - Common physical skill icon
    2: 120, // Absorption - Used by absorption skills
    3: 96,  // Fire - Used by fire skills (Flame Breath, Firebomb)
    4: 97,  // Ice - Used by ice skills (Blizzard Breath)
    5: 98,  // Lightning - Used by lightning skills (Blitz)
    6: 99, // Water - Same as Wave skill
    8: 22,  // Sleep Bonus - Used by sleep states
    9: 102, // Light - Used by light skills (Soul Light)
    10: 103, // Dark - Used by dark skills
    11: 573, // Bleed x2 - Used by bleed states
    12: 96,  // Helbreath - Same as Fire
    13: 285, // Beast Bonus - Same as Beasthunter Saw
    14: 641, // Jabberwock Bonus - Same as Vorpal Sword
    15: 21,  // Stun x2 - Used by stun states
    16: 24,  // Vulnerable Bonus - Used by vulnerable states (Break Vulnerable)
    17: 8,   // Fall - Used by fall-related states (Hard Break Vulnerable)
    18: 18,  // Poison Bonus - Used by poison states
    19: 814  // Rapier Bonus - Same as Lunge skill
};

// NOTE: Element translations don't need source verification
// Translations are interpretive and don't require source documentation like factual mappings do

// Weapon type translations
const weaponTypeTranslations = {
    "斧": "Axe",
    "爪": "Claw",
    "槍": "Spear",
    "剣": "Sword",
    "刀": "Blade",
    "弓": "Bow",
    "短剣": "Dagger",
    "槌": "Hammer",
    "杖": "Staff",
    "銃": "Gun"
};

// Armor type translations
const armorTypeTranslations = {
    "一般防具": "General Armor",
    "魔法防具": "Magic Armor",
    "軽装防具": "Light Armor",
    "重装防具": "Heavy Armor",
    "小型盾": "Small Shield",
    "大型盾": "Large Shield"
};

// Create mapping tables - translate Japanese to English
const elements = (systemData.elements || []).map(el => elementTranslations[el] || el || "");
const weaponTypes = (systemData.weaponTypes || []).map(wt => weaponTypeTranslations[wt] || wt || "");
const armorTypes = (systemData.armorTypes || []).map(at => armorTypeTranslations[at] || at || "");
const equipTypes = systemData.equipTypes || [];
const skillTypes = systemData.skillTypes || [];

// Scope type descriptions
// NOTE: Only scope types with documented sources should be included here.
// Types without sources will automatically show as "Unknown" via fallback logic.
const scopeTypes = {
    // From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html)
    0: "None",
    1: "One Enemy",
    2: "All Enemies",
    3: "One Random Enemy",
    4: "Two Random Enemies",
    5: "Three Random Enemies",
    6: "Four Random Enemies",
    7: "One Ally",
    8: "All Allies",
    9: "One Ally (Dead)",
    10: "All Allies (Dead)",
    11: "The User"
};

// Source registry for scope types
const scopeTypeSources = {
    0: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - scope attribute: 'None')" },
    1: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - scope attribute: 'One Enemy')" },
    2: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - scope attribute: 'All Enemies')" },
    3: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - scope attribute: 'One Random Enemy')" },
    4: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - scope attribute: 'Two Random Enemies')" },
    5: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - scope attribute: 'Three Random Enemies')" },
    6: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - scope attribute: 'Four Random Enemies')" },
    7: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - scope attribute: 'One Ally')" },
    8: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - scope attribute: 'All Allies')" },
    9: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - scope attribute: 'One Ally (Dead)')" },
    10: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - scope attribute: 'All Allies (Dead)')" },
    11: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - scope attribute: 'The User')" }
};

// Hit type descriptions
// NOTE: Only hit types with documented sources should be included here.
// Types without sources will automatically show as "Unknown" via fallback logic.
const hitTypes = {
    // From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html)
    0: "Certain hit",
    1: "Physical attack",
    2: "Magical attack"
};

// Source registry for hit types
const hitTypeSources = {
    0: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - hit_type attribute: 'Certain hit')" },
    1: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - hit_type attribute: 'Physical attack')" },
    2: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - hit_type attribute: 'Magical attack')" }
};

// Occasion types
// NOTE: Only occasion types with documented sources should be included here.
// Types without sources will automatically show as "Unknown" via fallback logic.
const occasionTypes = {
    // From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html)
    0: "Always",
    1: "Only in battle",
    2: "Only from the menu",
    3: "Never"
};

// Source registry for occasion types
const occasionTypeSources = {
    0: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - occasion attribute: 'Always')" },
    1: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - occasion attribute: 'Only in battle')" },
    2: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - occasion attribute: 'Only from the menu')" },
    3: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem.html - occasion attribute: 'Never')" }
};

// Damage types
// NOTE: Only damage types with documented sources should be included here.
// Types without sources will automatically show as "Unknown" via fallback logic.
const damageTypes = {
    // From RPG Maker VX Ace official documentation (gc_rpg_usableitem_damage.html)
    0: "None",
    1: "HP damage",
    2: "MP damage",
    3: "HP recovery",
    4: "MP recovery",
    5: "HP drain",
    6: "MP drain"
};

// Source registry for damage types
const damageTypeSources = {
    0: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem_damage.html - type attribute: 'None')" },
    1: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem_damage.html - type attribute: 'HP damage')" },
    2: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem_damage.html - type attribute: 'MP damage')" },
    3: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem_damage.html - type attribute: 'HP recovery')" },
    4: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem_damage.html - type attribute: 'MP recovery')" },
    5: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem_damage.html - type attribute: 'HP drain')" },
    6: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_usableitem_damage.html - type attribute: 'MP drain')" }
};

// Effect code descriptions
// NOTE: Code 13 (Gain TP) has been removed - DO NOT add it back
// NOTE: Only effect codes with documented sources should be included here.
// Codes without sources will automatically show as "Unknown Effect" via fallback logic.
const effectCodes = {
    // From RPG Maker VX Ace official documentation (3420_db_effect.html)
    11: "Recover HP",
    12: "Recover MP",
    21: "Add State",
    22: "Remove State",
    31: "Add Buff",
    32: "Add Debuff",
    33: "Remove Buff",
    34: "Remove Debuff",
    41: "Special Effect",
    42: "Raise Parameter",
    43: "Learn Skill",
    44: "Common Event"
};

// Source registry for effect codes
const effectCodeSources = {
    11: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (3420_db_effect.html - Recovery Tab: 'Recover HP')" },
    12: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (3420_db_effect.html - Recovery Tab: 'Recover MP')" },
    21: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (3420_db_effect.html - State Tab: 'Add State')" },
    22: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (3420_db_effect.html - State Tab: 'Remove State')" },
    31: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (3420_db_effect.html - Parameters Tab: 'Add Buff')" },
    32: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (3420_db_effect.html - Parameters Tab: 'Add Debuff')" },
    33: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (3420_db_effect.html - Parameters Tab: 'Remove Buff')" },
    34: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (3420_db_effect.html - Parameters Tab: 'Remove Debuff')" },
    41: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (3420_db_effect.html - Other Tab: 'Special Effect')" },
    42: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (3420_db_effect.html - Other Tab: 'Raise Parameter')" },
    43: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (3420_db_effect.html - Other Tab: 'Learn Skill')" },
    44: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (3420_db_effect.html - Other Tab: 'Common Event')" }
};

const specialEffectDescriptions = {
    0: "Escape"
};

// ============================================================================
// SOURCE REGISTRY - All mappings must have documented sources
// ============================================================================
// ⚠️ CRITICAL: INFERRED DATA IS FORBIDDEN ⚠️
// 
// DO NOT create mappings based on:
// - Pattern analysis (e.g., "code 21 must be Parameter because 22 is Ex-Parameter")
// - Logical inference (e.g., "this must be X because it makes sense")
// - Assumptions (e.g., "this is probably Y")
// - Data file analysis without direct evidence
// - "Logical extension" or "pattern matching"
//
// ALL mappings MUST have direct, documented evidence from:
// - "system.json" - Direct from System.json file
// - "editor-screenshot" - From editor screenshots (specify which screenshot)
// - "rpg-maker-docs" - From RPG Maker VX Ace official documentation
// - "rgss-script-analysis" - From community analysis of RGSS3 core scripts (code evidence only)
//
// If you cannot find direct evidence, use:
// - "none" - No source documented (will be flagged by detection system)
// - The mapping will be displayed as "Unknown" until proper source is found
//
// ⚠️ FORBIDDEN: Any mapping with "inferred", "assumed", "logical extension", 
// "pattern-based", or similar language in the evidence field.
// ============================================================================

// Parameter names for buffs/debuffs (Standard Parameters 0-7)
const parameterNames = [
    "Max HP",
    "Max MP",
    "Attack",
    "Defense",
    "Magic Attack",
    "Magic Defense",
    "Agility",
    "Luck"
];

// Source registry for parameter names (0-7)
const parameterNameSources = {
    0: { source: "system.json", evidence: "terms.params[0] in System.json" },
    1: { source: "system.json", evidence: "terms.params[1] in System.json" },
    2: { source: "system.json", evidence: "terms.params[2] in System.json" },
    3: { source: "system.json", evidence: "terms.params[3] in System.json" },
    4: { source: "system.json", evidence: "terms.params[4] in System.json" },
    5: { source: "system.json", evidence: "terms.params[5] in System.json" },
    6: { source: "system.json", evidence: "terms.params[6] in System.json" },
    7: { source: "system.json", evidence: "terms.params[7] in System.json" }
};

// Additional parameter names referenced by buffs/debuffs outside the standard 0-7 range
// SOURCE: editor-screenshot (200552.png) – Parameter tab shows EXP/Drain related entries
const buffParameterFallbacks = {
    16: "EXP Gain",
    27: "EXP Gain Rate",
    35: "HP Drain Rate",
    39: "MP Drain Rate"
};

function getBuffParameterName(parameterId) {
    if (parameterId === undefined || parameterId === null) {
        return `Parameter ${parameterId ?? '?'}`;
    }
    return parameterNames[parameterId] || buffParameterFallbacks[parameterId] || `Parameter ${parameterId}`;
}

function getTurnInfo(value) {
    const turns = Math.round(value ?? 0);
    const turnLabel = turns === 1 ? 'turn' : 'turns';
    return { turns, label: `${turns} ${turnLabel}` };
}

// Restriction types (for states)
// NOTE: Only restriction types with documented sources should be included here.
// Types without sources will automatically show as "Unknown" via fallback logic.
const restrictionTypes = {
    // From RPG Maker VX Ace official documentation (gc_rpg_state.html)
    0: "None",
    1: "Attack enemy",
    2: "Attack enemy or ally",
    3: "Attack ally",
    4: "Cannot act"
};

// Source registry for restriction types
const restrictionTypeSources = {
    0: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_state.html - restriction attribute: 'None')" },
    1: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_state.html - restriction attribute: 'Attack enemy')" },
    2: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_state.html - restriction attribute: 'Attack enemy or ally')" },
    3: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_state.html - restriction attribute: 'Attack ally')" },
    4: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_state.html - restriction attribute: 'Cannot act')" }
};

// Auto removal timing (for states)
// NOTE: Only auto removal timings with documented sources should be included here.
// Types without sources will automatically show as "Unknown" via fallback logic.
const autoRemovalTimings = {
    // From RPG Maker VX Ace official documentation (gc_rpg_state.html)
    0: "None",
    1: "At end of action",
    2: "At end of turn"
};

// Source registry for auto removal timings
const autoRemovalTimingSources = {
    0: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_state.html - auto_removal_timing attribute: 'None')" },
    1: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_state.html - auto_removal_timing attribute: 'At end of action')" },
    2: { source: "rpg-maker-docs", evidence: "From RPG Maker VX Ace official documentation (gc_rpg_state.html - auto_removal_timing attribute: 'At end of turn')" }
};

// Trait codes for states
// NOTE: Code 13 (TP Regeneration) and 47 (TP Charge Rate) have been removed - DO NOT add them back
// NOTE: Only trait codes with documented sources should be included here.
// Codes without sources will automatically show as "Unknown Trait" via fallback logic.
const stateTraitCodes = {
    // Rate Tab (11-14)
    11: "Element Rate",
    12: "Debuff Rate",
    13: "State Rate",
    14: "State Resist",
    // Param Tab (21-23)
    21: "Parameter",
    22: "Ex-Parameter",
    23: "Sp-Parameter",
    // Attack Tab (31-34)
    31: "Attack Element",
    32: "Attack State",
    33: "Attack Speed",
    34: "Attack Times+",
    // Skill Tab (41-44)
    41: "Add Skill Type",
    42: "Seal Skill Type",
    43: "Add Skill",
    44: "Seal Skill",
    // Equip Tab (51-55)
    51: "Equip Weapon Type",
    52: "Equip Armor Type",
    53: "Fix Equip",
    54: "Seal Equip",
    55: "Slot Type",
    // Other Tab (61-64)
    61: "Action Times+",
    62: "Special Flag",
    63: "Collapse Effect",
    64: "Party Ability"
};

// Source registry for trait codes
// ⚠️ CRITICAL: NO INFERRED DATA ALLOWED ⚠️
// All mappings here MUST have direct evidence (code examples, official docs, screenshots)
// DO NOT use "logical extension", "pattern matching", "assumed", or "inferred" language
// Based on community-sourced RGSS3 script analysis (Gemini's RPG Maker VX Ace Code Documentation)
// and official RPG Maker VX Ace documentation
const traitCodeSources = {
    // Rate Tab (11-14)
    11: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Rate Tab: Element Rate" },
    12: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Rate Tab: Debuff Rate" },
    13: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Rate Tab: State Rate" },
    14: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Rate Tab: State Resist" },
    // Param Tab (21-23)
    21: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Code 21 confirmed by Game_BattlerBase.param_rate() method: features_with_id(21, param_id)" },
    22: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Code 22 confirmed by Game_BattlerBase.ex_param_plus() method: features_with_id(22, ex_param_id). Note: Official docs show Feature.new(22, ...) examples but code analysis confirms Ex-Parameter usage" },
    23: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Param Tab: Sp-Parameter. Official docs show Feature.new(23, 0, 1) example confirming code 23 exists" },
    // Attack Tab (31-34)
    31: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Attack Tab: Attack Element. Official docs show Feature.new(31, 1, 0) examples" },
    32: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Attack Tab: Attack State" },
    33: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Attack Tab: Attack Speed" },
    34: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Attack Tab: Attack Times+" },
    // Skill Tab (41-44)
    41: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Skill Tab: Add Skill Type. Official docs show Feature.new(41, 1) example" },
    42: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Skill Tab: Seal Skill Type" },
    43: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Skill Tab: Add Skill" },
    44: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Skill Tab: Seal Skill" },
    // Equip Tab (51-55)
    51: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Equip Tab: Equip Weapon Type. Official docs show Feature.new(51, 1) example" },
    52: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Equip Tab: Equip Armor Type. Official docs show Feature.new(52, 1) example" },
    53: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Equip Tab: Fix Equip" },
    54: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Equip Tab: Seal Equip" },
    55: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Equip Tab: Slot Type" },
    // Other Tab (61-64)
    61: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Other Tab: Action Times+" },
    62: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Other Tab: Special Flag" },
    63: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Other Tab: Collapse Effect" },
    64: { source: "rgss-script-analysis", evidence: "From community-sourced RGSS3 script analysis - Other Tab: Party Ability" }
};

// Japanese to English translations for common note patterns
const translations = {
    // System messages
    "スキル１番は［攻撃］コマンドを選択したときに使用されます。": "Skill #1 is used when the [Attack] command is selected.",
    "スキル２番は［防御］コマンドを選択したときに使用されます。": "Skill #2 is used when the [Guard] command is selected.",
    
    // Battle mechanics
    "ターン消費無し": "Does not consume a turn",
    "保存禁止": "Cannot be saved",
    "合成設定": "Synthesis setting",
    "ステルス": "Stealth",
    "戦闘終了後ステート解除": "State removed after battle",
    "戦闘中装備変更": "Can change equipment during battle",
    "戦闘中装備変更禁止": "Cannot change equipment during battle",
    "限界変動": "Stat limit change",
    "レベル限界増加": "Level limit increase",
    "クールタイム": "Cooldown",
    "防御状態無視率": "Ignores defense",
    "ダメージ率貫通": "Damage penetration",
    "変換攻撃判定": "HP conversion attack",
    "HP変換攻撃": "HP drain",
    "使用後追加行動": "Additional action after use",
    "行動後遅延発動": "Delayed trigger after action",
    "遅延発動": "Delayed trigger",
    "ステート変化": "State change",
    "使用者効果": "User effect",
    "反撃可能": "Can counter",
    "運無視ステート付与": "Ignores luck for state application",
    "運無視弱体付与": "Ignores luck for debuff application",
    "消費最大ＨＰ": "Consumes max HP",
    
    // Souls and items
    "少女の悪夢": "Girl's Nightmare",
    "学長のソウル": "Headmaster's Soul",
    "帝のソウル": "Emperor's Soul",
    "己惚れビーストのソウル": "Soul of the Conceited Beast",
    "バンダースナッチ": "Bandersnatch",
    "短銃": "Pistol",
    "アリスを受け入れて": "Accept Alice",
    
    // Notes
    "注意！スキル名前のため弄らない": "Warning! Do not modify skill name",
    
    // State notes - will resolve state name dynamically
    "ステート１番はＨＰが０になったときに自動的に付加されます。": "Automatically applied when HP becomes 0.",
    "[全回復無効ステート]": "[Full Recovery Disabled State]",
    "全回復無効ステート": "Full Recovery Disabled State",
    "何もしないステート": "Do nothing state",
    
    // Additional patterns
    "武器用": "Weapon-specific",
    "HP回復無効": "HP recovery disabled",
    "HP回復反転": "HP recovery reversed",
    "物理絶対命中": "Physical attacks always hit",
    "魔法絶対命中": "Magic attacks always hit",
    "アイテム封印": "Items sealed",
    "スキル無効": "Skill disabled",
    "全回避時スキル": "On full evasion: Casts skill",
    "強制自然解除時ステート": "When naturally removed: Applies state",
    "バンスナ特攻": "Bandersnatch bonus damage",
    "反撃スキル": "Counter skill",
    "攻撃ID変更": "Changes attack to",
    "初期武器": "Initial weapon",
    "神殿騎士": "Temple Knight",
    "戦士": "Warrior",
    "魔術師": "Mage",
    "聖職者": "Cleric",
    "戦闘前ステート付与": "State applied before battle",
    "場所": "Location",
    "混沌": "Chaos",
    
    // Location names
    "公爵館": "Duchess's Mansion",
    "フリッセル": "Frisell",
    "ラドウィッジ": "Radowitz",
    "屠殺場": "Slaughterhouse",
    "病みたる時計塔": "Sick Clock Tower",
    "心臓の庭園": "Garden of Hearts",
    "無限食": "Infinite Food",
    "帽子屋": "Hatter's House",
    "ウィンターベル": "Winterbell",
    "胞子の森": "Spore Forest",
    "憂さ晴らしソウル": "Vent Souls",
    "リポン": "Ribbon",
    "フランクリンボルヴォルト": "Franklin Boltvolt",
    "ウミガメレストラン": "Sea Turtle Restaurant",
    "カキお使い": "Oyster Messenger",
    "イグゾー": "Igzo",
    "クイーン・ランド": "Queen's Land",
    "深海": "Deep Sea",
    "ジャックのソウル": "Jack's Soul",
    "キャプテン・キッド": "Captain Kidd",
    "エレバス号": "Erebus",
    "船の墓場": "Ship Graveyard",
    "ビリングズゲート": "Billingsgate",
    "首切り案内所": "Executioner's Office",
    "酒場": "Tavern",
    "キャロル川": "Carroll River",
    "魔女の家の残骸": "Witch's House Ruins",
    "亡者コック": "Undead Cook",
    "一角獣の森": "Unicorn Forest",
    "獅子の砦": "Lion's Fortress",
    "雪原": "Snowfield",
    "白の城下": "White Castle Town",
    "白の城下町": "White Castle Town",
    "冬鐘の風のソウル": "Winter Bell Wind's Soul",
    "狂気山脈": "Madness Mountain Range",
    
    // Character/Enemy names
    "グール　ドロップ": "Dropped by Ghoul",
    "ドロップ　紳士": "Dropped by Gentleman",
    "マリー・ハドソンイベント　死体": "Mary Hudson event corpse",
    "ソニー・ビーン": "Sonny Bean",
    "リポン　ミミック": "Ribbon Mimic",
    "無限食　ミミック": "Infinite Food Mimic",
    "アーチボルド": "Archibald",
    "フレデリック": "Frederick",
    "逃亡騎士ジム": "Fleeing Knight Jim",
    "悪夢霊　アメリア": "Nightmare Spirit Amelia",
    "クリスティ": "Christie",
    "ハロルド": "Harold",
    "ピエロ": "Pierrot",
    "スウィーニートッド": "Sweeney Todd",
    "パンプキン・オー": "Pumpkin O",
    "ブージャム": "Boojam",
    "ブッチャーのソウル": "Butcher's Soul",
    "バイロン": "Byron",
    "巨人の家のソウル": "Giant's House Soul",
    "ハノーヴァー": "Hanover",
    "ハートの騎士のソウル": "Heart Knight's Soul",
    "スペードの騎士のソウル": "Spade Knight's Soul",
    "クラブの騎士のソウル": "Club Knight's Soul",
    "童話コンプリート": "Fairy Tale Complete",
    "クティ": "Kuti",
    "黒髭": "Blackbeard",
    "カーナッキ": "Carnacki",
    "リンダメア": "Lindamear",
    "メイベル": "Mabel",
    "ランジェリーナ": "Lingerina",
    "麻袋女": "Sack Woman",
    "ジキルとハイド": "Jekyll and Hyde",
    "ビル": "Bill",
    "時計塔": "Clock Tower",
    "ラドウィッジ上層": "Radowitz Upper Level",
    "ラドウィッジ街　上層": "Radowitz Street Upper Level",
    
    // More character/enemy names
    "イーディス": "Edith",
    "イシュタムの天使": "Ishtam's Angel",
    "ウェインライト": "Wayne Wright",
    "ウサギの国": "Rabbit Country",
    "キャンディー": "Candy",
    "クリミア看護墓地": "Crimia Nursing Cemetery",
    "チェシャ贈り物": "Cheshire Gift",
    "ブラウンリッグ": "Brownrigg",
    "ブラックウェル　魔獣": "Blackwell Demon Beast",
    "ヘイグ": "Hague",
    "ぺろぺろちょうだい": "Lick Lick Please",
    "ぺろぺろバード": "Lick Lick Bird",
    "仲間出現": "Companion appears",
    "公爵館　ミミック": "Duchess's Mansion Mimic",
    "図書室の夢": "Library Dream",
    "死体盗みヘア": "Corpse Thief Hair",
    "輝星のビーストソウル": "Shining Star Beast's Soul",
    "保存禁止": "Save disabled",
    "名無しの森": "Nameless Forest",
    
    // Battle mechanics and descriptions
    "3人組で登場する": "Appears in groups of 3",
    "各地": "Various locations",
    "地響きとともに現れる": "Appears with ground shaking",
    "孕み水母": "Pregnant Jellyfish",
    "攻撃するとステート紅（素早さ900％": "When attacked, applies Red state (speed 900%)",
    "最初から眠っている": "Sleeping from the start",
    "最終形態": "Final form",
    "深度０": "Depth 0",
    "深度１": "Depth 1",
    "深度２": "Depth 2",
    "深度３": "Depth 3",
    "深度４": "Depth 4",
    "深度５": "Depth 5",
    "片方死ぬとＨＰ１５％で回復": "When one dies, recovers 15% HP",
    "突進してくる": "Charges forward",
    "第一形態": "First form",
    "第二形態": "Second form",
    "第三形態": "Third form",
    "第四形態": "Fourth form",
    "自爆を繰り返すので数ターン耐えれば勝ち": "Repeatedly self-destructs, survive a few turns to win",
    "裏ルート": "Secret route",
    "ジャブジャブ": "Jab Jab",
    
    // More character/event names and items
    "ヴォーパルソード": "Vorpal Sword",
    "エリザベートのソウル": "Elisabeth's Soul",
    "オールカース": "All Curse",
    "オールブレス": "All Breath",
    "キャンディー交換": "Candy exchange",
    "クラブ指輪": "Club Ring",
    "ゲルダ": "Gerda",
    "サティロスドロップ": "Dropped by Satyros",
    "スペード指輪": "Spade Ring",
    "ソウルの太矢連射": "Soul's Heavy Arrow Rapid Fire",
    "トカゲのビル　誓約lv1": "Bill's Lizard Covenant Lv1",
    "ドジソン橋": "Dodgson Bridge",
    "とびっこ　おもちゃのカエル": "Jumping Toy Frog",
    "とびっこ　ノミ": "Jumping Flea",
    "とびっこ　バッタ": "Jumping Grasshopper",
    "トリニクン": "Trinicon",
    "ハート指輪": "Heart Ring",
    "ブッチャー指輪": "Butcher Ring",
    "ベルマンのソウル": "Bellman's Soul",
    "ぺろぺろちょうだい！でのちいさなメダル的立場": "Lick Lick Please! Small Medal position",
    "ミランダからもらう": "Received from Miranda",
    "ヤマアラシの盾": "Porcupine Shield",
    "ラドウィッジ市街": "Radowitz City",
    "ラドウィッジ街": "Radowitz Street",
    "ラドウィッジ街上層": "Radowitz Street Upper Level",
    "リデル墓地　井戸": "Liddell Cemetery Well",
    "兎騎士ヴァーナイ": "Rabbit Knight Vernai",
    "公爵夫人": "Duchess",
    "切れ端を３つ集める": "Collect 3 fragments",
    "古い羊": "Old Sheep",
    "天の指輪": "Heaven Ring",
    "奴隷": "Slave",
    "学長": "Headmaster",
    
    // Battle mechanics
    "１回目": "First time",
    "２回目": "Second time",
    "３回目/殺害時": "Third time/when killed",
    "＝童話・童謡・伝話＝＝＝＝": "Fairy Tales, Nursery Rhymes, Legends",
    
    // More locations and items
    "ラドウィッジ市街": "Radowitz City",
    "リデル墓地　井戸": "Liddell Cemetery Well",
    "深度９": "Depth 9",
    "看護墓地": "Nursing Cemetery",
    "対象不可": "Cannot target",
    "小鳥を殺害": "Kill the bird",
    "岩の身体": "Rock body",
    "帝": "Emperor",
    "幽火": "Phantom Fire",
    "死灰": "Dead Ash",
    "殺人鬼の銃": "Murderer's Gun",
    "王の号令": "King's Command",
    "神殿の異形": "Temple Aberration",
    "紅ずきんイベント": "Little Red Riding Hood event",
    
    // Enemy/item descriptions
    "逃げ出す": "Runs away",
    "選んだアリスによって変化": "Changes based on chosen Alice",
    "魚市場": "Fish Market",
    "近付くまで見えない": "Invisible until approached",
    
    // More items and descriptions
    "老騎士ウィリアム": "Old Knight William",
    "茨姫のＨＰが減ると増えていく": "Ashibime's HP increases as it decreases",
    "荒れ果てた娼館": "Ruined Brothel",
    "鉄の加護の指輪": "Iron Protection Ring",
    "雪崩れ森": "Avalanche Forest",
    "魔書大暴れ": "Magic Book Rampage",
    "魔法石の指輪": "Magic Stone Ring",
    "黒ウサギの指輪": "Black Rabbit Ring",
    "カボチャの拠点": "Pumpkin Base",
    "黒髭の背後に存在": "Exists behind Blackbeard",
    "愛の喪失": "Loss of Love",
    "負けると死desh　倒すと討取": "Death on defeat, execution on defeat",
    "おぞましいヒンドリー": "Horrible Hindley",
    "乳母たちのソウル": "Nurses' Souls",
    "神魚のソウル": "Divine Fish Soul",
    "ロルド": "Lord",
    "白の城下街": "White Castle Town Street",
    "勢い余って転ぶ": "Stumbles from momentum",
    "オックスフォード": "Oxford",
    "プリケット誓約": "Pricket Covenant",
    "両方同時に殺さないと延々と復活する": "If not killed simultaneously, endlessly revives",
    "下水道": "Sewer",
    "攻撃できない。大砲を撃ってくる": "Cannot attack. Fires cannons",
    "黒髭を倒すと消滅": "Disappears when Blackbeard is defeated",
    "城下街": "Castle Town Street",
    "白の城": "White Castle",
    "深度１　１体ずつ": "Depth 1: One at a time",
    "深度２　全員相手": "Depth 2: All opponents",
    "大鷲のソウル": "Giant Eagle Soul",
    "妊婦のソウル": "Pregnant Woman Soul",
    "ジャブジャブ落": "Jab Jab Drop",
    "分身": "Clone",
    "混沌ダンジョン": "Chaos Dungeon"
};

// Convert Japanese (full-width) punctuation to ASCII (half-width)
function convertJapanesePunctuation(text) {
    if (!text) return text;
    
    return text
        .replace(/！/g, '!')
        .replace(/？/g, '?')
        .replace(/～/g, '~')
        .replace(/、/g, ',')
        .replace(/。/g, '.')
        .replace(/（/g, '(')
        .replace(/）/g, ')')
        .replace(/「/g, '"')
        .replace(/」/g, '"')
        .replace(/『/g, '"')
        .replace(/』/g, '"')
        .replace(/【/g, '[')
        .replace(/】/g, ']')
        .replace(/〜/g, '~')
        .replace(/　/g, ' '); // Full-width space to regular space
}

// Simple translation function for strings (names, descriptions) using the translations object
function translateSimpleString(text) {
    if (!text) return text;
    
    let result = convertJapanesePunctuation(text.trim());
    
    // Apply translations from the translations object
    let changed = true;
    while (changed) {
        changed = false;
        for (const [jpn, eng] of Object.entries(translations)) {
            if (result.includes(jpn)) {
                result = result.replace(new RegExp(jpn, 'g'), eng);
                changed = true;
            }
        }
    }
    
    return result;
}

// Detect Japanese characters (Hiragana, Katakana, Kanji)
function containsJapanese(text) {
    if (!text) return false;
    // Match Hiragana (ひらがな): \u3040-\u309F
    // Match Katakana (カタカナ): \u30A0-\u30FF
    // Match Kanji (漢字): \u4E00-\u9FAF
    // Match CJK Extension A: \u3400-\u4DBF
    const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]/;
    return japaneseRegex.test(text);
}

// Comprehensive ID Resolution System
// Creates helper functions to resolve IDs to names for all object types
function createIDResolvers(skillsData, statesData, weaponsData, armorsData, itemsData, enemiesData) {
    return {
        // Resolve skill ID to name
        getSkillName: (id) => {
            if (!skillsData || !id) return null;
            const skill = skillsData.find(s => s && s.id === parseInt(id));
            return skill && skill.name ? skill.name : null;
        },
        
        // Resolve state ID to name
        getStateName: (id) => {
            if (!statesData || !id) return null;
            const state = statesData.find(s => s && s.id === parseInt(id));
            if (!state) return null;
            // If state exists but has no name, return "State #X" as fallback
            return state.name && state.name.trim() !== '' ? state.name : `State #${id}`;
        },
        
        // Resolve weapon ID to name
        getWeaponName: (id) => {
            if (!weaponsData || !id) return null;
            const weapon = weaponsData.find(w => w && w.id === parseInt(id));
            return weapon && weapon.name ? weapon.name : null;
        },
        
        // Resolve armor ID to name
        getArmorName: (id) => {
            if (!armorsData || !id) return null;
            const armor = armorsData.find(a => a && a.id === parseInt(id));
            return armor && armor.name ? armor.name : null;
        },
        
        // Resolve item ID to name
        getItemName: (id) => {
            if (!itemsData || !id) return null;
            const item = itemsData.find(i => i && i.id === parseInt(id));
            return item && item.name ? item.name : null;
        },
        
        // Resolve enemy ID to name
        getEnemyName: (id) => {
            if (!enemiesData || !id) return null;
            const enemy = enemiesData.find(e => e && e.id === parseInt(id));
            return enemy && enemy.name ? enemy.name : null;
        }
    };
}

// Comprehensive function to replace all ID references in text with actual names
// AND mark them as cross-references for linking
// This scans for patterns like "Skill #123", "State #456", "Weapon #789", etc.
// Uses special markers: [[TYPE:ID:NAME]] to mark cross-references
// 
// IMPORTANT: Same-type references are allowed (e.g., Skill A can reference Skill B).
// Only self-references (an entity referencing itself) are skipped.
function resolveIDReferences(text, resolvers, sourceType = null, sourceId = null) {
    if (!text || typeof text !== 'string') return text;
    
    // Protect existing markers from being processed again
    // Replace markers with placeholders, process, then restore
    const markerPlaceholders = [];
    let placeholderIndex = 0;
    
    // Store existing markers and replace with placeholders
    let result = text.replace(/\[\[(SKILL|STATE|WEAPON|ARMOR|ITEM|ENEMY):(\d+):([^\]]+)\]\]/g, (match) => {
        const placeholder = `__MARKER_PLACEHOLDER_${placeholderIndex}__`;
        markerPlaceholders[placeholderIndex] = match;
        placeholderIndex++;
        return placeholder;
    });
    
    // Pattern 1: "Skill #123" or "Skill # 123" (with optional space)
    result = result.replace(/Skill\s*#\s*(\d+)/gi, (match, id) => {
        const name = resolvers.getSkillName(id);
        if (!name) return match;
        
        // RULE: Self-references must be plain text only, NOT cross-reference links
        // If a skill references itself, show just the name (e.g., "Piercing Iron Spear")
        // If a skill references another skill, create a cross-reference link (e.g., "[[SKILL:123:Other Skill]]")
        // This prevents circular navigation and keeps self-references as informational text only
        if (sourceType === 'skill' && Number(sourceId) === Number(id)) {
            return name; // Self-reference: return plain text name only
        }
        
        // Not a self-reference: create cross-reference marker for linking
        return `[[SKILL:${id}:${name}]]`;
    });
    
    // Pattern 2: "State #123" or "State # 123"
    result = result.replace(/State\s*#\s*(\d+)/gi, (match, id) => {
        // Skip if this is a self-reference (same state referencing itself)
        // NOTE: Same-type references are allowed (e.g., State A can reference State B)
        // Ensure both are compared as numbers to handle type mismatches
        if (sourceType === 'state' && Number(sourceId) === Number(id)) return match;
        const name = resolvers.getStateName(id);
        return name ? `[[STATE:${id}:${name}]]` : match;
    });
    
    // Pattern 3: "Weapon #123" or "Weapon # 123"
    result = result.replace(/Weapon\s*#\s*(\d+)/gi, (match, id) => {
        // Skip if this is a self-reference
        // Ensure both are compared as numbers to handle type mismatches
        if (sourceType === 'weapon' && Number(sourceId) === Number(id)) return match;
        const name = resolvers.getWeaponName(id);
        return name ? `[[WEAPON:${id}:${name}]]` : match;
    });
    
    // Pattern 4: "Armor #123" or "Armor # 123"
    result = result.replace(/Armor\s*#\s*(\d+)/gi, (match, id) => {
        // Skip if this is a self-reference
        // Ensure both are compared as numbers to handle type mismatches
        if (sourceType === 'armor' && Number(sourceId) === Number(id)) return match;
        const name = resolvers.getArmorName(id);
        return name ? `[[ARMOR:${id}:${name}]]` : match;
    });
    
    // Pattern 5: "Item #123" or "Item # 123"
    result = result.replace(/Item\s*#\s*(\d+)/gi, (match, id) => {
        // Skip if this is a self-reference
        // Ensure both are compared as numbers to handle type mismatches
        if (sourceType === 'item' && Number(sourceId) === Number(id)) return match;
        const name = resolvers.getItemName(id);
        return name ? `[[ITEM:${id}:${name}]]` : match;
    });
    
    // Pattern 6: "Enemy #123" or "Enemy # 123"
    result = result.replace(/Enemy\s*#\s*(\d+)/gi, (match, id) => {
        // Skip if this is a self-reference
        // Ensure both are compared as numbers to handle type mismatches
        if (sourceType === 'enemy' && Number(sourceId) === Number(id)) return match;
        const name = resolvers.getEnemyName(id);
        return name ? `[[ENEMY:${id}:${name}]]` : match;
    });
    
    // Pattern 7: ID references in quotes or parentheses (e.g., "(#123)" or "[#123]")
    result = result.replace(/[\[\(]\s*#\s*(\d+)\s*[\]\)]/g, (match, id, offset, string) => {
        const idNum = parseInt(id);
        // Try all resolvers to find which type this is
        let name = resolvers.getSkillName(id);
        if (name) {
            const before = string[offset - 1];
            const after = match[match.length - 1];
            const open = before === '(' ? '(' : '[';
            const close = after === ')' ? ')' : ']';
            
            // RULE: Self-references must be plain text only, NOT cross-reference links
            // If a skill references itself, show just the name (e.g., "Piercing Iron Spear")
            // If a skill references another skill, create a cross-reference link (e.g., "[[SKILL:123:Other Skill]]")
            // This prevents circular navigation and keeps self-references as informational text only
            if (sourceType === 'skill' && Number(sourceId) === Number(idNum)) {
                return `${open}${name}${close}`; // Self-reference: return plain text name only
            }
            
            // Not a self-reference: create cross-reference marker for linking
            return `${open}[[SKILL:${id}:${name}]]${close}`;
        }
        name = resolvers.getStateName(id);
        if (name) {
            // Skip if this is a self-reference
            // Ensure both are compared as numbers to handle type mismatches
            if (sourceType === 'state' && Number(sourceId) === Number(idNum)) return match;
            const before = string[offset - 1];
            const after = match[match.length - 1];
            const open = before === '(' ? '(' : '[';
            const close = after === ')' ? ')' : ']';
            return `${open}[[STATE:${id}:${name}]]${close}`;
        }
        name = resolvers.getWeaponName(id);
        if (name) {
            // Skip if this is a self-reference
            // Ensure both are compared as numbers to handle type mismatches
            if (sourceType === 'weapon' && Number(sourceId) === Number(idNum)) return match;
            const before = string[offset - 1];
            const after = match[match.length - 1];
            const open = before === '(' ? '(' : '[';
            const close = after === ')' ? ')' : ']';
            return `${open}[[WEAPON:${id}:${name}]]${close}`;
        }
        name = resolvers.getArmorName(id);
        if (name) {
            // Skip if this is a self-reference
            // Ensure both are compared as numbers to handle type mismatches
            if (sourceType === 'armor' && Number(sourceId) === Number(idNum)) return match;
            const before = string[offset - 1];
            const after = match[match.length - 1];
            const open = before === '(' ? '(' : '[';
            const close = after === ')' ? ')' : ']';
            return `${open}[[ARMOR:${id}:${name}]]${close}`;
        }
        name = resolvers.getItemName(id);
        if (name) {
            // Skip if this is a self-reference
            // Ensure both are compared as numbers to handle type mismatches
            if (sourceType === 'item' && Number(sourceId) === Number(idNum)) return match;
            const before = string[offset - 1];
            const after = match[match.length - 1];
            const open = before === '(' ? '(' : '[';
            const close = after === ')' ? ')' : ']';
            return `${open}[[ITEM:${id}:${name}]]${close}`;
        }
        name = resolvers.getEnemyName(id);
        if (name) {
            // Skip if this is a self-reference
            // Ensure both are compared as numbers to handle type mismatches
            if (sourceType === 'enemy' && Number(sourceId) === Number(idNum)) return match;
            const before = string[offset - 1];
            const after = match[match.length - 1];
            const open = before === '(' ? '(' : '[';
            const close = after === ')' ? ')' : ']';
            return `${open}[[ENEMY:${id}:${name}]]${close}`;
        }
        return match;
    });
    
    // Pattern 8: Standalone "#123" when it appears to be a reference (not part of a number)
    // This is more aggressive - only replace if it's clearly a standalone reference
    result = result.replace(/\b#\s*(\d+)\b/g, (match, id, offset, string) => {
        const idNum = parseInt(id);
        // Check if this is part of a larger pattern we've already handled
        const before = string.substring(Math.max(0, offset - 20), offset);
        const after = string.substring(offset + match.length, Math.min(string.length, offset + match.length + 20));
        
        // If preceded by "Skill", "State", etc., skip (already handled)
        if (/\b(Skill|State|Weapon|Armor|Item|Enemy)\s*$/i.test(before)) {
            return match;
        }
        
        // Try all resolvers
        let name = resolvers.getSkillName(id);
        if (name) {
            // RULE: Self-references must be plain text only, NOT cross-reference links
            // If a skill references itself, show just the name (e.g., "Piercing Iron Spear")
            // If a skill references another skill, create a cross-reference link (e.g., "[[SKILL:123:Other Skill]]")
            // This prevents circular navigation and keeps self-references as informational text only
            if (sourceType === 'skill' && Number(sourceId) === Number(idNum)) {
                return name; // Self-reference: return plain text name only
            }
            
            // Not a self-reference: create cross-reference marker for linking
            return `[[SKILL:${id}:${name}]]`;
        }
        name = resolvers.getStateName(id);
        if (name) {
            // Skip if this is a self-reference
            // Ensure both are compared as numbers to handle type mismatches
            if (sourceType === 'state' && Number(sourceId) === Number(idNum)) return match;
            return `[[STATE:${id}:${name}]]`;
        }
        name = resolvers.getWeaponName(id);
        if (name) {
            // Skip if this is a self-reference
            // Ensure both are compared as numbers to handle type mismatches
            if (sourceType === 'weapon' && Number(sourceId) === Number(idNum)) return match;
            return `[[WEAPON:${id}:${name}]]`;
        }
        name = resolvers.getArmorName(id);
        if (name) {
            // Skip if this is a self-reference
            // Ensure both are compared as numbers to handle type mismatches
            if (sourceType === 'armor' && Number(sourceId) === Number(idNum)) return match;
            return `[[ARMOR:${id}:${name}]]`;
        }
        name = resolvers.getItemName(id);
        if (name) {
            // Skip if this is a self-reference
            // Ensure both are compared as numbers to handle type mismatches
            if (sourceType === 'item' && Number(sourceId) === Number(idNum)) return match;
            return `[[ITEM:${id}:${name}]]`;
        }
        name = resolvers.getEnemyName(id);
        if (name) {
            // Skip if this is a self-reference
            // Ensure both are compared as numbers to handle type mismatches
            if (sourceType === 'enemy' && Number(sourceId) === Number(idNum)) return match;
            return `[[ENEMY:${id}:${name}]]`;
        }
        return match;
    });
    
    // Restore the original markers
    markerPlaceholders.forEach((marker, index) => {
        result = result.replace(`__MARKER_PLACEHOLDER_${index}__`, marker);
    });
    
    return result;
}

// ID reference logging and summary
const idRefStats = {
    totalDetections: 0,
    totalReplacements: 0,
    unresolvedDetections: 0,
    byType: { skills: 0, states: 0, weapons: 0, armors: 0, enemies: 0, items: 0 },
};

function detectIdReference(text) {
    if (!text) return false;
    
    // First, remove all existing markers to avoid false positives
    // Markers are in format [[TYPE:ID:NAME]]
    const textWithoutMarkers = text.replace(/\[\[[^\]]+\]\]/g, '');
    
    const patterns = [
        /\b(Skill|State|Weapon|Armor|Item|Enemy)\s*#\s*\d+/i,
        /[\[(]\s*#\s*\d+\s*[\])]/,
        /\b#\s*\d+\b/,
    ];
    return patterns.some(rx => rx.test(textWithoutMarkers));
}

function resolveAndLog(text, resolvers, sourceType, sourceId, fieldName) {
    const before = text || "";
    
    // Helper function to check if text contains only self-references
    const isOnlySelfReference = (text) => {
        if (!detectIdReference(text)) return false;
        
        const idPatterns = [
            /Skill\s*#\s*(\d+)/gi,
            /State\s*#\s*(\d+)/gi,
            /Weapon\s*#\s*(\d+)/gi,
            /Armor\s*#\s*(\d+)/gi,
            /Item\s*#\s*(\d+)/gi,
            /Enemy\s*#\s*(\d+)/gi,
            /[\[(]\s*#\s*(\d+)\s*[\])]/g,
            /\b#\s*(\d+)\b/g
        ];
        
        // Extract all IDs from the text
        const allIds = [];
        for (const pattern of idPatterns) {
            const matches = [...text.matchAll(pattern)];
            for (const match of matches) {
                allIds.push(parseInt(match[1]));
            }
        }
        
        // If no IDs found, it's not a self-reference
        if (allIds.length === 0) return false;
        
        // Check if all IDs match the sourceId (meaning all are self-references)
        return allIds.every(id => sourceId && id === sourceId);
    };
    
    // Only count detection if it's not a self-reference
    if (detectIdReference(before) && !isOnlySelfReference(before)) {
        idRefStats.totalDetections += 1;
    }
    
    const after = resolveIDReferences(before, resolvers, sourceType, sourceId);
    if (after !== before) {
        idRefStats.totalReplacements += 1;
        const key = `${sourceType}s`;
        if (idRefStats.byType[key] !== undefined) idRefStats.byType[key] += 1;
        // Don't log successful resolutions - only log errors/warnings
    } else if (detectIdReference(after) && !isOnlySelfReference(after)) {
        // Only count as unresolved if it's not a self-reference
        idRefStats.unresolvedDetections += 1;
        console.warn(`🟨 IDRef unresolved in ${sourceType} ${sourceId} [${fieldName}]: "${String(before).substring(0, 100)}..."`);
    }
    return after;
}

// Comprehensive translation function for skill notes
function translateNote(note, skillsData = null, statesData = null, sourceType = 'note', sourceId = null) {
    if (!note) return { english: "", japanese: note || "", untranslated: false };
    
    // Normalize whitespace: trim and replace multiple spaces/newlines, but preserve full-width spaces for translation matching
    // First, normalize regular spaces and tabs, but keep full-width spaces (　) for now
    let english = note.trim().replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n');
    // Then normalize full-width spaces separately (after translations, we'll convert them)
    english = english.replace(/　+/g, '　');
    let hasTranslation = false;
    const originalNote = note;
    
    // Helper function to get skill name by ID
    // Returns Skill #ID format so ID reference resolver can process it
    const getSkillName = (id) => {
        return `Skill #${id}`;
    };
    
    // Helper function to get state name by ID
    // Returns State #ID format so ID reference resolver can process it
    const getStateName = (id) => {
        return `State #${id}`;
    };
    
    // Pattern-based translations with parameters (APPLY THESE FIRST before simple text translations)
    const patterns = [
        // Cooldown
        { regex: /<クールタイム:(\d+)>/g, replacement: (m, p1) => `Cooldown: ${p1} turns` },
        
        // Turn consumption
        { regex: /\[hzm\]ターン消費無し:(\d+)/g, replacement: (m, p1) => `Does not consume a turn (${p1} turns)` },
        
        // Defense ignore rate
        { regex: /<防御状態無視率:(\d+)>/g, replacement: (m, p1) => `Ignores ${p1}% defense` },
        
        // Damage penetration
        { regex: /<ダメージ率貫通:(\d+),(\d+)>/g, replacement: (m, p1, p2) => `Damage penetration: ${p2}%` },
        
        // HP conversion attack
        { regex: /<HP変換攻撃:(\d+),(\d+)>/g, replacement: (m, p1, p2) => `HP drain: ${p2}%` },
        { regex: /<変換攻撃判定:(\d+)>/g, replacement: (m, p1) => `HP conversion rate: ${p1}%` },
        
        // Additional action after use with chance
        { regex: /<使用後追加行動:(\d+),(-?\d+),(\d+)>/g, replacement: (m, p1, p2, p3) => {
            const skillName = getSkillName(p1);
            return `After use: ${p3}% chance to cast "${skillName}"`;
        }},
        // Additional action after use without chance (when chance parameter is omitted, defaults to 100%)
        { regex: /<使用後追加行動:(\d+),(-?\d+)>/g, replacement: (m, p1, p2) => {
            const skillName = getSkillName(p1);
            return `After use: Casts "${skillName}"`;
        }},
        
        // Delayed triggers - after action
        { regex: /<行動後遅延発動:(\d+),(\d+),(\d+),(\d+),(\d+)>/g, replacement: (m, p1, p2, p3, p4, p5) => {
            const skillName = getSkillName(p2);
            return `After ${p3} turns: ${p5}% chance to trigger "${skillName}"`;
        }},
        // Delayed triggers - standard
        { regex: /<遅延発動:(\d+),(\d+),(\d+)>/g, replacement: (m, p1, p2, p3) => {
            const skillName = getSkillName(p2);
            return `After ${p3} turns: Triggers "${skillName}"`;
        }},
        
        // State changes - when user has a certain state, this skill transforms
        { regex: /<ステート変化:(\d+),(\d+)>/g, replacement: (m, p1, p2) => {
            const skillName = getSkillName(p1);
            const stateName = getStateName(p2);
            return `When user has "${stateName}": Transforms into "${skillName}"`;
        }},
        
        // User effects - applies a skill effect to the user
        { regex: /<使用者効果 (\d+)>/g, replacement: (m, p1) => {
            const skillName = getSkillName(p1);
            return `Applies to user: "${skillName}" effects`;
        }},
        
        // HP consumption
        { regex: /<消費最大ＨＰ (\d+)%>/g, replacement: (m, p1) => `Consumes ${p1}% max HP` },
        
        // Counter skill
        { regex: /<反撃スキル (\d+)>/g, replacement: (m, p1) => {
            const skillName = getSkillName(p1);
            return `Counter skill: "${skillName}"`;
        }},
        
        // Simple tags without parameters
        { regex: /<運無視ステート付与>/g, replacement: () => `Ignores luck for state application` },
        { regex: /<運無視弱体付与>/g, replacement: () => `Ignores luck for debuff application` },
        { regex: /<反撃可能>/g, replacement: () => `Can counter` },
        
        // Weapon-specific patterns
        { regex: /<攻撃ID変更:(\d+)>/g, replacement: (m, p1) => {
            const skillName = getSkillName(p1);
            return `Changes attack to: "${skillName}"`;
        }},
        { regex: /初期武器：(.+)/g, replacement: (m, p1) => {
            const classNames = {
                "聖職者": "Cleric",
                "騎士": "Knight",
                "盗賊": "Thief",
                "魔術師": "Mage",
                "戦士": "Warrior",
                "狩人": "Hunter",
                "探索者": "Explorer",
                "もこもこ": "Mokomoko"
            };
            const className = classNames[p1] || p1;
            return `Initial weapon: ${className}`;
        }},
        { regex: /スケルトン　ドロップ|スケルトンドロップ/g, replacement: () => `Dropped by skeleton` },
        { regex: /公爵夫人の館/g, replacement: () => `Duchess's Mansion` },
        // Order matters: more specific patterns first
        { regex: /リデル墓地　井戸/g, replacement: () => `Liddell Cemetery Well` },
        { regex: /リデル墓地/g, replacement: () => `Liddell Cemetery` },
        
        // HP recovery patterns
        { regex: /<HP回復無効:(\d+)>/g, replacement: (m, p1) => `HP recovery disabled (${p1}%)` },
        { regex: /<HP回復反転:(\d+)>/g, replacement: (m, p1) => `HP recovery reversed (${p1}%)` },
        { regex: /<保存禁止>/g, replacement: () => `Save disabled` },
        { regex: /<必中絶対回避>/g, replacement: () => `Always hits, absolute evasion` },
        
        // Hit patterns
        { regex: /<物理絶対命中>/g, replacement: () => `Physical attacks always hit` },
        { regex: /<魔法絶対命中>/g, replacement: () => `Magic attacks always hit` },
        
        // Skill/item patterns
        { regex: /<アイテム封印>/g, replacement: () => `Items sealed` },
        { regex: /<スキル無効:(\d+)>/g, replacement: (m, p1) => {
            const skillName = getSkillName(p1);
            return `Skill disabled: "${skillName}"`;
        }},
        { regex: /<全回避時スキル:(\d+)>/g, replacement: (m, p1) => {
            const skillName = getSkillName(p1);
            return `On full evasion: Casts "${skillName}"`;
        }},
        
        // State removal patterns
        { regex: /<強制自然解除時ステート:(\d+)>/g, replacement: (m, p1) => {
            const stateName = getStateName(p1);
            return `When naturally removed: Applies "${stateName}"`;
        }},
        
        // Bonus patterns
        { regex: /バンスナ特攻/g, replacement: () => `Bandersnatch bonus damage` },
        
        // Location names
        { regex: /スケルトン　ドロップ|スケルトンドロップ/g, replacement: () => `Dropped by skeleton` },
        { regex: /燻りの森/g, replacement: () => `Smoldering Forest` },
        { regex: /茸村/g, replacement: () => `Mushroom Village` },
        { regex: /オイスター/g, replacement: () => `Oyster` },
        { regex: /名無しの森/g, replacement: () => `Nameless Forest` },
        { regex: /オックス・ウォード/g, replacement: () => `Ox Ward` },
        { regex: /ウサギ穴/g, replacement: () => `Rabbit Hole` },
        // Order matters: more specific patterns first
        { regex: /無限食　ミミック/g, replacement: () => `Infinite Food Mimic` },
        { regex: /無限食物|無限食/g, replacement: () => `Infinite Food` },
        { regex: /公爵館　ミミック/g, replacement: () => `Duchess's Mansion Mimic` },
        { regex: /公爵館|公爵夫人の館|侯爵夫人の館/g, replacement: () => `Duchess's Mansion` },
        { regex: /精神病棟/g, replacement: () => `Psychiatric Ward` },
        { regex: /ハイン/g, replacement: () => `Hain` },
        { regex: /ヴァーナイイベント/g, replacement: () => `Vernai event` },
        { regex: /バンスナソウル/g, replacement: () => `Bandersnatch Soul` },
        { regex: /ケッチドロップ/g, replacement: () => `Dropped by Ketch` },
        { regex: /カルキノスドロップ/g, replacement: () => `Dropped by Karkinos` },
        { regex: /橋のたもと/g, replacement: () => `Foot of the bridge` },
        { regex: /血涙の池/g, replacement: () => `Blood Tears Pool` },
        { regex: /血涙/g, replacement: () => `Blood Tears` },
        // Order matters: more specific patterns first - "ぺろぺろちょうだい" must come before "ぺろぺろ"
        { regex: /ぺろぺろちょうだい！でのちいさなメダル的立場/g, replacement: () => `Lick Lick Please! Small Medal position` },
        { regex: /ぺろぺろちょうだい/g, replacement: () => `Lick Lick Please` },
        { regex: /ぺろぺろバード/g, replacement: () => `Lick Lick Bird` },
        { regex: /ジャブジャブ落/g, replacement: () => `Jab Jab Drop` },
        { regex: /ぺろぺろ/g, replacement: () => `Lick Lick` },
        // Order matters: more specific patterns first
        { regex: /リポン　ミミック/g, replacement: () => `Ribbon Mimic` },
        { regex: /リポン大聖堂|リポン/g, replacement: () => `Ribbon Cathedral` },
        { regex: /霧の公園/g, replacement: () => `Fog Park` },
        { regex: /昇降機/g, replacement: () => `Elevator` },
        { regex: /刑史のビースト/g, replacement: () => `Executioner's Beast` },
        { regex: /ウミガメモドキ|ウミガメレストラン/g, replacement: () => `Sea Turtle Restaurant` },
        { regex: /クリミア/g, replacement: () => `Crimia` },
        { regex: /ジャバソウル/g, replacement: () => `Jabberwock Soul` },
        { regex: /ジャブソウル/g, replacement: () => `Jab Soul` },
        { regex: /嘆きの浜辺/g, replacement: () => `Beach of Sorrow` },
        { regex: /混沌ダンジョン/g, replacement: () => `Chaos Dungeon` },
        
        // More location names
        { regex: /フリッセル/g, replacement: () => `Frisell` },
        // Order matters: more specific patterns first
        { regex: /ラドウィッジ街　上層|ラドウィッジ街上層/g, replacement: () => `Radowitz Street Upper Level` },
        { regex: /ラドウィッジ上層/g, replacement: () => `Radowitz Upper Level` },
        { regex: /ラドウィッジ市街/g, replacement: () => `Radowitz City` },
        { regex: /ラドウィッジ街/g, replacement: () => `Radowitz Street` },
        { regex: /ラドウィッジ/g, replacement: () => `Radowitz` },
        { regex: /屠殺場/g, replacement: () => `Slaughterhouse` },
        { regex: /病みたる時計塔|時計塔/g, replacement: () => `Sick Clock Tower` },
        { regex: /心臓の庭園/g, replacement: () => `Garden of Hearts` },
        { regex: /帽子屋/g, replacement: () => `Hatter's House` },
        { regex: /ウィンターベル/g, replacement: () => `Winterbell` },
        { regex: /胞子の森/g, replacement: () => `Spore Forest` },
        { regex: /憂さ晴らしソウル/g, replacement: () => `Vent Souls` },
        { regex: /フランクリンボルヴォルト/g, replacement: () => `Franklin Boltvolt` },
        { regex: /カキお使い/g, replacement: () => `Oyster Messenger` },
        { regex: /イグゾー/g, replacement: () => `Igzo` },
        { regex: /クイーン・ランド/g, replacement: () => `Queen's Land` },
        { regex: /深海/g, replacement: () => `Deep Sea` },
        { regex: /ジャックのソウル/g, replacement: () => `Jack's Soul` },
        { regex: /キャプテン・キッド/g, replacement: () => `Captain Kidd` },
        { regex: /エレバス号/g, replacement: () => `Erebus` },
        { regex: /船の墓場/g, replacement: () => `Ship Graveyard` },
        { regex: /船乗り　ドロップ/g, replacement: () => `Dropped by sailor` },
        { regex: /ビリングズゲート/g, replacement: () => `Billingsgate` },
        { regex: /首切り案内所/g, replacement: () => `Executioner's Office` },
        { regex: /酒場/g, replacement: () => `Tavern` },
        { regex: /キャロル川/g, replacement: () => `Carroll River` },
        { regex: /魔女の家の残骸/g, replacement: () => `Witch's House Ruins` },
        { regex: /亡者コック/g, replacement: () => `Undead Cook` },
        { regex: /一角獣の森/g, replacement: () => `Unicorn Forest` },
        { regex: /獅子の砦/g, replacement: () => `Lion's Fortress` },
        { regex: /雪原/g, replacement: () => `Snowfield` },
        // Order matters: more specific patterns first
        { regex: /白の城下町/g, replacement: () => `White Castle Town` },
        { regex: /白の城下街/g, replacement: () => `White Castle Town Street` },
        { regex: /白の城下/g, replacement: () => `White Castle Town` },
        { regex: /冬鐘の風のソウル/g, replacement: () => `Winter Bell Wind's Soul` },
        { regex: /狂気山脈/g, replacement: () => `Madness Mountain Range` },
        
        // Character/Enemy names
        { regex: /グール　ドロップ/g, replacement: () => `Dropped by Ghoul` },
        { regex: /ドロップ　紳士/g, replacement: () => `Dropped by Gentleman` },
        { regex: /マリー・ハドソンイベント　死体/g, replacement: () => `Mary Hudson event corpse` },
        { regex: /ソニー・ビーン/g, replacement: () => `Sonny Bean` },
        { regex: /アーチボルド/g, replacement: () => `Archibald` },
        { regex: /フレデリック/g, replacement: () => `Frederick` },
        { regex: /逃亡騎士ジム/g, replacement: () => `Fleeing Knight Jim` },
        { regex: /悪夢霊　アメリア|悪夢霊/g, replacement: () => `Nightmare Spirit Amelia` },
        { regex: /クリスティ/g, replacement: () => `Christie` },
        { regex: /ハロルド/g, replacement: () => `Harold` },
        { regex: /ピエロ/g, replacement: () => `Pierrot` },
        { regex: /スウィーニートッド/g, replacement: () => `Sweeney Todd` },
        { regex: /パンプキン・オー/g, replacement: () => `Pumpkin O` },
        { regex: /ブージャム/g, replacement: () => `Boojam` },
        { regex: /ブッチャーのソウル/g, replacement: () => `Butcher's Soul` },
        { regex: /バイロン/g, replacement: () => `Byron` },
        { regex: /巨人の家のソウル/g, replacement: () => `Giant's House Soul` },
        { regex: /ハノーヴァー/g, replacement: () => `Hanover` },
        { regex: /ハートの騎士のソウル/g, replacement: () => `Heart Knight's Soul` },
        { regex: /スペードの騎士のソウル/g, replacement: () => `Spade Knight's Soul` },
        { regex: /クラブの騎士のソウル/g, replacement: () => `Club Knight's Soul` },
        { regex: /童話コンプリート/g, replacement: () => `Fairy Tale Complete` },
        { regex: /クティ/g, replacement: () => `Kuti` },
        // Order matters: more specific patterns first
        { regex: /黒髭の背後に存在/g, replacement: () => `Exists behind Blackbeard` },
        { regex: /黒髭を倒すと消滅/g, replacement: () => `Disappears when Blackbeard is defeated` },
        { regex: /黒髭/g, replacement: () => `Blackbeard` },
        { regex: /カーナッキ/g, replacement: () => `Carnacki` },
        { regex: /リンダメア/g, replacement: () => `Lindamear` },
        { regex: /メイベル/g, replacement: () => `Mabel` },
        { regex: /ランジェリーナ/g, replacement: () => `Lingerina` },
        { regex: /麻袋女/g, replacement: () => `Sack Woman` },
        { regex: /ジキルとハイド/g, replacement: () => `Jekyll and Hyde` },
        // Order matters: more specific patterns first
        { regex: /トカゲのビル　誓約lv1/g, replacement: () => `Bill's Lizard Covenant Lv1` },
        { regex: /ビル/g, replacement: () => `Bill` },
        { regex: /イーディス/g, replacement: () => `Edith` },
        { regex: /イシュタムの天使/g, replacement: () => `Ishtam's Angel` },
        { regex: /ウェインライト/g, replacement: () => `Wayne Wright` },
        { regex: /ウサギの国/g, replacement: () => `Rabbit Country` },
        // Order matters: more specific patterns first
        { regex: /キャンディー交換/g, replacement: () => `Candy exchange` },
        { regex: /キャンディー/g, replacement: () => `Candy` },
        { regex: /クリミア看護墓地/g, replacement: () => `Crimia Nursing Cemetery` },
        { regex: /チェシャ贈り物/g, replacement: () => `Cheshire Gift` },
        { regex: /ブラウンリッグ/g, replacement: () => `Brownrigg` },
        { regex: /ブラックウェル　魔獣/g, replacement: () => `Blackwell Demon Beast` },
        { regex: /ヘイグ/g, replacement: () => `Hague` },
        { regex: /ぺろぺろちょうだい/g, replacement: () => `Lick Lick Please` },
        { regex: /ぺろぺろバード/g, replacement: () => `Lick Lick Bird` },
        { regex: /仲間出現/g, replacement: () => `Companion appears` },
        { regex: /公爵館　ミミック/g, replacement: () => `Duchess's Mansion Mimic` },
        { regex: /図書室の夢/g, replacement: () => `Library Dream` },
        { regex: /死体盗みヘア/g, replacement: () => `Corpse Thief Hair` },
        { regex: /輝星のビーストソウル/g, replacement: () => `Shining Star Beast's Soul` },
        
        // Special patterns
        { regex: /<自動蘇生:(\d+),(\d+),(\d+)>/g, replacement: (m, p1, p2, p3) => {
            const stateName = getStateName(p2);
            return `Auto-revive: ${p1} HP, applies "${stateName}" (${p3}% chance)`;
        }},
        { regex: /<自動蘇生破損:(\d+)>/g, replacement: (m, p1) => `Auto-revive break chance: ${p1}%` },
        { regex: /<戦闘前強化付与:(\d+),(\d+),(\d+)>/g, replacement: (m, p1, p2, p3) => {
            const stateName = getStateName(p1);
            return `Before battle: ${p3}% chance to apply "${stateName}" (${p2} turns)`;
        }},
        { regex: /死んだ回数(\d+)/g, replacement: (m, p1) => `Death count: ${p1}` },
        
        // Depth patterns - order matters: full phrases first before partial matches
        { regex: /深度１　１体ずつ/g, replacement: () => `Depth 1: One at a time` },
        { regex: /深度２　全員相手/g, replacement: () => `Depth 2: All opponents` },
        
        // Initial weapon/location patterns - handle "初期\nLocation" format
        { regex: /初期武器：(.+)/g, replacement: (m, p1) => {
            const classNames = {
                "聖職者": "Cleric",
                "騎士": "Knight",
                "盗賊": "Thief",
                "魔術師": "Mage",
                "戦士": "Warrior",
                "狩人": "Hunter",
                "探索者": "Explorer",
                "もこもこ": "Mokomoko"
            };
            const className = classNames[p1] || p1;
            return `Initial weapon: ${className}`;
        }},
        { regex: /初期\n([^\n]+)/g, replacement: (m, p1) => {
            // Translate the location part if it's still in Japanese
            let location = p1;
            // Location will be translated by other patterns
            return `Initial: ${location}`;
        }},
        { regex: /^初期\s*$/gm, replacement: () => `Initial` },
        { regex: /^初期$/gm, replacement: () => `Initial` },
        
        // Weapon notes
        { regex: /老騎士のソウル|首狩りのソウル/g, replacement: () => `Soul` },
        { regex: /神殿騎士/g, replacement: () => `Temple Knight` },
        
        // Battle state patterns
        { regex: /<戦闘前ステート付与:(\d+),(\d+)>/g, replacement: (m, p1, p2) => {
            const stateName = getStateName(p1);
            return `Before battle: ${p2}% chance to apply "${stateName}"`;
        }},
        { regex: /<戦闘前強化付与:(\d+),(\d+),(\d+)>/g, replacement: (m, p1, p2, p3) => {
            const stateName = getStateName(p1);
            return `Before battle: ${p3}% chance to apply "${stateName}" (${p2} turns)`;
        }},
        { regex: /<自動蘇生:(\d+),(\d+),(\d+)>/g, replacement: (m, p1, p2, p3) => {
            const stateName = getStateName(p2);
            return `Auto-revive: ${p1} HP, applies "${stateName}" (${p3}% chance)`;
        }},
        
        // Location patterns
        { regex: /場所：(.+)/g, replacement: (m, p1) => {
            // Handle location name translations
            const locationTranslations = {
                "ケッチドロップ": "Dropped by Ketch",
                "スケルトンドロップ": "Dropped by skeleton"
            };
            const location = locationTranslations[p1] || p1;
            return `Location: ${location}`;
        }},
        
        // General terms - order matters: more specific first
        { regex: /混沌ダンジョン/g, replacement: () => `Chaos Dungeon` },
        { regex: /混沌/g, replacement: () => `Chaos` },
        
        // Synthesis patterns
        // Format: <合成設定:category,itemId,quantity>
        // Parameter 1: Category (0 = item synthesis)
        // Parameter 2: Item ID used as currency (49 = Candy)
        // Parameter 3: Quantity required
        { regex: /<合成設定:(\d+),(\d+),(\d+)>/g, replacement: (m, p1, p2, p3) => {
            const quantity = parseInt(p3);
            const itemId = parseInt(p2);
            // Item ID 49 is "Candy" - the synthesis currency
            if (itemId === 49) {
                return `Cost: ${quantity} ${quantity === 1 ? 'Candy' : 'Candies'}`;
            }
            // Fallback for other item IDs (if any exist)
            return `Cost: ${quantity} × Item #${itemId}`;
        }}
    ];
    
    // Apply all pattern-based translations FIRST
    // Apply patterns multiple times until no more matches (in case patterns create new matches)
    let changed = true;
    while (changed) {
        changed = false;
    for (const pattern of patterns) {
            pattern.regex.lastIndex = 0; // Reset regex state
        if (pattern.regex.test(english)) {
                pattern.regex.lastIndex = 0; // Reset again before replace
                const newEnglish = english.replace(pattern.regex, pattern.replacement);
                if (newEnglish !== english) {
                    english = newEnglish;
            hasTranslation = true;
                    changed = true;
                }
            }
        }
    }
    
    // Then apply simple text translations for any remaining Japanese text
    // Apply translations multiple times until no more matches
    // IMPORTANT: Process longer/more specific translations first to avoid conflicts
    // Sort translations by length (longest first) to handle nested patterns correctly
    const sortedTranslations = Object.entries(translations).sort((a, b) => b[0].length - a[0].length);
    
    changed = true;
    while (changed) {
        changed = false;
        for (const [jpn, eng] of sortedTranslations) {
            if (english.includes(jpn)) {
                // Skip if this translation would create a duplicate (e.g., if we already have the bracketed version)
                // Check if the English translation already exists in the text
                if (jpn.includes('[') && eng.includes('[')) {
                    // This is a bracketed translation - check if the unbracketed version is already in the text
                    const unbracketedJpn = jpn.replace(/[\[\]]/g, '');
                    const unbracketedEng = eng.replace(/[\[\]]/g, '');
                    // If the unbracketed English is already in the text and we're about to add the bracketed version,
                    // skip to avoid creating duplicates
                    if (english.includes(unbracketedEng) && !english.includes(eng)) {
                        // Only add if the bracketed version isn't already there
                        continue;
                    }
                } else if (!jpn.includes('[') && eng.includes('[')) {
                    // This is an unbracketed -> bracketed translation
                    // Skip if the bracketed version is already in the text
                    const bracketedEng = `[${eng}]`;
                    if (english.includes(bracketedEng)) {
                        continue;
                    }
                }
                
                english = english.replace(new RegExp(jpn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), eng);
                hasTranslation = true;
                changed = true;
            }
        }
    }
    
    // Detect if there's still Japanese text remaining (untranslated)
    // Do this BEFORE newline filtering to catch any remaining Japanese
    const hasUntranslated = containsJapanese(english);
    
    // Handle newlines - replace \n with proper line breaks in display
    if (english.includes('\n')) {
        english = english.split('\n').filter(line => line.trim() !== '').join('\n');
    }
    
    // If we have translation but there's still Japanese, log it
    // Only warn if there's actually untranslated content (not just empty string)
    if (hasUntranslated && hasTranslation && english.trim() !== '') {
        console.warn(`⚠️  Partially untranslated ${sourceType} (ID: ${sourceId}): "${originalNote.substring(0, 100)}..."`);
    }
    
    // If no translation was found at all but there's Japanese text, keep it visible
    if (!hasTranslation && hasUntranslated && english.trim() !== '') {
        console.warn(`⚠️  Completely untranslated ${sourceType} (ID: ${sourceId}): "${originalNote.substring(0, 100)}..."`);
        // Keep the original Japanese visible so we know it needs translation
        english = originalNote;
    }
    
    return {
        english: hasTranslation || hasUntranslated ? english : "",
        japanese: note,
        untranslated: hasUntranslated
    };
}

// Create ID resolvers for all object types (available globally for processing)
const idResolvers = createIDResolvers(skillsData, statesData, weaponsData, armorsData, itemsData, enemiesData);

// Process skills data
const processedSkills = skillsData
    .filter(skill => skill !== null) // Remove null entries
    .filter(skill => skill.name && skill.name.trim() !== '') // Remove nameless skills
    .map(skill => {
        const translated = translateNote(skill.note, skillsData, statesData, 'skill', skill.id);
        
        // Check for untranslated Japanese in name and description
        let skillName = convertJapanesePunctuation(skill.name);
        let skillDescription = convertJapanesePunctuation(skill.description);
        
        // Resolve ID references in text
        skillName = resolveAndLog(skillName, idResolvers, 'skill', skill.id, 'name');
        skillDescription = resolveAndLog(skillDescription, idResolvers, 'skill', skill.id, 'description');
        if (translated.english) {
            translated.english = resolveAndLog(translated.english, idResolvers, 'skill', skill.id, 'note');
        }
        
        if (translated.english) {
            // Note translation already processed
        }
        
        if (containsJapanese(skillName)) {
            console.warn(`⚠️  Untranslated Japanese in skill name (ID: ${skill.id}): "${skillName}"`);
        }
        if (containsJapanese(skillDescription)) {
            console.warn(`⚠️  Untranslated Japanese in skill description (ID: ${skill.id}): "${skillDescription.substring(0, 100)}..."`);
        }
        
        return {
            id: skill.id,
            name: skillName,
            description: skillDescription,
            iconIndex: skill.iconIndex,
            mpCost: skill.mpCost,
            // NOTE: tpCost and tpGain have been removed - DO NOT add them back
            message1: (() => {
                let msg = convertJapanesePunctuation(skill.message1);
                msg = resolveAndLog(msg, idResolvers, 'skill', skill.id, 'message1');
                if (containsJapanese(msg)) {
                    console.warn(`⚠️  Untranslated Japanese in skill message1 (ID: ${skill.id}): "${msg.substring(0, 100)}..."`);
                }
                return msg;
            })(),
            message2: (() => {
                let msg = convertJapanesePunctuation(skill.message2);
                msg = resolveAndLog(msg, idResolvers, 'skill', skill.id, 'message2');
                if (containsJapanese(msg)) {
                    console.warn(`⚠️  Untranslated Japanese in skill message2 (ID: ${skill.id}): "${msg.substring(0, 100)}..."`);
                }
                return msg;
            })(),
            
            // Resolved names
            scope: {
                id: skill.scope,
                name: scopeTypes[skill.scope] || `Unknown (${skill.scope})`
            },
            occasion: {
                id: skill.occasion,
                name: occasionTypes[skill.occasion] || `Unknown (${skill.occasion})`
            },
            hitType: {
                id: skill.hitType,
                name: hitTypes[skill.hitType] || `Unknown (${skill.hitType})`
            },
            skillType: {
                id: skill.stypeId,
                name: skillTypes[skill.stypeId] || "None"
            },
            
            // Damage information
            damage: {
                type: {
                    id: skill.damage.type,
                    name: damageTypes[skill.damage.type] || "None"
                },
                element: {
                    id: skill.damage.elementId,
                    name: skill.damage.elementId === -1 ? "Normal Attack" : 
                          skill.damage.elementId === 0 ? "None" :
                          (() => {
                              const elementName = elements[skill.damage.elementId] || `Unknown`;
                              // Create cross-reference for actual elements (> 0): [[ELEMENT:ID:NAME]]
                              return skill.damage.elementId > 0 
                                  ? `[[ELEMENT:${skill.damage.elementId}:${elementName}]]`
                                  : elementName;
                          })()
                },
                formula: skill.damage.formula,
                readableFormula: skill.damage.formula ? skill.damage.formula
                    .replace(/a\.atk/g, "Attacker's ATK")
                    .replace(/a\.def/g, "Attacker's DEF")
                    .replace(/a\.mat/g, "Attacker's MAT")
                    .replace(/a\.mdf/g, "Attacker's MDF")
                    .replace(/a\.agi/g, "Attacker's AGI")
                    .replace(/a\.luk/g, "Attacker's LUK")
                    .replace(/a\.hp/g, "Attacker's HP")
                    .replace(/a\.mp/g, "Attacker's MP")
                    .replace(/a\.mhp/g, "Attacker's Max HP")
                    .replace(/a\.mmp/g, "Attacker's Max MP")
                    .replace(/b\.def/g, "Target's DEF")
                    .replace(/b\.mdf/g, "Target's MDF")
                    .replace(/b\.atk/g, "Target's ATK")
                    .replace(/b\.mat/g, "Target's MAT")
                    .replace(/b\.agi/g, "Target's AGI")
                    .replace(/b\.luk/g, "Target's LUK")
                    .replace(/b\.hp/g, "Target's HP")
                    .replace(/b\.mp/g, "Target's MP")
                    .replace(/b\.mhp/g, "Target's Max HP")
                    .replace(/b\.mmp/g, "Target's Max MP") : "",
                variance: skill.damage.variance,
                critical: skill.damage.critical
            },
            
            // Other stats
            successRate: skill.successRate,
            repeats: skill.repeats,
            speed: skill.speed,
            animationId: skill.animationId,
            
            // Required weapon types
            requiredWeaponTypes: [
                skill.requiredWtypeId1 > 0 ? weaponTypes[skill.requiredWtypeId1] : null,
                skill.requiredWtypeId2 > 0 ? weaponTypes[skill.requiredWtypeId2] : null
            ].filter(Boolean),
            
            // Process effects - filter out meaningless ones
            effects: skill.effects
                .filter(effect => {
                    // Filter out placeholder/meaningless effects
                    if ((effect.code === 21 || effect.code === 22) && effect.dataId === 0) return false;
                    return true;
                })
                .map(effect => {
                    // CRITICAL: Always preserve original raw values from JSON file for "Show Original Data" feature
                    // These are the ONLY values that should be shown when displaying "original data"
                    // DO NOT add processed/transformed values (like chance, stateName, percent, etc.) to original data display
                    // Always preserve these raw values - they come directly from the original JSON file
                    // Assign them directly in the object initialization (same approach as items) to ensure they're always included
                    const effectInfo = {
                        code: effect.code,
                        codeName: effectCodes[effect.code] || `Unknown Effect`,
                        description: ""
                    };
                    
                    // CRITICAL: Always preserve raw values from original JSON - these are essential for "Show Original Data"
                    // These must be preserved exactly as they appear in the original JSON file
                    // The original JSON always has these properties, so assign them directly (same as items processing)
                    // IMPORTANT: Assign these BEFORE any processing that might modify the object
                    if (effect.dataId !== undefined) {
                        effectInfo.dataId = effect.dataId;
                    }
                    if (effect.value1 !== undefined) {
                        effectInfo.value1 = effect.value1;
                    }
                    if (effect.value2 !== undefined) {
                        effectInfo.value2 = effect.value2;
                    }
                    
                    // Add specific descriptions based on effect code - no IDs shown
                    if (effect.code === 21) { // Add State
                        const state = statesData.find(s => s && s.id === effect.dataId);
                        // Use state name if available, otherwise use "State #X" as fallback
                        const stateName = state?.name && state.name.trim() !== '' 
                            ? state.name 
                            : `State #${effect.dataId}`;
                        const chance = Math.round(effect.value1 * 100);
                        effectInfo.stateName = stateName;
                        effectInfo.chance = chance;
                        // Insert cross-reference marker directly
                        const stateRef = `[[STATE:${effect.dataId}:${stateName}]]`;
                        effectInfo.description = chance < 100 
                            ? `${chance}% chance to inflict ${stateRef}`
                            : `Inflict ${stateRef}`;
                    } else if (effect.code === 22) { // Remove State
                        const state = statesData.find(s => s && s.id === effect.dataId);
                        // Use state name if available, otherwise use "State #X" as fallback
                        const stateName = state?.name && state.name.trim() !== '' 
                            ? state.name 
                            : `State #${effect.dataId}`;
                        effectInfo.stateName = stateName;
                        // Insert cross-reference marker directly
                        const stateRef = `[[STATE:${effect.dataId}:${stateName}]]`;
                        effectInfo.description = `Remove ${stateRef}`;
                    } else if (effect.code === 31 || effect.code === 32) { // Buff/Debuff
                        const paramName = getBuffParameterName(effect.dataId);
                        const { turns, label } = getTurnInfo(effect.value1);
                        effectInfo.parameter = paramName;
                        effectInfo.turns = turns;
                        effectInfo.description = effect.code === 31 
                            ? `Increase ${paramName} for ${label}`
                            : `Decrease ${paramName} for ${label}`;
                    } else if (effect.code === 33 || effect.code === 34) { // Remove Buff/Debuff
                        const paramName = getBuffParameterName(effect.dataId);
                        effectInfo.parameter = paramName;
                        effectInfo.description = effect.code === 33 
                            ? `Remove ${paramName} increase`
                            : `Remove ${paramName} decrease`;
                    } else if (effect.code === 42) { // Raise Parameter (permanent growth)
                        const paramName = getBuffParameterName(effect.dataId);
                        const amount = Math.round(effect.value1 ?? 0);
                        effectInfo.parameter = paramName;
                        effectInfo.amount = amount;
                        const action = amount >= 0 ? 'Increase' : 'Decrease';
                        effectInfo.description = `${action} ${paramName} permanently by ${Math.abs(amount)}`;
                    } else if (effect.code === 11) { // Recover HP (can be negative for drain)
                        const percent = Math.round(effect.value1 * 100);
                        const flat = Math.round(effect.value2);
                        effectInfo.percent = percent;
                        effectInfo.flat = flat;
                        
                        // Determine if this is recovery or drain
                        const isRecovery = percent > 0 || flat > 0;
                        const action = isRecovery ? "Recover" : "Drain";
                        const absPercent = Math.abs(percent);
                        const absFlat = Math.abs(flat);
                        
                        if (absPercent > 0 && absFlat > 0) {
                            effectInfo.description = `${action} ${absPercent}% + ${absFlat} HP`;
                        } else if (absPercent > 0) {
                            effectInfo.description = `${action} ${absPercent}% HP`;
                        } else if (absFlat > 0) {
                            effectInfo.description = `${action} ${absFlat} HP`;
                        }
                    } else if (effect.code === 12) { // Recover MP (can be negative for drain)
                        const percent = Math.round(effect.value1 * 100);
                        const flat = Math.round(effect.value2);
                        effectInfo.percent = percent;
                        effectInfo.flat = flat;
                        
                        // Determine if this is recovery or drain
                        const isRecovery = percent > 0 || flat > 0;
                        const action = isRecovery ? "Recover" : "Drain";
                        const absPercent = Math.abs(percent);
                        const absFlat = Math.abs(flat);
                        
                        if (absPercent > 0 && absFlat > 0) {
                            effectInfo.description = `${action} ${absPercent}% + ${absFlat} MP`;
                        } else if (absPercent > 0) {
                            effectInfo.description = `${action} ${absPercent}% MP`;
                        } else if (absFlat > 0) {
                            effectInfo.description = `${action} ${absFlat} MP`;
                        }
                    } else if (effect.code === 41) { // Special Effect
                        effectInfo.description = specialEffectDescriptions[effect.dataId] || "Special Effect";
                    } else if (effect.code === 44) { // Common Event
                        effectInfo.description = `Trigger Common Event`;
                    }
                    
                    // Resolve ID references in effect description
                    if (effectInfo.description) {
                        effectInfo.description = resolveAndLog(effectInfo.description, idResolvers, 'skill', skill.id, 'effect');
                    }
                    
                    // CRITICAL: Ensure raw values are always present before returning
                    // These must be in the final object for "Show Original Data" to work
                    // Double-check that they're assigned (they come from the original JSON, so they should exist)
                    if (effect.dataId !== undefined) effectInfo.dataId = effect.dataId;
                    if (effect.value1 !== undefined) effectInfo.value1 = effect.value1;
                    if (effect.value2 !== undefined) effectInfo.value2 = effect.value2;
                    
                    return effectInfo;
                }),
            
            // Notes with translation
            note: translated
        };
    });

// Helper function to process traits (reusable for states and weapons)
function processTraits(traits, statesData, skillsData = null, elements = null) {
    return (traits || []).map(trait => {
        const traitInfo = {
            code: trait.code,
            codeName: stateTraitCodes[trait.code] || `Unknown Trait`,
            dataId: trait.dataId,
            value: trait.value,
            description: ""
        };
        
        // Generate readable descriptions based on trait code
        // NOTE: Only generate descriptions for codes with documented sources
        // All codes are currently marked as "Unknown" until sources are documented
        if (trait.code === 11) { // Element Rate
            if (elements && trait.dataId >= 0 && trait.dataId < elements.length) {
                const elementName = elements[trait.dataId] || `Element ${trait.dataId}`;
                const rate = trait.value;
                const ratePercent = Math.round(rate * 100);
                // Create cross-reference to element: [[ELEMENT:ID:NAME]]
                const elementRef = `[[ELEMENT:${trait.dataId}:${elementName}]]`;
                traitInfo.description = `${elementRef} damage rate: ${ratePercent}%`;
            } else {
                traitInfo.description = `Element Rate (element ${trait.dataId || '?'}, rate ${trait.value || '?'})`;
            }
        } else if (trait.code === 12) { // Debuff Rate
            // dataId: parameter ID (0-7: standard parameters)
            const paramName = parameterNames[trait.dataId] || `Parameter ${trait.dataId}`;
            const rate = trait.value;
            const ratePercent = Math.round(rate * 100);
            traitInfo.description = `${paramName} debuff rate: ${ratePercent}%`;
        } else if (trait.code === 13) { // State Rate
            const state = statesData.find(s => s && s.id === trait.dataId);
            // Use state name if available, otherwise use "State #X" as fallback
            const stateName = state?.name && state.name.trim() !== '' 
                ? state.name 
                : `State #${trait.dataId}`;
            // Insert cross-reference marker directly
            const stateRef = `[[STATE:${trait.dataId}:${stateName}]]`;
            const ratePercent = Math.round(trait.value * 100);
            traitInfo.description = `${stateRef} rate: ${ratePercent}%`;
        } else if (trait.code === 14) { // State Resist
            // FIXED: dataId is a state ID, not a parameter ID
            // Note: According to RPG Maker VX Ace documentation, the presence of this trait implies 100% resistance
            // The value is not used - just having the trait means complete immunity
            const state = statesData.find(s => s && s.id === trait.dataId);
            // Use state name if available, otherwise use "State #X" as fallback
            const stateName = state?.name && state.name.trim() !== '' 
                ? state.name 
                : `State #${trait.dataId}`;
            const stateRef = `[[STATE:${trait.dataId}:${stateName}]]`;
            traitInfo.description = `Immune to ${stateRef}`;
        } else if (trait.code === 21) { // Parameter
            // Get parameter name (0-7: standard parameters)
            let paramName = parameterNames[trait.dataId] || `Parameter ${trait.dataId}`;
            const percent = Math.round((trait.value - 1) * 100);
            traitInfo.description = percent >= 0 
                ? `${paramName} +${percent}%`
                : `${paramName} ${percent}%`;
        } else if (trait.code === 22) { // Ex-Parameter
            // Ex-Parameter: dataId is array index (0-9), maps to parameter IDs 8-16
            // SOURCE: editor-screenshot (200544.png) - parameter IDs are 8-16
            // The game data uses 0-based indices, so we map: index 0 → param 8, index 1 → param 9, etc.
            const exParamIndexToName = {
                0: "Hit Rate",              // Parameter ID 8
                1: "Evasion Rate",           // Parameter ID 9
                2: "Critical Hit Rate",      // Parameter ID 10
                3: "Critical Evasion Rate",  // Parameter ID 11
                4: "Magic Evasion Rate",     // Parameter ID 12
                5: "Magic Reflection Rate",  // Parameter ID 13
                6: "Counterattack Rate",      // Parameter ID 14
                7: "HP Regeneration Rate",   // Parameter ID 15
                8: "MP Regeneration Rate"    // Parameter ID 16
            };
            const exParamName = exParamIndexToName[trait.dataId];
            if (exParamName) {
                const percent = Math.round(trait.value * 100);
                traitInfo.description = percent >= 0 
                    ? `${exParamName} +${percent}%`
                    : `${exParamName} ${percent}%`;
            } else {
                // Unknown index - show both index and value
                const percent = Math.round(trait.value * 100);
                traitInfo.description = `Ex-Parameter ${trait.dataId} ${percent >= 0 ? '+' : ''}${percent}%`;
            }
        } else if (trait.code === 23) { // Sp-Parameter
            // Sp-Parameter: dataId is array index (0-9), maps to parameter IDs 18-27
            // SOURCE: editor-screenshot (200552.png) - parameter IDs are 18-27
            // The game data uses 0-based indices, so we map: index 0 → param 18, index 1 → param 19, etc.
            const spParamIndexToName = {
                0: "Target Rate",            // Parameter ID 18
                1: "Guard Effectiveness",     // Parameter ID 19
                2: "Recovery Effectiveness", // Parameter ID 20
                3: "Pharmacology",           // Parameter ID 21
                4: "MP Cost Rate",          // Parameter ID 22
                // 5: TP Charge Rate - removed (TP not in database, would be Parameter ID 23)
                6: "Physical Damage Rate",   // Parameter ID 24
                7: "Magical Damage Rate",    // Parameter ID 25
                8: "Floor Damage Rate",      // Parameter ID 26
                9: "Experience Rate"         // Parameter ID 27
            };
            const spParamName = spParamIndexToName[trait.dataId];
            if (spParamName) {
                const percent = Math.round((trait.value - 1) * 100);
                traitInfo.description = percent >= 0 
                    ? `${spParamName} +${percent}%`
                    : `${spParamName} ${percent}%`;
            } else {
                // Unknown index - show both index and value
                const percent = Math.round((trait.value - 1) * 100);
                traitInfo.description = `Sp-Parameter ${trait.dataId} ${percent >= 0 ? '+' : ''}${percent}%`;
            }
        } else if (trait.code === 31) { // Attack Element
            // dataId: element ID, value: not used by engine
            if (elements && trait.dataId >= 0 && trait.dataId < elements.length) {
                const elementName = elements[trait.dataId] || `Element ${trait.dataId}`;
                // Create cross-reference to element: [[ELEMENT:ID:NAME]]
                const elementRef = `[[ELEMENT:${trait.dataId}:${elementName}]]`;
                traitInfo.description = `Attack Element: ${elementRef}`;
            } else {
                traitInfo.description = `Attack Element (element ${trait.dataId || '?'})`;
            }
        } else if (trait.code === 32) { // Attack State
            // dataId: state ID, value: probability rate (0.0-1.0, where 1.0 = 100%)
            const state = statesData.find(s => s && s.id === trait.dataId);
            // Use state name if available, otherwise use "State #X" as fallback
            const stateName = state?.name && state.name.trim() !== '' 
                ? state.name 
                : `State #${trait.dataId}`;
            const stateRef = `[[STATE:${trait.dataId}:${stateName}]]`;
            const chance = Math.round(trait.value * 100);
            traitInfo.description = `${chance}% chance to inflict ${stateRef}`;
        } else if (trait.code === 33) { // Attack Speed
            // dataId: typically 0, value: speed modifier
            const speedMod = trait.value;
            const percent = Math.round((speedMod - 1) * 100);
            traitInfo.description = percent >= 0 
                ? `Attack speed +${percent}%`
                : `Attack speed ${percent}%`;
        } else if (trait.code === 34) { // Attack Times+
            // dataId: typically 0, value: number of additional attacks
            const additionalAttacks = trait.value;
            traitInfo.description = additionalAttacks >= 0 
                ? `Attack times +${additionalAttacks}`
                : `Attack times ${additionalAttacks}`;
        } else if (trait.code === 41) { // Add Skill Type
            // dataId: skill type ID, value: typically 1
            const skillType = skillTypes[trait.dataId] || `Skill Type ${trait.dataId}`;
            traitInfo.description = `Add ${skillType} skill type (value: ${trait.value})`;
        } else if (trait.code === 42) { // Collapse Type
            // Collapse types: 0 = Normal, 1 = Instant, 2 = No Collapse
            const collapseTypes = {
                0: "Normal collapse",
                1: "Instant collapse",
                2: "No collapse animation"
            };
            const collapseType = collapseTypes[trait.dataId] || `Collapse type ${trait.dataId}`;
            traitInfo.description = collapseType;
        } else if (trait.code === 43) { // Add Skill
            // dataId: skill ID, value: typically 0
            if (skillsData) {
                const skill = skillsData.find(s => s && s.id === trait.dataId);
                const skillName = skill?.name || "Unknown Skill";
                const skillRef = `[[SKILL:${trait.dataId}:${skillName}]]`;
                traitInfo.description = `Add ${skillRef}`;
            } else {
                traitInfo.description = `Add Skill (ID: ${trait.dataId})`;
            }
        } else if (trait.code === 44) { // Seal Skill
            // dataId: skill ID, value: typically 0
            if (skillsData) {
                const skill = skillsData.find(s => s && s.id === trait.dataId);
                const skillName = skill?.name || "Unknown Skill";
                const skillRef = `[[SKILL:${trait.dataId}:${skillName}]]`;
                traitInfo.description = `Seal ${skillRef}`;
            } else {
                traitInfo.description = `Seal Skill (ID: ${trait.dataId})`;
            }
        } else if (trait.code === 51) { // Equip Weapon Type
            // dataId: weapon type ID, value: typically 1
            if (weaponTypes && trait.dataId >= 0 && trait.dataId < weaponTypes.length) {
                const weaponType = weaponTypes[trait.dataId] || `Weapon Type ${trait.dataId}`;
                traitInfo.description = `Equip ${weaponType}`;
            } else {
                traitInfo.description = `Equip Weapon Type ${trait.dataId}`;
            }
        } else if (trait.code === 52) { // Equip Armor Type
            // dataId: armor type ID, value: typically 1
            if (armorTypes && trait.dataId >= 0 && trait.dataId < armorTypes.length) {
                const armorType = armorTypes[trait.dataId] || `Armor Type ${trait.dataId}`;
                traitInfo.description = `Equip ${armorType}`;
            } else {
                traitInfo.description = `Equip Armor Type ${trait.dataId}`;
            }
        } else if (trait.code === 53) { // Fix Equip
            // dataId: equipment slot ID (0-4: Weapon, Shield, Head, Body, Accessory), value: typically 1
            const equipSlots = ["Weapon", "Shield", "Head", "Body", "Accessory"];
            const slotName = equipSlots[trait.dataId] || `Slot ${trait.dataId}`;
            traitInfo.description = `Fix ${slotName} equipment`;
        } else if (trait.code === 54) { // Seal Equip
            // dataId: equipment slot ID (0-4: Weapon, Shield, Head, Body, Accessory), value: typically 1
            const equipSlots = ["Weapon", "Shield", "Head", "Body", "Accessory"];
            const slotName = equipSlots[trait.dataId] || `Slot ${trait.dataId}`;
            traitInfo.description = `Seal ${slotName} equipment`;
        } else if (trait.code === 55) { // Slot Type
            // dataId: slot type ID, value: typically 1
            const slotType = equipTypes[trait.dataId] || `Slot Type ${trait.dataId}`;
            traitInfo.description = `Slot Type: ${slotType}`;
        } else if (trait.code === 61) { // Action Times+
            // dataId: typically 0, value: action count modifier (e.g., 2.0 = double actions)
            const actionMod = trait.value;
            const percent = Math.round((actionMod - 1) * 100);
            traitInfo.description = percent >= 0 
                ? `Action count +${percent}% (${actionMod}x)`
                : `Action count ${percent}% (${actionMod}x)`;
        } else if (trait.code === 62) { // Special Flag
            // dataId: special flag ID, value: typically 1
            // Common flags: 0 = Auto Battle, 1 = Guard, 2 = Substitute, 3 = Preserve TP, 4 = Add State Type
            const specialFlags = {
                0: "Auto Battle",
                1: "Guard",
                2: "Substitute",
                3: "Preserve TP",
                4: "Add State Type"
            };
            const flagName = specialFlags[trait.dataId] || `Special Flag ${trait.dataId}`;
            traitInfo.description = flagName;
        } else if (trait.code === 63) { // Collapse Effect
            // dataId: collapse effect ID, value: typically 1
            // This is different from code 42 (Collapse Type) - this affects the visual effect
            const collapseEffects = {
                0: "Normal collapse effect",
                1: "Boss collapse effect",
                2: "Instant collapse effect"
            };
            const effectName = collapseEffects[trait.dataId] || `Collapse Effect ${trait.dataId}`;
            traitInfo.description = effectName;
        } else if (trait.code === 64) { // Party Ability
            // dataId: party ability ID, value: typically 1
            // Common abilities: 0 = Encounter Half, 1 = Encounter None, 2 = Cancel Surprise, 3 = Raid, 4 = Gold Double
            const partyAbilities = {
                0: "Encounter Half",
                1: "Encounter None",
                2: "Cancel Surprise",
                3: "Raid",
                4: "Gold Double"
            };
            const abilityName = partyAbilities[trait.dataId] || `Party Ability ${trait.dataId}`;
            traitInfo.description = abilityName;
        }
        
        // If no description was set, use the code name
        if (!traitInfo.description) {
            traitInfo.description = traitInfo.codeName;
        }
        
        return traitInfo;
    });
}

// Process states data
const processedStates = statesData
    .filter(state => state !== null) // Remove null entries
    .map(state => {
        let translated = translateNote(state.note, skillsData, statesData, 'state', state.id);
        
        // Resolve ID references in translated note
        if (translated.english) {
            translated.english = resolveAndLog(translated.english, idResolvers, 'state', state.id, 'note');
        }
        
        // Process traits - map to readable descriptions
        const traits = processTraits(state.traits, statesData, skillsData, elements);
        
        // Resolve ID references in trait descriptions
        traits.forEach(trait => {
            if (trait.description) {
                trait.description = resolveAndLog(trait.description, idResolvers, 'state', state.id, 'trait');
            }
        });
        
        // Check for untranslated Japanese in state name and messages
        // Handle empty names - use fallback if name is empty
        let stateName = state.name ? convertJapanesePunctuation(state.name) : `State #${state.id}`;
        stateName = resolveAndLog(stateName, idResolvers, 'state', state.id, 'name');
        if (state.name && containsJapanese(stateName)) {
            console.warn(`⚠️  Untranslated Japanese in state name (ID: ${state.id}): "${stateName}"`);
        }
        
        const checkMessage = (msg, fieldName, id) => {
            let converted = convertJapanesePunctuation(msg);
            converted = resolveAndLog(converted, idResolvers, 'state', id, fieldName);
            if (containsJapanese(converted)) {
                console.warn(`⚠️  Untranslated Japanese in state ${fieldName} (ID: ${id}): "${converted.substring(0, 100)}..."`);
            }
            return converted;
        };
        
        // Build removal conditions description
        const removalConditions = [];
        if (state.removeAtBattleEnd) removalConditions.push("Removed at battle end");
        if (state.removeByDamage) removalConditions.push("Removed by damage");
        if (state.removeByRestriction) removalConditions.push("Removed by restriction");
        if (state.removeByWalking) removalConditions.push(`Removed after ${state.stepsToRemove} steps`);
        if (state.restriction > 0) {
            removalConditions.push(`Restriction: ${restrictionTypes[state.restriction] || "Unknown"}`);
        }
        
        return {
            id: state.id,
            name: stateName,
            iconIndex: state.iconIndex,
            message1: checkMessage(state.message1, 'message1', state.id),
            message2: checkMessage(state.message2, 'message2', state.id),
            message3: checkMessage(state.message3, 'message3', state.id),
            message4: checkMessage(state.message4, 'message4', state.id),
            minTurns: state.minTurns,
            maxTurns: state.maxTurns,
            duration: state.minTurns === state.maxTurns 
                ? `${state.minTurns} ${state.minTurns === 1 ? 'turn' : 'turns'}`
                : `${state.minTurns}-${state.maxTurns} turns`,
            priority: state.priority,
            autoRemovalTiming: {
                id: state.autoRemovalTiming,
                name: autoRemovalTimings[state.autoRemovalTiming] || "Unknown"
            },
            chanceByDamage: state.chanceByDamage,
            removalConditions: removalConditions,
            restriction: {
                id: state.restriction,
                name: restrictionTypes[state.restriction] || "None"
            },
            traits: traits,
            motion: state.motion,
            overlay: state.overlay,
            note: translated
        };
    });

// Process weapons data
const processedWeapons = weaponsData
    .filter(weapon => weapon !== null) // Remove null entries
    .filter(weapon => weapon.name && weapon.name.trim() !== '') // Remove nameless weapons
    .map(weapon => {
        const translated = translateNote(weapon.note, skillsData, statesData, 'weapon', weapon.id);
        
        // Resolve ID references in translated note
        if (translated.english) {
            translated.english = resolveAndLog(translated.english, idResolvers, 'weapon', weapon.id, 'note');
        }
        
        // Process params array into readable format
        // Standard parameters (0-7), Extended parameters (8-16), Special parameters (18-27)
        const params = weapon.params || [];
        const paramBonuses = [];
        
        // Standard parameters (0-7)
        const standardParamNames = ["Max HP", "Max MP", "Attack", "Defense", "Magic Attack", "Magic Defense", "Agility", "Luck"];
        
        // Extended parameters (8-16) - SOURCE: editor-screenshot (200544.png)
        const extendedParamNames = {
            8: "Hit Rate",
            9: "Evasion Rate",
            10: "Critical Hit Rate",
            11: "Critical Evasion Rate",
            12: "Magic Evasion Rate",
            13: "Magic Reflection Rate",
            14: "Counterattack Rate",
            15: "HP Regeneration Rate",
            16: "MP Regeneration Rate"
        };
        
        // Special parameters (18-27) - SOURCE: editor-screenshot (200552.png)
        const specialParamNames = {
            18: "Target Rate",
            19: "Guard Effectiveness",
            20: "Recovery Effectiveness",
            21: "Pharmacology",
            22: "MP Cost Rate",
            24: "Physical Damage Rate",
            25: "Magical Damage Rate",
            26: "Floor Damage Rate",
            27: "Experience Rate"
        };
        
        params.forEach((value, index) => {
            if (value !== 0) {
                let paramName;
                if (index >= 0 && index <= 7) {
                    paramName = standardParamNames[index];
                } else if (extendedParamNames[index]) {
                    paramName = extendedParamNames[index];
                } else if (specialParamNames[index]) {
                    paramName = specialParamNames[index];
                } else {
                    paramName = `Unknown Parameter ${index}`;
                }
                paramBonuses.push({
                    name: paramName,
                    value: value
                });
            }
        });
        
        // Process traits using the same logic as states
        // Filter out trait code 31 with value 0 (normal attacks disabled) - this is standard for weapons
        const filteredWeaponTraits = (weapon.traits || []).filter(trait => 
            !(trait.code === 31 && trait.value === 0)
        );
        const traits = processTraits(filteredWeaponTraits, statesData, skillsData, elements);
        
        // Resolve ID references in trait descriptions
        traits.forEach(trait => {
            if (trait.description) {
                trait.description = resolveAndLog(trait.description, idResolvers, 'weapon', weapon.id, 'trait');
            }
        });
        
        // Check for untranslated Japanese in weapon name and description
        let weaponName = convertJapanesePunctuation(weapon.name);
        let weaponDescription = convertJapanesePunctuation(weapon.description);
        
        // Resolve ID references
        weaponName = resolveAndLog(weaponName, idResolvers, 'weapon', weapon.id, 'name');
        weaponDescription = resolveAndLog(weaponDescription, idResolvers, 'weapon', weapon.id, 'description');
        
        if (containsJapanese(weaponName)) {
            console.warn(`⚠️  Untranslated Japanese in weapon name (ID: ${weapon.id}): "${weaponName}"`);
        }
        if (containsJapanese(weaponDescription)) {
            console.warn(`⚠️  Untranslated Japanese in weapon description (ID: ${weapon.id}): "${weaponDescription.substring(0, 100)}..."`);
        }
        
        return {
            id: weapon.id,
            name: weaponName,
            description: weaponDescription,
            iconIndex: weapon.iconIndex,
            price: weapon.price,
            wtypeId: weapon.wtypeId,
            weaponType: {
                id: weapon.wtypeId,
                name: weaponTypes[weapon.wtypeId] || "Unknown"
            },
            etypeId: weapon.etypeId,
            params: paramBonuses,
            traits: traits,
            note: translated
        };
    });

// Process armors data
const processedArmors = armorsData
    .filter(armor => armor !== null) // Remove null entries
    .filter(armor => armor.name && armor.name.trim() !== '') // Remove nameless armors
    .map(armor => {
        const translated = translateNote(armor.note, skillsData, statesData, 'armor', armor.id);
        
        // Resolve ID references in translated note
        if (translated.english) {
            translated.english = resolveAndLog(translated.english, idResolvers, 'armor', armor.id, 'note');
        }
        
        // Process params array into readable format
        // Standard parameters (0-7), Extended parameters (8-16), Special parameters (18-27)
        const params = armor.params || [];
        const paramBonuses = [];
        
        // Standard parameters (0-7)
        const standardParamNames = ["Max HP", "Max MP", "Attack", "Defense", "Magic Attack", "Magic Defense", "Agility", "Luck"];
        
        // Extended parameters (8-16) - SOURCE: editor-screenshot (200544.png)
        const extendedParamNames = {
            8: "Hit Rate",
            9: "Evasion Rate",
            10: "Critical Hit Rate",
            11: "Critical Evasion Rate",
            12: "Magic Evasion Rate",
            13: "Magic Reflection Rate",
            14: "Counterattack Rate",
            15: "HP Regeneration Rate",
            16: "MP Regeneration Rate"
        };
        
        // Special parameters (18-27) - SOURCE: editor-screenshot (200552.png)
        const specialParamNames = {
            18: "Target Rate",
            19: "Guard Effectiveness",
            20: "Recovery Effectiveness",
            21: "Pharmacology",
            22: "MP Cost Rate",
            24: "Physical Damage Rate",
            25: "Magical Damage Rate",
            26: "Floor Damage Rate",
            27: "Experience Rate"
        };
        
        params.forEach((value, index) => {
            if (value !== 0) {
                let paramName;
                if (index >= 0 && index <= 7) {
                    paramName = standardParamNames[index];
                } else if (extendedParamNames[index]) {
                    paramName = extendedParamNames[index];
                } else if (specialParamNames[index]) {
                    paramName = specialParamNames[index];
                } else {
                    paramName = `Unknown Parameter ${index}`;
                }
                paramBonuses.push({
                    name: paramName,
                    value: value
                });
            }
        });
        
        // Process traits using the same logic as weapons/states
        const traits = processTraits(armor.traits || [], statesData, skillsData, elements);
        
        // Resolve ID references in trait descriptions
        traits.forEach(trait => {
            if (trait.description) {
                trait.description = resolveAndLog(trait.description, idResolvers, 'armor', armor.id, 'trait');
            }
        });
        
        // Check for untranslated Japanese in armor name and description
        let armorName = convertJapanesePunctuation(armor.name);
        let armorDescription = convertJapanesePunctuation(armor.description);
        
        // Resolve ID references
        armorName = resolveAndLog(armorName, idResolvers, 'armor', armor.id, 'name');
        armorDescription = resolveAndLog(armorDescription, idResolvers, 'armor', armor.id, 'description');
        
        if (containsJapanese(armorName)) {
            console.warn(`⚠️  Untranslated Japanese in armor name (ID: ${armor.id}): "${armorName}"`);
        }
        if (containsJapanese(armorDescription)) {
            console.warn(`⚠️  Untranslated Japanese in armor description (ID: ${armor.id}): "${armorDescription.substring(0, 100)}..."`);
        }
        
        return {
            id: armor.id,
            name: armorName,
            description: armorDescription,
            iconIndex: armor.iconIndex,
            price: armor.price,
            atypeId: armor.atypeId,
            armorType: {
                id: armor.atypeId,
                name: armorTypes[armor.atypeId] || "Unknown"
            },
            etypeId: armor.etypeId,
            equipSlot: {
                id: armor.etypeId,
                name: equipTypes[armor.etypeId] || "Unknown"
            },
            params: paramBonuses,
            traits: traits,
            note: translated
        };
    });

// Process enemies data
const processedEnemies = enemiesData
    .filter(enemy => enemy !== null) // Remove null entries
    .filter(enemy => enemy.name && enemy.name.trim() !== '') // Remove nameless enemies
    .map(enemy => {
        const translated = translateNote(enemy.note, skillsData, statesData, 'enemy', enemy.id);
        
        // Resolve ID references in translated note
        if (translated.english) {
            translated.english = resolveAndLog(translated.english, idResolvers, 'enemy', enemy.id, 'note');
        }
        
        // Process params array into base stats
        const params = enemy.params || [];
        const paramNames = ["Max HP", "Max MP", "Attack", "Defense", "Magic Attack", "Magic Defense", "Agility", "Luck"];
        const baseStats = {};
        params.forEach((value, index) => {
            baseStats[paramNames[index] || `Unknown Parameter ${index}`] = value;
        });
        
        // Process traits using the same logic as states
        const traits = processTraits(enemy.traits || [], statesData, skillsData, elements);
        
        // Resolve ID references in trait descriptions
        traits.forEach(trait => {
            if (trait.description) {
                trait.description = resolveAndLog(trait.description, idResolvers, 'enemy', enemy.id, 'trait');
            }
        });
        
        // Process actions array: resolve skillId to skill names and format conditions
        const actions = (enemy.actions || []).map(action => {
            const skill = skillsData.find(s => s && s.id === action.skillId);
            const skillName = skill && skill.name ? skill.name : `Skill #${action.skillId}`;
            // Insert cross-reference marker directly
            const skillRef = `[[SKILL:${action.skillId}:${skillName}]]`;
            
            // Format condition based on conditionType
            let conditionText = '';
            const conditionType = action.conditionType || 0;
            const param1 = action.conditionParam1 || 0;
            const param2 = action.conditionParam2 || 0;
            
            if (conditionType === 0) {
                // Always
                conditionText = 'Always';
            } else if (conditionType === 1) {
                // Turn No.: A + B * X
                if (param1 === 0 && param2 === 0) {
                    // Turn 0 is special (before command entry) - show 5 examples
                    const exampleTurns = Array(5).fill(0);
                    conditionText = `Turn 0 (before command entry) (e.g.: Turns ${exampleTurns.join(', ')})`;
                } else if (param2 === 0) {
                    // Single turn - show 5 examples (all the same turn since condition only applies on this turn)
                    const exampleTurns = Array(5).fill(param1);
                    conditionText = `Turn ${param1} (e.g.: Turns ${exampleTurns.join(', ')})`;
                } else {
                    // Pattern: A + B * X - calculate first 5 turns
                    const exampleTurns = [];
                    for (let x = 0; x < 5; x++) {
                        const turn = param1 + param2 * x;
                        exampleTurns.push(turn);
                    }
                    conditionText = `Turn ${param1} + ${param2} * X (e.g.: Turns ${exampleTurns.join(', ')})`;
                }
            } else if (conditionType === 2) {
                // HP: min% ~ max%
                // param2 might be stored as decimal (0.5 = 50%) or as integer (50 = 50%)
                const maxPercent = param2 < 1 ? Math.round(param2 * 100) : param2;
                if (param1 === 0 && maxPercent === 100) {
                    conditionText = 'HP: 0% ~ 100%';
                } else if (param1 === maxPercent) {
                    conditionText = `HP: ${param1}%`;
                } else {
                    conditionText = `HP: ${param1}% ~ ${maxPercent}%`;
                }
            } else if (conditionType === 3) {
                // MP: min% ~ max%
                // param2 might be stored as decimal (0.5 = 50%) or as integer (50 = 50%)
                const maxPercent = param2 < 1 ? Math.round(param2 * 100) : param2;
                if (param1 === 0 && maxPercent === 100) {
                    conditionText = 'MP: 0% ~ 100%';
                } else if (param1 === maxPercent) {
                    conditionText = `MP: ${param1}%`;
                } else {
                    conditionText = `MP: ${param1}% ~ ${maxPercent}%`;
                }
            } else if (conditionType === 4) {
                // State: resolve state ID to name
                const state = statesData.find(s => s && s.id === param1);
                const stateName = state && state.name ? state.name : `State #${param1}`;
                conditionText = `State: [[STATE:${param1}:${stateName}]]`;
            } else if (conditionType === 5) {
                // Party Level: level or above
                conditionText = `Party Level: ${param1} or Above`;
            } else if (conditionType === 6) {
                // Switch: switch ID (we don't have switch names, so show ID)
                conditionText = `Switch: #${param1} is ON`;
            } else {
                // Unknown condition type
                conditionText = `Unknown Condition (Type: ${conditionType}, Params: ${param1}, ${param2})`;
            }
            
            return {
                skillId: action.skillId,
                skillName: skillRef,
                rating: action.rating,
                conditionType: action.conditionType,
                conditionParam1: action.conditionParam1,
                conditionParam2: action.conditionParam2,
                conditionText: conditionText
            };
        });
        
        // Process dropItems array: resolve IDs based on kind
        const dropItems = (enemy.dropItems || []).map(drop => {
            let itemName = "Unknown";
            let itemRef = itemName;
            if (drop.kind === 0) {
                // Gold - keep as plain text (no cross-reference)
                itemName = `${drop.dataId} Gold`;
                itemRef = itemName;
            } else if (drop.kind === 1) {
                // Item
                const item = itemsData.find(i => i && i.id === drop.dataId);
                itemName = item && item.name ? item.name : `Item #${drop.dataId}`;
                // Insert cross-reference marker directly
                itemRef = `[[ITEM:${drop.dataId}:${itemName}]]`;
            } else if (drop.kind === 2) {
                // Weapon
                const weapon = weaponsData.find(w => w && w.id === drop.dataId);
                itemName = weapon && weapon.name ? weapon.name : `Weapon #${drop.dataId}`;
                // Insert cross-reference marker directly
                itemRef = `[[WEAPON:${drop.dataId}:${itemName}]]`;
            } else if (drop.kind === 3) {
                // Armor
                const armor = armorsData.find(a => a && a.id === drop.dataId);
                itemName = armor && armor.name ? armor.name : `Armor #${drop.dataId}`;
                // Insert cross-reference marker directly
                itemRef = `[[ARMOR:${drop.dataId}:${itemName}]]`;
            }
            return {
                kind: drop.kind,
                kindName: drop.kind === 0 ? "Gold" : drop.kind === 1 ? "Item" : drop.kind === 2 ? "Weapon" : "Armor",
                dataId: drop.dataId,
                name: itemRef,
                denominator: drop.denominator
            };
        });
        
        // Check for untranslated Japanese in enemy name
        let enemyName = convertJapanesePunctuation(enemy.name);
        
        // Resolve ID references
        enemyName = resolveAndLog(enemyName, idResolvers, 'enemy', enemy.id, 'name');
        
        if (containsJapanese(enemyName)) {
            console.warn(`⚠️  Untranslated Japanese in enemy name (ID: ${enemy.id}): "${enemyName}"`);
        }
        
        return {
            id: enemy.id,
            name: enemyName,
            iconIndex: enemy.iconIndex || 0,
            battlerName: enemy.battlerName,
            baseStats: baseStats,
            traits: traits,
            actions: actions,
            dropItems: dropItems,
            exp: enemy.exp,
            gold: enemy.gold,
            note: translated
        };
    });

// Process items data
const processedItems = itemsData
    .filter(item => item !== null) // Remove null entries
    .filter(item => item.name && item.name.trim() !== '') // Remove nameless items
    .map(item => {
        const translated = translateNote(item.note, skillsData, statesData, 'item', item.id);
        
        // Resolve ID references in translated note
        if (translated.english) {
            translated.english = resolveAndLog(translated.english, idResolvers, 'item', item.id, 'note');
        }
        
        // Process effects array: similar to traits but with value1/value2 format
        // CRITICAL: Always preserve original raw values (dataId, value1, value2) from JSON file
        // These are needed for "Show Original Data" feature - DO NOT remove them
        const effects = (item.effects || []).map(effect => {
            const effectInfo = {
                code: effect.code,
                codeName: effectCodes[effect.code] || `Unknown Effect`,
                dataId: effect.dataId,
                value1: effect.value1,
                value2: effect.value2,
                description: ""
            };
            
            // Resolve state IDs where applicable (code 21 for states)
            if (effect.code === 21) {
                const state = statesData.find(s => s && s.id === effect.dataId);
                const stateName = state && state.name ? state.name : `State #${effect.dataId}`;
                const chance = Math.round(effect.value1 * 100);
                effectInfo.stateName = stateName;
                effectInfo.chance = chance;
                // Insert cross-reference marker directly
                const stateRef = `[[STATE:${effect.dataId}:${stateName}]]`;
                effectInfo.description = chance < 100 
                    ? `${chance}% chance to inflict ${stateRef}`
                    : `Inflict ${stateRef}`;
            } else if (effect.code === 22) {
                // Remove State
                const state = statesData.find(s => s && s.id === effect.dataId);
                const stateName = state && state.name ? state.name : `State #${effect.dataId}`;
                effectInfo.stateName = stateName;
                // Insert cross-reference marker directly
                const stateRef = `[[STATE:${effect.dataId}:${stateName}]]`;
                effectInfo.description = `Remove ${stateRef}`;
            } else if (effect.code === 31 || effect.code === 32) {
                const paramName = getBuffParameterName(effect.dataId);
                const { turns, label } = getTurnInfo(effect.value1);
                effectInfo.parameter = paramName;
                effectInfo.turns = turns;
                effectInfo.description = effect.code === 31
                    ? `Increase ${paramName} for ${label}`
                    : `Decrease ${paramName} for ${label}`;
            } else if (effect.code === 33 || effect.code === 34) {
                const paramName = getBuffParameterName(effect.dataId);
                effectInfo.parameter = paramName;
                effectInfo.description = effect.code === 33
                    ? `Remove ${paramName} increase`
                    : `Remove ${paramName} decrease`;
            } else if (effect.code === 42) {
                const paramName = getBuffParameterName(effect.dataId);
                const amount = Math.round(effect.value1 ?? 0);
                const action = amount >= 0 ? 'Increase' : 'Decrease';
                effectInfo.parameter = paramName;
                effectInfo.amount = amount;
                effectInfo.description = `${action} ${paramName} permanently by ${Math.abs(amount)}`;
            } else if (effect.code === 11) {
                // HP Recover
                const percent = Math.round(effect.value1 * 100);
                effectInfo.description = `Recovers ${percent}% HP`;
            } else if (effect.code === 12) {
                // MP Recover
                const percent = Math.round(effect.value1 * 100);
                effectInfo.description = `Recovers ${percent}% MP`;
            } else if (effect.code === 41) {
                effectInfo.description = specialEffectDescriptions[effect.dataId] || "Special Effect";
            } else if (effect.code === 43) {
                // Learn Skill
                const skill = skillsData.find(s => s && s.id === effect.dataId);
                const skillName = skill && skill.name ? skill.name : `Skill #${effect.dataId}`;
                effectInfo.skillName = skillName;
                // Insert cross-reference marker directly
                const skillRef = `[[SKILL:${effect.dataId}:${skillName}]]`;
                effectInfo.description = `Learn ${skillRef}`;
            } else if (effect.code === 44) {
                // Common Event
                effectInfo.description = `Triggers common event #${effect.dataId}`;
            } else {
                effectInfo.description = `Effect code ${effect.code}, data ${effect.dataId}, value ${effect.value1}`;
            }
            
            return effectInfo;
        });
        
        // Process damage object if present
        let damageInfo = null;
        if (item.damage && item.damage.type !== 0) {
            const elementName = item.damage.elementId >= 0 && item.damage.elementId < elements.length 
                ? elements[item.damage.elementId] 
                : "Unknown";
            // Create cross-reference for actual elements: [[ELEMENT:ID:NAME]]
            // Only create cross-reference if elementId is valid (> 0)
            const element = item.damage.elementId > 0 
                ? `[[ELEMENT:${item.damage.elementId}:${elementName}]]`
                : elementName;
            damageInfo = {
                type: damageTypes[item.damage.type] || "Unknown",
                elementId: item.damage.elementId,
                element: element,
                formula: item.damage.formula,
                variance: item.damage.variance,
                critical: item.damage.critical
            };
        }
        
        // Translate item name and description
        let itemName = translateSimpleString(item.name);
        let itemDescription = translateSimpleString(item.description);
        
        // Resolve ID references
        itemName = resolveAndLog(itemName, idResolvers, 'item', item.id, 'name');
        itemDescription = resolveAndLog(itemDescription, idResolvers, 'item', item.id, 'description');
        
        // Resolve ID references in effect descriptions
        effects.forEach(effect => {
            if (effect.description) {
                effect.description = resolveAndLog(effect.description, idResolvers, 'item', item.id, 'effect');
            }
        });
        
        if (containsJapanese(itemName)) {
            console.warn(`⚠️  Untranslated Japanese in item name (ID: ${item.id}): "${itemName}"`);
        }
        if (containsJapanese(itemDescription)) {
            console.warn(`⚠️  Untranslated Japanese in item description (ID: ${item.id}): "${itemDescription.substring(0, 100)}..."`);
        }
        
        return {
            id: item.id,
            name: itemName,
            description: itemDescription,
            iconIndex: item.iconIndex,
            price: item.price,
            itypeId: item.itypeId,
            consumable: item.consumable,
            effects: effects,
            damage: damageInfo,
            occasion: item.occasion,
            occasionName: occasionTypes[item.occasion] || "Unknown",
            scope: item.scope,
            scopeName: scopeTypes[item.scope] || "Unknown",
            hitType: item.hitType,
            hitTypeName: hitTypes[item.hitType] || "Unknown",
            successRate: item.successRate,
            note: translated
        };
    });

// Process elements with cross-references
function processElements(systemData, processedSkills, processedItems, processedWeapons, processedArmors, processedStates, processedEnemies, elementTranslations, elementIconMap) {
    const rawElements = systemData.elements || [];
    const processedElements = [];
    
    rawElements.forEach((rawElement, index) => {
        const japaneseName = rawElement || "";
        // Special handling for Element #6 (Water) - empty in Japanese but named Water
        const isEmpty = index === 6 ? false : (!japaneseName || japaneseName.trim() === "");
        // Special handling for Element #6 (Water) - empty in Japanese but has English name
        const englishName = index === 6 ? "Water" : (elementTranslations[japaneseName] || japaneseName || "");
        
        // Find skills using this element
        // Skills have damage.element.id which equals skill.damage.elementId
        const skillsUsingElement = processedSkills
            .filter(skill => {
                if (!skill.damage || !skill.damage.element) return false;
                const elementId = skill.damage.element.id;
                // Exclude -1 (Normal Attack) and 0 (None), only include actual element IDs
                return elementId === index && elementId > 0;
            })
            .map(skill => ({
                id: skill.id,
                name: skill.name,
                reference: `[[SKILL:${skill.id}:${skill.name}]]`
            }));
        
        // Find items using this element
        // Items have damage.elementId directly
        const itemsUsingElement = processedItems
            .filter(item => {
                if (!item.damage) return false;
                const elementId = item.damage.elementId;
                // Exclude -1 and 0, only include actual element IDs
                return elementId === index && elementId > 0;
            })
            .map(item => ({
                id: item.id,
                name: item.name,
                reference: `[[ITEM:${item.id}:${item.name}]]`
            }));
        
        // Find element rate modifiers (Code 11: Element Rate)
        const elementRateModifiers = [];
        
        // From weapons
        processedWeapons.forEach(weapon => {
            const elementRateTraits = (weapon.traits || []).filter(trait => 
                trait.code === 11 && trait.dataId === index
            );
            elementRateTraits.forEach(trait => {
                const ratePercent = Math.round(trait.value * 100);
                // Use plain element name instead of cross-reference (avoid self-reference)
                elementRateModifiers.push({
                    sourceType: 'weapon',
                    sourceId: weapon.id,
                    sourceName: weapon.name,
                    reference: `[[WEAPON:${weapon.id}:${weapon.name}]]`,
                    rate: trait.value,
                    ratePercent: ratePercent,
                    description: `${englishName} damage rate: ${ratePercent}%`
                });
            });
        });
        
        // From armors
        processedArmors.forEach(armor => {
            const elementRateTraits = (armor.traits || []).filter(trait => 
                trait.code === 11 && trait.dataId === index
            );
            elementRateTraits.forEach(trait => {
                const ratePercent = Math.round(trait.value * 100);
                // Use plain element name instead of cross-reference (avoid self-reference)
                elementRateModifiers.push({
                    sourceType: 'armor',
                    sourceId: armor.id,
                    sourceName: armor.name,
                    reference: `[[ARMOR:${armor.id}:${armor.name}]]`,
                    rate: trait.value,
                    ratePercent: ratePercent,
                    description: `${englishName} damage rate: ${ratePercent}%`
                });
            });
        });
        
        // From states
        processedStates.forEach(state => {
            const elementRateTraits = (state.traits || []).filter(trait => 
                trait.code === 11 && trait.dataId === index
            );
            elementRateTraits.forEach(trait => {
                const ratePercent = Math.round(trait.value * 100);
                // Use plain element name instead of cross-reference (avoid self-reference)
                elementRateModifiers.push({
                    sourceType: 'state',
                    sourceId: state.id,
                    sourceName: state.name,
                    reference: `[[STATE:${state.id}:${state.name}]]`,
                    rate: trait.value,
                    ratePercent: ratePercent,
                    description: `${englishName} damage rate: ${ratePercent}%`
                });
            });
        });
        
        // From enemies
        processedEnemies.forEach(enemy => {
            const elementRateTraits = (enemy.traits || []).filter(trait => 
                trait.code === 11 && trait.dataId === index
            );
            elementRateTraits.forEach(trait => {
                const ratePercent = Math.round(trait.value * 100);
                // Use plain element name instead of cross-reference (avoid self-reference)
                elementRateModifiers.push({
                    sourceType: 'enemy',
                    sourceId: enemy.id,
                    sourceName: enemy.name,
                    reference: `[[ENEMY:${enemy.id}:${enemy.name}]]`,
                    rate: trait.value,
                    ratePercent: ratePercent,
                    description: `${englishName} damage rate: ${ratePercent}%`
                });
            });
        });
        
        // Find attack element additions (Code 31: Attack Element)
        const attackElementAdditions = [];
        
        // From weapons
        processedWeapons.forEach(weapon => {
            const attackElementTraits = (weapon.traits || []).filter(trait => 
                trait.code === 31 && trait.dataId === index
            );
            attackElementTraits.forEach(trait => {
                // Use plain element name instead of cross-reference (avoid self-reference)
                attackElementAdditions.push({
                    sourceType: 'weapon',
                    sourceId: weapon.id,
                    sourceName: weapon.name,
                    reference: `[[WEAPON:${weapon.id}:${weapon.name}]]`,
                    description: `Attack Element: ${englishName}`
                });
            });
        });
        
        // From armors
        processedArmors.forEach(armor => {
            const attackElementTraits = (armor.traits || []).filter(trait => 
                trait.code === 31 && trait.dataId === index
            );
            attackElementTraits.forEach(trait => {
                // Use plain element name instead of cross-reference (avoid self-reference)
                attackElementAdditions.push({
                    sourceType: 'armor',
                    sourceId: armor.id,
                    sourceName: armor.name,
                    reference: `[[ARMOR:${armor.id}:${armor.name}]]`,
                    description: `Attack Element: ${englishName}`
                });
            });
        });
        
        // From states
        processedStates.forEach(state => {
            const attackElementTraits = (state.traits || []).filter(trait => 
                trait.code === 31 && trait.dataId === index
            );
            attackElementTraits.forEach(trait => {
                // Use plain element name instead of cross-reference (avoid self-reference)
                attackElementAdditions.push({
                    sourceType: 'state',
                    sourceId: state.id,
                    sourceName: state.name,
                    reference: `[[STATE:${state.id}:${state.name}]]`,
                    description: `Attack Element: ${englishName}`
                });
            });
        });
        
        // From enemies (rare, but possible)
        processedEnemies.forEach(enemy => {
            const attackElementTraits = (enemy.traits || []).filter(trait => 
                trait.code === 31 && trait.dataId === index
            );
            attackElementTraits.forEach(trait => {
                // Use plain element name instead of cross-reference (avoid self-reference)
                attackElementAdditions.push({
                    sourceType: 'enemy',
                    sourceId: enemy.id,
                    sourceName: enemy.name,
                    reference: `[[ENEMY:${enemy.id}:${enemy.name}]]`,
                    description: `Attack Element: ${englishName}`
                });
            });
        });
        
        // Only include elements that have names or are referenced
        if (!isEmpty || skillsUsingElement.length > 0 || itemsUsingElement.length > 0 || 
            elementRateModifiers.length > 0 || attackElementAdditions.length > 0) {
            processedElements.push({
                id: index,
                japaneseName: japaneseName,
                englishName: englishName,
                isEmpty: isEmpty,
                iconIndex: elementIconMap[index] || 0, // Use mapped icon or default to 0
                skillsUsingElement: skillsUsingElement,
                itemsUsingElement: itemsUsingElement,
                elementRateModifiers: elementRateModifiers,
                attackElementAdditions: attackElementAdditions,
                totalReferences: skillsUsingElement.length + itemsUsingElement.length + 
                                elementRateModifiers.length + attackElementAdditions.length
            });
        }
    });
    
    return processedElements;
}

const processedElements = processElements(
    systemData,
    processedSkills,
    processedItems,
    processedWeapons,
    processedArmors,
    processedStates,
    processedEnemies,
    elementTranslations,
    elementIconMap
);

// Create output object
const output = {
    skills: processedSkills,
    states: processedStates,
    weapons: processedWeapons,
    armors: processedArmors,
    enemies: processedEnemies,
    items: processedItems,
    elements: processedElements,
    metadata: {
        totalSkills: processedSkills.length,
        totalStates: processedStates.length,
        totalWeapons: processedWeapons.length,
        totalArmors: processedArmors.length,
        totalEnemies: processedEnemies.length,
        totalItems: processedItems.length,
        totalElements: processedElements.length,
        elements: elements,
        weaponTypes: weaponTypes,
        armorTypes: armorTypes,
        skillTypes: skillTypes,
        generated: new Date().toISOString()
    }
};

// Automatic Cross-Reference Detection System
// This system detects any dataId that matches an entity ID but doesn't have a cross-reference marker
function detectMissingCrossReferences(allData, processedData) {
    const issues = [];
    
    // Build ID lookup maps for all entity types
    const idMaps = {
        skills: new Set(),
        states: new Set(),
        weapons: new Set(),
        armors: new Set(),
        items: new Set(),
        enemies: new Set()
    };
    
    // Populate ID maps from raw data
    allData.skills.forEach(s => { if (s && s.id) idMaps.skills.add(s.id); });
    allData.states.forEach(s => { if (s && s.id) idMaps.states.add(s.id); });
    allData.weapons.forEach(w => { if (w && w.id) idMaps.weapons.add(w.id); });
    allData.armors.forEach(a => { if (a && a.id) idMaps.armors.add(a.id); });
    allData.items.forEach(i => { if (i && i.id) idMaps.items.add(i.id); });
    allData.enemies.forEach(e => { if (e && e.id) idMaps.enemies.add(e.id); });
    
    // Helper to get entity name by type and ID
    const getEntityName = (type, id) => {
        const data = allData[type];
        if (!data) return null;
        const entity = data.find(e => e && e.id === id);
        return entity && entity.name ? entity.name : null;
    };
    
    // Helper to check if a description contains a cross-reference marker for a given ID
    const hasCrossReference = (description, type, id) => {
        if (!description || typeof description !== 'string') return false;
        const markerPattern = new RegExp(`\\[\\[${type}:${id}:`, 'g');
        return markerPattern.test(description);
    };
    
    // Helper to determine target type from dataId
    const findTargetType = (dataId) => {
        const types = [];
        if (idMaps.skills.has(dataId)) types.push({ type: 'SKILL', name: getEntityName('skills', dataId) });
        if (idMaps.states.has(dataId)) types.push({ type: 'STATE', name: getEntityName('states', dataId) });
        if (idMaps.weapons.has(dataId)) types.push({ type: 'WEAPON', name: getEntityName('weapons', dataId) });
        if (idMaps.armors.has(dataId)) types.push({ type: 'ARMOR', name: getEntityName('armors', dataId) });
        if (idMaps.items.has(dataId)) types.push({ type: 'ITEM', name: getEntityName('items', dataId) });
        if (idMaps.enemies.has(dataId)) types.push({ type: 'ENEMY', name: getEntityName('enemies', dataId) });
        return types;
    };
    
    // Scan Skills effects
    // Only check effect codes that reference entities: 21 (Add State), 22 (Remove State), 43 (Learn Skill)
    allData.skills.forEach(skill => {
        if (!skill || !skill.effects) return;
        skill.effects.forEach((effect, index) => {
            if (!effect || effect.dataId === undefined || effect.dataId === 0) return;
            // Only check codes that reference entities
            if (effect.code !== 21 && effect.code !== 22 && effect.code !== 43) return;
            // Skip self-reference
            if (effect.dataId === skill.id) return;
            
            // For codes 21 and 22, only check if dataId matches a state
            // For code 43, only check if dataId matches a skill
            let expectedType = null;
            if (effect.code === 21 || effect.code === 22) {
                if (!idMaps.states.has(effect.dataId)) return;
                expectedType = 'STATE';
            } else if (effect.code === 43) {
                if (!idMaps.skills.has(effect.dataId)) return;
                expectedType = 'SKILL';
            }
            
            if (expectedType) {
                const processedSkill = processedData.skills.find(s => s && s.id === skill.id);
                if (processedSkill && processedSkill.effects) {
                    // Find matching effect by code and checking if description contains the marker with our dataId
                    const matchingEffect = processedSkill.effects.find(e => {
                        if (!e || e.code !== effect.code) return false;
                        // Check if description contains marker with our dataId
                        const markerPattern = new RegExp(`\\[\\[${expectedType}:${effect.dataId}:`, 'g');
                        return markerPattern.test(e.description || '');
                    });
                    if (matchingEffect) {
                        const description = matchingEffect.description || '';
                        if (!hasCrossReference(description, expectedType, effect.dataId)) {
                            const targetName = getEntityName(expectedType === 'STATE' ? 'states' : 'skills', effect.dataId);
                            issues.push({
                                sourceType: 'Skill',
                                sourceId: skill.id,
                                sourceName: skill.name || `Skill #${skill.id}`,
                                fieldName: `effects[${index}]`,
                                fieldCode: effect.code,
                                targetType: expectedType,
                                targetId: effect.dataId,
                                targetName: targetName || `${expectedType} #${effect.dataId}`,
                                location: `Skills effects processing - effect code ${effect.code}`
                            });
                        }
                    } else {
                        // Effect was filtered out but should have been processed
                        const targetName = getEntityName(expectedType === 'STATE' ? 'states' : 'skills', effect.dataId);
                        issues.push({
                            sourceType: 'Skill',
                            sourceId: skill.id,
                            sourceName: skill.name || `Skill #${skill.id}`,
                            fieldName: `effects[${index}]`,
                            fieldCode: effect.code,
                            targetType: expectedType,
                            targetId: effect.dataId,
                            targetName: targetName || `${expectedType} #${effect.dataId}`,
                            location: `Skills effects processing - effect code ${effect.code} (effect may have been filtered)`
                        });
                    }
                }
            }
        });
    });
    
    // Scan Items effects
    // Only check effect codes that reference entities: 21 (Add State), 22 (Remove State), 43 (Learn Skill)
    allData.items.forEach(item => {
        if (!item || !item.effects) return;
        item.effects.forEach((effect, index) => {
            if (!effect || effect.dataId === undefined || effect.dataId === 0) return;
            // Only check codes that reference entities
            if (effect.code !== 21 && effect.code !== 22 && effect.code !== 43) return;
            // Skip self-reference
            if (effect.dataId === item.id) return;
            
            // For codes 21 and 22, only check if dataId matches a state
            // For code 43, only check if dataId matches a skill
            let expectedType = null;
            if (effect.code === 21 || effect.code === 22) {
                if (!idMaps.states.has(effect.dataId)) return;
                expectedType = 'STATE';
            } else if (effect.code === 43) {
                if (!idMaps.skills.has(effect.dataId)) return;
                expectedType = 'SKILL';
            }
            
            if (expectedType) {
                const processedItem = processedData.items.find(i => i && i.id === item.id);
                if (processedItem && processedItem.effects) {
                    // Find matching effect by code and checking if description contains the marker with our dataId
                    const matchingEffect = processedItem.effects.find(e => {
                        if (!e || e.code !== effect.code) return false;
                        // Check if description contains marker with our dataId
                        const markerPattern = new RegExp(`\\[\\[${expectedType}:${effect.dataId}:`, 'g');
                        return markerPattern.test(e.description || '');
                    });
                    if (matchingEffect) {
                        const description = matchingEffect.description || '';
                        if (!hasCrossReference(description, expectedType, effect.dataId)) {
                            const targetName = getEntityName(expectedType === 'STATE' ? 'states' : 'skills', effect.dataId);
                            issues.push({
                                sourceType: 'Item',
                                sourceId: item.id,
                                sourceName: item.name || `Item #${item.id}`,
                                fieldName: `effects[${index}]`,
                                fieldCode: effect.code,
                                targetType: expectedType,
                                targetId: effect.dataId,
                                targetName: targetName || `${expectedType} #${effect.dataId}`,
                                location: `Items effects processing - effect code ${effect.code}`
                            });
                        }
                    } else {
                        // Effect was filtered out but should have been processed
                        const targetName = getEntityName(expectedType === 'STATE' ? 'states' : 'skills', effect.dataId);
                        issues.push({
                            sourceType: 'Item',
                            sourceId: item.id,
                            sourceName: item.name || `Item #${item.id}`,
                            fieldName: `effects[${index}]`,
                            fieldCode: effect.code,
                            targetType: expectedType,
                            targetId: effect.dataId,
                            targetName: targetName || `${expectedType} #${effect.dataId}`,
                            location: `Items effects processing - effect code ${effect.code} (effect may have been filtered)`
                        });
                    }
                }
            }
        });
    });
    
    // Scan States traits
    // Only check trait code 13 (State Rate) which references other states
    allData.states.forEach(state => {
        if (!state || !state.traits) return;
        state.traits.forEach((trait, index) => {
            if (!trait || trait.dataId === undefined || trait.dataId === 0) return;
            // Only check trait code 13 (State Rate) - references state IDs
            if (trait.code !== 13) return;
            // Skip self-reference
            if (trait.dataId === state.id) return;
            // Only check if dataId matches a state
            if (!idMaps.states.has(trait.dataId)) return;
            
            const processedState = processedData.states.find(s => s && s.id === state.id);
            if (processedState && processedState.traits) {
                // Find matching trait by code and checking if description contains the marker with our dataId
                const matchingTrait = processedState.traits.find(t => {
                    if (!t || t.code !== trait.code) return false;
                    // Check if description contains marker with our dataId
                    const markerPattern = new RegExp(`\\[\\[STATE:${trait.dataId}:`, 'g');
                    return markerPattern.test(t.description || '');
                });
                if (matchingTrait) {
                    const description = matchingTrait.description || '';
                    if (!hasCrossReference(description, 'STATE', trait.dataId)) {
                        const targetName = getEntityName('states', trait.dataId);
                        issues.push({
                            sourceType: 'State',
                            sourceId: state.id,
                            sourceName: state.name || `State #${state.id}`,
                            fieldName: `traits[${index}]`,
                            fieldCode: trait.code,
                            targetType: 'STATE',
                            targetId: trait.dataId,
                            targetName: targetName || `STATE #${trait.dataId}`,
                            location: `States traits processing - trait code ${trait.code}`
                        });
                    }
                } else {
                    // Trait was filtered out but should have been processed
                    const targetName = getEntityName('states', trait.dataId);
                    issues.push({
                        sourceType: 'State',
                        sourceId: state.id,
                        sourceName: state.name || `State #${state.id}`,
                        fieldName: `traits[${index}]`,
                        fieldCode: trait.code,
                        targetType: 'STATE',
                        targetId: trait.dataId,
                        targetName: targetName || `STATE #${trait.dataId}`,
                        location: `States traits processing - trait code ${trait.code} (trait may have been filtered)`
                    });
                }
            }
        });
    });
    
    // Scan Weapons traits
    // Only check trait code 13 (State Rate) which references states
    allData.weapons.forEach(weapon => {
        if (!weapon || !weapon.traits) return;
        weapon.traits.forEach((trait, index) => {
            if (!trait || trait.dataId === undefined || trait.dataId === 0) return;
            // Only check trait code 13 (State Rate) - references state IDs
            if (trait.code !== 13) return;
            // Skip self-reference
            if (trait.dataId === weapon.id) return;
            // Only check if dataId matches a state
            if (!idMaps.states.has(trait.dataId)) return;
            
            const processedWeapon = processedData.weapons.find(w => w && w.id === weapon.id);
            if (processedWeapon && processedWeapon.traits) {
                // Find matching trait by code and checking if description contains the marker with our dataId
                const matchingTrait = processedWeapon.traits.find(t => {
                    if (!t || t.code !== trait.code) return false;
                    // Check if description contains marker with our dataId
                    const markerPattern = new RegExp(`\\[\\[STATE:${trait.dataId}:`, 'g');
                    return markerPattern.test(t.description || '');
                });
                if (matchingTrait) {
                    const description = matchingTrait.description || '';
                    if (!hasCrossReference(description, 'STATE', trait.dataId)) {
                        const targetName = getEntityName('states', trait.dataId);
                        issues.push({
                            sourceType: 'Weapon',
                            sourceId: weapon.id,
                            sourceName: weapon.name || `Weapon #${weapon.id}`,
                            fieldName: `traits[${index}]`,
                            fieldCode: trait.code,
                            targetType: 'STATE',
                            targetId: trait.dataId,
                            targetName: targetName || `STATE #${trait.dataId}`,
                            location: `Weapons traits processing - trait code ${trait.code}`
                        });
                    }
                } else {
                    // Trait was filtered out but should have been processed
                    const targetName = getEntityName('states', trait.dataId);
                    issues.push({
                        sourceType: 'Weapon',
                        sourceId: weapon.id,
                        sourceName: weapon.name || `Weapon #${weapon.id}`,
                        fieldName: `traits[${index}]`,
                        fieldCode: trait.code,
                        targetType: 'STATE',
                        targetId: trait.dataId,
                        targetName: targetName || `STATE #${trait.dataId}`,
                        location: `Weapons traits processing - trait code ${trait.code} (trait may have been filtered)`
                    });
                }
            }
        });
    });
    
    // Scan Armors traits
    // Only check trait code 13 (State Rate) which references states
    allData.armors.forEach(armor => {
        if (!armor || !armor.traits) return;
        armor.traits.forEach((trait, index) => {
            if (!trait || trait.dataId === undefined || trait.dataId === 0) return;
            // Only check trait code 13 (State Rate) - references state IDs
            if (trait.code !== 13) return;
            // Skip self-reference
            if (trait.dataId === armor.id) return;
            // Only check if dataId matches a state
            if (!idMaps.states.has(trait.dataId)) return;
            
            const processedArmor = processedData.armors.find(a => a && a.id === armor.id);
            if (processedArmor && processedArmor.traits) {
                // Find matching trait by code and checking if description contains the marker with our dataId
                const matchingTrait = processedArmor.traits.find(t => {
                    if (!t || t.code !== trait.code) return false;
                    // Check if description contains marker with our dataId
                    const markerPattern = new RegExp(`\\[\\[STATE:${trait.dataId}:`, 'g');
                    return markerPattern.test(t.description || '');
                });
                if (matchingTrait) {
                    const description = matchingTrait.description || '';
                    if (!hasCrossReference(description, 'STATE', trait.dataId)) {
                        const targetName = getEntityName('states', trait.dataId);
                        issues.push({
                            sourceType: 'Armor',
                            sourceId: armor.id,
                            sourceName: armor.name || `Armor #${armor.id}`,
                            fieldName: `traits[${index}]`,
                            fieldCode: trait.code,
                            targetType: 'STATE',
                            targetId: trait.dataId,
                            targetName: targetName || `STATE #${trait.dataId}`,
                            location: `Armors traits processing - trait code ${trait.code}`
                        });
                    }
                } else {
                    // Trait was filtered out but should have been processed
                    const targetName = getEntityName('states', trait.dataId);
                    issues.push({
                        sourceType: 'Armor',
                        sourceId: armor.id,
                        sourceName: armor.name || `Armor #${armor.id}`,
                        fieldName: `traits[${index}]`,
                        fieldCode: trait.code,
                        targetType: 'STATE',
                        targetId: trait.dataId,
                        targetName: targetName || `STATE #${trait.dataId}`,
                        location: `Armors traits processing - trait code ${trait.code} (trait may have been filtered)`
                    });
                }
            }
        });
    });
    
    // Scan Enemies actions (skillId) - already handled, but verify
    allData.enemies.forEach(enemy => {
        if (!enemy || !enemy.actions) return;
        enemy.actions.forEach((action, index) => {
            if (!action || !action.skillId || action.skillId === 0) return;
            // Skip self-reference
            if (action.skillId === enemy.id) return;
            
            if (idMaps.skills.has(action.skillId)) {
                const processedEnemy = processedData.enemies.find(e => e && e.id === enemy.id);
                if (processedEnemy && processedEnemy.actions && processedEnemy.actions[index]) {
                    const skillName = processedEnemy.actions[index].skillName || '';
                    if (!hasCrossReference(skillName, 'SKILL', action.skillId)) {
                        issues.push({
                            sourceType: 'Enemy',
                            sourceId: enemy.id,
                            sourceName: enemy.name || `Enemy #${enemy.id}`,
                            fieldName: `actions[${index}].skillId`,
                            fieldCode: null,
                            targetType: 'SKILL',
                            targetId: action.skillId,
                            targetName: getEntityName('skills', action.skillId) || `Skill #${action.skillId}`,
                            location: `Enemies actions processing - skillId`
                        });
                    }
                }
            }
        });
    });
    
    // Scan Enemies dropItems (dataId) - already handled, but verify
    allData.enemies.forEach(enemy => {
        if (!enemy || !enemy.dropItems) return;
        enemy.dropItems.forEach((drop, index) => {
            if (!drop || drop.dataId === undefined || drop.dataId === 0) return;
            // Skip self-reference
            if (drop.dataId === enemy.id) return;
            // Skip gold (kind 0)
            if (drop.kind === 0) return;
            
            let targetType = null;
            let targetName = null;
            if (drop.kind === 1 && idMaps.items.has(drop.dataId)) {
                targetType = 'ITEM';
                targetName = getEntityName('items', drop.dataId);
            } else if (drop.kind === 2 && idMaps.weapons.has(drop.dataId)) {
                targetType = 'WEAPON';
                targetName = getEntityName('weapons', drop.dataId);
            } else if (drop.kind === 3 && idMaps.armors.has(drop.dataId)) {
                targetType = 'ARMOR';
                targetName = getEntityName('armors', drop.dataId);
            }
            
            if (targetType) {
                const processedEnemy = processedData.enemies.find(e => e && e.id === enemy.id);
                if (processedEnemy && processedEnemy.dropItems && processedEnemy.dropItems[index]) {
                    const name = processedEnemy.dropItems[index].name || '';
                    if (!hasCrossReference(name, targetType, drop.dataId)) {
                        issues.push({
                            sourceType: 'Enemy',
                            sourceId: enemy.id,
                            sourceName: enemy.name || `Enemy #${enemy.id}`,
                            fieldName: `dropItems[${index}].dataId`,
                            fieldCode: drop.kind,
                            targetType: targetType,
                            targetId: drop.dataId,
                            targetName: targetName || `${targetType} #${drop.dataId}`,
                            location: `Enemies dropItems processing - kind ${drop.kind}`
                        });
                    }
                }
            }
        });
    });
    
    return issues;
}

// Inferred Data Detection System
// Detects when information is displayed as "opinion" or inferred without proper basis
// This includes unmapped parameters, unknown trait codes, and other inferred data
// CHALLENGES ALL MAPPINGS - requires sources for everything
function detectInferredDataWithoutBasis(processedData, allData) {
    const issues = [];
    
    // Define known parameter mappings based on editor screenshots and RPG Maker VX Ace documentation
    // Extended Parameters (8-17) - SOURCE: editor-screenshot (200544.png)
    const knownExtendedParams = {
        8: "Hit Rate",
        9: "Evasion Rate",
        10: "Critical Hit Rate",
        11: "Critical Evasion Rate",
        12: "Magic Evasion Rate",
        13: "Magic Reflection Rate",
        14: "Counterattack Rate",
        15: "HP Regeneration Rate",
        16: "MP Regeneration Rate"
        // 17: TP Regeneration Rate - removed (TP not in database)
    };
    
    // Source registry for extended parameters (8-16)
    const extendedParamSources = {
        8: { source: "editor-screenshot", evidence: "Ex-Parameter dropdown shows HIT", screenshot: "200544.png" },
        9: { source: "editor-screenshot", evidence: "Ex-Parameter dropdown shows EVA", screenshot: "200544.png" },
        10: { source: "editor-screenshot", evidence: "Ex-Parameter dropdown shows CRI", screenshot: "200544.png" },
        11: { source: "editor-screenshot", evidence: "Ex-Parameter dropdown shows CEV", screenshot: "200544.png" },
        12: { source: "editor-screenshot", evidence: "Ex-Parameter dropdown shows MEV", screenshot: "200544.png" },
        13: { source: "editor-screenshot", evidence: "Ex-Parameter dropdown shows MRF", screenshot: "200544.png" },
        14: { source: "editor-screenshot", evidence: "Ex-Parameter dropdown shows CNT", screenshot: "200544.png" },
        15: { source: "editor-screenshot", evidence: "Ex-Parameter dropdown shows HRG", screenshot: "200544.png" },
        16: { source: "editor-screenshot", evidence: "Ex-Parameter dropdown shows MRG", screenshot: "200544.png" }
    };
    
    // Special Parameters (18-27) - SOURCE: editor-screenshot (200552.png)
    const knownSpecialParams = {
        18: "Target Rate",           // TGR
        19: "Guard Effectiveness",   // GRD
        20: "Recovery Effectiveness", // REC
        21: "Pharmacology",          // PHA
        22: "MP Cost Rate",          // MCR
        // 23: TP Charge Rate - removed (TP not in database)
        24: "Physical Damage Rate",  // PDR
        25: "Magical Damage Rate",   // MDR
        26: "Floor Damage Rate",     // FDR
        27: "Experience Rate"        // EXR
    };
    
    // Source registry for special parameters (18-27)
    const specialParamSources = {
        18: { source: "editor-screenshot", evidence: "Sp-Parameter dropdown shows TGR", screenshot: "200552.png" },
        19: { source: "editor-screenshot", evidence: "Sp-Parameter dropdown shows GRD", screenshot: "200552.png" },
        20: { source: "editor-screenshot", evidence: "Sp-Parameter dropdown shows REC", screenshot: "200552.png" },
        21: { source: "editor-screenshot", evidence: "Sp-Parameter dropdown shows PHA", screenshot: "200552.png" },
        22: { source: "editor-screenshot", evidence: "Sp-Parameter dropdown shows MCR", screenshot: "200552.png" },
        // 23: TP Charge Rate - removed
        24: { source: "editor-screenshot", evidence: "Sp-Parameter dropdown shows PDR", screenshot: "200552.png" },
        25: { source: "editor-screenshot", evidence: "Sp-Parameter dropdown shows MDR", screenshot: "200552.png" },
        26: { source: "editor-screenshot", evidence: "Sp-Parameter dropdown shows FDR", screenshot: "200552.png" },
        27: { source: "editor-screenshot", evidence: "Sp-Parameter dropdown shows EXR", screenshot: "200552.png" }
    };
    
    // All known parameters that should be mapped
    const allKnownParams = {
        ...knownExtendedParams,
        ...knownSpecialParams
    };
    
    // All parameter sources
    const allParamSources = {
        ...parameterNameSources,  // 0-7 from system.json
        ...extendedParamSources,  // 8-16 from editor screenshots
        ...specialParamSources    // 18-27 from editor screenshots
    };
    
    // Currently mapped parameters in code (from processTraits function and parameter bonus processing)
    // Extended Parameters (8-16) - mapped in processTraits (code 22) and parameter bonus processing
    // Special Parameters (18-27) - mapped in processTraits (code 23) and parameter bonus processing
    const currentlyMappedParams = {
        // Extended Parameters (8-16) - SOURCE: editor-screenshot (200544.png)
        8: "Hit Rate",
        9: "Evasion Rate",
        10: "Critical Hit Rate",
        11: "Critical Evasion Rate",
        12: "Magic Evasion Rate",
        13: "Magic Reflection Rate",
        14: "Counterattack Rate",
        15: "HP Regeneration Rate",
        16: "MP Regeneration Rate",
        // Special Parameters (18-27) - SOURCE: editor-screenshot (200552.png)
        18: "Target Rate",
        19: "Guard Effectiveness",
        20: "Recovery Effectiveness",
        21: "Pharmacology",
        22: "MP Cost Rate",
        24: "Physical Damage Rate",
        25: "Magical Damage Rate",
        26: "Floor Damage Rate",
        27: "Experience Rate",
        // Custom parameters (not in standard VX Ace)
        35: "HP Drain Rate", // Custom parameter, not in standard VX Ace
        39: "MP Drain Rate"  // Custom parameter, not in standard VX Ace
    };
    
    // Source registry for currently mapped custom parameters
    // ⚠️ NOTE: These are custom parameters not in standard RPG Maker VX Ace
    // They are marked as "none" because they have no documented source
    // They will be flagged by the detection system until proper source is found
    // ⚠️ FORBIDDEN: Do not use "ASSUMED" or "inferred" language - use "none" source only
    const customParamSources = {
        35: { source: "none", evidence: "No source documented - Custom parameter not in standard VX Ace" },
        39: { source: "none", evidence: "No source documented - Custom parameter not in standard VX Ace" }
    };
    
    // Known trait codes from stateTraitCodes
    const knownTraitCodes = new Set(Object.keys(stateTraitCodes).map(k => parseInt(k)));
    
    // ============================================================================
    // SOURCE VERIFICATION - Check if mappings have proper sources
    // ============================================================================
    
    // Check all trait codes for sources
    Object.keys(stateTraitCodes).forEach(codeStr => {
        const code = parseInt(codeStr);
        if (!traitCodeSources[code] || traitCodeSources[code].source === "none") {
            issues.push({
                type: 'mapping_without_source',
                category: 'trait_code',
                code: code,
                name: stateTraitCodes[code],
                source: traitCodeSources[code]?.source || "missing",
                evidence: traitCodeSources[code]?.evidence || "No source registry entry",
                location: `stateTraitCodes[${code}]`
            });
        }
    });
    
    // Check all effect codes for sources
    Object.keys(effectCodes).forEach(codeStr => {
        const code = parseInt(codeStr);
        if (!effectCodeSources[code] || effectCodeSources[code].source === "none") {
            issues.push({
                type: 'mapping_without_source',
                category: 'effect_code',
                code: code,
                name: effectCodes[code],
                source: effectCodeSources[code]?.source || "missing",
                evidence: effectCodeSources[code]?.evidence || "No source registry entry",
                location: `effectCodes[${code}]`
            });
        }
    });
    
    // NOTE: Translations don't need sources - they are interpretive, not factual mappings
    // Element translations are excluded from source verification
    
    // Check all scope types for sources
    Object.keys(scopeTypes).forEach(codeStr => {
        const code = parseInt(codeStr);
        if (!scopeTypeSources[code] || scopeTypeSources[code].source === "none") {
            issues.push({
                type: 'mapping_without_source',
                category: 'scope_type',
                code: code,
                name: scopeTypes[code],
                source: scopeTypeSources[code]?.source || "missing",
                evidence: scopeTypeSources[code]?.evidence || "No source registry entry",
                location: `scopeTypes[${code}]`
            });
        }
    });
    
    // Check all hit types for sources
    Object.keys(hitTypes).forEach(codeStr => {
        const code = parseInt(codeStr);
        if (!hitTypeSources[code] || hitTypeSources[code].source === "none") {
            issues.push({
                type: 'mapping_without_source',
                category: 'hit_type',
                code: code,
                name: hitTypes[code],
                source: hitTypeSources[code]?.source || "missing",
                evidence: hitTypeSources[code]?.evidence || "No source registry entry",
                location: `hitTypes[${code}]`
            });
        }
    });
    
    // Check all damage types for sources
    Object.keys(damageTypes).forEach(codeStr => {
        const code = parseInt(codeStr);
        if (!damageTypeSources[code] || damageTypeSources[code].source === "none") {
            issues.push({
                type: 'mapping_without_source',
                category: 'damage_type',
                code: code,
                name: damageTypes[code],
                source: damageTypeSources[code]?.source || "missing",
                evidence: damageTypeSources[code]?.evidence || "No source registry entry",
                location: `damageTypes[${code}]`
            });
        }
    });
    
    // Check all occasion types for sources
    Object.keys(occasionTypes).forEach(codeStr => {
        const code = parseInt(codeStr);
        if (!occasionTypeSources[code] || occasionTypeSources[code].source === "none") {
            issues.push({
                type: 'mapping_without_source',
                category: 'occasion_type',
                code: code,
                name: occasionTypes[code],
                source: occasionTypeSources[code]?.source || "missing",
                evidence: occasionTypeSources[code]?.evidence || "No source registry entry",
                location: `occasionTypes[${code}]`
            });
        }
    });
    
    // Check all restriction types for sources
    Object.keys(restrictionTypes).forEach(codeStr => {
        const code = parseInt(codeStr);
        if (!restrictionTypeSources[code] || restrictionTypeSources[code].source === "none") {
            issues.push({
                type: 'mapping_without_source',
                category: 'restriction_type',
                code: code,
                name: restrictionTypes[code],
                source: restrictionTypeSources[code]?.source || "missing",
                evidence: restrictionTypeSources[code]?.evidence || "No source registry entry",
                location: `restrictionTypes[${code}]`
            });
        }
    });
    
    // Check all auto removal timings for sources
    Object.keys(autoRemovalTimings).forEach(codeStr => {
        const code = parseInt(codeStr);
        if (!autoRemovalTimingSources[code] || autoRemovalTimingSources[code].source === "none") {
            issues.push({
                type: 'mapping_without_source',
                category: 'auto_removal_timing',
                code: code,
                name: autoRemovalTimings[code],
                source: autoRemovalTimingSources[code]?.source || "missing",
                evidence: autoRemovalTimingSources[code]?.evidence || "No source registry entry",
                location: `autoRemovalTimings[${code}]`
            });
        }
    });
    
    // Check parameter mappings - verify sources exist
    Object.keys(allParamSources).forEach(paramIdStr => {
        const paramId = parseInt(paramIdStr);
        const sourceInfo = allParamSources[paramId];
        if (!sourceInfo || sourceInfo.source === "none") {
            issues.push({
                type: 'mapping_without_source',
                category: 'parameter',
                paramId: paramId,
                name: allKnownParams[paramId] || parameterNames[paramId] || "Unknown",
                source: sourceInfo?.source || "missing",
                evidence: sourceInfo?.evidence || "No source registry entry",
                location: `parameter ${paramId}`
            });
        }
    });
    
    // Helper function to check if a parameter is unmapped but known
    const isUnmappedKnownParameter = (dataId) => {
        // Standard parameters (0-7) are always mapped
        if (dataId >= 0 && dataId <= 7) return false;
        // Check if it's a known parameter but not in currentlyMappedParams
        return allKnownParams.hasOwnProperty(dataId) && !currentlyMappedParams.hasOwnProperty(dataId);
    };
    
    // Helper function to check if a parameter is completely unknown
    const isUnknownParameter = (dataId) => {
        if (dataId >= 0 && dataId <= 7) return false;
        if (currentlyMappedParams.hasOwnProperty(dataId)) return false;
        if (allKnownParams.hasOwnProperty(dataId)) return false;
        return true;
    };
    
    // Helper function to check if a mapping has a proper source (not "none")
    const hasProperSource = (sourceInfo) => {
        return sourceInfo && sourceInfo.source && sourceInfo.source !== "none";
    };
    
    // Scan all processed data for inferred data issues
    const scanTraits = (traits, sourceType, sourceId, sourceName) => {
        if (!traits || !Array.isArray(traits)) return;
        
        traits.forEach((trait, index) => {
            // Check for unknown trait codes
            // Note: Code 13 (TP Regeneration) was intentionally removed, so it's expected to be "unknown"
            // Code 61 might be a custom trait code used in this game
            if (trait.code !== undefined && !knownTraitCodes.has(trait.code)) {
                // Code 13 is now "State Rate" (valid trait code) - no longer skipping
                
                issues.push({
                    type: 'unknown_trait_code',
                    sourceType: sourceType,
                    sourceId: sourceId,
                    sourceName: sourceName,
                    traitIndex: index,
                    code: trait.code,
                    dataId: trait.dataId,
                    value: trait.value,
                    description: trait.description,
                    location: `trait #${index}`
                });
            }
            
            // Check for unmapped known parameters
            if (trait.dataId !== undefined && isUnmappedKnownParameter(trait.dataId)) {
                const knownName = allKnownParams[trait.dataId];
                issues.push({
                    type: 'unmapped_known_parameter',
                    sourceType: sourceType,
                    sourceId: sourceId,
                    sourceName: sourceName,
                    traitIndex: index,
                    code: trait.code,
                    dataId: trait.dataId,
                    knownName: knownName,
                    value: trait.value,
                    description: trait.description,
                    location: `trait #${index}`
                });
            }
            
            // Check for completely unknown parameters
            // EXCLUDE trait codes that use IDs other than parameter IDs:
            // - Code 11 (Element Rate): dataId is an element ID
            // - Code 13 (State Rate): dataId is a state ID
            // - Code 14 (State Resist): dataId is a state ID
            // - Code 31 (Attack Element): dataId is an element ID
            // - Code 32 (Attack State): dataId is a state ID
            // - Code 41 (Add Skill Type): dataId is a skill type ID
            // - Code 42 (Seal Skill Type): dataId is a skill type ID
            // - Code 43 (Add Skill): dataId is a skill ID
            // - Code 44 (Seal Skill): dataId is a skill ID
            const usesNonParameterId = trait.code === 11 || trait.code === 13 || trait.code === 14 || 
                                       trait.code === 31 || trait.code === 32 || 
                                       trait.code === 41 || trait.code === 42 || 
                                       trait.code === 43 || trait.code === 44;
            if (trait.dataId !== undefined && isUnknownParameter(trait.dataId) && !usesNonParameterId) {
                issues.push({
                    type: 'unknown_parameter',
                    sourceType: sourceType,
                    sourceId: sourceId,
                    sourceName: sourceName,
                    traitIndex: index,
                    code: trait.code,
                    dataId: trait.dataId,
                    value: trait.value,
                    description: trait.description,
                    location: `trait #${index}`
                });
            }
            
            // Check if description contains "Unknown Parameter" or "Unknown Trait"
            if (trait.description && (
                trait.description.includes('Unknown Parameter') ||
                trait.description.includes('Unknown Trait') ||
                trait.codeName === 'Unknown Trait'
            )) {
                issues.push({
                    type: 'displayed_as_unknown',
                    sourceType: sourceType,
                    sourceId: sourceId,
                    sourceName: sourceName,
                    traitIndex: index,
                    code: trait.code,
                    dataId: trait.dataId,
                    value: trait.value,
                    description: trait.description,
                    codeName: trait.codeName,
                    location: `trait #${index}`
                });
            }
            
            // Check for ignored data when code/codeName is shown
            // Detects when ANY trait data (dataId, value) exists but is not meaningfully used in description
            // This catches ALL cases where data exists but is ignored, including:
            // 1. Trait codes without handlers (fall back to codeName, ignoring dataId/value)
            // 2. DataId out of known range (e.g., Ex-Parameter dataId 10+ shown as "Ex-Parameter 10")
            // 3. Generic placeholders (e.g., "Unknown Parameter", "Parameter 10" for unmapped dataId)
            // Note: Must check if dataId OR value exists (not just both) to catch all ignored data cases
            // Also check for null (some data might have null instead of undefined)
            const hasDataId = trait.dataId !== undefined && trait.dataId !== null;
            const hasValue = trait.value !== undefined && trait.value !== null;
            
            if (trait.codeName && (hasDataId || hasValue)) {
                let isIgnored = false;
                let reason = "";
                
                // Case 1: Description is just the codeName (fallback - ALL data is ignored)
                // This catches traits with dataId/value that have no handler and fall back to codeName
                // This is the most common case - trait codes without handlers (11, 12, 31-34, 41, 43, 44, 51-55, 61-64)
                const descriptionIsJustCodeName = trait.description === trait.codeName || 
                                                 (trait.description && trait.description.trim() === trait.codeName.trim());
                
                if (descriptionIsJustCodeName) {
                    isIgnored = true;
                    const dataParts = [];
                    if (hasDataId) dataParts.push(`dataId: ${trait.dataId}`);
                    if (hasValue) dataParts.push(`value: ${trait.value}`);
                    reason = `Description equals codeName - ${dataParts.join(', ')} ignored`;
                }
                
                // Case 2: DataId exists but shown as generic placeholder (unmapped dataId)
                // Check for patterns like "Ex-Parameter 10", "Sp-Parameter 10", "Parameter 10", etc.
                // These indicate dataId exists but is out of known range or unmapped
                if (!isIgnored && hasDataId && trait.description) {
                    // Whitelist: State 204 is intentionally nameless (vital spot state)
                    // State codes that reference states: 13 (State Rate), 14 (State Resist), 32 (Attack State)
                    const isStateReference = trait.code === 13 || trait.code === 14 || trait.code === 32;
                    const isWhitelistedState = isStateReference && trait.dataId === 204;
                    
                    // Check for generic placeholder patterns in description
                    const genericPatterns = [
                        new RegExp(`\\bParameter\\s+${trait.dataId}\\b`),
                        new RegExp(`\\bEx-Parameter\\s+${trait.dataId}\\b`),
                        new RegExp(`\\bSp-Parameter\\s+${trait.dataId}\\b`),
                        new RegExp(`\\bCollapse type\\s+${trait.dataId}\\b`),
                        /Unknown Parameter/
                    ];
                    
                    // Only check for "Unknown State" if not whitelisted
                    if (!isWhitelistedState) {
                        genericPatterns.push(/Unknown State/);
                    }
                    
                    const hasGenericPlaceholder = genericPatterns.some(pattern => pattern.test(trait.description));
                    
                    if (hasGenericPlaceholder) {
                        isIgnored = true;
                        reason = `DataId (${trait.dataId}) shown as generic/unmapped placeholder`;
                    }
                }
                
                if (isIgnored) {
                    issues.push({
                        type: 'ignored_data_id_value',
                        sourceType: sourceType,
                        sourceId: sourceId,
                        sourceName: sourceName,
                        traitIndex: index,
                        code: trait.code,
                        codeName: trait.codeName,
                        dataId: trait.dataId,
                        value: trait.value,
                        description: trait.description,
                        location: `trait #${index}`,
                        message: `${trait.codeName}: ${reason}`
                    });
                }
            }
        });
    };
    
    // Scan parameter bonuses for unmapped parameters
    const scanParams = (params, sourceType, sourceId, sourceName) => {
        if (!params || !Array.isArray(params)) return;
        
        params.forEach((param) => {
            if (!param || param.value === 0 || param.value === undefined) return;
            
            // Check if parameter name is "Unknown Parameter X"
            if (param.name && param.name.includes('Unknown Parameter')) {
                // Extract parameter ID from name if possible (e.g., "Unknown Parameter 18")
                const match = param.name.match(/Unknown Parameter (\d+)/);
                const paramId = match ? parseInt(match[1]) : null;
                
                issues.push({
                    type: 'unmapped_parameter_bonus',
                    sourceType: sourceType,
                    sourceId: sourceId,
                    sourceName: sourceName,
                    dataId: paramId,
                    value: param.value,
                    name: param.name,
                    location: `parameter bonus: ${param.name}`
                });
            }
            
            // Note: We can't easily check if it's an unmapped known parameter from the processed data
            // because the original parameter index is lost. This would need to be checked during processing.
        });
    };
    
    // Scan effects for inferred data
    const scanEffects = (effects, sourceType, sourceId, sourceName) => {
        if (!effects || !Array.isArray(effects)) return;
        
        effects.forEach((effect, index) => {
            // Check for unknown parameter in effects
            if (effect.dataId !== undefined && isUnmappedKnownParameter(effect.dataId)) {
                const knownName = allKnownParams[effect.dataId];
                issues.push({
                    type: 'unmapped_known_parameter_effect',
                    sourceType: sourceType,
                    sourceId: sourceId,
                    sourceName: sourceName,
                    effectIndex: index,
                    code: effect.code,
                    dataId: effect.dataId,
                    knownName: knownName,
                    value: effect.value,
                    description: effect.description,
                    location: `effect #${index}`
                });
            }
            
            // Check if description contains "Unknown Parameter"
            if (effect.description && effect.description.includes('Unknown Parameter')) {
                issues.push({
                    type: 'displayed_as_unknown_effect',
                    sourceType: sourceType,
                    sourceId: sourceId,
                    sourceName: sourceName,
                    effectIndex: index,
                    code: effect.code,
                    dataId: effect.dataId,
                    value: effect.value,
                    description: effect.description,
                    location: `effect #${index}`
                });
            }
        });
    };
    
    // Scan all data types
    ['skills', 'states', 'weapons', 'armors', 'items', 'enemies'].forEach(dataType => {
        const processedItems = processedData[dataType];
        const rawItems = allData[dataType];
        if (!processedItems || !Array.isArray(processedItems)) return;
        
        processedItems.forEach((processedItem, index) => {
            if (!processedItem) return;
            
            // Scan traits
            if (processedItem.traits) {
                scanTraits(processedItem.traits, dataType, processedItem.id, processedItem.name || `#${processedItem.id}`);
            }
            
            // Scan parameter bonuses from processed data
            if (processedItem.params) {
                scanParams(processedItem.params, dataType, processedItem.id, processedItem.name || `#${processedItem.id}`);
            }
            
            // Scan raw parameter arrays for unmapped known parameters
            if (rawItems && Array.isArray(rawItems)) {
                const rawItem = rawItems.find(r => r && r.id === processedItem.id);
                if (rawItem && rawItem.params && Array.isArray(rawItem.params)) {
                    rawItem.params.forEach((value, paramIndex) => {
                        if (value !== 0 && isUnmappedKnownParameter(paramIndex)) {
                            const knownName = allKnownParams[paramIndex];
                            issues.push({
                                type: 'unmapped_known_parameter_bonus',
                                sourceType: dataType,
                                sourceId: processedItem.id,
                                sourceName: processedItem.name || `#${processedItem.id}`,
                                paramIndex: paramIndex,
                                dataId: paramIndex,
                                knownName: knownName,
                                value: value,
                                location: `raw parameter array index ${paramIndex}`
                            });
                        }
                    });
                }
            }
            
            // Scan effects (for items and skills)
            if (processedItem.effects) {
                scanEffects(processedItem.effects, dataType, processedItem.id, processedItem.name || `#${processedItem.id}`);
            }
        });
    });
    
    return issues;
}

// Run automatic detection
const allData = {
    skills: skillsData,
    states: statesData,
    weapons: weaponsData,
    armors: armorsData,
    items: itemsData,
    enemies: enemiesData
};

const processedData = {
    skills: processedSkills,
    states: processedStates,
    weapons: processedWeapons,
    armors: processedArmors,
    items: processedItems,
    enemies: processedEnemies
};

const detectedMissingRefs = detectMissingCrossReferences(allData, processedData);
const detectedInferredData = detectInferredDataWithoutBasis(processedData, allData);

// Write to file
fs.writeFileSync(path.join(__dirname, 'processed-data.json'), JSON.stringify(output, null, 2));
// Processed items (no verbose logging)

// Summary: Count untranslated items
const untranslatedSkills = processedSkills.filter(s => 
    containsJapanese(s.name) || 
    containsJapanese(s.description) || 
    containsJapanese(s.message1) || 
    containsJapanese(s.message2) || 
    (s.note && s.note.untranslated)
).length;

const untranslatedStates = processedStates.filter(s => 
    containsJapanese(s.name) || 
    containsJapanese(s.message1) || 
    containsJapanese(s.message2) || 
    containsJapanese(s.message3) || 
    containsJapanese(s.message4) || 
    (s.note && s.note.untranslated)
).length;

const untranslatedWeapons = processedWeapons.filter(w => 
    containsJapanese(w.name) || 
    containsJapanese(w.description) || 
    (w.note && w.note.untranslated)
).length;

const untranslatedArmors = processedArmors.filter(a => 
    containsJapanese(a.name) || 
    containsJapanese(a.description) || 
    (a.note && a.note.untranslated)
).length;

const untranslatedEnemies = processedEnemies.filter(e => 
    containsJapanese(e.name) || 
    (e.note && e.note.untranslated)
).length;

const untranslatedItems = processedItems.filter(i => 
    containsJapanese(i.name) || 
    containsJapanese(i.description) || 
    (i.note && i.note.untranslated)
).length;

const totalUntranslated = untranslatedSkills + untranslatedStates + untranslatedWeapons + untranslatedArmors + untranslatedEnemies + untranslatedItems;

// ============================================================================
// REPORTING SYSTEM
// ============================================================================
// IMPORTANT: All success messages must show remaining issues count (0), NOT
// resolved/solved counts. This makes it clear there are no remaining issues.
// Format: "✅ 0 [issue type]" when successful, "⚠️  N [issue type]" when issues exist.
// ============================================================================

// Translation Status
console.log(`\n📊 Translation Status:`);
if (totalUntranslated > 0) {
    console.log(`   ⚠️  ${totalUntranslated} items with untranslated content:`);
    console.log(`      Skills: ${untranslatedSkills}, States: ${untranslatedStates}, Weapons: ${untranslatedWeapons}`);
    console.log(`      Armors: ${untranslatedArmors}, Enemies: ${untranslatedEnemies}, Items: ${untranslatedItems}`);
} else {
    console.log(`   ✅ 0 items with untranslated content`);
}

// ID Reference Resolution
console.log(`\n🔎 ID Reference Resolution:`);
if (idRefStats.unresolvedDetections > 0) {
    console.log(`   ⚠️  ${idRefStats.unresolvedDetections} unresolved out of ${idRefStats.totalDetections} detected`);
    console.log(`   Total replacements: ${idRefStats.totalReplacements}`);
    console.log(`   By type: Skills: ${idRefStats.byType.skills}, States: ${idRefStats.byType.states}, Weapons: ${idRefStats.byType.weapons}`);
    console.log(`   Armors: ${idRefStats.byType.armors}, Enemies: ${idRefStats.byType.enemies}, Items: ${idRefStats.byType.items}`);
} else {
    console.log(`   ✅ 0 unresolved ID references`);
}

// Automatic Cross-Reference Detection
console.log(`\n🔍 Automatic Cross-Reference Detection:`);
if (detectedMissingRefs.length > 0) {
    console.log(`   ⚠️  ${detectedMissingRefs.length} potential missing cross-references:`);
    console.log(``);
    
    // Group by source type
    const bySourceType = {};
    detectedMissingRefs.forEach(issue => {
        if (!bySourceType[issue.sourceType]) bySourceType[issue.sourceType] = [];
        bySourceType[issue.sourceType].push(issue);
    });
    
    Object.entries(bySourceType).forEach(([sourceType, issues]) => {
        console.log(`   ${sourceType} (${issues.length} issues):`);
        issues.slice(0, 10).forEach(issue => {
            console.log(`      ${issue.sourceType} #${issue.sourceId} (${issue.sourceName})`);
            console.log(`         Field: ${issue.fieldName} (code: ${issue.fieldCode || 'N/A'})`);
            console.log(`         Missing: ${issue.targetType} #${issue.targetId} (${issue.targetName})`);
            console.log(`         Location: ${issue.location}`);
            console.log(``);
        });
        if (issues.length > 10) {
            console.log(`      ... and ${issues.length - 10} more ${sourceType} issues`);
            console.log(``);
        }
    });
} else {
    console.log(`   ✅ 0 missing cross-references found`);
}

// ============================================================================
// INFERRED DATA DETECTION REPORTING
// ============================================================================
// IMPORTANT: All detection reports must use SIMPLE ONE-LINE OUTPUTS only.
// - Each issue type should be reported as a single line with count
// - Format: "✅ 0 [issue type]" when successful, "⚠️  N [issue type]" when issues exist
// - Do NOT add detailed multi-line examples or verbose output here
// - This keeps the output clean and readable. Detailed information is available
//   in the detection systems themselves and can be logged separately if needed.
// - Each point (issue type) should be an independent line, not nested/indented
// ============================================================================

// Inferred Data Without Basis Detection
console.log(`\n🎯 Inferred Data Detection:`);
if (detectedInferredData.length > 0) {
    // Count mappings without sources (CRITICAL - challenges all assumptions)
    const mappingsWithoutSource = detectedInferredData.filter(i => i.type === 'mapping_without_source');
    
    // Count unmapped known parameters (most critical)
    const unmappedKnownParams = detectedInferredData.filter(i => 
        i.type === 'unmapped_known_parameter' || 
        i.type === 'unmapped_known_parameter_bonus' ||
        i.type === 'unmapped_known_parameter_effect'
    );
    
    // Count displayed as unknown
    const displayedAsUnknown = detectedInferredData.filter(i => 
        i.type === 'displayed_as_unknown' || 
        i.type === 'displayed_as_unknown_effect'
    );
    
    // Count unknown trait codes
    const unknownTraitCodes = detectedInferredData.filter(i => i.type === 'unknown_trait_code');
    
    // Count completely unknown parameters (will be reported separately below)
    const unknownParamsCount = detectedInferredData.filter(i => i.type === 'unknown_parameter').length;
    
    // Main summary line
    console.log(`   ⚠️  ${detectedInferredData.length} instances of inferred data without basis`);
    
    // Each issue type as independent one-line output (only show if count > 0)
    if (mappingsWithoutSource.length > 0) {
        console.log(`   🔍 Mappings without sources: ⚠️  ${mappingsWithoutSource.length} instances`);
    }
    if (unmappedKnownParams.length > 0) {
        console.log(`   🔍 Unmapped known parameters: ⚠️  ${unmappedKnownParams.length} instances`);
    }
    if (displayedAsUnknown.length > 0) {
        console.log(`   🔍 Displayed as unknown: ⚠️  ${displayedAsUnknown.length} instances`);
    }
    if (unknownTraitCodes.length > 0) {
        console.log(`   🔍 Unknown trait codes: ⚠️  ${unknownTraitCodes.length} instances`);
    }
    if (unknownParamsCount > 0) {
        console.log(`   🔍 Completely unknown parameters: ⚠️  ${unknownParamsCount} instances`);
    }
} else {
    console.log(`   ✅ 0 instances of inferred data without basis`);
}

// Unknown Parameters Detection (independent section)
// This detects parameters that are completely unknown (not in any known parameter list)
const unknownParams = detectedInferredData.filter(i => i.type === 'unknown_parameter');
console.log(`\n🔍 Unknown Parameters:`);
if (unknownParams.length > 0) {
    console.log(`   ⚠️  ${unknownParams.length} instances`);
    
    // Detailed report (only shown with --report-unknown flag)
    if (process.argv.includes('--report-unknown') || process.argv.includes('--detailed-unknown')) {
        const showFullDetails = process.argv.includes('--report-unknown-full') || process.argv.includes('--full');
        
        console.log(`\n${'='.repeat(80)}`);
        console.log(`UNKNOWN PARAMETERS - ${showFullDetails ? 'FULL DETAILED' : 'SUMMARY'} REPORT`);
        console.log('='.repeat(80));
        
        // Group by trait code
        const byTraitCode = {};
        unknownParams.forEach(issue => {
            const key = `${issue.code} (${issue.codeName || 'Unknown Trait'})`;
            if (!byTraitCode[key]) {
                byTraitCode[key] = [];
            }
            byTraitCode[key].push(issue);
        });
        
        // Group by dataId
        const byDataId = {};
        unknownParams.forEach(issue => {
            const key = issue.dataId;
            if (!byDataId[key]) {
                byDataId[key] = [];
            }
            byDataId[key].push(issue);
        });
        
        // Group by source type
        const bySourceType = {};
        unknownParams.forEach(issue => {
            if (!bySourceType[issue.sourceType]) {
                bySourceType[issue.sourceType] = [];
            }
            bySourceType[issue.sourceType].push(issue);
        });
        
        console.log('\n📊 Summary by Trait Code:');
        Object.entries(byTraitCode)
            .sort((a, b) => b[1].length - a[1].length)
            .forEach(([codeName, issues]) => {
                console.log(`   ${codeName}: ${issues.length} instances`);
            });
        
        console.log('\n📊 Summary by Parameter ID (dataId):');
        Object.entries(byDataId)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .forEach(([dataId, issues]) => {
                console.log(`   Parameter ${dataId}: ${issues.length} instances`);
            });
        
        console.log('\n📊 Summary by Source Type:');
        Object.entries(bySourceType)
            .sort((a, b) => b[1].length - a[1].length)
            .forEach(([sourceType, issues]) => {
                console.log(`   ${sourceType}: ${issues.length} instances`);
            });
        
        // Show sample items
        console.log('\n📋 Sample Items (Top 5 by frequency, 3 items each):');
        const topDataIds = Object.entries(byDataId)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 5);
        
        topDataIds.forEach(([dataId, issues]) => {
            console.log(`\n   Parameter ${dataId} (${issues.length} total instances):`);
            issues.slice(0, 3).forEach(issue => {
                console.log(`      ${issue.sourceType} #${issue.sourceId} (${issue.sourceName})`);
                console.log(`         Trait Code: ${issue.code} (${issue.codeName || 'Unknown'})`);
                console.log(`         Value: ${issue.value}`);
                console.log(`         Description: ${issue.description || 'N/A'}`);
            });
            if (issues.length > 3) {
                console.log(`      ... and ${issues.length - 3} more instances`);
            }
        });
        
        if (!showFullDetails) {
            console.log(`\n💡 Tip: Use --report-unknown-full for complete detailed output`);
        }
        
        console.log('\n' + '='.repeat(80));
    }
} else {
    console.log(`   ✅ 0 unknown parameters`);
}

// Ignored Data ID/Value Detection (independent section)
// This detects when traits show a code name (e.g., "Ex-Parameter") but ignore dataId and value
const ignoredDataIdValue = detectedInferredData.filter(i => i.type === 'ignored_data_id_value');
console.log(`\n🔍 Ignored Data ID/Value:`);
if (ignoredDataIdValue.length > 0) {
    console.log(`   ⚠️  ${ignoredDataIdValue.length} instances`);
    
    // Detailed report (only shown with --report-ignored flag)
    // Use --report-ignored-full for complete detailed output
    if (process.argv.includes('--report-ignored') || process.argv.includes('--detailed-ignored')) {
        const showFullDetails = process.argv.includes('--report-ignored-full') || process.argv.includes('--full');
        
        console.log(`\n${'='.repeat(80)}`);
        console.log(`IGNORED DATA ID/VALUE - ${showFullDetails ? 'FULL DETAILED' : 'SUMMARY'} REPORT`);
        console.log('='.repeat(80));
        
        // Group by source type
        const bySourceType = {};
        ignoredDataIdValue.forEach(issue => {
            if (!bySourceType[issue.sourceType]) {
                bySourceType[issue.sourceType] = [];
            }
            bySourceType[issue.sourceType].push(issue);
        });
        
        // Group by code/codeName
        const byCode = {};
        ignoredDataIdValue.forEach(issue => {
            const key = `${issue.code} (${issue.codeName})`;
            if (!byCode[key]) {
                byCode[key] = [];
            }
            byCode[key].push(issue);
        });
        
        // Display summary by source type
        console.log('\n📊 Summary by Source Type:');
        Object.entries(bySourceType)
            .sort((a, b) => b[1].length - a[1].length)
            .forEach(([sourceType, issues]) => {
                console.log(`   ${sourceType}: ${issues.length} instances`);
            });
        
        // Display summary by trait code (top 10)
        console.log('\n📊 Summary by Trait Code (Top 10):');
        Object.entries(byCode)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 10)
            .forEach(([codeName, issues]) => {
                console.log(`   ${codeName}: ${issues.length} instances`);
            });
        if (Object.keys(byCode).length > 10) {
            console.log(`   ... and ${Object.keys(byCode).length - 10} more trait codes`);
        }
        
        // Display statistics
        console.log('\n📈 Statistics:');
        console.log('─'.repeat(80));
        
        // Count by reason type
        const byReason = {};
        ignoredDataIdValue.forEach(issue => {
            const reason = issue.message || 'Unknown reason';
            const reasonType = reason.split(':')[0]; // Get first part before colon
            if (!byReason[reasonType]) {
                byReason[reasonType] = 0;
            }
            byReason[reasonType]++;
        });
        
        console.log('\nBy Reason Type:');
        Object.entries(byReason)
            .sort((a, b) => b[1] - a[1])
            .forEach(([reason, count]) => {
                console.log(`   ${reason}: ${count} instances`);
            });
        
        // Count unique dataIds
        const uniqueDataIds = new Set();
        ignoredDataIdValue.forEach(issue => {
            if (issue.dataId !== undefined && issue.dataId !== null) {
                uniqueDataIds.add(issue.dataId);
            }
        });
        
        // Count unique values
        const uniqueValues = new Set();
        ignoredDataIdValue.forEach(issue => {
            if (issue.value !== undefined && issue.value !== null) {
                uniqueValues.add(issue.value);
            }
        });
        
        console.log(`\nUnique Data IDs: ${uniqueDataIds.size}`);
        console.log(`Unique Values: ${uniqueValues.size}`);
        
        // Show most common dataIds (top 10)
        const dataIdCounts = {};
        ignoredDataIdValue.forEach(issue => {
            if (issue.dataId !== undefined && issue.dataId !== null) {
                if (!dataIdCounts[issue.dataId]) {
                    dataIdCounts[issue.dataId] = 0;
                }
                dataIdCounts[issue.dataId]++;
            }
        });
        
        console.log('\nMost Common Data IDs (Top 10):');
        Object.entries(dataIdCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([dataId, count]) => {
                console.log(`   Data ID ${dataId}: ${count} instances`);
            });
        
        // Show sample items per source type (top 5 sources, top 3 items each)
        console.log('\n📋 Sample Items (Top 5 Sources, 3 items each):');
        console.log('─'.repeat(80));
        
        Object.entries(bySourceType)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 5)
            .forEach(([sourceType, issues]) => {
                console.log(`\n${sourceType.toUpperCase()} (${issues.length} total instances):`);
                
                // Group by source ID
                const bySourceId = {};
                issues.forEach(issue => {
                    const key = `${issue.sourceId} - ${issue.sourceName}`;
                    if (!bySourceId[key]) {
                        bySourceId[key] = [];
                    }
                    bySourceId[key].push(issue);
                });
                
                // Show top 3 source IDs with most issues
                Object.entries(bySourceId)
                    .sort((a, b) => b[1].length - a[1].length)
                    .slice(0, 3)
                    .forEach(([sourceKey, sourceIssues]) => {
                        const [sourceId, sourceName] = sourceKey.split(' - ');
                        console.log(`  ${sourceType} #${sourceId} (${sourceName}) - ${sourceIssues.length} traits:`);
                        
                        // Show first 3 traits
                        sourceIssues.slice(0, 3).forEach((issue, idx) => {
                            const dataInfo = [];
                            if (issue.dataId !== undefined && issue.dataId !== null) dataInfo.push(`dataId:${issue.dataId}`);
                            if (issue.value !== undefined && issue.value !== null) dataInfo.push(`value:${issue.value}`);
                            console.log(`    - Trait #${issue.traitIndex || 'N/A'}: ${issue.codeName} (${dataInfo.join(', ')})`);
                        });
                        if (sourceIssues.length > 3) {
                            console.log(`    ... and ${sourceIssues.length - 3} more traits`);
                        }
                    });
                
                if (Object.keys(bySourceId).length > 3) {
                    console.log(`  ... and ${Object.keys(bySourceId).length - 3} more ${sourceType} items`);
                }
            });
        
        // Full detailed report (only if --report-ignored-full flag is used)
        if (showFullDetails) {
            console.log(`\n${'='.repeat(80)}`);
            console.log('FULL DETAILED REPORT BY SOURCE TYPE');
            console.log('='.repeat(80));
            
            Object.entries(bySourceType)
                .sort((a, b) => b[1].length - a[1].length)
                .forEach(([sourceType, issues]) => {
                    console.log(`\n${'='.repeat(80)}`);
                    console.log(`${sourceType.toUpperCase()} (${issues.length} instances)`);
                    console.log('='.repeat(80));
                    
                    // Group by source ID for better organization
                    const bySourceId = {};
                    issues.forEach(issue => {
                        const key = `${issue.sourceId} - ${issue.sourceName}`;
                        if (!bySourceId[key]) {
                            bySourceId[key] = [];
                        }
                        bySourceId[key].push(issue);
                    });
                    
                    Object.entries(bySourceId)
                        .sort((a, b) => {
                            // Sort by source ID (numeric)
                            const idA = parseInt(a[0].split(' - ')[0]);
                            const idB = parseInt(b[0].split(' - ')[0]);
                            return idA - idB;
                        })
                        .forEach(([sourceKey, sourceIssues]) => {
                            const [sourceId, sourceName] = sourceKey.split(' - ');
                            console.log(`\n  ${sourceType} #${sourceId} (${sourceName}):`);
                            console.log(`  ${'-'.repeat(76)}`);
                            
                            sourceIssues.forEach((issue, idx) => {
                                console.log(`    ${idx + 1}. Trait #${issue.traitIndex !== undefined ? issue.traitIndex : 'N/A'}`);
                                console.log(`       Code: ${issue.code !== undefined ? issue.code : 'N/A'} (${issue.codeName || 'Unknown'})`);
                                if (issue.dataId !== undefined && issue.dataId !== null) {
                                    console.log(`       Data ID: ${issue.dataId}`);
                                }
                                if (issue.value !== undefined && issue.value !== null) {
                                    console.log(`       Value: ${issue.value}`);
                                }
                                console.log(`       Description: ${issue.description || '(empty)'}`);
                                console.log(`       Reason: ${issue.message || 'Data ignored'}`);
                                console.log(`       Location: ${issue.location || 'N/A'}`);
                                if (idx < sourceIssues.length - 1) {
                                    console.log('');
                                }
                            });
                        });
                });
        } else {
            console.log(`\n💡 Tip: Use --report-ignored-full for complete detailed output`);
        }
        
        console.log('\n' + '='.repeat(80));
    }
} else {
    console.log(`   ✅ 0 instances`);
}

// Generate data.js file for client-side use
const dataJsContent = `const skillsData = ${JSON.stringify({ skills: processedSkills }, null, 2)};
const statesData = ${JSON.stringify({ states: processedStates }, null, 2)};
const weaponsData = ${JSON.stringify({ weapons: processedWeapons }, null, 2)};
const armorsData = ${JSON.stringify({ armors: processedArmors }, null, 2)};
const enemiesData = ${JSON.stringify({ enemies: processedEnemies }, null, 2)};
const itemsData = ${JSON.stringify({ items: processedItems }, null, 2)};
const elementsData = ${JSON.stringify({ elements: processedElements }, null, 2)};`;
fs.writeFileSync(path.join(__dirname, 'data.js'), dataJsContent);

