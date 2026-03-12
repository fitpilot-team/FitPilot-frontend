import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, Calendar, X } from "lucide-react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { ClientMetric } from "@/services/client-metrics";
import { ClientHealthMetric } from "@/features/client-history/types";
import { DatePicker } from "@/components/common/DatePicker";

interface MeasurementRecordMetric {
  id: string;
  metric_type: ClientMetric["metric_type"];
  value: number | string;
  unit: string;
  date: string;
}

interface MeasurementRecord {
  rawDate: string;
  metrics: MeasurementRecordMetric[];
}

interface MeasurementHistoryPoint {
  rawDate: string;
  date: string;
  fullDate: string;
  unit: string;
  value?: number;
  systolic?: number;
  diastolic?: number;
}

interface MeasurementDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: MeasurementRecord | null;
  historyMetrics: ClientMetric[];
  healthMetrics: ClientHealthMetric[];
}

type TimeFilter = "all" | "1d" | "1w" | "1m" | "custom";

const typeLabels: Record<ClientMetric["metric_type"], string> = {
  weight: "Peso",
  body_fat: "Grasa Corporal",
  upper_body_fat: "Grasa Corporal Superior",
  lower_body_fat: "Grasa Corporal Inferior",
  fat_free_mass: "Masa Libre de Grasa",
  muscle_mass: "Masa Muscular",
  bone_mass: "Masa Osea",
  body_water: "Agua Corporal",
  metabolic_age: "Edad Metabolica",
  visceral_fat: "Grasa Visceral",
  waist: "Cintura",
  hips: "Cadera",
  blood_pressure: "Presion Arterial",
  glucose: "Glucosa",
  chest: "Pecho",
  cephalic: "Cefalico",
  neck: "Cuello",
  mesosternal: "Mesoesternal",
  umbilical: "Umbilical",
  biacromial: "Biacromial",
  biiliocrestal: "Biiliocrestal",
  foot_length: "Longitud del Pie",
  thorax_transverse: "Transverso del Torax",
  thorax_anteroposterior: "Anteroposterior del Torax",
  humerus_biepicondylar: "Humero",
  wrist_bistyloid: "Biestiloideo de la Muneca",
  femur_biepicondylar: "Femur",
  bimaleolar: "Bimaleolar",
  foot_transverse: "Transverso del Pie",
  hand_length: "Longitud de la Mano",
  hand_transverse: "Transverso de la Mano",
  arm_left: "Brazo Izquierdo",
  arm_right: "Brazo Derecho",
  relaxed_arm_midpoint: "Mitad del Brazo Relajado",
  contracted_arm_midpoint: "Mitad del Brazo Contraido",
  forearm: "Antebrazo",
  wrist: "Muneca",
  thigh_left: "Muslo Izquierdo",
  thigh_right: "Muslo Derecho",
  mid_thigh: "Muslo Medio",
  calf: "Pantorrilla",
  calf_left: "Pantorrilla Izquierda",
  calf_right: "Pantorrilla Derecha",
  subscapular_fold: "Subescapular",
  triceps_fold: "Triceps",
  biceps_fold: "Biceps",
  iliac_crest_fold: "Cresta Iliaca",
  supraspinal_fold: "Supraespinal",
  abdominal_fold: "Abdominal",
  front_thigh_fold: "Muslo Frontal",
  medial_calf_fold: "Pantorrilla Medial",
  mid_axillary_fold: "Axilar Medial",
  pectoral_fold: "Pectoral",
  arms: "Brazos",
  thighs: "Muslos",
  calves: "Pantorrillas",
  systolic: "Sistolica",
  diastolic: "Diastolica",
  heart_rate: "Frecuencia Cardiaca",
  oxygen_saturation: "Saturacion de Oxigeno",
};

const metricColors: Partial<Record<ClientMetric["metric_type"], string>> = {
  weight: "#0f766e",
  body_fat: "#2563eb",
  upper_body_fat: "#60a5fa",
  lower_body_fat: "#1d4ed8",
  fat_free_mass: "#8b5cf6",
  muscle_mass: "#7c3aed",
  bone_mass: "#a78bfa",
  body_water: "#06b6d4",
  metabolic_age: "#f59e0b",
  visceral_fat: "#ea580c",
  waist: "#0f766e",
  hips: "#0f766e",
  chest: "#0f766e",
  cephalic: "#0f766e",
  neck: "#0f766e",
  mesosternal: "#0f766e",
  umbilical: "#0f766e",
  biacromial: "#0f766e",
  biiliocrestal: "#0f766e",
  foot_length: "#0f766e",
  thorax_transverse: "#0f766e",
  thorax_anteroposterior: "#0f766e",
  humerus_biepicondylar: "#0f766e",
  wrist_bistyloid: "#0f766e",
  femur_biepicondylar: "#0f766e",
  bimaleolar: "#0f766e",
  foot_transverse: "#0f766e",
  hand_length: "#0f766e",
  hand_transverse: "#0f766e",
  arm_left: "#0f766e",
  arm_right: "#0f766e",
  relaxed_arm_midpoint: "#0f766e",
  contracted_arm_midpoint: "#0f766e",
  forearm: "#0f766e",
  wrist: "#0f766e",
  thigh_left: "#0f766e",
  thigh_right: "#0f766e",
  mid_thigh: "#0f766e",
  calf: "#0f766e",
  calf_left: "#0f766e",
  calf_right: "#0f766e",
  glucose: "#0284c7",
  heart_rate: "#e11d48",
  oxygen_saturation: "#0891b2",
};

