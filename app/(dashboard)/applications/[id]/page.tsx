'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
    ArrowLeft,
    DollarSign,
    BookOpen,
    Globe,
    Briefcase,
    CheckCircle2,
    AlertCircle,
    ClipboardList,
    Save,
    Loader2,
    Eye,
    Download,
    Trash2,
    Hash,
    Flag,
    Languages,
    Upload,
    FileIcon,
    XCircle,
    AlertTriangle,
} from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { toast } from 'sonner';
import Link from 'next/link';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { ModuleActionButtons } from '@/components/shared/module-action-buttons';

// Stage configuration with colors and icons
const STAGES = [
    { value: 'Draft', label: 'Draft', color: '#6b7280', bg: '#f3f4f6' },
    { value: 'Submitted', label: 'Submitted', color: '#3b82f6', bg: '#eff6ff' },
    { value: 'Under Review', label: 'Under Review', color: '#f59e0b', bg: '#fffbeb' },
    { value: 'Missing Docs', label: 'Missing Docs', color: '#d97706', bg: '#fffbeb' }, // Amber-600, Amber-50
    { value: 'Conditional Acceptance', label: 'Conditional Acceptance', color: '#8b5cf6', bg: '#f5f3ff' },
    { value: 'Final Acceptance', label: 'Final Acceptance', color: '#10b981', bg: '#ecfdf5' },
    { value: 'Rejected', label: 'Rejected', color: '#ef4444', bg: '#fef2f2' },
    { value: 'Enrolled', label: 'Enrolled', color: '#06b6d4', bg: '#ecfeff' },
    { value: 'Cancelled', label: 'Cancelled', color: '#6b7280', bg: '#f9fafb' },
];

const APP_DOC_TYPES = [
    { value: 'payment_receipt', label: 'Payment Receipt' },
    { value: 'initial_acceptance', label: 'Initial Acceptance' },
    { value: 'final_acceptance', label: 'Final Acceptance' },
    { value: 'other', label: 'Other' },
];

const REQUIRED_STUDENT_DOCS = [
    { value: 'passport', label: 'Passport', aliases: ['passport', 'Passport', 'PASSPORT', 'passport_copy', 'Passport Copy'] },
    { value: 'high_school_transcript', label: 'High School Transcript', aliases: ['high_school_transcript', 'High School Transcript', 'transcript', 'Transcript'] },
    { value: 'photo', label: 'Personal Photo', aliases: ['photo', 'Photo', 'personal_photo', 'Personal Photo'] },
];

function getStageConfig(stage: string) {
    return STAGES.find(s => s.value === stage) || STAGES[0];
}

function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return 'Invalid Date';
    }
}

function formatDateTime(dateStr: string | null | undefined) {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return 'Invalid Date';
    }
}

