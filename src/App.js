import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [panelTexts, setPanelTexts] = useState(Array(10).fill(''));
  const [comicImages, setComicImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [requestQueue, setRequestQueue] = useState([]);

  useEffect(() => {
    processQueue();
  }, [requestQueue]);

  const handleTextChange = (index, value) => {
    const newTexts = [...panelTexts];
    newTexts[index] = value;
    setPanelTexts(newTexts);
  };

  const addToQueue = (requestData) => {
    setRequestQueue((prevQueue) => [...prevQueue, requestData]);
  };

  const processQueue = async () => {
    try {
      const results = await Promise.all(requestQueue.map(query));
      setComicImages((prevImages) => [...prevImages, ...results]);
    } catch (error) {
      console.error('Error processing requests:', error.message);
      setErrorMessage(error.message || 'Error generating comic. Please try again.');
    }
    setRequestQueue([]); // Clear the queue after processing
  };

  const query = async (data) => {
    try {
      const response = await fetch(
        "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud",
        {
          method: "POST",
          headers: {
            "Accept": "image/png",
            "Authorization": "Bearer VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data),
          timeout: 660000, // Set timeout to 120 seconds (adjust as needed)
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.blob();
      return URL.createObjectURL(result);
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  };

  const generateComic = () => {
    // Check if any panel text is empty
    if (panelTexts.some((text) => !text.trim())) {
      setErrorMessage('Please fill in all the panels before generating the comic.');
    } else {
      // Clear existing images and errors
      setComicImages([]);
      setErrorMessage('');
  
      // Add requests to the queue
      for (let i = 0; i < panelTexts.length; i++) {
        addToQueue({ "inputs": panelTexts[i] });
      }
    }
  };

  

  return (
    <div className="App">
      <div className="left-panel">
        <h1>Comic Strip Generator</h1>
        <div className="comic-form">
          {panelTexts.map((text, index) => (
            <textarea
              key={index}
              value={text}
              onChange={(e) => handleTextChange(index, e.target.value)}
              placeholder={`Enter text for panel ${index + 1}`}
            />
          ))}
          <button onClick={generateComic}>Generate Comic</button>
        </div>
      </div>

      <div className="right-panel">
        <div className="comic-strip">
          {comicImages.map((image, index) => (
            <div key={index} className="comic-panel">
              <img src={image} alt={`Panel ${index + 1}`} />
            </div>
          ))}
        </div>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>
    </div>
  );
}

export default App;
