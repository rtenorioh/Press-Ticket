import { createNotificameClient } from "../../libs/notificameClient";
import { showHubToken } from "../../helpers/showHubToken";

require("dotenv").config();

const ListChannels = async () => {
  try {
    const notificameHubToken = await showHubToken();

    if (!notificameHubToken) {
      throw new Error("NOTIFICAMEHUB_TOKEN_NOT_FOUND");
    }

    const client = createNotificameClient(notificameHubToken);
    const response = await client.get("/v1/channels");
    return response.data;
  } catch (_error) {
    throw new Error("Error");
  }
};

export default ListChannels;
