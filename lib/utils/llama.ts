import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function runLlamaModel(
  prompt: string,
  system_prompt: string
): Promise<{
  result: string;
  rawResult: any;
  totalTokenCount: number;
}> {
  console.log("Creating Llama Prediction...");
  const prediction = await replicate.predictions.create({
    version: "02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
    input: {
      debug: true,
      top_p: 1,
      prompt,
      temperature: 0.5,
      system_prompt,
      max_new_tokens: 500,
      min_new_tokens: -1,
    },
  });
  console.log("Created", prediction.id);

  const completedPrediction = await replicate.wait(prediction);

  return {
    result: completedPrediction.output.join(""),
    rawResult: completedPrediction,
    totalTokenCount: completedPrediction.output.length,
  };
}
