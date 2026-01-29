'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWizard } from './registration-wizard-context';
import { ArrowLeft, ArrowRight, Edit, FileText, User, MapPin, Users, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

export const RegistrationSummary: React.FC = () => {
    const { formData, documents, nextStep, previousStep, goToStep } = useWizard();

    const InfoRow = ({ label, value }: { label: string; value?: string | null }) => {
        if (!value) return null;
        return (
            <div className="grid grid-cols-3 gap-4 py-2">
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                <span className="text-sm col-span-2">{value}</span>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            <CardTitle>Personal Information</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => goToStep(1)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-1">
                    <InfoRow label="First Name" value={formData.firstName} />
                    <InfoRow label="Last Name" value={formData.lastName} />
                    <InfoRow label="Gender" value={formData.gender} />
                    <InfoRow
                        label="Date of Birth"
                        value={formData.dateOfBirth ? format(formData.dateOfBirth, 'PPP') : undefined}
                    />
                    <InfoRow label="Nationality" value={formData.nationality} />
                    <Separator className="my-4" />
                    <InfoRow label="Passport Number" value={formData.passportNumber} />
                    <InfoRow
                        label="Issue Date"
                        value={formData.passportIssueDate ? format(formData.passportIssueDate, 'PPP') : undefined}
                    />
                    <InfoRow
                        label="Expiry Date"
                        value={formData.passportExpiryDate ? format(formData.passportExpiryDate, 'PPP') : undefined}
                    />
                    <Separator className="my-4" />
                    <InfoRow label="Transfer Student" value={formData.transferStudent === 'yes' ? 'Yes' : 'No'} />
                    <InfoRow label="Have T.C." value={formData.haveTc === 'yes' ? 'Yes' : 'No'} />
                    {formData.haveTc === 'yes' && <InfoRow label="T.C. Number" value={formData.tcNumber} />}
                    <InfoRow label="Blue Card" value={formData.blueCard === 'yes' ? 'Yes' : 'No'} />
                </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            <CardTitle>Contact Information</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => goToStep(1)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-1">
                    <InfoRow label="Email" value={formData.email} />
                    <InfoRow label="Mobile" value={formData.mobile} />
                    <Separator className="my-4" />
                    <InfoRow label="Address" value={formData.addressLine1} />
                    <InfoRow label="City/District" value={formData.cityDistrict} />
                    <InfoRow label="State/Province" value={formData.stateProvince} />
                    <InfoRow label="Postal Code" value={formData.postalCode} />
                    <InfoRow label="Country" value={formData.addressCountry} />
                </CardContent>
            </Card>

            {/* Family Information */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            <CardTitle>Family Information</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => goToStep(1)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-1">
                    <InfoRow label="Father Name" value={formData.fatherName} />
                    <InfoRow label="Father Mobile" value={formData.fatherMobile} />
                    <InfoRow label="Father Occupation" value={formData.fatherOccupation} />
                    <Separator className="my-4" />
                    <InfoRow label="Mother Name" value={formData.motherName} />
                    <InfoRow label="Mother Mobile" value={formData.motherMobile} />
                    <InfoRow label="Mother Occupation" value={formData.motherOccupation} />
                </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            <CardTitle>Academic Information</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => goToStep(1)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-1">
                    <InfoRow label="Education Level" value={formData.educationLevelName} />
                    <Separator className="my-4" />
                    <InfoRow label="High School Country" value={formData.highSchoolCountry} />
                    <InfoRow label="High School Name" value={formData.highSchoolName} />
                    <InfoRow label="High School GPA" value={formData.highSchoolGpa} />

                    {formData.bachelorSchoolName && (
                        <>
                            <Separator className="my-4" />
                            <InfoRow label="Bachelor Country" value={formData.bachelorCountry} />
                            <InfoRow label="Bachelor School" value={formData.bachelorSchoolName} />
                            <InfoRow label="Bachelor GPA" value={formData.bachelorGpa} />
                        </>
                    )}

                    {formData.masterSchoolName && (
                        <>
                            <Separator className="my-4" />
                            <InfoRow label="Master Country" value={formData.masterCountry} />
                            <InfoRow label="Master School" value={formData.masterSchoolName} />
                            <InfoRow label="Master GPA" value={formData.masterGpa} />
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Uploaded Documents */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            <CardTitle>Uploaded Documents</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => goToStep(2)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                    <CardDescription>
                        {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {documents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No documents uploaded</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {documents.map((doc) => (
                                <div key={doc.id} className="border rounded-lg p-3 space-y-2">
                                    {doc.fileUrl && doc.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                        <img
                                            src={doc.fileUrl}
                                            alt={doc.fileName}
                                            className="w-full h-32 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-full h-32 flex items-center justify-center bg-muted rounded">
                                            <FileText className="w-12 h-12 text-muted-foreground" />
                                        </div>
                                    )}
                                    <p className="text-xs font-medium truncate">{doc.fileName}</p>
                                    <p className="text-xs text-muted-foreground capitalize">
                                        {doc.type.replace(/_/g, ' ')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={previousStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                </Button>
                <Button type="button" onClick={nextStep}>
                    Confirm & Submit
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
