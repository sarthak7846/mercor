import { BACKEND_URL } from "@/config";
import axios from "axios";
import { useEffect, useRef } from "react";
import { useParams } from "react-router";

const Interview = () => {
  const { interviewId } = useParams();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    (async () => {
      const pc = new RTCPeerConnection();

      // Set up to play remote audio from the model
      audioRef.current = document.createElement("audio");
      audioRef.current.autoplay = true;
      pc.ontrack = (e) => {
        console.log("Received remote track", e);
        audioRef.current!.srcObject = e.streams[0]!;
      };

      // Add local audio track for microphone input in the browser
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const socket = new WebSocket("wss://api.deepgram.com/v1/listen", [
        "token",
        "a222211bf6460ee9d3017e6c855c7d412998177a",
      ]);

      socket.onopen = () => {
        const mediaRecorder = new MediaRecorder(ms, { mimeType: "audio/webm" });
        mediaRecorder.start(250);

        mediaRecorder.addEventListener("dataavailable", (event) => {
          socket.send(event.data);
        });
      };

      socket.onmessage = (message) => {
        // console.log("message", message);
        const data = JSON.parse(message.data);
        const transcript = data.channel.alternatives[0].transcript;

        if (transcript) {
          console.log("transcript", transcript);
          axios.post(`${BACKEND_URL}/api/v1/session/${interviewId}/message`, {
            message: transcript,
          });
        }
      };

      pc.addTrack(ms.getTracks()[0]!);

      // Set up data channel for sending and receiving events
      // const dc = pc.createDataChannel("oai-events");

      // Start the session using the Session Description Protocol (SDP)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(
        `${BACKEND_URL}/api/v1/session/${interviewId}`,
        {
          method: "POST",
          body: offer.sdp,
          headers: {
            "Content-Type": "application/sdp",
          },
        },
      );

      const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer as RTCSessionDescriptionInit);

      pc.onconnectionstatechange = () => {
        console.log("connection:", pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        console.log("ICE:", pc.iceConnectionState);
      };
    })();
  }, [interviewId]);

  return (
    <div>
      <audio autoPlay ref={audioRef}>
        audio
      </audio>
      Interview
    </div>
  );
};

export default Interview;