function formatCurrency(amount: string | number | null | undefined, currency?: string) {
    if (!amount) return 'N/A';
    const num = Number(amount);
    return `${num.toLocaleString()} ${currency || 'USD'}`;
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const { canEdit, canDelete } = usePermissions('Applications');
    const [application, setApplication] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updatingStage, setUpdatingStage] = useState(false);
    const [savingNotes, setSavingNotes] = useState(false);
    const [notes, setNotes] = useState('');
    const [editingNotes, setEditingNotes] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
    const [selectedDocType, setSelectedDocType] = useState<string>('other');

    const fetchApplication = async () => {
        try {
            const res = await fetch(`/api/applications/${id}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setApplication(data);
            setNotes(data.notes || '');
        } catch (error) {
            console.error('Error fetching application:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplication();
    }, [id]);

    const handleStageChange = async (newStage: string) => {
        setUpdatingStage(true);
        try {
            const res = await fetch(`/api/applications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stage: newStage }),
            });
            if (res.ok) {
                const updated = await res.json();
                setApplication(updated);
            }
        } catch (error) {
            console.error('Error updating stage:', error);
        } finally {
            setUpdatingStage(false);
        }
    };

    const handleSaveNotes = async () => {
        setSavingNotes(true);
        try {
            const res = await fetch(`/api/applications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes }),
            });
            if (res.ok) {
                const updated = await res.json();
                setApplication(updated);
                setEditingNotes(false);
                toast.success('Notes saved successfully');
            }
        } catch (error) {
            console.error('Error saving notes:', error);
            toast.error('Failed to save notes');
        } finally {
            setSavingNotes(false);
        }
    };

    const handleDocumentUpload = async (file: File) => {
        if (!application) return;
        setUploadingDoc('true');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', selectedDocType);
            formData.append('applicationId', application.id);
            formData.append('folder', 'applications');

            // 1. Upload file
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) throw new Error('Upload failed');
            const data = await uploadRes.json();

            // 2. Create document record
            const docRes = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    fileType: selectedDocType,
                    fileUrl: data.fileUrl,
                    fileSize: file.size,
                    applicationId: application.id,
                    storagePath: data.storagePath,
                }),
            });

            if (!docRes.ok) throw new Error('Failed to save document record');

            // Refresh application to show new doc
            await fetchApplication();
            toast.success('Document uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload document');
        } finally {
            setUploadingDoc(null);
        }
    };

    const handleDocumentDelete = async (docId: string) => {
        if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
            return;
        }
        try {
            const res = await fetch(`/api/documents/${docId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                await fetchApplication();
                toast.success('Document deleted');
            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete document');
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center min-h-[500px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!application) {
        return (
            <div className="p-8">
                <p className="text-center text-red-600">Application not found</p>
            </div>
        );
    }

    const stageConfig = getStageConfig(application.stage);
    const student = application.student;
    const program = application.program;
    const tuitionOriginal = program?.officialTuition;
    const tuitionDiscounted = program?.discountedTuition;
    const currency = program?.tuitionCurrency || 'USD';

    return (
        <div className="p-8 space-y-6">
            {/* Back Button */}
            <Link href="/applications">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Applications
                </Button>
            </Link>

            {/* ==================== HEADER ==================== */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">
                            {application.applicationName || 'Application'}
                        </h1>
                        <Badge
                            style={{
                                backgroundColor: stageConfig.bg,
                                color: stageConfig.color,
                                borderColor: stageConfig.color,
                            }}
                            variant="outline"
                            className="text-sm font-semibold px-3 py-1"
                        >
                            {application.stage}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">
                        {program?.name || 'Unknown Program'} • {application.academicYear?.name} • {application.semester?.name}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Created: {formatDate(application.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Updated: {formatDate(application.updatedAt)}
                        </span>
                    </div>
                </div>

                {/* Stage Changer + Custom Buttons in header */}
                <div className="flex items-center gap-3 flex-wrap justify-end">
                    <ModuleActionButtons
                        module="Applications"
                        position="header"
                        page="in_record"
                        record={application}
                    />
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Change Stage</label>
                        <Select
                            value={application.stage}
                            onValueChange={handleStageChange}
                            disabled={updatingStage || !canEdit}
                        >
                            <SelectTrigger className="w-[220px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STAGES.map(s => (
                                    <SelectItem key={s.value} value={s.value}>
                                        <span className="flex items-center gap-2">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full inline-block"
                                                style={{ backgroundColor: s.color }}
                                            />
                                            {s.label}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {updatingStage && <Loader2 className="h-4 w-4 animate-spin mt-5" />}
                </div>
            </div>

            {/* ==================== STAGE PROGRESS BAR ==================== */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        {STAGES.slice(0, 5).map((s, i) => {
                            const currentIdx = STAGES.findIndex(st => st.value === application.stage);
                            const isActive = i <= currentIdx && currentIdx < 5;
                            const isCurrent = s.value === application.stage;
                            return (
                                <React.Fragment key={s.value}>
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isCurrent
                                                ? 'ring-2 ring-offset-2'
                                                : ''
                                                }`}
                                            style={{
                                                backgroundColor: isActive ? s.color : '#e5e7eb',
                                                color: isActive ? 'white' : '#9ca3af',
                                                ...(isCurrent ? { ringColor: s.color } : {}),
                                            }}
                                        >
                                            {i + 1}
                                        </div>
                                        <span
                                            className={`text-xs font-medium text-center max-w-[80px] ${isCurrent ? 'font-bold' : 'text-muted-foreground'
                                                }`}
                                            style={isCurrent ? { color: s.color } : {}}
                                        >
                                            {s.label}
                                        </span>
                                    </div>
                                    {i < 4 && (
                                        <div
                                            className="flex-1 h-1 rounded mx-1"
                                            style={{
                                                backgroundColor: i < currentIdx && currentIdx < 5
                                                    ? STAGES[i].color
                                                    : '#e5e7eb',
                                            }}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                    {/* Show special statuses */}
                    {['Rejected', 'Enrolled', 'Cancelled'].includes(application.stage) && (
                        <div className="mt-4 text-center">
                            <Badge
                                style={{ backgroundColor: stageConfig.color, color: 'white' }}
                                className="text-sm px-4 py-1"
                            >
                                {application.stage === 'Enrolled' && '🎓 '}
                                {application.stage === 'Rejected' && '❌ '}
                                {application.stage === 'Cancelled' && '🚫 '}
                                {application.stage}
                            </Badge>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Custom Buttons — details position */}
            <ModuleActionButtons
                module="Applications"
                position="details"
                page="in_record"
                record={application}
            />

            {/* ==================== QUICK STATS ==================== */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Degree</p>
                                <p className="text-lg font-bold">{application.degree?.name || 'N/A'}</p>
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
                                <p className="text-lg font-bold">{application.documents?.length || 0}</p>
                            </div>
                            <FileText className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Tasks</p>
                                <p className="text-lg font-bold">{application.tasks?.length || 0}</p>
                            </div>
                            <ClipboardList className="h-8 w-8 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Tuition</p>
                                <p className="text-lg font-bold">
                                    {tuitionDiscounted
                                        ? formatCurrency(tuitionDiscounted, currency)
                                        : tuitionOriginal
                                            ? formatCurrency(tuitionOriginal, currency)
                                            : 'N/A'}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ==================== TABS ==================== */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="student">Student</TabsTrigger>
                    <TabsTrigger value="student_documents">Student Docs ({application.student?.studentDocuments?.length || 0})</TabsTrigger>
                    <TabsTrigger value="documents">App Docs ({application.documents?.length || 0})</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks ({application.tasks?.length || 0})</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline ({application.timeline?.length || 0})</TabsTrigger>
                </TabsList>

                {/* ========== OVERVIEW TAB ========== */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Program Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Program Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Program Name</p>
                                    <p className="font-medium">{program?.name || 'N/A'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Faculty</p>
                                        <p className="font-medium">{program?.faculty?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Specialty</p>
                                        <p className="font-medium">{program?.specialty?.name || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Degree</p>
                                        <p className="font-medium">{program?.degree?.name || application.degree?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Language</p>
                                        <p className="font-medium flex items-center gap-1">
                                            <Languages className="h-3.5 w-3.5" />
                                            {program?.languageRel?.name || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                {program?.studyYears && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Study Duration</p>
                                        <p className="font-medium">{program.studyYears} years</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tuition & Financial */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Tuition & Financial
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Official Tuition</p>
                                    <p className="font-medium text-lg">
                                        {formatCurrency(tuitionOriginal, currency)}
                                    </p>
                                </div>
                                {tuitionDiscounted && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Discounted Tuition</p>
                                        <p className="font-medium text-lg text-green-700">
                                            {formatCurrency(tuitionDiscounted, currency)}
                                        </p>
                                    </div>
                                )}
                                {tuitionOriginal && tuitionDiscounted && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-sm text-green-800 font-medium">
                                            💰 Savings: {formatCurrency(
                                                Number(tuitionOriginal) - Number(tuitionDiscounted),
                                                currency
                                            )}
                                            {' '}
                                            ({Math.round((1 - Number(tuitionDiscounted) / Number(tuitionOriginal)) * 100)}% off)
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-muted-foreground">Currency</p>
                                    <p className="font-medium">{currency}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Academic Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Academic Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Academic Year</p>
                                        <p className="font-medium">{application.academicYear?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Semester</p>
                                        <p className="font-medium">{application.semester?.name || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Degree</p>
                                    <p className="font-medium">{application.degree?.name || 'N/A'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Application Date</p>
                                        <p className="font-medium">{formatDate(application.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Updated</p>
                                        <p className="font-medium">{formatDate(application.updatedAt)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Agent / Agency */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    Agent / Agency
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {application.agent ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="default">Agent</Badge>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Agent Name</p>
                                            <p className="font-medium">
                                                {application.agent.firstName} {application.agent.lastName}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <p className="font-medium">{application.agent.email}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No agent assigned</p>
                                )}

                                {application.agency && (
                                    <div className="space-y-3 pt-3 border-t">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">Agency</Badge>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Company</p>
                                            <p className="font-medium">{application.agency.companyName}</p>
                                        </div>
                                        {application.agency.contactPerson && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Contact Person</p>
                                                <p className="font-medium">{application.agency.contactPerson}</p>
                                            </div>
                                        )}
                                        {application.agency.email && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="font-medium">{application.agency.email}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!application.agent && !application.agency && (
                                    <div className="text-center py-4">
                                        <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">No agent or agency assigned</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Notes Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Edit className="h-5 w-5" />
                                    Notes
                                </CardTitle>
                                {canEdit && !editingNotes && (
                                    <Button variant="outline" size="sm" onClick={() => setEditingNotes(true)}>
                                        <Edit className="h-3 w-3 mr-1" />
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {editingNotes ? (
                                <div className="space-y-3">
                                    <Textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={5}
                                        placeholder="Add notes about this application..."
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleSaveNotes} disabled={savingNotes}>
                                            {savingNotes ? (
                                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                            ) : (
                                                <Save className="h-3 w-3 mr-1" />
                                            )}
                                            Save
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setNotes(application.notes || '');
                                                setEditingNotes(false);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className={`${application.notes ? '' : 'text-muted-foreground italic'} whitespace-pre-wrap`}>
                                    {application.notes || 'No notes added yet.'}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ========== STUDENT TAB ========== */}
                <TabsContent value="student" className="space-y-6">
                    {student ? (
                        <div className="space-y-6">
                            {/* Student Header */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                                                {student.firstName?.[0] || 'S'}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold">{student.fullName}</h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Mail className="h-3.5 w-3.5" /> {student.email}
                                                </p>
                                                {student.mobile && (
                                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                        <Phone className="h-3.5 w-3.5" /> {student.mobile}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {student.studentId && (
                                                <Badge variant="outline">{student.studentId}</Badge>
                                            )}
                                            <Link href={`/students/${student.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    View Profile
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Personal Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Personal Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
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
                                                <p className="font-medium">{formatDate(student.dateOfBirth)}</p>
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

                                {/* Contact Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Phone className="h-5 w-5" />
                                            Contact & Address
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
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

                                {/* Academic Info */}
                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5" />
                                            Academic Background
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* High School */}
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-sm flex items-center gap-1">
                                                    <BookOpen className="h-3.5 w-3.5" /> High School
                                                </h4>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">School</p>
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
                                            {/* Bachelor */}
                                            {(student.bachelorSchoolName || student.bachelorGpa) && (
                                                <div className="space-y-2">
                                                    <h4 className="font-semibold text-sm flex items-center gap-1">
                                                        <GraduationCap className="h-3.5 w-3.5" /> Bachelor
                                                    </h4>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">School</p>
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
                                            )}
                                            {/* Master */}
                                            {(student.masterSchoolName || student.masterGpa) && (
                                                <div className="space-y-2">
                                                    <h4 className="font-semibold text-sm flex items-center gap-1">
                                                        <GraduationCap className="h-3.5 w-3.5" /> Master
                                                    </h4>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">School</p>
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
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">Student information not available</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* ========== STUDENT DOCUMENTS TAB (New) ========== */}
                <TabsContent value="student_documents" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold">Student Documents</h3>
                            <p className="text-sm text-muted-foreground">
                                Documents from the student's profile
                            </p>
                        </div>
                        <Link href={`/students/${student?.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="h-4 w-4 mr-2" />
                                Manage Student Docs
                            </Button>
                        </Link>
                    </div>

                    {/* Missing Documents Alert - ONLY show if stage is Missing Docs */}
                    {application.stage === 'Missing Docs' && (
                        <Card className="border-amber-200 bg-amber-50">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-amber-900">Document Status (Action Required)</h4>
                                        <div className="mt-2 space-y-1">
                                            {REQUIRED_STUDENT_DOCS.map(reqDoc => {
                                                const hasDoc = student?.studentDocuments?.some((d: any) =>
                                                    reqDoc.aliases.some(alias => d.fileType?.toLowerCase() === alias.toLowerCase()) ||
                                                    // Also check matching file names as fallback
                                                    reqDoc.aliases.some(alias => d.fileName?.toLowerCase().includes(alias.toLowerCase()))
                                                );
                                                return (
                                                    <div key={reqDoc.value} className="flex items-center gap-2 text-sm">
                                                        {hasDoc ? (
                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                        )}
                                                        <span className={hasDoc ? 'text-green-800' : 'text-red-700 font-medium'}>
                                                            {reqDoc.label}: {hasDoc ? 'Uploaded' : 'Missing'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {student?.studentDocuments && student.studentDocuments.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Uploaded files</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>File Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Size</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {student.studentDocuments.map((doc: any) => (
                                            <TableRow key={doc.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {doc.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                            <FileIcon className="h-4 w-4 text-blue-500" />
                                                        ) : (
                                                            <FileText className="h-4 w-4 text-purple-500" />
                                                        )}
                                                        <span className="truncate max-w-[200px] sm:max-w-[300px]" title={doc.fileName}>
                                                            {doc.fileName}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell><Badge variant="outline">{doc.fileType}</Badge></TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                            </a>
                                                        </Button>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <a href={doc.fileUrl} download>
                                                                <Download className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="text-center py-12 bg-muted/20 rounded-lg">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No student documents found</p>
                        </div>
                    )}
                </TabsContent>

                {/* ========== APPLICATION DOCUMENTS TAB ========== */}
                <TabsContent value="documents" className="space-y-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div>
                            <h3 className="text-lg font-semibold">Application Documents</h3>
                            <p className="text-sm text-muted-foreground">
                                Upload application-specific documents like receipts and acceptance letters
                            </p>
                        </div>

                        {/* Upload Area - only for editors */}
                        {canEdit && (
                            <Card className="w-full md:w-[400px]">
                                <CardContent className="pt-6 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Document Type</label>
                                        <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {APP_DOC_TYPES.map(t => (
                                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <FileUpload
                                        label="Upload Document"
                                        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        onFileSelect={handleDocumentUpload}
                                        disabled={uploadingDoc !== null}
                                    />
                                    {uploadingDoc && (
                                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Uploading...
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {APP_DOC_TYPES.map(type => {
                            const docsOfType = application.documents?.filter((d: any) => d.fileType === type.value) || [];

                            // Use "other" category for everything else if "other" is selected, or just strict match
                            // Actually let's just show sections for defined types, and one for 'other'
                            if (type.value === 'other') {
                                // Filter 'other' plus any unknown types
                                const otherDocs = application.documents?.filter((d: any) =>
                                    d.fileType === 'other' || !APP_DOC_TYPES.some(t => t.value === d.fileType)
                                ) || [];
                                if (otherDocs.length === 0) return null;
                                return (
                                    <div key={type.value} className="md:col-span-3 space-y-4">
                                        <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                                            <FileIcon className="h-4 w-4" /> Other Documents
                                        </h4>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            {otherDocs.map((doc: any) => (
                                                <DocumentCard key={doc.id} doc={doc} onDelete={() => handleDocumentDelete(doc.id)} canDelete={canDelete} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            if (docsOfType.length === 0) {
                                return (
                                    <Card key={type.value} className="border-dashed bg-muted/20">
                                        <CardContent className="flex flex-col items-center justify-center py-8 text-center h-full">
                                            <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                            <p className="font-medium text-muted-foreground">{type.label}</p>
                                            <p className="text-xs text-muted-foreground/70">Not uploaded</p>
                                        </CardContent>
                                    </Card>
                                );
                            }

                            return (
                                <Card key={type.value} className="md:col-span-1 border-blue-100 bg-blue-50/50">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-blue-900">{type.label}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {docsOfType.map((doc: any) => (
                                            <DocumentCard key={doc.id} doc={doc} onDelete={() => handleDocumentDelete(doc.id)} canDelete={canDelete} />
                                        ))}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* ========== TASKS TAB ========== */}
                <TabsContent value="tasks" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold">Tasks</h3>
                            <p className="text-sm text-muted-foreground">
                                Tasks related to this application
                            </p>
                        </div>
                    </div>

                    {application.tasks && application.tasks.length > 0 ? (
                        <div className="space-y-3">
                            {application.tasks.map((task: any) => {
                                const priorityColors: Record<string, string> = {
                                    High: '#ef4444',
                                    Medium: '#f59e0b',
                                    Low: '#10b981',
                                };
                                const statusIcons: Record<string, React.ReactNode> = {
                                    Open: <AlertCircle className="h-4 w-4 text-blue-500" />,
                                    'In Progress': <Clock className="h-4 w-4 text-amber-500" />,
                                    Completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
                                };
                                return (
                                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    {statusIcons[task.status] || <ClipboardList className="h-4 w-4 text-gray-400" />}
                                                    <div className="flex-1">
                                                        <h4 className={`font-medium ${task.status === 'Completed' ? 'line-through text-muted-foreground' : ''}`}>
                                                            {task.title}
                                                        </h4>
                                                        {task.description && (
                                                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                                        )}
                                                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                            {task.dueDate && (
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    Due: {formatDate(task.dueDate)}
                                                                </span>
                                                            )}
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                Created: {formatDate(task.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        style={{
                                                            backgroundColor: priorityColors[task.priority] || '#6b7280',
                                                            color: 'white',
                                                        }}
                                                    >
                                                        {task.priority}
                                                    </Badge>
                                                    <Badge variant="outline">{task.status}</Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No tasks created yet</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* ========== TIMELINE TAB ========== */}
                <TabsContent value="timeline" className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold">Activity Timeline</h3>
                        <p className="text-sm text-muted-foreground">
                            Complete history of events for this application
                        </p>
                    </div>

                    {application.timeline && application.timeline.length > 0 ? (
                        <div className="space-y-4">
                            {application.timeline.map((event: any, index: number) => (
                                <div key={event.id} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5"></div>
                                        {index !== application.timeline.length - 1 && (
                                            <div className="w-0.5 h-full bg-border mt-1"></div>
                                        )}
                                    </div>
                                    <Card className="flex-1 mb-2">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">{event.title || event.eventType}</p>
                                                        <Badge variant="outline" className="text-xs">
                                                            {event.eventType}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {event.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatDateTime(event.createdAt)}
                                                        </span>
                                                        {event.performedBy && (
                                                            <span className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {event.performedBy}
                                                            </span>
                                                        )}
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
            </Tabs>
        </div>
    );
}

function DocumentCard({ doc, onDelete, canDelete }: { doc: any, onDelete: () => void, canDelete?: boolean }) {
    return (
        <Card className="hover:shadow-md transition-shadow bg-white">
            <CardContent className="p-3">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 bg-muted rounded flex items-center justify-center">
                        {doc.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img src={doc.fileUrl} className="h-full w-full object-cover rounded" alt="Thumbnail" />
                        ) : (
                            <FileText className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" title={doc.fileName}>{doc.fileName}</p>
                        {doc.fileSize ? (
                            <p className="text-xs text-muted-foreground">{(doc.fileSize / 1024).toFixed(0)} KB</p>
                        ) : null}
                    </div>
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4" />
                            </a>
                        </Button>
                        {canDelete && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={onDelete}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
