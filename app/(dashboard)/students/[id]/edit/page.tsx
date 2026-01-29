'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Loader2, Save, User, FileText, Upload, Trash2, Eye } from 'lucide-react';
import { formSchema, FormValues } from '@/components/students/registration-wizard-context';
import { toast } from 'sonner';
import Link from 'next/link';
import { FileUpload } from '@/components/ui/file-upload';

const RequiredStar = () => <span className="text-destructive">*</span>;

export default function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [studentId, setStudentId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            transferStudent: 'no',
            haveTc: 'no',
            blueCard: 'no',
        },
    });

    const watchHaveTc = form.watch('haveTc');

    // Auto-clear dependent education fields
    useEffect(() => {
        const levelId = form.watch('educationLevelId');

        if (levelId !== 'master' && levelId !== 'phd') {
            form.setValue('bachelorSchoolName', '');
            form.setValue('bachelorCountry', '');
            form.setValue('bachelorGpa', '');
        }

        if (levelId !== 'phd') {
            form.setValue('masterSchoolName', '');
            form.setValue('masterCountry', '');
            form.setValue('masterGpa', '');
        }
    }, [form.watch('educationLevelId'), form]);

    // Fetch student data
    useEffect(() => {
        async function fetchData() {
            try {
                const { id } = await params;
                setStudentId(id);

                const response = await fetch(`/api/students/${id}`);
                if (!response.ok) throw new Error('Failed to fetch student');

                const student = await response.json();

                // Set form values
                form.reset({
                    transferStudent: student.transferStudent ? 'yes' : 'no',
                    haveTc: student.haveTc ? 'yes' : 'no',
                    tcNumber: student.tcNumber || '',
                    blueCard: student.blueCard ? 'yes' : 'no',
                    firstName: student.firstName || '',
                    lastName: student.lastName || '',
                    gender: student.gender || 'Male',
                    dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : new Date(),
                    nationality: student.nationality || '',
                    passportNumber: student.passportNumber || '',
                    passportIssueDate: student.passportIssueDate ? new Date(student.passportIssueDate) : new Date(),
                    passportExpiryDate: student.passportExpiryDate ? new Date(student.passportExpiryDate) : new Date(),
                    email: student.email || '',
                    mobile: student.mobile || '',
                    addressLine1: student.addressLine1 || '',
                    cityDistrict: student.cityDistrict || '',
                    stateProvince: student.stateProvince || '',
                    postalCode: student.postalCode || '',
                    addressCountry: student.addressCountry || '',
                    fatherName: student.fatherName || '',
                    fatherMobile: student.fatherMobile || '',
                    fatherOccupation: student.fatherOccupation || '',
                    motherName: student.motherName || '',
                    motherMobile: student.motherMobile || '',
                    motherOccupation: student.motherOccupation || '',
                    educationLevelId: student.educationLevelId || '',
                    educationLevelName: student.educationLevelName || '',
                    highSchoolCountry: student.highSchoolCountry || '',
                    highSchoolName: student.highSchoolName || '',
                    highSchoolGpa: student.highSchoolGpa?.toString() || '',
                    bachelorCountry: student.bachelorCountry || '',
                    bachelorSchoolName: student.bachelorSchoolName || '',
                    bachelorGpa: student.bachelorGpa?.toString() || '',
                    masterCountry: student.masterCountry || '',
                    masterSchoolName: student.masterSchoolName || '',
                    masterGpa: student.masterGpa?.toString() || '',
                });

                // Set documents
                setDocuments(student.studentDocuments || []);

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching student:', error);
                toast.error('Failed to load student data');
                setIsLoading(false);
            }
        }

        fetchData();
    }, [params, form]);

    const onSubmit = async (data: FormValues) => {
        try {
            setIsSubmitting(true);

            const response = await fetch(`/api/students/${studentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    transferStudent: data.transferStudent === 'yes',
                    haveTc: data.haveTc === 'yes',
                    blueCard: data.blueCard === 'yes',
                    fullName: `${data.firstName} ${data.lastName}`,
                }),
            });

            if (!response.ok) throw new Error('Failed to update student');

            toast.success('Student updated successfully');
            router.push(`/students/${studentId}`);
        } catch (error) {
            console.error('Error updating student:', error);
            toast.error('Failed to update student');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle document upload
    const handleDocumentUpload = async (file: File, docType: string) => {
        setUploadingDoc(docType);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', docType);
            formData.append('studentId', studentId);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();

            // Create document in database
            const docResponse = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId,
                    fileName: file.name,
                    fileType: docType,
                    fileUrl: data.fileUrl,
                    fileSize: file.size,
                }),
            });

            if (!docResponse.ok) throw new Error('Failed to save document');

            const newDoc = await docResponse.json();
            setDocuments([...documents, newDoc]);

            // If this is a personal photo, update student photoUrl
            if (docType === 'personal_photo') {
                try {
                    const updateResponse = await fetch(`/api/students/${studentId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            photoUrl: data.fileUrl,
                        }),
                    });

                    if (updateResponse.ok) {
                        toast.success('Personal photo uploaded and profile updated!');
                        // Redirect to detail page to show the new photo
                        setTimeout(() => {
                            router.push(`/students/${studentId}`);
                        }, 1000); // Wait 1 second to show toast
                    } else {
                        toast.success('Document uploaded successfully');
                    }
                } catch (updateError) {
                    console.error('Error updating photoUrl:', updateError);
                    toast.success('Document uploaded successfully');
                }
            } else {
                toast.success('Document uploaded successfully');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload document');
        } finally {
            setUploadingDoc(null);
        }
    };

    // Handle document delete
    const handleDocumentDelete = async (docId: string) => {
        try {
            const response = await fetch(`/api/documents/${docId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Delete failed');

            setDocuments(documents.filter(d => d.id !== docId));
            toast.success('Document deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete document');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <Link href={`/students/${studentId}`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Student Details
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-bold">Edit Student</h1>
                <p className="text-muted-foreground">Update student information</p>
            </div>

            {/* Form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Section 1: Student Category */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                <CardTitle>Student Category</CardTitle>
                            </div>
                            <CardDescription>Student type and classification</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Transfer Student */}
                            <FormField
                                control={form.control}
                                name="transferStudent"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Transfer Student <RequiredStar /></FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex gap-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id="transfer-yes" />
                                                    <Label htmlFor="transfer-yes">Yes</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="no" id="transfer-no" />
                                                    <Label htmlFor="transfer-no">No</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Have TC */}
                            <FormField
                                control={form.control}
                                name="haveTc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Have T.C. (Turkish Citizenship)</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex gap-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id="tc-yes" />
                                                    <Label htmlFor="tc-yes">Yes</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="no" id="tc-no" />
                                                    <Label htmlFor="tc-no">No</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* TC Number (Conditional) */}
                            {watchHaveTc === 'yes' && (
                                <FormField
                                    control={form.control}
                                    name="tcNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>T.C. Number <RequiredStar /></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter T.C. number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Blue Card */}
                            <FormField
                                control={form.control}
                                name="blueCard"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Blue Card <RequiredStar /></FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex gap-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id="blue-yes" />
                                                    <Label htmlFor="blue-yes">Yes</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="no" id="blue-no" />
                                                    <Label htmlFor="blue-no">No</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Section 2: Personal Details */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                <CardTitle>Personal Details</CardTitle>
                            </div>
                            <CardDescription>Basic personal information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                {/* First Name */}
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name <RequiredStar /></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter first name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Last Name */}
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name <RequiredStar /></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter last name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Gender */}
                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gender <RequiredStar /></FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex gap-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Male" id="gender-male" />
                                                    <Label htmlFor="gender-male">Male</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Female" id="gender-female" />
                                                    <Label htmlFor="gender-female">Female</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Other" id="gender-other" />
                                                    <Label htmlFor="gender-other">Other</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Date of Birth - Using simple input since DatePicker is complex */}
                            <FormField
                                control={form.control}
                                name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date of Birth <RequiredStar /></FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                {/* Nationality */}
                                <FormField
                                    control={form.control}
                                    name="nationality"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nationality <RequiredStar /></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter nationality" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Passport Number */}
                                <FormField
                                    control={form.control}
                                    name="passportNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Passport Number <RequiredStar /></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter passport number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Passport Issue Date */}
                                <FormField
                                    control={form.control}
                                    name="passportIssueDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Passport Issue Date <RequiredStar /></FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Passport Expiry Date */}
                                <FormField
                                    control={form.control}
                                    name="passportExpiryDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Passport Expiry Date <RequiredStar /></FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 3: Contact & Address Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact & Address</CardTitle>
                            <CardDescription>Contact details and address information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Email */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email <RequiredStar /></FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="student@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Mobile */}
                                <FormField
                                    control={form.control}
                                    name="mobile"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mobile <RequiredStar /></FormLabel>
                                            <FormControl>
                                                <Input placeholder="+90 555 123 4567" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Address Line 1 */}
                            <FormField
                                control={form.control}
                                name="addressLine1"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address Line 1</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Street address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                {/* City/District */}
                                <FormField
                                    control={form.control}
                                    name="cityDistrict"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City/District</FormLabel>
                                            <FormControl>
                                                <Input placeholder="City or district" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* State/Province */}
                                <FormField
                                    control={form.control}
                                    name="stateProvince"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State/Province</FormLabel>
                                            <FormControl>
                                                <Input placeholder="State or province" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Postal Code */}
                                <FormField
                                    control={form.control}
                                    name="postalCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Postal Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Postal code" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Country */}
                                <FormField
                                    control={form.control}
                                    name="addressCountry"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Country" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 4: Family Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Family Information</CardTitle>
                            <CardDescription>Parent/Guardian details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="font-medium">Father's Information</h4>
                                <FormField
                                    control={form.control}
                                    name="fatherName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Father's Name <RequiredStar /></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter father's name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="fatherMobile"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Father's Mobile</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+90 555 123 4567" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="fatherOccupation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Father's Occupation</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Occupation" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-medium">Mother's Information</h4>
                                <FormField
                                    control={form.control}
                                    name="motherName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mother's Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter mother's name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="motherMobile"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mother's Mobile</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+90 555 123 4567" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="motherOccupation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mother's Occupation</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Occupation" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 5: Academic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Academic Information</CardTitle>
                            <CardDescription>Educational background and qualifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="educationLevelId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Education Level</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                const prettyName = value.charAt(0).toUpperCase() + value.slice(1);
                                                form.setValue('educationLevelName', prettyName);
                                            }}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select education level" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="high_school">High School</SelectItem>
                                                <SelectItem value="bachelor">Bachelor</SelectItem>
                                                <SelectItem value="master">Master</SelectItem>
                                                <SelectItem value="phd">PhD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* High School */}
                            <div className="space-y-4">
                                <h4 className="font-medium">High School</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="highSchoolCountry"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Country" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="highSchoolName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>School Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="School name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="highSchoolGpa"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>GPA</FormLabel>
                                            <FormControl>
                                                <Input placeholder="GPA" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Bachelor */}
                            {(form.watch('educationLevelId') === 'master' || form.watch('educationLevelId') === 'phd') && (
                                <div className="space-y-4">
                                    <h4 className="font-medium">Bachelor's Degree (if applicable)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="bachelorCountry"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Country</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Country" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="bachelorSchoolName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>University Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="University name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="bachelorGpa"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>GPA</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="GPA" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Master */}
                            {form.watch('educationLevelId') === 'phd' && (
                                <div className="space-y-4">
                                    <h4 className="font-medium">Master's Degree (if applicable)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="masterCountry"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Country</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Country" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="masterSchoolName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>University Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="University name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="masterGpa"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>GPA</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="GPA" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section 6: Documents */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                <CardTitle>Documents</CardTitle>
                            </div>
                            <CardDescription>Upload and manage student documents</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Document Types */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Photo */}
                                <div>
                                    <FileUpload
                                        label="Personal Photo"
                                        required={true}
                                        accept="image/*"
                                        currentFile={documents.find(d => d.fileType === 'personal_photo') ? {
                                            fileName: documents.find(d => d.fileType === 'personal_photo')?.fileName || '',
                                            fileUrl: documents.find(d => d.fileType === 'personal_photo')?.fileUrl || '',
                                        } : undefined}
                                        onFileSelect={(file) => handleDocumentUpload(file, 'personal_photo')}
                                        onFileRemove={() => {
                                            const doc = documents.find(d => d.fileType === 'personal_photo');
                                            if (doc) handleDocumentDelete(doc.id);
                                        }}
                                        disabled={uploadingDoc === 'personal_photo'}
                                    />
                                    {uploadingDoc === 'personal_photo' && (
                                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Uploading...
                                        </p>
                                    )}
                                </div>

                                {/* Passport Copy */}
                                <div>
                                    <FileUpload
                                        label="Passport Copy"
                                        required={true}
                                        accept="image/*,application/pdf"
                                        currentFile={documents.find(d => d.fileType === 'passport_copy') ? {
                                            fileName: documents.find(d => d.fileType === 'passport_copy')?.fileName || '',
                                            fileUrl: documents.find(d => d.fileType === 'passport_copy')?.fileUrl || '',
                                        } : undefined}
                                        onFileSelect={(file) => handleDocumentUpload(file, 'passport_copy')}
                                        onFileRemove={() => {
                                            const doc = documents.find(d => d.fileType === 'passport_copy');
                                            if (doc) handleDocumentDelete(doc.id);
                                        }}
                                        disabled={uploadingDoc === 'passport_copy'}
                                    />
                                    {uploadingDoc === 'passport_copy' && (
                                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Uploading...
                                        </p>
                                    )}
                                </div>

                                {/* High School Certificate */}
                                <div>
                                    <FileUpload
                                        label="High School Certificate"
                                        required={false}
                                        accept="image/*,application/pdf"
                                        currentFile={documents.find(d => d.fileType === 'high_school_certificate') ? {
                                            fileName: documents.find(d => d.fileType === 'high_school_certificate')?.fileName || '',
                                            fileUrl: documents.find(d => d.fileType === 'high_school_certificate')?.fileUrl || '',
                                        } : undefined}
                                        onFileSelect={(file) => handleDocumentUpload(file, 'high_school_certificate')}
                                        onFileRemove={() => {
                                            const doc = documents.find(d => d.fileType === 'high_school_certificate');
                                            if (doc) handleDocumentDelete(doc.id);
                                        }}
                                        disabled={uploadingDoc === 'high_school_certificate'}
                                    />
                                    {uploadingDoc === 'high_school_certificate' && (
                                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Uploading...
                                        </p>
                                    )}
                                </div>

                                {/* High School Transcript */}
                                <div>
                                    <FileUpload
                                        label="High School Transcript"
                                        required={false}
                                        accept="image/*,application/pdf"
                                        currentFile={documents.find(d => d.fileType === 'high_school_transcript') ? {
                                            fileName: documents.find(d => d.fileType === 'high_school_transcript')?.fileName || '',
                                            fileUrl: documents.find(d => d.fileType === 'high_school_transcript')?.fileUrl || '',
                                        } : undefined}
                                        onFileSelect={(file) => handleDocumentUpload(file, 'high_school_transcript')}
                                        onFileRemove={() => {
                                            const doc = documents.find(d => d.fileType === 'high_school_transcript');
                                            if (doc) handleDocumentDelete(doc.id);
                                        }}
                                        disabled={uploadingDoc === 'high_school_transcript'}
                                    />
                                    {uploadingDoc === 'high_school_transcript' && (
                                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Uploading...
                                        </p>
                                    )}
                                </div>

                                {/* Other Documents */}
                                <div>
                                    <FileUpload
                                        label="Other Documents"
                                        required={false}
                                        accept="image/*,application/pdf"
                                        currentFile={documents.find(d => d.fileType === 'other') ? {
                                            fileName: documents.find(d => d.fileType === 'other')?.fileName || '',
                                            fileUrl: documents.find(d => d.fileType === 'other')?.fileUrl || '',
                                        } : undefined}
                                        onFileSelect={(file) => handleDocumentUpload(file, 'other')}
                                        onFileRemove={() => {
                                            const doc = documents.find(d => d.fileType === 'other');
                                            if (doc) handleDocumentDelete(doc.id);
                                        }}
                                        disabled={uploadingDoc === 'other'}
                                    />
                                    {uploadingDoc === 'other' && (
                                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Uploading...
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* All Documents List */}
                            {documents.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-medium mb-3">All Documents ({documents.length})</h4>
                                    <div className="grid gap-3">
                                        {documents.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                    <div>
                                                        <p className="text-sm font-medium">{doc.fileName}</p>
                                                        <p className="text-xs text-muted-foreground">{doc.fileType}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                                            <Eye className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDocumentDelete(doc.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                        <Link href={`/students/${studentId}`}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
