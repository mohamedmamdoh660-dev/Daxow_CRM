'use client';

import React from 'react';
import { Check, User, Upload, FileText, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StepIndicatorProps {
    currentStep: number;
    onStepClick?: (step: number) => void;
}

const steps = [
    { number: 1, title: 'Information', description: 'Personal details', icon: User },
    { number: 2, title: 'Documents', description: 'Upload files', icon: Upload },
    { number: 3, title: 'Review', description: 'Verify data', icon: FileText },
    { number: 4, title: 'Complete', description: 'Success', icon: CheckCircle },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
    return (
        <div className="w-full py-8 px-4">
            <div className="relative flex items-center justify-between max-w-5xl mx-auto z-0">
                {/* Background Line */}
                <div className="absolute top-[26px] left-0 w-full h-1 bg-muted rounded-full -z-10" />

                {/* Progress Line */}
                <motion.div
                    className="absolute top-[26px] left-0 h-1 bg-primary rounded-full -z-10 origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{
                        scaleX: (currentStep - 1) / (steps.length - 1)
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{ width: '100%' }}
                />

                {steps.map((step) => {
                    const isCompleted = currentStep > step.number;
                    const isCurrent = currentStep === step.number;
                    const isClickable = isCompleted && onStepClick;
                    const Icon = step.icon;

                    return (
                        <div key={step.number} className="flex flex-col items-center">
                            <motion.button
                                onClick={() => isClickable && onStepClick(step.number)}
                                disabled={!isClickable}
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.1 : 1,
                                    borderColor: isCurrent || isCompleted ? 'var(--primary)' : 'var(--muted)',
                                    backgroundColor: isCompleted || isCurrent ? 'var(--background)' : 'var(--background)',
                                }}
                                className={cn(
                                    'relative flex items-center justify-center w-14 h-14 rounded-full border-4 transition-colors duration-300 bg-background z-10',
                                    isClickable ? 'cursor-pointer hover:border-primary/80' : 'cursor-default'
                                )}
                            >
                                {/* Pulse Effect for Current Step */}
                                {isCurrent && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-primary/20"
                                        initial={{ scale: 1 }}
                                        animate={{ scale: 1.5, opacity: 0 }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                )}

                                {/* Inner Circle Fill */}
                                <motion.div
                                    className={cn(
                                        "absolute inset-0 rounded-full flex items-center justify-center",
                                        isCompleted ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground",
                                        isCurrent && "text-primary"
                                    )}
                                    initial={false}
                                    animate={{
                                        backgroundColor: isCompleted ? 'var(--primary)' : 'var(--background)',
                                    }}
                                >
                                    {isCompleted ? (
                                        <Check className="w-6 h-6" />
                                    ) : (
                                        <Icon className="w-6 h-6" />
                                    )}
                                </motion.div>
                            </motion.button>

                            <div className="mt-3 text-center">
                                <span
                                    className={cn(
                                        'block text-sm font-bold transition-colors duration-300',
                                        isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                    )}
                                >
                                    {step.title}
                                </span>
                                <span className="hidden sm:block text-xs text-muted-foreground mt-0.5 font-medium">
                                    {step.description}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
