import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
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

// Optimized helper function with memoization
const useImageUrl = () => {
  const cache = useRef(new Map());
  
  return useCallback((imagePath) => {
    if (!imagePath) return '';
    
    // Check cache first
    if (cache.current.has(imagePath)) {
      return cache.current.get(imagePath);
    }
    
    let url = imagePath;
    
    if (!imagePath.startsWith('http')) {
      if (imagePath.startsWith('/uploads')) {
        url = `${API_BASE_URL}${imagePath}`;
      } else {
        url = `${API_BASE_URL}/uploads/${imagePath}`;
      }
    }
    
    // Cache the result
    cache.current.set(imagePath, url);
    return url;
  }, []);
};

// Optimized object URL management
const useObjectUrls = () => {
  const urlsRef = useRef(new Map());
  
  const createUrl = useCallback((file) => {
    const key = `${file.name}-${file.size}-${file.lastModified}`;
    
    if (urlsRef.current.has(key)) {
      return urlsRef.current.get(key);
    }
    
    const url = URL.createObjectURL(file);
    urlsRef.current.set(key, url);
    return url;
  }, []);
  
  const revokeUrls = useCallback(() => {
    urlsRef.current.forEach(url => URL.revokeObjectURL(url));
    urlsRef.current.clear();
  }, []);
  
  const removeUrl = useCallback((file) => {
    const key = `${file.name}-${file.size}-${file.lastModified}`;
    if (urlsRef.current.has(key)) {
      URL.revokeObjectURL(urlsRef.current.get(key));
      urlsRef.current.delete(key);
    }
  }, []);
  
  useEffect(() => {
    return () => {
      revokeUrls();
    };
  }, [revokeUrls]);
  
  return { createUrl, revokeUrls, removeUrl };
};

// Optimized image upload preview component
const ImageUploadPreview = ({ images, onRemoveImage, createUrl }) => {
  if (images.length === 0) return null;
  
  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4'>
      {images.map((img, i) => (
        <div
          key={`${img.name}-${img.size}-${img.lastModified}-${i}`}
          className='aspect-square rounded-lg overflow-hidden relative group bg-gray-100'
        >
          <img
            src={createUrl(img)}
            className='w-full h-full object-cover'
            alt={`preview-${i}`}
            loading='lazy'
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/200x200?text=Image+Error';
            }}
          />
          <button
            type='button'
            onClick={() => onRemoveImage(i)}
            className='absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition-opacity'
            aria-label={`Remove image ${i + 1}`}
          >
            <FiX size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

// Memoized search and filter component
const SearchAndFilter = React.memo(({
  searchTerm,
  setSearchTerm,
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  months,
  years,
  clearFilters
}) => (
  <div className='flex flex-col lg:flex-row gap-3 mb-8'>
    <div className='relative group flex-1 min-w-0'>
      <FiSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors pointer-events-none' />
      <input
        type='text'
        placeholder='Search captions...'
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className='w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-black/5 outline-none transition-all text-sm md:text-base'
        aria-label='Search captions'
      />
    </div>

    <div className='flex flex-row items-center gap-2 w-full lg:w-auto'>
      <div className='relative flex-1 sm:min-w-[120px]'>
        <select
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          className='w-full pl-4 pr-10 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-black/5 outline-none text-sm appearance-none cursor-pointer'
          aria-label='Filter by month'
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

      <div className='relative flex-1 sm:min-w-[100px]'>
        <select
          value={filterYear}
          onChange={e => setFilterYear(e.target.value)}
          className='w-full pl-4 pr-10 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-black/5 outline-none text-sm appearance-none cursor-pointer'
          aria-label='Filter by year'
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
          aria-label='Clear filters'
        >
          <FiRefreshCw className='w-5 h-5' />
        </button>
      )}
    </div>
  </div>
));

