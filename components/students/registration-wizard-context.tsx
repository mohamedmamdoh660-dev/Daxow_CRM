'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as z from 'zod';

// Form validation schema (same as the existing one)
export const formSchema = z.object({
    // Student Information
    transferStudent: z.enum(['yes', 'no']),
    haveTc: z.enum(['yes', 'no']).optional(),
    tcNumber: z.string().optional(),
    blueCard: z.enum(['yes', 'no']),

    // Personal Details
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    gender: z.enum(['Male', 'Female', 'Other']),
    dateOfBirth: z.date(),
    nationality: z.string().min(1, 'Nationality is required'),
    passportNumber: z.string().min(1, 'Passport number is required'),
    passportIssueDate: z.date(),
    passportExpiryDate: z.date(),

    // Contact Information
    email: z.string().email('Invalid email address'),
    mobile: z.string().min(8, 'Mobile number must be at least 8 digits'),

    // Address Information
    addressLine1: z.string().optional(),
    cityDistrict: z.string().optional(),
    stateProvince: z.string().optional(),
    postalCode: z.string().optional(),
    addressCountry: z.string().optional(),

    // Family Information
    fatherName: z.string().min(1, 'Father name is required'),
    fatherMobile: z.string().optional(),
    fatherOccupation: z.string().optional(),
    motherName: z.string().optional(),
    motherMobile: z.string().optional(),
    motherOccupation: z.string().optional(),

    // Academic Information
    educationLevelId: z.string().optional(),
    educationLevelName: z.string().optional(),
    highSchoolCountry: z.string().optional(),
    highSchoolName: z.string().optional(),
    highSchoolGpa: z.string().optional(),
    bachelorCountry: z.string().optional(),
    bachelorSchoolName: z.string().optional(),
    bachelorGpa: z.string().optional(),
    masterCountry: z.string().optional(),
    masterSchoolName: z.string().optional(),
    masterGpa: z.string().optional(),
}).refine((data) => {
    if (data.haveTc === 'yes' && !data.tcNumber) {
        return false;
    }
    return true;
}, {
    message: 'T.C. number is required when selected',
    path: ['tcNumber'],
}).refine((data) => {
    if (data.passportExpiryDate && data.passportIssueDate) {
        return data.passportExpiryDate > data.passportIssueDate;
    }
    return true;
}, {
    message: 'Expiry date must be after issue date',
    path: ['passportExpiryDate'],
}).refine((data) => {
    const today = new Date();
    const birthDate = new Date(data.dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 15;
}, {
    message: 'Student must be at least 15 years old',
    path: ['dateOfBirth'],
});

export type FormValues = z.infer<typeof formSchema>;

export interface UploadedDocument {
    id: string;
    type: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: Date;
    file?: File; // Raw file object for deferred upload
}

interface WizardContextType {
    currentStep: number;
    formData: Partial<FormValues>;
    documents: UploadedDocument[];
    countries: Array<{ id: string; name: string; code: string }>;
    nationalityCountries: Array<{ id: string; name: string; code: string }>;
    degrees: Array<{ id: string; name: string }>;
    setFormData: (data: Partial<FormValues>) => void;
    addDocument: (doc: UploadedDocument) => void;
    removeDocument: (id: string) => void;
    nextStep: () => void;
    previousStep: () => void;
    goToStep: (step: number) => void;
    resetWizard: () => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const useWizard = () => {
    const context = useContext(WizardContext);
    if (!context) {
        throw new Error('useWizard must be used within WizardProvider');
    }
    return context;
};

interface WizardProviderProps {
    children: ReactNode;
}

export const WizardProvider: React.FC<WizardProviderProps> = ({ children }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormDataState] = useState<Partial<FormValues>>({
        transferStudent: 'no',
        haveTc: 'no',
        blueCard: 'no',
    });
    const [documents, setDocuments] = useState<UploadedDocument[]>([]);

    const setFormData = (data: Partial<FormValues>) => {
        setFormDataState((prev) => ({ ...prev, ...data }));
    };

    const addDocument = (doc: UploadedDocument) => {
        setDocuments((prev) => [...prev, doc]);
    };

    const removeDocument = (id: string) => {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const previousStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const goToStep = (step: number) => {
        if (step >= 1 && step <= 4) {
            setCurrentStep(step);
        }
    };

    const resetWizard = () => {
        setCurrentStep(1);
        setFormDataState({
            transferStudent: 'no',
            haveTc: 'no',
            blueCard: 'no',
        });
        setDocuments([]);
    };

    const [countries, setCountries] = useState<Array<{ id: string; name: string; code: string }>>([]);
    const [nationalityCountries, setNationalityCountries] = useState<Array<{ id: string; name: string; code: string }>>([]);
    const [degrees, setDegrees] = useState<Array<{ id: string; name: string }>>([]);

    // Fetch static data once on mount
    React.useEffect(() => {
        const fetchStaticData = async () => {
            try {
                const [nationalityRes, countriesRes, degreesRes] = await Promise.all([
                    fetch('/api/countries?pageSize=200&activeOnNationalities=true&isActive=true'),
                    fetch('/api/countries?pageSize=200&isActive=true'),
                    fetch('/api/degrees?isActive=true'),
                ]);

                if (nationalityRes.ok) {
                    const data = await nationalityRes.json();
                    setNationalityCountries(data.countries || []);
                }
                if (countriesRes.ok) {
                    const data = await countriesRes.json();
                    setCountries(data.countries || []);
                }
                if (degreesRes.ok) {
                    const data = await degreesRes.json();
                    setDegrees(Array.isArray(data) ? data : data.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch static data:', error);
            }
        };

        fetchStaticData();
    }, []);

    return (
        <WizardContext.Provider
            value={{
                currentStep,
                formData,
                documents,
                countries,
                nationalityCountries,
                degrees,
                setFormData,
                addDocument,
                removeDocument,
                nextStep,
                previousStep,
                goToStep,
                resetWizard,
            }}
        >
            {children}
        </WizardContext.Provider>
    );
};
