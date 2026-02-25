import React, { useEffect, useState } from "react";


const get_text_file = async (filepath) => {
  // prefix public dir files with `process.env.PUBLIC_URL`
  // see https://create-react-app.dev/docs/using-the-public-folder/
  const res = await fetch(`${process.env.PUBLIC_URL}/${filepath}`);

  // check for errors
  if (!res.ok) {
    throw res;
  }

  return res.text();
};

function TextFileRenderer({ fileName }) {
  const [text, setText] = useState(""); // init with an empty string

  useEffect(() => {
    get_text_file(`${fileName}.txt`).then(setText).catch(console.error);
  }, [fileName]);
  
  return (
    <>
      <p>{text}</p>
    </>
  );
}

export default TextFileRenderer;

/*
export const TextFileRenderer = (filePath) => {
    const [textData, setTextData] = useState("");

    useEffect(() => {
        fetch(filePath)
            .then((response) => response.text())
            .then((data) => setTextData(data))
            .catch((error) => console.error("Error fetching text file:", error));
    }, []);

    return (
        <div>
            <pre>{textData}</pre>
        </div>
    );

};
*/