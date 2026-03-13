import { expect, test, type Locator, type Page } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5175';
const PROFESSIONAL_PHONE = '+528712510748';
const PROFESSIONAL_PASSWORD = 'elsuka117';
const CLIENT_ID = 2;

const measurementData = {
  weightKg: '80.8',
  heightCm: '180',
  bodyFatPct: '20.1',
  muscleMassKg: '60.8',
  upperBodyFatPct: '18.4',
  lowerBodyFatPct: '21.7',
  visceralFat: '8',
  fatFreeMassKg: '64.6',
  boneMassKg: '3.1',
  bodyWaterPct: '55.3',
  metabolicAge: '28',
  subscapularFoldMm: '12',
  tricepsFoldMm: '14',
  bicepsFoldMm: '8',
  iliacCrestFoldMm: '17',
  supraspinalFoldMm: '13',
  abdominalFoldMm: '19',
  frontThighFoldMm: '15',
  medialCalfFoldMm: '10',
  midAxillaryFoldMm: '11',
  pectoralFoldMm: '9',
  biacromialCm: '38.6',
  biiliocrestalCm: '29.6',
  thoraxTransverseCm: '27.4',
  thoraxAnteroposteriorCm: '18.2',
  humerusBiepicondylarCm: '6.9',
  wristBistyloidCm: '5.5',
  femurBiepicondylarCm: '9.8',
  bimaleolarCm: '7.3',
  footLengthCm: '26.0',
  footTransverseCm: '9.2',
  handLengthCm: '18.6',
  handTransverseCm: '8.4',
  waistCm: '79',
  hipCm: '96.5',
  chestCm: '93',
  mesosternalCm: '88.5',
  umbilicalCm: '84.5',
  cephalicCm: '56.1',
  neckCm: '35',
  armLeftCm: '30.2',
  armRightCm: '30.8',
  relaxedArmMidpointCm: '30.0',
  contractedArmMidpointCm: '31.6',
  forearmCm: '26.4',
  wristCm: '16.3',
  midThighCm: '54.9',
  thighLeftCm: '55.3',
  thighRightCm: '55.5',
  calfCm: '35.2',
  calfLeftCm: '35.3',
  calfRightCm: '35.2',
} as const;

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const inputByLabel = (page: Page, label: string): Locator =>
  page
    .locator('label')
    .filter({ hasText: new RegExp(`^${escapeRegExp(label)}$`) })
    .locator('xpath=following-sibling::div//input')
    .first();

const fillInput = async (page: Page, label: string, value: string) => {
  await inputByLabel(page, label).fill(value);
};

const login = async (page: Page) => {
  await page.addInitScript(() => {
    localStorage.setItem('language', 'es');
    localStorage.setItem('fitpilot_language_preference', 'es');
  });

  await page.goto(`${BASE_URL}/es/auth/login`);
  await page.locator('input[type="text"]').first().fill(PROFESSIONAL_PHONE);
  await page.locator('input[type="password"]').first().fill(PROFESSIONAL_PASSWORD);
  await page.getByRole('button', { name: /^Iniciar Sesión$/ }).click();
  await page.waitForURL(/\/es\/?$/);
};

