import React from 'react'

const ProgressBar = ({ current, total, progress = 0 }) => {
  const percentage = Math.round((current / total) * 100)
  const progressPercentage = Math.max(progress, percentage)

  return (
    <div className="w-full">
      {/* Step Progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {current} of {total}
        </span>
        <span className="text-sm text-gray-500">
          {progressPercentage}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 -full h-2">
        <div
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 -full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between mt-3">
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            className={`flex items-center justify-center w-8 h-8 -full text-xs font-medium transition-colors duration-200 ${
              index + 1 < current
                ? 'bg-primary-500 text-white'
                : index + 1 === current
                ? 'bg-primary-100 text-primary-600 border-2 border-primary-500'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {index + 1 < current ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              index + 1
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProgressBar
