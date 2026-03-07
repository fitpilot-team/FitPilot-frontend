import { useEffect, useRef, useState } from 'react';
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
import fitPilotLogo from '../../assets/fitpilot-logo_clean.svg';
import { useAuthStore } from '../../store/newAuthStore';
import { useUIStore } from '../../store/uiStore';
import { useProfessional } from '@/contexts/ProfessionalContext';
import { resolvePlanAccess } from '@/features/subscriptions/planAccess';
import { useUser } from '@/features/users/queries';

interface NavItem {
  nameKey: string;
  href: string;
  icon: React.ComponentType<any>;
}

const trainingConfig: NavItem[] = [
  // { nameKey: 'dashboard', href: '/', icon: HomeIcon },
  { nameKey: 'exercises', href: '/training/exercises', icon: BeakerIcon },
  { nameKey: 'templates', href: '/training/programs', icon: DocumentDuplicateIcon },
];

const nutritionPrimaryItems: NavItem[] = [
  { nameKey: 'dashboard', href: '/', icon: HomeIcon },
  { nameKey: 'agenda', href: '/nutrition/agenda', icon: Calendar },
  { nameKey: 'nutritionClients', href: '/nutrition/clients', icon: UsersIcon },
];

const nutritionConfig: NavItem[] = [
  { nameKey: 'clientPlans', href: '/nutrition/meal-plans/clients-menus', icon: ClipboardDocumentListIcon },
  { nameKey: 'nutritionMealBuilder', href: '/nutrition/meal-plans', icon: ListBulletIcon },
];

const settingsItem: NavItem = { nameKey: 'settings', href: '/profile', icon: Cog6ToothIcon };

function SidebarNavItem({
  item,
  isExpanded,
  locationPath,
  theme,
  t,
}: {
  item: NavItem;
  isExpanded: boolean;
  locationPath: string;
  theme: 'blue' | 'emerald';
  t: (key: string) => string;
}) {
  const Icon = item.icon;
  const isActive = item.href === '/'
    ? locationPath === '/'
    : locationPath.startsWith(item.href);
  const itemName = t(`nav.${item.nameKey}`);
  const isBlue = theme === 'blue';

  return (
    <Link key={item.href} to={item.href} className="group relative block">
      <motion.div
        className={`
          flex items-center gap-3 transition-all duration-200 relative overflow-hidden
          py-2
          ${isExpanded ? 'px-3 rounded-l-xl ml-3' : 'justify-center border-none rounded-none'}
          ${isActive
            ? isBlue
              ? 'bg-blue-50 text-blue-700'
              : 'bg-emerald-50 text-emerald-700'
            : isBlue
              ? `text-gray-500 hover:bg-blue-50 hover:text-blue-700 ${isExpanded ? 'rounded-l-xl ml-3' : ''}`
              : `text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 ${isExpanded ? 'rounded-l-xl ml-3' : ''}`
          }
        `}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >

        {isBlue ? (
          <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
        ) : (
          <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600'}`} />
        )}

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1], delay: 0.03 }}
              className="text-sm font-medium whitespace-nowrap"
            >
              {itemName}
            </motion.span>
          )}
        </AnimatePresence>

        {!isExpanded && (
          <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg">
            {itemName}
          </div>
        )}
      </motion.div>
    </Link>
  );
}

function SidebarSection({
  title,
  titleIcon,
  items,
  isExpanded,
  locationPath,
  theme,
  t,
}: {
  title: string;
  titleIcon: React.ComponentType<any>;
  items: NavItem[];
  isExpanded: boolean;
  locationPath: string;
  theme: 'blue' | 'emerald';
  t: (key: string) => string;
}) {
  const TitleIcon = titleIcon;
  const titleColorClass = theme === 'blue' ? 'text-blue-600' : 'text-emerald-600';

  return (
    <nav className="space-y-2 mt-2 pr-0">
      <div className="px-6 mb-2 flex items-center gap-2">
        <TitleIcon className={`h-4 w-4 ${titleColorClass}`} />
        <AnimatePresence>
          {isExpanded && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`text-xs font-semibold uppercase tracking-wider ${titleColorClass}`}
            >
              {title}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {items.map((item) => (
        <SidebarNavItem
          key={item.href}
          item={item}
          isExpanded={isExpanded}
          locationPath={locationPath}
          theme={theme}
          t={t}
        />
      ))}
    </nav>
  );
}

