import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "../styles.css";

function Interview() {

  // =========================
  // YOUR OLD STATES (UNCHANGED)
  // =========================
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const MAX_QUESTIONS = 10;

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [allAnswers, setAllAnswers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [started, setStarted] = useState(false);

  // =========================
  // 🎥 RECORDING SYSTEM (NEW)
  // =========================
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [recording, setRecording] = useState(false);

  // =========================
  // CAMERA (OLD)
  // =========================
  useEffect(() => {

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        alert("Allow Camera & Microphone");
      });

  }, []);

  // =========================
  // RECORDING START (NEW)
  // =========================
  const startRecording = async () => {

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    mediaRecorderRef.current = new MediaRecorder(stream);
    chunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  // =========================
  // RECORDING STOP (NEW)
  // =========================
  const stopRecording = () => {

    mediaRecorderRef.current.stop();

    mediaRecorderRef.current.onstop = () => {

      const blob = new Blob(chunksRef.current, {
        type: "video/webm",
      });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "interview-recording.webm";
      a.click();
    };

    setRecording(false);
  };

  // =========================
  // PDF DOWNLOAD (NEW)
  // =========================
  const downloadPDF = () => {

    const email = localStorage.getItem("email");

    window.open(
      `http://127.0.0.1:8000/download-report/${email}`,
      "_blank"
    );
  };

  // =========================
  // REST OF YOUR CODE (UNCHANGED)
  // =========================

  const uploadResume = async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();

    let detectedSkills = [];

    const allSkills = ["Python", "Java", "React", "SQL", "JavaScript", "HTML", "CSS", "C++"];

    allSkills.forEach((skill) => {
      if (text.toLowerCase().includes(skill.toLowerCase())) {
        detectedSkills.push(skill);
      }
    });

    setSkills(detectedSkills);
  };

  const speakQuestion = (text) => {

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;

    window.speechSynthesis.speak(speech);
  };

  const startSpeechRecognition = () => {

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognitionRef.current = recognition;

    let finalTranscript = "";

    recognition.onresult = (event) => {

      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {

        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setAnswer(finalTranscript + interimTranscript);
    };

    recognition.start();
  };

  const startInterview = async () => {

    setStarted(true);
    setAnswer("");
    setQuestionCount(1);

    const res = await axios.post(
      "http://127.0.0.1:8000/question",
      {
        skills: skills,
        asked_questions: []
      }
    );

    setQuestion(res.data.question);

    setAskedQuestions([res.data.question]);

    speakQuestion(res.data.question);

    setTimeout(() => {
      startSpeechRecognition();
    }, 3000);
  };

  const nextQuestion = async () => {

    if (answer.trim() !== "") {
      setAllAnswers((prev) => [...prev, answer]);
    }

    if (questionCount >= MAX_QUESTIONS) {
      submitInterview();
      return;
    }

    setAnswer("");

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const res = await axios.post(
      "http://127.0.0.1:8000/question",
      {
        skills: skills,
        asked_questions: askedQuestions
      }
    );

    if (res.data.question === "Interview Completed") {
      submitInterview();
      return;
    }

    setQuestion(res.data.question);

    setAskedQuestions((prev) => [...prev, res.data.question]);

    setQuestionCount((prev) => prev + 1);

    speakQuestion(res.data.question);

    setTimeout(() => {
      startSpeechRecognition();
    }, 3000);
  };

  useEffect(() => {

    if (started) {

      const timer = setTimeout(() => {
        nextQuestion();
      }, 60000);

      return () => clearTimeout(timer);
    }

  }, [question]);

  const submitInterview = async () => {

    const email = localStorage.getItem("email");

    const res = await axios.post(
      "http://127.0.0.1:8000/submit",
      {
        email: email,
        answers: [...allAnswers, answer]
      }
    );

    localStorage.setItem("result", JSON.stringify(res.data));

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }

    window.location.href = "/result";
  };

  // =========================
  // UI (UPDATED ONLY BUTTONS ADDED)
  // =========================
  return (
  <div className="main-container">

    {/* LEFT PANEL */}
    <div className="left-panel">

      <h2>AI Interview</h2>

      <div className="camera-box">
        <video ref={videoRef} autoPlay muted />
      </div>

      <div className="resume-upload">
        <input type="file" onChange={uploadResume} />
      </div>

      <div className="skills-box">
        <h3>Detected Skills</h3>

        {skills.map((skill, index) => (
          <span key={index} className="skill-tag">
            {skill}
          </span>
        ))}
      </div>

      <button className="start-btn" onClick={startInterview}>
        Start Interview
      </button>

    </div>

    {/* RIGHT PANEL */}
    <div className="right-panel">

      {/* QUESTION BOX */}
      <div className="question-box">
        <h1>AI Question</h1>
        <p className="question-text">
          {question || "Click Start Interview to begin"}
        </p>
      </div>

      {/* ANSWER BOX */}
      <textarea
        className="answer-box"
        value={answer}
        placeholder="Speak or type your answer..."
        onChange={(e) => setAnswer(e.target.value)}
      />

      {/* BUTTONS */}
      <div className="button-section">

        <div className="primary-buttons">
          <button className="next-btn" onClick={nextQuestion}>
            Next Question
          </button>

          <button className="submit-btn" onClick={submitInterview}>
            Submit Interview
          </button>
        </div>

        <div className="secondary-buttons">
          <button className="record-btn" onClick={startRecording}>
            Start Recording
          </button>

          <button className="stop-btn" onClick={stopRecording}>
            Stop Recording
          </button>

          <button className="pdf-btn" onClick={downloadPDF}>
            Download PDF
          </button>
        </div>

      </div>

    </div>

  </div>
);
}

export default Interview;