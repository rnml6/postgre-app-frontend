import React, { useState, useMemo } from 'react'
import {
  FiPlus,
  FiSend,
  FiX,
  FiMaximize2,
  FiSearch,
  FiCalendar,
  FiRefreshCw
} from 'react-icons/fi'
import MessageModal from './MessageModal'

const MessageSection = ({ messages, onSendMessage, loading, formatDate }) => {
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [selectedMessage, setSelectedMessage] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    onSendMessage(content)
    setContent('')
    setShowForm(false)
  }

  const years = useMemo(() => {
    const yearSet = new Set(
      messages.map(msg => new Date(msg.created_at).getFullYear().toString())
    )
    return Array.from(yearSet).sort((a, b) => b - a)
  }, [messages])

  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      const msgDate = new Date(msg.created_at)
      const contentMatch = (msg.content || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      const m = (msgDate.getMonth() + 1).toString().padStart(2, '0')
      const monthMatch = filterMonth === '' || m === filterMonth

      const y = msgDate.getFullYear().toString()
      const yearMatch = filterYear === '' || y === filterYear

      return contentMatch && monthMatch && yearMatch
    })
  }, [messages, searchTerm, filterMonth, filterYear])

  const clearFilters = () => {
    setSearchTerm('')
    setFilterMonth('')
    setFilterYear('')
  }

  const months = [
    { val: '01', label: 'Jan' },
    { val: '02', label: 'Feb' },
    { val: '03', label: 'Mar' },
    { val: '04', label: 'Apr' },
    { val: '05', label: 'May' },
    { val: '06', label: 'Jun' },
    { val: '07', label: 'Jul' },
    { val: '08', label: 'Aug' },
    { val: '09', label: 'Sep' },
    { val: '10', label: 'Oct' },
    { val: '11', label: 'Nov' },
    { val: '12', label: 'Dec' }
  ]

  return (
    <div className='w-full'>
      <MessageModal
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
        formatDate={formatDate}
      />

      <div className='flex justify-between items-center mb-6 md:mb-8'>
        <div className='pl-1'>
          <h2 className='text-xl md:text-3xl font-extrabold tracking-tight text-black'>
            Messages
          </h2>
          <p className='pl-0.5 text-gray-500 text-[10px] md:text-sm font-medium'>
            {filteredMessages.length} notes found
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold transition-all shadow-sm text-sm md:text-base ${
            showForm
              ? 'bg-gray-200 text-gray-700'
              : 'bg-black text-white hover:bg-gray-800 active:scale-95'
          }`}
        >
          {showForm ? <FiX size={16} /> : <FiPlus size={16} />}
          <span>{showForm ? 'Cancel' : 'New Note'}</span>
        </button>
      </div>

      <div className='flex flex-col lg:flex-row gap-3 mb-8'>
        <div className='relative group flex-1'>
          <FiSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors' />
          <input
            type='text'
            placeholder='Search keywords...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-black/5 outline-none transition-all text-sm md:text-base'
          />
        </div>

        <div className='flex flex-row items-center gap-2 w-full lg:w-auto'>
          <div className='relative flex-1 sm:w-36'>
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className='w-full pl-4 pr-10 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-black/5 outline-none text-sm appearance-none cursor-pointer'
            >
              <option value=''>All Months</option>
              {months.map(m => (
                <option key={m.val} value={m.val}>
                  {m.label}
                </option>
              ))}
            </select>
            <FiCalendar
              className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'
              size={14}
            />
          </div>

          <div className='relative flex-1 sm:w-32'>
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className='w-full pl-4 pr-10 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-black/5 outline-none text-sm appearance-none cursor-pointer'
            >
              <option value=''>All Years</option>
              {years.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <FiCalendar
              className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'
              size={14}
            />
          </div>

          {(searchTerm || filterMonth || filterYear) && (
            <button
              onClick={clearFilters}
              title='Clear Filters'
              className='shrink-0 p-3.5 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 hover:text-red-500 transition-all flex items-center justify-center border border-gray-100 shadow-sm active:rotate-180 duration-500'
            >
              <FiRefreshCw className='w-5 h-5' />
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className='mb-10 bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-gray-200 animate-in slide-in-from-top-4 duration-300 '
        >
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder='Share something...'
            className='w-full scrollbar-hide bg-gray-50 rounded-2xl border-none focus:ring-0 resize-none min-h-[120px] text-base md:text-lg outline-0 p-4'
            required
          />
          <div className='flex justify-end mt-4'>
            <button
              disabled={loading || !content.trim()}
              className='bg-blue-600 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-30 transition-all active:scale-95'
            >
              <FiSend /> {loading ? 'Posting...' : 'Post Note'}
            </button>
          </div>
        </form>
      )}

      <div className='grid gap-4'>
        {filteredMessages.map(msg => (
          <div
            key={msg.id}
            onClick={() => setSelectedMessage(msg)}
            className='group bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer relative overflow-hidden'
          >
            <div className='flex flex-col gap-3'>
              <p className='text-gray-700 text-sm md:text-lg leading-relaxed break-words whitespace-pre-wrap line-clamp-4 group-hover:text-black transition-colors overflow-hidden'>
                {msg.content}
              </p>

              <div className='flex items-center justify-between mt-2'>
                <div className='flex items-center gap-2 text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest'>
                  <FiCalendar size={12} className='text-blue-500' />
                  <span>{formatDate(msg.created_at)}</span>
                </div>
                <div className='flex items-center gap-1 text-blue-600 text-[10px] md:text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity'>
                  <span>View Full Note</span>
                  <FiMaximize2 />
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredMessages.length === 0 && (
          <div className='text-center py-16 md:py-24 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200'>
            <div className='bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm'>
              <FiSearch className='text-gray-300' size={28} />
            </div>
            <p className='text-gray-500 font-semibold text-sm md:text-base'>
              No matches found for this period.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageSection
