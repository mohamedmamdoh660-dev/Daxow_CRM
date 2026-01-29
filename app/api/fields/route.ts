import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const module = searchParams.get('module');

        if (!module) {
            return NextResponse.json(
                { error: 'Module parameter is required' },
                { status: 400 }
            );
        }

        // Mock field definitions for Student module
        const mockFields = module === 'Student' ? [
            {
                id: '1',
                module: 'Student',
                apiName: 'preferred_intake',
                label: 'Preferred Intake',
                fieldType: 'select',
                isRequired: false,
                isIndexed: false,
                options: ['September 2024', 'January 2025', 'May 2025', 'September 2025'],
                placeholder: 'Select preferred intake',
                displayOrder: 1,
                isActive: true,
            },
            {
                id: '2',
                module: 'Student',
                apiName: 'english_test',
                label: 'English Test',
                fieldType: 'select',
                isRequired: false,
                isIndexed: false,
                options: ['IELTS', 'TOEFL', 'PTE', 'Duolingo', 'None'],
                placeholder: 'Select English test',
                displayOrder: 2,
                isActive: true,
            },
            {
                id: '3',
                module: 'Student',
                apiName: 'test_score',
                label: 'Test Score',
                fieldType: 'number',
                isRequired: false,
                isIndexed: false,
                placeholder: 'Enter test score',
                displayOrder: 3,
                isActive: true,
            },
            {
                id: '4',
                module: 'Student',
                apiName: 'preferred_countries',
                label: 'Preferred Countries',
                fieldType: 'multiselect',
                isRequired: false,
                isIndexed: false,
                options: ['UK', 'USA', 'Canada', 'Australia', 'Germany'],
                helpText: 'Select all countries of interest',
                displayOrder: 4,
                isActive: true,
            },
        ] : [];

        return NextResponse.json({ fields: mockFields });
    } catch (error: any) {
        console.error('Error fetching fields:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch fields' },
            { status: 500 }
        );
    }
}
