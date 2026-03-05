import { NextResponse } from 'next/server';

/**
 * Full field definitions for each module, mapping the exact API response key
 * to a human-readable label and field type.
 * fieldType: 'text' | 'select' | 'boolean' | 'date' | 'number'
 */
const MODULE_FIELD_DEFINITIONS: Record<string, { key: string; label: string; fieldType: string }[]> = {
    Students: [
        { key: 'status', label: 'Status', fieldType: 'select' },
        { key: 'nationalityName', label: 'Nationality', fieldType: 'select' },
        { key: 'gender', label: 'Gender', fieldType: 'select' },
        { key: 'firstName', label: 'First Name', fieldType: 'text' },
        { key: 'lastName', label: 'Last Name', fieldType: 'text' },
        { key: 'fullName', label: 'Full Name', fieldType: 'text' },
        { key: 'email', label: 'Email', fieldType: 'text' },
        { key: 'phone', label: 'Phone', fieldType: 'text' },
        { key: 'mobile', label: 'Mobile', fieldType: 'text' },
        { key: 'passportNumber', label: 'Passport Number', fieldType: 'text' },
        { key: 'studentId', label: 'Student ID', fieldType: 'text' },
        { key: 'transferStudent', label: 'Transfer Student', fieldType: 'boolean' },
        { key: 'haveTc', label: 'Have T.C.', fieldType: 'boolean' },
        { key: 'blueCard', label: 'Blue Card', fieldType: 'boolean' },
        { key: 'addressLine1', label: 'Address', fieldType: 'text' },
        { key: 'cityDistrict', label: 'City/District', fieldType: 'text' },
        { key: 'stateProvince', label: 'State/Province', fieldType: 'text' },
        { key: 'addressCountry', label: 'Address Country', fieldType: 'text' },
        { key: 'educationLevelName', label: 'Education Level', fieldType: 'text' },
        { key: 'highSchoolCountry', label: 'High School Country', fieldType: 'text' },
        { key: 'highSchoolName', label: 'High School Name', fieldType: 'text' },
        { key: 'bachelorSchoolName', label: 'Bachelor School', fieldType: 'text' },
        { key: 'isActive', label: 'Is Active', fieldType: 'boolean' },
        { key: 'createdAt', label: 'Created At', fieldType: 'date' },
    ],

    Applications: [
        { key: 'status', label: 'Status', fieldType: 'select' },
        { key: 'stage', label: 'Stage', fieldType: 'select' },
        { key: 'applicationName', label: 'Application Name', fieldType: 'text' },
        { key: 'notes', label: 'Notes', fieldType: 'text' },
        { key: 'ownerType', label: 'Owner Type', fieldType: 'select' },
        { key: 'createdAt', label: 'Created At', fieldType: 'date' },
    ],

    Leads: [
        { key: 'status', label: 'Status', fieldType: 'select' },
        { key: 'type', label: 'Type', fieldType: 'select' },
        { key: 'source', label: 'Source', fieldType: 'select' },
        { key: 'fullName', label: 'Full Name', fieldType: 'text' },
        { key: 'email', label: 'Email', fieldType: 'text' },
        { key: 'phone', label: 'Phone', fieldType: 'text' },
        { key: 'country', label: 'Country', fieldType: 'text' },
        { key: 'city', label: 'City', fieldType: 'text' },
        { key: 'companyName', label: 'Company Name', fieldType: 'text' },
        { key: 'contactPerson', label: 'Contact Person', fieldType: 'text' },
        { key: 'budgetRange', label: 'Budget Range', fieldType: 'select' },
        { key: 'preferredIntake', label: 'Preferred Intake', fieldType: 'text' },
        { key: 'isActive', label: 'Is Active', fieldType: 'boolean' },
        { key: 'createdAt', label: 'Created At', fieldType: 'date' },
    ],

    Agents: [
        { key: 'companyName', label: 'Company Name', fieldType: 'text' },
        { key: 'contactPerson', label: 'Contact Person', fieldType: 'text' },
        { key: 'email', label: 'Email', fieldType: 'text' },
        { key: 'phone', label: 'Phone', fieldType: 'text' },
        { key: 'country', label: 'Country', fieldType: 'text' },
        { key: 'city', label: 'City', fieldType: 'text' },
        { key: 'isActive', label: 'Is Active', fieldType: 'boolean' },
        { key: 'createdAt', label: 'Created At', fieldType: 'date' },
    ],
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');

    if (!module) {
        return NextResponse.json({ error: 'module is required' }, { status: 400 });
    }

    const fields = MODULE_FIELD_DEFINITIONS[module] || [];
    return NextResponse.json({ fields });
}
