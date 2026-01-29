'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWizard } from './registration-wizard-context';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, PartyPopper, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Confetti from 'react-confetti';

export const RegistrationConfirmation: React.FC = () => {
    const { formData, documents, resetWizard } = useWizard();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [studentId, setStudentId] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const hasSubmitted = React.useRef(false);

    useEffect(() => {
        if (!hasSubmitted.current) {
            hasSubmitted.current = true;
            handleSubmit();
        }
    }, []);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmissionStatus('idle');

        try {
            // 1. Upload files first
            const uploadedDocs = await Promise.all(documents.map(async (doc) => {
                // If it already has a remote URL (not a blob) or no raw file, return as is
                if (!doc.file) return {
                    type: doc.type,
                    fileName: doc.fileName,
                    fileUrl: doc.fileUrl,
                    fileSize: doc.fileSize,
                };

                // Upload the file
                const formData = new FormData();
                formData.append('file', doc.file);
                formData.append('documentType', doc.type);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) {
                    throw new Error(`Failed to upload ${doc.fileName}`);
                }

                const uploadData = await uploadRes.json();

                return {
                    type: doc.type,
                    fileName: doc.fileName,
                    fileUrl: uploadData.fileUrl, // Use the real server URL
                    fileSize: doc.fileSize,
                };
            }));

            // 2. Prepare student data with real file URLs
            const studentData = {
                ...formData,
                fullName: `${formData.firstName} ${formData.lastName}`,
                transferStudent: formData.transferStudent === 'yes',
                haveTc: formData.haveTc === 'yes',
                blueCard: formData.blueCard === 'yes',
                dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : undefined,
                passportIssueDate: formData.passportIssueDate ? formData.passportIssueDate.toISOString() : undefined,
                passportExpiryDate: formData.passportExpiryDate ? formData.passportExpiryDate.toISOString() : undefined,
                documents: uploadedDocs,
                photoUrl: uploadedDocs.find(d => d.type === 'personal_photo')?.fileUrl,
            };

            const response = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || 'Failed to create student';

                // Check if it's a duplicate field error
                if (errorMessage.includes('already registered') || errorMessage.includes('Unique constraint')) {
                    setSubmissionStatus('error');
                    toast.error(errorMessage, {
                        duration: 5000,
                        description: 'Please go back and use a different passport number or email'
                    });
                } else {
                    setSubmissionStatus('error');
                    toast.error(errorMessage);
                }
                return;
            }

            setStudentId(data.student.id);
            setSubmissionStatus('success');
            setShowConfetti(true);
            toast.success('Student registered successfully!');

            // Hide confetti after 5 seconds
            setTimeout(() => setShowConfetti(false), 5000);

            // Auto-redirect to student detail page after 2 seconds
            setTimeout(() => {
                router.push(`/students/${data.student.id}`);
            }, 2000);
        } catch (error) {
            console.error('Submission error:', error);
            setSubmissionStatus('error');
            toast.error(error instanceof Error ? error.message : 'Failed to register student');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewStudent = () => {
        if (studentId) {
            router.push(`/students/${studentId}`);
        } else {
            router.push('/students');
        }
    };

    const handleAddAnother = () => {
        resetWizard();
        router.push('/students/new');
    };

    return (
        <div className="space-y-6">
            {showConfetti && (
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    numberOfPieces={500}
                />
            )}

            <Card>
                <CardHeader className="text-center">
                    {isSubmitting && (
                        <>
                            <div className="flex justify-center mb-4">
                                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                            </div>
                            <CardTitle>Submitting Registration...</CardTitle>
                            <CardDescription>Please wait while we create the student record</CardDescription>
                        </>
                    )}

                    {submissionStatus === 'success' && (
                        <>
                            <div className="flex justify-center mb-4">
                                <div className="rounded-full bg-green-100 p-4">
                                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl text-green-600">Registration Successful!</CardTitle>
                            <CardDescription className="text-base">
                                {formData.firstName} {formData.lastName} has been successfully registered in the system.
                            </CardDescription>
                        </>
                    )}

                    {submissionStatus === 'error' && (
                        <>
                            <div className="flex justify-center mb-4">
                                <div className="rounded-full bg-red-100 p-4">
                                    <XCircle className="h-16 w-16 text-red-600" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl text-red-600">Registration Failed</CardTitle>
                            <CardDescription className="text-base">
                                Something went wrong. Please try again or contact support.
                            </CardDescription>
                        </>
                    )}
                </CardHeader>

                <CardContent className="space-y-4">
                    {submissionStatus === 'success' && (
                        <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Student Name</span>
                                <span className="text-sm">{formData.firstName} {formData.lastName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Email</span>
                                <span className="text-sm">{formData.email}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Passport Number</span>
                                <span className="text-sm">{formData.passportNumber}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Documents Uploaded</span>
                                <span className="text-sm">{documents.length} files</span>
                            </div>
                        </div>
                    )}

                    {submissionStatus === 'success' && (
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button onClick={handleViewStudent} className="flex-1">
                                <ArrowRight className="mr-2 h-4 w-4" />
                                View Student Profile
                            </Button>
                            <Button onClick={handleAddAnother} variant="outline" className="flex-1">
                                <PartyPopper className="mr-2 h-4 w-4" />
                                Add Another Student
                            </Button>
                        </div>
                    )}

                    {submissionStatus === 'error' && (
                        <div className="flex flex-col gap-3 pt-4">
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Try Again
                            </Button>
                            <Button onClick={() => router.push('/students')} variant="outline">
                                Back to Students
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
