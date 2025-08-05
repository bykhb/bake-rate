import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabaseClient'

function App() {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [progress, setProgress] = useState(0)

  // Calculate progress based on filled fields
  useEffect(() => {
    let currentProgress = 0
    if (rating > 0) currentProgress += 60 // Rating is most important
    if (comment.trim()) currentProgress += 40 // Comment adds value
    setProgress(currentProgress)
  }, [rating, comment])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert([
          {
            rating: rating,
            name: name || null,
            comment: comment || null
          }
        ])

      if (error) {
        console.error('Error saving feedback:', error)
        alert(`Error: ${error.message}. Please check console for details.`)
      } else {
        console.log('Feedback saved successfully:', data)
        setIsSubmitted(true)
        // Reset form after 3 seconds
        setTimeout(() => {
          setRating(0)
          setHoveredRating(0)
          setName('')
          setComment('')
          setIsSubmitted(false)
          setProgress(0)
        }, 3000)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Sorry, there was an error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
          <h2>Thank You!</h2>
          <p>Your feedback helps us make better cookies! 🍪</p>
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
      <header>
        <h1>🍪 Rate My Cookie!</h1>
        {progress > 0 && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress}% Complete</span>
          </div>
        )}
      </header>

      <main>
        {/* Cookie Photo Section */}
        <section className="cookie-showcase">
          <div className="cookie-photo">
            <div className="cookie-placeholder">
              <span className="cookie-emoji">🍪</span>
              <p>Fresh Chocolate Chip Cookie</p>
            </div>
          </div>
        </section>

        {/* Ingredients Section */}
        <section className="ingredients-card">
          <h2>Today's Cookie</h2>
          <div className="ingredient-list">
            <p><strong>Ingredients:</strong> Flour, Butter, Brown Sugar, Chocolate Chips, Eggs, Vanilla Extract, Baking Soda, Salt</p>
            <p><strong>Manufactured:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Best By:</strong> {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
          </div>
        </section>

        {/* Feedback Form */}
        <section className="feedback-section">
          <h2>How was it?</h2>
          <form onSubmit={handleSubmit}>
            {/* Enhanced Star Rating */}
            <div className="rating-section">
              <label>Your Rating</label>
              <div className="stars-container">
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${star <= (hoveredRating || rating) ? 'filled' : ''}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      aria-label={`Rate ${star} stars`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <div className="rating-label">
                  {getRatingLabel(hoveredRating || rating)}
                </div>
              </div>
            </div>

            {/* Name Input */}
            <div className="form-group">
              <label htmlFor="name">Name (optional)</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            {/* Comment */}
            <div className="form-group">
              <label htmlFor="comment">Tell us more</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think about the taste, texture, sweetness...?"
                rows="4"
              />
              <div className="char-count">
                {comment.length}/500 characters
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn" disabled={rating === 0 || isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App
