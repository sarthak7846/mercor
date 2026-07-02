import { BACKEND_URL } from "@/config";
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
      console.log('tracks',ms.getTracks())

      pc.addTrack(ms.getTracks()[0]!);

      // Set up data channel for sending and receiving events
      // const dc = pc.createDataChannel("oai-events");

      // Start the session using the Session Description Protocol (SDP)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("hi");
      const sdpResponse = await fetch(`${BACKEND_URL}/api/v1/session/${interviewId}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          "Content-Type": "application/sdp",
        },
      });
      console.log("hello");
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
