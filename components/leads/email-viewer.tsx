'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Mail, User, Calendar } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmailViewerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    email: {
        id: string;
        subject: string;
        sentBy: string;
        sentAt: Date;
        status: string;
        template?: string;
        to?: string;
        body?: string;
    } | null;
}

export function EmailViewer({ open, onOpenChange, email }: EmailViewerProps) {
    if (!email) return null;

    const statusColors: Record<string, string> = {
        'Delivered': 'bg-green-100 text-green-800 border-green-200',
        'Opened': 'bg-blue-100 text-blue-800 border-blue-200',
        'Sent': 'bg-gray-100 text-gray-800 border-gray-200',
        'Failed': 'bg-red-100 text-red-800 border-red-200',
    };

    // Mock email body for demonstration
    const emailBody = email.body || `Dear ${email.to || 'Recipient'},

Thank you for your interest in studying abroad through Admission CRM. We're excited to help you achieve your educational goals.

Your preferences:
- Country: Egypt
- Budget: $20,000 - $30,000
- Intake: September 2025

Our team will be in touch shortly to discuss your options.

Best regards,
${email.sentBy}
Admission CRM Team`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        {email.subject}
                    </DialogTitle>
                    <DialogDescription>
                        Email details and content
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Email Metadata */}
                    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">From: {email.sentBy}</p>
                                    {email.to && (
                                        <p className="text-xs text-muted-foreground">To: {email.to}</p>
                                    )}
                                </div>
                            </div>
                            <Badge className={`${statusColors[email.status] || statusColors.Sent} border`}>
                                {email.status}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(email.sentAt).toLocaleString()}</span>
                            </div>
                            {email.template && (
                                <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    <span>Template: {email.template}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Email Body */}
                    <div>
                        <h4 className="text-sm font-semibold mb-2">Message:</h4>
                        <ScrollArea className="h-[400px] w-full rounded-lg border bg-background p-4">
                            <div className="whitespace-pre-wrap font-mono text-sm">
                                {emailBody}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
