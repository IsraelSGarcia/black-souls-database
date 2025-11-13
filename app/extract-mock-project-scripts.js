const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Use dynamic import for ES module
async function extractScripts() {
    const marshal = await import('@savannstm/marshal');
    const load = marshal.load || marshal.default?.load;
    
    const scriptsPath = path.join(__dirname, '..', 'mock-rpg-maker-vx-ace-project', 'Data', 'Scripts.rvdata2');
    
    if (!fs.existsSync(scriptsPath)) {
        console.error('Scripts.rvdata2 not found at:', scriptsPath);
        return;
    }
    
    if (!load) {
        console.error('Could not find load function in @savannstm/marshal');
        return;
    }
    
    console.log('Reading Scripts.rvdata2...');
    const data = fs.readFileSync(scriptsPath);
    const scripts = load(data);
    
    console.log(`Found ${scripts.length} scripts\n`);
    
    // Search for feature code constants
    const featureCodePatterns = [
        /FEATURE|TRAIT|feature.*code|trait.*code/i,
        /code.*11|code.*12|code.*14|code.*21|code.*22|code.*23|code.*31|code.*41|code.*51|code.*52|code.*62/i,
        /HP.*Regen|MP.*Regen|Parameter.*Rate|Element.*Rate|Debuff.*Rate|Action.*Speed/i,
        /ELEMENT_RATE|DEBUFF_RATE|STATE_RATE|PARAMETER_RATE|HP_REGEN|MP_REGEN/i
    ];
    
    const foundScripts = [];
    
    for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        if (!Array.isArray(script) || script.length < 3) continue;
        
        const [scriptId, scriptName, scriptData] = script;
        
        // Check if it's compressed bytes
        if (scriptData && scriptData.__type === 'bytes' && Array.isArray(scriptData.data)) {
            try {
                const buffer = Buffer.from(scriptData.data);
                const decompressed = zlib.inflateSync(buffer);
                const scriptText = decompressed.toString('utf8');
                
                // Search for feature code patterns
                let hasMatch = false;
                const matches = [];
                
                for (const pattern of featureCodePatterns) {
                    const regex = new RegExp(pattern.source, 'gi');
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
                        matches: [...new Set(matches)],
                        text: scriptText
                    });
                    console.log(`✓ Found matches in: ${scriptName} (ID: ${scriptId})`);
                }
            } catch (error) {
                // Skip scripts that can't be decompressed
            }
        }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Found ${foundScripts.length} scripts with feature code references\n`);
    
    // Save extracted scripts
    const outputPath = path.join(__dirname, '..', 'mock-rpg-maker-vx-ace-project', 'Scripts_Extracted.txt');
    const output = foundScripts.map(script => {
        return `\n${'='.repeat(60)}\nScript: ${script.name} (ID: ${script.id})\n${'='.repeat(60)}\n${script.text}`;
    }).join('\n');
    
    fs.writeFileSync(outputPath, output, 'utf8');
    console.log(`Extracted scripts saved to: ${outputPath}`);
    
    // Search for specific feature code constants
    console.log('\n' + '='.repeat(60));
    console.log('Searching for feature code constants...\n');
    
    const codeConstants = [];
    for (const script of foundScripts) {
        // Look for patterns like FEATURE_HP_REGEN = 11, code = 11, etc.
        const constantPatterns = [
            /(?:FEATURE|TRAIT|CODE)[_\s]*[A-Z_]*[_\s]*=\s*(\d+)/gi,
            /code[_\s]*=\s*(\d+).*?(?:HP|MP|Regen|Parameter|Element|Debuff|State|Attack|Speed)/gi,
            /(\d+)[_\s]*=>[_\s]*['"](?:HP|MP|Regen|Parameter|Element|Debuff|State|Attack|Speed)/gi
        ];
        
        for (const pattern of constantPatterns) {
            const matches = [...script.text.matchAll(pattern)];
            if (matches.length > 0) {
                codeConstants.push({
                    script: script.name,
                    scriptId: script.id,
                    matches: matches.map(m => m[0])
                });
            }
        }
    }
    
    if (codeConstants.length > 0) {
        console.log('Found potential feature code constants:\n');
        codeConstants.forEach((item, index) => {
            console.log(`${index + 1}. Script: ${item.script} (ID: ${item.scriptId})`);
            console.log(`   Matches: ${item.matches.join(', ')}\n`);
        });
    } else {
        console.log('No explicit feature code constants found.');
        console.log('Displaying first few matching scripts for manual review...\n');
        foundScripts.slice(0, 3).forEach(script => {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`Script: ${script.name} (ID: ${script.id})`);
            console.log(`${'='.repeat(60)}`);
            console.log(script.text.substring(0, 2000));
            console.log('...\n');
        });
    }
}

extractScripts().catch(console.error);

