import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const Interview = () => {

  const videoRef = useRef(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [skills, setSkills] = useState("");
  const [questionCount, setQuestionCount] = useState(1);

  const recognitionRef = useRef(null);

  // CAMERA START
  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

    } catch (error) {
      console.log(error);
      alert("Camera or Microphone permission denied");
    }
  };

  // START INTERVIEW
  const startInterview = async () => {

    try {

      const res = await axios.post(`${API}/question`, {
        skills: skills
      });

      setQuestion(res.data.question);

      speakQuestion(res.data.question);

    } catch (error) {
      console.log(error);
      alert("Backend connection failed");
    }
  };

  // AI SPEAK QUESTION
  const speakQuestion = (text) => {

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";

    window.speechSynthesis.speak(speech);
  };

  // START MIC
  const startListening = () => {

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.lang = "en-US";

    recognition.onresult = (event) => {

      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript += event.results[i][0].transcript + " ";
      }

      setAnswer(transcript);
    };

    recognition.start();

    recognitionRef.current = recognition;
  };

  // STOP MIC
  const stopListening = () => {

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // NEXT QUESTION
  const nextQuestion = async () => {

    if (questionCount >= 10) {
      window.location.href = "/result";
      return;
    }

    try {

      const res = await axios.post(`${API}/question`, {
        skills: skills,
        previous_question: question
      });

      setQuestion(res.data.question);

      speakQuestion(res.data.question);

      setAnswer("");

      setQuestionCount(questionCount + 1);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="main-container">

      {/* LEFT SIDE */}

      <div className="left-side">

        <h1>AI Interview System</h1>

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="video-box"
        />

        <textarea
          placeholder="Enter Skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />

        <button onClick={startInterview}>
          Start Interview
        </button>

      </div>

      {/* CENTER LINE */}

      <div className="divider"></div>

      {/* RIGHT SIDE */}

      <div className="right-side">

        <h2>AI Question</h2>

        <div className="question-box">
          {question}
        </div>

        <textarea
          value={answer}
          placeholder="Your answer will appear here..."
          onChange={(e) => setAnswer(e.target.value)}
        />

        <button onClick={startListening}>
          Start Mic
        </button>

        <button onClick={stopListening}>
          Stop Mic
        </button>

        <button onClick={nextQuestion}>
          Next Question
        </button>

      </div>

    </div>
  );
};

export default Interview;