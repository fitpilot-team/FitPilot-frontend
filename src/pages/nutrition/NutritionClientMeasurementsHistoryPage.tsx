import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClientMetricsQuery, useClientHealthMetricsQuery, useClientHistory } from '@/features/client-history/queries';
import { ArrowLeft, ChevronLeft, ChevronRight, Scale, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function NutritionClientMeasurementsHistoryPage() {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const limit = 20;

    const { data: clientData, isLoading: clientLoading } = useClientHistory(clientId);
    const { data: metricsData, isLoading: metricsLoading } = useClientMetricsQuery(clientId, page, limit);
    const { data: healthData, isLoading: healthLoading } = useClientHealthMetricsQuery(clientId, page, limit);

    // Assuming the API returns a paginated structure. Standardizing to common structure if it exists:
    // This part might need adjustment based on how NestJS returns pagination (e.g. { data: [], total: x, page: y })
    // If not, we will assume metricsData is the array, or metricsData.data is the array.
    const metricsItems = metricsData?.data || (Array.isArray(metricsData) ? metricsData : metricsData?.items || []);
    const healthItems = healthData?.data || (Array.isArray(healthData) ? healthData : healthData?.items || []);
    
    // Combining arrays simply for visual. In a real scenario, you probably want two separate tables or a unified view.
    // Let's create two tabs to show them or show them side-by-side if they're separated APIs and paginations.
    const [activeTab, setActiveTab] = useState<'metrics' | 'health'>('metrics');

    const totalMetricsPages = metricsData?.meta?.totalPages || metricsData?.totalPages || Math.ceil((metricsData?.totalItems || metricsData?.total || metricsItems.length) / limit) || 1;
    const totalHealthPages = healthData?.meta?.totalPages || healthData?.totalPages || Math.ceil((healthData?.totalItems || healthData?.total || healthItems.length) / limit) || 1;
    const currentTotalPages = activeTab === 'metrics' ? totalMetricsPages : totalHealthPages;

    const isLoading = clientLoading || metricsLoading || healthLoading;

    if (isLoading && page === 1) {
        return (
            <div className="p-8 text-center text-gray-500 animate-pulse">
                Cargando historial completo de mediciones...
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-6 bg-gray-50 min-h-screen">
            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => navigate(`/nutrition/clients/${clientId}/medical-history`)}
                    className="flex items-center text-gray-500 hover:text-nutrition-600 transition-colors gap-2 group hover:cursor-pointer"
                >
                    <div className="p-2 rounded-full bg-white border border-gray-200 group-hover:border-nutrition-200 group-hover:bg-nutrition-50 transition-colors shadow-sm">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Volver al Historial Médico</span>
                </button>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="mb-6 border-b border-gray-100 pb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Historial Completo de Mediciones</h1>
                    <p className="text-gray-500 mt-2">
                        Paciente: <span className="font-semibold text-gray-700">{clientData?.name} {clientData?.lastname}</span>
                    </p>
                </div>

                <div className="flex space-x-4 mb-6 border-b border-gray-100 overflow-x-auto no-scrollbar pb-2">
                    <button
                        onClick={() => { setActiveTab('metrics'); setPage(1); }}
                        className={`flex items-center gap-2 pb-2 px-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                            activeTab === 'metrics'
                                ? 'text-nutrition-600 border-b-2 border-nutrition-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Scale className="w-4 h-4" />
                        Métricas Corporales
                    </button>
                    <button
                        onClick={() => { setActiveTab('health'); setPage(1); }}
                        className={`flex items-center gap-2 pb-2 px-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                            activeTab === 'health'
                                ? 'text-pink-600 border-b-2 border-pink-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Activity className="w-4 h-4" />
                        Métricas de Salud
                    </button>
                </div>

                {activeTab === 'metrics' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                                    <th className="py-4 px-4 font-medium rounded-tl-xl">Fecha</th>
                                    <th className="py-4 px-4 font-medium text-right">Peso (kg)</th>
                                    <th className="py-4 px-4 font-medium text-right">Grasa (%)</th>
                                    <th className="py-4 px-4 font-medium text-right">Masa Musc. (kg)</th>
                                    <th className="py-4 px-4 font-medium text-right">Cintura / Cadera</th>
                                    <th className="py-4 px-4 font-medium text-right rounded-tr-xl">Grasa Visc.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {metricsItems.length > 0 ? (
                                    metricsItems.map((record: any, idx: number) => (
                                        <tr key={record.id || idx} className="hover:bg-gray-50 transition-colors group">
                                            <td className="py-4 px-4 text-gray-500 whitespace-nowrap font-medium">
                                                {format(new Date(record.date || record.logged_at || record.created_at), "dd MMM yyyy", { locale: es })}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="font-bold text-gray-900">{record.weight_kg ? Number(record.weight_kg).toFixed(1) : '-'}</span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="font-bold text-gray-900">{record.body_fat_pct ? Number(record.body_fat_pct).toFixed(1) : '-'}</span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="font-bold text-gray-900">{record.muscle_mass_kg ? Number(record.muscle_mass_kg).toFixed(1) : '-'}</span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="font-medium text-gray-700">{record.waist_cm || '-'} / {record.hip_cm || '-'}</span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="font-medium text-gray-700">{record.visceral_fat || '-'}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-400">No hay métricas corporales registradas.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                                    <th className="py-4 px-4 font-medium rounded-tl-xl">Fecha</th>
                                    <th className="py-4 px-4 font-medium text-right">Glucosa (mg/dL)</th>
                                    <th className="py-4 px-4 font-medium text-right">Presión (mmHg)</th>
                                    <th className="py-4 px-4 font-medium text-right">Ritmo Cardíaco (bpm)</th>
                                    <th className="py-4 px-4 font-medium text-left rounded-tr-xl">Notas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {healthItems.length > 0 ? (
                                    healthItems.map((record: any, idx: number) => (
                                        <tr key={record.id || idx} className="hover:bg-gray-50 transition-colors group">
                                            <td className="py-4 px-4 text-gray-500 whitespace-nowrap font-medium">
                                                {format(new Date(record.recorded_at || record.created_at), "dd MMM yyyy", { locale: es })}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="font-bold text-gray-900">{record.glucose_mg_dl || '-'}</span>
                                                {record.glucose_context && <span className="text-xs text-gray-400 block">{record.glucose_context}</span>}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="font-bold text-gray-900">
                                                    {record.systolic_mmhg && record.diastolic_mmhg ? `${record.systolic_mmhg}/${record.diastolic_mmhg}` : '-'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="font-medium text-gray-700">{record.heart_rate_bpm || '-'}</span>
                                            </td>
                                            <td className="py-4 px-4 text-left">
                                                <span className="text-sm text-gray-600 line-clamp-2 max-w-xs" title={record.notes || ''}>{record.notes || '-'}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-gray-400">No hay métricas de salud registradas.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500 font-medium">
                        Página {page} de {currentTotalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1 || isLoading}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="flex items-center justify-center p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            disabled={page >= currentTotalPages || isLoading}
                            onClick={() => setPage(p => p + 1)}
                            className="flex items-center justify-center p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
