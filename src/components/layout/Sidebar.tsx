import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HomeIcon,
  BeakerIcon,
  DocumentDuplicateIcon,
  Cog6ToothIcon,
  UserIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { Calendar, Utensils } from 'lucide-react';
import fitPilotLogo from '../../assets/favicon.ico';
import { useAuthStore } from '../../store/newAuthStore';
import { useUIStore } from '../../store/uiStore';

interface NavItem {
  nameKey: string;
  href: string;
  icon: React.ComponentType<any>;
}

const trainingConfig: NavItem[] = [
  { nameKey: 'dashboard', href: '/', icon: HomeIcon },
  { nameKey: 'exercises', href: '/training/exercises', icon: BeakerIcon },
  { nameKey: 'templates', href: '/training/programs', icon: DocumentDuplicateIcon },
  { nameKey: 'settings', href: '/profile', icon: Cog6ToothIcon },
];

const nutritionConfig: NavItem[] = [
  { nameKey: 'dashboard', href: '/nutrition', icon: HomeIcon },
  { nameKey: 'agenda', href: '/nutrition/agenda', icon: Calendar },
  { nameKey: 'nutritionClients', href: '/nutrition/clients', icon: UsersIcon },
  { nameKey: 'clientPlans', href: '/nutrition/meal-plans/clients-menus', icon: ClipboardDocumentListIcon },
  { nameKey: 'nutritionMealBuilder', href: '/nutrition/meal-plans', icon: ListBulletIcon },
];

function SidebarSection({
  title,
  titleIcon,
  items,
  isExpanded,
  locationPath,
  accentClass,
  t,
}: {
  title: string;
  titleIcon: React.ComponentType<any>;
  items: NavItem[];
  isExpanded: boolean;
  locationPath: string;
  accentClass: string;
  t: (key: string) => string;
}) {
  const TitleIcon = titleIcon;

  return (
    <nav className="px-3 space-y-2">
      <div className="px-3 mb-2 flex items-center gap-2">
        <TitleIcon className="h-4 w-4 text-gray-600" />
        <AnimatePresence>
          {isExpanded && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              {title}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === '/'
          ? locationPath === '/'
          : locationPath.startsWith(item.href);
        const itemName = t(`nav.${item.nameKey}`);

        return (
          <Link key={item.href} to={item.href} className="group relative block">
            <motion.div
              className={`
                flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden
                ${isExpanded ? 'px-3' : 'justify-center'}
                ${isActive ? `${accentClass} text-gray-900` : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}
              `}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  layoutId={`active-${title}`}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-gray-700"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              <Icon className="h-4.5 w-4.5" />

              {isExpanded && (
                <span className="text-sm font-medium whitespace-nowrap">{itemName}</span>
              )}

              {!isExpanded && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg">
                  {itemName}
                </div>
              )}
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const location = useLocation();
  const { t } = useTranslation('common');
  const { user } = useAuthStore();
  const { isSidebarOpen } = useUIStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isSidebarOpen) return null;

  const sidebarWidth = isExpanded ? 256 : 72;

  return (
    <motion.aside
      initial={{ width: 72 }}
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="relative bg-white/80 backdrop-blur-xl border-r border-gray-200/50 min-h-screen shadow-lg shadow-gray-200/20 z-50 overflow-hidden flex flex-col"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700" />

      <motion.div className="px-4 py-5 border-b border-gray-100" layout>
        <div className="flex items-center gap-3">
          <motion.div
            className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden"
            whileHover={{ scale: 1.05, rotate: 4 }}
            transition={{ duration: 0.2 }}
          >
            <img src={fitPilotLogo} alt="FitPilot" className="h-7 w-7 object-contain" />
          </motion.div>
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent whitespace-nowrap">
                  {t('appName')}
                </h1>
                <p className="text-xs text-gray-400 font-medium whitespace-nowrap">{t('appTagline')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="py-4 flex flex-col gap-4">
        <SidebarSection
          title={t('nav.training')}
          titleIcon={UserIcon}
          items={trainingConfig}
          isExpanded={isExpanded}
          locationPath={location.pathname}
          accentClass="bg-blue-50"
          t={t}
        />

        <div className="mx-3 border-t border-gray-200/50" />

        <SidebarSection
          title={t('nav.nutrition')}
          titleIcon={Utensils}
          items={nutritionConfig}
          isExpanded={isExpanded}
          locationPath={location.pathname}
          accentClass="bg-emerald-50"
          t={t}
        />
      </div>

      {user && (
        <motion.div
          className="mt-auto px-3 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-transparent"
          layout
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25"
              whileHover={{ scale: 1.05 }}
            >
              {(user.full_name || user.email).charAt(0).toUpperCase()}
            </motion.div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name || user.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
}
