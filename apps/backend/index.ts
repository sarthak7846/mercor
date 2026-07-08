import express, { type Request } from "express";
import jwt from "jsonwebtoken";
import { PreInterviewBody } from "./types";
import { scrapeGithub } from "./scrapers/github";
import cors from "cors";
import { prisma } from "./db";
import { initSideband } from "./sideband";
import { calculateResult } from "./result";
import { deepgramApiKey, jwtSecret } from "./config";
import axios from "axios";

const port = process.env.PORT;
const app = express();
app.use(express.json());
app.use(cors());

// Parse raw SDP payloads posted from the browser
app.use(express.text({ type: ["application/sdp", "text/plain"] }));

app.get("/", (req, res) => {
  res.json({
    message: "Server is up and running",
  });
});

app.get("/api/deepgram-token", async (req: Request, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    const data = jwt.verify(token, jwtSecret!);

    if (!data) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    const url = "https://api.deepgram.com/v1/auth/grant";

    const response = await axios.post(
      url,
      {},
      {
        headers: {
          Authorization: `Token ${deepgramApiKey}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log(data);

    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    throw error;
  }
});

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

  const accessToken = jwt.sign(
    {
      interviewId: interview.id,
    },
    jwtSecret!,
    {
      expiresIn: "1h",
    },
  );

  res.status(200).json({
    id: interview.id,
    accessToken,
  });
});

app.post("/api/v1/session/:interviewId", async (req, res) => {
  const sessionConfig = JSON.stringify({
    type: "realtime",
    model: "gpt-realtime-2",
    audio: { output: { voice: "marin" } },
  });

  const fd = new FormData();
  fd.set("sdp", req.body);
  fd.set("session", sessionConfig);

  try {
    const sdpResponse = await fetch(
      "https://api.openai.com/v1/realtime/calls",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_KEY}`,
          "OpenAI-Safety-Identifier": "hashed-user-id",
        },
        body: fd,
      },
    );

    // Location: /v1/realtime/calls/rtc_123456
    const location = sdpResponse.headers.get("Location");
    const callId = location?.split("/").pop();
    console.log(callId);

    // Send back the SDP we received from the OpenAI REST API
    const sdp = await sdpResponse.text();
    res.send(sdp);
    initSideband(callId!, req.params.interviewId);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.post("/api/v1/session/:interviewId/message", async (req, res) => {
  const interviewId = req.params.interviewId;
  const message = req.body.message;

  // Save message to db
  // Send message to GPT and get response then convert TTS send the audio url back to fe

  // await prisma.message.create({
  //   data: {
  //     message,
  //     type: "USER",
  //     interviewId,
  //   },
  // });

  res.json({ message: "Message sent" });
});

app.get("/api/v1/result/:interviewId", async (req, res) => {
  const interviewId = req.params.interviewId;
  const interview = await prisma.interview.findFirst({
    where: {
      id: interviewId,
    },
    include: {
      conversations: true,
    },
  });

  if (!interview) {
    res.status(411).json({
      message: "Interview not found",
    });
    return;
  }

  res.json({
    score: interview?.score,
    feedback: interview?.feedback,
    transcript: interview?.conversations.map((c) => ({
      type: c.type,
      content: c.message,
      createdAt: c.createdAt,
    })),
    status: interview.status,
  });

  if (interview.status !== "DONE") {
    const result = await calculateResult(interview.conversations);
    await prisma.interview.update({
      where: {
        id: interviewId,
      },
      data: {
        status: "DONE",
        feedback: result.feedback,
        score: result.score,
      },
    });
  }
});

app.listen(port, () => {
  console.log(`Backend up on port ${port}`);
});