// Memoized gallery view component
const GalleryView = React.memo(({ filteredPosts, openModal, getImageUrl }) => (
  <div className='columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4'>
    {filteredPosts.map(post =>
      post.images?.map((img, idx) => (
        <div
          key={`${post.id}-${img.image_url || idx}`}
          onClick={() => openModal(post, idx)}
          className='break-inside-avoid rounded-2xl overflow-hidden group relative cursor-zoom-in border border-gray-100 bg-gray-50'
        >
          <img
            src={getImageUrl(img.image_url)}
            alt='gallery'
            className='w-full h-auto object-cover hover:scale-105 transition-transform duration-500'
            loading='lazy'
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400?text=Image+Error';
            }}
          />
        </div>
      ))
    )}
  </div>
));

// Upload form component
const UploadForm = ({
  showUpload,
  caption,
  setCaption,
  images,
  handleFileSelect,
  handleRemoveImage,
  handleSubmit,
  handleCancelUpload,
  loading,
  createUrl,
  fileInputRef
}) => {
  if (!showUpload) return null;
  
  return (
    <form
      onSubmit={handleSubmit}
      className='mb-12 bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-gray-200 max-w-xl mx-auto'
    >
      <h3 className='text-xl font-bold mb-4'>New Post</h3>
      <textarea
        placeholder='Add a caption...'
        className='w-full bg-gray-50 rounded-2xl border-none focus:ring-0 resize-none min-h-[120px] outline-0 p-4 scrollbar-hide mb-4'
        value={caption}
        onChange={e => setCaption(e.target.value)}
        aria-label='Post caption'
      />
      
      <ImageUploadPreview
        images={images}
        onRemoveImage={handleRemoveImage}
        createUrl={createUrl}
      />
      
      <div className='flex gap-3'>
        <label className='flex-1 bg-gray-100 hover:bg-gray-200 text-center py-3 rounded-xl font-semibold cursor-pointer transition-colors'>
          <FiUpload className='inline mr-2' />
          Add Images
          <input
            ref={fileInputRef}
            type='file'
            multiple
            className='hidden'
            onChange={handleFileSelect}
            accept='image/*'
            key={images.length} // Force re-render to clear input
          />
        </label>
        
        <button
          type='submit'
          disabled={loading || images.length === 0}
          className='flex-1 bg-black text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-opacity'
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      
      <button
        type='button'
        onClick={handleCancelUpload}
        className='w-full mt-3 bg-gray-100 text-gray-600 py-2 rounded-xl font-semibold hover:bg-gray-200 transition-colors'
      >
        Cancel
      </button>
    </form>
  );
};

