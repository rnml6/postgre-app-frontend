import React, { useState, useEffect, useMemo } from 'react'
import {
  FiGrid,
  FiLayers,
  FiPlus,
  FiUpload,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiCalendar,
  FiRefreshCw
} from 'react-icons/fi'

const API_BASE_URL = 'https://postgre-app-backend.onrender.com'

const PostSection = ({ posts, onSendPost, loading, formatDate }) => {
  const [subTab, setSubTab] = useState('gallery')
  const [showUpload, setShowUpload] = useState(false)
  const [caption, setCaption] = useState('')
  const [images, setImages] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [selectedPost, setSelectedPost] = useState(null)
  const [currentImgIndex, setCurrentImgIndex] = useState(0)
  const [expandedCaptions, setExpandedCaptions] = useState({})

  // Create preview URLs for images
  const [previewUrls, setPreviewUrls] = useState({})

  // Generate and clean up preview URLs
  useEffect(() => {
    const newUrls = {}
    
    images.forEach((img, index) => {
      if (img instanceof File) {
        const uniqueId = `${img.name}-${img.size}-${img.lastModified}-${index}`
        newUrls[uniqueId] = URL.createObjectURL(img)
      }
    })
    
    // Revoke old URLs to prevent memory leaks
    Object.values(previewUrls).forEach(url => {
      if (url) URL.revokeObjectURL(url)
    })
    
    setPreviewUrls(newUrls)
    
    return () => {
      // Cleanup on unmount
      Object.values(newUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url)
      })
    }
  }, [images])

  const years = useMemo(() => {
    const yearSet = new Set(
      posts.map(post => new Date(post.created_at).getFullYear().toString())
    )
    return Array.from(yearSet).sort((a, b) => b - a)
  }, [posts])

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const postDate = new Date(post.created_at)
      const captionMatch = (post.caption || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      const m = (postDate.getMonth() + 1).toString().padStart(2, '0')
      const monthMatch = filterMonth === '' || m === filterMonth

      const y = postDate.getFullYear().toString()
      const yearMatch = filterYear === '' || y === filterYear

      return captionMatch && monthMatch && yearMatch
    })
  }, [posts, searchTerm, filterMonth, filterYear])

  const clearFilters = () => {
    setSearchTerm('')
    setFilterMonth('')
    setFilterYear('')
  }

  const toggleCaption = postId =>
    setExpandedCaptions(prev => ({ ...prev, [postId]: !prev[postId] }))

  const openModal = (post, index = 0) => {
    setSelectedPost(post)
    setCurrentImgIndex(index)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setSelectedPost(null)
    setCurrentImgIndex(0)
    document.body.style.overflow = 'auto'
  }

  const handleNext = e => {
    e?.stopPropagation()
    if (currentImgIndex < selectedPost.images.length - 1) {
      setCurrentImgIndex(prev => prev + 1)
    } else if (subTab === 'gallery') {
      const currentPostIndex = filteredPosts.findIndex(
        p => p.id === selectedPost.id
      )
      if (currentPostIndex < filteredPosts.length - 1) {
        setSelectedPost(filteredPosts[currentPostIndex + 1])
        setCurrentImgIndex(0)
      }
    }
  }

  const handlePrev = e => {
    e?.stopPropagation()
    if (currentImgIndex > 0) {
      setCurrentImgIndex(prev => prev - 1)
    } else if (subTab === 'gallery') {
      const currentPostIndex = filteredPosts.findIndex(
        p => p.id === selectedPost.id
      )
      if (currentPostIndex > 0) {
        const prevPost = filteredPosts[currentPostIndex - 1]
        setSelectedPost(prevPost)
        setCurrentImgIndex(prevPost.images.length - 1)
      }
    }
  }

  useEffect(() => {
    const handleKeyDown = e => {
      if (!selectedPost) return
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPost, currentImgIndex, subTab, filteredPosts])

  const currentPostIdx = filteredPosts.findIndex(
    p => p?.id === selectedPost?.id
  )
  const showPrevArrow =
    subTab === 'gallery'
      ? currentPostIdx > 0 || currentImgIndex > 0
      : currentImgIndex > 0
  const showNextArrow =
    subTab === 'gallery'
      ? currentPostIdx < filteredPosts.length - 1 ||
        currentImgIndex < selectedPost?.images.length - 1
      : currentImgIndex < selectedPost?.images.length - 1

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (images.length === 0) {
      alert('Please select at least one image')
      return
    }

    // Create FormData object for multipart/form-data upload
    const formData = new FormData()
    formData.append('caption', caption)
    
    // Append each image file
    images.forEach((img, index) => {
      formData.append('images', img) // Use 'images' (plural) to match backend expectation
    })
    
    // Call onSendPost with FormData
    await onSendPost(formData)
    
    // Reset form only if upload was successful
    setCaption('')
    setImages([])
    setShowUpload(false)
  }

  return (
    <div className='w-full'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-6'>
        <div className='flex gap-6 border-b border-gray-200 md:border-none'>
          <button
            onClick={() => setSubTab('gallery')}
            className={`pb-2 md:pb-0 flex items-center gap-2 font-bold transition-all ${
              subTab === 'gallery'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-400'
            }`}
          >
            <FiGrid />
            Gallery
          </button>
          <button
            onClick={() => setSubTab('feed')}
            className={`pb-2 md:pb-0 flex items-center gap-2 font-bold transition-all ${
              subTab === 'feed'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-400'
            }`}
          >
            <FiLayers />
            Feed
          </button>
        </div>
        <button
          onClick={() => {
            if (showUpload) {
              setCaption('')
              setImages([])
            }
            setShowUpload(!showUpload)
          }}
          className='bg-red-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 self-start'
        >
          {showUpload ? <FiX /> : <FiPlus />}{' '}
          {showUpload ? 'Cancel' : 'Create Post'}
        </button>
      </div>

      <div className='flex flex-col lg:flex-row gap-3 mb-8'>
        <div className='relative group flex-1'>
          <FiSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors' />
          <input
            type='text'
            placeholder='Search captions...'
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

          <div className='relative flex-1 sm:w-28'>
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
              className='shrink-0 p-3.5 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 hover:text-red-500 transition-all flex items-center justify-center border border-gray-100 shadow-sm'
            >
              <FiRefreshCw className='w-5 h-5' />
            </button>
          )}
        </div>
      </div>

      {showUpload && (
        <form
          onSubmit={handleSubmit}
          className='mb-12 bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-gray-200 max-w-xl mx-auto'
        >
          <h3 className='text-xl font-bold mb-4'>New Post</h3>
          <textarea
            placeholder='Add a caption...'
            className='w-full bg-gray-50 rounded-2xl border-none focus:ring-0 resize-none min-h-[120px] outline-0 p-4 scrollbar-hide'
            value={caption}
            onChange={e => setCaption(e.target.value)}
          />
          <div className='grid grid-cols-4 gap-2 mb-4'>
            {images.map((img, i) => {
              const uniqueId = `${img.name}-${img.size}-${img.lastModified}-${i}`
              return (
                <div
                  key={uniqueId}
                  className='aspect-square rounded-lg overflow-hidden relative group'
                >
                  <img
                    src={previewUrls[uniqueId]}
                    className='w-full h-full object-cover'
                    alt='preview'
                  />
                  <button
                    type='button'
                    onClick={() =>
                      setImages(images.filter((_, idx) => idx !== i))
                    }
                    className='absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100'
                  >
                    <FiX size={12} />
                  </button>
                </div>
              )
            })}
            <label className='aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50'>
              <FiUpload className='text-gray-400' />
              <input
                type='file'
                multiple
                className='hidden'
                onChange={e => {
                  const newFiles = Array.from(e.target.files || [])
                  if (newFiles.length > 0) {
                    // Reset input value to allow uploading same file again
                    e.target.value = null
                    setImages([...images, ...newFiles])
                  }
                }}
                accept='image/*'
              />
            </label>
          </div>
          <button
            disabled={loading || images.length === 0}
            className='w-full bg-black text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50'
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      )}

      {subTab === 'gallery' && (
        <div className='columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4'>
          {filteredPosts.map(post =>
            post.images?.map((img, idx) => (
              <div
                key={`${post.id}-${idx}`}
                onClick={() => openModal(post, idx)}
                className='break-inside-avoid rounded-2xl overflow-hidden group relative cursor-zoom-in border border-gray-100'
              >
                <img
                  src={img.image_url}
                  alt='gallery'
                  className='w-full h-auto object-cover hover:scale-105 transition-transform duration-500'
                />
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'feed' && (
        <div className='max-w-lg mx-auto space-y-10'>
          {filteredPosts.map(post => {
            const imgCount = post.images.length
            return (
              <div
                key={post.id}
                className='bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100'
              >
                <div className='px-4 pt-4 pb-0'>
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500' />
                    <div className='flex flex-col'>
                      <span className='font-bold text-sm leading-none'>
                        Mabait na Bata
                      </span>
                      <span className='text-gray-400 text-[10px] uppercase mt-1'>
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                  </div>
                  {post.caption && (
                    <div className='px-1 mb-3'>
                      <p
                        className={`text-sm text-gray-800 leading-snug break-words whitespace-pre-wrap ${
                          !expandedCaptions[post.id] ? 'line-clamp-4' : ''
                        }`}
                      >
                        {post.caption}
                      </p>
                      {(post.caption.length > 200 ||
                        post.caption.split('\n').length > 4) && (
                        <button
                          onClick={() => toggleCaption(post.id)}
                          className='text-xs font-bold text-blue-600 mt-1 hover:underline'
                        >
                          {expandedCaptions[post.id] ? 'See less' : 'See more'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className='flex flex-col gap-0.5'>
                  {imgCount === 1 && (
                    <div
                      onClick={() => openModal(post, 0)}
                      className='relative cursor-pointer w-full overflow-hidden bg-gray-50 flex justify-center'
                    >
                      <img
                        src={post.images[0].image_url}
                        className='w-full max-h-[450px] object-cover hover:brightness-95 transition-all'
                        alt='post'
                      />
                    </div>
                  )}

                  {(imgCount === 2 || imgCount === 3 || imgCount === 4) && (
                    <div
                      className={`grid gap-0.5 ${
                        imgCount === 3 ? 'grid-cols-3' : 'grid-cols-2'
                      }`}
                    >
                      {post.images.slice(0, 4).map((img, i) => (
                        <div
                          key={i}
                          onClick={() => openModal(post, i)}
                          className='relative cursor-pointer aspect-square overflow-hidden bg-gray-50'
                        >
                          <img
                            src={img.image_url}
                            className='w-full h-full object-cover hover:brightness-90 transition-all'
                            alt='post'
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {imgCount >= 5 && (
                    <>
                      <div className='grid grid-cols-3 gap-0.5'>
                        {post.images.slice(0, 3).map((img, i) => (
                          <div
                            key={i}
                            onClick={() => openModal(post, i)}
                            className='relative cursor-pointer aspect-square overflow-hidden bg-gray-50'
                          >
                            <img
                              src={img.image_url}
                              className='w-full h-full object-cover hover:brightness-90 transition-all'
                              alt='post'
                            />
                          </div>
                        ))}
                      </div>
                      <div className='grid grid-cols-2 gap-0.5'>
                        {post.images.slice(3, 5).map((img, i) => {
                          const actualIdx = i + 3
                          return (
                            <div
                              key={actualIdx}
                              onClick={() => openModal(post, actualIdx)}
                              className='relative cursor-pointer aspect-square overflow-hidden bg-gray-50'
                            >
                              <img
                                src={img.image_url}
                                className='w-full h-full object-cover hover:brightness-90 transition-all'
                                alt='post'
                              />
                              {actualIdx === 4 && imgCount > 5 && (
                                <div className='absolute inset-0 bg-black/60 flex flex-col items-center justify-center'>
                                  <FiLayers className='text-white mb-1' />
                                  <span className='text-white text-xl font-bold'>
                                    +{imgCount - 5}
                                  </span>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedPost && (
        <div
          className='fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-4'
          onClick={closeModal}
        >
          <button
            className='absolute top-6 right-6 text-white text-3xl z-[1001]'
            onClick={closeModal}
          >
            <FiX />
          </button>

          {showPrevArrow && (
            <button
              onClick={handlePrev}
              className='hidden md:flex absolute left-8 z-[1001] bg-white/10 hover:bg-white/20 p-4 rounded-full text-white backdrop-blur-md transition-all'
            >
              <FiChevronLeft size={32} />
            </button>
          )}
          {showNextArrow && (
            <button
              onClick={handleNext}
              className='hidden md:flex absolute right-8 z-[1001] bg-white/10 hover:bg-white/20 p-4 rounded-full text-white backdrop-blur-md transition-all'
            >
              <FiChevronRight size={32} />
            </button>
          )}

          <div
            className='relative max-w-5xl w-full flex flex-col items-center'
            onClick={e => e.stopPropagation()}
          >
            <img
              src={selectedPost.images[currentImgIndex].image_url}
              className='max-h-[75vh] md:max-h-[85vh] w-auto max-w-full object-contain shadow-2xl rounded-lg'
              alt='fullscreen'
            />

            <div className='mt-6 flex items-center gap-6 text-white'>
              <button
                onClick={handlePrev}
                className={`md:hidden p-2 bg-white/10 rounded-full ${
                  !showPrevArrow
                    ? 'opacity-0 pointer-events-none'
                    : 'opacity-100'
                }`}
              >
                <FiChevronLeft size={24} />
              </button>

              <span className='text-[10px] text-gray-400 bg-white/10 px-4 py-2 rounded-full uppercase tracking-widest border border-white/5'>
                Img {currentImgIndex + 1} / {selectedPost.images.length}
              </span>

              <button
                onClick={handleNext}
                className={`md:hidden p-2 bg-white/10 rounded-full ${
                  !showNextArrow
                    ? 'opacity-0 pointer-events-none'
                    : 'opacity-100'
                }`}
              >
                <FiChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredPosts.length === 0 && (
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
  )
}

export default PostSection