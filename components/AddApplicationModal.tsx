'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, DollarSign, GraduationCap } from 'lucide-react';
import { OwnerSelector } from '@/components/shared/owner-selector';
import { useCurrentUser } from '@/lib/hooks/use-current-user';

interface SelectOption {
    id: string;
    name: string;
    isDefault?: boolean;
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

interface AddApplicationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentId: string;
    studentName: string;
    onSuccess?: () => void;
}

export default function AddApplicationModal({
    open,
    onOpenChange,
    studentId,
    studentName,
    onSuccess,
}: AddApplicationModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user: currentUser } = useCurrentUser();

    // Form state
    const [programId, setProgramId] = useState('');
    const [academicYearId, setAcademicYearId] = useState('');
    const [semesterId, setSemesterId] = useState('');
    const [degreeId, setDegreeId] = useState('');
    const [stage, setStage] = useState('Draft');
    const [notes, setNotes] = useState('');
    const [agencyId, setAgencyId] = useState('');
    const [ownerType, setOwnerType] = useState('');
    const [ownerId, setOwnerId] = useState('');

    // Dropdown data
    const [programs, setPrograms] = useState<ProgramOption[]>([]);
    const [academicYears, setAcademicYears] = useState<SelectOption[]>([]);
    const [semesters, setSemesters] = useState<SelectOption[]>([]);
    const [degrees, setDegrees] = useState<SelectOption[]>([]);
    const [agents, setAgents] = useState<AgentOption[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Selected program info for display
    const selectedProgram = programs.find(p => p.id === programId);

    // Fetch dropdown data when modal opens
    useEffect(() => {
        if (!open) return;

        const fetchData = async () => {
            setLoadingData(true);
            try {
                const toArray = (d: any): any[] => {
                    if (Array.isArray(d?.data)) return d.data;
                    if (Array.isArray(d)) return d;
                    return [];
                };

                const [programsRes, yearsRes, semestersRes, degreesRes, agentsRes] = await Promise.all([
                    fetch('/api/programs'),
                    fetch('/api/academic-years'),
                    fetch('/api/semesters'),
                    fetch('/api/degrees'),
                    fetch('/api/agents'),
                ]);

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
    }, [open]);

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

    // Reset form when modal closes
    const resetForm = () => {
        setProgramId('');
        setAcademicYearId('');
        setSemesterId('');
        setDegreeId('');
        setStage('Draft');
        setNotes('');
        setAgencyId('');
        setOwnerType('');
        setOwnerId('');
        setError('');
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            resetForm();
        }
        onOpenChange(newOpen);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!programId || !academicYearId || !semesterId || !degreeId) {
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
                    ...(ownerType && ownerId ? { ownerType, ownerId } : {}),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Failed to create application');
                return;
            }

            // Success - close modal and refresh data
            resetForm();
            onOpenChange(false);
            onSuccess?.();
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Add Application
                    </DialogTitle>
                    <DialogDescription>
                        Create a new application for <strong>{studentName}</strong>
                    </DialogDescription>
                </DialogHeader>

                {loadingData ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        {/* Academic Year & Semester */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="modal-year">Academic Year *</Label>
                                <Select value={academicYearId} onValueChange={setAcademicYearId}>
                                    <SelectTrigger id="modal-year">
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
                                <Label htmlFor="modal-semester">Semester *</Label>
                                <Select value={semesterId} onValueChange={setSemesterId}>
                                    <SelectTrigger id="modal-semester">
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="modal-degree">
                                    Degree *
                                </Label>
                                <Select value={degreeId} onValueChange={setDegreeId}>
                                    <SelectTrigger id="modal-degree">
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
                                <Label htmlFor="modal-stage">Stage</Label>
                                <Select value={stage} onValueChange={setStage}>
                                    <SelectTrigger id="modal-stage">
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
                            <Label htmlFor="modal-program">Program *</Label>
                            <Select value={programId} onValueChange={setProgramId} disabled={!degreeId}>
                                <SelectTrigger id="modal-program">
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
                            {/* Tuition Info */}
                            {selectedProgram && (selectedProgram.officialTuition || selectedProgram.discountedTuition) && (
                                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                                    <DollarSign className="h-4 w-4 text-blue-600 shrink-0" />
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

                        {/* Agent / Agency */}
                        <div className="space-y-2">
                            <Label htmlFor="modal-agency">Agent / Agency</Label>
                            <Select value={agencyId} onValueChange={setAgencyId}>
                                <SelectTrigger id="modal-agency">
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

                        {/* Owner */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Record Owner</label>
                            <OwnerSelector
                                ownerType={ownerType}
                                ownerId={ownerId}
                                onOwnerTypeChange={(t) => { setOwnerType(t); setOwnerId(''); }}
                                onOwnerIdChange={setOwnerId}
                                initialUserId={currentUser?.id}
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="modal-notes">Notes</Label>
                            <Textarea
                                id="modal-notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any additional notes about this application..."
                                rows={3}
                            />
                        </div>

                        {/* Actions */}
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                                Cancel
                            </Button>
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
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
