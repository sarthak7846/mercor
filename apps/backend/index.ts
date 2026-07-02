import express from "express";
import { PreInterviewBody } from "./types";
import { scrapeGithub } from "./scrapers/github";
import cors from "cors";
import { prisma } from "./db";

const app = express();
app.use(express.json());
app.use(cors());

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

  const githubUsername = githubUrl.split("/").pop() ?? "";

  const githubData = await scrapeGithub(githubUsername);

  const interview = await prisma.interview.create({
    data: {
      githubMetadata: JSON.stringify(githubData),
      status: "PRE",
    },
  });

  res.status(200).json({
    id: interview.id,
  });
});

app.listen(3001);
