'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, User, IdCard, Phone, GraduationCap, ArrowRight } from 'lucide-react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { useWizard, formSchema, FormValues } from './registration-wizard-context';
import { toast } from 'sonner';

const RequiredStar = () => <span className="text-destructive">*</span>;

export const StudentInformationStep = () => {
    const { formData, setFormData, nextStep, countries: allCountries, nationalityCountries } = useWizard();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: formData as FormValues,
    });

    const watchHaveTc = form.watch('haveTc');
    const watchEducationLevel = form.watch('educationLevelName');

    // Auto-clear dependent education fields
    useEffect(() => {
        // Values are now 'high_school', 'bachelor', 'master', 'phd'
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

    const onSubmit = async (values: FormValues) => {
        setFormData(values);
        toast.success('Student information saved');
        nextStep();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Section 1: Student Information */}
                <Card className="border-t-4 border-t-primary shadow-lg overflow-hidden transition-all hover:shadow-xl">
                    <CardHeader className="bg-muted/30 pb-6 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Student Category</CardTitle>
                                <CardDescription>Basic classification questions</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                            <FormField
                                control={form.control}
                                name="haveTc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Have Turkish T.C.?</FormLabel>
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

                            <FormField
                                control={form.control}
                                name="blueCard"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Have Blue Card? <RequiredStar /></FormLabel>
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
                        </div>

                        {watchHaveTc === 'yes' && (
                            <FormField
                                control={form.control}
                                name="tcNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>T.C. Number <RequiredStar /></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter T.C. number" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Section 2: Personal Details */}
                <Card className="border-t-4 border-t-blue-500 shadow-lg overflow-hidden transition-all hover:shadow-xl">
                    <CardHeader className="bg-muted/30 pb-6 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                                <IdCard className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Personal Details</CardTitle>
                                <CardDescription>Core student identity information</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name <RequiredStar /></FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-9" placeholder="Ahmed" {...field} value={field.value || ''} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name <RequiredStar /></FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-9" placeholder="Mohamed" {...field} value={field.value || ''} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gender <RequiredStar /></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date of Birth <RequiredStar /></FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'pl-3 text-left font-normal',
                                                            !field.value && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, 'PPP')
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date('1900-01-01')
                                                    }
                                                    captionLayout="dropdown"
                                                    fromYear={1900}
                                                    toYear={new Date().getFullYear()}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="nationality"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nationality <RequiredStar /></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select country" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {nationalityCountries.map((country) => (
                                                    <SelectItem key={country.id} value={country.id}>
                                                        {country.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="passportNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Passport Number <RequiredStar /></FormLabel>
                                        <FormControl>
                                            <Input placeholder="P123456789" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="passportIssueDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Passport Issue Date <RequiredStar /></FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'pl-3 text-left font-normal',
                                                            !field.value && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, 'PPP')
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date > new Date()}
                                                    captionLayout="dropdown"
                                                    fromYear={1950}
                                                    toYear={new Date().getFullYear()}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="passportExpiryDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Passport Expiry Date <RequiredStar /></FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'pl-3 text-left font-normal',
                                                            !field.value && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, 'PPP')
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date() || date > new Date('2090-12-31')
                                                    }
                                                    captionLayout="dropdown"
                                                    fromYear={new Date().getFullYear()}
                                                    toYear={2090}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Section 3: Contact & Address Information */}
                <Card className="border-t-4 border-t-emerald-500 shadow-lg overflow-hidden transition-all hover:shadow-xl">
                    <CardHeader className="bg-muted/30 pb-6 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Contact & Address</CardTitle>
                                <CardDescription>Communication details and location</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Contact Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">Contact</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email <RequiredStar /></FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="ahmed@example.com" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="mobile"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mobile <RequiredStar /></FormLabel>
                                            <FormControl>
                                                <PhoneInput
                                                    defaultCountry="eg"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">Address</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="addressLine1"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address Line 1</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Street address" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="cityDistrict"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City/District</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Cairo" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="stateProvince"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>State/Province</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Cairo Governorate" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="postalCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Postal Code</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="12345" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="addressCountry"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select country" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {allCountries.map((country) => (
                                                            <SelectItem key={country.id} value={country.id}>
                                                                {country.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Family Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">Family Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="fatherName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Father Name <RequiredStar /></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Mohamed Ali" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="fatherMobile"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Father Mobile</FormLabel>
                                            <FormControl>
                                                <PhoneInput
                                                    defaultCountry="eg"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                />
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
                                            <FormLabel>Father Occupation</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Engineer" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="motherName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mother Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Fatima Ahmed" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="motherMobile"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mother Mobile</FormLabel>
                                            <FormControl>
                                                <PhoneInput
                                                    defaultCountry="eg"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                />
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
                                            <FormLabel>Mother Occupation</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Teacher" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 4: Academic Information */}
                <Card className="border-t-4 border-t-purple-500 shadow-lg overflow-hidden transition-all hover:shadow-xl">
                    <CardHeader className="bg-muted/30 pb-6 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Academic History</CardTitle>
                                <CardDescription>Education background and qualifications</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="educationLevelId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Education Level</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                // Map static values to friendly names if needed, or just use values
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
                        </div>

                        {/* High School Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">High School Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="highSchoolCountry"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>High School Country</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select country" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {allCountries.map((country) => (
                                                        <SelectItem key={country.id} value={country.id}>
                                                            {country.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="highSchoolName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>High School Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Cairo International School" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="highSchoolGpa"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>High School GPA</FormLabel>
                                            <FormControl>
                                                <Input placeholder="3.5" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Bachelor Information */}
                        {(watchEducationLevel?.toLowerCase() === 'master' || watchEducationLevel?.toLowerCase() === 'phd' || form.watch('educationLevelId') === 'master' || form.watch('educationLevelId') === 'phd') && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold">Bachelor Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="bachelorCountry"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bachelor Country</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select country" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {allCountries.map((country) => (
                                                            <SelectItem key={country.id} value={country.id}>
                                                                {country.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="bachelorSchoolName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bachelor School Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Cairo University" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="bachelorGpa"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bachelor GPA</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="3.5" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Master Information */}
                        {(watchEducationLevel?.toLowerCase() === 'phd' || form.watch('educationLevelId') === 'phd') && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold">Master Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="masterCountry"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Master Country</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select country" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {allCountries.map((country) => (
                                                            <SelectItem key={country.id} value={country.id}>
                                                                {country.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="masterSchoolName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Master School Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Cairo University" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="masterGpa"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Master GPA</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="3.8" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Navigation Button */}
                <div className="flex justify-end">
                    <Button type="submit">
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </form>
        </Form>
    );
};
