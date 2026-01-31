'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { mockLeadSources } from '@/lib/mock-data'; // Removed - Mock data deleted
import { ArrowLeft, User, Building, Upload } from 'lucide-react';
import Link from 'next/link';

// Lead sources array (moved from mock-data)
const leadSources = [
    'Website', 'Facebook', 'Instagram', 'LinkedIn', 'Google Ads',
    'Referral', 'Email Campaign', 'Walk-in', 'Phone Call', 'Other'
];

export function NewLeadForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const typeParam = searchParams?.get('type');

    const [leadType, setLeadType] = useState<'Student' | 'Agent'>(
        typeParam === 'agent' ? 'Agent' : 'Student'
    );

    const [formData, setFormData] = useState({
        // Common fields
        source: '',
        notes: '',

        // Student fields
        fullName: '',
        email: '',
        phone: '',
        country: '',
        preferredIntake: '',
        preferredCountries: '',
        budgetRange: '',

        // Agent fields
        companyName: '',
        contactPerson: '',
        agentEmail: '',
        agentPhone: '',
        city: '',
        agentCountry: '',
        estimatedStudents: '',
        proposedCommission: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [leadDocuments, setLeadDocuments] = useState<Array<{ id: string, file: File, name: string }>>([]);

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).map(file => ({
                id: Math.random().toString(36).substring(7),
                file,
                name: file.name
            }));
            setLeadDocuments(prev => [...prev, ...newFiles]);
        }
    };

    // Remove file
    const removeFile = (id: string) => {
        setLeadDocuments(prev => prev.filter(doc => doc.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Upload documents first
            const uploadedDocs = await Promise.all(leadDocuments.map(async (doc) => {
                const formData = new FormData();
                formData.append('file', doc.file);
                // formData.append('bucketName', 'lead-documents'); // Removed: Backend uses unified crm-uploads
                formData.append('folder', 'leads'); // Specify folder organization
                formData.append('documentType', 'lead_document');

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) throw new Error(`Failed to upload ${doc.name}`);

                const data = await res.json();
                return {
                    fileName: doc.name,
                    fileUrl: data.fileUrl,
                    fileSize: doc.file.size,
                    fileType: doc.file.type
                };
            }));

            // 2. Create Lead with documents
            const leadData = {
                type: leadType,
                source: formData.source,
                notes: formData.notes,
                documents: uploadedDocs, // Send uploaded docs
                ...(leadType === 'Student' ? {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    country: formData.country,
                    preferredIntake: formData.preferredIntake,
                    preferredCountries: formData.preferredCountries.split(',').map(c => c.trim()).filter(Boolean),
                    budgetRange: formData.budgetRange,
                } : {
                    companyName: formData.companyName,
                    contactPerson: formData.contactPerson,
                    email: formData.agentEmail,
                    phone: formData.agentPhone,
                    city: formData.city,
                    country: formData.agentCountry,
                    estimatedStudents: formData.estimatedStudents ? parseInt(formData.estimatedStudents) : undefined,
                    proposedCommission: formData.proposedCommission ? parseFloat(formData.proposedCommission) : undefined,
                }),
            };

            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(leadData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create lead');
            }

            const data = await response.json();
            alert(`Lead created successfully! Lead ID: ${data.lead.leadId}`);
            router.push('/leads');
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container py-8 max-w-3xl">
            <div className="mb-6">
                <Link href="/leads">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Leads
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Lead</CardTitle>
                    <CardDescription>Capture potential student or agent information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Lead Type Selector */}
                        <div className="space-y-3">
                            <Label>Lead Type *</Label>
                            <RadioGroup
                                value={leadType}
                                onValueChange={(value) => setLeadType(value as 'Student' | 'Agent')}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div>
                                    <RadioGroupItem
                                        value="Student"
                                        id="student"
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor="student"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                    >
                                        <User className="mb-3 h-8 w-8" />
                                        <div className="text-center">
                                            <div className="font-semibold">Student Lead</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Potential student inquiry
                                            </div>
                                        </div>
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem
                                        value="Agent"
                                        id="agent"
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor="agent"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                    >
                                        <Building className="mb-3 h-8 w-8" />
                                        <div className="text-center">
                                            <div className="font-semibold">Agent Lead</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Potential partner agency
                                            </div>
                                        </div>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="border-t pt-6">
                            {/* Common Fields */}
                            <div className="grid grid-cols-1 gap-4 mb-4">
                                <div>
                                    <Label htmlFor="source">Lead Source *</Label>
                                    <Select
                                        value={formData.source}
                                        onValueChange={(value) => setFormData({ ...formData, source: value })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select source" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {leadSources.map(source => (
                                                <SelectItem key={source} value={source}>
                                                    {source}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Student Lead Form */}
                            {leadType === 'Student' && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Student Information</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="fullName">Full Name *</Label>
                                            <Input
                                                id="fullName"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                required
                                                placeholder="Enter full name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+20 123 456 7890"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="country">Country/Nationality</Label>
                                            <Input
                                                id="country"
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                placeholder="Egypt"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="preferredIntake">Preferred Intake</Label>
                                            <Select
                                                value={formData.preferredIntake}
                                                onValueChange={(value) => setFormData({ ...formData, preferredIntake: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select intake" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="September 2024">September 2024</SelectItem>
                                                    <SelectItem value="January 2025">January 2025</SelectItem>
                                                    <SelectItem value="May 2025">May 2025</SelectItem>
                                                    <SelectItem value="September 2025">September 2025</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="budgetRange">Budget Range</Label>
                                            <Select
                                                value={formData.budgetRange}
                                                onValueChange={(value) => setFormData({ ...formData, budgetRange: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select budget" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Under $10,000">Under $10,000</SelectItem>
                                                    <SelectItem value="$10,000 - $20,000">$10,000 - $20,000</SelectItem>
                                                    <SelectItem value="$20,000 - $30,000">$20,000 - $30,000</SelectItem>
                                                    <SelectItem value="$30,000 - $50,000">$30,000 - $50,000</SelectItem>
                                                    <SelectItem value="Above $50,000">Above $50,000</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="preferredCountries">Preferred Study Countries</Label>
                                        <Input
                                            id="preferredCountries"
                                            value={formData.preferredCountries}
                                            onChange={(e) => setFormData({ ...formData, preferredCountries: e.target.value })}
                                            placeholder="UK, Canada, USA..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Agent Lead Form */}
                            {leadType === 'Agent' && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Agency Information</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="companyName">Company Name *</Label>
                                            <Input
                                                id="companyName"
                                                value={formData.companyName}
                                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                required
                                                placeholder="Company name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="contactPerson">Contact Person *</Label>
                                            <Input
                                                id="contactPerson"
                                                value={formData.contactPerson}
                                                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                                required
                                                placeholder="Contact person name"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="agentEmail">Email *</Label>
                                            <Input
                                                id="agentEmail"
                                                type="email"
                                                value={formData.agentEmail}
                                                onChange={(e) => setFormData({ ...formData, agentEmail: e.target.value })}
                                                required
                                                placeholder="email@company.com"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="agentPhone">Phone</Label>
                                            <Input
                                                id="agentPhone"
                                                value={formData.agentPhone}
                                                onChange={(e) => setFormData({ ...formData, agentPhone: e.target.value })}
                                                placeholder="+971 50 123 4567"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                placeholder="Dubai"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="agentCountry">Country</Label>
                                            <Input
                                                id="agentCountry"
                                                value={formData.agentCountry}
                                                onChange={(e) => setFormData({ ...formData, agentCountry: e.target.value })}
                                                placeholder="UAE"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="estimatedStudents">Estimated Students/Year</Label>
                                            <Input
                                                id="estimatedStudents"
                                                type="number"
                                                value={formData.estimatedStudents}
                                                onChange={(e) => setFormData({ ...formData, estimatedStudents: e.target.value })}
                                                placeholder="50"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="proposedCommission">Proposed Commission (%)</Label>
                                            <Input
                                                id="proposedCommission"
                                                type="number"
                                                step="0.5"
                                                value={formData.proposedCommission}
                                                onChange={(e) => setFormData({ ...formData, proposedCommission: e.target.value })}
                                                placeholder="12"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Document Upload - Common for both */}
                            <div className="mt-6 pt-6 border-t">
                                <h3 className="font-semibold text-lg mb-4">Documents (Optional)</h3>
                                <div className="space-y-4">
                                    <div className="border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors">
                                        <div className="text-center">
                                            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                            <div className="text-sm text-muted-foreground mb-4">
                                                Drop files here or click to browse
                                            </div>
                                            <Input
                                                type="file"
                                                multiple
                                                id="file-upload"
                                                className="hidden"
                                                onChange={handleFileSelect}
                                            />
                                            <Label
                                                htmlFor="file-upload"
                                                className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                                            >
                                                Select Files
                                            </Label>
                                            <p className="text-xs text-muted-foreground mt-4">
                                                Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                                            </p>
                                        </div>
                                    </div>

                                    {/* Selected Files List */}
                                    {leadDocuments.length > 0 && (
                                        <div className="space-y-2">
                                            {leadDocuments.map((doc) => (
                                                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="bg-primary/10 p-2 rounded">
                                                            <Upload className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="text-sm font-medium truncate">{doc.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {(doc.file.size / 1024).toFixed(2)} KB
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFile(doc.id)}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes - Common for both */}
                            <div className="mt-4">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Additional notes about this lead..."
                                    rows={4}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" className="flex-1" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Upload className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Lead & Uploading...
                                    </>
                                ) : 'Create Lead'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.push('/leads')} disabled={isSubmitting}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
