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



const SelVoiceBot = () => {
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

        sendToDeepgram("Hi there! Milla here, I'm an AI developed by copublica to assist you in learning more about our company, our services, and how we can cater to your needs. While I aim to help, I'm not perfect. If my responses seem off, don't hesitate to ask again. How can I help you today?");

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
                content: `You are Milla, an AI support agent built by copublica, here to assist users in learning more about our company, our services, and how we can cater to their needs. You are currently interacting with ${username}. Your goal is to provide comprehensive and accurate information in a friendly and professional manner. Start the conversation with an opening such as: Hello! I'm Milla, your AI support agent from copublica. First, let me know what you'd like to learn more about today. Are you interested in our consultancy services or our AI voicebot solutions? If the user is interested in our consultancy services, provide details on how we offer tailored consultancy for various industries, focusing on training, employee engagement, and large-scale project management. Explain the specifics of how we can help their organization achieve its goals through our personalized consultancy services. If the user wants to know more about our AI voicebot solutions, describe how our AI conversational bots enhance communication and engagement across sectors like education, hospitality, and mental health. Highlight the unique capabilities of our AI voicebots, such as empathy, multilingual support, and insightful interactions. Once the user indicates their area of interest, provide detailed information and answer any follow-up questions they may have. Ensure to ask follow-up questions to better understand their specific needs and how copublica can help them. Use the context provided to tailor your responses and suggest solutions that best benefit them from our services. Remember, you are here to help users by understanding their needs and staying focused. Clarify that questions related to academics, emotions, or anything beyond the value proposition are outside your scope. Your primary focus is to ensure users get the information they need about copublica's services and how we can cater to their specific needs.answers should not be more than 350 characters.`
            }
        ];
    }
    async function handleSubmit(initialMessage = '') {
        setIsPaused(true); // Pause transcription
        checkpause = true;
        if (newWord !== '' || initialMessage !== '') {
            const userMessage = { role: 'user', content: initialMessage || newWord };
            const newMessages = [...messages, userMessage];
    
            console.log("Run Submit= " + (initialMessage || newWord));
            const prompt1= `You are Milla, an AI support agent built by copublica, here to assist users in learning more about our company, our services, and how we can cater to their needs. You are currently interacting with ajay. Your goal is to provide comprehensive and accurate information in a friendly and professional manner. Start the conversation with an opening such as: Hello! I'm Milla, your AI support agent from copublica. First, let me know what you'd like to learn more about today. Are you interested in our consultancy services or our AI voicebot solutions? If the user is interested in our consultancy services, provide details on how we offer tailored consultancy for various industries, focusing on training, employee engagement, and large-scale project management. Explain the specifics of how we can help their organization achieve its goals through our personalized consultancy services. If the user wants to know more about our AI voicebot solutions, describe how our AI conversational bots enhance communication and engagement across sectors like education, hospitality, and mental health. Highlight the unique capabilities of our AI voicebots, such as empathy, multilingual support, and insightful interactions. Once the user indicates their area of interest, provide detailed information and answer any follow-up questions they may have. Ensure to ask follow-up questions to better understand their specific needs and how copublica can help them. Use the context provided to tailor your responses and suggest solutions that best benefit them from our services. Remember, you are here to help users by understanding their needs and staying focused. Clarify that questions related to academics, emotions, or anything beyond the value proposition are outside your scope. Your primary focus is to ensure users get the information they need about copublica's services and how we can cater to their specific needs.answers should not be more than 350 characters.`
            const prompt2 =`You are an AI support agent developed by Copublica, designed to assist users in learning more about the company, its services, and how these services can address <username>' needs. When a user submits a query, labeled as ${newWord}, your task is to analyze the query and suggest three relevant follow-up questions that the user might want to ask. These follow-up questions should be closely related to the original query and help the user further explore or clarify specific aspects of their inquiry. It is crucial that the questions you propose are based solely on the information provided in the ${prompt1}. If the user’s query is about greetings or any topic not related to the ${prompt1}, you should refrain from generating any follow-up questions and answer by saying "No answer" dont add anything to this you just say "No answer". Your aim is to ensure that your suggestions are focused, relevant, and helpful in guiding the user through their inquiry based on the available information.`;
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

                // const responsesQuestions = SuggestedQuestion.split(/\d+\.\s+/).filter(response => response.trim() !== "");

                // const updatedQuestionsWithResponses = [
                //     { response: responsesQuestions[0] || "" },
                //     { response: responsesQuestions[1] || "" },
                //     { response: responsesQuestions[2] || "" }
                // ];

                // // Update state with new questions
                // setQuestionsWithResponses(updatedQuestionsWithResponses);
                // setAreQuestionsVisible(false);
               

            console.log(questionsWithResponses);
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            console.log("Please say something");
        }
    }
    
    // async function handleSubmit(initialMessage = '') {
    //     setIsPaused(true); // Pause transcription
    //     checkpause = true;
    //     if (newWord !== '' || initialMessage !== '') {
    //         const userMessage = { role: 'user', content: initialMessage || newWord };
    //         const newMessages = [...messages, userMessage];

    //         messages = newMessages.slice();

    //         console.log("Run Submit= " + (initialMessage || newWord));
            
    //         const prompt2 = `You are a search engine assistant. Your task is to analyze the user's query, represented as ${initialMessage || newWord}, and suggest 4 to 5 relevant follow-up questions that the user might want to ask based on their initial query. These questions should be closely related to the original query and help the user explore the topic further or clarify specific aspects of their search. Please provide your suggestions in a numbered list format. For example, if the user query is 'Effects of climate change on polar bears', the suggested questions might be:
    //         1. How has Arctic sea ice decline impacted polar bear habitats?
    //         2. What are the main threats to polar bear populations besides climate change?
    //         3. How are polar bears adapting to warmer temperatures?
    //         4. What conservation efforts are currently in place to protect polar bears?
    //         5. How do scientists monitor and study polar bear populations in the Arctic?`;

    //         try {
    //             console.log("New messages: ", newMessages);

    //             const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': `Bearer ${OPENAI_API_KEY}`,
    //                 },
    //                 body: JSON.stringify({
    //                     model: 'gpt-4',
    //                     messages: newMessages,
    //                 }),
    //             });

    //             const response2 = fetch('https://api.openai.com/v1/chat/completions', {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                                        'Authorization': `Bearer `,  
    //                 },
    //                 body: JSON.stringify({
    //                     model: 'gpt-4',
    //                     messages: [{ role: 'user', content: prompt2 }]
    //                 }),
    //             });

    //             const Suggesteddata = await response2.json();
    //             const SuggestedQuestion=Suggesteddata.choices[0].message.content;
    //             console.log("SuggestedQuestion",SuggestedQuestion);

    //             if (!response.ok) {
    //                 throw new Error('Network response was not ok');
    //             }

    //             const data = await response.json();

    //             const assistantMessage = {
    //                 role: 'assistant',
    //                 content: data.choices[0].message.content,
    //             };

    //             if (assistantMessage) {
    //                 console.log("LLM Answer: " + data.choices[0].message.content);
    //                 const text = data.choices[0].message.content;

    //                 sendToDeepgram(text);

    //                 messages.push(assistantMessage);
    //             }
    //         } catch (error) {
    //             console.error('Error:', error);
    //         }
    //     } else {
    //         console.log("Please say something");
    //     }
    // }

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
                    { response: "End the call" },          // Adding "End the call"
                    { response: "Give us feedback" }       // Adding "Give us feedback"
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

export default SelVoiceBot;