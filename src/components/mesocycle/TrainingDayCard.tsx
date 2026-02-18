import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import type { TrainingDay, Exercise } from '../../types';
import { SortableExerciseItem } from './SortableExerciseItem';

interface TrainingDayCardProps {
  trainingDay: TrainingDay;
  exercises: Exercise[];
  onEdit?: () => void;
  onDelete?: () => void;
  onAddExercise?: () => void;
  onEditExercise?: (exerciseId: string) => void;
  onDeleteExercise?: (exerciseId: string) => void;
}

export function TrainingDayCard({
  trainingDay,
  exercises,
  onEdit,
  onDelete,
  onAddExercise,
  onEditExercise,
  onDeleteExercise,
}: TrainingDayCardProps) {
  const { t } = useTranslation('training');
  const [isExpanded, setIsExpanded] = useState(true);
  const [copyMode, setCopyMode] = useState(false);

  // Use exercises from the trainingDay object
  const dayExercises = trainingDay.exercises || [];
  const sortedExercises = [...dayExercises].sort((a, b) => a.order_index - b.order_index);
  const exerciseIds = sortedExercises.map((e) => e.id);

  const {
    attributes: dayDragAttributes,
    listeners: dayDragListeners,
    setNodeRef: setDayDragNodeRef,
    transform: dayTransform,
    isDragging: isDayDragging,
  } = useDraggable({
    id: `training-day-${trainingDay.id}`,
    data: {
      type: 'training-day',
      dayId: trainingDay.id,
      microcycleId: trainingDay.microcycle_id,
    },
    disabled: !copyMode,
  });

  const dragStyle = {
    transform: CSS.Transform.toString(dayTransform),
    opacity: isDayDragging ? 0.6 : 1,
  };

  // Droppable setup for receiving exercises from other days
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${trainingDay.id}`,
    data: {
      type: 'training-day',
      dayId: trainingDay.id,
    },
  });

  return (
    <div ref={setDayDragNodeRef} style={dragStyle}>
      <Card
        padding="none"
        className={`rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md ${
          isOver
            ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
            : 'border-gray-200/80'
        }`}
      >
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100/80 rounded-t-xl border-b border-gray-200/60">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
              </Button>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Day {trainingDay.day_number}
                  {trainingDay.name && `: ${trainingDay.name}`}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>
                    {dayExercises.length}{' '}
                    {dayExercises.length === 1 ? 'exercise' : 'exercises'}
                  </span>
                  {trainingDay.focus && (
                    <>
                      <span>•</span>
                      <span>{trainingDay.focus}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-gray-600 select-none">
              <input
                type="checkbox"
                checked={copyMode}
                onChange={(e) => setCopyMode(e.target.checked)}
                className="h-4 w-4"
              />
              {t('trainingDay.copyMode')}
            </label>
            <button
              type="button"
              {...dayDragAttributes}
              {...dayDragListeners}
              disabled={!copyMode}
              title={t('trainingDay.dragToCopy')}
              className={`p-1.5 rounded-lg transition-colors ${
                copyMode
                  ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/60 cursor-grab active:cursor-grabbing'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <Bars3Icon className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <PencilIcon className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <TrashIcon className="h-3.5 w-3.5 text-red-600" />
              </Button>
            </div>
          </div>
        </div>

        {trainingDay.notes && (
          <p className="mt-2 text-xs text-gray-600 ml-10">{trainingDay.notes}</p>
        )}
      </div>

      {/* Exercises */}
      {isExpanded && (
        <div ref={setNodeRef} className="p-3 min-h-[60px]">
          {dayExercises.length === 0 ? (
            <div
              className={`text-center py-6 border-2 border-dashed rounded-xl transition-all duration-200 ${
                isOver ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <p className="text-sm mb-3">
                {isOver ? 'Drop exercise here' : 'No exercises yet'}
              </p>
              {!isOver && (
                <Button variant="secondary" size="sm" onClick={onAddExercise}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Exercise
                </Button>
              )}
            </div>
          ) : (
            <SortableContext items={exerciseIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sortedExercises.map((exercise, index) => (
                  <SortableExerciseItem
                    key={exercise.id}
                    dayExercise={exercise}
                    index={index}
                    exercises={exercises}
                    onEdit={() => onEditExercise?.(exercise.id)}
                    onDelete={() => onDeleteExercise?.(exercise.id)}
                  />
                ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={onAddExercise}
                className="w-full mt-3"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </SortableContext>
          )}
        </div>
      )}
      </Card>
    </div>
  );
}
