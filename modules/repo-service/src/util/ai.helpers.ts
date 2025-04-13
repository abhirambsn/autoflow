import axios from "axios";

export async function sendAIFileGenerationJobRequest(
  payload: any
) {
  const url = `${process.env.AI_SERVICE_URL}/`;
  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data?.jobId;
  } catch (err) {
    console.error("[AI SERVICE ERROR]", err);
    throw err;
  }
}
