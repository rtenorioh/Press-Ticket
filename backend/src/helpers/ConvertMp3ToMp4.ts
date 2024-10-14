import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";

const convertMp3ToMp4 = (input: string, outputMP4: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg.setFfmpegPath(ffmpegPath);

    if (!fs.existsSync(input)) {
      const errorMsg = `Input file does not exist: ${input}`;
      console.error(errorMsg);
      return reject(new Error(errorMsg));
    }

    ffmpeg(input)
      .inputFormat("mp3")
      .output(outputMP4)
      .outputFormat("mp4")
      .on("start", commandLine => { })
      .on("error", (error: Error) => {
        reject(error);
      })
      .on("progress", progress => {
        console.log("Processing...");
      })
      .on("end", () => {
        console.log("Transcoding succeeded !");
        resolve();
      })
      .run();
  });
};

export { convertMp3ToMp4 };
