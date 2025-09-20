import React from 'react'
import { NavLink } from 'react-router-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

const MobileMenu = ({ isOpen, onClose, currentPath }) => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Send Invitations', href: '/invitations', icon: '📧' },
    { name: 'Form Submissions', href: '/submissions', icon: '📄' },
    { name: 'Clients', href: '/clients', icon: '👥' },
    { name: 'Analytics', href: '/analytics', icon: '📊' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ]

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 flex z-40">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" />
                  </button>
                </div>
              </Transition.Child>

              {/* Logo */}
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <div className="gradient-bg w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SI</span>
                  </div>
                  <div className="ml-3">
                    <h2 className="text-lg font-semibold text-gray-900">SITABIENCEIP</h2>
                    <p className="text-xs text-gray-500">Patent Services</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="mt-8 px-2 space-y-1">
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
                            ? 'bg-primary-50 border-primary-500 text-primary-700'
                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-2 py-2 text-base font-medium rounded-md border-l-4 transition-colors duration-200`}
                      >
                        <span className="mr-3 text-lg">{item.icon}</span>
                        {item.name}
                      </NavLink>
                    )
                  })}
                </nav>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="text-xs text-gray-500 text-center w-full">
                  <p>© 2025 SITABIENCEIP</p>
                  <p>All rights reserved</p>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
          <div className="flex-shrink-0 w-14">{/* Force sidebar to shrink to fit close icon */}</div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default MobileMenu
