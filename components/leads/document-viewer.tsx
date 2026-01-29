'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, X, FileText } from 'lucide-react';

interface Document {
    id: string;
    fileName: string;
    fileType: string;
    fileSize?: number;
    fileUrl: string;
    createdAt: string | Date;
}

interface DocumentViewerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    documents: Document[];
    leadName?: string;
    initialDocIndex?: number;
}

export function DocumentViewer({
    open,
    onOpenChange,
    documents,
    leadName,
    initialDocIndex = 0
}: DocumentViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialDocIndex);

    if (!documents || documents.length === 0) {
        return null;
    }

    const currentDoc = documents[currentIndex];

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : documents.length - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < documents.length - 1 ? prev + 1 : 0));
    };

    const handleDownloadAll = () => {
        // Download each document
        documents.forEach(doc => {
            if (doc.fileUrl) {
                const link = document.createElement('a');
                link.href = doc.fileUrl;
                link.download = doc.fileName;
                link.click();
            }
        });
    };

    const handleDownloadCurrent = () => {
        if (currentDoc.fileUrl) {
            const link = document.createElement('a');
            link.href = currentDoc.fileUrl;
            link.download = currentDoc.fileName;
            link.click();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[90vh] p-0">
                <div className="flex h-full">
                    {/* Document List Sidebar */}
                    <div className="w-64 border-r bg-muted/30 p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-sm">Documents</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownloadAll}
                                className="h-8"
                            >
                                <Download className="h-3 w-3 mr-1" />
                                All
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {documents.map((doc, index) => (
                                <button
                                    key={doc.id}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${index === currentIndex
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-accent'
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{doc.fileName}</p>
                                            <p className="text-xs opacity-70">{doc.fileType}</p>
                                            <p className="text-xs opacity-60">
                                                {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(2)} KB` : 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Document Viewer */}
                    <div className="flex-1 flex flex-col">
                        <DialogHeader className="px-6 py-4 border-b">
                            <div className="flex items-center justify-between">
                                <DialogTitle className="text-lg">
                                    {currentDoc.fileName}
                                </DialogTitle>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        {currentIndex + 1} / {documents.length}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDownloadCurrent}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onOpenChange(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Document Preview Area */}
                        <div className="flex-1 bg-muted/20 flex items-center justify-center p-6">
                            <div className="text-center">
                                <FileText className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg font-medium mb-2">{currentDoc.fileName}</p>
                                <p className="text-sm text-muted-foreground mb-1">
                                    Type: {currentDoc.fileType} • Size: {currentDoc.fileSize ? `${(currentDoc.fileSize / 1024).toFixed(2)} KB` : 'Unknown'}
                                </p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Uploaded: {new Date(currentDoc.createdAt).toLocaleDateString()}
                                </p>
                                {currentDoc.fileUrl && (
                                    <a
                                        href={currentDoc.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download File
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Navigation Controls */}
                        <div className="border-t p-4 flex items-center justify-between">
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={documents.length === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Previous
                            </Button>
                            <div className="text-sm text-muted-foreground">
                                {currentDoc.fileType}
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleNext}
                                disabled={documents.length === 1}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
