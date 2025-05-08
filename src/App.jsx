import { useRef, useEffect, useState } from 'react'
import { TonoClient } from './client'

function SelectableList({ items, onSelect }) {
  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {items.map((item, index) => (
        <li
          key={index}
          onClick={() => onSelect(item)}
          className="flex flex-col gap-1 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <span className="font-medium text-gray-900 dark:text-white">{item.full_name}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {item.gender === 'M' ? 'Male' : 'Female'} • {item.country} • DOB: {item.dob}
          </span>
        </li>
      ))}
    </ul>
  )
}

function VerificationForm({ applicantId, onVerify }) {
  const [type, setType] = useState('NIN')
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!value.trim()) return
    onVerify(type, value)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
      <div className="flex gap-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="NIN">NIN</option>
          <option value="BVN">BVN</option>
        </select>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Enter ${type} number`}
          className="flex-[2] rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Verify
        </button>
      </div>
    </form>
  )
}

function VerificationResult({ data }) {
  if (!data) return null

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Verification Result</h3>
      </div>
      <div className="p-4 space-y-4">
        {(data.response_data.photo || data.response_data.entity.photo) && (
          <div className="flex justify-center">
            <img
              src={`data:image/jpeg;base64,${data.response_data.photo || data.response_data.entity.photo}`}
              alt="ID Photo"
              className="h-48 w-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
            />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</div>
            <div className="mt-1 text-gray-900 dark:text-white">{data.status}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Verification Type</div>
            <div className="mt-1 text-gray-900 dark:text-white">{data.verification_type}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</div>
            <div className="mt-1 text-gray-900 dark:text-white">{data.response_data?.name?.name || data.response_data?.entity?.name?.name}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</div>
            <div className="mt-1 text-gray-900 dark:text-white">{data.response_data?.gender || data.response_data?.entity?.gender}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</div>
            <div className="mt-1 text-gray-900 dark:text-white">{data.response_data.date_of_birth || data.response_data?.entity?.date_of_birth}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Status Description</div>
            <div className="mt-1 text-gray-900 dark:text-white">{data.response_data.status_description}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-900 dark:text-white font-medium">Loading....</span>
      </div>
    </div>
  )
}

function App() {
  const client = useRef(new TonoClient(import.meta.env.VITE_API_KEY))
  const [applicants, setApplicants] = useState([])
  const [selectedApplicantId, setSelectedApplicantId] = useState(null)
  const [verificationData, setVerificationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  console.log('[Rendering] App component')

  useEffect(() => {
    async function fetchApplicants() {
      try {
        const response = await client.current.getApplicants()
        setApplicants(response.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchApplicants()
  }, [])

  const handleSelect = (applicant) => {
    setSelectedApplicantId(applicant.applicant_id)
    setVerificationData(null)
  }

  const handleVerify = async (type, value) => {
    if (!selectedApplicantId) return

    try {
      setLoading(true)
      setError(null)
      const response = type === 'NIN'
        ? await client.current.getNINStatus(selectedApplicantId, value)
        : await client.current.getBVNStatus(selectedApplicantId, value)
      setVerificationData(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingOverlay />
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>

  return (
    <main className="container mx-auto max-w-2xl p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Applicants</h1>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
        <SelectableList
          items={applicants.map(a => ({ ...a.provided_info, applicant_id: a.applicant_id }))}
          onSelect={handleSelect}
        />
      </div>
      {selectedApplicantId && (
        <VerificationForm
          applicantId={selectedApplicantId}
          onVerify={handleVerify}
        />
      )}
      {verificationData && <VerificationResult data={verificationData} />}
    </main>
  )
}

export default App
