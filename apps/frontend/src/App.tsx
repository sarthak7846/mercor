import "../styles/globals.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import { Form } from "./components/Form";
import { Interview } from "./components/Interview";
import { Result } from "./components/Result";

export function App() {
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
