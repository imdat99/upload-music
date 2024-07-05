import FormData from "form-data";
import fs from "fs";
import axios from "axios";
import { getkeyUrl, uploadUrl, zmUrl } from "./constant.js";

const cookie = JSON.parse(fs.readFileSync("./src/cookie.json", "utf8")).cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");

const client = axios.create({
  headers: {
    Cookie: cookie,
  },
});
const getKey = () => {
  const formData = new FormData();
  const dataObj = { cid: "19", mycid: "0", fid: "18" };
  for (const key in dataObj) {
    formData.append(key, dataObj[key]);
  }
  return client.post(getkeyUrl, formData).then((res) => res.data);
};

const upload = (key, file) => {
  const formData = new FormData();
  const uploadObj = {
    id: "WU_FILE_0",
    type: "video/mp4",
    video: file,
  };
  Object.keys(uploadObj).forEach((key) => {
    formData.append(key, uploadObj[key]);
  });

  return client
    .post(uploadUrl, formData, {
      params: { key },
      headers: formData.getHeaders(),
    })
        .then((res) => res.data);
};

export const uploadModule = async (url) => {
  const {data} = await axios({
    url: url,
    method: "GET",
    responseType: "stream",
  });
  const key = await getKey().then((r) => r.data);
  console.log("uploadModule", url);
  return await upload(key, data).then((r) => {
      client.get(zmUrl, { params: { id: r.did } });
      return { ...r };
    })
};

