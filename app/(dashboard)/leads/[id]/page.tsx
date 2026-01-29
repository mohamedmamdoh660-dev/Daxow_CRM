'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    User,
    Building,
    FileText,
    Upload,
    Download,
    Trash2,
    GraduationCap,
    Building2,
    CheckCircle2,
    Circle,
    XCircle,
    Clock,
    Edit,
    UserPlus,
    Eye,
} from 'lucide-react';
import { notFound, useRouter } from 'next/navigation';
import { SendEmailDialog } from '@/components/leads/send-email-dialog';
import { DocumentViewer } from '@/components/leads/document-viewer';
import { EmailViewer } from '@/components/leads/email-viewer';
import { AddTaskDialog } from '@/components/leads/add-task-dialog';
import { UploadDocumentDialog } from '@/components/leads/upload-document-dialog';
import { TaskViewDialog } from '@/components/leads/task-view-dialog';

const mockLeadStatuses = [
    { value: 'New', label: 'New', color: '#6366f1' },
    { value: 'Contacted', label: 'Contacted', color: '#8b5cf6' },
    { value: 'Qualified', label: 'Qualified', color: '#3b82f6' },
    { value: 'Converted', label: 'Converted', color: '#10b981' },
    { value: 'Lost', label: 'Lost', color: '#ef4444' },
];

