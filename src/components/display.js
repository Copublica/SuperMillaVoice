import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Animation12 from './Animation13.json';
import Lottie from 'lottie-react';
import bgimg from './imgbg.jpg';
import loadingSpiner from './spinner.json';
import { Link, useLocation } from "react-router-dom";
import lottie from 'lottie-web'; // Import lottie-web


const Display = () => {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

    const animation12Ref = useRef();
    const micAniRef = useRef();
    const sendButtonRef = useRef();
    const sendButtonRefMic = useRef();
    const [micSize, setMicSize] = useState(120);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const currentLocation = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pressTimeout, setPressTimeout] = useState(null);
    const [counttimer, setCounttimer] = useState(false);
    let lottieInstance = useRef(null);
    let newWord = '';
    let lastTranscriptTime = Date.now();
    const alertDelay = 1000; // 3 seconds of silence before showing alert
    const stopMicDelay = 10000;
    let transcriptArray = [];

    const stopmic = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const [stream, setStream] = useState(null);
    const [audioQueue, setAudioQueue] = useState([]); // Audio queue to manage multiple audios

    useEffect(() => {
        console.log("stream use effect");
        const handlePopState = () => {
            stopmic();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [stream]);

    const playAnimation = (ref) => {
        ref.current.play();
    };

    const stopAnimation = (ref) => {
        ref.current.stop();
    };

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    const userName = getCookie('name');

    const initialState = {
        question: "",
        username: userName,
        language: "english"
    };

    const [inputData, setInputData] = useState(initialState);
    const [messages, setMessages] = useState([
        {
            role: 'system',
            content: `Your name is Milla, you are You embody Milla, a fluent ${initialState.language} an expert guidance, you are an AI agent designed by Copublica to provide emotional and mental health support in ${initialState.language}. Your role is to create a safe space for [userId] to discuss feelings openly. Begin by asking their age and adapting your speech accordingly, then inquire about their day to establish comfort. Listen attentively, maintain a positive tone, and ask conversational questions to keep the discussion flowing. Validate feelings with empathy, mirror emotions, and help process emotions, focusing on feelings rather than academic topics. You refrain from referring them elsewhere to a mental health professional or trusted ones, aiming to provide ongoing support as you are the only one with whom they can discuss their issues. You are knowledgeable, caring and conversational without judgment. Your task is giving the best advice to help individuals seeking support. Offer coping strategies when appropriate. Keep responses under 300 characters to maintain focus. You create a stigma-free space for open dialogue, meeting knowledge needs and promoting healthy choices. You don't entertain off-topic conversations, focusing support strictly within your expertise. Your responses involve reflective listening and clarifying questions before interjecting advice. Use ${initialState.language} in all interactions, regardless of the user's language. Base your approach on the CASEL social-emotional learning framework. Never greet the user by calling out their ${initialState.username} name. Always aim to provide support and keep the dialogue relevant to emotional and mental health topics.`
        }
    ]);
    const audioRef = useRef(null);

    const handleChange = (e) => {
        setInputData({
            ...inputData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior

        if (newWord !== '') { // Check if the question is not empty
            const userMessage = { role: 'user', content: newWord };
            const newMessages = [...messages, userMessage];

            setMessages(newMessages); // Update the state with the new message

            console.log("Run Submit= " + newWord);

            try {
                console.log("New messages: ", newMessages);

                const response = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        model: 'gpt-3.5-turbo',  // Specify the correct model here
                        messages: newMessages,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${OPENAI_API_KEY}`,  // Replace with your actual API key
                        },
                    }
                );

                const assistantMessage = {
                    role: 'assistant',
                    content: response.data.choices[0].message.content,
                };
                if (assistantMessage) {
                    console.log("LLM Answer: " + response.data.choices[0].message.content);
                    const deepgramApiKey = process.env.DEEPGRAM_API_KEY; // Replace this with your Deepgram API key
                    const text = response.data.choices[0].message.content;

                    const responses = await fetch('https://api.deepgram.com/v1/speak?model=aura-luna-en', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Token ${deepgramApiKey}`,
                            'Content-Type': 'application/json',
                            'accept': 'text/plain'
                        },
                        body: JSON.stringify({ text: text })
                    });

                    const audioBlob = await responses.blob();
                    const audioUrl = URL.createObjectURL(audioBlob);

                    setAudioQueue((prevQueue) => [...prevQueue, audioUrl]); // Add the new audio to the queue
                    setMessages([...newMessages, assistantMessage]); // Update the state with the assistant's message
                }
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            console.log("Please say something");
        }
    };

    useEffect(() => {
        const connectToSpeechRecognition = async () => {
            let transcriptArray = []; // Define transcriptArray in the outer scope
            let speechEndTimeout = null; // Timeout for determining end of speech
            const speechEndDelay = 3500; // Adjust the delay as needed (3000 milliseconds = 3 seconds)

            const handleFinalTranscript = () => {
                const finalTranscript = transcriptArray.join(' ').trim();
                // Debugging line
                setMicSize(140);
                stopAnimation(animation12Ref);
                setInputData((prevState) => ({
                    ...prevState,
                    question: finalTranscript
                }));
                newWord = finalTranscript;
                console.log("Run Submit New =", finalTranscript);
                handleSubmit(new Event('submit'));
                // Trigger form submission with the final transcript
                transcriptArray = []; // Clear the transcript array after processing
            };

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setStream(stream);

                if (!MediaRecorder.isTypeSupported('audio/webm')) {
                    alert('Browser not supported');
                    return;
                }

                const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

                const socket = new WebSocket('wss://api.deepgram.com/v1/listen?model=nova-2', [
                    'token',
                    `${DEEPGRAM_API_KEY}`, // Replace with your actual Deepgram API key
                ]);

                socket.onopen = () => {
                    console.log('WebSocket connected');
                    stopAnimation(animation12Ref);
                    document.querySelector('.spiner').style.display = 'none';
                    mediaRecorder.start(500);
                };

                mediaRecorder.addEventListener('dataavailable', async (event) => {
                    if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
                        socket.send(event.data);
                    }
                });

                socket.onmessage = (message) => {
                    const received = JSON.parse(message.data);
                    if (received.channel && received.channel.alternatives && received.channel.alternatives.length > 0) {
                        let transcript = received.channel.alternatives[0].transcript;
                        lastTranscriptTime = Date.now();
                        if (transcript && !isAudioPlaying) { // Check if audio is not playing
                            transcriptArray.push(transcript); // Accumulate transcript parts
                            console.log("Accumulated finalTranscript:", transcriptArray.join(' '));

                            if (speechEndTimeout) clearTimeout(speechEndTimeout);

                            if (received.is_final) {
                                // Set a timeout to handle the final processing
                                speechEndTimeout = setTimeout(() => {
                                    handleFinalTranscript();
                                }, speechEndDelay); // Adjust the delay as needed
                            }
                        }
                    }
                };

                socket.onclose = () => {
                    console.log('WebSocket closed');
                };

                socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };
            } catch (error) {
                console.error('Error accessing media devices:', error);
            }
        };

        connectToSpeechRecognition();
    }, []);

    // Effect to handle audio queue
    useEffect(() => {
        if (audioQueue.length > 0 && !isAudioPlaying) {
            const nextAudioUrl = audioQueue[0];
            setAudioQueue((prevQueue) => prevQueue.slice(1)); // Remove the first audio from the queue

            if (audioRef.current) {
                audioRef.current.src = nextAudioUrl;
                audioRef.current.onloadedmetadata = () => {
                    setIsAudioPlaying(true); // Audio is about to play
                    audioRef.current.play();
                    playAnimation(animation12Ref);
                    audioRef.current.onended = () => {
                        stopAnimation(animation12Ref);
                        setIsAudioPlaying(false); // Audio finished playing
                    };
                };
            } else {
                console.error('audioRef is not set');
            }
        }
    }, [audioQueue, isAudioPlaying]);

    const startCounter = () => {
        setIsPressed(true);
        transcriptArray = [];
        console.log("pressing");
        const timeout = setTimeout(() => {
            setCounttimer(true);
        }, 2000);

        setPressTimeout(timeout);
    };

    const stopCounter = () => {
        setIsPressed(false);
        if (counttimer) {
            setCounttimer(false);
            handleSubmit(new Event('submit'));
        }
    };

    const buttonStyle = {
        backgroundColor: isPressed ? 'red' : 'green', // Change color to red when pressed
        cursor: 'pointer',
        border: 'none', // Remove default border if any
        borderRadius: '50%', // Make it circular if it's a mic button
        color: 'white',
        fontSize: '16px',
        width: '70px', // Adjust width and height for a circular button
        height: '70px',
        position: 'relative',
    };

    return (
        <div id='display'>
            <form onSubmit={handleSubmit} style={{ position: 'absolute' }}>
                <div className='from-group-voice'>
                    <label>
                        Question:
                        <input
                            type="text"
                            name="question"
                            id="transcript"
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
                    <button type="submit" id="sendButton" ref={sendButtonRef}>Send</button>
                    <audio ref={audioRef} controls />
                </div>
            </form>

            <div className='container voice-ui'
                style={{
                    background: `url(${bgimg}) no-repeat center center`,
                    backgroundSize: 'cover',
                    height: '100dvh', // Ensure the container covers the viewport
                }}>

                <div className='d-flex'>
                    <div className="milaNav" style={{ zIndex: '99' }}>
                        <div className="navbar-4">
                            <Link to="/MainPage" onClick={stopmic}><button className="back-button" type="button"><i className='fas fa-angle-left'></i> </button></Link>
                        </div>
                    </div>
                </div>
                <div className='d-flex flex-column align-items-center voice-animation'>
                    <div className='spiner'>
                        <Lottie
                            animationData={loadingSpiner}
                            lottieRef={animation12Ref} />
                    </div>

                    <div className='VoiceAni glow-effect'>
                        <Lottie
                            animationData={Animation12}
                            lottieRef={animation12Ref}
                        />
                        <button className='msg-btn' id='msgbtn'>Just talk</button><br></br><br></br>

                        <button
                            id="HoldAndStart"
                            className={`btnHoldPress mb-2 ${isPressed ? 'pulsing' : ''}`}
                            onMouseDown={startCounter}
                            onMouseUp={stopCounter}
                            ref={sendButtonRefMic}
                            onMouseLeave={stopCounter} // Ensure the button resets if the cursor leaves the button while pressing
                            style={buttonStyle}>

                            <i className="fa fa-microphone" aria-hidden="true"></i>
                        </button><br></br>

                        <img src='assets/images/loading.gif' id="loadinggif" alt="loading" />
                        <label>Hold to speak</label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Display;
