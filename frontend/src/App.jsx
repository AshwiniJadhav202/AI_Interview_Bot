import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Interview from "./pages/Interview";
import Result from "./pages/Result";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/interview"
          element={<Interview />}
        />

        <Route
          path="/result"
          element={<Result />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;