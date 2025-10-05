import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

const Header = ({ onMenuClick, user }) => {
  const { logout } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white shadow-lg border-b-2 border-sitabience-100">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left side */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sitabience-500 transition-all duration-200"
              onClick={onMenuClick}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <div className="hidden lg:block">
              <div className="brand-logo">
                <div className="brand-icon">
                  <span className="text-white font-bold text-lg">SI</span>
                </div>
                <div>
                  <h1 className="brand-text">SITABIENCE IP</h1>
                  <p className="brand-subtitle">Patent Services & IP Consulting</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                className="p-3 text-teal-600 hover:text-teal-700 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sitabience-500 transition-all duration-200"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" />
                {/* Notification badge */}
                <span className="absolute top-2 right-2 h-3 w-3 bg-sitabience-500 border-2 border-white"></span>
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl border border-gray-100 z-50">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-teal-800 mb-4">Notifications</h3>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-500 p-3 bg-gray-50">
                        No new notifications
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-3 p-3 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-sitabience-500 transition-all duration-200">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-sitabience-500 flex items-center justify-center">
                  <UserCircleIcon className="h-6 w-6 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-teal-800">{user?.name}</p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-teal-600" />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-3 w-56 bg-white shadow-xl border border-gray-100 z-50">
                  <div className="py-2">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-teal-50 text-teal-800' : 'text-gray-700'
                          } flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200`}
                        >
                          <Cog6ToothIcon className="h-4 w-4 mr-3 text-sitabience-500" />
                          Settings
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-red-50 text-red-800' : 'text-gray-700'
                          } flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200`}
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 text-red-500" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
