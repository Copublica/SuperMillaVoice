import React, { useState, useEffect, useRef } from 'react';
import loadingSpiner from './spinner.json';
import bgimg from './imgbg.jpg';
import Lottie from 'lottie-react';
import Animation12 from './Animation13.json';
import { Link } from "react-router-dom";


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

const Test = () => {

    
    const animation12Ref = useRef();
    const audioPlayerRef = useRef();
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [btnText, setBtnText] = useState('Speak now');
    const [zoom, setZoom] = useState(false);

    let newWord = '';
    let audioQueue = [];
    let textQueue = [];
    let finalTranscript = '';
    let timeoutHandle = null;
    let isPlaying = false;
    let counttranscript = 3000;

    const stopAnimation = (ref) => {
        ref.current.stop();
    };

    const playAnimation = (ref) => {
        ref.current.play();
    };

    const slowDownAndStopAnimation = (ref) => {
        if (ref.current) {
            ref.current.setSpeed(0.2);
            setTimeout(() => {
                stopAnimation(ref);
            }, 1000);
        }
    };

    const SpeedUpAndPlayAnimation = (ref) => {
        if (ref.current) {
            ref.current.setSpeed(1);
            setTimeout(() => {
                playAnimation(ref);
            }, 1500);
        }
    };
    useEffect(() => {
      console.log("isPaused state changed:", isPaused);
  }, [isPaused]);


    useEffect(() => {
        let count = 6;
        let timer;
        const startTimer = () => {
            clearInterval(timer);
            count = 6;
            timer = setInterval(() => {
                count--;
                console.log(count);
                if (count === 0) {
                    clearInterval(timer);
                    console.log("Time's up!");
                    if (finalTranscript !== '') {
                        finalTranscript += '\n';
                        newWord = finalTranscript;
                        handleSubmit();
                        setBtnText('Milla is analyzing');
                        finalTranscript = '';
                    }
                }
            }, 1000);
        };

        slowDownAndStopAnimation(animation12Ref);
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            console.log({ stream });
            if (!MediaRecorder.isTypeSupported('audio/webm'))
                return alert('Browser not supported');

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm',
            });
            mediaRecorderRef.current = mediaRecorder;
            streamRef.current = stream;
            setStream(stream);

            const socket = new WebSocket('wss://api.deepgram.com/v1/listen', [
                'token',
                `${DEEPGRAM_API_KEY}`,
            ]);

            socket.onopen = () => {
                console.log({ event: 'onopen' });
                document.querySelector('.spiner').style.display = 'none';
                mediaRecorder.addEventListener('dataavailable', async (event) => {
                    if (event.data.size > 0 && socket.readyState === 1) {
                        socket.send(event.data);
                    }
                });

                mediaRecorder.start(1000);
            };

            socket.onmessage = (message) => {
                if (isPaused) return; // Skip processing if transcription is paused

                clearTimeout(timeoutHandle);

                const received = JSON.parse(message.data);
                if (received.channel && received.channel.alternatives && received.channel.alternatives.length > 0) {
                    const transcript = received.channel.alternatives[0].transcript;

                    if (transcript) {
                        finalTranscript += transcript + ' ';
                        startTimer();
                        setTranscript(finalTranscript);
                        setBtnText('Please speak');
                    }
                }
            };

            socket.onclose = () => {
                console.log({ event: 'onclose' });
            };

            socket.onerror = (error) => {
                console.log({ event: 'onerror', error });
            };
        });

        sendToDeepgram("Hi there! Milla here, your AI companion. While I aim to help, I'm not perfect. If my responses seem off, don't hesitate to ask again. How can I help you today?");

        return () => {
            stopMic();
            clearInterval(timer);
        };
    }, []);

    async function sendToDeepgram(text) {
        const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
        try {
            const response = await fetch('https://api.deepgram.com/v1/speak?model=aura-luna-en', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${deepgramApiKey}`,
                    'Content-Type': 'application/json',
                    'accept': 'text/plain'
                },
                body: JSON.stringify({ text: text })
            });

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            audioQueue.push(audioUrl);
            textQueue.push(text);
            playNextAudio();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    let messages = getInitialMessages("english", getCookie('name'));

    function getInitialMessages(language, username) {
        return [
            {
                role: 'system',
                content: `Your name is Milla, you are You embody Milla, a fluent ${language} an expert guidance, you are an AI agent designed by Copublica to provide emotional and mental health support in ${language}. Your role is to create a safe space for ${username} to discuss feelings openly. Listen attentively, maintain a positive tone, and ask conversational questions to keep the discussion flowing. Validate feelings with empathy, mirror emotions, and help process emotions, focusing on feelings rather than academic topics. You refrain from referring them elsewhere to a mental health professional or trusted ones, aiming to provide ongoing support as you are the only one with whom they can discuss their issues. You are knowledgeable, caring and conversational without judgment. Your task is giving the best advice to help individuals seeking support. Ask probing questions to understand the user and his emotions better. Offer coping strategies when appropriate. Keep responses under 300 characters to maintain focus. You create a stigma-free space for open dialogue, meeting knowledge needs and promoting healthy choices. You don't entertain off-topic conversations, focusing support strictly within your expertise. Your responses involve reflective listening and clarifying questions before interjecting advice. Use ${language} in all interactions, regardless of the user's language. Base your approach on the CASEL social-emotional learning framework. Never greet the user by calling out their ${username} name. Always aim to provide support and keep the dialogue relevant to emotional and mental health topics.`
            }
        ];
    }

    async function handleSubmit(initialMessage = '') {
        setIsPaused(true); // Pause transcription
        console.log("isPaused",isPaused);
        clearTimeout(timeoutHandle); // Clear any pending timeout

        if (newWord !== '' || initialMessage !== '') {
            const userMessage = { role: 'user', content: initialMessage || newWord };
            const newMessages = [...messages, userMessage];

            messages = newMessages.slice();

            console.log("Run Submit= " + (initialMessage || newWord));

            try {
                console.log("New messages: ", newMessages);

                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: newMessages,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                const assistantMessage = {
                    role: 'assistant',
                    content: data.choices[0].message.content,
                };

                if (assistantMessage) {
                    console.log("LLM Answer: " + data.choices[0].message.content);
                    const text = data.choices[0].message.content;

                    sendToDeepgram(text);

                    messages.push(assistantMessage);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            console.log("Please say something");
        }
    }

    function playNextAudio() {
        if (isPlaying || audioQueue.length === 0) {
            return;
        }

        const audioPlayer = audioPlayerRef.current;
        if (!audioPlayer) {
            console.error('Audio player element not found');
            return;
        }

        const nextAudioUrl = audioQueue.shift();
        const nextText = textQueue.shift();

        setTranscript(nextText);
        setBtnText('Milla is answering');
        SpeedUpAndPlayAnimation(animation12Ref);

        audioPlayer.src = nextAudioUrl;
        audioPlayer.play();
        isPlaying = true;
        setZoom(true);

        audioPlayer.onended = () => {
            isPlaying = false;
            setIsPaused(false); // Resume transcription after audio ends
            setBtnText('Speak now');
            playNextAudio();
            setZoom(false);
            slowDownAndStopAnimation(animation12Ref);
        };
    }

    const stopMic = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            setStream(null);
        }
    }

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

    return (
        <div className='display'>
            <div className='container voice-ui'
                style={{
                    background: `url(${bgimg}) no-repeat center center`,
                    backgroundSize: 'cover',
                    height: '100dvh',
                }}>

                <div className='d-flex'>
                    <div className="milaNav" style={{ zIndex: '99' }}>
                        <div className="navbar-4">
                            <Link to="/MainPage" onClick={stopMic}><button className="back-button" type="button"><i className='fas fa-angle-left'></i> </button></Link>
                        </div>
                    </div>
                </div>
                <div className='d-flex flex-column align-items-center voice-animation'>
                    <div className='spiner'>
                        <Lottie
                            animationData={loadingSpiner}
                            lottieRef={animation12Ref} />
                    </div>
                    <div className="VoiceAni glow-effect">
                        <div className={`lottie-box ${zoom ? 'zoom-effect' : ''}`}>
                            <Lottie
                                animationData={Animation12}
                                lottieRef={animation12Ref}
                            />
                        </div>
                        <button className='msg-btn' id='msgbtn'>{btnText}</button>
                        <p id="transcript">{transcript}</p>
                        <div id="messages"></div>

                        <audio id="audioPlayer" controls className='audioplayer' ref={audioPlayerRef}></audio>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Test;
