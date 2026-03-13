export const CALCULATION_CODES = {
  BMI: "bmi",
  BODY_FAT_PCT_BIOIMPEDANCE: "body_fat_pct_bioimpedance",
  FAT_MASS_KG: "fat_mass_kg",
  LEAN_MASS_KG: "lean_mass_kg",
  IDEAL_WEIGHT_ROBINSON: "ideal_weight_robinson",
  IDEAL_WEIGHT_METROPOLITAN: "ideal_weight_metropolitan",
  IDEAL_WEIGHT_HAMWI: "ideal_weight_hamwi",
  IDEAL_WEIGHT_LORENTZ: "ideal_weight_lorentz",
  IDEAL_WEIGHT_TRADITIONAL: "ideal_weight_traditional",
  WAIST_HIP_RATIO: "waist_hip_ratio",
  WAIST_HEIGHT_RATIO: "waist_height_ratio",
  FRISANCHO_INDICATORS: "frisancho_indicators",
} as const;

export type MeasurementCalculationStatus = "computed" | "skipped" | "error";

export interface MeasurementCalculationPreview {
  calculationCode: string;
  category: string;
  method: string;
  formulaVersion: string;
  value: number | null;
  unit: string | null;
  status: MeasurementCalculationStatus;
  missingFields?: string[];
  message?: string;
  details?: Record<string, unknown> | null;
}

type MeasurementPreviewInput = {
  weight_kg?: number | null;
  height_cm?: number | null;
  body_fat_pct?: number | null;
  waist_cm?: number | null;
  hip_cm?: number | null;
  relaxed_arm_midpoint_cm?: number | null;
  triceps_fold_mm?: number | null;
};

type PreviewParams = {
  measurement: MeasurementPreviewInput;
  userGenre?: string | null;
  userAgeYears?: number | null;
  formulaVersion?: string;
};

type FrisanchoSupportedGenre = "man" | "female";

type FrisanchoReferenceRow = {
  genre: FrisanchoSupportedGenre;
  ageYearsMin: number;
  ageYearsMax: number;
  p5: number;
  p10: number;
  p15: number;
  p25: number;
  p50: number;
  p75: number;
  p85: number;
  p90: number;
  p95: number;
  source: string;
};

const FRISANCHO_SUPPORTED_AGE_RANGE = {
  min: 18,
  max: 74.9,
};

