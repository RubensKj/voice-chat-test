import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import MicrophoneStream from 'microphone-stream';
import getUserMedia from 'get-user-media-promise';

import './styles/styles.css';
import './styles/global.css';

const OPTIONS = {
  stream: null,
  objectMode: true,
  bufferSize: null,
  context: null
}

function App() {

  // Audio Settings
  const [micStream, setMicStream] = useState(new MicrophoneStream(OPTIONS));
  const [audioContext] = useState(new AudioContext());
  const [audioBuffer, setAudioBuffer] = useState({});

  // Variables Settings
  const [isCapturing, setIsCapture] = useState(false);
  const [isToListen, setIsToListen] = useState(false);

  // Socket Settings
  const [socketIo, setSocketIo] = useState({});


  useEffect(() => {
    const socket = io('http://192.168.25.17:3333', {
      query: { user: '123' }
    });


    setSocketIo(socket);

    socket.on('listen', raw => {
      async function putToListen(raw) {
        if (raw) {
          try {
            let source = audioContext.createBufferSource();
            source.buffer = audioContext.createBuffer(raw.numberOfChannels, raw.length, raw.sampleRate);
            source.connect(audioContext.destination);

            // play audio
            source.start();
          } catch (error) {
            console.log(error)
            return;
          }
        }
      }

      putToListen(raw);
    });
  }, [audioContext]);

  function startCapturing() {
    setIsCapture(!isCapturing);

    setMicStream(new MicrophoneStream(OPTIONS));

    getUserMedia({ video: false, audio: true })
      .then(function (stream) {
        micStream.setStream(stream);
      }).catch(function (error) {
        console.log(error);
      });

    micStream.on('data', function (chunk) {
      setAudioBuffer(chunk);
      sendVoiceToServer(chunk, socketIo);
    });

    micStream.on('format', function (format) {
      console.log(format);
    });
  }

  function sendVoiceToServer(raw, socketConnection) {
    socketConnection.emit('voice', {
      length: raw.length,
      duration: raw.duration,
      sampleRate: raw.sampleRate,
      numberOfChannels: raw.numberOfChannels,
    });
  }

  useEffect(() => {
    if (isToListen) {
      try {
        let source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        // play audio
        source.start();
      } catch (error) {
        console.log(error);
      }
    }
  }, [audioBuffer, audioContext, isToListen]);

  function listenYourVoice() {
    setIsToListen(!isToListen);
  }

  function stopCapturing() {
    setIsCapture(false);
    setIsToListen(false);
    micStream.stop();
    setMicStream(new MicrophoneStream(OPTIONS));
  }

  return (
    <div className="App">
      <div className="card">
        {isCapturing === false ? (
          <button onClick={() => startCapturing(socketIo)}>Start capture your voice</button>
        ) : (
            <button onClick={stopCapturing}>Stop capturing your voice</button>
          )}
        {isCapturing === true ? (
          <>
            {isToListen === true ? (
              <button onClick={() => listenYourVoice()}>Stop listening your voice</button>
            ) : (
                <button onClick={() => listenYourVoice()}>Listen your voice</button>
              )}
          </>
        ) : (
            <button disabled>Listen your voice</button>
          )}
      </div>
    </div>
  );
}

export default App;
