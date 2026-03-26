import React, { useEffect, useState } from "react";


const get_text_file = async (filepath) => {
  // In Vite, files in public/ are served from the root
  // No need for process.env.PUBLIC_URL
  const res = await fetch(`/${filepath}`);

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
      <p dangerouslySetInnerHTML={{ __html: text }} />
    </>
  );
}

export default TextFileRenderer;
