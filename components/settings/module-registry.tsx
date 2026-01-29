'use client';

import { systemModules } from '@/lib/settings/modules';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, X } from 'lucide-react';

export function ModuleRegistry() {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                {systemModules.map((module) => {
                    const Icon = module.icon;

                    return (
                        <Card key={module.id} className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="p-2 rounded-lg"
                                        style={{ backgroundColor: `${module.color}20` }}
                                    >
                                        <Icon className="h-5 w-5" style={{ color: module.color }} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{module.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {module.description}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={module.isActive}
                                    disabled={module.id === 'leads' || module.id === 'students'}
                                    title={module.isActive ? 'Enabled' : 'Disabled'}
                                />
                            </div>

                            {/* Features */}
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                                {module.hasStatus && (
                                    <Badge variant="secondary" className="text-xs">
                                        <Check className="h-3 w-3 mr-1" />
                                        Status
                                    </Badge>
                                )}
                                {module.hasTasks && (
                                    <Badge variant="secondary" className="text-xs">
                                        <Check className="h-3 w-3 mr-1" />
                                        Tasks
                                    </Badge>
                                )}
                                {module.hasDocuments && (
                                    <Badge variant="secondary" className="text-xs">
                                        <Check className="h-3 w-3 mr-1" />
                                        Documents
                                    </Badge>
                                )}
                                {module.hasNotes && (
                                    <Badge variant="secondary" className="text-xs">
                                        <Check className="h-3 w-3 mr-1" />
                                        Notes
                                    </Badge>
                                )}
                                {module.hasTimeline && (
                                    <Badge variant="secondary" className="text-xs">
                                        <Check className="h-3 w-3 mr-1" />
                                        Timeline
                                    </Badge>
                                )}
                                {module.hasCustomFields && (
                                    <Badge variant="outline" className="text-xs">
                                        Custom Fields
                                    </Badge>
                                )}
                            </div>

                            {/* Status */}
                            <div className="mt-3 pt-3 border-t">
                                <Badge
                                    variant={module.isActive ? "default" : "secondary"}
                                    className="text-xs"
                                >
                                    {module.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Core modules (Leads & Students) cannot be disabled.
                    Additional modules can be activated as needed for your organization.
                </p>
            </div>
        </div>
    );
}
