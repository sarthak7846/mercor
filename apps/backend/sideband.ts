import WebSocket from "ws";
import { prisma } from "./db";

export const initSideband = async (callId: string, interviewId: string) => {
  // Connect to a WebSocket for the in-progress call
  const url = "wss://api.openai.com/v1/realtime?call_id=" + callId;
  const ws = new WebSocket(url, {
    headers: {
      Authorization: "Bearer " + process.env.OPENAI_API_KEY,
    },
  });

  const interview = await prisma.interview.findFirst({
    where: {
      id: interviewId,
    },
  });

  ws.on("open", function open() {
    console.log("Connected to server.");

    // Send client events over the WebSocket once connected
    ws.send(
      JSON.stringify({
        type: "session.update",
        session: {
          type: "realtime",
          instructions: `You are supposed to interview this user on their computer science intellect. Ask around 2-3 questions based on their experience. Please use english only during the interview. Here is everything about the users github, will give you a rough idea about what the user does - ## Github Metadata
            ${interview?.githubMetadata}`,
        },
      }),
    );
  });

  // Listen for and parse server events
  ws.on("message", async function incoming(message) {
    const parsedMessage = JSON.parse(message.toString());
    if (parsedMessage.type === "response.done") {
      let contents: { type: string; transcript: string }[] = [];

      for (const item of parsedMessage.response.output) {
        contents.push(...item.content);
      }

      const assistantMessage = contents
        .filter((x) => x.type === "output_audio")
        .map((filteredMessage) => filteredMessage.transcript)
        .join(" ");

      await prisma.message.create({
        data: {
          interviewId,
          type: "ASSISTANT",
          message: assistantMessage,
        },
      });
    }
  });
};
