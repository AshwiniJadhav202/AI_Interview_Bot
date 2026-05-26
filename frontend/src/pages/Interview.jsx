import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "../styles.css";

function Interview() {

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
  // CAMERA
  // =========================

  useEffect(() => {

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    .then((stream) => {

      if(videoRef.current){

        videoRef.current.srcObject = stream;
      }

    })
    .catch(() => {

      alert(
        "Allow Camera & Microphone"
      );
    });

  }, []);

  // =========================
  // RESUME
  // =========================

  const uploadResume = async (e) => {

    const file = e.target.files[0];

    if(!file) return;

    const text = await file.text();

    let detectedSkills = [];

    const allSkills = [
      "Python",
      "Java",
      "React",
      "SQL",
      "JavaScript",
      "HTML",
      "CSS",
      "C++"
    ];

    allSkills.forEach((skill) => {

      if(
        text.toLowerCase().includes(
          skill.toLowerCase()
        )
      ){

        detectedSkills.push(skill);
      }

    });

    setSkills(detectedSkills);
  };

  // =========================
  // AI VOICE
  // =========================

  const speakQuestion = (text) => {

    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";

    speech.rate = 1;

    window.speechSynthesis.speak(speech);
  };

  // =========================
  // MIC
  // =========================

  const startSpeechRecognition = () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if(!SpeechRecognition){

      alert(
        "Speech Recognition not supported"
      );

      return;
    }

    if(recognitionRef.current){

      recognitionRef.current.stop();
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.lang = "en-US";

    recognitionRef.current = recognition;

    let finalTranscript = "";

    recognition.onresult = (event) => {

      let interimTranscript = "";

      for(
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ){

        const transcript =
          event.results[i][0].transcript;

        if(event.results[i].isFinal){

          finalTranscript += transcript + " ";
        }
        else{

          interimTranscript += transcript;
        }
      }

      setAnswer(
        finalTranscript + interimTranscript
      );
    };

    recognition.onerror = (event) => {

      console.log(event.error);
    };

    recognition.start();
  };

  // =========================
  // START
  // =========================

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

  setAskedQuestions([
    res.data.question
  ]);

  speakQuestion(res.data.question);

  setTimeout(() => {

    startSpeechRecognition();

  }, 3500);
};


  // =========================
  // NEXT
  // =========================

  const nextQuestion = async () => {

  // SAVE ANSWER
  if(answer.trim() !== ""){

    setAllAnswers((prev) => [
      ...prev,
      answer
    ]);
  }

  // QUESTION LIMIT
  if(questionCount >= MAX_QUESTIONS){

    submitInterview();

    return;
  }

  setAnswer("");

  if(recognitionRef.current){

    recognitionRef.current.stop();
  }

  const res = await axios.post(
    "http://127.0.0.1:8000/question",
    {
      skills: skills,
      asked_questions: askedQuestions
    }
  );

  // INTERVIEW COMPLETE
  if(
    res.data.question ===
    "Interview Completed"
  ){

    submitInterview();

    return;
  }

  setQuestion(res.data.question);

  setAskedQuestions((prev) => [
    ...prev,
    res.data.question
  ]);

  setQuestionCount((prev) => prev + 1);

  speakQuestion(res.data.question);

  setTimeout(() => {

    startSpeechRecognition();

  }, 3500);
};


  // =========================
  // AUTO NEXT
  // =========================

  useEffect(() => {

    if(started){

      const timer = setTimeout(() => {

        nextQuestion();

      }, 60000);

      return () => clearTimeout(timer);
    }

  }, [question]);

  // =========================
  // SUBMIT
  // =========================

  const submitInterview = async () => {

    if(answer.trim() !== ""){

      setAllAnswers((prev) => [
        ...prev,
        answer
      ]);
    }

    const email =
      localStorage.getItem("email");

    const res = await axios.post(
      "http://127.0.0.1:8000/submit",
      {
        email: email,
        answers: [...allAnswers, answer]
      }
    );

    localStorage.setItem(
      "result",
      JSON.stringify(res.data)
    );

    if(recognitionRef.current){

      recognitionRef.current.stop();
    }

    if(videoRef.current?.srcObject){

      const tracks =
        videoRef.current.srcObject.getTracks();

      tracks.forEach((track) =>
        track.stop()
      );
    }

    window.location.href = "/result";
  };

  // =========================
  // UI
  // =========================

  return (

    <div className="main-container">

      {/* LEFT */}

      <div className="left-panel">

        <h2>AI Interview</h2>

        <div className="camera-box">

          <video
            ref={videoRef}
            autoPlay
            muted
          />

        </div>

        <div className="resume-upload">

          <input
            type="file"
            onChange={uploadResume}
          />

        </div>

        <div className="skills-box">

          <h3>Detected Skills</h3>

          {
            skills.map((skill,index) => (

              <span
                key={index}
                className="skill-tag"
              >
                {skill}
              </span>

            ))
          }

        </div>

        <button
          className="start-btn"
          onClick={startInterview}
        >
          Start Interview
        </button>

      </div>

      {/* RIGHT */}

      <div className="right-panel">

        <div className="question-box">

          <h1>AI Question</h1>

          <p className="question-text">
            {question}
          </p>

        </div>

        <textarea
          className="answer-box"
          value={answer}
          placeholder="Speak your answer..."
          onChange={(e)=>
            setAnswer(e.target.value)
          }
        />

        <div className="button-row">

          <button
            className="next-btn"
            onClick={nextQuestion}
          >
            Next Question
          </button>

          <button
            className="submit-btn"
            onClick={submitInterview}
          >
            Submit Interview
          </button>

        </div>

      </div>

    </div>
  );
}

export default Interview;