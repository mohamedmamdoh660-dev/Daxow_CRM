'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    GraduationCap,
    Mail,
    Phone,
    MapPin,
    Calendar,
    FileText,
    Clock,
    Building2,
    User,
    Edit,
    MoreVertical,
    Download,
    Trash2,
    Eye,
    Send,
    CheckCircle2,
    ArrowLeft,
    Plus,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStudent() {
            try {
                const res = await fetch(`/api/students/${id}`);
                const data = await res.json();
                setStudent(data);
            } catch (error) {
                console.error('Error fetching student:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStudent();
    }, [id]);

    if (loading) {
        return (
            <div className="p-8">
                <p className="text-center text-muted-foreground">Loading student...</p>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="p-8">
                <p className="text-center text-red-600">Student not found</p>
            </div>
        );
    }

    // Define student statuses
    const studentStatuses = [
        { label: 'Applicant', color: '#3b82f6' },
        { label: 'Active', color: '#10b981' },
        { label: 'Graduated', color: '#8b5cf6' },
        { label: 'Withdrawn', color: '#ef4444' },
        { label: 'Suspended', color: '#f59e0b' },
    ];
    const statusConfig = studentStatuses.find(s => s.label === student.status);


    return (
        <div className="p-8 space-y-6">
            {/* Back Button */}
            <Link href="/students">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Students
                </Button>
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    {student.photoUrl ? (
                        <img
                            src={student.photoUrl}
                            alt={student.fullName}
                            className="h-16 w-16 rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                            {student.firstName?.[0] || student.fullName?.[0]}
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold">{student.fullName}</h1>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <Mail className="h-4 w-4" />
                            {student.email}
                        </p>
                        {student.mobile && (
                            <p className="text-muted-foreground flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {student.mobile}
                            </p>
                        )}
                        {student.studentId && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>ID: {student.studentId}</span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(student.studentId!);
                                        // Could add toast notification here
                                    }}
                                    className="hover:text-foreground"
                                    title="Copy Student ID"
                                >
                                    📋
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link href={`/students/${student.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                    <Button variant="outline" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Student ID</p>
                                <p className="text-2xl font-bold">{student.id.substring(0, 8).toUpperCase()}</p>
                            </div>
                            <GraduationCap className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Documents</p>
                                <p className="text-2xl font-bold">{student.studentDocuments?.length || 0}</p>
                            </div>
                            <FileText className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge
                                    style={{
                                        backgroundColor: statusConfig?.color || '#6b7280',
                                        color: 'white'
                                    }}
                                    className="mt-2"
                                >
                                    {student.status || 'Active'}
                                </Badge>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="documents">Documents ({student.studentDocuments?.length || 0})</TabsTrigger>
                    <TabsTrigger value="applications">Applications ({student.applications?.length || 0})</TabsTrigger>
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="family">Family</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">First Name</p>
                                        <p className="font-medium">{student.firstName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Name</p>
                                        <p className="font-medium">{student.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Gender</p>
                                        <p className="font-medium">{student.gender || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                                        <p className="font-medium">
                                            {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Nationality</p>
                                        <p className="font-medium">{student.nationality || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Passport Number</p>
                                        <p className="font-medium">{student.passportNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{student.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Mobile</p>
                                    <p className="font-medium">{student.mobile || 'N/A'}</p>
                                </div>
                                {student.addressLine1 && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Address</p>
                                        <p className="font-medium">
                                            {student.addressLine1}
                                            {student.cityDistrict && `, ${student.cityDistrict}`}
                                            {student.stateProvince && `, ${student.stateProvince}`}
                                            {student.postalCode && ` ${student.postalCode}`}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Student Category */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Student Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Transfer Student</span>
                                    <Badge variant={student.transferStudent ? 'default' : 'secondary'}>
                                        {student.transferStudent ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Have T.C.</span>
                                    <Badge variant={student.haveTc ? 'default' : 'secondary'}>
                                        {student.haveTc ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                {student.haveTc && student.tcNumber && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">T.C. Number</p>
                                        <p className="font-medium">{student.tcNumber}</p>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Blue Card</span>
                                    <Badge variant={student.blueCard ? 'default' : 'secondary'}>
                                        {student.blueCard ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Created By */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Created By
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {student.agent ? (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Creator Type</span>
                                            <Badge variant="default">Agent</Badge>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Company Name</p>
                                            <p className="font-medium">{student.agent.companyName}</p>
                                        </div>
                                        {student.agent.contactPerson && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Contact Person</p>
                                                <p className="font-medium">{student.agent.contactPerson}</p>
                                            </div>
                                        )}
                                        {student.agent.email && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="font-medium">{student.agent.email}</p>
                                            </div>
                                        )}
                                        {student.agent.phone && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Phone</p>
                                                <p className="font-medium">{student.agent.phone}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Creator Type</span>
                                            <Badge variant="secondary">Staff</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Created by internal staff</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        {student.studentDocuments && student.studentDocuments.length > 0 ? (
                            student.studentDocuments.map((doc) => (
                                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col items-center text-center space-y-3">
                                            {doc.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                <img
                                                    src={doc.fileUrl}
                                                    alt={doc.fileName}
                                                    className="h-32 w-32 object-cover rounded"
                                                />
                                            ) : (
                                                <FileText className="h-12 w-12 text-blue-600" />
                                            )}
                                            <div className="w-full">
                                                <p className="font-medium truncate">{doc.fileName}</p>
                                                <p className="text-sm text-muted-foreground">{doc.fileType}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(doc.fileSize / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                            <div className="flex gap-2 w-full">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    asChild
                                                >
                                                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        View
                                                    </a>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={doc.fileUrl} download>
                                                        <Download className="h-3 w-3" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-12">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No documents uploaded yet</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Applications Tab */}
                <TabsContent value="applications" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold">Applications</h3>
                            <p className="text-sm text-muted-foreground">
                                Student application history
                            </p>
                        </div>
                        <Link href={`/applications/new?studentId=${student.id}`}>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Application
                            </Button>
                        </Link>
                    </div>

                    {student.applications && student.applications.length > 0 ? (
                        <div className="grid gap-4">
                            {student.applications.map((app: any) => (
                                <Card key={app.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                                    <h4 className="font-semibold">{app.program.name}</h4>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {app.program.university.name}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Applied: {new Date(app.applicationDate).toLocaleDateString()}
                                                    </div>
                                                    {app.priority && (
                                                        <Badge variant={app.priority === 'High' ? 'destructive' : 'secondary'}>
                                                            {app.priority}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge variant="default">
                                                    {app.status}
                                                </Badge>
                                                <Link href={`/applications/${app.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        View Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground mb-4">No applications yet</p>
                                <Link href={`/applications/new?studentId=${student.id}`}>
                                    <Button variant="outline">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create First Application
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline" className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold">Timeline</h3>
                        <p className="text-sm text-muted-foreground">
                            History of all events for this student
                        </p>
                    </div>

                    {student.timeline && student.timeline.length > 0 ? (
                        <div className="space-y-4">
                            {student.timeline.map((event: any, index: number) => (
                                <div key={event.id} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        {index !== student.timeline.length - 1 && (
                                            <div className="w-0.5 h-full bg-border mt-1"></div>
                                        )}
                                    </div>
                                    <Card className="flex-1">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <p className="font-medium">{event.eventType}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {event.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(event.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No timeline events yet</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Academic Tab */}
                <TabsContent value="academic" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Academic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Current Education Level */}
                            <div>
                                <h3 className="text-sm font-semibold mb-3">Current Education Level</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Level</p>
                                        <p className="font-medium">{student.educationLevelName || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* High School */}
                            {(student.highSchoolName || student.highSchoolCountry || student.highSchoolGpa) && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">High School Information</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">School Name</p>
                                            <p className="font-medium">{student.highSchoolName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Country</p>
                                            <p className="font-medium">{student.highSchoolCountry || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">GPA</p>
                                            <p className="font-medium">{student.highSchoolGpa || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bachelor */}
                            {(student.bachelorSchoolName || student.bachelorCountry || student.bachelorGpa) && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">Bachelor Information</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">School Name</p>
                                            <p className="font-medium">{student.bachelorSchoolName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Country</p>
                                            <p className="font-medium">{student.bachelorCountry || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">GPA</p>
                                            <p className="font-medium">{student.bachelorGpa || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Master */}
                            {(student.masterSchoolName || student.masterCountry || student.masterGpa) && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-3">Master Information</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">School Name</p>
                                            <p className="font-medium">{student.masterSchoolName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Country</p>
                                            <p className="font-medium">{student.masterCountry || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">GPA</p>
                                            <p className="font-medium">{student.masterGpa || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Family Tab */}
                <TabsContent value="family" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Family Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Father */}
                            <div>
                                <h3 className="text-sm font-semibold mb-3">Father Information</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{student.fatherName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Mobile</p>
                                        <p className="font-medium">{student.fatherMobile || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Occupation</p>
                                        <p className="font-medium">{student.fatherOccupation || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Mother */}
                            <div>
                                <h3 className="text-sm font-semibold mb-3">Mother Information</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{student.motherName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Mobile</p>
                                        <p className="font-medium">{student.motherMobile || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Occupation</p>
                                        <p className="font-medium">{student.motherOccupation || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
