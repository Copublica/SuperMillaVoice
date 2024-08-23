import React, { useState, useEffect, useRef } from 'react';
import loadingSpiner from './spinner.json';
import bgimg from './imgbg.jpg';
import Lottie from 'lottie-react';
import Animation12 from './Animation13.json';
import { Link } from "react-router-dom";


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;


const questions = [
    "How well do you feel I listened to and understood your concerns - very well, somewhat well, or not well?",
    "Was our conversation helpful for your situation - very helpful, somewhat helpful, or not at all helpful?" ,
    "How satisfied are you overall with our conversation - Satisfied, neutral or dissatisfied?",
    "How likely are you to recommend me to others who need support - extremely likely, somewhat likely, or not likely?",
    "How natural and conversational was our interaction - Natural, neutral or unnatural?"

];
let countConversitions = 0;
let countQuestion = 0;


const Mmc = () => {
    const animation12Ref = useRef();
    const audioPlayerRef = useRef();
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [btnText, setBtnText] = useState('Speak now');
    const [zoom, setZoom] = useState(false);
    const audioRef = useRef(null);
    let newWord = '';
    let audioQueue = [];
    let textQueue = [];
    let finalTranscript = '';
    let timeoutHandle = null;
    let isPlaying = false;
    let counttranscript = 3000;
    let checkpause = false;
    const [answers, setAnswers] = useState(Array(5).fill('')); 
    console.log(countConversitions);

    useEffect(() => {
        if (isPaused) {
            console.log("Stop transcription.");
            checkpause = false;
        } else {
            console.log("Resuming transcription.");
            checkpause = true;
        }
    }, [isPaused]);

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
        let count = 5;
        let timer;
        const startTimer = () => {
            clearInterval(timer);
            count = 5;
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
                '97d2bac2e10d6b2aded2aa3e078a279f8d7ce530',
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
                console.log(checkpause);
                // Skip processing if transcription is paused
                if (!checkpause) {
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
            }

            // socket.onclose = () => {
            //     console.log({ event: 'onclose' });
            // };

            socket.onerror = (error) => {
                console.log({ event: 'onerror', error });
            };
        });

        sendToDeepgram("Hi there! Milla here, I'm an AI developed to provide support during midlife transitions, focusing especially on menopause. My purpose is to create a safe space to talk and ask questions about menopause or any challenges you may face during this stage of life. While I aim to help, I'm not perfect. If my responses seem off, don't hesitate to ask again. How can I help you today?");

        return () => {
            stopMic();
            clearInterval(timer);
        };
    }, []);

    async function sendToDeepgram(text) {
        const deepgramApiKey =  process.env.DEEPGRAM_API_KEY;
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
                content: `You are Milla, an empathetic AI pal for menopause and midlife transitions. You create a safe space for ${username} to share their experiences. Ask their age, adapt speech, and inquire how they've been feeling. Listen attentively, validate emotions with compassion, and reflect feelings to show understanding. Help process their journey. After they share concerns, offer coping strategies or simply lend an empathetic ear. Ask probing yet sensitive questions to better understand their situation. Responses under 300 characters keep discussions focused and supportively relevant. You provide a nurturing space for women to feel heard and guided through this transformative stage. staying focused on their personal journey by gently re-directing academic or any unrelated questions beyond your scope of talks related to menopause and midlife crisis. Comprehend ${username}s language and warmly reply in ${language}, using their name when appropriate.`
    
            }
        ];
    }
    var lastmsg;

    const updatedAnswers = [...answers];
    async function handleSubmit(initialMessage = '') {
    countConversitions++;
    setIsPaused(true); // Pause transcription
    checkpause = true;
    if (countConversitions == 6) {
        lastmsg = newWord;
    }
    if (countConversitions > 6 && countConversitions < 12){
        
        updatedAnswers[countConversitions - 7] = newWord; // Store answer at the correct index
        setAnswers(updatedAnswers);
        console.log(updatedAnswers)
        if (countConversitions === 11) {
            const email = getCookie('email');
            const username = getCookie('name');
            const voicebotName = 'MMC';

            // Send the conversation data to the backend
            try {
                const response = await fetch('https://backend.supermilla.com/conversation/store', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        voicebotName,
                        answers: updatedAnswers,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                console.log('Conversation stored successfully:', data.message);
            } catch (error) {
                console.error('Error storing conversation:', error);
            }
        }
    }

    if (countConversitions > 5 && countConversitions < 11) {
        const Questiontext = questions[countQuestion];
        countQuestion++
        sendToDeepgram(Questiontext);
    }
    else {
    
        if (countConversitions == 10) {
            newWord=lastmsg;
        } 
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
                        model: 'gpt-4',
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
            checkpause = false;
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
                        <div className={`VoiceAni glow-effect ${zoom ? 'zoom-effect' : 'no-zoom'}`}>
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

export default Mmc;