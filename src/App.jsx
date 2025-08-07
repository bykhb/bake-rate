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
    </div>
  )
}

export default App
