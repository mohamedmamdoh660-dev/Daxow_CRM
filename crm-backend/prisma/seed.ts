import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create countries - Comprehensive list
    console.log('Creating countries...');

    // Define all countries with ISO codes
    const countryData = [
        // Middle East
        { name: 'Saudi Arabia', code: 'SA' },
        { name: 'United Arab Emirates', code: 'AE' },
        { name: 'Kuwait', code: 'KW' },
        { name: 'Qatar', code: 'QA' },
        { name: 'Bahrain', code: 'BH' },
        { name: 'Oman', code: 'OM' },
        { name: 'Jordan', code: 'JO' },
        { name: 'Lebanon', code: 'LB' },
        { name: 'Iraq', code: 'IQ' },
        { name: 'Syria', code: 'SY' },
        { name: 'Palestine', code: 'PS' },
        { name: 'Yemen', code: 'YE' },
        { name: 'Iran', code: 'IR' },
        { name: 'Israel', code: 'IL' },

        // North Africa
        { name: 'Egypt', code: 'EG' },
        { name: 'Morocco', code: 'MA' },
        { name: 'Algeria', code: 'DZ' },
        { name: 'Tunisia', code: 'TN' },
        { name: 'Libya', code: 'LY' },
        { name: 'Sudan', code: 'SD' },
        { name: 'Mauritania', code: 'MR' },

        // Sub-Saharan Africa
        { name: 'South Africa', code: 'ZA' },
        { name: 'Nigeria', code: 'NG' },
        { name: 'Kenya', code: 'KE' },
        { name: 'Ethiopia', code: 'ET' },
        { name: 'Ghana', code: 'GH' },
        { name: 'Tanzania', code: 'TZ' },
        { name: 'Uganda', code: 'UG' },
        { name: 'Angola', code: 'AO' },
        { name: 'Mozambique', code: 'MZ' },
        { name: 'Madagascar', code: 'MG' },
        { name: 'Cameroon', code: 'CM' },
        { name: 'Ivory Coast', code: 'CI' },
        { name: 'Niger', code: 'NE' },
        { name: 'Burkina Faso', code: 'BF' },
        { name: 'Mali', code: 'ML' },
        { name: 'Malawi', code: 'MW' },
        { name: 'Zambia', code: 'ZM' },
        { name: 'Senegal', code: 'SN' },
        { name: 'Somalia', code: 'SO' },
        { name: 'Chad', code: 'TD' },
        { name: 'Zimbabwe', code: 'ZW' },
        { name: 'Guinea', code: 'GN' },
        { name: 'Rwanda', code: 'RW' },
        { name: 'Benin', code: 'BJ' },
        { name: 'Burundi', code: 'BI' },
        { name: 'Tunisia', code: 'TN' },
        { name: 'South Sudan', code: 'SS' },
        { name: 'Togo', code: 'TG' },
        { name: 'Sierra Leone', code: 'SL' },
        { name: 'Liberia', code: 'LR' },
        { name: 'Mauritius', code: 'MU' },
        { name: 'Eritrea', code: 'ER' },
        { name: 'Gambia', code: 'GM' },
        { name: 'Botswana', code: 'BW' },
        { name: 'Namibia', code: 'NA' },
        { name: 'Gabon', code: 'GA' },
        { name: 'Lesotho', code: 'LS' },
        { name: 'Guinea-Bissau', code: 'GW' },
        { name: 'Equatorial Guinea', code: 'GQ' },
        { name: 'Mauritania', code: 'MR' },
        { name: 'Eswatini', code: 'SZ' },
        { name: 'Djibouti', code: 'DJ' },
        { name: 'Comoros', code: 'KM' },
        { name: 'Cape Verde', code: 'CV' },
        { name: 'São Tomé and Príncipe', code: 'ST' },
        { name: 'Seychelles', code: 'SC' },

        // Europe
        { name: 'United Kingdom', code: 'GB' },
        { name: 'Germany', code: 'DE' },
        { name: 'France', code: 'FR' },
        { name: 'Italy', code: 'IT' },
        { name: 'Spain', code: 'ES' },
        { name: 'Netherlands', code: 'NL' },
        { name: 'Belgium', code: 'BE' },
        { name: 'Switzerland', code: 'CH' },
        { name: 'Austria', code: 'AT' },
        { name: 'Sweden', code: 'SE' },
        { name: 'Norway', code: 'NO' },
        { name: 'Denmark', code: 'DK' },
        { name: 'Finland', code: 'FI' },
        { name: 'Poland', code: 'PL' },
        { name: 'Czech Republic', code: 'CZ' },
        { name: 'Romania', code: 'RO' },
        { name: 'Hungary', code: 'HU' },
        { name: 'Portugal', code: 'PT' },
        { name: 'Greece', code: 'GR' },
        { name: 'Bulgaria', code: 'BG' },
        { name: 'Slovakia', code: 'SK' },
        { name: 'Croatia', code: 'HR' },
        { name: 'Ireland', code: 'IE' },
        { name: 'Lithuania', code: 'LT' },
        { name: 'Latvia', code: 'LV' },
        { name: 'Estonia', code: 'EE' },
        { name: 'Slovenia', code: 'SI' },
        { name: 'Luxembourg', code: 'LU' },
        { name: 'Malta', code: 'MT' },
        { name: 'Cyprus', code: 'CY' },
        { name: 'Iceland', code: 'IS' },
        { name: 'Albania', code: 'AL' },
        { name: 'Serbia', code: 'RS' },
        { name: 'Bosnia and Herzegovina', code: 'BA' },
        { name: 'North Macedonia', code: 'MK' },
        { name: 'Montenegro', code: 'ME' },
        { name: 'Kosovo', code: 'XK' },
        { name: 'Moldova', code: 'MD' },
        { name: 'Ukraine', code: 'UA' },
        { name: 'Belarus', code: 'BY' },
        { name: 'Russia', code: 'RU' },
        { name: 'Monaco', code: 'MC' },
        { name: 'Liechtenstein', code: 'LI' },
        { name: 'San Marino', code: 'SM' },
        { name: 'Vatican City', code: 'VA' },
        { name: 'Andorra', code: 'AD' },

        // Asia
        { name: 'China', code: 'CN' },
        { name: 'India', code: 'IN' },
        { name: 'Japan', code: 'JP' },
        { name: 'South Korea', code: 'KR' },
        { name: 'Indonesia', code: 'ID' },
        { name: 'Pakistan', code: 'PK' },
        { name: 'Bangladesh', code: 'BD' },
        { name: 'Philippines', code: 'PH' },
        { name: 'Vietnam', code: 'VN' },
        { name: 'Thailand', code: 'TH' },
        { name: 'Myanmar', code: 'MM' },
        { name: 'Afghanistan', code: 'AF' },
        { name: 'Malaysia', code: 'MY' },
        { name: 'Nepal', code: 'NP' },
        { name: 'Sri Lanka', code: 'LK' },
        { name: 'Cambodia', code: 'KH' },
        { name: 'Singapore', code: 'SG' },
        { name: 'Mongolia', code: 'MN' },
        { name: 'Laos', code: 'LA' },
        { name: 'Brunei', code: 'BN' },
        { name: 'Bhutan', code: 'BT' },
        { name: 'Maldives', code: 'MV' },
        { name: 'East Timor', code: 'TL' },
        { name: 'Taiwan', code: 'TW' },
        { name: 'Hong Kong', code: 'HK' },
        { name: 'Macau', code: 'MO' },
        { name: 'Kazakhstan', code: 'KZ' },
        { name: 'Uzbekistan', code: 'UZ' },
        { name: 'Turkmenistan', code: 'TM' },
        { name: 'Kyrgyzstan', code: 'KG' },
        { name: 'Tajikistan', code: 'TJ' },
        { name: 'Azerbaijan', code: 'AZ' },
        { name: 'Georgia', code: 'GE' },
        { name: 'Armenia', code: 'AM' },
        { name: 'Turkey', code: 'TR' },

        // North America
        { name: 'United States', code: 'US' },
        { name: 'Canada', code: 'CA' },
        { name: 'Mexico', code: 'MX' },
        { name: 'Guatemala', code: 'GT' },
        { name: 'Cuba', code: 'CU' },
        { name: 'Haiti', code: 'HT' },
        { name: 'Dominican Republic', code: 'DO' },
        { name: 'Honduras', code: 'HN' },
        { name: 'Nicaragua', code: 'NI' },
        { name: 'El Salvador', code: 'SV' },
        { name: 'Costa Rica', code: 'CR' },
        { name: 'Panama', code: 'PA' },
        { name: 'Jamaica', code: 'JM' },
        { name: 'Trinidad and Tobago', code: 'TT' },
        { name: 'Belize', code: 'BZ' },
        { name: 'Bahamas', code: 'BS' },
        { name: 'Barbados', code: 'BB' },
        { name: 'Saint Lucia', code: 'LC' },
        { name: 'Grenada', code: 'GD' },
        { name: 'Saint Vincent and the Grenadines', code: 'VC' },
        { name: 'Antigua and Barbuda', code: 'AG' },
        { name: 'Dominica', code: 'DM' },
        { name: 'Saint Kitts and Nevis', code: 'KN' },

        // South America
        { name: 'Brazil', code: 'BR' },
        { name: 'Colombia', code: 'CO' },
        { name: 'Argentina', code: 'AR' },
        { name: 'Peru', code: 'PE' },
        { name: 'Venezuela', code: 'VE' },
        { name: 'Chile', code: 'CL' },
        { name: 'Ecuador', code: 'EC' },
        { name: 'Bolivia', code: 'BO' },
        { name: 'Paraguay', code: 'PY' },
        { name: 'Uruguay', code: 'UY' },
        { name: 'Guyana', code: 'GY' },
        { name: 'Suriname', code: 'SR' },

        // Oceania
        { name: 'Australia', code: 'AU' },
        { name: 'New Zealand', code: 'NZ' },
        { name: 'Papua New Guinea', code: 'PG' },
        { name: 'Fiji', code: 'FJ' },
        { name: 'Solomon Islands', code: 'SB' },
        { name: 'Vanuatu', code: 'VU' },
        { name: 'Samoa', code: 'WS' },
        { name: 'Kiribati', code: 'KI' },
        { name: 'Tonga', code: 'TO' },
        { name: 'Micronesia', code: 'FM' },
        { name: 'Palau', code: 'PW' },
        { name: 'Marshall Islands', code: 'MH' },
        { name: 'Tuvalu', code: 'TV' },
        { name: 'Nauru', code: 'NR' },
    ];

    // Sequential upsert to avoid Supabase Session Mode connection limits
    console.log(`Processing ${countryData.length} countries sequentially (one at a time)...`);
    let createdCount = 0;

    for (const { name, code } of countryData) {
        await prisma.country.upsert({
            where: { code },
            update: {},
            create: {
                name,
                code,
                activeOnNationalities: true,
            },
        });
        createdCount++;

        // Show progress every 20 countries
        if (createdCount % 20 === 0 || createdCount === countryData.length) {
            console.log(`  ✓ Processed ${createdCount}/${countryData.length} countries`);
        }
    }

    console.log(`✅ Created/Updated ${createdCount} countries`);

    // Create education degrees
    console.log('Creating education degrees...');
    const degrees = await Promise.all([
        prisma.degree.upsert({
            where: { name: 'Bachelor' },
            update: {},
            create: { name: 'Bachelor', displayOrder: 1, isActive: true },
        }),
        prisma.degree.upsert({
            where: { name: 'Master' },
            update: {},
            create: { name: 'Master', displayOrder: 2, isActive: true },
        }),
        prisma.degree.upsert({
            where: { name: 'PhD' },
            update: {},
            create: { name: 'PhD', displayOrder: 3, isActive: true },
        }),
        prisma.degree.upsert({
            where: { name: 'Diploma' },
            update: {},
            create: { name: 'Diploma', displayOrder: 4, isActive: true },
        }),
    ]);

    console.log(`✅ Created ${degrees.length} education degrees`);

    // Create default pipeline stages
    console.log('Creating pipeline stages...');
    const stages = await Promise.all([
        prisma.stage.upsert({
            where: { name: 'New' },
            update: {},
            create: {
                name: 'New',
                color: '#6366f1',
                order: 1,
                description: 'New application received',
            },
        }),
        prisma.stage.upsert({
            where: { name: 'Documents Submitted' },
            update: {},
            create: {
                name: 'Documents Submitted',
                color: '#8b5cf6',
                order: 2,
                description: 'Student has submitted all required documents',
            },
        }),
        prisma.stage.upsert({
            where: { name: 'Applied' },
            update: {},
            create: {
                name: 'Applied',
                color: '#3b82f6',
                order: 3,
                description: 'Application submitted to university',
            },
        }),
        prisma.stage.upsert({
            where: { name: 'Conditional Offer' },
            update: {},
            create: {
                name: 'Conditional Offer',
                color: '#06b6d4',
                order: 4,
                description: 'Received conditional offer',
            },
        }),
        prisma.stage.upsert({
            where: { name: 'Unconditional Offer' },
            update: {},
            create: {
                name: 'Unconditional Offer',
                color: '#10b981',
                order: 5,
                description: 'Received unconditional offer',
            },
        }),
        prisma.stage.upsert({
            where: { name: 'Visa Processing' },
            update: {},
            create: {
                name: 'Visa Processing',
                color: '#f59e0b',
                order: 6,
                description: 'Processing student visa',
            },
        }),
        prisma.stage.upsert({
            where: { name: 'Enrolled' },
            update: {},
            create: {
                name: 'Enrolled',
                color: '#22c55e',
                order: 7,
                description: 'Student successfully enrolled',
            },
        }),
        prisma.stage.upsert({
            where: { name: 'Rejected' },
            update: {},
            create: {
                name: 'Rejected',
                color: '#ef4444',
                order: 8,
                description: 'Application rejected',
            },
        }),
    ]);

    console.log(`✅ Created ${stages.length} pipeline stages`);

    // Create sample field definitions for Student module
    console.log('Creating sample field definitions...');
    const fieldDefinitions = await Promise.all([
        prisma.fieldDefinition.upsert({
            where: {
                module_apiName: {
                    module: 'Student',
                    apiName: 'preferred_intake',
                },
            },
            update: {},
            create: {
                module: 'Student',
                apiName: 'preferred_intake',
                label: 'Preferred Intake',
                fieldType: 'select',
                isRequired: false,
                options: [
                    'September 2024',
                    'January 2025',
                    'May 2025',
                    'September 2025',
                    'January 2026',
                ],
                placeholder: 'Select preferred intake',
                displayOrder: 1,
            },
        }),
        prisma.fieldDefinition.upsert({
            where: {
                module_apiName: {
                    module: 'Student',
                    apiName: 'english_test',
                },
            },
            update: {},
            create: {
                module: 'Student',
                apiName: 'english_test',
                label: 'English Test',
                fieldType: 'select',
                isRequired: false,
                options: ['IELTS', 'TOEFL', 'PTE', 'Duolingo', 'None'],
                placeholder: 'Select English test',
                displayOrder: 2,
            },
        }),
        prisma.fieldDefinition.upsert({
            where: {
                module_apiName: {
                    module: 'Student',
                    apiName: 'test_score',
                },
            },
            update: {},
            create: {
                module: 'Student',
                apiName: 'test_score',
                label: 'Test Score',
                fieldType: 'number',
                isRequired: false,
                placeholder: 'Enter test score',
                displayOrder: 3,
            },
        }),
        prisma.fieldDefinition.upsert({
            where: {
                module_apiName: {
                    module: 'Student',
                    apiName: 'budget_range',
                },
            },
            update: {},
            create: {
                module: 'Student',
                apiName: 'budget_range',
                label: 'Budget Range (USD)',
                fieldType: 'select',
                isRequired: false,
                options: [
                    'Under $10,000',
                    '$10,000 - $20,000',
                    '$20,000 - $30,000',
                    '$30,000 - $50,000',
                    'Above $50,000',
                ],
                placeholder: 'Select budget range',
                displayOrder: 4,
            },
        }),
        prisma.fieldDefinition.upsert({
            where: {
                module_apiName: {
                    module: 'Student',
                    apiName: 'preferred_countries',
                },
            },
            update: {},
            create: {
                module: 'Student',
                apiName: 'preferred_countries',
                label: 'Preferred Countries',
                fieldType: 'multiselect',
                isRequired: false,
                options: ['UK', 'USA', 'Canada', 'Australia', 'Germany', 'Netherlands', 'Ireland'],
                helpText: 'Select all countries the student is interested in',
                displayOrder: 5,
            },
        }),
        prisma.fieldDefinition.upsert({
            where: {
                module_apiName: {
                    module: 'Student',
                    apiName: 'special_requirements',
                },
            },
            update: {},
            create: {
                module: 'Student',
                apiName: 'special_requirements',
                label: 'Special Requirements',
                fieldType: 'textarea',
                isRequired: false,
                placeholder: 'Any special requirements or notes...',
                displayOrder: 6,
            },
        }),
    ]);

    console.log(`✅ Created ${fieldDefinitions.length} field definitions`);

    // Create sample faculties
    console.log('Creating sample faculties...');
    const faculties = await Promise.all([
        prisma.faculty.upsert({
            where: { name: 'Engineering' },
            update: {},
            create: { name: 'Engineering', isActive: true },
        }),
        prisma.faculty.upsert({
            where: { name: 'Business' },
            update: {},
            create: { name: 'Business', isActive: true },
        }),
    ]);

    console.log(`✅ Created ${faculties.length} faculties`);

    // Create sample language
    console.log('Creating sample language...');
    const language = await prisma.language.upsert({
        where: { name: 'English' }, // Fixed: Use name as it is @unique
        update: {},
        create: { name: 'English', code: 'EN', isActive: true },
    });
    console.log(`✅ Created language: ${language.name}`);

    // Create Specialties
    console.log('Creating specialties...');
    const csSpecialty = await prisma.specialty.upsert({
        where: { name: 'Computer Science' },
        update: {},
        create: {
            name: 'Computer Science', // Added name
            facultyId: faculties[0].id, // Engineering
            isActive: true,
        },
    });
    const mbaSpecialty = await prisma.specialty.upsert({
        where: { name: 'Business Administration' },
        update: {},
        create: {
            name: 'Business Administration', // Added name
            facultyId: faculties[1].id, // Business
            isActive: true,
        },
    });

    // Create sample programs
    console.log('Creating sample programs...');
    const programs = await Promise.all([
        prisma.program.create({
            data: {
                facultyId: faculties[0].id,
                specialtyId: csSpecialty.id,
                degreeId: degrees[1].id, // Master
                languageId: language.id,
                name: 'MSc Computer Science',
                officialTuition: '28000',
                tuitionCurrency: 'GBP',
                isActive: true,
            },
        }),
        prisma.program.create({
            data: {
                facultyId: faculties[1].id,
                specialtyId: mbaSpecialty.id,
                degreeId: degrees[1].id, // Master
                languageId: language.id,
                name: 'MBA - Master of Business Administration',
                officialTuition: '65000',
                tuitionCurrency: 'CAD',
                isActive: true,
            },
        }),
    ]);

    console.log(`✅ Created ${programs.length} programs`);

    // Create sample agent
    console.log('Creating sample agent...');
    const agent = await prisma.agent.create({
        data: {
            companyName: 'Global Education Consultants',
            contactPerson: 'John Smith',
            email: 'john@globaledu.com',
            phone: '+1234567890',
            commissionRate: 15.00,
            country: 'United Arab Emirates',
            city: 'Dubai',
            metadata: {},
        },
    });

    console.log(`✅ Created sample agent`);

    // Create default admin user
    console.log('Creating admin user...');
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@admission-crm.com' },
        update: {},
        create: {
            email: 'admin@admission-crm.com',
            password: '$2a$10$YourHashedPasswordHere', // In production, use bcrypt.hash('password', 10)
            name: 'Admin User',
            role: 'admin',
            metadata: {},
        },
    });

    console.log(`✅ Created admin user`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${createdCount} countries (from main seed)`);
    console.log(`   - ${degrees.length} education degrees`);
    console.log(`   - ${stages.length} pipeline stages`);
    console.log(`   - ${fieldDefinitions.length} field definitions`);
    console.log(`   - ${faculties.length} faculties`);
    console.log(`   - ${programs.length} programs`);
    console.log(`   - 1 agent`);
    console.log(`   - 1 admin user`);
    console.log('\n💡 Next steps:');
    console.log('   1. Update your .env file with your PostgreSQL database URL');
    console.log('   2. Run: npx prisma migrate dev --name init');
    console.log('   3. Run: npx prisma db seed');
    console.log('   4. Start the dev server: npm run dev');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
