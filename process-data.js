const fs = require('fs');
const path = require('path');

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
const systemData = JSON.parse(fs.readFileSync('original-data/mv-data/System.json', 'utf8'));
const statesData = JSON.parse(fs.readFileSync('original-data/mv-data/States.json', 'utf8'));
const skillsData = JSON.parse(fs.readFileSync('original-data/mv-data/Skills.json', 'utf8'));
const weaponsData = JSON.parse(fs.readFileSync('original-data/mv-data/Weapons.json', 'utf8'));
const armorsData = JSON.parse(fs.readFileSync('original-data/mv-data/Armors.json', 'utf8'));
const enemiesData = JSON.parse(fs.readFileSync('original-data/mv-data/Enemies.json', 'utf8'));
const itemsData = JSON.parse(fs.readFileSync('original-data/mv-data/Items.json', 'utf8'));

// Translate Japanese element names to English
const elementTranslations = {
    "物理": "Physical",
    "吸収": "Absorption",
    "炎": "Fire",
    "氷": "Ice",
    "雷": "Lightning",
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
const scopeTypes = {
    0: "None",
    1: "1 Enemy",
    2: "All Enemies",
    3: "Random Enemy (1x)",
    4: "Random Enemy (2x)",
    5: "Random Enemy (3x)",
    6: "Random Enemy (4x)",
    7: "1 Ally",
    8: "All Allies",
    9: "1 Ally (Dead)",
    10: "All Allies (Dead)",
    11: "User",
    12: "Everybody",
    13: "1 Ally (Alive)",
    14: "All Allies (Alive)"
};

// Hit type descriptions
const hitTypes = {
    0: "Certain Hit",
    1: "Physical Attack",
    2: "Magical Attack"
};

// Occasion types
const occasionTypes = {
    0: "Always",
    1: "Battle Screen",
    2: "Menu Screen",
    3: "Never"
};

// Damage types
const damageTypes = {
    0: "None",
    1: "HP Damage",
    2: "MP Damage",
    3: "HP Recover",
    4: "MP Recover",
    5: "HP Drain",
    6: "MP Drain"
};

// Effect code descriptions
// NOTE: Code 13 (Gain TP) has been removed - DO NOT add it back
const effectCodes = {
    11: "Recover HP",
    12: "Recover MP",
    21: "Add State",
    22: "Remove State",
    31: "Add Buff",
    32: "Add Debuff",
    33: "Remove Buff",
    34: "Remove Debuff",
    41: "Special Effect",
    42: "Grow",
    43: "Learn Skill",
    44: "Common Event"
};

// Parameter names for buffs/debuffs
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

// Restriction types (for states)
const restrictionTypes = {
    0: "None",
    1: "Cannot Attack",
    2: "Cannot Guard",
    3: "Cannot Wait",
    4: "Cannot Move"
};

// Auto removal timing (for states)
const autoRemovalTimings = {
    0: "None",
    1: "Action End",
    2: "Turn End"
};

// Trait codes for states
// NOTE: Code 13 (TP Regeneration) and 47 (TP Charge Rate) have been removed - DO NOT add them back
const stateTraitCodes = {
    11: "HP Regeneration",
    12: "MP Regeneration",
    14: "Parameter Rate",
    21: "Element Rate",
    22: "Debuff Rate",
    23: "State Rate",
    31: "Normal Attack Times",
    32: "Skill Type Seal",
    33: "Element Seal",
    34: "Action Times+",
    41: "Special Flag",
    42: "Collapse Type",
    43: "Party Ability",
    44: "Auto Battle",
    45: "Guard Effect Rate",
    46: "Substitute",
    48: "Physical Damage Rate",
    49: "Magical Damage Rate",
    54: "Equip Weapon Lock",
    55: "Equip Armor Lock",
    62: "Action Speed",
    63: "Force Action Speed",
    64: "Buff Turn Rate",
    65: "Instant Death"
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
            return state && state.name ? state.name : null;
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
        // Skip if this is a self-reference
        if (sourceType === 'skill' && sourceId === parseInt(id)) return match;
        const name = resolvers.getSkillName(id);
        return name ? `[[SKILL:${id}:${name}]]` : match;
    });
    
    // Pattern 2: "State #123" or "State # 123"
    result = result.replace(/State\s*#\s*(\d+)/gi, (match, id) => {
        // Skip if this is a self-reference
        if (sourceType === 'state' && sourceId === parseInt(id)) return match;
        const name = resolvers.getStateName(id);
        return name ? `[[STATE:${id}:${name}]]` : match;
    });
    
    // Pattern 3: "Weapon #123" or "Weapon # 123"
    result = result.replace(/Weapon\s*#\s*(\d+)/gi, (match, id) => {
        // Skip if this is a self-reference
        if (sourceType === 'weapon' && sourceId === parseInt(id)) return match;
        const name = resolvers.getWeaponName(id);
        return name ? `[[WEAPON:${id}:${name}]]` : match;
    });
    
    // Pattern 4: "Armor #123" or "Armor # 123"
    result = result.replace(/Armor\s*#\s*(\d+)/gi, (match, id) => {
        // Skip if this is a self-reference
        if (sourceType === 'armor' && sourceId === parseInt(id)) return match;
        const name = resolvers.getArmorName(id);
        return name ? `[[ARMOR:${id}:${name}]]` : match;
    });
    
    // Pattern 5: "Item #123" or "Item # 123"
    result = result.replace(/Item\s*#\s*(\d+)/gi, (match, id) => {
        // Skip if this is a self-reference
        if (sourceType === 'item' && sourceId === parseInt(id)) return match;
        const name = resolvers.getItemName(id);
        return name ? `[[ITEM:${id}:${name}]]` : match;
    });
    
    // Pattern 6: "Enemy #123" or "Enemy # 123"
    result = result.replace(/Enemy\s*#\s*(\d+)/gi, (match, id) => {
        // Skip if this is a self-reference
        if (sourceType === 'enemy' && sourceId === parseInt(id)) return match;
        const name = resolvers.getEnemyName(id);
        return name ? `[[ENEMY:${id}:${name}]]` : match;
    });
    
    // Pattern 7: ID references in quotes or parentheses (e.g., "(#123)" or "[#123]")
    result = result.replace(/[\[\(]\s*#\s*(\d+)\s*[\]\)]/g, (match, id, offset, string) => {
        const idNum = parseInt(id);
        // Try all resolvers to find which type this is
        let name = resolvers.getSkillName(id);
        if (name) {
            // Skip if this is a self-reference
            if (sourceType === 'skill' && sourceId === idNum) return match;
            const before = string[offset - 1];
            const after = match[match.length - 1];
            const open = before === '(' ? '(' : '[';
            const close = after === ')' ? ')' : ']';
            return `${open}[[SKILL:${id}:${name}]]${close}`;
        }
        name = resolvers.getStateName(id);
        if (name) {
            // Skip if this is a self-reference
            if (sourceType === 'state' && sourceId === idNum) return match;
            const before = string[offset - 1];
            const after = match[match.length - 1];
            const open = before === '(' ? '(' : '[';
            const close = after === ')' ? ')' : ']';
            return `${open}[[STATE:${id}:${name}]]${close}`;
        }
        name = resolvers.getWeaponName(id);
        if (name) {
            // Skip if this is a self-reference
            if (sourceType === 'weapon' && sourceId === idNum) return match;
            const before = string[offset - 1];
            const after = match[match.length - 1];
            const open = before === '(' ? '(' : '[';
            const close = after === ')' ? ')' : ']';
            return `${open}[[WEAPON:${id}:${name}]]${close}`;
        }
        name = resolvers.getArmorName(id);
        if (name) {
            // Skip if this is a self-reference
            if (sourceType === 'armor' && sourceId === idNum) return match;
            const before = string[offset - 1];
            const after = match[match.length - 1];
            const open = before === '(' ? '(' : '[';
            const close = after === ')' ? ')' : ']';
            return `${open}[[ARMOR:${id}:${name}]]${close}`;
        }
        name = resolvers.getItemName(id);
        if (name) {
            // Skip if this is a self-reference
            if (sourceType === 'item' && sourceId === idNum) return match;
            const before = string[offset - 1];
            const after = match[match.length - 1];
            const open = before === '(' ? '(' : '[';
            const close = after === ')' ? ')' : ']';
            return `${open}[[ITEM:${id}:${name}]]${close}`;
        }
        name = resolvers.getEnemyName(id);
        if (name) {
            // Skip if this is a self-reference
            if (sourceType === 'enemy' && sourceId === idNum) return match;
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
            // Skip if this is a self-reference
            if (sourceType === 'skill' && sourceId === idNum) return match;
            return `[[SKILL:${id}:${name}]]`;
        }
        name = resolvers.getStateName(id);
        if (name) {
            // Skip if this is a self-reference
            if (sourceType === 'state' && sourceId === idNum) return match;
            return `[[STATE:${id}:${name}]]`;
        }
        name = resolvers.getWeaponName(id);
        if (name) {
            // Skip if this is a self-reference
            if (sourceType === 'weapon' && sourceId === idNum) return match;
            return `[[WEAPON:${id}:${name}]]`;
        }
        name = resolvers.getArmorName(id);
        if (name) {
            // Skip if this is a self-reference
            if (sourceType === 'armor' && sourceId === idNum) return match;
            return `[[ARMOR:${id}:${name}]]`;
        }
        name = resolvers.getItemName(id);
        if (name) {
            // Skip if this is a self-reference
            if (sourceType === 'item' && sourceId === idNum) return match;
            return `[[ITEM:${id}:${name}]]`;
        }
        name = resolvers.getEnemyName(id);
        if (name) {
            // Skip if this is a self-reference
            if (sourceType === 'enemy' && sourceId === idNum) return match;
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
    const patterns = [
        /\b(Skill|State|Weapon|Armor|Item|Enemy)\s*#\s*\d+/i,
        /[\[(]\s*#\s*\d+\s*[\])]/,
        /\b#\s*\d+\b/,
    ];
    return patterns.some(rx => rx.test(text));
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
    const getSkillName = (id) => {
        if (!skillsData) return `Skill #${id}`;
        const skill = skillsData.find(s => s && s.id === parseInt(id));
        return skill && skill.name ? skill.name : `Skill #${id}`;
    };
    
    // Helper function to get state name by ID
    const getStateName = (id) => {
        if (!statesData) return `State #${id}`;
        const state = statesData.find(s => s && s.id === parseInt(id));
        return state && state.name ? state.name : `State #${id}`;
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
        // Additional action after use without chance (100% assumed)
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
        { regex: /<合成設定:(\d+),(\d+),(\d+)>/g, replacement: (m, p1, p2, p3) => `Synthesis setting: ${p1}, ${p2}, ${p3}` }
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
                          elements[skill.damage.elementId] || `Unknown`
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
                    const effectInfo = {
                        code: effect.code,
                        codeName: effectCodes[effect.code] || `Unknown Effect`,
                        description: ""
                    };
                    
                    // Add specific descriptions based on effect code - no IDs shown
                    if (effect.code === 21) { // Add State
                        const state = statesData.find(s => s && s.id === effect.dataId);
                        const stateName = state?.name || "Unknown State";
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
                        const stateName = state?.name || "Unknown State";
                        effectInfo.stateName = stateName;
                        // Insert cross-reference marker directly
                        const stateRef = `[[STATE:${effect.dataId}:${stateName}]]`;
                        effectInfo.description = `Remove ${stateRef}`;
                    } else if (effect.code === 31 || effect.code === 32) { // Buff/Debuff
                        // Extended parameter names for values beyond standard 8
                        // NOTE: TP (Technical Points) has been removed from this game database
                        // DO NOT add TP Gain Rate (31) or TP Charge Rate (32) back
                        const extendedParamNames = {
                            16: "EXP Gain",
                            27: "EXP Gain Rate",
                            35: "HP Drain Rate",
                            39: "MP Drain Rate"
                        };
                        const paramName = parameterNames[effect.dataId] || extendedParamNames[effect.dataId] || `Unknown Parameter`;
                        const turns = Math.round(effect.value1);
                        effectInfo.parameter = paramName;
                        effectInfo.turns = turns;
                        effectInfo.description = effect.code === 31 
                            ? `Increase ${paramName} for ${turns} ${turns === 1 ? 'turn' : 'turns'}`
                            : `Decrease ${paramName} for ${turns} ${turns === 1 ? 'turn' : 'turns'}`;
                    } else if (effect.code === 33 || effect.code === 34) { // Remove Buff/Debuff
                        // Extended parameter names for values beyond standard 8
                        // NOTE: TP (Technical Points) has been removed from this game database
                        // DO NOT add TP Gain Rate (31) or TP Charge Rate (32) back
                        const extendedParamNames = {
                            16: "EXP Gain",
                            27: "EXP Gain Rate",
                            35: "HP Drain Rate",
                            39: "MP Drain Rate"
                        };
                        const paramName = parameterNames[effect.dataId] || extendedParamNames[effect.dataId] || `Unknown Parameter`;
                        effectInfo.parameter = paramName;
                        effectInfo.description = effect.code === 33 
                            ? `Remove ${paramName} increase`
                            : `Remove ${paramName} decrease`;
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
                        const specialTypes = ["Escape"];
                        effectInfo.description = specialTypes[effect.dataId] || "Special Effect";
                    } else if (effect.code === 44) { // Common Event
                        effectInfo.description = `Trigger Common Event`;
                    }
                    
                    // Resolve ID references in effect description
                    if (effectInfo.description) {
                        effectInfo.description = resolveAndLog(effectInfo.description, idResolvers, 'skill', skill.id, 'effect');
                    }
                    
                    return effectInfo;
                }),
            
            // Notes with translation
            note: translated
        };
    });

// Helper function to process traits (reusable for states and weapons)
function processTraits(traits, statesData) {
    return (traits || []).map(trait => {
        const traitInfo = {
            code: trait.code,
            codeName: stateTraitCodes[trait.code] || `Unknown Trait`,
            dataId: trait.dataId,
            value: trait.value,
            description: ""
        };
        
        // Generate readable descriptions based on trait code
        // NOTE: Code 11 can be either HP Regeneration OR Element Rate depending on dataId
        // If dataId corresponds to an element, it's Element Rate; otherwise it's HP Regeneration
        if (trait.code === 11) {
            // Check if dataId is an element (element IDs start from 0, but element 0 is empty)
            // If elements[trait.dataId] exists and is not empty, it's an Element Rate
            const elementName = elements[trait.dataId] || "";
            if (elementName && elementName.trim() !== "") {
                // This is Element Rate (code 11 is used for Element Rate in this game)
                traitInfo.codeName = "Element Rate";
                if (trait.value === 0) {
                    traitInfo.description = `Immune to ${elementName} damage`;
                } else if (trait.value < 1) {
                    // Resistance: takes less damage
                    const damagePercent = Math.round(trait.value * 100);
                    traitInfo.description = `Takes ${damagePercent}% ${elementName} damage (reduced)`;
                } else if (trait.value > 1) {
                    // Weakness: takes more damage
                    const damagePercent = Math.round(trait.value * 100);
                    traitInfo.description = `Takes ${damagePercent}% ${elementName} damage (increased)`;
                } else {
                    traitInfo.description = `Takes normal ${elementName} damage`;
                }
            } else {
                // This is HP Regeneration (standard behavior)
                const percent = Math.round(trait.value * 100);
                if (percent > 0) {
                    if (percent >= 100) {
                        traitInfo.description = `Heals ${percent}% of maximum HP each turn (fully heals)`;
                    } else {
                        traitInfo.description = `Heals ${percent}% of maximum HP each turn`;
                    }
                } else if (percent === 0) {
                    traitInfo.description = `No HP regeneration`;
                } else {
                    traitInfo.description = `Loses ${Math.abs(percent)}% of maximum HP each turn`;
                }
            }
        } else if (trait.code === 12) { // MP Regeneration
            const percent = Math.round(trait.value * 100);
            if (percent > 0) {
                if (percent >= 100) {
                    traitInfo.description = `Restores ${percent}% of maximum MP each turn (fully restores)`;
                } else {
                    traitInfo.description = `Restores ${percent}% of maximum MP each turn`;
                }
            } else if (percent === 0) {
                traitInfo.description = `No MP regeneration`;
            } else {
                traitInfo.description = `Loses ${Math.abs(percent)}% of maximum MP each turn`;
            }
        } else if (trait.code === 14) { // Parameter Rate
            // Extended parameter names for values beyond standard 8
            // NOTE: TP (Technical Points) has been removed from this game database
            // DO NOT add TP Gain Rate (31) or TP Charge Rate (32) back
            const extendedParamNames = {
                16: "EXP Gain",
                27: "EXP Gain Rate",
                35: "HP Drain Rate",
                39: "MP Drain Rate"
            };
            
            const paramName = parameterNames[trait.dataId] || extendedParamNames[trait.dataId] || `Unknown Parameter`;
            const percent = Math.round((trait.value - 1) * 100);
            
            if (trait.value === 0) {
                traitInfo.description = `${paramName} set to 0`;
            } else if (percent === 0) {
                traitInfo.description = `${paramName} unchanged`;
            } else {
                traitInfo.description = percent > 0 
                    ? `${paramName} +${percent}%`
                    : `${paramName} ${percent}%`;
            }
        } else if (trait.code === 21) { // Element Rate
            // Get element name, handling empty strings and missing elements
            let elementName = elements[trait.dataId] || "";
            if (!elementName || elementName.trim() === "") {
                // If element name is empty or missing, use a generic description
                const damagePercent = Math.round(trait.value * 100);
                if (trait.value === 0) {
                    traitInfo.description = `Immune to unknown element damage`;
                } else if (trait.value < 1) {
                    traitInfo.description = `Takes ${damagePercent}% unknown element damage (reduced)`;
                } else if (trait.value > 1) {
                    traitInfo.description = `Takes ${damagePercent}% unknown element damage (increased)`;
                } else {
                    traitInfo.description = `Takes normal unknown element damage`;
                }
                return traitInfo;
            }
            
            if (trait.value === 0) {
                traitInfo.description = `Immune to ${elementName} damage`;
            } else if (trait.value < 1) {
                // Resistance: takes less damage
                const damagePercent = Math.round(trait.value * 100);
                traitInfo.description = `Takes ${damagePercent}% ${elementName} damage (reduced)`;
            } else if (trait.value > 1) {
                // Weakness: takes more damage
                const damagePercent = Math.round(trait.value * 100);
                traitInfo.description = `Takes ${damagePercent}% ${elementName} damage (increased)`;
            } else {
                traitInfo.description = `Takes normal ${elementName} damage`;
            }
        } else if (trait.code === 22) {
            // NOTE: In this game, code 22 with dataId 7 is used for HP Regeneration (drain)
            // This is a non-standard usage - normally code 22 is Debuff Rate
            // Check if this is HP/MP Regeneration first (dataId 7 = HP, dataId 8 = MP in this context)
            if (trait.dataId === 7) {
                // This is HP Regeneration (drain when negative)
                traitInfo.codeName = "HP Regeneration";
                const percent = Math.round(trait.value * 100);
                if (percent > 0) {
                    if (percent >= 100) {
                        traitInfo.description = `Heals ${percent}% of maximum HP each turn (fully heals)`;
                    } else {
                        traitInfo.description = `Heals ${percent}% of maximum HP each turn`;
                    }
                } else if (percent === 0) {
                    traitInfo.description = `No HP regeneration`;
                } else {
                    traitInfo.description = `Loses ${Math.abs(percent)}% of maximum HP each turn`;
                }
            } else if (trait.dataId === 8) {
                // This is MP Regeneration (drain when negative)
                traitInfo.codeName = "MP Regeneration";
                const percent = Math.round(trait.value * 100);
                if (percent > 0) {
                    if (percent >= 100) {
                        traitInfo.description = `Restores ${percent}% of maximum MP each turn (fully restores)`;
                    } else {
                        traitInfo.description = `Restores ${percent}% of maximum MP each turn`;
                    }
                } else if (percent === 0) {
                    traitInfo.description = `No MP regeneration`;
                } else {
                    traitInfo.description = `Loses ${Math.abs(percent)}% of maximum MP each turn`;
                }
            } else {
                // Standard Debuff Rate behavior for other dataIds
                traitInfo.codeName = "Debuff Rate";
                // Extended parameter names for values beyond standard 8
                const extendedParamNames = {
                    16: "EXP Gain",
                    27: "EXP Gain Rate",
                    35: "HP Drain Rate",
                    39: "MP Drain Rate"
                };
                const paramName = parameterNames[trait.dataId] || extendedParamNames[trait.dataId] || "Unknown Parameter";
                if (trait.value === 0) {
                    traitInfo.description = `Immune to ${paramName} debuffs`;
                } else if (trait.value < 0) {
                    // Negative values: debuffs become buffs instead
                    // In RPG Maker, a negative debuff rate inverts debuffs to buffs
                    // The absolute value represents the effectiveness/magnitude
                    const percent = Math.round(Math.abs(trait.value) * 100);
                    traitInfo.description = `When ${paramName} debuff is applied, it is converted to a buff with ${percent}% effectiveness`;
                } else if (trait.value < 1) {
                    // 0 < value < 1: debuffs are less effective
                    const damagePercent = Math.round(trait.value * 100);
                    traitInfo.description = `${paramName} debuffs are only ${damagePercent}% effective`;
                } else if (trait.value === 1) {
                    traitInfo.description = `Normal ${paramName} debuff effectiveness`;
                } else {
                    // value > 1: debuffs are more effective
                    const damagePercent = Math.round(trait.value * 100);
                    traitInfo.description = `${paramName} debuffs are ${damagePercent}% effective`;
                }
            }
        } else if (trait.code === 23) { // State Rate
            const state = statesData.find(s => s && s.id === trait.dataId);
            const stateName = state?.name || "Unknown State";
            // Insert cross-reference marker directly
            const stateRef = `[[STATE:${trait.dataId}:${stateName}]]`;
            if (trait.value <= 0) {
                if (trait.value === 0) {
                    traitInfo.description = `Immune to ${stateRef}`;
                } else {
                    traitInfo.description = `${stateRef} immunity (extended)`;
                }
            } else if (trait.value >= 1) {
                traitInfo.description = `Normal ${stateRef} susceptibility`;
            } else {
                const resistPercent = Math.round((1 - trait.value) * 100);
                traitInfo.description = `${resistPercent}% resistance to ${stateRef}`;
            }
        } else if (trait.code === 31) { // Normal Attack Times
            if (trait.value === 0) {
                traitInfo.description = `Cannot use normal attacks`;
            } else {
                traitInfo.description = `Normal attacks ${trait.value > 0 ? '+' : ''}${trait.value} times`;
            }
        } else if (trait.code === 34) { // Action Times+
            traitInfo.description = `Action times ${trait.value > 0 ? '+' : ''}${trait.value}`;
        } else if (trait.code === 45) { // Guard Effect Rate
            const percent = Math.round((trait.value - 1) * 100);
            traitInfo.description = `Guard effectiveness ${percent > 0 ? '+' : ''}${percent}%`;
        } else if (trait.code === 48) { // Physical Damage Rate
            const percent = Math.round((trait.value - 1) * 100);
            traitInfo.description = `Physical damage ${percent > 0 ? '+' : ''}${percent}%`;
        } else if (trait.code === 49) { // Magical Damage Rate
            const percent = Math.round((trait.value - 1) * 100);
            traitInfo.description = `Magical damage ${percent > 0 ? '+' : ''}${percent}%`;
        } else if (trait.code === 62) { // Action Speed
            const percent = Math.round((trait.value - 1) * 100);
            traitInfo.description = `Action speed ${percent > 0 ? '+' : ''}${percent}%`;
        } else if (trait.code === 64) { // Buff Turn Rate
            const percent = Math.round((trait.value - 1) * 100);
            traitInfo.description = `Buff duration ${percent > 0 ? '+' : ''}${percent}%`;
        } else if (trait.code === 42) { // Collapse Type
            // Collapse types: 0 = Normal, 1 = Instant, 2 = No Collapse
            const collapseTypes = {
                0: "Normal collapse",
                1: "Instant collapse",
                2: "No collapse animation"
            };
            const collapseType = collapseTypes[trait.dataId] || `Collapse type ${trait.dataId}`;
            traitInfo.description = collapseType;
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
    .filter(state => state.name && state.name.trim() !== '') // Remove nameless states
    .map(state => {
        let translated = translateNote(state.note, skillsData, statesData, 'state', state.id);
        
        // Resolve ID references in translated note
        if (translated.english) {
            translated.english = resolveAndLog(translated.english, idResolvers, 'state', state.id, 'note');
        }
        
        // Process traits - map to readable descriptions
        const traits = processTraits(state.traits, statesData);
        
        // Resolve ID references in trait descriptions
        traits.forEach(trait => {
            if (trait.description) {
                trait.description = resolveAndLog(trait.description, idResolvers, 'state', state.id, 'trait');
            }
        });
        
        // Check for untranslated Japanese in state name and messages
        let stateName = convertJapanesePunctuation(state.name);
        stateName = resolveAndLog(stateName, idResolvers, 'state', state.id, 'name');
        if (containsJapanese(stateName)) {
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
        const params = weapon.params || [];
        const paramBonuses = [];
        const paramNames = ["Max HP", "Max MP", "Attack", "Defense", "Magic Attack", "Magic Defense", "Agility", "Luck"];
        
        params.forEach((value, index) => {
            if (value !== 0) {
                paramBonuses.push({
                    name: paramNames[index] || `Unknown Parameter ${index}`,
                    value: value
                });
            }
        });
        
        // Process traits using the same logic as states
        // Filter out trait code 31 with value 0 (normal attacks disabled) - this is standard for weapons
        const filteredWeaponTraits = (weapon.traits || []).filter(trait => 
            !(trait.code === 31 && trait.value === 0)
        );
        const traits = processTraits(filteredWeaponTraits, statesData);
        
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
        const params = armor.params || [];
        const paramBonuses = [];
        const paramNames = ["Max HP", "Max MP", "Attack", "Defense", "Magic Attack", "Magic Defense", "Agility", "Luck"];
        
        params.forEach((value, index) => {
            if (value !== 0) {
                paramBonuses.push({
                    name: paramNames[index] || `Unknown Parameter ${index}`,
                    value: value
                });
            }
        });
        
        // Process traits using the same logic as weapons/states
        const traits = processTraits(armor.traits || [], statesData);
        
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
        const traits = processTraits(enemy.traits || [], statesData);
        
        // Resolve ID references in trait descriptions
        traits.forEach(trait => {
            if (trait.description) {
                trait.description = resolveAndLog(trait.description, idResolvers, 'enemy', enemy.id, 'trait');
            }
        });
        
        // Process actions array: resolve skillId to skill names
        const actions = (enemy.actions || []).map(action => {
            const skill = skillsData.find(s => s && s.id === action.skillId);
            const skillName = skill && skill.name ? skill.name : `Skill #${action.skillId}`;
            // Insert cross-reference marker directly
            const skillRef = `[[SKILL:${action.skillId}:${skillName}]]`;
            return {
                skillId: action.skillId,
                skillName: skillRef,
                rating: action.rating,
                conditionType: action.conditionType,
                conditionParam1: action.conditionParam1,
                conditionParam2: action.conditionParam2
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
        const effects = (item.effects || []).map(effect => {
            const effectInfo = {
                code: effect.code,
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
            } else if (effect.code === 11) {
                // HP Recover
                const percent = Math.round(effect.value1 * 100);
                effectInfo.description = `Recovers ${percent}% HP`;
            } else if (effect.code === 12) {
                // MP Recover
                const percent = Math.round(effect.value1 * 100);
                effectInfo.description = `Recovers ${percent}% MP`;
            } else if (effect.code === 22) {
                // Remove State
                const state = statesData.find(s => s && s.id === effect.dataId);
                const stateName = state && state.name ? state.name : `State #${effect.dataId}`;
                effectInfo.stateName = stateName;
                // Insert cross-reference marker directly
                const stateRef = `[[STATE:${effect.dataId}:${stateName}]]`;
                effectInfo.description = `Remove ${stateRef}`;
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
            const element = item.damage.elementId >= 0 && item.damage.elementId < elements.length 
                ? elements[item.damage.elementId] 
                : "Unknown";
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

// Create output object
const output = {
    skills: processedSkills,
    states: processedStates,
    weapons: processedWeapons,
    armors: processedArmors,
    enemies: processedEnemies,
    items: processedItems,
    metadata: {
        totalSkills: processedSkills.length,
        totalStates: processedStates.length,
        totalWeapons: processedWeapons.length,
        totalArmors: processedArmors.length,
        totalEnemies: processedEnemies.length,
        totalItems: processedItems.length,
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
    // Only check trait code 23 (State Rate) which references other states
    allData.states.forEach(state => {
        if (!state || !state.traits) return;
        state.traits.forEach((trait, index) => {
            if (!trait || trait.dataId === undefined || trait.dataId === 0) return;
            // Only check trait code 23 (State Rate)
            if (trait.code !== 23) return;
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
    // Only check trait code 23 (State Rate) which references states
    allData.weapons.forEach(weapon => {
        if (!weapon || !weapon.traits) return;
        weapon.traits.forEach((trait, index) => {
            if (!trait || trait.dataId === undefined || trait.dataId === 0) return;
            // Only check trait code 23 (State Rate)
            if (trait.code !== 23) return;
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
    // Only check trait code 23 (State Rate) which references states
    allData.armors.forEach(armor => {
        if (!armor || !armor.traits) return;
        armor.traits.forEach((trait, index) => {
            if (!trait || trait.dataId === undefined || trait.dataId === 0) return;
            // Only check trait code 23 (State Rate)
            if (trait.code !== 23) return;
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

// Write to file
fs.writeFileSync('processed-data.json', JSON.stringify(output, null, 2));
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

// Generate data.js file for client-side use
const dataJsContent = `const skillsData = ${JSON.stringify({ skills: processedSkills }, null, 2)};
const statesData = ${JSON.stringify({ states: processedStates }, null, 2)};
const weaponsData = ${JSON.stringify({ weapons: processedWeapons }, null, 2)};
const armorsData = ${JSON.stringify({ armors: processedArmors }, null, 2)};
const enemiesData = ${JSON.stringify({ enemies: processedEnemies }, null, 2)};
const itemsData = ${JSON.stringify({ items: processedItems }, null, 2)};`;
fs.writeFileSync('data.js', dataJsContent);

