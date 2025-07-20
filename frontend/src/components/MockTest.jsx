import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/MockTest.css";
import toast, { Toaster } from "react-hot-toast";

const MockTest = () => {
  const { company, role } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const local = localStorage.getItem("IntelliPrepUser");
        const user = local ? JSON.parse(local) : null;
        const token = user?.accessToken;

        const res = await axios.get(`/api/v1/mock-test/${company}/${role}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setQuestions(res.data.data);
        setTimeLeft(res.data.data.length * 60); // 1 min per question
      } catch (err) {
        console.error(err);
      }
    };

    fetchQuestions();
  }, [company, role]);

  // Timer countdown
  useEffect(() => {
    if (!submitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && !submitted && questions.length > 0) {
      handleSubmit();
    }
  }, [timeLeft, submitted, questions]);

  const handleOptionChange = (qIndex, option) => {
    setAnswers({ ...answers, [qIndex]: option });
  };

  const handleSubmit = async () => {
    let count = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] && answers[idx] === q.answer) {
        count++;
      }
    });

    setScore(count);

    const local = localStorage.getItem("IntelliPrepUser");
    const user = local ? JSON.parse(local) : null;
    const token = user?.accessToken;

    // 👇 Show promise toast correctly
    toast.promise(
      axios
        .post(
          `/api/v1/mock-test/feedback`,
          {
            company,
            role,
            answers,
            questions,
            score: count,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          setFeedback(res.data.feedback);
          setSubmitted(true);
        })
        .catch((err) => {
          console.error("Failed to get feedback", err);
          setFeedback("Could not generate feedback. Please try again later.");
          setSubmitted(true);
        }),
      {
        loading: "Submitting and Generating feedback...",
        success: "Submitted ",
        error: "Failed to submit.",
      }
    );
  };

  if (submitted) {
    return (
      <div className="mocktest-completed">
        <Toaster position="top-right" />
        <h2>Personalized Feedback</h2>
        <p>Score: {score} / {questions.length}</p>
        <div className="feedback-text">{feedback}</div>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="mocktest-container">
      <Toaster position="top-right" />
      <h2 className="mocktest-title">
        Mock Test - {company} | {role}
      </h2>
      <p className="mocktest-timer">
        Time left: {Math.floor(timeLeft / 60)}:
        {(timeLeft % 60).toString().padStart(2, "0")}
      </p>

      {questions.map((q, idx) => (
        <div key={idx} className="mocktest-question">
          <h4 className="mocktest-question-text">
            {idx + 1}. {q.question}
          </h4>
          <div className="mocktest-options">
            {q.options.map((opt, optIdx) => (
              <label key={optIdx} className="mocktest-option">
                <input
                  type="radio"
                  name={`question-${idx}`}
                  value={opt}
                  checked={answers[idx] === opt}
                  onChange={() => handleOptionChange(idx, opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        className="mocktest-button"
        onClick={handleSubmit}
        disabled={submitted}
      >
        Submit
      </button>
    </div>
  );
};

export default MockTest;
