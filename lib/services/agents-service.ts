import { AgentProfile, CreateAgentDTO, CreateSubAgentDTO } from '@/types/agents';

// This service is intended to call Next.js API endpoints 
// which in turn will call the Backend API (NestJS) or Database directly.
// For now, assuming we are calling Next.js API structure similar to programs.

const API_BASE_URL = '/api/agents';

export const AgentsService = {

    /**
   * Get all Agents (Agencies) - Admin View
   */
    async getAgents(page = 1, pageSize = 10, search = ''): Promise<any> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('pageSize', pageSize.toString());
        if (search) params.append('search', search);

        const response = await fetch(`${API_BASE_URL}?${params.toString()}`);

        if (!response.ok) {
            throw new Error('Failed to fetch agents');
        }
        return response.json();
    },

    /**
     * Create a new Agency (Agent Profile + Owner User)
       * This is typically an Admin action.
       */
    async createAgent(data: CreateAgentDTO): Promise<AgentProfile> {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create agent');
        }
        return response.json();
    },

    /**
     * Create a Sub-Agent under a specific Agency.
     * This is typically an Agent action (creating their own staff).
     */
    async createSubAgent(data: CreateSubAgentDTO): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/sub-agents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create sub-agent');
        }
        return response.json();
    },

    /**
     * Get all students belonging to the current user's agency.
     * Logic:
     * - If Admin: Returns all (or filtered).
     * - If Agent/Sub-Agent: Returns only students with agentId == myAgencyId.
     */
    async getMyStudents(page = 1, pageSize = 10): Promise<any> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('pageSize', pageSize.toString());
        params.append('scope', 'agency'); // Hint to backend to apply scope

        const response = await fetch(`${API_BASE_URL}/students?${params.toString()}`);

        if (!response.ok) {
            throw new Error('Failed to fetch agency students');
        }
        return response.json();
    },

    /**
     * Get the current user's agency profile details.
     */
    async getMyAgencyProfile(): Promise<AgentProfile> {
        const response = await fetch(`${API_BASE_URL}/me`);

        if (!response.ok) {
            throw new Error('Failed to fetch agency profile');
        }
        return response.json();
    }
};