export function Sidebar() {
  const location = useLocation();
  const { t } = useTranslation('common');
  const { user } = useAuthStore();
  const { userData } = useProfessional();
  const { isSidebarOpen } = useUIStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const accessUser = userData ?? user ?? null;
  const userId = accessUser?.id ? Number(accessUser.id) : undefined;
  const { data: fetchedUser } = useUser(userId);
  const planAccess = resolvePlanAccess(accessUser);
  const showNutrition = planAccess.canAccessNutrition;
  const showTraining = planAccess.canAccessTraining;
  const profilePicture =
    fetchedUser?.profile_picture || accessUser?.profile_picture || null;
  const displayName =
    [fetchedUser?.name, fetchedUser?.lastname].filter(Boolean).join(' ') ||
    accessUser?.full_name ||
    accessUser?.email ||
    'User';
  const displayRole = fetchedUser?.role || accessUser?.role || '';
  const initial = displayName.charAt(0).toUpperCase();
  const sidebarWidth = isExpanded ? 256 : 72;

  useEffect(() => {
    setAvatarLoadError(false);
  }, [profilePicture]);

  useEffect(() => {
    return () => {
      if (expandTimerRef.current) {
        clearTimeout(expandTimerRef.current);
      }

      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
      }
    };
  }, []);

  const handleExpand = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }

    if (isExpanded || expandTimerRef.current) {
      return;
    }

    expandTimerRef.current = setTimeout(() => {
      setIsExpanded(true);
      expandTimerRef.current = null;
    }, 80);
  };

  const handleCollapse = () => {
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }

    if (!isExpanded || collapseTimerRef.current) {
      return;
    }

    collapseTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
      collapseTimerRef.current = null;
    }, 120);
  };


  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: sidebarWidth, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{
            width: { type: 'spring', stiffness: 220, damping: 28, mass: 0.9 },
            opacity: { duration: 0.22, ease: 'easeOut' },
          }}
          onMouseEnter={handleExpand}
          onMouseLeave={handleCollapse}
          className="relative bg-white/80 backdrop-blur-xl border-r border-gray-200/50 min-h-screen shadow-lg shadow-gray-200/20 z-50 overflow-hidden flex flex-col"
        >

      <motion.div className={`py-5 border-b border-gray-100 transition-all overflow-hidden ${isExpanded ? 'px-4' : 'px-2 flex justify-center'}`} layout>
        <div className="flex items-center gap-3">
          <motion.div
            className="shrink-0 w-14 h-14 rounded-xl bg-transparent flex items-center justify-center overflow-hidden"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img src={fitPilotLogo} alt="FitPilot" className="w-full h-full object-contain scale-[1.75]" />
          </motion.div>
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
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
        <nav className="space-y-2 pr-0">
          {nutritionPrimaryItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              item={item}
              isExpanded={isExpanded}
              locationPath={location.pathname}
              theme="blue"
              t={t}
            />
          ))}
        </nav>

        <div className="mx-6 border-t border-gray-200/50" />

        {showTraining && (
          <>
            <SidebarSection
              title={t('nav.training')}
              titleIcon={UserIcon}
              items={trainingConfig}
              isExpanded={isExpanded}
              locationPath={location.pathname}
              theme="blue"
              t={t}
            />
            <div className="mx-6 border-t border-gray-200/50" />
          </>
        )}

        {showNutrition && (
          <>
            <SidebarSection
              title={t('nav.nutrition')}
              titleIcon={Utensils}
              items={nutritionConfig}
              isExpanded={isExpanded}
              locationPath={location.pathname}
              theme="emerald"
              t={t}
            />
            <div className="mx-6 border-t border-gray-200/50" />
          </>
        )}

        <nav className="space-y-2 mt-2">
          <SidebarNavItem
            item={settingsItem}
            isExpanded={isExpanded}
            locationPath={location.pathname}
            theme="blue"
            t={t}
          />
        </nav>
      </div>

      {user && (
        <motion.div
          className="mt-auto px-3 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-transparent"
          layout
        >
          <div className="flex items-center gap-3">
            <Link to="/profile" className="shrink-0">
              <motion.div
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25"
                whileHover={{ scale: 1.05 }}
              >
                {profilePicture && !avatarLoadError ? (
                  <img
                    src={profilePicture}
                    alt={displayName}
                    className="h-full w-full rounded-xl object-cover"
                    onError={() => setAvatarLoadError(true)}
                  />
                ) : (
                  initial
                )}
              </motion.div>
            </Link>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 capitalize">{displayRole}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </motion.aside>
      )}
    </AnimatePresence>
  );
}




