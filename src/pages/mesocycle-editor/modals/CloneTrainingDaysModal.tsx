import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/common/Button';
import type { TrainingDay } from '../../../types';

interface CloneTrainingDaysModalProps {
  isOpen: boolean;
  trainingDays: TrainingDay[];
  onClose: () => void;
  onSubmit: (dayIds: string[], insertionIndex: number) => void;
}

export function CloneTrainingDaysModal({
  isOpen,
  trainingDays,
  onClose,
  onSubmit,
}: CloneTrainingDaysModalProps) {
  const { t } = useTranslation('training');

  const sortedDays = useMemo(
    () => [...trainingDays].sort((a, b) => a.day_number - b.day_number),
    [trainingDays]
  );

  const [selectedDayIds, setSelectedDayIds] = useState<Set<string>>(new Set());
  const [insertionIndex, setInsertionIndex] = useState<number>(sortedDays.length);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedDayIds(new Set());
    setInsertionIndex(sortedDays.length);
  }, [isOpen, sortedDays.length]);

  const toggleDay = (dayId: string) => {
    setSelectedDayIds((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  };

  const allSelected = selectedDayIds.size > 0 && selectedDayIds.size === sortedDays.length;

  const setAll = (selected: boolean) => {
    setSelectedDayIds(selected ? new Set(sortedDays.map((d) => d.id)) : new Set());
  };

  const getInsertionLabel = (index: number) => {
    if (sortedDays.length === 0) return t('trainingDay.cloneDays.insertAtEnd');
    if (index <= 0) return t('trainingDay.cloneDays.insertAtStart');
    if (index >= sortedDays.length) return t('trainingDay.cloneDays.insertAtEnd');
    return t('trainingDay.cloneDays.insertAfter', { day: sortedDays[index - 1].day_number });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('trainingDay.cloneDays.title')}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label={t('configModal.cancel')}
          >
            ×
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAll(!allSelected)}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              {allSelected ? t('trainingDay.cloneDays.clearAll') : t('trainingDay.cloneDays.selectAll')}
            </button>
            <span className="text-xs text-gray-500">
              {t('trainingDay.cloneDays.selectedCount', { count: selectedDayIds.size })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              {t('trainingDay.cloneDays.insertPosition')}
            </label>
            <select
              value={insertionIndex}
              onChange={(e) => setInsertionIndex(parseInt(e.target.value, 10))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value={0}>{t('trainingDay.cloneDays.insertAtStart')}</option>
              {sortedDays.map((day, index) => (
                <option key={day.id} value={index + 1}>
                  {t('trainingDay.cloneDays.insertAfter', { day: day.day_number })}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          <span className="font-medium">{t('trainingDay.cloneDays.willInsert')}</span>{' '}
          {getInsertionLabel(insertionIndex)}
        </div>

        <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden flex-1 overflow-y-auto">
          {sortedDays.length === 0 ? (
            <div className="p-6 text-center text-gray-500">{t('trainingDay.cloneDays.noDays')}</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedDays.map((day) => {
                const isSelected = selectedDayIds.has(day.id);
                const exerciseCount = day.exercises?.length || 0;
                return (
                  <label
                    key={day.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                      isSelected ? 'bg-primary-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleDay(day.id)}
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-gray-900">
                          {t('trainingDay.dayName', { number: day.day_number })}{day.name ? `: ${day.name}` : ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('trainingDay.cloneDays.exerciseCount', { count: exerciseCount })}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {day.rest_day ? t('trainingDay.restDay') : (day.focus || '')}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            {t('configModal.cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            className="flex-1"
            disabled={selectedDayIds.size === 0}
            onClick={() => onSubmit(Array.from(selectedDayIds), insertionIndex)}
          >
            {t('trainingDay.cloneDays.clone')}
          </Button>
        </div>
      </div>
    </div>
  );
}
