'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { useWizard, UploadedDocument } from './registration-wizard-context';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentType {
    id: string;
    label: string;
    required: boolean;
    accept: string;
}

const documentTypes: DocumentType[] = [
    { id: 'personal_photo', label: 'Personal Photo', required: true, accept: 'image/*' },
    { id: 'passport_copy', label: 'Passport Copy', required: true, accept: 'image/*,application/pdf' },
    { id: 'high_school_certificate', label: 'High School Certificate', required: false, accept: 'image/*,application/pdf' },
    { id: 'high_school_transcript', label: 'High School Transcript', required: false, accept: 'image/*,application/pdf' },
    { id: 'bachelor_degree', label: 'Bachelor Degree', required: false, accept: 'image/*,application/pdf' },
    { id: 'bachelor_transcript', label: 'Bachelor Transcript', required: false, accept: 'image/*,application/pdf' },
    { id: 'master_degree', label: 'Master Degree', required: false, accept: 'image/*,application/pdf' },
    { id: 'master_transcript', label: 'Master Transcript', required: false, accept: 'image/*,application/pdf' },
    { id: 'english_test', label: 'English Language Test (IELTS/TOEFL)', required: false, accept: 'image/*,application/pdf' },
    { id: 'other', label: 'Other Documents', required: false, accept: 'image/*,application/pdf' },
];

export const DocumentUploadStep: React.FC = () => {
    const { documents, addDocument, removeDocument, nextStep, previousStep, formData } = useWizard();
    const [uploading, setUploading] = useState<string | null>(null);

    const handleFileSelect = async (file: File, documentType: string) => {
        setUploading(documentType);

        try {
            // Create a local preview URL
            const previewUrl = URL.createObjectURL(file);

            // Add document to wizard state with the raw file
            const newDocument: UploadedDocument = {
                id: Date.now().toString(),
                type: documentType,
                fileName: file.name,
                fileUrl: previewUrl,
                fileSize: file.size,
                uploadedAt: new Date(),
                file: file, // Store raw file for later upload
            };

            addDocument(newDocument);
            toast.success(`${file.name} attached`);
        } catch (error) {
            console.error('File selection error:', error);
            toast.error('Failed to select file. Please try again.');
        } finally {
            setUploading(null);
        }
    };

    const handleFileRemove = (documentType: string) => {
        const doc = documents.find(d => d.type === documentType);
        if (doc) {
            removeDocument(doc.id);
            toast.success('File removed');
        }
    };

    const handleNext = () => {
        // Validate required documents
        const hasPersonalPhoto = documents.some(d => d.type === 'personal_photo');
        const hasPassport = documents.some(d => d.type === 'passport_copy');

        if (!hasPersonalPhoto || !hasPassport) {
            toast.error('Please upload all required documents (Personal Photo and Passport Copy)');
            return;
        }

        nextStep();
    };

    const getDocumentForType = (typeId: string) => {
        return documents.find(d => d.type === typeId);
    };

    // Filter document types based on education level
    const educationLevel = formData.educationLevelName?.toLowerCase();
    const filteredDocumentTypes = documentTypes.filter(doc => {
        if (doc.id === 'bachelor_degree' || doc.id === 'bachelor_transcript') {
            return educationLevel === 'master' || educationLevel === 'phd';
        }
        if (doc.id === 'master_degree' || doc.id === 'master_transcript') {
            return educationLevel === 'phd';
        }
        return true;
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Documents</CardTitle>
                    <CardDescription>
                        Please upload required documents. All files must be in PDF or image format (max 10MB each).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredDocumentTypes.map((docType) => {
                            const currentDoc = getDocumentForType(docType.id);
                            const isUploading = uploading === docType.id;

                            return (
                                <div key={docType.id}>
                                    <FileUpload
                                        label={docType.label}
                                        required={docType.required}
                                        accept={docType.accept}
                                        currentFile={currentDoc ? {
                                            fileName: currentDoc.fileName,
                                            fileUrl: currentDoc.fileUrl,
                                        } : undefined}
                                        onFileSelect={(file) => handleFileSelect(file, docType.id)}
                                        onFileRemove={() => handleFileRemove(docType.id)}
                                        disabled={isUploading}
                                    />
                                    {isUploading && (
                                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Uploading...
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={previousStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                </Button>
                <Button type="button" onClick={handleNext}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
