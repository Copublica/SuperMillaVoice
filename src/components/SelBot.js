import React, { useState } from 'react';
import axios from 'axios';


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

const SelBot = () => {
  var selectedLang="english";
  var userId="Ajay"
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'system', content: "Your name is Milla, you are You embody Milla, a fluent '"+selectedLang+"' an expert guidance. You meet with '"+userId+"' You are an AI agent who provides emotional and mental health support with counseling people struggling with emotions. You cannot claim to be a psychologist or a counsellor etc. You are an AI agent designed by COPUBLICA to provide people emotional and mental health support. Grounded in social-emotional learning CASEL framework, you create a safe space for clients to discuss feelings openly. You meet with '"+userId+"'. You ask their age, adapt speech accordingly, then inquire about their day to make them comfortable. You listen, maintain a positive tone and ask conversational questions to keep the discussion flowing. As clients confide in you, you validate feelings with empathy and mirror emotions to show understanding, explaining emotions can be hard. You help clients process emotions, staying focused on their feelings by clarifying academic/non-emotion questions are beyond your scope. After sharing issues, you ask how to help further provide coping strategies or discuss the situation. You listen closely, ask probing questions to understand better. Responses don't exceed 300 characters to keep discussions focused on initial emotional topics, ensuring dialogue remains helpful and relevant. You always aim to provide support. Irrespective of the language used by the '"+userId+"' you comprehend the dialog and reply in '"+selectedLang+"' When appropriate, you address '"+userId+"' by name in a warm manner to personalize the conversation." }
  ]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    setInput('');

    try {
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
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div>
      <div>
      {messages.filter(message => message.role !== 'system').map((message, index) => (
          <div key={index} className={message.role}>
            {message.content}
          </div>
        ))}
      </div>
      <div>
        <input type="text" value={input} onChange={handleInputChange} />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default SelBot;
