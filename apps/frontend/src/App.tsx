import { useState } from "react";
import "../styles/globals.css";
import Form from "./components/Form";
import Interview from "./components/Interview";
import Result from "./components/Result";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "sonner";

export function App() {
  const [page, setPage] = useState<"form" | "interview" | "result">("form");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/interview/:interviewId" element={<Interview />} />
        <Route path="/result/:interviewId" element={<Result />} />
      </Routes>
      <Toaster position="bottom-left"/>
    </BrowserRouter>
  );
}

export default App;
