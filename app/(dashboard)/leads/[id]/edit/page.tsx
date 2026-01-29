'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const leadTypes = ['Student', 'University', 'Agent'];
const leadSources = ['Website', 'Referral', 'Social Media', 'Email', 'Phone', 'Event', 'Other'];
const leadStatuses = ['New', 'Contacted', 'Qualified', 'Negotiation', 'Converted', 'Lost'];

export default function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [leadId, setLeadId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        type: 'Student',
        source: 'Website',
        status: 'New',
        country: '',
        preferredIntake: '',
        preferredCountries: '',
        budgetRange: '',
        notes: '',
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const { id } = await params;
                setLeadId(id);

                const response = await fetch(`/api/leads/${id}`);
                if (!response.ok) throw new Error('Failed to fetch lead');

                const lead = await response.json();

                setFormData({
                    fullName: lead.fullName || '',
                    email: lead.email || '',
                    phone: lead.phone || '',
                    type: lead.type || 'Student',
                    source: lead.source || 'Website',
                    status: lead.status || 'New',
                    country: lead.country || '',
                    preferredIntake: lead.preferredIntake || '',
                    preferredCountries: lead.preferredCountries || '',
                    budgetRange: lead.budgetRange || '',
                    notes: lead.notes || '',
                });

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching lead:', error);
                toast.error('Failed to load lead data');
                setIsLoading(false);
            }
        }

        fetchData();
    }, [params]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);

            const response = await fetch(`/api/leads/${leadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to update lead');

            toast.success('Lead updated successfully');
            router.push(`/leads/${leadId}`);
        } catch (error) {
            console.error('Error updating lead:', error);
            toast.error('Failed to update lead');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
            <div className="mb-6">
                <Link href={`/leads/${leadId}`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Lead Details
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-bold">Edit Lead</h1>
                <p className="text-muted-foreground">Update lead information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Lead contact and classification details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="fullName">Full Name *</Label>
                                <Input
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    value={formData.country}
                                    onChange={(e) => handleChange('country', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="type">Lead Type *</Label>
                                <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leadTypes.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="source">Source *</Label>
                                <Select value={formData.source} onValueChange={(value) => handleChange('source', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leadSources.map(source => (
                                            <SelectItem key={source} value={source}>{source}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="status">Status *</Label>
                                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leadStatuses.map(status => (
                                            <SelectItem key={status} value={status}>{status}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Student-specific Information */}
                {formData.type === 'Student' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Preferences</CardTitle>
                            <CardDescription>Study abroad preferences and requirements</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="preferredIntake">Preferred Intake</Label>
                                    <Input
                                        id="preferredIntake"
                                        value={formData.preferredIntake}
                                        onChange={(e) => handleChange('preferredIntake', e.target.value)}
                                        placeholder="e.g., Fall 2026"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="budgetRange">Budget Range</Label>
                                    <Input
                                        id="budgetRange"
                                        value={formData.budgetRange}
                                        onChange={(e) => handleChange('budgetRange', e.target.value)}
                                        placeholder="e.g., $20,000 - $30,000"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="preferredCountries">Preferred Countries</Label>
                                <Input
                                    id="preferredCountries"
                                    value={formData.preferredCountries}
                                    onChange={(e) => handleChange('preferredCountries', e.target.value)}
                                    placeholder="e.g., USA, Canada, UK"
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Notes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                        <CardDescription>Additional information and comments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            rows={5}
                            placeholder="Add any additional notes about this lead..."
                        />
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                    <Link href={`/leads/${leadId}`}>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
