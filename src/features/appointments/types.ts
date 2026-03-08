export interface IAppointment {
    id: number;
    professional_id: number;
    client_id: number;
    scheduled_at: string;
    duration_minutes?: number;
    status?: string;
    title?: string;
    meeting_link?: string;
    notes?: string;
    deleted_at?: string | null;
    start_date?: string;
    end_date?: string;
    effective_duration?: number;
    paused_at?: string | null;
    last_resumed_at?: string | null;
    pause_count?: number;
    total_paused_seconds?: number;
    session_events?: Array<Record<string, any>> | null;
    type?: 'NUTRITION' | 'TRAINING' | 'BOTH';
    stage?: string;
}

export interface CreateAppointmentDraftRequest {
    appointment_id: number;
    stage: string;
    notes?: string;
    metrics?: any;
    target_macros?: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    };
    json_state?: any;
}

export interface UpdateAppointmentDraftRequest {
    stage?: string;
    notes?: string;
    metrics?: any;
    target_macros?: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    };
    json_state?: any;
}
