import React, { Fragment, useRef, useState, useEffect } from 'react';
import { 
    format, 
    addMonths, 
    subMonths, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
    isToday, 
    startOfWeek, 
    endOfWeek,
    parseISO,
    isValid
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Transition } from '@headlessui/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

interface DatePickerProps {
    label?: string;
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    minDate?: string;
    maxDate?: string;
}

export function DatePicker({ label, value, onChange, placeholder = "Seleccionar fecha", className = "", disabled = false, minDate, maxDate }: DatePickerProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    
    const [inputValue, setInputValue] = useState('');

    // Initialize current month focused based on value
    useEffect(() => {
        if (value) {
            // Parse date defensively so we don't get timezone shift
            const parts = value.split('-');
            if (parts.length === 3) {
                const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                if (isValid(date)) {
                    setCurrentMonth(date);
                    setInputValue(format(date, 'dd/MM/yyyy'));
                }
            } else {
                const date = parseISO(value);
                if (isValid(date)) {
                    setCurrentMonth(date);
                    setInputValue(format(date, 'dd/MM/yyyy'));
                }
            }
        } else {
            setInputValue('');
        }
    }, [value]);

    const selectedDate = value ? (() => {
        const parts = value.split('-');
        return parts.length === 3 
            ? new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])) 
            : parseISO(value);
    })() : null;

    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 }),
        end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
    });

    const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
    const prevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));

    const handleSelectDate = (date: Date, close?: () => void) => {
        const formatted = format(date, 'yyyy-MM-dd');
        onChange(formatted);
        setInputValue(format(date, 'dd/MM/yyyy'));
        close?.();
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setInputValue('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^\d/]/g, ''); // Solo números y slashes
        
        // Auto-formatear dd/MM/yyyy mientras el usuario escribe
        if (val.length === 2 && inputValue.length < 2) val += '/';
        if (val.length === 5 && inputValue.length < 5) val += '/';
        
        if (val.length > 10) val = val.substring(0, 10);
        
        setInputValue(val);

        if (val.length === 10) {
            const parts = val.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                
                const typedDate = new Date(year, month, day);
                
                // Check if it's a valid date and matches the input (e.g. not 31 de Febrero)
                if (isValid(typedDate) && typedDate.getDate() === day && typedDate.getMonth() === month && typedDate.getFullYear() === year) {
                    const formattedForParent = format(typedDate, 'yyyy-MM-dd');
                    const isDisabled = (minDate && formattedForParent < minDate) || (maxDate && formattedForParent > maxDate);
                    
                    if (!isDisabled) {
                        setCurrentMonth(typedDate);
                        onChange(formattedForParent);
                    }
                }
            }
        } else if (val === '') {
            onChange('');
        }
    };

    const weekDays = ['do', 'lu', 'ma', 'mi', 'ju', 'vi', 'sá'];

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close calendar when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [containerRef]);

    return (
        <div ref={containerRef} className={`space-y-1 relative ${className}`}>
            {label && (
                <span className="text-[9px] font-bold text-gray-400 ml-1 uppercase">{label}</span>
            )}
            
            <div className={`
                relative w-full flex items-center justify-between px-3 py-2.5 
                bg-white border text-sm font-medium text-gray-700 
                transition-all rounded-2xl
                ${disabled 
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
                    : 'border-gray-200 hover:border-gray-300 focus-within:border-nutrition-300 focus-within:ring-4 focus-within:ring-nutrition-50'
                }
            `}>
                {/* Instead of Popover, we use absolute positioning and local state */}
                <div className="relative flex items-center w-full">
                    <input
                        ref={inputRef}
                        type="text"
                        disabled={disabled}
                        value={inputValue}
                        onChange={(e) => {
                            handleInputChange(e);
                            if (!isOpen) setIsOpen(true);
                        }}
                        onFocus={() => {
                            if (!isOpen) setIsOpen(true);
                        }}
                        placeholder={placeholder}
                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-gray-700 placeholder:text-gray-400"
                    />

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                        {value && !disabled && (
                            <div 
                                role="button"
                                onClick={(e) => {
                                    handleClear(e as any);
                                    setIsOpen(false);
                                }}
                                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors cursor-pointer z-10"
                            >
                                <X className="w-3.5 h-3.5" />
                            </div>
                        )}

                        <button 
                            type="button"
                            disabled={disabled}
                            className="p-1 hover:bg-nutrition-50 rounded-full text-gray-400 hover:text-nutrition-500 transition-colors focus:outline-none focus:ring-2 focus:ring-nutrition-300 z-10"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsOpen(!isOpen);
                                if (!isOpen) {
                                    setTimeout(() => inputRef.current?.focus(), 10);
                                }
                            }}
                        >
                            <CalendarIcon className={`w-4 h-4 ${isOpen ? 'text-nutrition-500' : ''}`} />
                        </button>
                    </div>

                    <Transition
                        show={isOpen}
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <div className="absolute z-50 w-[280px] mt-2 transform right-0 top-full bg-white rounded-[24px] shadow-lg ring-1 ring-black/5 p-4 border border-gray-100">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <button 
                                        onClick={prevMonth}
                                        className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-500 hover:text-nutrition-600 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm font-black text-gray-800 capitalize">
                                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                                    </span>
                                    <button 
                                        onClick={nextMonth}
                                        className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-500 hover:text-nutrition-600 transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Weekday Headers */}
                                <div className="grid grid-cols-7 mb-2">
                                    {weekDays.map(day => (
                                        <div key={day} className="text-center text-[10px] uppercase font-black text-gray-400 py-1">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Days */}
                                <div className="grid grid-cols-7 gap-1">
                                    {days.map((day, _) => {
                                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                                        const isCurrentMonth = isSameMonth(day, currentMonth);
                                        const isTodayDate = isToday(day);
                                        const dayFormatted = format(day, 'yyyy-MM-dd');
                                        const isDisabledDate = (minDate && dayFormatted < minDate) || (maxDate && dayFormatted > maxDate) || false;

                                        return (
                                            <button
                                                key={day.toISOString()}
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (!isDisabledDate) {
                                                        handleSelectDate(day);
                                                        setIsOpen(false);
                                                    }
                                                }}
                                                disabled={isDisabledDate}
                                                className={`
                                                    aspect-square text-xs font-medium rounded-full flex items-center justify-center
                                                    transition-all relative
                                                    ${!isCurrentMonth ? 'text-gray-300' : ''}
                                                    ${isCurrentMonth && !isSelected && !isDisabledDate ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' : ''}
                                                    ${isSelected ? 'bg-nutrition-600 text-white shadow-md font-bold' : ''}
                                                    ${isTodayDate && !isSelected ? 'text-nutrition-600 font-bold' : ''}
                                                    ${isDisabledDate && isCurrentMonth ? 'opacity-40 cursor-not-allowed text-gray-400' : ''}
                                                `}
                                            >
                                                {format(day, 'd')}
                                                {isTodayDate && !isSelected && (
                                                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-nutrition-500" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Footer Actions */}
                                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            handleClear(e as any);
                                            setIsOpen(false);
                                        }}
                                        className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                                    >
                                        Borrar
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            handleSelectDate(new Date());
                                            setIsOpen(false);
                                        }}
                                        className="text-[10px] font-bold text-nutrition-600 hover:text-nutrition-700 uppercase tracking-widest transition-colors"
                                    >
                                        Hoy
                                    </button>
                                </div>
                            </div>
                        </Transition>
                    </div>
                </div>
            </div>
        );
    }
