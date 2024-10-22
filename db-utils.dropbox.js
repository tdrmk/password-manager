import { Dropbox } from "dropbox";

export class DropboxAdapter {
  constructor(accessToken, filePath) {
    this.dbx = new Dropbox({ accessToken });
    this.filePath = filePath;
  }

  async read() {
    const response = await this.dbx.filesDownload({ path: this.filePath });
    const binaryData = response.result.fileBinary;
    const stringData = Buffer.from(binaryData).toString("utf8");
    return JSON.parse(stringData);
  }

  async write(data) {
    await this.dbx.filesUpload({
      path: this.filePath,
      contents: JSON.stringify(data, null, 2),
      mode: { ".tag": "overwrite" },
    });
  }
}
