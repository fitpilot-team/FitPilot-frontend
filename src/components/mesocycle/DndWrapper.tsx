import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ExerciseDragOverlay } from './SortableExerciseItem';
import type { DayExercise, Exercise, TrainingDay } from '../../types';

interface DndWrapperProps {
  children: React.ReactNode;
  trainingDays: Record<string, TrainingDay[]>;
  exercises: Exercise[];
  onReorderExercises: (
    dayId: string,
    exerciseIds: string[]
  ) => Promise<void>;
  onMoveExercise: (
    exerciseId: string,
    fromDayId: string,
    toDayId: string,
    newIndex: number
  ) => Promise<void>;
  onCloneTrainingDay?: (
    microcycleId: string,
    sourceDayId: string,
    insertionIndex: number
  ) => Promise<void>;
}

export function DndWrapper({
  children,
  trainingDays,
  exercises,
  onReorderExercises,
  onMoveExercise,
  onCloneTrainingDay,
}: DndWrapperProps) {
  const [activeExercise, setActiveExercise] = useState<DayExercise | null>(null);
  const [activeTrainingDay, setActiveTrainingDay] = useState<TrainingDay | null>(null);

  // Configure sensors for different input types
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Long press delay for touch
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Find exercise by ID across all days
  const findExerciseById = useCallback((id: string): { exercise: DayExercise; dayId: string } | null => {
    for (const days of Object.values(trainingDays)) {
      for (const day of days) {
        const exercise = day.exercises?.find((e) => e.id === id);
        if (exercise) {
          return { exercise, dayId: day.id };
        }
      }
    }
    return null;
  }, [trainingDays]);

  const findTrainingDayById = useCallback((id: string): TrainingDay | null => {
    for (const days of Object.values(trainingDays)) {
      const day = days.find((d) => d.id === id);
      if (day) return day;
    }
    return null;
  }, [trainingDays]);

  // Get exercises for a specific day
  const getExercisesForDay = useCallback((dayId: string): DayExercise[] => {
    for (const days of Object.values(trainingDays)) {
      const day = days.find((d) => d.id === dayId);
      if (day) {
        return [...(day.exercises || [])].sort((a, b) => a.order_index - b.order_index);
      }
    }
    return [];
  }, [trainingDays]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    if (activeId.startsWith('training-day-')) {
      const dayId = activeId.replace('training-day-', '');
      const day = findTrainingDayById(dayId);
      if (day) setActiveTrainingDay(day);
      return;
    }

    const found = findExerciseById(activeId);
    if (found) setActiveExercise(found.exercise);
  }, [findExerciseById, findTrainingDayById]);

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Could add visual feedback here for cross-day drags
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveExercise(null);
    setActiveTrainingDay(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId.startsWith('training-day-')) {
      if (!onCloneTrainingDay) return;

      const sourceDayId = activeId.replace('training-day-', '');
      const sourceDay = findTrainingDayById(sourceDayId);
      if (!sourceDay) return;

      let targetDayId: string | null = null;
      if (overId.startsWith('day-')) {
        targetDayId = overId.replace('day-', '');
      } else if (overId.startsWith('training-day-')) {
        targetDayId = overId.replace('training-day-', '');
      } else {
        const targetExercise = findExerciseById(overId);
        if (targetExercise) targetDayId = targetExercise.dayId;
      }

      if (!targetDayId) return;

      const targetDay = findTrainingDayById(targetDayId);
      if (!targetDay) return;

      // Only allow copy within same microcycle
      if (targetDay.microcycle_id !== sourceDay.microcycle_id) return;

      const microcycleId = sourceDay.microcycle_id;
      const microcycleDays = [...(trainingDays[microcycleId] || [])].sort((a, b) => a.day_number - b.day_number);
      const targetIndex = microcycleDays.findIndex((d) => d.id === targetDayId);
      const insertionIndex = targetIndex === -1 ? microcycleDays.length : targetIndex + 1; // insert after target

      await onCloneTrainingDay(microcycleId, sourceDayId, insertionIndex);
      return;
    }

    // Find source info
    const sourceInfo = findExerciseById(activeId);
    if (!sourceInfo) return;

    const sourceDayId = sourceInfo.dayId;

    // Determine target day
    let targetDayId: string | null = null;

    // Check if dropping on a day (empty day)
    if (overId.startsWith('day-')) {
      targetDayId = overId.replace('day-', '');
    } else {
      // Dropping on another exercise
      const targetInfo = findExerciseById(overId);
      if (targetInfo) {
        targetDayId = targetInfo.dayId;
      }
    }

    if (!targetDayId) return;

    // Same day reorder
    if (sourceDayId === targetDayId) {
      const dayExercises = getExercisesForDay(sourceDayId);
      const oldIndex = dayExercises.findIndex((e) => e.id === activeId);
      const newIndex = dayExercises.findIndex((e) => e.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newOrder = arrayMove(dayExercises, oldIndex, newIndex);
        const exerciseIds = newOrder.map((e) => e.id);
        await onReorderExercises(sourceDayId, exerciseIds);
      }
    } else {
      // Cross-day move
      const targetExercises = getExercisesForDay(targetDayId);
      let newIndex = targetExercises.length; // Default to end

      // If dropping on an exercise, insert at that position
      if (!overId.startsWith('day-')) {
        const overIndex = targetExercises.findIndex((e) => e.id === overId);
        if (overIndex !== -1) {
          newIndex = overIndex;
        }
      }

      await onMoveExercise(activeId, sourceDayId, targetDayId, newIndex);
    }
  }, [findExerciseById, findTrainingDayById, getExercisesForDay, onCloneTrainingDay, onMoveExercise, onReorderExercises, trainingDays]);

  // Find the Exercise object for display in overlay
  const activeExerciseData = activeExercise
    ? exercises.find((e) => e.id === activeExercise.exercise_id) || activeExercise.exercise
    : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeExercise ? (
          <ExerciseDragOverlay
            dayExercise={activeExercise}
            exercise={activeExerciseData}
          />
        ) : activeTrainingDay ? (
          <div className="p-3 bg-white border-2 border-primary-500 rounded-lg shadow-xl cursor-grabbing min-w-[220px]">
            <div className="text-sm font-semibold text-gray-900">
              Day {activeTrainingDay.day_number}{activeTrainingDay.name ? `: ${activeTrainingDay.name}` : ''}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              {(activeTrainingDay.exercises?.length || 0)} exercises
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