const mockUsers = [
    { id: '1', name: 'Admin User', email: 'admin@crm.com' },
    { id: '2', name: 'Sales Agent 1', email: 'agent1@crm.com' },
    { id: '3', name: 'Sales Agent 2', email: 'agent2@crm.com' },
];

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = React.use(params);
    const router = useRouter();
    const [lead, setLead] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog states
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
    const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
    const [selectedDocIndex, setSelectedDocIndex] = useState(0);
    const [isEmailViewerOpen, setIsEmailViewerOpen] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState<any>(null);
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [isTaskViewOpen, setIsTaskViewOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isConverting, setIsConverting] = useState(false);

    // Form states
    const [assignedTo, setAssignedTo] = useState('');
    const [tasks, setTasks] = useState<any[]>([]);

    const fetchLead = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/leads/${unwrappedParams.id}`);
            if (res.status === 404) {
                notFound();
            }
            if (!res.ok) throw new Error('Failed to fetch lead');
            const data = await res.json();
            setLead(data);
            setAssignedTo(data.assignedTo || '');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await fetch(`/api/tasks?entityType=Lead&entityId=${unwrappedParams.id}`);
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        }
    };

    useEffect(() => {
        fetchLead();
        fetchTasks();
    }, [unwrappedParams.id]);

    const handleConvert = async () => {
        if (!lead) return;

        const targetType = lead.type === 'Student' ? 'Student' : 'Agent';
        const confirmMsg = `Convert this ${lead.type} lead to a ${targetType}?\n\nThis will create a new ${targetType.toLowerCase()} record with the information from this lead.`;

        if (!confirm(confirmMsg)) return;

        setIsConverting(true);

        try {
            const res = await fetch(`/api/leads/${lead.id}/convert`, {
                method: 'POST',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to convert lead');
            }

            // Success! Redirect to student edit page to complete missing information
            if (data.student) {
                alert(`Lead successfully converted to ${data.student.studentId}!\n\nRedirecting to complete student information...`);
                router.push(`/students/${data.student.id}/edit`);
            }
        } catch (error: any) {
            alert(`Error converting lead: ${error.message}`);
        } finally {
            setIsConverting(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-8">
                <p className="text-center text-muted-foreground">Loading lead...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-8">
                <p className="text-center text-red-600">Error: {error}</p>
            </div>
        );
    }

    if (!lead) {
        notFound();
    }

    const isStudentLead = lead.type === 'Student';
    const statusConfig = mockLeadStatuses.find(s => s.value === lead.status);

    return (
        <div className="container py-8">
            {/* Header */}
            <div className="mb-6">
                <Link href="/leads">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Leads
                    </Button>
                </Link>
            </div>

            {/* Lead Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        {isStudentLead ? (
                            <User className="h-8 w-8 text-primary" />
                        ) : (
                            <Building className="h-8 w-8 text-primary" />
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold">
                                    {isStudentLead ? lead.fullName : lead.companyName}
                                </h1>
                                {lead.leadId && (
                                    <Badge variant="outline">{lead.leadId}</Badge>
                                )}
                            </div>
                            {!isStudentLead && lead.contactPerson && (
                                <p className="text-muted-foreground">Contact: {lead.contactPerson}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge>{lead.type} Lead</Badge>
                        <Badge
                            style={{ backgroundColor: statusConfig?.color || '#gray' }}
                            className="text-white"
                        >
                            {lead.status}
                        </Badge>
                        {lead.source && <Badge variant="secondary">{lead.source}</Badge>}
                    </div>

                    {/* Assigned To Selector */}
                    <div className="mt-3 flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm text-muted-foreground">Assigned to:</Label>
                        <Select value={assignedTo} onValueChange={(value) => {
                            setAssignedTo(value);
                            // TODO: Save to backend
                            console.log('Assigned to:', value);
                        }}>
                            <SelectTrigger className="w-[200px] h-8">
                                <SelectValue placeholder="Unassigned" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockUsers.map(user => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEmailDialogOpen(true)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            const phoneNumber = lead.phone;
                            if (phoneNumber) {
                                window.location.href = `tel:${phoneNumber}`;
                            } else {
                                alert('No phone number available for this lead');
                            }
                        }}
                        disabled={!lead.phone}
                    >
                        <Phone className="mr-2 h-4 w-4" />
                        Call
                    </Button>
                    <Link href={`/leads/${lead.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                    <Button onClick={handleConvert}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Convert to {isStudentLead ? 'Student' : 'Agent'}
                    </Button>
                </div>
            </div>

            {/* Send Email Dialog */}
            <SendEmailDialog
                open={isEmailDialogOpen}
                onClose={() => setIsEmailDialogOpen(false)}
                leadData={lead}
            />

            {/* Document Viewer */}
            {lead.leadDocuments && lead.leadDocuments.length > 0 && (
                <DocumentViewer
                    open={isDocViewerOpen}
                    onOpenChange={setIsDocViewerOpen}
                    documents={lead.leadDocuments}
                    initialDocIndex={selectedDocIndex}
                />
            )}

            {/* Email Viewer */}
            {selectedEmail && (
                <EmailViewer
                    open={isEmailViewerOpen}
                    onOpenChange={setIsEmailViewerOpen}
                    email={selectedEmail}
                />
            )}

            {/* Add Task Dialog */}
            <AddTaskDialog
                open={isTaskDialogOpen}
                onOpenChange={setIsTaskDialogOpen}
                entityType="Lead"
                entityId={lead.id}
                entityName={isStudentLead ? lead.fullName : lead.companyName}
                onTaskAdded={(task) => {
                    fetchTasks(); // Refresh tasks from backend
                }}
            />

            {/* Task View Dialog */}
            <TaskViewDialog
                open={isTaskViewOpen}
                onOpenChange={setIsTaskViewOpen}
                task={selectedTask}
                onTaskUpdated={fetchTasks}
                onTaskDeleted={fetchTasks}
            />

            {/* Upload Document Dialog */}
            <UploadDocumentDialog
                open={isUploadDialogOpen}
                onClose={() => setIsUploadDialogOpen(false)}
                leadId={lead.id}
                onUploadSuccess={() => {
                    fetchLead(); // Refresh lead data to show new document
                    setIsUploadDialogOpen(false);
                }}
            />

            {/* Main Content */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="interested">Interested</TabsTrigger>
                    <TabsTrigger value="documents">
                        Documents {lead.leadDocuments?.length > 0 && `(${lead.leadDocuments.length})`}
                    </TabsTrigger>
                    <TabsTrigger value="emails">Emails</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
                    <TabsTrigger value="timeline">
                        Timeline {lead.timeline?.length > 0 && `(${lead.timeline.length})`}
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {lead.email && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <p className="font-medium">{lead.email}</p>
                                        </div>
                                    </div>
                                )}
                                {lead.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone</p>
                                            <p className="font-medium">{lead.phone}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Location</p>
                                        <p className="font-medium">
                                            {isStudentLead ? lead.country : `${lead.city || ''}, ${lead.country || ''}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Created</p>
                                        <p className="font-medium">
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{isStudentLead ? 'Preferences' : 'Business Details'}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {isStudentLead ? (
                                    <>
                                        {lead.preferredIntake && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Preferred Intake</p>
                                                <p className="font-medium">{lead.preferredIntake}</p>
                                            </div>
                                        )}
                                        {lead.budgetRange && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Budget Range</p>
                                                <p className="font-medium">{lead.budgetRange}</p>
                                            </div>
                                        )}
                                        {lead.preferredCountries && lead.preferredCountries.length > 0 && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Preferred Countries</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {lead.preferredCountries.map((country: string) => (
                                                        <Badge key={country} variant="outline">{country}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {lead.estimatedStudents && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Estimated Students/Year</p>
                                                <p className="font-medium">{lead.estimatedStudents}</p>
                                            </div>
                                        )}
                                        {lead.proposedCommission && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Proposed Commission</p>
                                                <p className="font-medium">{lead.proposedCommission.toString()}%</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Notes Section - Interactive */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Notes & Updates</CardTitle>
                                <Badge variant="secondary">1 note</Badge>
                            </div>
                            <CardDescription>Add notes and track updates for this lead</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Add New Note */}
                            <div className="space-y-2">
                                <Label htmlFor="new-note">Add New Note</Label>
                                <Textarea
                                    id="new-note"
                                    placeholder="Write your note here..."
                                    rows={3}
                                    className="resize-none"
                                />
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            const textarea = document.getElementById('new-note') as HTMLTextAreaElement;
                                            if (textarea && textarea.value.trim()) {
                                                alert(`Note saved: ${textarea.value}`);
                                                textarea.value = '';
                                            }
                                        }}
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Save Note
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            {/* Notes History */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm">Previous Notes</h4>
                                {lead.notes && (
                                    <div className="p-3 bg-muted/50 rounded-lg border">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">System</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(lead.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{lead.notes}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Interested Tab */}
                <TabsContent value="interested" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Interested Universities & Programs</CardTitle>
                                    <CardDescription>Programs the lead is interested in</CardDescription>
                                </div>
                                <Button size="sm">
                                    <GraduationCap className="mr-2 h-4 w-4" />
                                    Add Program
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground mb-4">No programs added yet</p>
                                <Button>Add First Program</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">Documents</h3>
                            <p className="text-sm text-muted-foreground">
                                Upload and manage lead documents
                            </p>
                        </div>
                        <Button onClick={() => setIsUploadDialogOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Document
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {lead.leadDocuments && lead.leadDocuments.length > 0 ? (
                            lead.leadDocuments.map((doc: any) => (
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
                                                    {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(2)} KB` : 'Unknown'}
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
                            <div className="col-span-3 text-center py-12 border-2 border-dashed rounded-lg">
                                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
                                <Button onClick={() => setIsUploadDialogOpen(true)}>
                                    Upload First Document
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Emails Tab */}
                <TabsContent value="emails" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Email History</CardTitle>
                                    <CardDescription>All emails sent to this lead</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => setIsEmailDialogOpen(true)}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send New Email
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground mb-4">No emails sent yet</p>
                                <Button onClick={() => setIsEmailDialogOpen(true)}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send First Email
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tasks Tab */}
                <TabsContent value="tasks" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Tasks</CardTitle>
                                    <CardDescription>Manage tasks and follow-ups for this lead</CardDescription>
                                </div>
                                <Button onClick={() => setIsTaskDialogOpen(true)}>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Add Task
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {tasks.length > 0 ? (
                                <div className="space-y-3">
                                    {tasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                            onClick={() => {
                                                setSelectedTask(task);
                                                setIsTaskViewOpen(true);
                                            }}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-semibold capitalize">
                                                        {task.title || task.metadata?.taskType || 'Untitled Task'}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {task.description || task.metadata?.notes || ''}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {task.dueDate
                                                            ? new Date(task.dueDate).toLocaleString()
                                                            : `${task.metadata?.scheduledDate || ''} ${task.metadata?.scheduledTime || ''}`
                                                        }
                                                    </div>
                                                </div>
                                                <Badge>{task.status}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground mb-4">No tasks yet</p>
                                    <Button onClick={() => setIsTaskDialogOpen(true)}>
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Create First Task
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Timeline</CardTitle>
                            <CardDescription>Track all interactions and changes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {lead.timeline && lead.timeline.length > 0 ? (
                                <div className="space-y-4">
                                    {lead.timeline.map((event: any, index: number) => (
                                        <div key={event.id} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                                {index < lead.timeline.length - 1 && (
                                                    <div className="w-px flex-1 bg-border mt-2" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="flex items-start justify-between mb-1">
                                                    <p className="font-medium">{event.eventType}</p>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{new Date(event.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{event.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No timeline events yet
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
