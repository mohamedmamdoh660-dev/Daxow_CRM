// import { mockApplications, mockStages } from '@/lib/mock-data'; // Removed - Mock data deleted
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, User, GraduationCap } from 'lucide-react';

export default async function ApplicationsPage() {
    // TODO: Replace with API calls
    const applications: any[] = [];
    const stages: any[] = [
        { id: '1', name: 'New', color: '#6366f1', description: 'New applications', order: 1 },
    ];

    // Group applications by stage
    const applicationsByStage = stages.reduce((acc, stage) => {
        acc[stage.name] = applications.filter(app => app.status === stage.name);
        return acc;
    }, {} as Record<string, typeof applications>);

    return (
        <div className="container py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Application Pipeline</h1>
                    <p className="text-muted-foreground">Track student applications through stages</p>
                </div>
                <Link href="/applications/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Application
                    </Button>
                </Link>
            </div>

            <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                    {stages.map((stage) => {
                        const stageApps = applicationsByStage[stage.name] || [];

                        return (
                            <div key={stage.id} className="flex-shrink-0 w-80">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: stage.color }}
                                                />
                                                <CardTitle className="text-base">{stage.name}</CardTitle>
                                            </div>
                                            <Badge variant="secondary">{stageApps.length}</Badge>
                                        </div>
                                        <CardDescription className="text-xs">
                                            {stage.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {stageApps.map((app: any) => (
                                            <Link
                                                key={app.id}
                                                href={`/applications/${app.id}`}
                                                className="block"
                                            >
                                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                                    <CardContent className="p-4 space-y-2">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                                <Link
                                                                    href={`/students/${app.student.id}`}
                                                                    className="font-medium text-sm truncate hover:underline text-blue-600"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {app.student.fullName}
                                                                </Link>
                                                            </div>
                                                            <Badge
                                                                variant={
                                                                    app.priority === 'High' ? 'destructive' :
                                                                        app.priority === 'Medium' ? 'default' :
                                                                            'secondary'
                                                                }
                                                                className="text-xs"
                                                            >
                                                                {app.priority}
                                                            </Badge>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <GraduationCap className="h-3 w-3 flex-shrink-0" />
                                                            <span className="truncate">{app.program.name}</span>
                                                        </div>

                                                        <div className="text-xs text-muted-foreground">
                                                            <span>{app.program.university.name}</span>
                                                        </div>

                                                        {app.tags.length > 0 && (
                                                            <div className="flex gap-1 flex-wrap">
                                                                {app.tags.slice(0, 2).map((tag: string) => (
                                                                    <Badge key={tag} variant="outline" className="text-xs">
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="text-xs text-muted-foreground pt-1 border-t">
                                                            Applied: {new Date(app.applicationDate).toLocaleDateString()}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}

                                        {stageApps.length === 0 && (
                                            <div className="text-center py-8 text-sm text-muted-foreground">
                                                No applications in this stage
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-2xl font-bold">{applications.length}</div>
                                <div className="text-sm text-muted-foreground">Total Applications</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {applicationsByStage['Unconditional Offer']?.length || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">Offers Received</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {applicationsByStage['Applied']?.length || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">In Progress</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600">
                                    {applicationsByStage['New']?.length || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">New This Month</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
