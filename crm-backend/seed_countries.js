const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addCountries() {
    try {
        console.log('Fetching countries...');
        // Use global fetch
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,region');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        let countries = [];
        if (Array.isArray(data)) {
            countries = data;
        } else if (data && Array.isArray(data.data)) {
            countries = data.data;
        } else {
            console.error("Unexpected API response format:", typeof data);
            return;
        }

        let addedCount = 0;
        let errorCount = 0;

        for (const country of countries) {
            try {
                let name = country.name?.common || country.name;
                let code = country.cca2 || country.alpha2Code;
                let region = country.region || 'Other';

                let phoneCode = null;
                if (country.idd) {
                    const root = country.idd.root || '';
                    const suffixes = country.idd.suffixes || [];
                    if (suffixes.length === 1) {
                        phoneCode = root + suffixes[0];
                    } else if (suffixes.length > 1) {
                        phoneCode = root; // multiple suffixes, just use the root code e.g. +1
                    } else {
                        phoneCode = root; // no suffixes, just root code
                    }
                }

                if (!code || !name) {
                    continue; // Skip if missing required fields
                }

                // If phoneCode is empty, try to derive from something else or set to null
                if (phoneCode === '') phoneCode = null;

                await prisma.country.upsert({
                    where: { code: code },
                    update: {
                        phoneCode: phoneCode,
                        region: region,
                    },
                    create: {
                        name: name,
                        code: code,
                        phoneCode: phoneCode,
                        region: region,
                        activeOnNationalities: true,
                        isActive: true
                    }
                });
                addedCount++;
            } catch (err) {
                if (err.code === 'P2002') {
                    // Name collision, finding by name and just updating the code
                    try {
                        let name = country.name?.common || country.name;
                        let code = country.cca2 || country.alpha2Code;
                        let region = country.region || 'Other';
                        let phoneCode = null;
                        if (country.idd) {
                            const root = country.idd.root || '';
                            const suffixes = country.idd.suffixes || [];
                            if (suffixes.length === 1) phoneCode = root + suffixes[0];
                            else if (suffixes.length > 1) phoneCode = root;
                            else phoneCode = root;
                        }

                        if (phoneCode === '') phoneCode = null;

                        const existingCountry = await prisma.country.findFirst({ where: { name: name } });
                        if (existingCountry && existingCountry.code !== code) {
                            await prisma.country.update({
                                where: { id: existingCountry.id },
                                data: { code: code, phoneCode: phoneCode, region: region }
                            });
                            addedCount++;
                        }
                    } catch (innerErr) {
                        console.error(`  - Failed to resolve collision for ${country.name?.common}`);
                        errorCount++;
                    }
                } else {
                    console.error(`Error adding ${country.name?.common}:`, err.message);
                    errorCount++;
                }
            }
        }

        console.log(`Successfully processed ${addedCount} countries.`);
        if (errorCount > 0) {
            console.log(`Failed to process ${errorCount} countries.`);
        }
    } catch (e) {
        console.error('Failed API fetch:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

addCountries();
