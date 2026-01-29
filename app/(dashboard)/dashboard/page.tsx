import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, Building2, FileText, ArrowRight } from 'lucide-react';
// import { mockStudents, mockApplications, mockUniversities, mockPrograms } from '@/lib/mock-data'; // Removed - Mock data deleted

export default function DashboardPage() {
    // TODO: Replace with API calls
    const mockStudents: any[] = [];
    const mockApplications: any[] = [];
    const mockUniversities: any[] = [];
    const mockPrograms: any[] = [];

    const stats = {
        students: mockStudents.length,
        applications: mockApplications.length,
        universities: mockUniversities.length,
        programs: mockPrograms.length,
    };

    const recentApplications = mockApplications.slice(0, 5);

    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to Admission CRM</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.students}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Active student contacts
                        </p>
                        <Link href="/students">
                            <Button variant="link" className="px-0 mt-2" size="sm">
                                View all <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Applications</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.applications}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            In pipeline
                        </p>
                        <Link href="/applications">
                            <Button variant="link" className="px-0 mt-2" size="sm">
                                View pipeline <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Universities</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.universities}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Partner universities
                        </p>
                        <Link href="/universities">
                            <Button variant="link" className="px-0 mt-2" size="sm">
                                Browse catalog <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Programs</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.programs}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Study programs
                        </p>
                        <Link href="/programs">
                            <Button variant="link" className="px-0 mt-2" size="sm">
                                View programs <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Applications</CardTitle>
                        <CardDescription>Latest student applications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentApplications.map((app: any) => (
                                <div
                                    key={app.id}
                                    className="p-3 border rounded-lg"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <Link
                                                href={`/students/${app.student.id}`}
                                                className="font-medium hover:underline text-blue-600"
                                            >
                                                {app.student.fullName}
                                            </Link>
                                            <div className="text-sm text-muted-foreground">
                                                {app.program.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {app.program.university.name}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-medium px-2 py-1 rounded"
                                                style={{
                                                    backgroundColor: mockApplications.find(a => a.status === app.status)?.stageHistory[0] ? '#e0f2fe' : '#f3f4f6',
                                                    color: '#0369a1'
                                                }}>
                                                {app.status}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {new Date(app.applicationDate).toLocaleDateString()}
                                            </div>
                                            <Link href={`/applications/${app.id}`}>
                                                <Button variant="ghost" size="sm" className="mt-2">
                                                    View <ArrowRight className="ml-1 h-3 w-3" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-3">
                            <Link href="/students/new">
                                <Button variant="outline" className="w-full justify-start">
                                    <Users className="mr-2 h-4 w-4" />
                                    Add New Student
                                </Button>
                            </Link>
                            <Link href="/applications/new">
                                <Button variant="outline" className="w-full justify-start">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Create Application
                                </Button>
                            </Link>
                            <Link href="/programs">
                                <Button variant="outline" className="w-full justify-start">
                                    <GraduationCap className="mr-2 h-4 w-4" />
                                    Browse Programs
                                </Button>
                            </Link>
                            <Link href="/universities/new">
                                <Button variant="outline" className="w-full justify-start">
                                    <Building2 className="mr-2 h-4 w-4" />
                                    Add University
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
