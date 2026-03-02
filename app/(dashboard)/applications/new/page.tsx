'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface SelectOption {
    id: string;
    name: string;
    fullName?: string;
    email?: string;
}

interface ProgramOption {
    id: string;
    name: string;
    isActive?: boolean;
    activeApplications?: boolean;
    officialTuition?: string | number;
    discountedTuition?: string | number;
    tuitionCurrency?: string;
    degreeId?: string;
    degree?: { id: string; name: string };
    faculty?: { id: string; name: string };
}

interface AgentOption {
    id: string;
    companyName: string;
    contactPerson?: string;
    email?: string;
}

export default function NewApplicationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [studentId, setStudentId] = useState('');
    const [programId, setProgramId] = useState('');
    const [academicYearId, setAcademicYearId] = useState('');
    const [semesterId, setSemesterId] = useState('');
    const [degreeId, setDegreeId] = useState('');
    const [stage, setStage] = useState('Draft');
    const [notes, setNotes] = useState('');
    const [agencyId, setAgencyId] = useState('');


    // Dropdown data
    const [students, setStudents] = useState<SelectOption[]>([]);
    const [programs, setPrograms] = useState<ProgramOption[]>([]);
    const [academicYears, setAcademicYears] = useState<SelectOption[]>([]);
    const [semesters, setSemesters] = useState<SelectOption[]>([]);
    const [degrees, setDegrees] = useState<SelectOption[]>([]);
    const [agents, setAgents] = useState<AgentOption[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Selected program info for display
    const selectedProgram = programs.find(p => p.id === programId);

    // Fetch dropdown data
    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            try {
                // Helper to safely extract array from API response
                const toArray = (d: any): any[] => {
                    if (Array.isArray(d?.students)) return d.students; // Handle Students API
                    if (Array.isArray(d?.data)) return d.data;
                    if (Array.isArray(d)) return d;
                    return [];
                };

                const [studentsRes, programsRes, yearsRes, semestersRes, degreesRes, agentsRes] = await Promise.all([
                    fetch('/api/students'),
                    fetch('/api/programs'),
                    fetch('/api/academic-years'),
                    fetch('/api/semesters'),
                    fetch('/api/degrees'),
                    fetch('/api/agents'),
                ]);

                if (studentsRes.ok) {
                    const d = await studentsRes.json();
                    setStudents(toArray(d));
                }
                if (programsRes.ok) {
                    const d = await programsRes.json();
                    setPrograms(toArray(d));
                }
                if (yearsRes.ok) {
                    const d = await yearsRes.json();
                    const years = toArray(d).filter((y: any) => y.isActive);
                    setAcademicYears(years);
                    const defaultYear = years.find((y: any) => y.isDefault);
                    if (defaultYear) setAcademicYearId(defaultYear.id);
                }
                if (semestersRes.ok) {
                    const d = await semestersRes.json();
                    const sems = toArray(d).filter((s: any) => s.isActive);
                    setSemesters(sems);
                    const defaultSem = sems.find((s: any) => s.isDefault);
                    if (defaultSem) setSemesterId(defaultSem.id);
                }
                if (degreesRes.ok) {
                    const d = await degreesRes.json();
                    setDegrees(toArray(d).filter((deg: any) => deg.isActive));
                }
                if (agentsRes.ok) {
                    const d = await agentsRes.json();
                    setAgents(toArray(d));
                }
            } catch (err) {
                console.error('Failed to fetch dropdown data:', err);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    // Clear program selection if degree changes to ensure they match
    useEffect(() => {
        setProgramId('');
    }, [degreeId]);

    // Format tuition for display
    const formatTuition = (program: ProgramOption) => {
        const tuition = program.discountedTuition || program.officialTuition;
        if (!tuition) return '';
        const amount = Number(tuition).toLocaleString();
        const currency = program.tuitionCurrency || 'USD';
        return `${amount} ${currency}`;
    };

    // Filter programs based on active status, accepting applicants, and selected degree
    const availablePrograms = programs.filter(p =>
        p.isActive === true &&
        p.activeApplications === true &&
        (degreeId ? (p.degreeId === degreeId || p.degree?.id === degreeId) : true)
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!studentId || !programId || !academicYearId || !semesterId || !degreeId) {
            setError('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId,
                    programId,
                    academicYearId,
                    semesterId,
                    degreeId,
                    stage,
                    notes: notes || undefined,
                    agencyId: agencyId && agencyId !== 'none' ? agencyId : undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Failed to create application');
                return;
            }

            router.push('/applications');
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="container py-8 flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container py-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/applications">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">New Application</h1>
                    <p className="text-muted-foreground">Create a new student application</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Application Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        {/* Student */}
                        <div className="space-y-2">
                            <Label htmlFor="student">Student *</Label>
                            <Select value={studentId} onValueChange={setStudentId}>
                                <SelectTrigger id="student">
                                    <SelectValue placeholder="Select a student" />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.fullName || s.name} {s.email ? `(${s.email})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Academic Year & Semester - Side by Side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="academicYear">Academic Year *</Label>
                                <Select value={academicYearId} onValueChange={setAcademicYearId}>
                                    <SelectTrigger id="academicYear">
                                        <SelectValue placeholder="Select academic year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map((y) => (
                                            <SelectItem key={y.id} value={y.id}>
                                                {y.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="semester">Semester *</Label>
                                <Select value={semesterId} onValueChange={setSemesterId}>
                                    <SelectTrigger id="semester">
                                        <SelectValue placeholder="Select semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {semesters.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Degree & Stage */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="degree">Degree *</Label>
                                <Select value={degreeId} onValueChange={setDegreeId}>
                                    <SelectTrigger id="degree">
                                        <SelectValue placeholder="Select degree" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {degrees.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stage">Stage</Label>
                                <Select value={stage} onValueChange={setStage}>
                                    <SelectTrigger id="stage">
                                        <SelectValue placeholder="Select stage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="Submitted">Submitted</SelectItem>
                                        <SelectItem value="Under Review">Under Review</SelectItem>
                                        <SelectItem value="Missing Docs">Missing Docs</SelectItem>
                                        <SelectItem value="Conditional Acceptance">Conditional Acceptance</SelectItem>
                                        <SelectItem value="Final Acceptance">Final Acceptance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Program with Tuition Display (Filtered by Degree) */}
                        <div className="space-y-2">
                            <Label htmlFor="program">Program *</Label>
                            <Select value={programId} onValueChange={setProgramId} disabled={!degreeId}>
                                <SelectTrigger id="program">
                                    <SelectValue placeholder={degreeId ? "Select a program" : "Select a degree first"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availablePrograms.length === 0 && degreeId && (
                                        <SelectItem value="none" disabled>No active programs found</SelectItem>
                                    )}
                                    {availablePrograms.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}{p.faculty?.name ? ` — ${p.faculty.name}` : ''}{formatTuition(p) ? ` — ${formatTuition(p)}` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {/* Tuition Info Card */}
                            {selectedProgram && (selectedProgram.officialTuition || selectedProgram.discountedTuition) && (
                                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                                    <DollarSign className="h-4 w-4 text-blue-600" />
                                    <div>
                                        {selectedProgram.officialTuition && (
                                            <span className={selectedProgram.discountedTuition ? 'line-through text-muted-foreground mr-2' : 'font-medium'}>
                                                {Number(selectedProgram.officialTuition).toLocaleString()} {selectedProgram.tuitionCurrency || 'USD'}
                                            </span>
                                        )}
                                        {selectedProgram.discountedTuition && (
                                            <span className="font-medium text-green-700">
                                                {Number(selectedProgram.discountedTuition).toLocaleString()} {selectedProgram.tuitionCurrency || 'USD'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Agent & CRM ID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="agency">Agent / Agency</Label>
                                <Select value={agencyId} onValueChange={setAgencyId}>
                                    <SelectTrigger id="agency">
                                        <SelectValue placeholder="Select agency (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Agency</SelectItem>
                                        {agents.map((a) => (
                                            <SelectItem key={a.id} value={a.id}>
                                                {a.companyName}{a.contactPerson ? ` — ${a.contactPerson}` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any additional notes about this application..."
                                rows={4}
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex items-center gap-4 pt-4">
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Create Application
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" type="button" asChild>
                                <Link href="/applications">Cancel</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
