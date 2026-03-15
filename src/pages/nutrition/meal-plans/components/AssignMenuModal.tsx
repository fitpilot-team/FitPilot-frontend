import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Check, ChefHat, Flame, Loader2, Search, Scale } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { useGetReusableMenuSummary } from '@/features/menus/queries';
import { IReusableMenuSummary } from '@/features/menus/types';
import { matchesAnyNormalizedQuery } from '@/utils/search';

interface AssignMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    professionalId?: number;
    clientName: string;
    onConfirm: (menuIds: number[]) => void;
}

const getErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return 'No se pudieron cargar los menus disponibles.';
};

export function AssignMenuModal({
    isOpen,
    onClose,
    professionalId,
    clientName,
    onConfirm,
}: AssignMenuModalProps) {
    const {
        data: menus = [],
        isLoading,
        isError,
        error,
    } = useGetReusableMenuSummary(professionalId);

    const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMenus = useMemo(() => {
        return menus.filter((menu) =>
            matchesAnyNormalizedQuery([menu.title, menu.description_], searchQuery),
        );
    }, [menus, searchQuery]);

    const toggleMenu = (menuId: number) => {
        setSelectedMenuIds((currentValue) =>
            currentValue.includes(menuId)
                ? currentValue.filter((id) => id !== menuId)
                : [...currentValue, menuId],
        );
    };

    const handleAssign = () => {
        if (selectedMenuIds.length === 0) {
            toast.error('Selecciona al menos un menu');
            return;
        }

        onConfirm(selectedMenuIds);
        onClose();
        setSelectedMenuIds([]);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Asignar menus a ${clientName}`} size="full">
            <div className="space-y-6 h-[80vh] flex flex-col">
                <div className="relative shrink-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar menus..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-base outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar p-1">
                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <p className="text-sm font-semibold text-gray-900 mb-2">No pudimos cargar los menus</p>
                            <p className="text-sm text-gray-500">{getErrorMessage(error)}</p>
                        </div>
                    ) : filteredMenus.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                            <Search className="w-12 h-12 mb-4 opacity-20" />
                            <p>No se encontraron menus</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredMenus.map((menu) => (
                                <AssignMenuCard
                                    key={menu.id}
                                    menu={menu}
                                    isSelected={selectedMenuIds.includes(menu.id)}
                                    onToggle={() => toggleMenu(menu.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 shrink-0">
                    <div className="text-sm font-medium text-gray-500">
                        {selectedMenuIds.length > 0 ? (
                            <span className="text-emerald-600 font-bold">{selectedMenuIds.length} menus seleccionados</span>
                        ) : (
                            'Selecciona menus para asignar'
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleAssign}
                            disabled={selectedMenuIds.length === 0 || isError}
                            className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
                        >
                            <Check className="w-4 h-4" />
                            Asignar menus
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

function AssignMenuCard({
    menu,
    isSelected,
    onToggle,
}: {
    menu: IReusableMenuSummary;
    isSelected: boolean;
    onToggle: () => void;
}) {
    return (
        <div
            onClick={onToggle}
            className={`
                relative rounded-[2rem] p-5 border-2 transition-all cursor-pointer group hover:shadow-lg
                ${isSelected
                    ? 'bg-emerald-50/50 border-emerald-500 shadow-emerald-500/10'
                    : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-emerald-500/5'}
            `}
        >
            <div
                className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200 group-hover:border-emerald-300'}`}
            >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
            </div>

            <div className="flex items-start gap-4 mb-4 pr-8">
                <div className="p-3 bg-emerald-50 rounded-2xl shrink-0">
                    <ChefHat className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-1">
                        {menu.title || `Menu ${menu.id}`}
                    </h4>

                    <div className="flex items-center gap-2">
                        {menu.is_reusable && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                Plantilla
                            </span>
                        )}
                        <span className="text-xs text-gray-400 font-medium">{menu.meal_count} comidas</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                <div className="px-2.5 py-1 bg-gray-50 rounded-lg flex items-center gap-1.5 border border-gray-100">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span className="text-[10px] font-black text-gray-700">{Math.round(menu.total_calories)}</span>
                </div>
                <div className="px-2.5 py-1 bg-gray-50 rounded-lg flex items-center gap-1.5 border border-gray-100">
                    <Scale className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-black text-gray-700">
                        {Math.round(menu.total_equivalents)} eq.
                    </span>
                </div>
            </div>

            <p className="text-xs text-gray-400 font-medium line-clamp-2 mb-4 min-h-[2.5em]">
                {menu.description_ || 'Sin descripcion disponible.'}
            </p>

            <div className="grid grid-cols-2 gap-2">
                {menu.groups_preview.slice(0, 2).map((group) => (
                    <div
                        key={`${menu.id}-${group.id}`}
                        className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-lg border border-gray-100"
                    >
                        <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: group.color_code || '#cbd5e1' }}
                        />
                        <span className="text-[10px] text-gray-500 truncate">{group.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
