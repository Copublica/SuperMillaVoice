import React, { useRef } from 'react';

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
       <div class="main">
    {/* <div class="overlay"></div>
    <div class="loader"></div>  */}

      <div class="about-amina">
        
      </div>

    <div class="actionRowsWrap">
      <div class="videoSectionWrap">
        <div class="videoWrap">
          <video id="mediaElement" class="videoEle show" autoplay></video>
          <canvas id="canvasElement" class="videoEle hide"></canvas>
        </div>

        <div class="actionRow switchRow hide" id="bgCheckboxWrap">
          <div class="switchWrap">
            <span>Remove background</span>
            <label class="switch">
              <input type="checkbox" id="removeBGCheckbox" />
              <span class="slider round"></span>
            </label>
          </div>

          <label class="BackgroundCss">
            Background (CSS)
            <input type="text" id="bgInput"
              value='url("https://images.unsplash.com/photo-1621947081720-86970823b77a?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ymx1ZSUyMCUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D") center / contain no-repeat' />
          </label>
        </div>
      </div>
      <div class="actionRow">
        <label class="AvatarID">
          AvatarID
          <input id="avatarID" type="text" />
        </label>

        <label class="VoiceID">
          VoiceID
          <input id="voiceID" type="text" />
        </label>
        <button onclick="startConverting ()" class="mic-icons"><i class="fas fa-microphone"></i></button>
        <button id="talkBtn">Talk</button>
        <button id="newBtn">New</button>
       
        <button id="closeBtn">Close</button>
      </div>

      <div class="actionRow">
        <label class="MessageBox">
          Message
          <input id="taskInput" value="hey.... welcome to expro, how can i assist you on expro." type="text" />
        </label>
        <button id="repeatBtn">Repeat</button>

      </div>
    </div>

    <p id="status"></p>


  </div>

    </div>
  );
};

export default Voice;
