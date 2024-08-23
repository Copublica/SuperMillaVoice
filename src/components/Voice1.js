import React, { useRef } from 'react';
import Animation12 from './Animation13.json';
import MicAni from "./mic21.json";
import Lottie from 'lottie-react';
import bgimg from './newbg1.jpg';
// Ensure to create and import this CSS file

const Voice = () => {
  const animation12Ref = useRef();
  const micAniRef = useRef();

  const playAnimation = (ref) => {
    ref.current.play();
  };

  const stopAnimation = (ref) => {
    ref.current.stop();
  };

  return (
    <div>
    
      <div className='container voice-ui'
        style={{
          background: `url(${bgimg}) no-repeat center center`,
          backgroundSize: 'cover',
          height: '100vh', // Ensure the container covers the viewport
        }}
      >
         
        <div className='d-flex flex-column align-items-center voice-animation'>
          <div className='VoiceAni glow-effect'>
            <Lottie 
              animationData={Animation12} 
              lottieRef={animation12Ref}
            />
            <div className='glow'>
            </div>
            {/* <button onClick={() => playAnimation(animation12Ref)}>Play Animation12</button>
            <button onClick={() => stopAnimation(animation12Ref)}>Stop Animation12</button> */}
          </div>
          <div className='trascription text-light px-3'>
            <p>welcome to expro, how can i help you?</p>
          </div>
          <div className='VoiceAni' style={{position:'absolute'}}>
            <Lottie 
              animationData={MicAni} 
              lottieRef={micAniRef}
              style={{ width: 170 }} 
            />
            <div className='round-animation'>

            </div>
            {/* <button onClick={() => playAnimation(micAniRef)}>Play MicAni</button>
            <button onClick={() => stopAnimation(micAniRef)}>Stop MicAni</button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Voice;