const parseMetricDate = (dateValue: string) => {
  const datePart = dateValue.split("T")[0];
  return new Date(`${datePart}T00:00:00`);
};

const formatMetricValue = (value: number | string) => {
  if (typeof value !== "number") return value;
  return value % 1 !== 0 ? value.toFixed(1) : value.toString();
};

export function MeasurementDetailsModal({
  isOpen,
  onClose,
  record,
  historyMetrics,
  healthMetrics,
}: MeasurementDetailsModalProps) {
  const [selectedMetric, setSelectedMetric] =
    useState<MeasurementRecordMetric | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedMetric(null);
      setHoveredDate(null);
      setTimeFilter("all");
      setCustomStartDate("");
      setCustomEndDate("");
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedMetric(null);
    setHoveredDate(null);
    setTimeFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
  }, [record?.rawDate]);

  if (!record) return null;

  const selectedMetricLabel = selectedMetric
    ? typeLabels[selectedMetric.metric_type] || selectedMetric.metric_type
    : "";
  const selectedDate = format(
    parseMetricDate(record.rawDate),
    "dd 'de' MMMM, yyyy",
    { locale: es },
  );
  const selectedDateKey = format(parseMetricDate(record.rawDate), "yyyy-MM-dd");

  const buildSingleMetricHistory = (
    metricType: ClientMetric["metric_type"],
  ) => {
    const metricsByDate = new Map<string, MeasurementHistoryPoint>();
    const sourceMetrics =
      metricType === "glucose"
        ? healthMetrics
            .filter((metric) => metric.glucose_mg_dl !== null)
            .map((metric) => ({
              date: metric.recorded_at,
              value: metric.glucose_mg_dl as number,
              unit: "mg/dL",
            }))
        : metricType === "heart_rate"
          ? healthMetrics
              .filter((metric) => metric.heart_rate_bpm !== null)
              .map((metric) => ({
                date: metric.recorded_at,
                value: metric.heart_rate_bpm as number,
                unit: "bpm",
              }))
          : metricType === "oxygen_saturation"
            ? healthMetrics
                .filter((metric) => metric.oxygen_saturation_pct !== null)
                .map((metric) => ({
                  date: metric.recorded_at,
                  value: Number(metric.oxygen_saturation_pct),
                  unit: "%",
                }))
            : historyMetrics
                .filter((metric) => metric.metric_type === metricType)
                .map((metric) => ({
                  date: metric.date,
                  value: metric.value,
                  unit: metric.unit,
                }));

    sourceMetrics
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((metric) => {
        const localDate = parseMetricDate(metric.date);
        const dateKey = format(localDate, "yyyy-MM-dd");

        metricsByDate.set(dateKey, {
          rawDate: dateKey,
          date: format(localDate, "dd MMM", { locale: es }),
          fullDate: format(localDate, "dd 'de' MMMM, yyyy", { locale: es }),
          value: metric.value,
          unit: metric.unit,
        });
      });

    return Array.from(metricsByDate.values()).sort((a, b) =>
      a.rawDate.localeCompare(b.rawDate),
    );
  };

  const buildBloodPressureHistory = () => {
    const metricsByDate = new Map<string, MeasurementHistoryPoint>();

    healthMetrics
      .filter(
        (metric) =>
          metric.systolic_mmhg !== null && metric.diastolic_mmhg !== null,
      )
      .sort(
        (a, b) =>
          new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
      )
      .forEach((metric) => {
        const localDate = parseMetricDate(metric.recorded_at);
        const dateKey = format(localDate, "yyyy-MM-dd");

        metricsByDate.set(dateKey, {
          rawDate: dateKey,
          date: format(localDate, "dd MMM", { locale: es }),
          fullDate: format(localDate, "dd 'de' MMMM, yyyy", { locale: es }),
          systolic: metric.systolic_mmhg ?? undefined,
          diastolic: metric.diastolic_mmhg ?? undefined,
          unit: "mmHg",
        });
      });

    return Array.from(metricsByDate.values()).sort((a, b) =>
      a.rawDate.localeCompare(b.rawDate),
    );
  };

  const metricHistory = selectedMetric
    ? selectedMetric.metric_type === "blood_pressure"
      ? buildBloodPressureHistory()
      : buildSingleMetricHistory(selectedMetric.metric_type)
    : [];

  const filteredMetricHistory = (() => {
    if (metricHistory.length === 0) return [];

    if (timeFilter === "custom") {
      return metricHistory.filter((point) => {
        const matchesStart =
          !customStartDate || point.rawDate >= customStartDate;
        const matchesEnd = !customEndDate || point.rawDate <= customEndDate;
        return matchesStart && matchesEnd;
      });
    }

    if (timeFilter === "all") return metricHistory;

    const latestPointDate = parseMetricDate(
      metricHistory[metricHistory.length - 1].rawDate,
    );
    const daysBack = timeFilter === "1d" ? 0 : timeFilter === "1w" ? 6 : 29;
    const startDate = subDays(latestPointDate, daysBack);

    return metricHistory.filter((point) => {
      const pointDate = parseMetricDate(point.rawDate);
      return pointDate >= startDate && pointDate <= latestPointDate;
    });
  })();

  const chartColor = selectedMetric
    ? metricColors[selectedMetric.metric_type] || "#0f766e"
    : "#0f766e";

  const overviewContent = (
    <>
      <div className="flex-1 overflow-y-auto bg-gray-50/60 px-5 py-5 sm:px-6 sm:py-6">
        <div className="mb-5 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          Selecciona una medicion para ver su grafica e historial completo.
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {record.metrics.map((metric) => (
            <button
              key={metric.id}
              type="button"
              onClick={() => {
                setSelectedMetric(metric);
                setHoveredDate(null);
                setTimeFilter("all");
                setCustomStartDate("");
                setCustomEndDate("");
              }}
              className="flex min-h-[116px] flex-col justify-between rounded-3xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nutrition-300"
            >
              <span className="text-sm font-medium text-gray-500">
                {typeLabels[metric.metric_type] || metric.metric_type}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold text-gray-950">
                  {formatMetricValue(metric.value)}
                </span>
                {metric.unit ? (
                  <span className="text-sm font-medium text-gray-400">
                    {metric.unit}
                  </span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 justify-end border-t border-gray-100 bg-white px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nutrition-300"
        >
          Cerrar detalle
        </button>
      </div>
    </>
  );

  const detailContent = (
    <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden bg-gray-50/60 p-4 sm:grid-cols-[minmax(0,1.8fr)_minmax(280px,360px)] sm:p-6">
      <section className="flex min-h-0 flex-col rounded-[28px] border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Registro seleccionado
            </p>
            <p className="mt-1 flex items-baseline gap-2 text-3xl font-semibold text-gray-950">
              <span>{formatMetricValue(selectedMetric?.value ?? "")}</span>
              {selectedMetric?.unit ? (
                <span className="text-base font-medium text-gray-400">
                  {selectedMetric.unit}
                </span>
              ) : null}
            </p>
          </div>

          <div className="inline-flex rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600">
            {selectedDate}
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 border-b border-gray-100 pb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Todo" },
              { id: "1d", label: "1 dia" },
              { id: "1w", label: "1 semana" },
              { id: "1m", label: "1 mes" },
              { id: "custom", label: "Rango" },
            ].map((filterOption) => (
              <button
                key={filterOption.id}
                type="button"
                onClick={() => setTimeFilter(filterOption.id as TimeFilter)}
                aria-pressed={timeFilter === filterOption.id}
                className={`rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nutrition-300 ${
                  timeFilter === filterOption.id
                    ? "bg-nutrition-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>

          {timeFilter === "custom" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
              <DatePicker
                label="Desde"
                value={customStartDate}
                onChange={setCustomStartDate}
                maxDate={customEndDate || undefined}
              />
              <DatePicker
                label="Hasta"
                value={customEndDate}
                onChange={setCustomEndDate}
                minDate={customStartDate || undefined}
              />
            </div>
          ) : null}
        </div>

        <div className="min-h-[320px] flex-1">
          {filteredMetricHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {selectedMetric?.metric_type === "blood_pressure" ? (
                <AreaChart data={filteredMetricHistory}>
                  <defs>
                    <linearGradient
                      id="pressureSystolic"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#ef4444"
                        stopOpacity={0.18}
                      />
                      <stop
                        offset="95%"
                        stopColor="#ef4444"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="#eef2f7"
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    width={48}
                    domain={["dataMin - 5", "dataMax + 5"]}
                  />
                  <Tooltip
                    cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const point = payload[0]
                        .payload as MeasurementHistoryPoint;
                      return (
                        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            {point.fullDate}
                          </p>
                          <div className="mt-2 space-y-1 text-sm">
                            <p className="font-semibold text-red-500">
                              Sistolica: {point.systolic} mmHg
                            </p>
                            <p className="font-semibold text-orange-500">
                              Diastolica: {point.diastolic} mmHg
                            </p>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="systolic"
                    stroke="#ef4444"
                    fill="url(#pressureSystolic)"
                    strokeWidth={3}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ r: 0 }}
                    activeDot={{ r: 5 }}
                  />
                  {hoveredDate ? (
                    <ReferenceLine
                      x={hoveredDate}
                      stroke="#cbd5e1"
                      strokeDasharray="4 4"
                    />
                  ) : null}
                </AreaChart>
              ) : (
                <AreaChart data={filteredMetricHistory}>
                  <defs>
                    <linearGradient
                      id="measurementHistoryFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={chartColor}
                        stopOpacity={0.18}
                      />
                      <stop
                        offset="95%"
                        stopColor={chartColor}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="#eef2f7"
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    width={48}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const point = payload[0]
                        .payload as MeasurementHistoryPoint;
                      return (
                        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            {point.fullDate}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-gray-900">
                            {formatMetricValue(point.value ?? 0)} {point.unit}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={chartColor}
                    fill="url(#measurementHistoryFill)"
                    strokeWidth={3}
                    activeDot={{ r: 5 }}
                  />
                  {hoveredDate ? (
                    <ReferenceLine
                      x={hoveredDate}
                      stroke="#cbd5e1"
                      strokeDasharray="4 4"
                    />
                  ) : null}
                </AreaChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-gray-50 px-6 text-center text-sm text-gray-500">
              {metricHistory.length === 0
                ? "No hay historial suficiente para graficar esta medicion."
                : "No hay registros dentro del rango seleccionado."}
            </div>
          )}
        </div>
      </section>

      <aside className="flex min-h-0 flex-col rounded-[28px] border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 border-b border-gray-100 pb-4">
          <h4 className="text-sm font-semibold text-gray-900">
            Historial de registros
          </h4>
          <p className="mt-1 text-xs text-gray-500">
            {filteredMetricHistory.length} registro
            {filteredMetricHistory.length === 1 ? "" : "s"} en el filtro actual.
          </p>
        </div>

        <div className="space-y-2 overflow-y-auto pr-1">
          {filteredMetricHistory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              No hay registros para las fechas seleccionadas.
            </div>
          ) : (
            [...filteredMetricHistory].reverse().map((point) => {
              const isSelectedDate = point.rawDate === selectedDateKey;

              return (
                <div
                  key={`${selectedMetric?.metric_type}-${point.rawDate}`}
                  onMouseEnter={() => setHoveredDate(point.date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  className={`rounded-2xl border px-4 py-3 transition-colors ${
                    isSelectedDate
                      ? "border-nutrition-200 bg-nutrition-50"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {point.fullDate}
                      </p>
                      {isSelectedDate ? (
                        <span className="mt-1 inline-flex rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-nutrition-700">
                          Registro seleccionado
                        </span>
                      ) : null}
                    </div>

                    {selectedMetric?.metric_type === "blood_pressure" ? (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-500">
                          {point.systolic}{" "}
                          <span className="text-xs font-medium text-gray-400">
                            sys
                          </span>
                        </p>
                        <p className="text-sm font-semibold text-orange-500">
                          {point.diastolic}{" "}
                          <span className="text-xs font-medium text-gray-400">
                            dia
                          </span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">
                        {formatMetricValue(point.value ?? 0)}{" "}
                        <span className="text-xs font-medium text-gray-400">
                          {point.unit}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="flex h-[min(88vh,820px)] w-[min(92vw,1180px)] transform flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl transition-all">
                <div className="flex shrink-0 items-start justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
                  <div className="flex min-w-0 items-start gap-3">
                    {selectedMetric ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMetric(null);
                          setHoveredDate(null);
                          setTimeFilter("all");
                          setCustomStartDate("");
                          setCustomEndDate("");
                        }}
                        className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nutrition-300"
                        aria-label="Volver a la lista de mediciones"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="mt-0.5 rounded-2xl bg-nutrition-100 p-2.5 text-nutrition-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <Dialog.Title
                        as="h3"
                        className="truncate text-xl font-semibold text-gray-950"
                      >
                        {selectedMetric
                          ? selectedMetricLabel
                          : "Detalle de Mediciones"}
                      </Dialog.Title>
                      <p className="mt-1 text-sm text-gray-500">
                        {selectedMetric
                          ? `Historial registrado el ${selectedDate}`
                          : `Registradas el ${selectedDate}`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nutrition-300"
                    aria-label="Cerrar detalle"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {selectedMetric ? detailContent : overviewContent}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
