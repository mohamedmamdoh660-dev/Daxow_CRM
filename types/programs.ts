export interface Program {
    // Core Fields
    id: string;
    name: string;
    isActive: boolean; // mapped from active
    activeApplications: boolean; // mapped from active_applications
    studyYears?: string; // mapped from study_years
    createdAt: string; // mapped from created_at
    updatedAt: string; // mapped from updated_at

    // Financial Fields
    officialTuition?: string; // mapped from official_tuition
    discountedTuition?: string; // mapped from discounted_tuition
    tuitionCurrency?: string; // mapped from tuition_currency


    // Relational Fields (IDs)
    facultyId: string;
    specialtyId: string;
    degreeId: string;
    languageId: string;
    countryId?: string;
    cityId?: string;
    userId?: string;

    // Connected Entities (Optional for Fetching)
    faculty?: { id: string; name: string };
    specialty?: { id: string; name: string };
    degree?: { id: string; name: string };
    language?: { id: string; name: string };
    country?: { id: string; name: string };
    city?: { id: string; name: string };
}

export interface ProgramsListResponse {
    data: Program[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ProgramFilters {
    search?: string;
    facultyId?: string;
    specialtyId?: string;
    degreeId?: string;
    languageId?: string;
    countryId?: string;
    cityId?: string;
    isActive?: boolean;
    activeApplications?: boolean;
}
