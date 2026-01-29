'use client';

import { WizardProvider, useWizard } from '@/components/students/registration-wizard-context';
import { StepIndicator } from '@/components/students/step-indicator';
import { StudentInformationStep } from '@/components/students/student-information-step';
import { DocumentUploadStep } from '@/components/students/document-upload-step';
import { RegistrationSummary } from '@/components/students/registration-summary';
import { RegistrationConfirmation } from '@/components/students/registration-confirmation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { AnimatePresence, motion } from 'framer-motion';

const WizardContent = () => {
    const { currentStep, goToStep } = useWizard();

    return (
        <div className="container max-w-6xl py-8 min-h-screen bg-transparent">
            <div className="mb-6 flex items-center justify-between">
                <Link href="/students">
                    <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Students
                    </Button>
                </Link>
            </div>

            <div className="mb-10 text-center space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Student Registration
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Complete the new student enrollment process in a few simple steps
                </p>
            </div>

            <StepIndicator currentStep={currentStep} onStepClick={goToStep} />

            <div className="mt-10 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        {currentStep === 1 && <StudentInformationStep />}
                        {currentStep === 2 && <DocumentUploadStep />}
                        {currentStep === 3 && <RegistrationSummary />}
                        {currentStep === 4 && <RegistrationConfirmation />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default function NewStudentPage() {
    return (
        <WizardProvider>
            <WizardContent />
        </WizardProvider>
    );
}
