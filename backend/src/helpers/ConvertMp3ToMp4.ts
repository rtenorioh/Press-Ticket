import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { logger } from "../utils/logger";

const convertMp3ToMp4 = (input: string, outputMP4: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg.setFfmpegPath(ffmpegPath);

    if (!fs.existsSync(input)) {
      const errorMsg = `Input file does not exist: ${input}`;
      logger.error(errorMsg);
      return reject(new Error(errorMsg));
    }

    ffmpeg(input)
      .inputFormat("mp3")
      .output(outputMP4)
      .outputFormat("mp4")
      .on("start", _commandLine => {})
      .on("error", (error: Error) => {
        reject(error);
      })
      .on("progress", _progress => {})
      .on("end", () => {
        resolve();
      })
      .run();
  });
};

export { convertMp3ToMp4 };
