import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Award, Star, Target, TrendingUp, User } from 'lucide-react'
import { getPerformanceReviews, getEmployees } from '../../stores/hrStore'

function Performance() {
    const [reviews, setReviews] = useState([])
    const [employees, setEmployees] = useState([])

    useEffect(() => {
        setReviews(getPerformanceReviews())
        setEmployees(getEmployees())
    }, [])

    const getEmployee = (id) => employees.find(e => e.id === id)

    const renderStars = (rating) => {
        return Array(5).fill(0).map((_, i) => (
            <Star key={i} size={14} fill={i < rating ? '#fbbf24' : 'transparent'} color={i < rating ? '#fbbf24' : 'var(--text-muted)'} />
        ))
    }

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Performance</span> Reviews</h1>
                    <p className="page-description">Track employee performance and goals.</p>
                </div>
            </motion.div>

            <div className="reviews-list">
                {reviews.map((review, i) => {
                    const emp = getEmployee(review.employeeId)
                    return (
                        <motion.div key={review.id} className="review-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                            <div className="review-header">
                                <div className="review-employee">
                                    <div className="emp-avatar">{emp?.firstName[0]}{emp?.lastName[0]}</div>
                                    <div>
                                        <strong>{emp?.firstName} {emp?.lastName}</strong>
                                        <span>{emp?.position}</span>
                                    </div>
                                </div>
                                <div className="review-period">{review.reviewPeriod}</div>
                            </div>

                            <div className="review-overall">
                                <div className="overall-score">{review.overallRating}</div>
                                <div className="overall-stars">{renderStars(Math.round(review.overallRating))}</div>
                            </div>

                            <div className="review-ratings">
                                {Object.entries(review.ratings).map(([key, value]) => (
                                    <div key={key} className="rating-item">
                                        <span className="rating-label">{key}</span>
                                        <div className="rating-bar">
                                            <div className="rating-fill" style={{ width: `${(value / 5) * 100}%` }} />
                                        </div>
                                        <span className="rating-value">{value}/5</span>
                                    </div>
                                ))}
                            </div>

                            <div className="review-goals">
                                <h4><Target size={14} /> Goals</h4>
                                {review.goals.map((goal, gi) => (
                                    <div key={gi} className={`goal-item ${goal.status}`}>
                                        <span>{goal.goal}</span>
                                        <span className="goal-score">{goal.score}/5</span>
                                    </div>
                                ))}
                            </div>

                            <div className="review-feedback">
                                <div className="feedback-section">
                                    <strong>Strengths:</strong> {review.strengths}
                                </div>
                                <div className="feedback-section">
                                    <strong>Areas for Improvement:</strong> {review.improvements}
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            <style>{`
        .reviews-list { display: flex; flex-direction: column; gap: 20px; }
        .review-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; }
        .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .review-employee { display: flex; align-items: center; gap: 12px; }
        .emp-avatar { width: 48px; height: 48px; border-radius: 12px; background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; }
        .review-employee strong { display: block; }
        .review-employee span { font-size: 0.85rem; color: var(--text-muted); }
        .review-period { padding: 6px 12px; background: rgba(99, 102, 241, 0.15); color: var(--accent-primary); border-radius: 16px; font-size: 0.85rem; }
        .review-overall { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 16px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-md); }
        .overall-score { font-size: 2rem; font-weight: 700; color: var(--accent-primary); }
        .overall-stars { display: flex; gap: 4px; }
        .review-ratings { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px; }
        .rating-item { display: flex; align-items: center; gap: 12px; }
        .rating-label { font-size: 0.85rem; text-transform: capitalize; min-width: 100px; color: var(--text-secondary); }
        .rating-bar { flex: 1; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden; }
        .rating-fill { height: 100%; background: var(--accent-gradient); border-radius: 3px; }
        .rating-value { font-size: 0.85rem; color: var(--text-muted); min-width: 30px; }
        .review-goals { margin-bottom: 20px; }
        .review-goals h4 { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; margin-bottom: 12px; color: var(--text-secondary); }
        .goal-item { display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm); margin-bottom: 8px; font-size: 0.9rem; }
        .goal-item.completed { border-left: 3px solid var(--success); }
        .goal-item.in-progress { border-left: 3px solid var(--warning); }
        .goal-score { color: var(--accent-primary); font-weight: 500; }
        .review-feedback { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .feedback-section { padding: 12px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm); font-size: 0.9rem; }
        .feedback-section strong { display: block; margin-bottom: 6px; color: var(--text-secondary); font-size: 0.8rem; }
      `}</style>
        </div>
    )
}

export default Performance
