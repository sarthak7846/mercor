import express from "express";
import axios from "axios";
import { PreInterviewBody } from "./types";

const app = express();
app.use(express.json());

app.post("/api/v1/pre-interview", async (req, res) => {
  const { success, data } = PreInterviewBody.safeParse(req.body);

  if (!success) {
    res.status(411).json({
      message: "Incorrect body",
    });
    return;
  }

  //todo: url can be very malformed, probably use an SLM here?
  const githubUrl = data.github.endsWith("/")
    ? data.github.slice(0, -1)
    : data.github;
  const linkedInUrl = data.linkedIn.endsWith("/")
    ? data.linkedIn.slice(0, -1)
    : data.linkedIn;

  const githubUsername = githubUrl.split("/").pop();
  const linkedInUsername = linkedInUrl.split("/").pop();

  const userRepos = await axios.get(
    `https://api.github.com/users/${githubUsername}/repos`,
  );
  const filteredUserRepos = userRepos.data.map((x: any) => ({
    description: x.description,
    name: x.name,
    fullName: x.full_name,
    starCount: x.stargazers_count,
  }));

  console.log(filteredUserRepos)
});

app.listen(3001);
