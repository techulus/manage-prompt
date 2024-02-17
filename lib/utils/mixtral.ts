import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function runMixtralModel(prompt: string): Promise<{
  result: string;
  rawResult: any;
  totalTokenCount: number;
}> {
  console.log("Creating mistralai Prediction...");
  const prediction = await replicate.predictions.create({
    version: "7b3212fbaf88310cfef07a061ce94224e82efc8403c26fc67e8f6c065de51f21",
    input: {
      top_k: 50,
      top_p: 0.9,
      prompt,
      temperature: 0.6,
      max_new_tokens: 1024,
      prompt_template: "<s>[INST] {prompt} [/INST] ",
      presence_penalty: 0,
      frequency_penalty: 0,
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
