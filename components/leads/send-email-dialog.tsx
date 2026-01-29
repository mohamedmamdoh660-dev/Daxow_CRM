'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, X } from 'lucide-react';

// Mock email templates
const mockEmailTemplates = [
    {
        id: '1',
        name: 'Welcome Email',
        subject: 'Welcome to {{companyName}}!',
        body: `Dear {{fullName}},\n\nThank you for your interest in studying abroad through {{companyName}}. We're excited to help you achieve your educational goals.\n\nYour preferences:\n- Country: {{country}}\n- Budget: {{budgetRange}}\n- Intake: {{preferredIntake}}\n\nOur team will be in touch shortly to discuss your options.\n\nBest regards,\n{{companyName}} Team`
    },
    {
        id: '2',
        name: 'Follow-up Email',
        subject: 'Following up on your application',
        body: `Hi {{fullName}},\n\nI wanted to follow up on your inquiry about studying abroad. Have you had a chance to review the information we sent?\n\nI'm here to answer any questions you might have about:\n- Programs in {{preferredCountries}}\n- Budget planning ({{budgetRange}})\n- Application timeline for {{preferredIntake}}\n\nLooking forward to hearing from you!\n\nBest,\n{{companyName}}`
    },
    {
        id: '3',
        name: 'Document Request',
        subject: 'Required Documents for Your Application',
        body: `Dear {{fullName}},\n\nTo proceed with your application, we'll need the following documents:\n\n- Valid Passport\n- Academic Transcripts\n- English Language Test Results (IELTS/TOEFL)\n- Statement of Purpose\n- Letters of Recommendation\n\nPlease send these at your earliest convenience so we can move forward with the application process.\n\nThank you,\n{{companyName}}`
    }
];

interface SendEmailDialogProps {
    open: boolean;
    onClose: () => void;
    leadData: any;
}

export function SendEmailDialog({ open, onClose, leadData }: SendEmailDialogProps) {
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [emailData, setEmailData] = useState({
        to: leadData?.email || '',
        subject: '',
        body: '',
    });

    const replacePlaceholders = (text: string) => {
        if (!text) return '';

        const replacements: Record<string, string> = {
            '{{fullName}}': leadData?.fullName || 'there',
            '{{companyName}}': 'Admission CRM',
            '{{country}}': leadData?.country || 'N/A',
            '{{budgetRange}}': leadData?.budgetRange || 'N/A',
            '{{preferredIntake}}': leadData?.preferredIntake || 'N/A',
            '{{preferredCountries}}': Array.isArray(leadData?.preferredCountries)
                ? leadData.preferredCountries.join(', ')
                : leadData?.preferredCountries || 'N/A',
        };

        let result = text;
        Object.entries(replacements).forEach(([placeholder, value]) => {
            result = result.replace(new RegExp(placeholder, 'g'), value);
        });

        return result;
    };

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId);
        const template = mockEmailTemplates.find(t => t.id === templateId);
        if (template) {
            setEmailData({
                to: leadData?.email || '',
                subject: replacePlaceholders(template.subject),
                body: replacePlaceholders(template.body),
            });
        }
    };

    const clearTemplate = () => {
        setSelectedTemplate('');
        setEmailData({
            to: leadData?.email || '',
            subject: '',
            body: '',
        });
    };

    const handleSend = () => {
        console.log('Sending email:', emailData);
        // TODO: Implement actual email sending when backend is ready
        alert('Email sent successfully! (Mock - will actually send when backend is connected)');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        <div className="flex items-center gap-2">
                            <Mail className="h-6 w-6 text-primary" />
                            Send Email to {leadData?.fullName}
                        </div>
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        Use a template or write your own message
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {/* Email Template Selector - Optional */}
                    <div className="bg-muted/50 p-4 rounded-lg border">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="template" className="text-sm font-semibold">
                                    Email Template <span className="text-muted-foreground font-normal">(Optional)</span>
                                </Label>
                                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                                    <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Choose a template or write from scratch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockEmailTemplates.map(template => (
                                            <SelectItem key={template.id} value={template.id}>
                                                {template.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    💡 Templates auto-fill with lead data. You can also write your own email below.
                                </p>
                            </div>
                            {selectedTemplate && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearTemplate}
                                    className="mt-6"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* To Email */}
                    <div className="space-y-2">
                        <Label htmlFor="to" className="text-sm font-semibold">To</Label>
                        <Input
                            id="to"
                            type="email"
                            value={emailData.to}
                            onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                            placeholder="recipient@email.com"
                            required
                            className="text-base"
                        />
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-semibold">Subject</Label>
                        <Input
                            id="subject"
                            value={emailData.subject}
                            onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                            placeholder="Email subject"
                            required
                            className="text-base"
                        />
                    </div>

                    {/* Email Body - Rich Text Editor */}
                    <div className="space-y-2">
                        <Label htmlFor="body" className="text-sm font-semibold">Message</Label>
                        <RichTextEditor
                            value={emailData.body}
                            onChange={(html) => setEmailData({ ...emailData, body: html })}
                            placeholder="Write your email message here... Use the formatting tools above for professional emails."
                            className="min-h-[350px]"
                        />
                        <p className="text-xs text-muted-foreground">
                            💡 Use the formatting toolbar to make your email look professional with headings, lists, and links.
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} size="lg">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={!emailData.to || !emailData.subject || !emailData.body}
                        size="lg"
                    >
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