const FRISANCHO_REFERENCE_ROWS: FrisanchoReferenceRow[] = [
  {
    genre: "man",
    ageYearsMin: 18.0,
    ageYearsMax: 24.9,
    p5: 34.2,
    p10: 37.3,
    p15: 39.6,
    p25: 42.7,
    p50: 49.4,
    p75: 57.1,
    p85: 61.8,
    p90: 65.0,
    p95: 72.0,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "man",
    ageYearsMin: 25.0,
    ageYearsMax: 29.9,
    p5: 36.6,
    p10: 39.9,
    p15: 42.4,
    p25: 46.0,
    p50: 53.0,
    p75: 61.4,
    p85: 66.1,
    p90: 68.9,
    p95: 74.5,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "man",
    ageYearsMin: 30.0,
    ageYearsMax: 34.9,
    p5: 37.9,
    p10: 40.9,
    p15: 43.4,
    p25: 47.3,
    p50: 54.4,
    p75: 63.2,
    p85: 67.6,
    p90: 70.8,
    p95: 76.1,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "man",
    ageYearsMin: 35.0,
    ageYearsMax: 39.9,
    p5: 38.5,
    p10: 42.6,
    p15: 44.6,
    p25: 47.9,
    p50: 55.3,
    p75: 64.0,
    p85: 69.1,
    p90: 72.7,
    p95: 77.6,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "man",
    ageYearsMin: 40.0,
    ageYearsMax: 44.9,
    p5: 38.4,
    p10: 42.1,
    p15: 45.1,
    p25: 48.7,
    p50: 56.0,
    p75: 64.0,
    p85: 68.5,
    p90: 71.6,
    p95: 77.0,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "man",
    ageYearsMin: 45.0,
    ageYearsMax: 49.9,
    p5: 37.7,
    p10: 41.3,
    p15: 43.7,
    p25: 47.9,
    p50: 55.2,
    p75: 63.3,
    p85: 68.4,
    p90: 72.2,
    p95: 76.2,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "man",
    ageYearsMin: 50.0,
    ageYearsMax: 54.9,
    p5: 36.0,
    p10: 40.0,
    p15: 42.7,
    p25: 46.6,
    p50: 54.0,
    p75: 62.7,
    p85: 67.0,
    p90: 70.4,
    p95: 77.4,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "man",
    ageYearsMin: 55.0,
    ageYearsMax: 59.9,
    p5: 36.5,
    p10: 40.8,
    p15: 42.7,
    p25: 46.7,
    p50: 54.3,
    p75: 61.9,
    p85: 66.4,
    p90: 69.6,
    p95: 75.1,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "man",
    ageYearsMin: 60.0,
    ageYearsMax: 64.9,
    p5: 34.5,
    p10: 38.7,
    p15: 41.2,
    p25: 44.9,
    p50: 52.1,
    p75: 60.0,
    p85: 64.8,
    p90: 67.5,
    p95: 71.6,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "man",
    ageYearsMin: 65.0,
    ageYearsMax: 69.9,
    p5: 31.4,
    p10: 35.8,
    p15: 38.4,
    p25: 42.3,
    p50: 49.1,
    p75: 57.3,
    p85: 61.2,
    p90: 64.3,
    p95: 69.4,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "man",
    ageYearsMin: 70.0,
    ageYearsMax: 74.9,
    p5: 29.7,
    p10: 33.8,
    p15: 36.1,
    p25: 40.2,
    p50: 47.0,
    p75: 54.6,
    p85: 59.1,
    p90: 62.1,
    p95: 67.3,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "female",
    ageYearsMin: 18.0,
    ageYearsMax: 24.9,
    p5: 19.5,
    p10: 21.5,
    p15: 22.8,
    p25: 24.5,
    p50: 28.3,
    p75: 33.1,
    p85: 36.4,
    p90: 39.0,
    p95: 44.2,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "female",
    ageYearsMin: 25.0,
    ageYearsMax: 29.9,
    p5: 20.5,
    p10: 21.9,
    p15: 23.1,
    p25: 25.2,
    p50: 29.4,
    p75: 34.9,
    p85: 38.5,
    p90: 41.9,
    p95: 47.8,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "female",
    ageYearsMin: 30.0,
    ageYearsMax: 34.9,
    p5: 21.1,
    p10: 23.0,
    p15: 24.2,
    p25: 26.3,
    p50: 30.9,
    p75: 36.8,
    p85: 41.2,
    p90: 44.7,
    p95: 51.3,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "female",
    ageYearsMin: 35.0,
    ageYearsMax: 39.9,
    p5: 21.1,
    p10: 23.4,
    p15: 24.7,
    p25: 27.3,
    p50: 31.8,
    p75: 38.7,
    p85: 43.1,
    p90: 46.1,
    p95: 54.2,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "female",
    ageYearsMin: 40.0,
    ageYearsMax: 44.9,
    p5: 21.3,
    p10: 23.4,
    p15: 25.5,
    p25: 27.5,
    p50: 32.3,
    p75: 39.8,
    p85: 45.8,
    p90: 49.5,
    p95: 55.8,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "female",
    ageYearsMin: 45.0,
    ageYearsMax: 49.9,
    p5: 21.6,
    p10: 23.1,
    p15: 24.8,
    p25: 27.4,
    p50: 32.5,
    p75: 39.5,
    p85: 44.7,
    p90: 48.4,
    p95: 56.1,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "female",
    ageYearsMin: 50.0,
    ageYearsMax: 54.9,
    p5: 22.2,
    p10: 24.6,
    p15: 25.7,
    p25: 28.3,
    p50: 33.4,
    p75: 40.4,
    p85: 46.1,
    p90: 49.6,
    p95: 55.6,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "female",
    ageYearsMin: 55.0,
    ageYearsMax: 59.9,
    p5: 22.8,
    p10: 24.8,
    p15: 26.5,
    p25: 28.7,
    p50: 34.7,
    p75: 42.3,
    p85: 47.3,
    p90: 52.1,
    p95: 58.8,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "female",
    ageYearsMin: 60.0,
    ageYearsMax: 64.9,
    p5: 22.4,
    p10: 24.5,
    p15: 26.3,
    p25: 29.2,
    p50: 34.5,
    p75: 41.1,
    p85: 45.6,
    p90: 49.1,
    p95: 55.1,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "female",
    ageYearsMin: 65.0,
    ageYearsMax: 69.9,
    p5: 21.9,
    p10: 24.5,
    p15: 26.2,
    p25: 28.9,
    p50: 34.6,
    p75: 41.6,
    p85: 46.3,
    p90: 49.6,
    p95: 56.5,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
  {
    genre: "female",
    ageYearsMin: 70.0,
    ageYearsMax: 74.9,
    p5: 22.2,
    p10: 24.4,
    p15: 26.0,
    p25: 28.8,
    p50: 34.3,
    p75: 41.8,
    p85: 46.4,
    p90: 49.2,
    p95: 54.6,
    source: "Frisancho cAMA adult references via Lee and Nieman 2003",
  },
];

const adultCorrectionByGenre: Record<FrisanchoSupportedGenre, number> = {
  man: 10,
  female: 6.5,
};

const percentilePoints = [
  { key: "p5", percentile: 5 },
  { key: "p10", percentile: 10 },
  { key: "p15", percentile: 15 },
  { key: "p25", percentile: 25 },
  { key: "p50", percentile: 50 },
  { key: "p75", percentile: 75 },
  { key: "p85", percentile: 85 },
  { key: "p90", percentile: 90 },
  { key: "p95", percentile: 95 },
] as const;

const toOptionalNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (typeof value === "object" && value !== null && "toString" in value) {
    const parsed = Number.parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const roundTo = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const normalizeGenre = (genre?: string | null): "man" | "female" | null => {
  if (!genre) {
    return null;
  }

  const normalized = String(genre).trim().toLowerCase();

  if (
    normalized === "man" ||
    normalized === "male" ||
    normalized === "hombre" ||
    normalized === "masculino"
  ) {
    return "man";
  }

  if (
    normalized === "female" ||
    normalized === "woman" ||
    normalized === "mujer" ||
    normalized === "femenino"
  ) {
    return "female";
  }

  return null;
};

const buildSkippedResult = (
  calculationCode: string,
  category: string,
  method: string,
  formulaVersion: string,
  missingFields: string[],
  message: string,
): MeasurementCalculationPreview => ({
  calculationCode,
  category,
  method,
  formulaVersion,
  value: null,
  unit: null,
  status: "skipped",
  missingFields,
  message,
  details: null,
});

const buildErrorResult = (
  calculationCode: string,
  category: string,
  method: string,
  formulaVersion: string,
  message: string,
): MeasurementCalculationPreview => ({
  calculationCode,
  category,
  method,
  formulaVersion,
  value: null,
  unit: null,
  status: "error",
  message,
  details: null,
});

const findFrisanchoReference = (
  genre: FrisanchoSupportedGenre,
  ageYears: number,
) =>
  FRISANCHO_REFERENCE_ROWS.find(
    (row) =>
      row.genre === genre &&
      ageYears >= row.ageYearsMin &&
      ageYears <= row.ageYearsMax,
  ) ?? null;

const estimateFrisanchoPercentile = (
  reference: FrisanchoReferenceRow,
  value: number,
) => {
  const firstPoint = percentilePoints[0];
  const lastPoint = percentilePoints[percentilePoints.length - 1];

  if (value <= reference[firstPoint.key]) {
    return roundTo(2.5, 1);
  }

  if (value >= reference[lastPoint.key]) {
    return roundTo(97.5, 1);
  }

  for (let index = 1; index < percentilePoints.length; index += 1) {
    const lowerPoint = percentilePoints[index - 1];
    const upperPoint = percentilePoints[index];
    const lowerValue = reference[lowerPoint.key];
    const upperValue = reference[upperPoint.key];

    if (value >= lowerValue && value <= upperValue) {
      if (upperValue === lowerValue) {
        return roundTo(upperPoint.percentile, 1);
      }

      const ratio = (value - lowerValue) / (upperValue - lowerValue);
      return roundTo(
        lowerPoint.percentile +
          ratio * (upperPoint.percentile - lowerPoint.percentile),
        1,
      );
    }
  }

  return null;
};

const describeFrisanchoBand = (
  reference: FrisanchoReferenceRow,
  value: number,
) => {
  if (value < reference.p5) return "<P5";
  if (value < reference.p10) return "P5-P10";
  if (value < reference.p15) return "P10-P15";
  if (value < reference.p25) return "P15-P25";
  if (value < reference.p50) return "P25-P50";
  if (value < reference.p75) return "P50-P75";
  if (value < reference.p85) return "P75-P85";
  if (value < reference.p90) return "P85-P90";
  if (value < reference.p95) return "P90-P95";
  return ">P95";
};

const describeFrisanchoClassification = (
  reference: FrisanchoReferenceRow,
  value: number,
) => {
  if (value < reference.p5) return "Reserva muscular muy baja";
  if (value < reference.p15) return "Reserva muscular baja";
  if (value <= reference.p85) return "Reserva muscular dentro de referencia";
  if (value <= reference.p95) return "Reserva muscular alta";
  return "Reserva muscular muy alta";
};

export const buildMeasurementCalculationPreview = ({
  measurement,
  userGenre,
  userAgeYears,
  formulaVersion = "v1",
}: PreviewParams): Record<string, MeasurementCalculationPreview> => {
  const weightKg = toOptionalNumber(measurement.weight_kg);
  const heightCm = toOptionalNumber(measurement.height_cm);
  const bodyFatPct = toOptionalNumber(measurement.body_fat_pct);
  const waistCm = toOptionalNumber(measurement.waist_cm);
  const hipCm = toOptionalNumber(measurement.hip_cm);
  const relaxedArmMidpointCm = toOptionalNumber(
    measurement.relaxed_arm_midpoint_cm,
  );
  const tricepsFoldMm = toOptionalNumber(measurement.triceps_fold_mm);
  const genre = normalizeGenre(userGenre);

  const results: Record<string, MeasurementCalculationPreview> = {};

  if (weightKg === null || heightCm === null) {
    results[CALCULATION_CODES.BMI] = buildSkippedResult(
      CALCULATION_CODES.BMI,
      "body_composition",
      "quetelet",
      formulaVersion,
      [
        ...(weightKg === null ? ["weight_kg"] : []),
        ...(heightCm === null ? ["height_cm"] : []),
      ],
      "BMI requires weight_kg and height_cm",
    );
  } else if (!weightKg || !heightCm) {
    results[CALCULATION_CODES.BMI] = buildErrorResult(
      CALCULATION_CODES.BMI,
      "body_composition",
      "quetelet",
      formulaVersion,
      "BMI received invalid measurement values",
    );
  } else {
    const heightM = heightCm / 100;
    results[CALCULATION_CODES.BMI] = {
      calculationCode: CALCULATION_CODES.BMI,
      category: "body_composition",
      method: "quetelet",
      formulaVersion,
      value: roundTo(weightKg / (heightM * heightM), 2),
      unit: "kg/m2",
      status: "computed",
      details: null,
    };
  }

  if (bodyFatPct === null) {
    results[CALCULATION_CODES.BODY_FAT_PCT_BIOIMPEDANCE] = buildSkippedResult(
      CALCULATION_CODES.BODY_FAT_PCT_BIOIMPEDANCE,
      "body_composition",
      "bioimpedance_input",
      formulaVersion,
      ["body_fat_pct"],
      "Body fat percentage requires body_fat_pct",
    );
  } else {
    results[CALCULATION_CODES.BODY_FAT_PCT_BIOIMPEDANCE] = {
      calculationCode: CALCULATION_CODES.BODY_FAT_PCT_BIOIMPEDANCE,
      category: "body_composition",
      method: "bioimpedance_input",
      formulaVersion,
      value: roundTo(bodyFatPct, 2),
      unit: "%",
      status: "computed",
      details: null,
    };
  }

  if (weightKg === null || bodyFatPct === null) {
    results[CALCULATION_CODES.FAT_MASS_KG] = buildSkippedResult(
      CALCULATION_CODES.FAT_MASS_KG,
      "body_composition",
      "weight_x_body_fat_pct",
      formulaVersion,
      [
        ...(weightKg === null ? ["weight_kg"] : []),
        ...(bodyFatPct === null ? ["body_fat_pct"] : []),
      ],
      "Fat mass requires weight_kg and body_fat_pct",
    );
    results[CALCULATION_CODES.LEAN_MASS_KG] = buildSkippedResult(
      CALCULATION_CODES.LEAN_MASS_KG,
      "body_composition",
      "weight_minus_fat_mass",
      formulaVersion,
      [
        ...(weightKg === null ? ["weight_kg"] : []),
        ...(bodyFatPct === null ? ["body_fat_pct"] : []),
      ],
      "Lean mass requires weight_kg and body_fat_pct",
    );
  } else {
    const fatMass = (weightKg * bodyFatPct) / 100;

    results[CALCULATION_CODES.FAT_MASS_KG] = {
      calculationCode: CALCULATION_CODES.FAT_MASS_KG,
      category: "body_composition",
      method: "weight_x_body_fat_pct",
      formulaVersion,
      value: roundTo(fatMass, 2),
      unit: "kg",
      status: "computed",
      details: null,
    };

    results[CALCULATION_CODES.LEAN_MASS_KG] = {
      calculationCode: CALCULATION_CODES.LEAN_MASS_KG,
      category: "body_composition",
      method: "weight_minus_fat_mass",
      formulaVersion,
      value: roundTo(weightKg - fatMass, 2),
      unit: "kg",
      status: "computed",
      details: null,
    };
  }

  if (waistCm === null || hipCm === null) {
    results[CALCULATION_CODES.WAIST_HIP_RATIO] = buildSkippedResult(
      CALCULATION_CODES.WAIST_HIP_RATIO,
      "body_composition_indicators",
      "waist_divided_by_hip",
      formulaVersion,
      [
        ...(waistCm === null ? ["waist_cm"] : []),
        ...(hipCm === null ? ["hip_cm"] : []),
      ],
      "Waist/hip ratio requires waist_cm and hip_cm",
    );
  } else if (hipCm === 0) {
    results[CALCULATION_CODES.WAIST_HIP_RATIO] = buildErrorResult(
      CALCULATION_CODES.WAIST_HIP_RATIO,
      "body_composition_indicators",
      "waist_divided_by_hip",
      formulaVersion,
      "Waist/hip ratio received invalid measurement values",
    );
  } else {
    results[CALCULATION_CODES.WAIST_HIP_RATIO] = {
      calculationCode: CALCULATION_CODES.WAIST_HIP_RATIO,
      category: "body_composition_indicators",
      method: "waist_divided_by_hip",
      formulaVersion,
      value: roundTo(waistCm / hipCm, 3),
      unit: null,
      status: "computed",
      details: null,
    };
  }

  if (waistCm === null || heightCm === null) {
    results[CALCULATION_CODES.WAIST_HEIGHT_RATIO] = buildSkippedResult(
      CALCULATION_CODES.WAIST_HEIGHT_RATIO,
      "body_composition_indicators",
      "waist_divided_by_height",
      formulaVersion,
      [
        ...(waistCm === null ? ["waist_cm"] : []),
        ...(heightCm === null ? ["height_cm"] : []),
      ],
      "Waist/height ratio requires waist_cm and height_cm",
    );
  } else if (heightCm === 0) {
    results[CALCULATION_CODES.WAIST_HEIGHT_RATIO] = buildErrorResult(
      CALCULATION_CODES.WAIST_HEIGHT_RATIO,
      "body_composition_indicators",
      "waist_divided_by_height",
      formulaVersion,
      "Waist/height ratio received invalid measurement values",
    );
  } else {
    results[CALCULATION_CODES.WAIST_HEIGHT_RATIO] = {
      calculationCode: CALCULATION_CODES.WAIST_HEIGHT_RATIO,
      category: "body_composition_indicators",
      method: "waist_divided_by_height",
      formulaVersion,
      value: roundTo(waistCm / heightCm, 3),
      unit: null,
      status: "computed",
      details: null,
    };
  }

  const idealWeightConfigs = [
    {
      code: CALCULATION_CODES.IDEAL_WEIGHT_ROBINSON,
      method: "robinson_1983",
      calculate: (currentHeightCm: number, currentGenre: "man" | "female") => {
        const heightInches = currentHeightCm / 2.54;
        const inchesOverFiveFeet = Math.max(heightInches - 60, 0);
        const base = currentGenre === "man" ? 52 : 49;
        const factor = currentGenre === "man" ? 1.9 : 1.7;
        return base + factor * inchesOverFiveFeet;
      },
    },
    {
      code: CALCULATION_CODES.IDEAL_WEIGHT_METROPOLITAN,
      method: "metropolitan",
      calculate: (currentHeightCm: number, currentGenre: "man" | "female") => {
        const heightM = currentHeightCm / 100;
        const bmiTarget = currentGenre === "man" ? 22.5 : 21.5;
        return bmiTarget * heightM * heightM;
      },
    },
    {
      code: CALCULATION_CODES.IDEAL_WEIGHT_HAMWI,
      method: "hamwi",
      calculate: (currentHeightCm: number, currentGenre: "man" | "female") => {
        const heightInches = currentHeightCm / 2.54;
        const inchesOverFiveFeet = Math.max(heightInches - 60, 0);
        const base = currentGenre === "man" ? 48 : 45.5;
        const factor = currentGenre === "man" ? 2.7 : 2.2;
        return base + factor * inchesOverFiveFeet;
      },
    },
    {
      code: CALCULATION_CODES.IDEAL_WEIGHT_LORENTZ,
      method: "lorentz",
      calculate: (currentHeightCm: number, currentGenre: "man" | "female") => {
        const divisor = currentGenre === "man" ? 4 : 2.5;
        return currentHeightCm - 100 - (currentHeightCm - 150) / divisor;
      },
    },
    {
      code: CALCULATION_CODES.IDEAL_WEIGHT_TRADITIONAL,
      method: "traditional_broca",
      calculate: (currentHeightCm: number, currentGenre: "man" | "female") => {
        const broca = currentHeightCm - 100;
        const multiplier = currentGenre === "man" ? 0.9 : 0.85;
        return broca * multiplier;
      },
    },
  ];

  idealWeightConfigs.forEach(({ code, method, calculate }) => {
    if (heightCm === null || !genre) {
      results[code] = buildSkippedResult(
        code,
        "ideal_weight",
        method,
        formulaVersion,
        [
          ...(heightCm === null ? ["height_cm"] : []),
          ...(!genre ? ["genre"] : []),
        ],
        `${code} requires height_cm and user genre`,
      );
      return;
    }

    results[code] = {
      calculationCode: code,
      category: "ideal_weight",
      method,
      formulaVersion,
      value: roundTo(calculate(heightCm, genre), 2),
      unit: "kg",
      status: "computed",
      details: null,
    };
  });

  const frisanchoFormulaVersion = "adult_cama_v1";
  const frisanchoMissingFields = [
    ...(relaxedArmMidpointCm === null ? ["relaxed_arm_midpoint_cm"] : []),
    ...(tricepsFoldMm === null ? ["triceps_fold_mm"] : []),
    ...(!genre ? ["genre"] : []),
    ...(userAgeYears === null || userAgeYears === undefined
      ? ["age_years"]
      : []),
  ];

  if (frisanchoMissingFields.length > 0) {
    results[CALCULATION_CODES.FRISANCHO_INDICATORS] = buildSkippedResult(
      CALCULATION_CODES.FRISANCHO_INDICATORS,
      "frisancho",
      "frisancho_cama_adult_reference",
      frisanchoFormulaVersion,
      frisanchoMissingFields,
      "Frisancho requires relaxed_arm_midpoint_cm, triceps_fold_mm, user genre, and age at measurement",
    );
    return results;
  }

  if (
    !genre ||
    userAgeYears === null ||
    userAgeYears === undefined ||
    relaxedArmMidpointCm === null ||
    tricepsFoldMm === null
  ) {
    results[CALCULATION_CODES.FRISANCHO_INDICATORS] = buildSkippedResult(
      CALCULATION_CODES.FRISANCHO_INDICATORS,
      "frisancho",
      "frisancho_cama_adult_reference",
      frisanchoFormulaVersion,
      ["relaxed_arm_midpoint_cm", "triceps_fold_mm", "genre", "age_years"],
      "Frisancho requires relaxed_arm_midpoint_cm, triceps_fold_mm, user genre, and age at measurement",
    );
    return results;
  }

  if (
    userAgeYears < FRISANCHO_SUPPORTED_AGE_RANGE.min ||
    userAgeYears > FRISANCHO_SUPPORTED_AGE_RANGE.max
  ) {
    results[CALCULATION_CODES.FRISANCHO_INDICATORS] = buildSkippedResult(
      CALCULATION_CODES.FRISANCHO_INDICATORS,
      "frisancho",
      "frisancho_cama_adult_reference",
      frisanchoFormulaVersion,
      [],
      "Frisancho adult cAMA references are available for ages 18 to 74 years",
    );
    return results;
  }

  if (relaxedArmMidpointCm <= 0 || tricepsFoldMm <= 0) {
    results[CALCULATION_CODES.FRISANCHO_INDICATORS] = buildErrorResult(
      CALCULATION_CODES.FRISANCHO_INDICATORS,
      "frisancho",
      "frisancho_cama_adult_reference",
      frisanchoFormulaVersion,
      "Frisancho received invalid arm midpoint or triceps values",
    );
    return results;
  }

  const reference = findFrisanchoReference(genre, userAgeYears);
  if (!reference) {
    results[CALCULATION_CODES.FRISANCHO_INDICATORS] = buildSkippedResult(
      CALCULATION_CODES.FRISANCHO_INDICATORS,
      "frisancho",
      "frisancho_cama_adult_reference",
      frisanchoFormulaVersion,
      [],
      "Frisancho adult cAMA references could not be resolved for this age and genre",
    );
    return results;
  }

  const tricepsFoldCm = roundTo(tricepsFoldMm / 10, 3);
  const armMuscleCircumferenceCm = roundTo(
    relaxedArmMidpointCm - Math.PI * tricepsFoldCm,
    3,
  );
  if (armMuscleCircumferenceCm <= 0) {
    results[CALCULATION_CODES.FRISANCHO_INDICATORS] = buildErrorResult(
      CALCULATION_CODES.FRISANCHO_INDICATORS,
      "frisancho",
      "frisancho_cama_adult_reference",
      frisanchoFormulaVersion,
      "Frisancho received measurements that produce a non-positive arm muscle circumference",
    );
    return results;
  }

  const armMuscleAreaCm2 = roundTo(
    (armMuscleCircumferenceCm * armMuscleCircumferenceCm) / (4 * Math.PI),
    3,
  );
  const correctedArmMuscleAreaCm2 = roundTo(
    armMuscleAreaCm2 - adultCorrectionByGenre[genre],
    3,
  );
  if (correctedArmMuscleAreaCm2 <= 0) {
    results[CALCULATION_CODES.FRISANCHO_INDICATORS] = buildErrorResult(
      CALCULATION_CODES.FRISANCHO_INDICATORS,
      "frisancho",
      "frisancho_cama_adult_reference",
      frisanchoFormulaVersion,
      "Frisancho received measurements that produce a non-positive corrected arm muscle area",
    );
    return results;
  }

  const approximatePercentile = estimateFrisanchoPercentile(
    reference,
    correctedArmMuscleAreaCm2,
  );
  const details = {
    indicator: "corrected_upper_arm_muscle_area",
    label: "Area muscular braquial corregida",
    source: reference.source,
    ageYears: userAgeYears,
    genre,
    ageRange: {
      min: reference.ageYearsMin,
      max: reference.ageYearsMax,
      label: `${reference.ageYearsMin.toFixed(1)}-${reference.ageYearsMax.toFixed(1)} anos`,
    },
    measurements: {
      relaxedArmMidpointCm: roundTo(relaxedArmMidpointCm, 1),
      tricepsFoldMm: roundTo(tricepsFoldMm, 1),
    },
    derived: {
      tricepsFoldCm,
      armMuscleCircumferenceCm,
      armMuscleAreaCm2,
      correctedArmMuscleAreaCm2,
    },
    reference: {
      p5: reference.p5,
      p10: reference.p10,
      p15: reference.p15,
      p25: reference.p25,
      p50: reference.p50,
      p75: reference.p75,
      p85: reference.p85,
      p90: reference.p90,
      p95: reference.p95,
    },
    assessment: {
      approximatePercentile,
      percentileBand: describeFrisanchoBand(
        reference,
        correctedArmMuscleAreaCm2,
      ),
      classification: describeFrisanchoClassification(
        reference,
        correctedArmMuscleAreaCm2,
      ),
      adequacyPctOfP50: roundTo(
        (correctedArmMuscleAreaCm2 / reference.p50) * 100,
        1,
      ),
    },
  };

  results[CALCULATION_CODES.FRISANCHO_INDICATORS] = {
    calculationCode: CALCULATION_CODES.FRISANCHO_INDICATORS,
    category: "frisancho",
    method: "frisancho_cama_adult_reference",
    formulaVersion: frisanchoFormulaVersion,
    value: correctedArmMuscleAreaCm2,
    unit: "cm2",
    status: "computed",
    details,
  };

  return results;
};