// Main PostSection component
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
  
  const fileInputRef = useRef(null);
  const { createUrl, revokeUrls, removeUrl } = useObjectUrls();
  const getImageUrl = useImageUrl();

  // Memoized months and years
  const months = useMemo(() => [
    { val: '01', label: 'Jan' }, { val: '02', label: 'Feb' }, { val: '03', label: 'Mar' },
    { val: '04', label: 'Apr' }, { val: '05', label: 'May' }, { val: '06', label: 'Jun' },
    { val: '07', label: 'Jul' }, { val: '08', label: 'Aug' }, { val: '09', label: 'Sep' },
    { val: '10', label: 'Oct' }, { val: '11', label: 'Nov' }, { val: '12', label: 'Dec' }
  ], []);

  const years = useMemo(() => {
    const yearSet = new Set(
      posts.map(post => new Date(post.created_at).getFullYear().toString())
    );
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [posts]);

  // Optimized filtered posts
  const filteredPosts = useMemo(() => {
    if (!posts.length) return [];
    
    return posts.filter(post => {
      const postDate = new Date(post.created_at);
      const captionMatch = (post.caption || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const m = (postDate.getMonth() + 1).toString().padStart(2, '0');
      const monthMatch = filterMonth === '' || m === filterMonth;

      const y = postDate.getFullYear().toString();
      const yearMatch = filterYear === '' || y === filterYear;

      return captionMatch && monthMatch && yearMatch;
    });
  }, [posts, searchTerm, filterMonth, filterYear]);

  // Optimized handlers
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterMonth('');
    setFilterYear('');
  }, []);

  const toggleCaption = useCallback((postId) => {
    setExpandedCaptions(prev => ({ ...prev, [postId]: !prev[postId] }));
  }, []);

  const openModal = useCallback((post, index = 0) => {
    setSelectedPost(post);
    setCurrentImgIndex(index);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setSelectedPost(null);
    setCurrentImgIndex(0);
    document.body.style.overflow = 'auto';
  }, []);

  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    if (!selectedPost) return;
    
    if (currentImgIndex < selectedPost.images.length - 1) {
      setCurrentImgIndex(prev => prev + 1);
    } else if (subTab === 'gallery') {
      const currentPostIndex = filteredPosts.findIndex(
        p => p.id === selectedPost.id
      );
      if (currentPostIndex < filteredPosts.length - 1) {
        setSelectedPost(filteredPosts[currentPostIndex + 1]);
        setCurrentImgIndex(0);
      }
    }
  }, [selectedPost, currentImgIndex, subTab, filteredPosts]);

  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    if (!selectedPost) return;
    
    if (currentImgIndex > 0) {
      setCurrentImgIndex(prev => prev - 1);
    } else if (subTab === 'gallery') {
      const currentPostIndex = filteredPosts.findIndex(
        p => p.id === selectedPost.id
      );
      if (currentPostIndex > 0) {
        const prevPost = filteredPosts[currentPostIndex - 1];
        setSelectedPost(prevPost);
        setCurrentImgIndex(prevPost.images.length - 1);
      }
    }
  }, [selectedPost, currentImgIndex, subTab, filteredPosts]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPost) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') closeModal();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPost, handleNext, handlePrev, closeModal]);

  // File handling
  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Use Set for deduplication
    const existingKeys = new Set(
      images.map(img => `${img.name}-${img.size}-${img.lastModified}`)
    );
    
    const newImages = files.filter(file => {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      return !existingKeys.has(key);
    });
    
    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
    }
  }, [images]);

  const handleRemoveImage = useCallback((index) => {
    const fileToRemove = images[index];
    removeUrl(fileToRemove);
    setImages(prev => prev.filter((_, idx) => idx !== index));
  }, [images, removeUrl]);

  const handleCancelUpload = useCallback(() => {
    revokeUrls();
    setCaption('');
    setImages([]);
    setShowUpload(false);
  }, [revokeUrls]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (images.length === 0) return;
    
    onSendPost({ caption, images });
    
    revokeUrls();
    setCaption('');
    setImages([]);
    setShowUpload(false);
  }, [caption, images, onSendPost, revokeUrls]);

  // Modal navigation state
  const showPrevArrow = useMemo(() => {
    if (!selectedPost) return false;
    if (subTab === 'gallery') {
      const currentPostIndex = filteredPosts.findIndex(p => p?.id === selectedPost?.id);
      return currentPostIndex > 0 || currentImgIndex > 0;
    }
    return currentImgIndex > 0;
  }, [selectedPost, subTab, filteredPosts, currentImgIndex]);

  const showNextArrow = useMemo(() => {
    if (!selectedPost) return false;
    if (subTab === 'gallery') {
      const currentPostIndex = filteredPosts.findIndex(p => p?.id === selectedPost?.id);
      return currentPostIndex < filteredPosts.length - 1 || 
             currentImgIndex < selectedPost.images.length - 1;
    }
    return currentImgIndex < selectedPost.images.length - 1;
  }, [selectedPost, subTab, filteredPosts, currentImgIndex]);

  // No results component
  const NoResults = () => (
    <div className='text-center py-16 md:py-24 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200'>
      <div className='bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm'>
        <FiSearch className='text-gray-300' size={28} />
      </div>
      <p className='text-gray-500 font-semibold text-sm md:text-base'>
        No matches found for this period.
      </p>
    </div>
  );

  return (
    <div className='w-full'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-6'>
        <div className='flex gap-6 border-b border-gray-200 md:border-none'>
          <button
            onClick={() => setSubTab('gallery')}
            className={`pb-2 md:pb-0 flex items-center gap-2 font-bold transition-all ${
              subTab === 'gallery'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-400 hover:text-gray-600'
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
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <FiLayers />
            Feed
          </button>
        </div>
        <button
          onClick={() => {
            if (showUpload) {
              handleCancelUpload();
            } else {
              setShowUpload(true);
            }
          }}
          className='bg-red-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 self-start'
        >
          {showUpload ? <FiX /> : <FiPlus />}{' '}
          {showUpload ? 'Cancel' : 'Create Post'}
        </button>
      </div>

      {/* Upload Form */}
      <UploadForm
        showUpload={showUpload}
        caption={caption}
        setCaption={setCaption}
        images={images}
        handleFileSelect={handleFileSelect}
        handleRemoveImage={handleRemoveImage}
        handleSubmit={handleSubmit}
        handleCancelUpload={handleCancelUpload}
        loading={loading}
        createUrl={createUrl}
        fileInputRef={fileInputRef}
      />

      {/* Search and Filter */}
      <SearchAndFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterMonth={filterMonth}
        setFilterMonth={setFilterMonth}
        filterYear={filterYear}
        setFilterYear={setFilterYear}
        months={months}
        years={years}
        clearFilters={clearFilters}
      />

      {/* Content */}
      {subTab === 'gallery' ? (
        filteredPosts.length > 0 ? (
          <GalleryView
            filteredPosts={filteredPosts}
            openModal={openModal}
            getImageUrl={getImageUrl}
          />
        ) : (
          <NoResults />
        )
      ) : (
        <FeedView
          filteredPosts={filteredPosts}
          openModal={openModal}
          getImageUrl={getImageUrl}
          formatDate={formatDate}
          expandedCaptions={expandedCaptions}
          toggleCaption={toggleCaption}
        />
      )}

      {/* Modal */}
      {selectedPost && (
        <ImageModal
          selectedPost={selectedPost}
          currentImgIndex={currentImgIndex}
          showPrevArrow={showPrevArrow}
          showNextArrow={showNextArrow}
          handlePrev={handlePrev}
          handleNext={handleNext}
          closeModal={closeModal}
          getImageUrl={getImageUrl}
        />
      )}
    </div>
  );
};

// Extracted Feed View component
const FeedView = React.memo(({
  filteredPosts,
  openModal,
  getImageUrl,
  formatDate,
  expandedCaptions,
  toggleCaption
}) => {
  if (filteredPosts.length === 0) {
    return (
      <div className='text-center py-16 md:py-24 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200'>
        <div className='bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm'>
          <FiSearch className='text-gray-300' size={28} />
        </div>
        <p className='text-gray-500 font-semibold text-sm md:text-base'>
          No posts found.
        </p>
      </div>
    );
  }

  return (
    <div className='max-w-lg mx-auto space-y-10'>
      {filteredPosts.map(post => {
        const imgCount = post.images.length;
        
        return (
          <FeedPost
            key={post.id}
            post={post}
            imgCount={imgCount}
            openModal={openModal}
            getImageUrl={getImageUrl}
            formatDate={formatDate}
            expandedCaptions={expandedCaptions}
            toggleCaption={toggleCaption}
          />
        );
      })}
    </div>
  );
});

// Extracted Feed Post component
const FeedPost = React.memo(({
  post,
  imgCount,
  openModal,
  getImageUrl,
  formatDate,
  expandedCaptions,
  toggleCaption
}) => {
  const renderImages = () => {
    if (imgCount === 1) {
      return (
        <div
          onClick={() => openModal(post, 0)}
          className='relative cursor-pointer w-full overflow-hidden bg-gray-50 flex justify-center'
        >
          <img
            src={getImageUrl(post.images[0].image_url)}
            className='w-full max-h-[450px] object-cover hover:brightness-95 transition-all'
            alt='post'
            loading='lazy'
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x450?text=Image+Error';
            }}
          />
        </div>
      );
    }

    if (imgCount <= 4) {
      return (
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
                src={getImageUrl(img.image_url)}
                className='w-full h-full object-cover hover:brightness-90 transition-all'
                alt='post'
                loading='lazy'
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400?text=Image+Error';
                }}
              />
            </div>
          ))}
        </div>
      );
    }

    // 5+ images
    return (
      <>
        <div className='grid grid-cols-3 gap-0.5'>
          {post.images.slice(0, 3).map((img, i) => (
            <div
              key={i}
              onClick={() => openModal(post, i)}
              className='relative cursor-pointer aspect-square overflow-hidden bg-gray-50'
            >
              <img
                src={getImageUrl(img.image_url)}
                className='w-full h-full object-cover hover:brightness-90 transition-all'
                alt='post'
                loading='lazy'
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400?text=Image+Error';
                }}
              />
            </div>
          ))}
        </div>
        <div className='grid grid-cols-2 gap-0.5'>
          {post.images.slice(3, 5).map((img, i) => {
            const actualIdx = i + 3;
            return (
              <div
                key={actualIdx}
                onClick={() => openModal(post, actualIdx)}
                className='relative cursor-pointer aspect-square overflow-hidden bg-gray-50'
              >
                <img
                  src={getImageUrl(img.image_url)}
                  className='w-full h-full object-cover hover:brightness-90 transition-all'
                  alt='post'
                  loading='lazy'
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400?text=Image+Error';
                  }}
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
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className='bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100'>
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
            {(post.caption.length > 200 || post.caption.split('\n').length > 4) && (
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
        {renderImages()}
      </div>
    </div>
  );
});

// Extracted Image Modal component
const ImageModal = React.memo(({
  selectedPost,
  currentImgIndex,
  showPrevArrow,
  showNextArrow,
  handlePrev,
  handleNext,
  closeModal,
  getImageUrl
}) => (
  <div
    className='fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-4'
    onClick={closeModal}
  >
    <button
      className='absolute top-6 right-6 text-white text-3xl z-[1001] hover:opacity-80 transition-opacity'
      onClick={closeModal}
      aria-label='Close modal'
    >
      <FiX />
    </button>

    {showPrevArrow && (
      <button
        onClick={handlePrev}
        className='hidden md:flex absolute left-8 z-[1001] bg-white/10 hover:bg-white/20 p-4 rounded-full text-white backdrop-blur-md transition-all'
        aria-label='Previous image'
      >
        <FiChevronLeft size={32} />
      </button>
    )}
    
    {showNextArrow && (
      <button
        onClick={handleNext}
        className='hidden md:flex absolute right-8 z-[1001] bg-white/10 hover:bg-white/20 p-4 rounded-full text-white backdrop-blur-md transition-all'
        aria-label='Next image'
      >
        <FiChevronRight size={32} />
      </button>
    )}

    <div
      className='relative max-w-5xl w-full flex flex-col items-center'
      onClick={e => e.stopPropagation()}
    >
      <img
        src={getImageUrl(selectedPost.images[currentImgIndex].image_url)}
        className='max-h-[75vh] md:max-h-[85vh] w-auto max-w-full object-contain shadow-2xl rounded-lg'
        alt='fullscreen'
        loading='eager'
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/1200x800?text=Image+Error';
        }}
      />

      <div className='mt-6 flex items-center gap-6 text-white'>
        <button
          onClick={handlePrev}
          className={`md:hidden p-2 bg-white/10 rounded-full ${
            !showPrevArrow ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-white/20'
          }`}
          aria-label='Previous image'
        >
          <FiChevronLeft size={24} />
        </button>

        <span className='text-[10px] text-gray-400 bg-white/10 px-4 py-2 rounded-full uppercase tracking-widest border border-white/5'>
          Img {currentImgIndex + 1} / {selectedPost.images.length}
        </span>

        <button
          onClick={handleNext}
          className={`md:hidden p-2 bg-white/10 rounded-full ${
            !showNextArrow ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-white/20'
          }`}
          aria-label='Next image'
        >
          <FiChevronRight size={24} />
        </button>
      </div>
    </div>
  </div>
));

export default PostSection;