import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [feedbackList, setFeedbackList] = useState([]);
  const [successMessage, setSuccessMessage] = useState(""); // ✅ Success message state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = useCallback(async () => {
    setLoading(true); // Start loading
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback`);
      const data = await response.json();
      setFeedbackList(data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
    setLoading(false); // Stop loading
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Validation function
  const validate = (field, value) => {
    let error = "";

    if (field === "name") {
      if (!value.trim()) {
        error = "Name is required";
      } else if (!/^[a-zA-Z\s]+$/.test(value)) {
        error = "Name must only contain letters and spaces";
      }
    }

    if (field === "email") {
      if (!value.trim()) {
        error = "Email is required";
      } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
        error = "Enter a valid email address";
      }
    }

    if (field === "message") {
      if (!value.trim()) {
        error = "Feedback message cannot be empty";
      } else if (value.length < 10) {
        error = "Feedback message should be at least 10 characters long";
      }
    }

    return error;
  };

  // Handle input changes and revalidate
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFeedback({
      ...feedback,
      [name]: value
    });

    setErrors({
      ...errors,
      [name]: validate(name, value)
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let newErrors = {
      name: validate("name", feedback.name),
      email: validate("email", feedback.email),
      message: validate("message", feedback.message)
    };
  
    setErrors(newErrors);
  
    if (Object.values(newErrors).some(error => error)) {
      return;
    }
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(feedback)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error submitting feedback:", errorData.error);
        alert("Error submitting feedback");
        return;
      }
  
      setSuccessMessage("Thank you! Your feedback has been submitted successfully.");
      setFeedback({ name: '', email: '', message: '' });
      setErrors({});
      fetchFeedback();
  
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error during submission:", error);
      alert("Error submitting feedback");
    }
  };
    
  console.log("API URL:", process.env.REACT_APP_API_URL);

  return (
    <div className="App">
      <h1>Feedback Application</h1>

      {/* ✅ Display Success Message */}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={feedback.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={feedback.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label>Feedback:</label>
          <textarea
            name="message"
            value={feedback.message}
            onChange={handleChange}
            placeholder="Enter your feedback"
          />
          {errors.message && <p className="error-text">{errors.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={Object.values(errors).some(error => error) || !feedback.name || !feedback.email || !feedback.message}
        >
          Submit
        </button>
      </form>

      <h2>Submitted Feedback</h2>
      {loading ? <p>Loading feedback...</p> : (
        <ul className="feedback-list">
          {feedbackList.map((item, index) => (
            <li key={index} className="feedback-item">
              <p><strong>{item.name}</strong> (<em>{item.email}</em>)</p>
              <p>{item.message}</p>
              <p className="timestamp">
                <small>{new Date(item.timestamp).toLocaleString()}</small>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