test('agrega una medicion completa con preview valido de Frisancho', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'La prueba escribe datos reales y se ejecuta solo una vez en Chromium.',
  );
  test.slow();

  await login(page);

  await page.goto(`${BASE_URL}/es/nutrition/clients/${CLIENT_ID}/medical-history`);
  await expect(
    page.getByRole('button', { name: /^Agregar Medición$/ }),
  ).toBeVisible();

  await page.getByRole('button', { name: /^Agregar Medición$/ }).click();
  await expect(page.getByText('Agregar Nueva Medición')).toBeVisible();
  await page.getByRole('button', { name: /^Limpiar$/ }).click();

  await fillInput(page, 'Peso Corporal', measurementData.weightKg);
  await fillInput(page, 'Estatura', measurementData.heightCm);

  await page.getByRole('button', { name: /^Bioimpedancia$/ }).click();
  await fillInput(page, 'Grasa total', measurementData.bodyFatPct);
  await fillInput(page, 'Masa muscular', measurementData.muscleMassKg);
  await fillInput(page, 'Grasa en sección superior', measurementData.upperBodyFatPct);
  await fillInput(page, 'Grasa en sección inferior', measurementData.lowerBodyFatPct);
  await fillInput(page, 'Grasa visceral', measurementData.visceralFat);
  await fillInput(page, 'Masa libre de grasa', measurementData.fatFreeMassKg);
  await fillInput(page, 'Peso óseo', measurementData.boneMassKg);
  await fillInput(page, 'Agua corporal', measurementData.bodyWaterPct);
  await fillInput(page, 'Edad metabólica', measurementData.metabolicAge);

  await page.getByRole('button', { name: /^Pliegues$/ }).click();
  await fillInput(page, 'Subescapular', measurementData.subscapularFoldMm);
  await fillInput(page, 'Tríceps', measurementData.tricepsFoldMm);
  await fillInput(page, 'Bíceps', measurementData.bicepsFoldMm);
  await fillInput(page, 'Cresta ilíaca', measurementData.iliacCrestFoldMm);
  await fillInput(page, 'Supraespinal', measurementData.supraspinalFoldMm);
  await fillInput(page, 'Abdominal', measurementData.abdominalFoldMm);
  await fillInput(page, 'Muslo frontal', measurementData.frontThighFoldMm);
  await fillInput(page, 'Pantorrilla medial', measurementData.medialCalfFoldMm);
  await fillInput(page, 'Axilar medial', measurementData.midAxillaryFoldMm);
  await fillInput(page, 'Pectoral', measurementData.pectoralFoldMm);

  await page.getByRole('button', { name: /^Diámetros$/ }).click();
  await fillInput(page, 'Biacromial', measurementData.biacromialCm);
  await fillInput(page, 'Biiliocrestal', measurementData.biiliocrestalCm);
  await fillInput(page, 'Transverso del Tórax', measurementData.thoraxTransverseCm);
  await fillInput(
    page,
    'Anteroposterior del Tórax',
    measurementData.thoraxAnteroposteriorCm,
  );
  await fillInput(page, 'Húmero', measurementData.humerusBiepicondylarCm);
  await fillInput(page, 'Biestiloideo de la Muñeca', measurementData.wristBistyloidCm);
  await fillInput(page, 'Fémur', measurementData.femurBiepicondylarCm);
  await fillInput(page, 'Bimaleolar', measurementData.bimaleolarCm);
  await fillInput(page, 'Longitud del Pie', measurementData.footLengthCm);
  await fillInput(page, 'Transverso del Pie', measurementData.footTransverseCm);
  await fillInput(page, 'Longitud Mano', measurementData.handLengthCm);
  await fillInput(page, 'Transverso de la Mano', measurementData.handTransverseCm);

  await page.getByRole('button', { name: /^Perímetros$/ }).click();
  await fillInput(page, 'Cintura', measurementData.waistCm);
  await fillInput(page, 'Cadera', measurementData.hipCm);
  await fillInput(page, 'Pecho', measurementData.chestCm);
  await fillInput(page, 'Mesoesternal', measurementData.mesosternalCm);
  await fillInput(page, 'Umbilical', measurementData.umbilicalCm);
  await fillInput(page, 'Cefalico', measurementData.cephalicCm);
  await fillInput(page, 'Cuello', measurementData.neckCm);
  await fillInput(page, 'Brazo Izquierdo', measurementData.armLeftCm);
  await fillInput(page, 'Brazo Derecho', measurementData.armRightCm);
  await fillInput(
    page,
    'Mitad del Brazo Relajado',
    measurementData.relaxedArmMidpointCm,
  );
  await fillInput(
    page,
    'Mitad del Brazo Contraido',
    measurementData.contractedArmMidpointCm,
  );
  await fillInput(page, 'Antebrazo', measurementData.forearmCm);
  await fillInput(page, 'Muneca', measurementData.wristCm);
  await fillInput(page, 'Muslo Medio', measurementData.midThighCm);
  await fillInput(page, 'Muslo Izquierdo', measurementData.thighLeftCm);
  await fillInput(page, 'Muslo Derecho', measurementData.thighRightCm);
  await fillInput(page, 'Pantorrilla', measurementData.calfCm);
  await fillInput(page, 'Pantorrilla Izquierda', measurementData.calfLeftCm);
  await fillInput(page, 'Pantorrilla Derecha', measurementData.calfRightCm);

  await page.getByRole('button', { name: /^Cálculos$/ }).click();
  await page
    .getByRole('button', { name: /^Indicadores de Frisancho$/ })
    .click();

  await expect(page.getByText('Referencia de Frisancho lista')).toBeVisible();
  await expect(page.getByText(/Estado:\s*computed/i)).toBeVisible();
  await expect(page.getByText(/P10-P15/)).toBeVisible();

  const createMeasurementResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/v1/measurements') &&
      response.request().method() === 'POST',
  );

  await page.getByRole('button', { name: /^Guardar Medición$/ }).click();

  const response = await createMeasurementResponse;
  expect(response.ok()).toBeTruthy();

  const responseBody = await response.json();
  expect(responseBody.measurement.id).toBeTruthy();
  expect(Number(responseBody.measurement.weight_kg)).toBe(
    Number(measurementData.weightKg),
  );
  expect(Number(responseBody.measurement.body_fat_pct)).toBe(
    Number(measurementData.bodyFatPct),
  );
  expect(Number(responseBody.measurement.muscle_mass_kg)).toBe(
    Number(measurementData.muscleMassKg),
  );
  expect(Number(responseBody.measurement.relaxed_arm_midpoint_cm)).toBe(
    Number(measurementData.relaxedArmMidpointCm),
  );
  expect(Number(responseBody.measurement.triceps_fold_mm)).toBe(
    Number(measurementData.tricepsFoldMm),
  );

  await expect(
    page.getByText('Medición corporal guardada correctamente.'),
  ).toBeVisible();
  await expect(page.getByText('Agregar Nueva Medición')).toBeHidden();

  const compositionTable = page
    .locator('table')
    .filter({ has: page.getByRole('columnheader', { name: /^Peso$/ }) })
    .first();
  const latestRow = compositionTable.locator('tbody tr').first();

  await expect(latestRow).toContainText('80.8');
  await expect(latestRow).toContainText('20.1');
  await expect(latestRow).toContainText('60.8');
});
