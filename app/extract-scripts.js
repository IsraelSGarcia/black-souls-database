const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// Read the Scripts.json file
const scriptsPath = path.join(__dirname, '..', 'original-data', 'ruby-marshal-converted', 'Scripts.json');
const scriptsData = JSON.parse(fs.readFileSync(scriptsPath, 'utf8'));

console.log('Extracting and searching scripts for parameter definitions...\n');

// Scripts are stored as [script_id, script_name, {__type: "bytes", data: [...]}]
const scripts = [];
const searchTerms = [
    'parameter.*18',
    'param.*18',
    'data_id.*18',
    'dataId.*18',
    '18\s*=>',
    '\[18\]',
    'PARAM\[18\]',
    'param\[18\]',
    'parameter\[18\]',
    'パラメータ.*18',
    'データID.*18',
    'def.*param',
    'PARAM',
    'Parameter',
    'parameter_rate',
    'param_rate'
];

const foundScripts = [];

// Process each script
for (let i = 0; i < scriptsData.length; i++) {
    const script = scriptsData[i];
    if (!Array.isArray(script) || script.length < 3) continue;
    
    const [scriptId, scriptName, scriptData] = script;
    
    // Check if it's compressed bytes
    if (scriptData && scriptData.__type === 'bytes' && Array.isArray(scriptData.data)) {
        try {
            // Convert array of numbers to Buffer
            const buffer = Buffer.from(scriptData.data);
            
            // Decompress using zlib
            const decompressed = zlib.inflateSync(buffer);
            const scriptText = decompressed.toString('utf8');
            
            // Search for parameter-related terms (case-insensitive)
            const lowerScriptText = scriptText.toLowerCase();
            let hasMatch = false;
            const matches = [];
            
            for (const term of searchTerms) {
                const regex = new RegExp(term, 'gi');
                const scriptMatches = scriptText.match(regex);
                if (scriptMatches) {
                    hasMatch = true;
                    matches.push(...scriptMatches);
                }
            }
            
            if (hasMatch) {
                foundScripts.push({
                    id: scriptId,
                    name: scriptName,
                    matches: [...new Set(matches)], // Remove duplicates
                    text: scriptText
                });
                console.log(`✓ Found matches in script: ${scriptName} (ID: ${scriptId})`);
                console.log(`  Matches: ${[...new Set(matches)].slice(0, 5).join(', ')}${[...new Set(matches)].length > 5 ? '...' : ''}`);
            }
        } catch (error) {
            // Some scripts might not be zlib compressed or might be in different format
            // Skip them silently
        }
    }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`Found ${foundScripts.length} scripts with parameter-related content`);

// Save all found scripts to a file for easier searching
const outputPath = path.join(__dirname, '..', 'original-data', 'ruby-marshal-converted', 'Scripts_Extracted.txt');
const output = foundScripts.map(script => {
    return `\n${'='.repeat(60)}\nScript: ${script.name} (ID: ${script.id})\n${'='.repeat(60)}\n${script.text}`;
}).join('\n');

fs.writeFileSync(outputPath, output, 'utf8');
console.log(`\nExtracted scripts saved to: ${outputPath}`);

// Now search specifically for parameter 18
console.log('\n' + '='.repeat(60));
console.log('Searching specifically for parameter 18 references...\n');

const param18Matches = [];
for (const script of foundScripts) {
    // Look for patterns that might indicate parameter 18
    const patterns = [
        /\b18\b.*param/i,
        /param.*\b18\b/i,
        /\[18\].*param/i,
        /param.*\[18\]/i,
        /PARAM\[18\]/i,
        /param\[18\]/i,
        /data_id.*18|dataId.*18/i,
        /18\s*=>.*param/i,
        /parameter.*18|パラメータ.*18/i
    ];
    
    for (const pattern of patterns) {
        const matches = script.text.match(pattern);
        if (matches) {
            // Get context around the match
            const matchIndex = script.text.search(pattern);
            const contextStart = Math.max(0, matchIndex - 200);
            const contextEnd = Math.min(script.text.length, matchIndex + 200);
            const context = script.text.substring(contextStart, contextEnd);
            
            param18Matches.push({
                script: script.name,
                scriptId: script.id,
                match: matches[0],
                context: context
            });
        }
    }
}

if (param18Matches.length > 0) {
    console.log(`Found ${param18Matches.length} potential parameter 18 references:\n`);
    param18Matches.forEach((match, index) => {
        console.log(`${index + 1}. Script: ${match.script} (ID: ${match.scriptId})`);
        console.log(`   Match: ${match.match}`);
        console.log(`   Context: ...${match.context}...\n`);
    });
    
    // Save parameter 18 matches to a separate file
    const param18OutputPath = path.join(__dirname, '..', 'original-data', 'ruby-marshal-converted', 'Parameter18_References.txt');
    const param18Output = param18Matches.map((match, index) => {
        return `${index + 1}. Script: ${match.script} (ID: ${match.scriptId})\n   Match: ${match.match}\n   Context: ${match.context}\n${'='.repeat(60)}\n`;
    }).join('\n');
    
    fs.writeFileSync(param18OutputPath, param18Output, 'utf8');
    console.log(`\nParameter 18 references saved to: ${param18OutputPath}`);
} else {
    console.log('No specific parameter 18 references found in scripts.');
    console.log('Checking for parameter definitions or mappings...\n');
    
    // Look for parameter arrays or hash definitions
    const paramDefPatterns = [
        /PARAM\s*=\s*\[/i,
        /param\s*=\s*\[/i,
        /PARAMETER\s*=\s*\[/i,
        /parameter\s*=\s*\[/i,
        /def.*param/i,
        /PARAM.*def/i
    ];
    
    for (const script of foundScripts) {
        for (const pattern of paramDefPatterns) {
            if (pattern.test(script.text)) {
                console.log(`Found parameter definition pattern in: ${script.name} (ID: ${script.id})`);
                // Extract a larger context
                const matchIndex = script.text.search(pattern);
                const contextStart = Math.max(0, matchIndex - 500);
                const contextEnd = Math.min(script.text.length, matchIndex + 2000);
                const context = script.text.substring(contextStart, contextEnd);
                console.log(`Context:\n${context}\n${'='.repeat(60)}\n`);
            }
        }
    }
}

