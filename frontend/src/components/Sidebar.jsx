import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  HomeIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  UsersIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const Sidebar = ({ isOpen, onClose, currentPath }) => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Send Invitations', href: '/invitations', icon: EnvelopeIcon },
    { name: 'Form Submissions', href: '/submissions', icon: DocumentTextIcon },
    { name: 'Clients', href: '/clients', icon: UsersIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ]

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-white to-teal-50 border-r-2 border-sitabience-100 pt-6 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 mb-8">
            <div className="brand-icon">
              <span className="text-white font-bold text-lg">SI</span>
            </div>
            <div className="ml-4">
              <h2 className="brand-text">SITABIENCE IP</h2>
              <p className="brand-subtitle">Patent Services</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = currentPath === item.href || 
                (item.href === '/dashboard' && currentPath === '/')
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? 'bg-sitabience-50 border-sitabience-500 text-sitabience-700 shadow-md'
                      : 'border-transparent text-teal-700 hover:bg-teal-50 hover:text-teal-800 hover:shadow-sm'
                  } group flex items-center px-4 py-3 text-sm font-semibold border-l-4 transition-all duration-200`}
                >
                  <item.icon
                    className={`${
                      isActive ? 'text-sitabience-500' : 'text-teal-500 group-hover:text-teal-600'
                    } mr-3 h-5 w-5 transition-colors duration-200`}
                  />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 py-6">
            <div className="text-center p-4 bg-white shadow-sm border border-sitabience-100">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-sitabience-500 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-sm">SI</span>
              </div>
              <p className="text-xs text-teal-700 font-medium">© 2025 SITABIENCE IP</p>
              <p className="text-xs text-gray-500">All rights reserved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose}></div>
          
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-gradient-to-b from-white to-teal-50 border-r-2 border-sitabience-100">
            <div className="flex items-center justify-between h-20 px-6 border-b-2 border-sitabience-100">
              <div className="brand-logo">
                <div className="brand-icon">
                  <span className="text-white font-bold text-lg">SI</span>
                </div>
                <div>
                  <h2 className="brand-text">SITABIENCE IP</h2>
                  <p className="brand-subtitle">Patent Services</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-sitabience-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const isActive = currentPath === item.href || 
                  (item.href === '/dashboard' && currentPath === '/')
                
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={`${
                      isActive
                        ? 'bg-sitabience-50 border-sitabience-500 text-sitabience-700 shadow-md'
                        : 'border-transparent text-teal-700 hover:bg-teal-50 hover:text-teal-800 hover:shadow-sm'
                    } group flex items-center px-4 py-3 text-sm font-semibold border-l-4 transition-all duration-200`}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-sitabience-500' : 'text-teal-500 group-hover:text-teal-600'
                      } mr-3 h-5 w-5 transition-colors duration-200`}
                    />
                    {item.name}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
