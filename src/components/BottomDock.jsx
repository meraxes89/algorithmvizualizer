
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, Terminal } from 'lucide-react';
import GitLabIcon from './GitLabIcon';

const BottomDock = () => {
  const location = useLocation();

  const dockItems = [
    {
      id: 'home',
      label: 'Home',
      path: '/',
      icon: Home,
      isExternal: false,
    },
    {
      id: 'explore',
      label: 'Explore',
      path: '/algorithms',
      icon: Compass,
      isExternal: false,
    },
    {
      id: 'playground',
      label: 'Playground',
      path: '/playground',
      icon: Terminal,
      isExternal: false,
    },
    {
      id: 'gitlab',
      label: 'GitLab',
      path: 'https://gitlab.com/sireenyadav/algorithmvizualizer',
      icon: GitLabIcon,
      isExternal: true,
    },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto transition-all duration-300">
      <div className="flex items-center gap-1 sm:gap-1.5 px-3 py-2 rounded-full border border-slate-200/80 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-xl backdrop-saturate-200 shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]">
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = !item.isExternal && (
            item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path)
          );

          const innerContent = (
            <>
              {/* Glassy Sliding Active Highlight Pill */}
              {isActive && (
                <motion.div
                  layoutId="activeBottomDockPill"
                  className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-full border border-indigo-200/80 dark:border-zinc-700/80 shadow-md shadow-indigo-500/10 dark:shadow-indigo-500/20 backdrop-blur-md z-0"
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 32,
                  }}
                />
              )}

              <div className="relative z-10 flex items-center gap-2 px-3.5 py-1.5">
                <Icon 
                  className={`w-4 h-4 transition-all duration-200 ${
                    item.id === 'gitlab'
                      ? 'text-orange-500 fill-current'
                      : isActive
                      ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                      : 'text-stone-600 dark:text-stone-400 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`} 
                />
                <span className={`text-[12px] font-semibold tracking-tight transition-colors duration-200 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-stone-700 dark:text-stone-300 group-hover:text-slate-900 dark:group-hover:text-white'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse ml-0.5" />
                )}
              </div>
            </>
          );

          if (item.isExternal) {
            return (
              <motion.a
                key={item.id}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.92 }}
                className="group relative flex items-center rounded-full hover:bg-stone-100/80 dark:hover:bg-zinc-900/80 transition-colors"
                title={item.label}
              >
                {innerContent}
              </motion.a>
            );
          }

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.92 }}
              className="relative flex items-center"
            >
              <Link
                to={item.path}
                className="group relative flex items-center rounded-full transition-colors"
                title={item.label}
              >
                {innerContent}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BottomDock;
