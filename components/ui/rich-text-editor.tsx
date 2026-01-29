'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Link as LinkIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Heading1,
    Heading2,
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    const executeCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        updateContent();
    };

    const updateContent = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const insertLink = () => {
        const url = prompt('Enter URL:');
        if (url) {
            executeCommand('createLink', url);
        }
    };

    const toolbarButtons = [
        { icon: Bold, command: 'bold', label: 'Bold' },
        { icon: Italic, command: 'italic', label: 'Italic' },
        { icon: Underline, command: 'underline', label: 'Underline' },
        { divider: true },
        { icon: Heading1, command: 'formatBlock', value: '<h1>', label: 'Heading 1' },
        { icon: Heading2, command: 'formatBlock', value: '<h2>', label: 'Heading 2' },
        { divider: true },
        { icon: List, command: 'insertUnorderedList', label: 'Bullet List' },
        { icon: ListOrdered, command: 'insertOrderedList', label: 'Numbered List' },
        { divider: true },
        { icon: AlignLeft, command: 'justifyLeft', label: 'Align Left' },
        { icon: AlignCenter, command: 'justifyCenter', label: 'Align Center' },
        { icon: AlignRight, command: 'justifyRight', label: 'Align Right' },
        { divider: true },
        { icon: LinkIcon, action: insertLink, label: 'Insert Link' },
    ];

    return (
        <div className={`border rounded-md ${isFocused ? 'ring-2 ring-ring ring-offset-2' : ''} ${className}`}>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
                {toolbarButtons.map((btn, idx) => {
                    if (btn.divider) {
                        return <div key={idx} className="w-px h-8 bg-border mx-1" />;
                    }

                    const Icon = btn.icon!;
                    return (
                        <Button
                            key={idx}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                                if (btn.action) {
                                    btn.action();
                                } else {
                                    executeCommand(btn.command!, btn.value);
                                }
                            }}
                            title={btn.label}
                        >
                            <Icon className="h-4 w-4" />
                        </Button>
                    );
                })}
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none"
                onInput={updateContent}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                dangerouslySetInnerHTML={{ __html: value || '' }}
                data-placeholder={placeholder}
                style={{
                    ...((!value || value === '') && {
                        ":before": {
                            content: placeholder,
                            color: '#9ca3af',
                        }
                    })
                }}
            />

            <style jsx>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
}
