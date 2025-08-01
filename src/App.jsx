import { useState } from 'react'
import './App.css'

function App() {
  const [rating, setRating] = useState(0)
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Feedback submitted:', { rating, name, comment })
    // TODO: Send to backend
    alert('Thank you for your feedback!')
    // Reset form
    setRating(0)
    setName('')
    setComment('')
  }

  return (
    <div className="app">
      <header>
        <h1>🍪 Rate My Cookie!</h1>
      </header>

      <main>
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
            {/* Star Rating */}
            <div className="rating-section">
              <label>Rating:</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${star <= rating ? 'filled' : ''}`}
                    onClick={() => setRating(star)}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div className="form-group">
              <label htmlFor="name">Name (optional):</label>
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
              <label htmlFor="comment">Comment:</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you think..."
                rows="4"
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn" disabled={rating === 0}>
              Submit Feedback
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App
