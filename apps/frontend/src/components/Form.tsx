import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { useNavigate } from "react-router";

const Form = () => {
  const [github, setGithub] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async () => {
    if (!github) {
      // todo: add more validation here
      toast("Please provide valid github and linkedin urls");
      return;
    }

    setLoading(true);
    const res = await axios.post(`${BACKEND_URL}/api/v1/pre-interview`, {
      github,
    });

    navigate(`/interview/${res.data.id}`);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="h-screen w-screen flex justify-center items-center"
    >
      <div>
        <h2 className="scroll-m-2 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          AI Interview Kickstart
        </h2>
        <div className="p-4">
          <Input
            placeholder="Github URL"
            onChange={(e) => setGithub(e.target.value)}
          />
        </div>
        <div className="flex justify-center p-4">
          <Button disabled={loading} type="submit">
            {loading ? "Starting inteview..." : "Start Interview"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default Form;
