function Result() {

  const data = JSON.parse(
    localStorage.getItem("result")
  );

  return (
    <div className="result-page">

      <div className="result-card">

        <h1>Interview Result</h1>

        <div className="score-box">
          Score: {data?.score || 85}/100
        </div>

        <div className="performance-box">
          <h3>Performance</h3>

          <p>
            {data?.performance ||
              "Good communication and technical skills."}
          </p>
        </div>

        <div className="suggestion-box">
          <h3>Future Preparation Suggestion</h3>

          <ul>
            <li>Practice DSA daily</li>
            <li>Improve communication</li>
            <li>Learn system design</li>
            <li>Work on projects</li>
          </ul>
        </div>

      </div>

    </div>
  );
}

export default Result;