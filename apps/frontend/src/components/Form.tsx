import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { BACKEND_URL } from "@/config";

const Form = () => {
  const [github, setGithub] = useState("");
  const [linkedIn, setLinkedIn] = useState("");

  const onSubmit = async () => {
    if (!github || !linkedIn) {
      // todo: add more validation here
      toast("Please provide valid github and linkedin urls");
      return;
    }

    const res = await axios.post(`${BACKEND_URL}/api/v1/pre-interview`, {
      linkedIn,
      github,
    });
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
            placeholder="LinkedIn URL"
            onChange={(e) => setLinkedIn(e.target.value)}
          />
        </div>
        <div className="p-4">
          <Input
            placeholder="Github URL"
            onChange={(e) => setGithub(e.target.value)}
          />
        </div>
        <div className="flex justify-center p-4">
          <Button type="submit">Start Interview</Button>
        </div>
      </div>
    </form>
  );
};

export default Form;
