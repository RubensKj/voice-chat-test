import React, { useState, useEffect } from 'react';
import Peer from 'peerjs';

import './styles.css';

export default function Card({ match }) {

  const [channel, setChannel] = useState('');
  const [deafen, setDeafen] = useState(false);
  const [remoteStream, setRemoteStream] = useState({});

  useEffect(() => {
    let { channel } = match.params;

    setChannel(channel);
  }, [match]);

  useEffect(() => {
    let audio = document.getElementById('user-id');

    audio.srcObject = null;

    if (deafen) {
      audio.srcObject = remoteStream;
    }
  }, [deafen, remoteStream]);

  function startCall() {
    const peer = new Peer('receiver', { host: 'localhost', port: 9000, path: '/myapp' })

    var getUserMedia = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia);

    getUserMedia({ video: false, audio: true }, (stream) => {
      const call = peer.call('sender', stream);
      console.log(stream);
      call.on('stream', (anotherStream) => {
        setRemoteStream(anotherStream)
      });
    }, (err) => {
      console.error('Failed to get local stream', err);
    });

    peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        console.log('Data -> ', data);
      })
    })
  }

  function connect() {
    setDeafen(!deafen);
  }

  function answerCall() {
    const peer = new Peer('sender', { host: 'localhost', port: 9000, path: '/myapp' })
    var getUserMedia = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia);;

    peer.on('call', function (call) {
      getUserMedia({ video: false, audio: true }, function (stream) {
        call.answer(stream); // Answer the call with an A/V stream.
        call.on('stream', function (anotherStream) {
          setRemoteStream(anotherStream)
        });
      }, function (err) {
        console.log('Failed to get local stream', err);
      });
    });
  }

  return (
    <div className="card">
      <audio id="user-id" autoPlay></audio>
      <button onClick={startCall}>Start call</button>
      <button onClick={connect}>Deafen</button>
      <button onClick={answerCall}>Answer call</button>

      <div id="remote_vid"></div>
      <div id="local_vid"></div>
    </div>
  );
}
