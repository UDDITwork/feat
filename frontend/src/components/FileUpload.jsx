import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { uploadFile } from '../services/api'
import { CheckCircleIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const FileUpload = ({
  fieldName,
  label,
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  maxSize = 10 * 1024 * 1024, // 10MB default
  currentFile,
  onUploadSuccess,
  required = false
}) => {
  const { token } = useParams()
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(currentFile || null)

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file size
    if (file.size > maxSize) {
      toast.error(`File size should not exceed ${maxSize / (1024 * 1024)}MB`)
      e.target.value = ''
      return
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    const allowedTypes = accept.split(',').map(type => type.trim())

    if (!allowedTypes.includes(fileExtension)) {
      toast.error(`Only ${accept} files are allowed`)
      e.target.value = ''
      return
    }

    // Upload file
    try {
      setUploading(true)

      const response = await uploadFile(token, fieldName, file)

      if (response.success) {
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type
        })

        toast.success('File uploaded successfully!')

        if (onUploadSuccess) {
          onUploadSuccess(fieldName, {
            name: file.name,
            size: file.size,
            type: file.type,
            uploaded: true
          })
        }
      } else {
        throw new Error(response.message || 'Upload failed')
      }
    } catch (error) {
      console.error('File upload error:', error)
      toast.error('Failed to upload file')
      e.target.value = ''
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setUploadedFile(null)
    if (onUploadSuccess) {
      onUploadSuccess(fieldName, null)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {!uploadedFile ? (
        <div className="relative">
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {uploading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="animate-spin -full h-4 w-4 border-b-2 border-indigo-600"></div>
                <span className="text-sm text-indigo-600">Uploading...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 -lg">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">{uploadedFile.name}</p>
              <p className="text-xs text-green-700">{formatFileSize(uploadedFile.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-green-700 hover:text-green-900"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Allowed: {accept} | Max size: {maxSize / (1024 * 1024)}MB
      </p>
    </div>
  )
}

export default FileUpload
