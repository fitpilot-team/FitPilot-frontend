import { useParams, useNavigate } from 'react-router-dom';
import { useClientHistory } from '@/features/client-history/queries';
import { ClientMetricHistory } from '@/features/client-history/types';
import { 
    Ruler, Scale, Activity, HeartPulse, Droplet, 
    AlertCircle, ArrowLeft, TrendingDown, 
    AlertTriangle, Home, Moon, UtensilsCrossed, Flame, 
    Target, Zap 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { MetricHistoryModal } from './components/MetricHistoryModal';
import { ClientMetric, MetricType } from '@/services/client-metrics';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/common/Input';

interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    metrics?: {
        currentWeight: number;
        weightUnit: string;
        weightChange?: number;
        weightChangeLabel?: string;
    };
    client_metrics?: ClientMetric[];
    goals?: { name: string; isPrimary: boolean }[];
    medicalConditions?: string;
    // New measurements
    chestCm?: number;
    armLeftCm?: number;
    armRightCm?: number;
    thighLeftCm?: number;
    thighRightCm?: number;
    calfLeftCm?: number;
    calfRightCm?: number;
    [key: string]: any;
}

export function NutritionClientMedicalHistoryPage() {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState<Client | null>(null);
    const { data: historyData, isLoading: historyLoading } = useClientHistory(clientId || '');

    const [selectedMetric, setSelectedMetric] = useState<{
        type: MetricType | 'weight_kg' | 'composition';
        title: string;
        unit?: string;
        tabs?: { label: string; metricType: string }[];
        series?: { metricType: string; label: string; color: string }[];
    } | null>(null);

    const [activeMetricTab, setActiveMetricTab] = useState<'mediciones' | 'calculos' | 'antropometria'>('antropometria');
    const [activeMedicionTab, setActiveMedicionTab] = useState<'peso' | 'bioimpedancia' | 'pliegues' | 'diametros' | 'perimetros'>('peso');

    const getMetricsByType = (type: string, tabs?: { metricType: string }[], series?: { metricType: string }[]): ClientMetric[] => {
        // Special handling for health metrics (BP, Glucose)
        if (type === 'blood_pressure' && historyData?.client_health_metrics) {
             const metrics: ClientMetric[] = [];
             historyData.client_health_metrics.forEach(m => {
                 if (m.systolic_mmhg && m.diastolic_mmhg) {
                     metrics.push({
                         id: `bp_sys_${m.id}`,
                         client_id: m.user_id.toString(),
                         metric_type: 'systolic',
                         value: m.systolic_mmhg,
                         unit: 'mmHg',
                         date: m.recorded_at,
                         created_at: m.recorded_at,
                         updated_at: m.recorded_at
                     });
                     metrics.push({
                         id: `bp_dia_${m.id}`,
                         client_id: m.user_id.toString(),
                         metric_type: 'diastolic',
                         value: m.diastolic_mmhg,
                         unit: 'mmHg',
                         date: m.recorded_at,
                         created_at: m.recorded_at,
                         updated_at: m.recorded_at
                     });
                 }
             });
             return metrics;
        }

        if (type === 'glucose' && historyData?.client_health_metrics) {
            return historyData.client_health_metrics
                .filter(m => m.glucose_mg_dl)
                .map(m => ({
                    id: `gl_${m.id}`,
                    client_id: m.user_id.toString(),
                    metric_type: 'glucose' as MetricType,
                    value: m.glucose_mg_dl!,
                    unit: 'mg/dL',
                    date: m.recorded_at,
                    created_at: m.recorded_at,
                    updated_at: m.recorded_at
                }));
        }

        if (!client?.client_metrics) return [];
        
        if (series) {
             const types = series.map(s => s.metricType);
             return client.client_metrics.filter(m => types.includes(m.metric_type));
        }

        if (tabs) {
            const types = tabs.map(t => t.metricType);
            return client.client_metrics.filter(m => types.includes(m.metric_type));
        }

        // Map 'weight_kg' to 'weight' for filtering if needed, or keep as is if backend sends 'weight'
        const targetType = type === 'weight_kg' ? 'weight' : type; 
        return client.client_metrics.filter(m => m.metric_type === targetType);
    };



    const normalizeMetrics = (historyMetrics: ClientMetricHistory[]): ClientMetric[] => {
        const normalized: ClientMetric[] = [];
        
        historyMetrics.forEach(h => {
             const date = h.date;
             
             if (h.weight_kg) normalized.push({ id: h.id + '_w', client_id: h.user_id.toString(), metric_type: 'weight', value: parseFloat(h.weight_kg), unit: 'kg', date, created_at: h.logged_at, updated_at: h.logged_at });
             if (h.body_fat_pct) normalized.push({ id: h.id + '_bf', client_id: h.user_id.toString(), metric_type: 'body_fat', value: parseFloat(h.body_fat_pct), unit: '%', date, created_at: h.logged_at, updated_at: h.logged_at });
             if (h.muscle_mass_kg) normalized.push({ id: h.id + '_mm', client_id: h.user_id.toString(), metric_type: 'muscle_mass', value: parseFloat(h.muscle_mass_kg), unit: 'kg', date, created_at: h.logged_at, updated_at: h.logged_at });
             
             if (h.visceral_fat) normalized.push({ id: h.id + '_vf', client_id: h.user_id.toString(), metric_type: 'visceral_fat', value: parseFloat(h.visceral_fat), unit: '', date, created_at: h.logged_at, updated_at: h.logged_at });
             if (h.waist_cm) normalized.push({ id: h.id + '_waist', client_id: h.user_id.toString(), metric_type: 'waist', value: parseFloat(h.waist_cm), unit: 'cm', date, created_at: h.logged_at, updated_at: h.logged_at });
             if (h.hip_cm) normalized.push({ id: h.id + '_hip', client_id: h.user_id.toString(), metric_type: 'hips', value: parseFloat(h.hip_cm), unit: 'cm', date, created_at: h.logged_at, updated_at: h.logged_at });
             if (h.chest_cm) normalized.push({ id: h.id + '_chest', client_id: h.user_id.toString(), metric_type: 'chest', value: parseFloat(h.chest_cm), unit: 'cm', date, created_at: h.logged_at, updated_at: h.logged_at });
             if (h.arm_left_cm) normalized.push({ id: h.id + '_arml', client_id: h.user_id.toString(), metric_type: 'arm_left', value: parseFloat(h.arm_left_cm), unit: 'cm', date, created_at: h.logged_at, updated_at: h.logged_at });
             if (h.arm_right_cm) normalized.push({ id: h.id + '_armr', client_id: h.user_id.toString(), metric_type: 'arm_right', value: parseFloat(h.arm_right_cm), unit: 'cm', date, created_at: h.logged_at, updated_at: h.logged_at });
             if (h.thigh_left_cm) normalized.push({ id: h.id + '_thighl', client_id: h.user_id.toString(), metric_type: 'thigh_left', value: parseFloat(h.thigh_left_cm), unit: 'cm', date, created_at: h.logged_at, updated_at: h.logged_at });
             if (h.thigh_right_cm) normalized.push({ id: h.id + '_thighr', client_id: h.user_id.toString(), metric_type: 'thigh_right', value: parseFloat(h.thigh_right_cm), unit: 'cm', date, created_at: h.logged_at, updated_at: h.logged_at });
             if (h.calf_left_cm) normalized.push({ id: h.id + '_calfl', client_id: h.user_id.toString(), metric_type: 'calf_left', value: parseFloat(h.calf_left_cm), unit: 'cm', date, created_at: h.logged_at, updated_at: h.logged_at });
             if (h.calf_right_cm) normalized.push({ id: h.id + '_calfr', client_id: h.user_id.toString(), metric_type: 'calf_right', value: parseFloat(h.calf_right_cm), unit: 'cm', date, created_at: h.logged_at, updated_at: h.logged_at });
        });

        return normalized;
    };

    useEffect(() => {
        if (historyData) {
            const normalizedMetrics = normalizeMetrics(historyData.client_metrics || []);
            console.log('Normalized Metrics:', normalizedMetrics);
            console.log('Muscle Mass Metrics:', normalizedMetrics.filter(m => m.metric_type === 'muscle_mass'));
            
            // Helper to handle date sorting correctly
            const weightMetrics = normalizedMetrics
                .filter(m => m.metric_type === 'weight')
                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            let weightChange = 0;
            let weightChangeLabel = 'desde la última medición';

            if (weightMetrics.length > 1) {
                const latest = weightMetrics[0];
                const previous = weightMetrics[1];
                
                weightChange = latest.value - previous.value;

                // Fix Timezone issue: Parse date part only to create local date
                const previousDatePart = previous.date.split('T')[0];
                // Append T00:00:00 (without Z) to force local time interpretation
                const previousDateLocal = new Date(`${previousDatePart}T00:00:00`);

                const dateStr = format(previousDateLocal, "d 'de' MMM", { locale: es });
                weightChangeLabel = `desde el ${dateStr}`;
            }

            const mappedClient: Client = {
                id: historyData.id.toString(),
                firstName: historyData.name,
                lastName: historyData.lastname,
                email: historyData.email,
                avatar: historyData.profile_picture || `https://ui-avatars.com/api/?name=${historyData.name}+${historyData.lastname}&background=random`,
                metrics: {
                    currentWeight: historyData.client_metrics?.[0]?.weight_kg ? parseFloat(historyData.client_metrics[0].weight_kg) : 0,
                    weightUnit: 'kg', // Default or derive from somewhere
                    weightChange: weightChange,
                    weightChangeLabel: weightChangeLabel
                },
                // Enrich with dashboard specific fields if missing from API or map them
                age: 0, // Placeholder
                primaryGoal: historyData.client_goals?.find(g => g.is_primary)?.goals?.name || historyData.client_goals?.find(g => g.is_primary)?.goal_id.toString() || 'General',
                goals: historyData.client_goals?.map(g => ({
                    name: g.goals?.name || g.goal_id.toString(),
                    isPrimary: g.is_primary
                })) || [],
                medicalConditions: historyData.client_records?.[0]?.medical_conditions || '',
                experienceLevel: 'Intermedio', // Placeholder
                heightCm: historyData.client_metrics?.[0]?.height_cm ? parseFloat(historyData.client_metrics[0].height_cm) : 0,
                bmr: 0, // Calculate if possible
                tdee: 0, // Calculate if possible
                bmi: 0, // Calculate
                waistCm: historyData.client_metrics?.[0]?.waist_cm ? parseFloat(historyData.client_metrics[0].waist_cm) : 0,
                hipCm: historyData.client_metrics?.[0]?.hip_cm ? parseFloat(historyData.client_metrics[0].hip_cm) : 0,
                chestCm: historyData.client_metrics?.[0]?.chest_cm ? parseFloat(historyData.client_metrics[0].chest_cm) : 0,
                armLeftCm: historyData.client_metrics?.[0]?.arm_left_cm ? parseFloat(historyData.client_metrics[0].arm_left_cm) : 0,
                armRightCm: historyData.client_metrics?.[0]?.arm_right_cm ? parseFloat(historyData.client_metrics[0].arm_right_cm) : 0,
                thighLeftCm: historyData.client_metrics?.[0]?.thigh_left_cm ? parseFloat(historyData.client_metrics[0].thigh_left_cm) : 0,
                thighRightCm: historyData.client_metrics?.[0]?.thigh_right_cm ? parseFloat(historyData.client_metrics[0].thigh_right_cm) : 0,
                calfLeftCm: historyData.client_metrics?.[0]?.calf_left_cm ? parseFloat(historyData.client_metrics[0].calf_left_cm) : 0,
                calfRightCm: historyData.client_metrics?.[0]?.calf_right_cm ? parseFloat(historyData.client_metrics[0].calf_right_cm) : 0,
                bodyFatPct: historyData.client_metrics?.[0]?.body_fat_pct ? parseFloat(historyData.client_metrics[0].body_fat_pct) : 0,
                muscleMassKg: historyData.client_metrics?.[0]?.muscle_mass_kg ? parseFloat(historyData.client_metrics[0].muscle_mass_kg) : 0,
                visceralFatLevel: historyData.client_metrics?.[0]?.visceral_fat ? parseFloat(historyData.client_metrics[0].visceral_fat) : 0,
                injuries: [], // Map if available
                trainingEnvironment: 'Gimnasio', // Placeholder
                allergies: historyData.client_allergens?.map(a => a.allergens.name) || [],
                dislikes: historyData.client_records?.[0]?.preferences?.dislikes || [],
                sleepHoursAvg: 7, // Placeholder
                bloodPressure: (() => {
                    const latestBP = historyData.client_health_metrics
                        ?.filter(m => m.systolic_mmhg && m.diastolic_mmhg)
                        ?.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0];
                    return latestBP ? `${latestBP.systolic_mmhg}/${latestBP.diastolic_mmhg}` : '120/80';
                })(),
                glucoseLevel: (() => {
                    const latestGlucose = historyData.client_health_metrics
                        ?.filter(m => m.glucose_mg_dl)
                        ?.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0];
                    return latestGlucose?.glucose_mg_dl || 0;
                })(),
                client_metrics: normalizeMetrics(historyData.client_metrics || [])
            };
            setClient(mappedClient);
        }
    }, [historyData]);



    if (historyLoading) {
        return <div className="p-8 text-center text-gray-500">Cargando perfil del paciente...</div>;
    }

    if (!client) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">Cliente no encontrado</p>
                <button
                    onClick={() => navigate('/nutrition/clients')}
                    className="text-nutrition-600 font-medium hover:cursor-pointer"
                >
                    Volver a lista de clientes
                </button>
            </div>
        );
    }

    const visceralColor = client.visceralFatLevel < 10 ? 'bg-green-100 text-green-700' : client.visceralFatLevel < 15 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-6 bg-gray-50 min-h-screen">
            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => navigate('/nutrition/clients')}
                    className="flex items-center text-gray-500 hover:text-nutrition-600 transition-colors gap-2 group hover:cursor-pointer"
                >
                    <div className="p-2 rounded-full bg-white border border-gray-200 group-hover:border-nutrition-200 group-hover:bg-nutrition-50 transition-colors shadow-sm">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Volver a Clientes</span>
                </button>

            </div>

            {/* Main Dashboard Header */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    
                    {/* Columna Izquierda: Perfil */}
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-3xl overflow-hidden bg-gray-100 shadow-sm ring-2 ring-white shrink-0">
                            <img src={client.avatar} alt={client.firstName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 mb-0.5">{client.firstName} {client.lastName}</h1>
                            <p className="text-sm text-gray-400 mb-2 truncate max-w-[200px]">{client.email}</p>
                            <div className="flex">
                                {client.goals?.map((goal: any, index: number) => (
                                    <span 
                                        key={index}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                            goal.isPrimary 
                                                ? 'bg-nutrition-50 text-nutrition-700 border border-nutrition-100' 
                                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                                        }`}
                                    >
                                        <Target className={`w-3.5 h-3.5 ${goal.isPrimary ? 'text-nutrition-600' : 'text-gray-500'}`} />
                                        {goal.name}
                                    </span>
                                ))}
                                {(!client.goals || client.goals.length === 0) && (
                                     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
                                        <Target className="w-4 h-4 text-nutrition-600" />
                                        {client.primaryGoal}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Columna Central: Estado de Salud */}
                    <div className="flex flex-col justify-center space-y-3 px-4 md:border-x border-gray-100 py-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Estado de Salud</h4>
                        
                        {/* Lesiones */}
                        {client.injuries && client.injuries.length > 0 ? (
                            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-xl border border-red-100 text-red-700 text-sm">
                                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                                <span className="font-medium truncate">{client.injuries.length} Lesiones Activas</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-xl border border-green-100 text-green-700 text-sm">
                                <AlertTriangle className="w-4 h-4 shrink-0 text-green-500" />
                                <span className="font-medium truncate">Sin lesiones activas</span>
                            </div>
                        )}
                        
                        {/* Condiciones Médicas */}
                        <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-xl border border-purple-100 text-purple-700 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0 text-purple-500" />
                            <span className="font-medium truncate" title={client.medicalConditions || 'Sin condiciones registradas'}>
                                {client.medicalConditions || 'Sin condiciones registradas'}
                            </span>
                        </div>
                    </div>

                    {/* Columna Derecha: Métricas Metabólicas */}
                    <div className="flex gap-4 justify-end">
                        <div className="flex-1 max-w-[140px] p-3 rounded-2xl bg-orange-50/50 border border-orange-100 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-orange-600 mb-0.5">
                                <Flame className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">TMB (Basal)</span>
                            </div>
                            <p className="text-xl font-black text-gray-900">{client.bmr}</p>
                            <p className="text-[10px] text-gray-500">kcal/día</p>
                        </div>
                        <div className="flex-1 max-w-[140px] p-3 rounded-2xl bg-nutrition-50/50 border border-nutrition-100 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-nutrition-600 mb-0.5">
                                <Zap className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">TDEE (Total)</span>
                            </div>
                            <p className="text-xl font-black text-gray-900">{client.tdee}</p>
                            <p className="text-[10px] text-gray-500">kcal/día</p>
                        </div>
                    </div>

                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Section 1: Anthropometry & Composition (Visuals) - Spans 3 cols */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        {/* Tabs Header */}
                        <div className="flex space-x-6 mb-6 border-b border-gray-100 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setActiveMetricTab('mediciones')}
                                className={`pb-4 px-1 text-sm font-semibold transition-colors whitespace-nowrap ${
                                    activeMetricTab === 'mediciones'
                                        ? 'text-nutrition-600 border-b-2 border-nutrition-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Mediciones
                            </button>
                            <button
                                onClick={() => setActiveMetricTab('calculos')}
                                className={`pb-4 px-1 text-sm font-semibold transition-colors whitespace-nowrap ${
                                    activeMetricTab === 'calculos'
                                        ? 'text-nutrition-600 border-b-2 border-nutrition-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Cálculos
                            </button>
                            <button
                                onClick={() => setActiveMetricTab('antropometria')}
                                className={`pb-4 px-1 text-sm font-semibold transition-colors whitespace-nowrap ${
                                    activeMetricTab === 'antropometria'
                                        ? 'text-nutrition-600 border-b-2 border-nutrition-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Antropometría y Composición
                            </button>
                        </div>

                        {activeMetricTab === 'mediciones' && (
                            <div className="flex flex-col md:flex-row gap-6 animate-in fade-in duration-300">
                                {/* Sidebar Navigation */}
                                <div className="w-full md:w-max shrink-0 flex flex-col space-y-1">
                                    <button
                                        onClick={() => setActiveMedicionTab('peso')}
                                        className={`px-4 py-3 text-left rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                                            activeMedicionTab === 'peso'
                                                ? 'bg-nutrition-50 text-nutrition-700 border border-nutrition-100'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        Peso y Estatura
                                    </button>
                                    <button
                                        onClick={() => setActiveMedicionTab('bioimpedancia')}
                                        className={`px-4 py-3 text-left rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                                            activeMedicionTab === 'bioimpedancia'
                                                ? 'bg-nutrition-50 text-nutrition-700 border border-nutrition-100'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        Bioimpedancia
                                    </button>
                                    <button
                                        onClick={() => setActiveMedicionTab('pliegues')}
                                        className={`px-4 py-3 text-left rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                                            activeMedicionTab === 'pliegues'
                                                ? 'bg-nutrition-50 text-nutrition-700 border border-nutrition-100'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        Pliegues
                                    </button>
                                    <button
                                        onClick={() => setActiveMedicionTab('diametros')}
                                        className={`px-4 py-3 text-left rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                                            activeMedicionTab === 'diametros'
                                                ? 'bg-nutrition-50 text-nutrition-700 border border-nutrition-100'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        Diámetros
                                    </button>
                                    <button
                                        onClick={() => setActiveMedicionTab('perimetros')}
                                        className={`px-4 py-3 text-left rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                                            activeMedicionTab === 'perimetros'
                                                ? 'bg-nutrition-50 text-nutrition-700 border border-nutrition-100'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        Perímetros
                                    </button>
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 p-6 min-h-[400px]">
                                    {activeMedicionTab === 'peso' && (
                                        <div className="animate-in fade-in duration-300">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 bg-nutrition-100 text-nutrition-600 rounded-lg">
                                                    <Scale className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-gray-900">Peso y Estatura</h4>
                                                    <p className="text-sm text-gray-500">Métricas base corporales</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                                <Input
                                                    label="Peso Corporal"
                                                    type="number"
                                                    placeholder="Ej. 75.5"
                                                    rightElement={<span className="text-gray-400 text-sm font-medium mr-3">kg</span>}
                                                />
                                                <Input
                                                    label="Estatura"
                                                    type="number"
                                                    placeholder="Ej. 175"
                                                    rightElement={<span className="text-gray-400 text-sm font-medium mr-3">cm</span>}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {activeMedicionTab === 'bioimpedancia' && (
                                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 animate-in fade-in duration-300">
                                            <Zap className="w-10 h-10 mb-4 text-gray-400" />
                                            <h4 className="text-lg font-bold text-gray-900 mb-2">Análisis de Bioimpedancia</h4>
                                            <p className="max-w-md">Valores obtenidos mediante básculas de bioimpedancia eléctrica, como porcentaje de grasa, agua corporal y masa muscular.</p>
                                        </div>
                                    )}
                                    {activeMedicionTab === 'pliegues' && (
                                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 animate-in fade-in duration-300">
                                            <AlertCircle className="w-10 h-10 mb-4 text-gray-400" />
                                            <h4 className="text-lg font-bold text-gray-900 mb-2">Pliegues Cutáneos</h4>
                                            <p className="max-w-md">Medición de pliegues (bicipital, tricipital, subescapular, suprailíaco, etc.) para estimar el porcentaje de grasa corporal.</p>
                                        </div>
                                    )}
                                    {activeMedicionTab === 'diametros' && (
                                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 animate-in fade-in duration-300">
                                            <Target className="w-10 h-10 mb-4 text-gray-400" />
                                            <h4 className="text-lg font-bold text-gray-900 mb-2">Diámetros Óseos</h4>
                                            <p className="max-w-md">Registro de medidas óseas como diámetro biacromial, bicrestal, humeral y femoral para determinar la complexión física.</p>
                                        </div>
                                    )}
                                    {activeMedicionTab === 'perimetros' && (
                                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 animate-in fade-in duration-300">
                                            <Ruler className="w-10 h-10 mb-4 text-gray-400" />
                                            <h4 className="text-lg font-bold text-gray-900 mb-2">Perímetros</h4>
                                            <p className="max-w-md">Mediciones de circunferencias (cintura, cadera, brazo, muslo, etc.) útiles para evaluar distribución de masa corporal.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeMetricTab === 'calculos' && (
                            <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                                <Activity className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                                <p className="font-medium text-gray-900">Módulo de Cálculos</p>
                                <p className="text-sm mt-1">Aquí se visualizarán los cálculos y proyecciones de composición corporal.</p>
                            </div>
                        )}

                        {activeMetricTab === 'antropometria' && (
                            <div className="animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 text-blue-600 font-bold text-lg mb-6">
                                    <Scale className="w-6 h-6" />
                                    <h3>Antropometría y Composición</h3>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {/* Weight Card */}
                            <div 
                                onClick={() => setSelectedMetric({ type: 'weight', title: 'Peso Corporal', unit: client.metrics?.weightUnit })}
                                className="p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:border-green-200 hover:bg-green-50/30 transition-all"
                            >
                                <p className="text-xs text-gray-500 font-medium mb-1">Peso Actual</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{client.metrics?.currentWeight}</span>
                                    <span className="text-sm text-gray-500 mb-1">{client.metrics?.weightUnit}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg w-fit">
                                    <TrendingDown className={`w-3 h-3 ${(client.metrics?.weightChange || 0) > 0 ? 'rotate-180' : ''}`} />
                                    <span className="text-slate-700">
                                        {Math.abs(client.metrics?.weightChange || 0).toFixed(1)}kg {client.metrics?.weightChangeLabel}
                                    </span>
                                </div>
                            </div>
                            
                             {/* Height Card */}
                             <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs text-gray-500 font-medium mb-1">Estatura</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{client.heightCm}</span>
                                    <span className="text-sm text-gray-500 mb-1">cm</span>
                                </div>
                            </div>

                            {/* BMI Card */}
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs text-gray-500 font-medium mb-1">IMC</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{client.bmi}</span>
                                </div>
                                <span className="text-xs text-gray-400">Normal</span>
                            </div>

                             {/* Visceral Fat Card */}
                            <div 
                                onClick={() => setSelectedMetric({ type: 'visceral_fat', title: 'Grasa Visceral', unit: 'Nivel' })}
                                className="p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                             >
                                <p className="text-xs text-gray-500 font-medium mb-1">Grasa Visceral</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{client.visceralFatLevel}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${visceralColor}`}>
                                        {client.visceralFatLevel < 10 ? 'Saludable' : 'Riesgo'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {/* Body Composition Details */}
                            <div 
                                onClick={() => setSelectedMetric({ 
                                    type: 'composition', 
                                    title: 'Composición Corporal', 
                                    unit: '',
                                    series: [
                                        { metricType: 'body_fat', label: 'Grasa Corporal (%)', color: '#3b82f6' }, // Blue
                                        { metricType: 'muscle_mass', label: 'Masa Muscular (kg)', color: '#a855f7' } // Purple
                                    ]
                                })}
                                className="p-5 bg-blue-50/30 rounded-2xl border border-blue-100 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-blue-800">Composición</h4>
                                </div>
                                <div className="space-y-4">
                                     <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            <span className="text-sm text-gray-600">Grasa Corporal</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{client.bodyFatPct}%</span>
                                    </div>
                                    <div className="w-full bg-blue-100 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${client.bodyFatPct}%` }}></div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                            <span className="text-sm text-gray-600">Masa Muscular</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{client.muscleMassKg} kg</span>
                                    </div>
                                    <div className="w-full bg-purple-100 rounded-full h-2">
                                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                                    </div>
                                </div>
                            </div>

                             {/* Measurements */}
                             <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-gray-700">Medidas Clave</h4>
                                    <Ruler className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="space-y-3">
                                    <div 
                                        onClick={() => setSelectedMetric({ type: 'waist', title: 'Cintura', unit: 'cm' })}
                                        className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100 cursor-pointer hover:border-gray-300 transition-all"
                                    >
                                        <span className="text-sm text-gray-500">Cintura</span>
                                        <span className="font-bold text-gray-900">{client.waistCm} cm</span>
                                    </div>
                                    <div 
                                        onClick={() => setSelectedMetric({ type: 'hips', title: 'Cadera', unit: 'cm' })}
                                        className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100 cursor-pointer hover:border-gray-300 transition-all"
                                    >
                                        <span className="text-sm text-gray-500">Cadera</span>
                                        <span className="font-bold text-gray-900">{client.hipCm} cm</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100">
                                        <span className="text-sm text-gray-500">Relación C-C</span>
                                        <span className="font-bold text-gray-900">{(client.waistCm / client.hipCm).toFixed(2)}</span>
                                    </div>

                                    {/* Additional Measurements */}
                                    <div 
                                        onClick={() => setSelectedMetric({ type: 'chest', title: 'Pecho', unit: 'cm' })}
                                        className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100 cursor-pointer hover:border-gray-300 transition-all"
                                    >
                                        <span className="text-sm text-gray-500">Pecho</span>
                                        <span className="font-bold text-gray-900">{client.chestCm || '-'} cm</span>
                                    </div>

                                    <div 
                                        onClick={() => setSelectedMetric({ 
                                            type: 'arms', 
                                            title: 'Brazos', 
                                            unit: 'cm',
                                            tabs: [
                                                { label: 'Izquierdo', metricType: 'arm_left' },
                                                { label: 'Derecho', metricType: 'arm_right' }
                                            ]
                                        })}
                                        className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100 cursor-pointer hover:border-gray-300 transition-all"
                                    >
                                        <span className="text-sm text-gray-500">Brazo (I/D)</span>
                                        <span className="font-bold text-gray-900">{client.armLeftCm || '-'}/{client.armRightCm || '-'} cm</span>
                                    </div>

                                    <div 
                                        onClick={() => setSelectedMetric({ 
                                            type: 'thighs', 
                                            title: 'Muslos', 
                                            unit: 'cm',
                                            tabs: [
                                                { label: 'Izquierdo', metricType: 'thigh_left' },
                                                { label: 'Derecho', metricType: 'thigh_right' }
                                            ]
                                        })}
                                        className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100 cursor-pointer hover:border-gray-300 transition-all"
                                    >
                                        <span className="text-sm text-gray-500">Muslo (I/D)</span>
                                        <span className="font-bold text-gray-900">{client.thighLeftCm || '-'}/{client.thighRightCm || '-'} cm</span>
                                    </div>

                                    <div 
                                        onClick={() => setSelectedMetric({ 
                                            type: 'calves', 
                                            title: 'Pantorrillas', 
                                            unit: 'cm',
                                            tabs: [
                                                { label: 'Izquierda', metricType: 'calf_left' },
                                                { label: 'Derecha', metricType: 'calf_right' }
                                            ]
                                        })}
                                        className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100 cursor-pointer hover:border-gray-300 transition-all"
                                    >
                                        <span className="text-sm text-gray-500">Pantorrilla (I/D)</span>
                                        <span className="font-bold text-gray-900">{client.calfLeftCm || '-'}/{client.calfRightCm || '-'} cm</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                            </div>
                        )}
                    </div>

                    {/* Section 2: Health & Safety (Critical) */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 text-pink-600 font-bold text-lg mb-6">
                            <Activity className="w-6 h-6" />
                            <h3>Salud y Entorno</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Injuries Card */}
                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                <div className="flex items-center gap-2 text-red-700 font-bold mb-3">
                                    <AlertTriangle className="w-5 h-5" />
                                    <h4>Lesiones Activas</h4>
                                </div>
                                {client.injuries && client.injuries.length > 0 ? (
                                    client.injuries.map((injury: any) => (
                                        <div key={injury.id} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                            <span className="text-sm font-medium text-gray-800">{injury.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">Sin lesiones activas reportadas.</p>
                                )}
                            </div>



                             {/* Medical Conditions Card */}
                             <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                <div className="flex items-center gap-2 text-purple-700 font-bold mb-3">
                                    <AlertCircle className="w-5 h-5" />
                                    <h4>Condiciones Médicas</h4>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm">
                                    <p className="text-sm font-medium text-gray-800">
                                        {client.medicalConditions || 'Sin condiciones médicas registradas.'}
                                    </p>
                                </div>
                            </div>

                             {/* Environment Card */}
                             <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-2 text-gray-700 font-bold mb-3">
                                    <Home className="w-5 h-5" />
                                    <h4>Entorno de Entrenamiento</h4>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                    <p className="text-sm font-medium text-gray-800">{client.trainingEnvironment}</p>
                                    <p className="text-xs text-gray-500 mt-1">Acceso completo a maquinaria y peso libre</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Nutrition & Lifestyle Context - Sidebar Column */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
                        <div className="flex items-center gap-2 text-teal-600 font-bold text-lg mb-6">
                            <UtensilsCrossed className="w-6 h-6" />
                            <h3>Estilo de Vida</h3>
                        </div>

                         {/* Biometrics */}
                         <div className="mb-8">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Biométricos</h4>
                            <div className="space-y-3">
                                <div 
                                    onClick={() => setSelectedMetric({ 
                                        type: 'blood_pressure', 
                                        title: 'Presión Arterial', 
                                        unit: 'mmHg',
                                        series: [
                                            { metricType: 'systolic', label: 'Sistólica', color: '#ec4899' }, // Pink-500
                                            { metricType: 'diastolic', label: 'Diastólica', color: '#db2777' } // Pink-600
                                        ]
                                    })}
                                    className="flex items-center gap-3 p-3 bg-pink-50/50 rounded-2xl border border-pink-100 cursor-pointer hover:bg-pink-50 hover:border-pink-200 transition-all"
                                >
                                    <HeartPulse className="w-5 h-5 text-pink-500" />
                                    <div>
                                        <p className="text-xs text-pink-500 font-medium">Presión Arterial</p>
                                        <p className="font-bold text-gray-900">{client.bloodPressure} <span className="text-xs font-normal text-gray-400">mmHg</span></p>
                                    </div>
                                </div>
                                <div 
                                    onClick={() => setSelectedMetric({ 
                                        type: 'glucose', 
                                        title: 'Glucosa', 
                                        unit: 'mg/dL'
                                    })}
                                    className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-2xl border border-blue-100 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all"
                                >
                                    <Droplet className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-blue-500 font-medium">Glucosa (Ayuno)</p>
                                        <p className="font-bold text-gray-900">{client.glucoseLevel} <span className="text-xs font-normal text-gray-400">mg/dL</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sleep */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sueño Promedio</h4>
                                <div className="flex items-center gap-1 text-indigo-600">
                                    <Moon className="w-4 h-4" />
                                    <span className="text-sm font-bold">{client.sleepHoursAvg}h</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3">
                                <div className="bg-indigo-500 h-3 rounded-full relative" style={{ width: `${(client.sleepHoursAvg / 9) * 100}%` }}>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-right">Meta: 8h</p>
                        </div>

                        {/* Preferences */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Preferencias Alimentarias</h4>
                            
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-medium text-red-500 mb-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Alergias / Intolerancias
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {client.allergies && client.allergies.map((allergy: string) => (
                                            <span key={allergy} className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
                                                {allergy}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Aversiones (No le gusta)</p>
                                    <div className="flex flex-wrap gap-2">
                                        {client.dislikes && client.dislikes.map((dislike: string) => (
                                            <span key={dislike} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg border border-gray-200">
                                                {dislike}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
            {selectedMetric && client && (
                <MetricHistoryModal
                    isOpen={!!selectedMetric}
                    onClose={() => setSelectedMetric(null)}
                    title={selectedMetric.title}
                    metrics={getMetricsByType(selectedMetric.type, selectedMetric.tabs, selectedMetric.series)}
                    unit={selectedMetric.unit}
                    tabs={selectedMetric.tabs}
                    series={selectedMetric.series}
                />
            )}
        </div>
    );
}
