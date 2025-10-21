import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAppStore } from '../../store/useAppStore';
import {
  HomeIcon,
  BookOpenIcon,
  UserGroupIcon,
  ClockIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

// Elementos de navegación comunes para todos los usuarios
const commonNavigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Libros', href: '/libros', icon: BookOpenIcon },
];

// Elementos de navegación solo para bibliotecarios
const bibliotecarioNavigation = [
  { name: 'Socios', href: '/socios', icon: UserGroupIcon },
  { name: 'Préstamos', href: '/prestamos', icon: ClockIcon },
];

export const Sidebar: React.FC = () => {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, firebaseUser, signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-200 opacity-50"
            onClick={toggleSidebar}
          ></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-500">
            Biblioteca Digital
          </h1>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-4rem)]">
          <nav className="mt-6 px-3 flex-1 overflow-y-auto">
            <div className="space-y-1">
              {firebaseUser && (
                <>
                  {/* Elementos comunes para todos los usuarios */}
                  {commonNavigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 cursor-pointer hover:opacity-95 ${
                          isActive
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <item.icon
                          className={`mr-3 h-5 w-5 flex-shrink-0 ${
                            isActive
                              ? 'text-primary-500'
                              : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                  
                  {/* Elementos solo para bibliotecarios */}
                  {profile?.role === 'BIBLIOTECARIO' && bibliotecarioNavigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 cursor-pointer hover:opacity-95 ${
                          isActive
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <item.icon
                          className={`mr-3 h-5 w-5 flex-shrink-0 ${
                            isActive
                              ? 'text-primary-500'
                              : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </>
              )}
              {profile?.role === 'BIBLIOTECARIO' && (
                <Link
                  to="/aprobaciones"
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 cursor-pointer hover:opacity-95 ${
                    location.pathname === '/aprobaciones'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  Aprobaciones
                </Link>
              )}
            </div>
          </nav>

          {firebaseUser && (
            <div className="border-t border-gray-200 px-3 py-3" ref={userMenuRef}>
              {/* Botón de usuario con icono */}
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors duration-200 group"
              >
                <div className="flex items-center min-w-0">
                  <UserCircleIcon className="h-8 w-8 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {profile?.nombreCompleto || 'Usuario'}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {firebaseUser.email}
                    </div>
                  </div>
                </div>
                <ChevronDownIcon 
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Menú desplegable tipo modal */}
              {isUserMenuOpen && (
                <div className="absolute left-full bottom-3 ml-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => {
                      navigate('/cambiar-password');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Cambiar contraseña
                  </button>
                  <button
                    onClick={async () => {
                      await signOut();
                      navigate('/login', { replace: true });
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const Header: React.FC = () => {
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            Sistema de Gestión de Biblioteca
          </h2>
        </div>

        <div className="flex items-center space-x-4" />
      </div>
    </header>
  );
};