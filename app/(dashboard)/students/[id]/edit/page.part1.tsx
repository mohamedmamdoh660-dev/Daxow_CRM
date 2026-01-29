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
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, User, IdCard, Phone, GraduationCap, ArrowLeft, Loader2, Save } from 'lucide-react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { formSchema, FormValues } from '@/components/students/registration-wizard-context';
import { toast } from 'sonner';
import Link from 'next/link';

const RequiredStar = () => <span className="text-destructive">*</span>;

export default function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [studentId, setStudentId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nationalityCountries, setNationalityCountries] = useState<Array<{ id: string; name: string; code: string }>>([]);
    const [allCountries, setAllCountries] = useState<Array<{ id: string; name: string; code: string }>>([]);
    const [degrees, setDegrees] = useState<Array<{ id: string; name: string }>>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    const watchHaveTc = form.watch('haveTc');
    const watchEducationLevel = form.watch('educationLevelName');

    // Unwrap params
    useEffect(() => {
        params.then(p => setStudentId(p.id));
    }, [params]);

    // Fetch student data and populate form
    useEffect(() => {
        if (!studentId) return;

        async function fetchData() {
            try {
                const [studentRes, nationalityCountriesRes, allCountriesRes, degreesRes] = await Promise.all([
                    fetch(`/api/students/${studentId}`),
                    fetch('/api/countries?pageSize=200&activeOnNationalities=true'),
                    fetch('/api/countries?pageSize=200'),
                    fetch('/api/degrees'),
                ]);

                if (nationalityCountriesRes.ok) {
                    const data = await nationalityCountriesRes.json();
                    setNationalityCountries(data.countries || []);
                }

                if (allCountriesRes.ok) {
                    const data = await allCountriesRes.json();
                    setAllCountries(data.countries || []);
                }

                if (degreesRes.ok) {
                    const data = await degreesRes.json();
                    setDegrees(data.degrees || []);
                }

                if (studentRes.ok) {
                    const { student } = await studentRes.json();

                    // Populate form with ALL student data
                    form.reset({
                        transferStudent: student.transferStudent ? 'yes' : 'no',
                        haveTc: student.haveTc ? 'yes' : 'no',
                        tcNumber: student.tcNumber || '',
                        blueCard: student.blueCard ? 'yes' : 'no',
                        firstName: student.firstName || '',
                        lastName: student.lastName || '',
                        gender: student.gender || 'Male',
                        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : undefined,
                        nationality: student.nationality || '',
                        passportNumber: student.passportNumber || '',
                        passportIssueDate: student.passportIssueDate ? new Date(student.passportIssueDate) : undefined,
                        passportExpiryDate: student.passportExpiryDate ? new Date(student.passportExpiryDate) : undefined,
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
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load student data');
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [studentId, form]);

    // Auto-clear dependent education fields
    useEffect(() => {
        const levelName = watchEducationLevel?.toLowerCase();

        if (levelName !== 'master' && levelName !== 'phd') {
            form.setValue('bachelorSchoolName', '');
            form.setValue('bachelorCountry', '');
            form.setValue('bachelorGpa', '');
        }

        if (levelName !== 'phd') {
            form.setValue('masterSchoolName', '');
            form.setValue('masterCountry', '');
            form.setValue('masterGpa', '');
        }
    }, [watchEducationLevel, form]);

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);

        try {
            const studentData = {
                ...values,
                fullName: `${values.firstName} ${values.lastName}`,
                transferStudent: values.transferStudent === 'yes',
                haveTc: values.haveTc === 'yes',
                blueCard: values.blueCard === 'yes',
                dateOfBirth: values.dateOfBirth?.toISOString(),
                passportIssueDate: values.passportIssueDate?.toISOString(),
                passportExpiryDate: values.passportExpiryDate?.toISOString(),
            };

            const response = await fetch(`/api/students/${studentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || 'Failed to update student');
                return;
            }

            toast.success('Student updated successfully!');
            router.push(`/students/${studentId}`);
        } catch (error) {
            console.error('Error updating student:', error);
            toast.error('Failed to update student. Please try again.');
        } finally {
            setIsSubmitting(false);
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
        <div className="container max-w-6xl py-8">
            <div className="mb-6">
                <Link href={`/students/${studentId}`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Student
                    </Button>
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Edit Student Information</h1>
                <p className="text-muted-foreground">
                    Update the student's information below
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
