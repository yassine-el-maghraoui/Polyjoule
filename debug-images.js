import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('--- Debugging Images ---');

    // 1. Check MediaAssets
    console.log('\n1. Checking MediaAsset table (Last 5):');
    const assets = await prisma.mediaAsset.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
    });

    if (assets.length === 0) {
        console.log('No MediaAssets found.');
    } else {
        assets.forEach(asset => {
            console.log(`- ID: ${asset.id}, Filename: ${asset.filename}`);
            // Construct expected path
            const expectedPath = path.join(process.cwd(), 'public/uploads', asset.filename);
            const exists = fs.existsSync(expectedPath);
            console.log(`  -> Path checked: ${expectedPath}`);
            console.log(`  -> Exists? ${exists ? 'YES' : 'NO'}`);
        });
    }

    // 2. Check ContentEntries (looking for imagePath in data)
    console.log('\n2. Checking ContentEntry data (searching for "imagePath"):');
    // Since we can't easily filter JSON in Prisma findMany without raw query, we'll fetch some and filter in JS
    const entries = await prisma.contentEntry.findMany({
        take: 20,
        orderBy: { updatedAt: 'desc' },
    });

    let foundEntries = 0;
    for (const entry of entries) {
        try {
            const data = JSON.parse(entry.data);
            if (data.imagePath) {
                console.log(`- Entry [${entry.collection}/${entry.slug}]: imagePath = ${data.imagePath}`);
                foundEntries++;
            }
        } catch (e) {
            // ignore parse errors
        }
    }

    if (foundEntries === 0) {
        console.log('No entries with imagePath found in the last 20 records.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
