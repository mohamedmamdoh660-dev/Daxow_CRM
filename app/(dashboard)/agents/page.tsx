'use client';

import { useEffect, useState } from 'react';
import { AgentsService } from '@/lib/services/agents-service';
import { AgentsTable } from '@/components/agents/agents-table';
import { AgentProfile } from '@/types/agents';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AgentsPage() {
    const [data, setData] = useState<AgentProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchAgents = async (query = '') => {
        setLoading(true);
        try {
            // Using existing API endpoint pattern
            // Response structure is usually { data: [], total: number } or array
            const res = await AgentsService.getAgents(1, 50, query);
            const agents = Array.isArray(res) ? res : (res.data || []);
            setData(agents);
        } catch (error) {
            console.error('Error fetching agents:', error);
            // Don't toast error on initial load commonly if it's just empty
            if (query) toast.error('Failed to search agents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        // Debounce logic could be added here
        fetchAgents(query);
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Agents Management</h2>
            </div>

            {loading && data.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <AgentsTable
                    data={data}
                    onSearch={handleSearch}
                />
            )}
        </div>
    );
}
