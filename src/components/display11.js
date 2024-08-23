import React, { useState, useRef } from 'react';
import axios from 'axios';
import SpeechToText from './SpeechToText';

const Display11 = () => {
    const [responseData, setResponseData] = useState(null);
    const [inputData, setInputData] = useState({
        question: "",
        username: "",
        language: "english"
    });
    const audioRef = useRef(null);

    const handleChange = (e) => {
        setInputData({
            ...inputData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5001/qad', inputData);
            setResponseData(response.data);
            if (response.data.answer) {
                const audioResponse = await axios.post('http://127.0.0.1:8000/answer', { answer: response.data.answer }, { responseType: 'blob' });
                const audioBlob = new Blob([audioResponse.data], { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audioRef.current.src = audioUrl;
                audioRef.current.play();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const setQuestion = (transcript) => {
        setInputData((prevState) => ({
            ...prevState,
            question: transcript
        }));
    };

    return (
        <div>
            <h1>Send Data to Backend</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Question:
                    <input
                        type="text"
                        name="question"
                        value={inputData.question}
                        onChange={handleChange}
                    />
                </label>
                <br />
                <label>
                    Username:
                    <input
                        type="text"
                        name="username"
                        value={inputData.username}
                        onChange={handleChange}
                    />
                </label>
                <br />
                <label>
                    Language:
                    <select
                        name="language"
                        value={inputData.language}
                        onChange={handleChange}
                    >
                        <option value="english">English</option>
                        <option value="Hindi">Hindi</option>
                    </select>
                </label>
                <br />
                <button type="submit">Send</button>
            </form>
            {responseData && (
                <div>
                    <h2>Response from Backend</h2>
                    <p>{JSON.stringify(responseData.answer, null, 2)}</p>
                </div>
            )}
            <SpeechToText setQuestion={setQuestion} />
            <audio ref={audioRef} controls />
        </div>
    );
};

export default Display11;