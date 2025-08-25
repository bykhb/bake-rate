import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabaseClient'

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
  
  const REVIEWS_PER_PAGE = 5

  // Load reviews on component mount
  useEffect(() => {
    loadReviews()
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
    // Reset form
    setRating(0)
    setHoveredRating(0)
    setName('')
    setEmail('')
    setHeadline('')
    setComment('')
  }

  const getRatingLabel = (stars) => {
    const labels = {
      1: "Poor - Needs improvement",
      2: "Fair - Below expectations", 
      3: "Good - Meets expectations",
      4: "Very Good - Exceeds expectations",
      5: "Excellent - Outstanding!"
    }
    return labels[stars] || "Click to rate"
  }

  if (isSubmitted) {
    return (
      <div className="app">
        <div className="success-animation">
          <div className="success-checkmark">✓</div>
          <h2>Thank You So Much!</h2>
          <p>Your feedback means the world to me! It helps me bake even better treats for our future lunches 🍪❤️</p>
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
        <h1 className="brand-logo">Cookies bykhb</h1>
        <p className="brand-subtitle">Artisan Homemade Cookies</p>
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
          <h2 className="cookie-title">CHOCOLATE CHIP SUPREME</h2>
          
          <div className="cookie-rating">
            <div className="stars-display">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="star-display">⭐</span>
              ))}
            </div>
            <span className="rating-count">(6 reviews)</span>
          </div>

          <div className="cookie-price">
            <span className="price-current">$8.00</span>
            <span className="price-original">$10.00</span>
          </div>

          <p className="cookie-description">
            She's nutty, she's rich, and she's not here to play it safe. 
            A bold bite for those who know their worth (and their cookie preference).
          </p>

          <p className="cookie-details">
            Premium flour base with Belgian dark chocolate chips, Madagascar vanilla extract, 
            and brown butter from grass-fed cows. Baked fresh this morning with extra love.
          </p>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section">
        <div className="reviews-header">
          <h2 className="reviews-title">REVIEWS</h2>
          <div className="reviews-tabs">
            <button 
              className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
            <button 
              className={`tab ${activeTab === 'qa' ? 'active' : ''}`}
              onClick={() => setActiveTab('qa')}
            >
              Q&A
            </button>
          </div>
        </div>

        {activeTab === 'reviews' && (
          <div className="reviews-content">
            {reviews.length === 0 ? (
              <div className="no-reviews">
                <div className="no-reviews-icon">⭐</div>
                <h3 className="no-reviews-title">We're looking for stars!</h3>
                <p className="no-reviews-subtitle">Let us know what you think</p>
                <button className="write-review-btn" onClick={openReviewModal}>
                  BE THE FIRST TO WRITE A REVIEW!
                </button>
              </div>
            ) : (
              <div className="reviews-list">
                <div className="reviews-count">
                  {reviews.length} review{reviews.length === 1 ? '' : 's'}
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
                        <span className="review-author">By {review.name}</span>
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
                        Loading...
                      </>
                    ) : (
                      'Load More Reviews'
                    )}
                  </button>
                )}
                
                <div className="reviews-header-with-button">
                  <button className="write-review-btn" onClick={openReviewModal}>
                    WRITE A REVIEW
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
            <h2 className="modal-title">Share your thoughts</h2>
            
            <form className="modal-form" onSubmit={handleSubmitReview}>
              {/* Rating */}
              <div className="form-section">
                <label className="form-label">
                  Rate your experience <span className="required">*</span>
                </label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`rating-star ${star <= (hoveredRating || rating) ? 'filled' : ''}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="form-section">
                <label className="form-label">
                  Write a review <span className="required">*</span>
                </label>
                <textarea
                  className="form-textarea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you like or dislike"
                  required
                />
              </div>

              {/* Headline */}
              <div className="form-section">
                <label className="form-label">
                  Add a headline <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Summarize your experience"
                  required
                />
              </div>

              {/* Name and Email */}
              <div className="form-row">
                <div className="form-section">
                  <label className="form-label">
                    Your name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-section">
                  <label className="form-label">
                    Your email address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-review-btn"
                disabled={rating === 0 || !comment || !headline || !name || !email || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
