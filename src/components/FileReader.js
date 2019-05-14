import React, { useState } from "react";
import { Input, Button } from "antd";

import UDPAgent from "libs/udp/udputils";
const electron = require("electron");
const fs = electron.remote.require("fs");

const FileReader = () => {
  const [selectedFile, setSelectedFile] = useState("");
  const [fileContant, setFileContant] = useState("");

  const handleClick = e => {
    const agent = new UDPAgent();
    agent.emit(fileContant);
  };
  const handleFileChanged = e => {
    setSelectedFile(e.target.value);
    setFileContant("hellp");
    //console.log(require.resolve("electron"));
    // const root = fs.readdirSync("/");
    // setFileContant(root);
    console.log(e.target.files);
    fs.readFile(e.target.files[0].path, (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log("content: ", data.toString());
      setFileContant(data.toString());
    });
  };

  return (
    <div>
      <label>
        Select file:
        <Input
          type="file"
          value={selectedFile}
          onChange={handleFileChanged}
          size="small"
        />
        <Button type="primary" onClick={handleClick}>
          click me{" "}
        </Button>
      </label>

      {fileContant ? (
        <textarea
          cols={50}
          rows={25}
          value={fileContant}
          style={{ color: "red" }}
        >
          {fileContant}
        </textarea>
      ) : null}
    </div>
  );
};

export default FileReader;
