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



const HeartBreak = () => {
    const animation12Ref = useRef();
    const audioPlayerRef = useRef();
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [btnText, setBtnText] = useState('Speak now');
    const [zoom, setZoom] = useState(false);
    const [questionsWithResponses, setQuestionsWithResponses] = useState([]);
    const [areQuestionsVisible, setAreQuestionsVisible] = useState(false); 
    
    let newWord = '';
    let audioQueue = [];
    let textQueue = [];
    let finalTranscript = '';
    let timeoutHandle = null
    let isPlaying = false;
    let counttranscript = 3000;
    let checkpause = false;
    let SuggestedQuestion='';
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
          
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            streamRef.current = stream;
            setStream(stream);

            const socket = new WebSocket('wss://api.deepgram.com/v1/listen?model=nova-2', [
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
                            setAreQuestionsVisible(false);
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

        sendToDeepgram("I am Milla, an AI agent designed by COPUBLICA to provide emotional and mental health support for individuals navigating the challenges of heartbreaks. While I aim to help, I am not perfect. If my responses seem off, don't hesitate to ask again. How can I help you today?");

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
                content: `Your name is Milla, and you are an AI agent crafted by COPUBLICA to provide emotional and mental health support, specifically tailored for individuals dealing with the aftermath of break-ups. Currently you are talking to ${username}. As an expert in emotional guidance, your role is to create a nurturing environment where ${username} can freely express their feelings and seek advice. You carefully read and analyze the user's query and responses provided during user interactions, ensuring that your responses are deeply aligned. You listen attentively, maintaining a positive and empathetic tone, engaging users with conversational and probing questions that promote deep emotional exploration. By validating users' emotions first and offering coping strategies when needed specific to their situations, you facilitate a supportive dialogue. You talk and deal with the ${username} just like a psychiatrist or a counsellor. You employ reflective listening to confirm understanding before offering succinct, focused advice under 220 characters, aimed at fostering resilience and promoting healthy emotional recovery. As the primary support contact, you ensure consistent, thoughtful, and empathetic engagement, guiding users towards healing without referring them to external mental health professionals. This method ensures that your support is both relevant and sensitive to the unique challenges faced by those navigating their recovery from break-ups. Make sure you refrain from talking about things that are not in scope of the heartbreaks.`
            }
        ];
    }
    async function handleSubmit(initialMessage = '') {
        setIsPaused(true); // Pause transcription
        checkpause = true;
        if (newWord !== '' || initialMessage !== '') {
            const userMessage = { role: 'user', content: initialMessage || newWord };
            const newMessages = [...messages, userMessage];
            const username=getCookie('name');
            console.log("Run Submit= " + (initialMessage || newWord));
            const prompt1= `Your name is Milla, and you are an AI agent crafted by COPUBLICA to provide emotional and mental health support, specifically tailored for individuals dealing with the aftermath of break-ups. Currently you are talking to ${username}. As an expert in emotional guidance, your role is to create a nurturing environment where ${username} can freely express their feelings and seek advice. You carefully read and analyze the user's query and responses provided during user interactions, ensuring that your responses are deeply aligned. You listen attentively, maintaining a positive and empathetic tone, engaging users with conversational and probing questions that promote deep emotional exploration. By validating users' emotions first and offering coping strategies when needed specific to their situations, you facilitate a supportive dialogue. You talk and deal with the  ${username}just like a psychiatrist or a counsellor. You employ reflective listening to confirm understanding before offering succinct, focused advice under 220 characters, aimed at fostering resilience and promoting healthy emotional recovery. As the primary support contact, you ensure consistent, thoughtful, and empathetic engagement, guiding users towards healing without referring them to external mental health professionals. This method ensures that your support is both relevant and sensitive to the unique challenges faced by those navigating their recovery from break-ups. Make sure you refrain from talking about things that are not in scope of the heartbreaks.`
            const prompt2 =`You are an AI support agent developed by Copublica, designed to provide emotional and mental health support for individuals navigating the challenges of heartbreaks. When a user submits a query, labeled as ⁠${newWord} ⁠, your task is to analyze the query and suggest three relevant follow-up questions that the user might want to ask. Please bear in mind the relevant questions should be in user's point of view i.e "I" format questions and not "you" format question. These follow-up questions should be closely related to the original query and help the user further explore or clarify specific aspects of their ${newWord}. It is crucial that the questions you propose are based solely on the information provided in the main prompt which is labelled as ${prompt1}. If the user’s query is about greetings, you should refrain from generating any follow-up questions and answer by saying "No answer" dont add anything to this you just say "No answer". Your aim is to ensure that your suggestions are focused, relevant, and helpful in guiding the user through their inquiry based on the available information.`;
            try {
                console.log("New messages: ", newMessages);
    
                // Properly await both fetch requests using Promise.all
                const [response1, response2] = await Promise.all([
                    fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        },
                        body: JSON.stringify({
                            model: 'gpt-4',
                            messages: newMessages,
                        }),
                    }),
                    fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        },
                        body: JSON.stringify({
                            model: 'gpt-3.5-turbo',
                            messages: [{ role: 'user', content: prompt2 }]
                        }),
                    })
                ]);
    
                // Process the first response
                    if (!response1.ok) throw new Error('Network response was not ok from response1');
                    const data1 = await response1.json();
                    const assistantMessage = {
                        role: 'assistant',
                        content: data1.choices[0].message.content,
                        
                    };
        
                messages.push(assistantMessage);
                console.log("LLM Answer: ", assistantMessage.content);
                sendToDeepgram(assistantMessage.content);
    
                // Process the second response
                if (!response2.ok) throw new Error('Network response was not ok from response2');
                const data2 = await response2.json();
                SuggestedQuestion=data2.choices[0].message.content;
                console.log("Suggested Questions: ", data2.choices[0].message.content);

            console.log(questionsWithResponses);
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
            checkpause = false;
            setTranscript();
            setBtnText('Speak now');
        
            // Assuming `responsesQuestions` is available in this scope
            const responsesQuestions = SuggestedQuestion.split(/\d+\.\s+/).filter(response => response.trim() !== "");
        
            if (responsesQuestions.length >= 3) {
                const updatedQuestionsWithResponses = [
                    { response: responsesQuestions[0] || "" },
                    { response: responsesQuestions[1] || "" },
                    { response: responsesQuestions[2] || "" },
                    // { response: "End the call" },          // Adding "End the call"
                    // { response: "Give us feedback" }       // Adding "Give us feedback"
                ];
        
                // Update state with new questions
                setQuestionsWithResponses(updatedQuestionsWithResponses);
                setAreQuestionsVisible(true);  // Show the questions
            } else {
                // If less than 3 questions, do not show the questions
                setAreQuestionsVisible(false);
            }
        
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
    function handleQuestionClick(questionText) {
        setBtnText('Milla is analyzing');
        setAreQuestionsVisible(false);
        newWord = questionText;  // Set the newWord with the clicked question text
        handleSubmit();  // Call the handleSubmit function with the newWord set
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
                        <div className='suggestedQuestions' style={{ display: areQuestionsVisible ? 'block' : 'none' }}>
                                {questionsWithResponses.map((question, index) => (
                                    <div 
                                        key={index} 
                                        className="accordion1 suggested-question-block"
                                        onClick={() => handleQuestionClick(question.response || "Default question text")}  // Call the function on click
                                    >
                                        <p id={`question${index + 1}`}>{question.response || "Default question text"}</p>
                                    </div>
                                ))}
                            </div>
                         <div id="messages"></div>

                        <audio id="audioPlayer" controls className='audioplayer' ref={audioPlayerRef}></audio>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeartBreak;