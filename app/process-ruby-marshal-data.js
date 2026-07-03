const fs = require('fs');
const path = require('path');

// @savannstm/marshal is an ES module, so we need to use dynamic import
let load;

// List of main data files to process (excluding map files)
const dataFilesToProcess = [
    'System',
    'Skills',
    'States',
    'Weapons',
    'Armors',
    'Items',
    'Enemies',
    'Actors',
    'Classes',
    'Animations',
    'CommonEvents',
    'Troops',
    'Tilesets',
    'Scripts'
];

// Function to process a single .rvdata2 file
async function processRvdata2File(filename, inputDir, outputDir) {
    const inputPath = path.join(inputDir, filename);
    const outputFilename = filename.replace('.rvdata2', '.json');
    const outputPath = path.join(outputDir, outputFilename);

    try {
        // Check if file exists
        if (!fs.existsSync(inputPath)) {
            return false;
        }

        console.log(`Processing ${filename}...`);

        // Read binary file
        const binaryData = fs.readFileSync(inputPath);

        // Parse Ruby Marshal format using @savannstm/marshal
        let data;
        try {
            // @savannstm/marshal uses a load function that takes a Buffer
            if (typeof load === 'function') {
                data = load(binaryData);
            } else {
                throw new Error('load function not available from @savannstm/marshal package.');
            }
        } catch (parseError) {
            throw new Error(`Failed to parse Ruby Marshal data: ${parseError.message}`);
        }

        // Convert to JSON with proper formatting
        const jsonData = JSON.stringify(data, null, 2);

        // Write JSON file
        fs.writeFileSync(outputPath, jsonData, 'utf8');

        console.log(`✓ Successfully converted ${filename} -> ${outputFilename}`);
        return true;
    } catch (error) {
        console.error(`✗ Error processing ${filename}:`, error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        return false;
    }
}

// Main processing function
async function main() {
    console.log('Starting Ruby Marshal Converted data processing...\n');

    // Load the marshal module (ES module)
    try {
        const marshal = await import('@savannstm/marshal');
        load = marshal.load;
        if (typeof load !== 'function') {
            throw new Error('load function not found in @savannstm/marshal package');
        }
    } catch (error) {
        console.error('Error: Could not load @savannstm/marshal package.');
        console.error('Please install it by running: npm install');
        console.error('Error details:', error.message);
        process.exit(1);
    }

    const args = process.argv.slice(2);
    const games = args.length > 0 ? args : ['bs1', 'bs2', 'rrw'];

    for (const game of games) {
        const inputDir = path.join(__dirname, '..', 'original-data', game, 'ruby-marshal-converted');
        const outputDir = inputDir;

        if (!fs.existsSync(inputDir)) {
            console.log(`Skipping game ${game} - directory not found: ${inputDir}`);
            continue;
        }

        console.log(`\n========================================`);
        console.log(`Processing Game: ${game}`);
        console.log(`Input/Output Directory: ${inputDir}`);
        console.log(`========================================`);

        let successCount = 0;
        let failCount = 0;
        let foundAny = false;

        // Process each data file
        for (const filename of dataFilesToProcess) {
            const fullFilename = `${filename}.rvdata2`;
            if (fs.existsSync(path.join(inputDir, fullFilename))) {
                foundAny = true;
                if (await processRvdata2File(fullFilename, inputDir, outputDir)) {
                    successCount++;
                } else {
                    failCount++;
                }
            }
        }

        if (!foundAny) {
            console.log(`No .rvdata2 files found in ${inputDir}. Skipping conversion.`);
            continue;
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log(`Summary for ${game}:`);
        console.log(`  Successfully processed: ${successCount} files`);
        console.log(`  Failed: ${failCount} files`);
        console.log('='.repeat(50));
    }
}

// Run the script
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

