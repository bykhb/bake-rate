import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabaseClient'
import { translations } from './translations'

function App() {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [headline, setHeadline] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [reviews, setReviews] = useState([])
  const [activeTab, setActiveTab] = useState('reviews')
  const [reviewsPage, setReviewsPage] = useState(1)
  const [hasMoreReviews, setHasMoreReviews] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'en'
  })
  
  const REVIEWS_PER_PAGE = 5
  const t = translations[currentLanguage]

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'ko' : 'en'
    setCurrentLanguage(newLanguage)
    localStorage.setItem('preferredLanguage', newLanguage)
  }


  // Load reviews on component mount and set page title
  useEffect(() => {
    loadReviews()
    
    // Set environment-specific page title
    const environment = import.meta.env.VITE_ENVIRONMENT
    const isDev = environment !== 'production'
    const titleSuffix = isDev ? ' - DEV' : ''
    document.title = `🍪 Rate My Cookie!${titleSuffix}`
  }, [])

  const loadReviews = async (page = 1, append = false) => {
    try {
      const from = (page - 1) * REVIEWS_PER_PAGE
      const to = from + REVIEWS_PER_PAGE - 1

      const { data, error, count } = await supabase
        .from('feedback')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('Error loading reviews:', error)
      } else {
        const newReviews = data || []
        
        if (append) {
          setReviews(prev => [...prev, ...newReviews])
        } else {
          setReviews(newReviews)
        }

        // Check if there are more reviews
        const totalReviews = count || 0
        const loadedSoFar = append ? reviews.length + newReviews.length : newReviews.length
        setHasMoreReviews(loadedSoFar < totalReviews)
      }
    } catch (error) {
      console.error('Unexpected error loading reviews:', error)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert([
          {
            rating: rating,
            name: name || null,
            email: email || null,
            headline: headline || null,
            comment: comment || null
          }
        ])

      if (error) {
        console.error('Error saving review:', error)
        alert(`Error: ${error.message}. Please check console for details.`)
      } else {
        console.log('Review saved successfully:', data)
        setIsSubmitted(true)
        // Reset form and close modal
        setTimeout(() => {
          setRating(0)
          setHoveredRating(0)
          setName('')
          setEmail('')
          setHeadline('')
          setComment('')
          setIsSubmitted(false)
          setShowModal(false)
          loadReviews() // Reload reviews from beginning
          setReviewsPage(1) // Reset pagination
        }, 2000)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Sorry, there was an error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadMoreReviews = async () => {
    if (loadingMore || !hasMoreReviews) return
    
    setLoadingMore(true)
    const nextPage = reviewsPage + 1
    await loadReviews(nextPage, true)
    setReviewsPage(nextPage)
    setLoadingMore(false)
  }

  const openReviewModal = () => {
    setShowModal(true)
  }

  const closeReviewModal = () => {
    setShowModal(false)
    // Reset all form states
    setRating(0)
    setHoveredRating(0)
    setIsDragging(false)
    setName('')
    setEmail('')
    setHeadline('')
    setComment('')
  }

  // Mobile touch functions for star rating
  const handleTouchStart = () => {
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    
    const touch = e.touches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    
    if (element && element.classList.contains('rating-star')) {
      const starValue = parseInt(element.dataset.star)
      if (starValue) {
        setHoveredRating(starValue)
        setRating(starValue)
        // Update focus to the dragged star and blur others
        const allStars = document.querySelectorAll('.rating-star')
        allStars.forEach(star => star.blur())
        element.focus()
      }
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setHoveredRating(0)
  }

  const handleStarClick = (starValue) => {
    // Force update both states immediately
    setRating(starValue)
    setHoveredRating(0)
    setIsDragging(false) // Ensure dragging state is cleared
  }

  const getRatingLabel = (stars) => {
    const labels = {
      1: t.ratingPoor,
      2: t.ratingFair,
      3: t.ratingGood,
      4: t.ratingVeryGood,
      5: t.ratingExcellent
    }
    return labels[stars] || t.clickToRate
  }

  if (isSubmitted) {
    return (
      <div className="app">
        <div className="success-animation">
          <div className="success-checkmark">✓</div>
          <h2>{t.thankYou || 'Thank You So Much!'}</h2>
          <p>{t.feedbackMessage || 'Your feedback means the world to me! It helps me bake even better treats for our future lunches 🍪❤️'}</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Elegant Header */}
      <header>
        <div className="header-content">
          <div className="brand-info">
            <h1 className="brand-logo">{t.brandTitle}</h1>
            <p className="brand-subtitle">{t.brandSubtitle}</p>
          </div>
          <div className="language-switcher" onClick={toggleLanguage}>
            <button 
              className={`lang-option ${currentLanguage === 'en' ? 'active' : ''}`}
              aria-label="Switch to English"
            >
              🇺🇸 EN
            </button>
            <button 
              className={`lang-option ${currentLanguage === 'ko' ? 'active' : ''}`}
              aria-label="Switch to Korean"
            >
              🇰🇷 KO
            </button>
          </div>
        </div>
      </header>

      {/* Premium Cookie Showcase */}
      <section className="cookie-showcase">
        <div className="cookie-images">
          <div className="main-cookie-image">
            <div className="image-placeholder">
              <div className="image-placeholder-icon">📸</div>
              <div className="image-placeholder-text">Cookie photo will appear here</div>
            </div>
          </div>
          <div className="thumbnail-row">
            <div className="thumbnail">
              <div className="thumbnail-icon">📷</div>
            </div>
            <div className="thumbnail">
              <div className="thumbnail-icon">📷</div>
            </div>
            <div className="thumbnail">
              <div className="thumbnail-icon">📷</div>
            </div>
          </div>
        </div>

        <div className="cookie-info">
          <h2 className="cookie-title">{t.cookieTitle}</h2>
          
          <div className="cookie-rating">
            <div className="stars-display">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="star-display">⭐</span>
              ))}
            </div>
            <span className="rating-count">(6 {t.reviewCountPlural})</span>
          </div>

          <div className="cookie-price">
            <span className="price-current">$8.00</span>
            <span className="price-original">$10.00</span>
          </div>

          <p className="cookie-description">
            {t.cookieDescription}
          </p>

          <p className="cookie-details">
            {t.cookieDetails}
          </p>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section">
        <div className="reviews-header">
          <h2 className="reviews-title">{t.reviewsTitle}</h2>
          <div className="reviews-tabs">
            <button 
              className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              {t.reviewsTab}
            </button>
            <button 
              className={`tab ${activeTab === 'qa' ? 'active' : ''}`}
              onClick={() => setActiveTab('qa')}
            >
              {t.qaTab}
            </button>
          </div>
        </div>

        {activeTab === 'reviews' && (
          <div className="reviews-content">
            {reviews.length === 0 ? (
              <div className="no-reviews">
                <div className="no-reviews-icon">⭐</div>
                <h3 className="no-reviews-title">{t.noReviewsTitle}</h3>
                <p className="no-reviews-subtitle">{t.noReviewsSubtitle}</p>
                <button className="write-review-btn" onClick={openReviewModal}>
                  {t.firstReviewButton}
                </button>
              </div>
            ) : (
              <div className="reviews-list">
                <div className="reviews-count">
                  {reviews.length} {reviews.length === 1 ? t.reviewCount : t.reviewCountPlural}
                </div>
                
                {reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          className="review-star"
                          style={{
                            opacity: star <= review.rating ? 1 : 0.3
                          }}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    
                    {review.headline && (
                      <h3 className="review-headline">{review.headline}</h3>
                    )}
                    
                    <div className="review-meta">
                      {review.name && (
                        <span className="review-author">{t.byAuthor} {review.name}</span>
                      )}
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {review.comment && (
                      <p className="review-text">{review.comment}</p>
                    )}
                  </div>
                ))}
                
                {hasMoreReviews && (
                  <button 
                    className="load-more-btn"
                    onClick={loadMoreReviews}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <span className="load-more-spinner"></span>
                        {t.loading}
                      </>
                    ) : (
                      t.loadMoreButton
                    )}
                  </button>
                )}
                
                <div className="reviews-header-with-button">
                  <button className="write-review-btn" onClick={openReviewModal}>
                    {t.writeReviewButton}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Review Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeReviewModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeReviewModal}>×</button>
            <h2 className="modal-title">{t.modalTitle}</h2>
            
            <form className="modal-form" onSubmit={handleSubmitReview}>
              {/* Rating */}
              <div className="form-section">
                <label className="form-label">
                  {t.rateExperience} <span className="required">{t.required}</span>
                </label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`rating-star ${(hoveredRating > 0 && star <= hoveredRating) || (hoveredRating === 0 && star <= rating) ? 'filled' : ''}`}
                      data-star={star}
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => {
                        if (!isDragging) {
                          setHoveredRating(star)
                        }
                      }}
                      onMouseLeave={() => {
                        if (!isDragging) {
                          setHoveredRating(0)
                        }
                      }}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="form-section">
                <label className="form-label">
                  {t.writeTitle} <span className="required">{t.required}</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder={t.titlePlaceholder}
                  required
                />
              </div>

              {/* Review Text */}
              <div className="form-section">
                <label className="form-label">
                  {t.writeReview} <span className="required">{t.required}</span>
                </label>
                <textarea
                  className="form-textarea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t.reviewPlaceholder}
                  required
                />
              </div>

              {/* Name */}
              <div className="form-section">
                <label className="form-label">
                  {t.yourName} <span className="required">{t.required}</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="submit-review-btn"
                disabled={rating === 0 || !comment || !headline || !name || isSubmitting}
              >
                {isSubmitting ? t.submitting : t.sendButton}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
