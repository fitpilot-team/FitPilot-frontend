import { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { Client } from '../../types/client';
import {
  clientMetricsApi,
  ClientMetric,
  ClientMetricSummary,
  MetricType,
} from '../../services/client-metrics';
import {
  PlusIcon,
  ChartBarIcon,
  ScaleIcon,
  FireIcon,
  TrashIcon,
  HeartIcon,
  BeakerIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface ClientContext {
  client: Client;
}

type MetricCategory = 'basic' | 'composition' | 'circumferences' | 'health' | 'nutrition' | 'skinfolds';

interface MetricTypeConfig {
  value: MetricType;
  label: string;
  unit: string;
  icon: any;
  category: MetricCategory;
}

const metricCategories = [
  { id: 'basic' as MetricCategory, label: '📏 Medidas Básicas', icon: ScaleIcon },
  { id: 'composition' as MetricCategory, label: '📊 Composición', icon: ChartBarIcon },
  { id: 'circumferences' as MetricCategory, label: '📐 Perímetros', icon: UserIcon },
  { id: 'health' as MetricCategory, label: '🩺 Salud', icon: HeartIcon },
  { id: 'nutrition' as MetricCategory, label: '🍎 Nutrición', icon: FireIcon },
  { id: 'skinfolds' as MetricCategory, label: '📏 Pliegues', icon: ClipboardDocumentListIcon },
];

export function ClientMetricsPage() {
  const { client } = useOutletContext<ClientContext>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [metrics, setMetrics] = useState<ClientMetric[]>([]);
  const [summaries, setSummaries] = useState<ClientMetricSummary[]>([]);
  const [activeCategory, setActiveCategory] = useState<MetricCategory>('basic');

  // State for batch entry
  const [formValues, setFormValues] = useState<Partial<Record<MetricType, string>>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const inputRefs = useRef<Partial<Record<MetricType, HTMLInputElement>>>({});

  const metricTypes: MetricTypeConfig[] = [
    // Basic Measurements
    { value: 'weight', label: 'Peso', unit: 'kg', icon: ScaleIcon, category: 'basic' },
    { value: 'height', label: 'Altura', unit: 'cm', icon: ArrowTrendingUpIcon, category: 'basic' },
    { value: 'bmi', label: 'IMC', unit: 'kg/m²', icon: ChartBarIcon, category: 'basic' },

    // Body Composition
    { value: 'body_fat', label: 'Grasa Corporal', unit: '%', icon: FireIcon, category: 'composition' },
    { value: 'muscle_mass', label: 'Masa Muscular', unit: 'kg', icon: ChartBarIcon, category: 'composition' },
    { value: 'body_water', label: 'Agua Corporal', unit: '%', icon: BeakerIcon, category: 'composition' },
    { value: 'bone_mass', label: 'Masa Ósea', unit: 'kg', icon: ChartBarIcon, category: 'composition' },
    { value: 'visceral_fat', label: 'Grasa Visceral', unit: 'nivel', icon: FireIcon, category: 'composition' },

    // Circumferences
    { value: 'chest', label: 'Pecho', unit: 'cm', icon: ChartBarIcon, category: 'circumferences' },
    { value: 'waist', label: 'Cintura', unit: 'cm', icon: ChartBarIcon, category: 'circumferences' },
    { value: 'hips', label: 'Cadera', unit: 'cm', icon: ChartBarIcon, category: 'circumferences' },
    { value: 'arms', label: 'Brazos', unit: 'cm', icon: ChartBarIcon, category: 'circumferences' },
    { value: 'upper_arm', label: 'Brazo Superior', unit: 'cm', icon: ChartBarIcon, category: 'circumferences' },
    { value: 'lower_arm', label: 'Antebrazo', unit: 'cm', icon: ChartBarIcon, category: 'circumferences' },
    { value: 'thighs', label: 'Muslos', unit: 'cm', icon: ChartBarIcon, category: 'circumferences' },
    { value: 'calf', label: 'Pantorrillas', unit: 'cm', icon: ChartBarIcon, category: 'circumferences' },
    { value: 'neck', label: 'Cuello', unit: 'cm', icon: ChartBarIcon, category: 'circumferences' },
    { value: 'shoulders', label: 'Hombros', unit: 'cm', icon: ChartBarIcon, category: 'circumferences' },
    { value: 'forearm', label: 'Antebrazo', unit: 'cm', icon: ChartBarIcon, category: 'circumferences' },
    { value: 'abdominal', label: 'Abdomen', unit: 'cm', icon: ChartBarIcon, category: 'circumferences' },

    // Health Metrics
    { value: 'resting_hr', label: 'FC Reposo', unit: 'bpm', icon: HeartIcon, category: 'health' },
    { value: 'blood_pressure_sys', label: 'Presión Sistólica', unit: 'mmHg', icon: HeartIcon, category: 'health' },
    { value: 'blood_pressure_dia', label: 'Presión Diastólica', unit: 'mmHg', icon: HeartIcon, category: 'health' },

    // Nutritional Metrics
    { value: 'bmr', label: 'Metabolismo Basal', unit: 'kcal', icon: FireIcon, category: 'nutrition' },
    { value: 'tdee', label: 'Gasto Total Diario', unit: 'kcal', icon: FireIcon, category: 'nutrition' },
    { value: 'target_calories', label: 'Calorías Objetivo', unit: 'kcal', icon: FireIcon, category: 'nutrition' },
    { value: 'protein_intake', label: 'Proteína', unit: 'g', icon: BeakerIcon, category: 'nutrition' },
    { value: 'carb_intake', label: 'Carbohidratos', unit: 'g', icon: BeakerIcon, category: 'nutrition' },
    { value: 'fat_intake', label: 'Grasas', unit: 'g', icon: BeakerIcon, category: 'nutrition' },

    // Skinfold Measurements
    { value: 'triceps_skinfold', label: 'Pliegue Tricipital', unit: 'mm', icon: ClipboardDocumentListIcon, category: 'skinfolds' },
    { value: 'subscapular_skinfold', label: 'Pliegue Subescapular', unit: 'mm', icon: ClipboardDocumentListIcon, category: 'skinfolds' },
    { value: 'suprailiac_skinfold', label: 'Pliegue Suprailiaco', unit: 'mm', icon: ClipboardDocumentListIcon, category: 'skinfolds' },
    { value: 'abdominal_skinfold', label: 'Pliegue Abdominal', unit: 'mm', icon: ClipboardDocumentListIcon, category: 'skinfolds' },
    { value: 'thigh_skinfold', label: 'Pliegue del Muslo', unit: 'mm', icon: ClipboardDocumentListIcon, category: 'skinfolds' },
  ];

  const filteredMetricTypes = metricTypes.filter(mt => mt.category === activeCategory);

  const loadData = useCallback(async () => {
    try {
      const [metricsResponse, summaryResponse] = await Promise.all([
        clientMetricsApi.getMetrics(client.id),
        clientMetricsApi.getSummary(client.id),
      ]);
      setMetrics(metricsResponse.metrics);
      setSummaries(summaryResponse);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [client.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  const handleSaveBatch = async () => {
    const entriesToSave = Object.entries(formValues)
      .filter(([_, value]) => value && value.trim() !== '')
      .map(([type, value]) => ({
        type: type as MetricType,
        value: parseFloat(value),
        unit: metricTypes.find(mt => mt.value === type)?.unit || '',
      }));

    if (entriesToSave.length === 0) {
      toast.error('Ingresa al menos un valor para guardar');
      return;
    }

    setIsSaving(true);
    try {
      const promises = entriesToSave.map(entry =>
        clientMetricsApi.createMetric(client.id, {
          metric_type: entry.type,
          value: entry.value,
          unit: entry.unit,
          date: date,
        })
      );

      await Promise.all(promises);
      toast.success(`${entriesToSave.length} mediciones guardadas correctamente`);

      // Clear saved values only
      setFormValues({});
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar las mediciones');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (type: MetricType, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleDeleteMetric = async (metricId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta medición?')) return;
    try {
      await clientMetricsApi.deleteMetric(metricId);
      toast.success('Medición eliminada');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar');
    }
  };


  const getSummaryForType = (type: MetricType) => {
    return summaries.find((s) => s.metric_type === type);
  };

  const getSummariesByCategory = (category: MetricCategory) => {
    const categoryMetrics = metricTypes.filter(mt => mt.category === category);
    return categoryMetrics
      .map(mt => getSummaryForType(mt.value))
      .filter(s => s && s.latest_value !== null);
  };

  const handleCategoryChange = (category: MetricCategory) => {
    setActiveCategory(category);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Métricas y Mediciones</h1>
        <p className="mt-1 text-gray-600">
          Seguimiento de progreso y mediciones antropométricas de {client.full_name}
        </p>
      </div>

      {/* Main Entry Card */}
      <Card className="bg-gradient-to-br from-primary-50 to-white border-primary-200" hover={false}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlusIcon className="h-6 w-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Registrar Mediciones</h3>
            </div>
            {/* Date Input common for all */}
            <div className="w-48">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {metricCategories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${activeCategory === cat.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </motion.button>
            ))}
          </div>

          {/* Batch Input Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMetricTypes.map((typeConfig) => (
                  <div key={typeConfig.value} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <typeConfig.icon className="h-4 w-4 text-gray-400" />
                      {typeConfig.label}
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        step="0.01"
                        ref={el => { if (el) inputRefs.current[typeConfig.value] = el; }}
                        value={formValues[typeConfig.value] || ''}
                        onChange={(e) => handleInputChange(typeConfig.value, e.target.value)}
                        className="block w-full rounded-lg border-gray-300 pl-3 pr-12 focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5"
                        placeholder="0.0"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm">{typeConfig.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end pt-4 border-t border-gray-100">
                <Button
                  variant="primary"
                  onClick={handleSaveBatch}
                  isLoading={isSaving}
                  className="min-w-40"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>

      {/* Data Visualization Section */}
      <div className="space-y-8">

        {/* Metrics Summary by Category */}
        {metricCategories.map((category) => {
          const categorySummaries = getSummariesByCategory(category.id);
          if (categorySummaries.length === 0) return null;

          return (
            <div key={category.id} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <category.icon className="h-5 w-5 text-primary-600" />
                {category.label}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categorySummaries.map((summary) => {
                  if (!summary) return null;
                  const config = metricTypes.find(mt => mt.value === summary.metric_type);
                  return (
                    <motion.div
                      key={summary.metric_type}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card hover className="h-full">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">{config?.label}</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {summary.latest_value} <span className="text-lg text-gray-500">{summary.unit}</span>
                            </p>
                            {summary.change_from_previous !== null && summary.change_from_previous !== undefined ? (
                              <div className={`flex items-center gap-1 text-xs mt-1 ${summary.change_from_previous > 0 ? 'text-orange-600' : 'text-green-600'
                                }`}>
                                {summary.change_from_previous > 0 ? (
                                  <ArrowTrendingUpIcon className="h-3 w-3" />
                                ) : (
                                  <ArrowTrendingDownIcon className="h-3 w-3" />
                                )}
                                {Math.abs(summary.change_from_previous).toFixed(1)} {summary.unit}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 mt-1">
                                {summary.latest_date ? format(new Date(summary.latest_date), 'dd/MM/yyyy') : ''}
                              </p>
                            )}
                          </div>
                          {config && (
                            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                              <config.icon className="h-5 w-5 text-primary-600" />
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Measurement History */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Historial de Mediciones</h3>
            <div className="text-sm text-gray-500">
              Mostrando todas las mediciones ordenadas por fecha
            </div>
          </div>

          {metrics.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <ScaleIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 font-medium">No hay mediciones registradas aún</p>
              <p className="text-sm text-gray-400 mt-1">Comienza agregando los datos en el panel superior</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {metrics.map((metric) => {
                      const config = metricTypes.find(t => t.value === metric.metric_type);
                      const category = metricCategories.find(c => c.id === config?.category);

                      return (
                        <motion.tr
                          key={metric.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-gray-900 whitespace-nowrap">
                            {format(new Date(metric.date), 'dd/MM/yyyy')}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {category?.label.replace(/.\s/, '') || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                            {config?.label || metric.metric_type}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {metric.value} <span className="text-gray-500 text-xs">{metric.unit}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteMetric(metric.id)}
                              className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                              title="Eliminar registro"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
