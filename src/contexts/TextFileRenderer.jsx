import React, { useEffect, useState } from "react";

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