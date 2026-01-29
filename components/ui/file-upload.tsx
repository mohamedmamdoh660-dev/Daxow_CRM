'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    onFileRemove?: () => void;
    accept?: string;
    maxSize?: number; // in MB
    currentFile?: { fileName: string; fileUrl: string };
    label: string;
    required?: boolean;
    disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onFileSelect,
    onFileRemove,
    accept = 'image/*,application/pdf',
    maxSize = 10,
    currentFile,
    label,
    required = false,
    disabled = false,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateFile = (file: File): boolean => {
        setError(null);

        // Check file size
        const fileSizeInMB = file.size / (1024 * 1024);
        if (fileSizeInMB > maxSize) {
            setError(`File size must be less than ${maxSize}MB`);
            return false;
        }

        // Check file type
        const acceptedTypes = accept.split(',').map(t => t.trim());
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const mimeType = file.type;

        const isAccepted = acceptedTypes.some(type => {
            if (type.includes('*')) {
                const baseType = type.split('/')[0];
                return mimeType.startsWith(baseType);
            }
            return type === mimeType || type === fileExtension;
        });

        if (!isAccepted) {
            setError(`File type not accepted. Accepted types: ${accept}`);
            return false;
        }

        return true;
    };

    const handleFile = (file: File) => {
        if (validateFile(file)) {
            onFileSelect(file);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }, [disabled]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragging(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
            return <ImageIcon className="w-6 h-6" />;
        }
        if (ext === 'pdf') {
            return <FileText className="w-6 h-6" />;
        }
        return <File className="w-6 h-6" />;
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">
                {label} {required && <span className="text-destructive">*</span>}
            </label>

            {currentFile ? (
                <div className="relative border-2 border-muted rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-4">
                        {currentFile.fileUrl && (
                            <div className="flex-shrink-0">
                                {currentFile.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <img
                                        src={currentFile.fileUrl}
                                        alt={currentFile.fileName}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                ) : (
                                    <div className="w-16 h-16 flex items-center justify-center bg-muted rounded">
                                        {getFileIcon(currentFile.fileName)}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{currentFile.fileName}</p>
                        </div>
                        {onFileRemove && !disabled && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onFileRemove}
                                className="flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                        'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                        isDragging && 'border-primary bg-primary/5',
                        !isDragging && 'border-muted-foreground/30',
                        disabled && 'opacity-50 cursor-not-allowed',
                        !disabled && 'cursor-pointer hover:border-primary/50'
                    )}
                >
                    <input
                        type="file"
                        accept={accept}
                        onChange={handleFileInput}
                        disabled={disabled}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">
                        Drag and drop your file here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Max file size: {maxSize}MB
                    </p>
                </div>
            )}

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    );
};
