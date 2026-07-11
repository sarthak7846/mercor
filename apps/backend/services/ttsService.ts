import axios from "axios";

export const generateSpeechFromText = async (text: string) => {
  const audio = await axios.post(
    "https://api.deepgram.com/v1/speak?model=aura-2-electra-en",
    {
      text,
    },
    {
      responseType: "arraybuffer",
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  return audio;
};
