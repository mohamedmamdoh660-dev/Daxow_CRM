'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, X } from 'lucide-react';

interface UploadDocumentDialogProps {
    open: boolean;
    onClose: () => void;
    leadId: string;
    onUploadSuccess: () => void;
}

const documentTypes = [
    'passport',
    'transcript',
    'certificate',
    'resume',
    'recommendation_letter',
    'proof_of_funds',
    'language_test',
    'other',
];

export function UploadDocumentDialog({ open, onClose, leadId, onUploadSuccess }: UploadDocumentDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileType, setFileType] = useState('other');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setUploadError('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
            setUploadError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadError('Please select a file');
            return;
        }

        setUploading(true);
        setUploadError(null);

        try {
            // Step 1: Upload file to storage
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('folder', 'leads'); // Specify folder for organization

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) {
                const errorData = await uploadRes.json();
                throw new Error(errorData.error || 'Failed to upload file');
            }

            const uploadData = await uploadRes.json();

            // Step 2: Create document record
            const documentRes = await fetch('/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    leadId,
                    fileName: selectedFile.name,
                    fileType,
                    fileUrl: uploadData.fileUrl, // Use fileUrl from API response
                    fileSize: selectedFile.size,
                    storagePath: uploadData.storagePath,
                }),
            });

            if (!documentRes.ok) {
                const errorData = await documentRes.json();
                throw new Error(errorData.error || 'Failed to create document record');
            }

            // Success!
            alert(`Document "${selectedFile.name}" uploaded successfully!`);
            setSelectedFile(null);
            setFileType('other');
            onUploadSuccess();
            onClose();
        } catch (error: any) {
            console.error('Upload error:', error);
            setUploadError(error.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        if (!uploading) {
            setSelectedFile(null);
            setFileType('other');
            setUploadError(null);
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                        Upload a document for this lead. Max file size: 10MB
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* File Type Selector */}
                    <div className="space-y-2">
                        <Label htmlFor="fileType">Document Type</Label>
                        <Select value={fileType} onValueChange={setFileType}>
                            <SelectTrigger id="fileType">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {documentTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* File Selector */}
                    <div className="space-y-2">
                        <Label htmlFor="file">Select File</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            {selectedFile ? (
                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <div className="text-left">
                                            <p className="font-medium text-sm">{selectedFile.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {(selectedFile.size / 1024).toFixed(2)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedFile(null)}
                                        disabled={uploading}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                    <div className="mb-3">
                                        <p className="text-sm text-muted-foreground mb-1">
                                            Click to browse or drag and drop
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                                        </p>
                                    </div>
                                    <Input
                                        id="file"
                                        type="file"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={handleFileSelect}
                                        className="max-w-xs mx-auto cursor-pointer"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {uploadError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{uploadError}</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
