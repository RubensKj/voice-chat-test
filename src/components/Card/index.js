import React, { useState, useEffect } from 'react';
import Peer from 'peerjs';

import './styles.css';

const peerOptions = { host: '25.50.68.138', port: 9000, path: '/myapp' };

const fakePeer = {
  on(string, callback) {}
}

export default function Card({ match }) {

  // User channels
  const [peer, setPeer] = useState(fakePeer);
  const [channel, setChannel] = useState('');
  const [canDisconnect, setCanDisconnect] = useState(false);

  // User Actions
  const [deafen, setDeafen] = useState(false);

  // MediaStream Audio/Video
  const [remoteStream, setRemoteStream] = useState({});

  useEffect(() => {
    let { channel } = match.params;

    setChannel(channel);

    const peer = new Peer(channel, peerOptions);

    setPeer(peer);
  }, [match]);

  var getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

  peer.on('call', function (call) {
    let confirmed = window.confirm(call.peer + ' is calling you! Click ok to join the call.');

    if (confirmed) {
      getUserMedia({ video: false, audio: true }, function (stream) {
        call.answer(stream); // Answer the call with an A/V stream.
        call.on('stream', function (anotherStream) {
          setDeafen(true);
          setRemoteStream(anotherStream);
          setCanDisconnect(true);
        });
      }, function (err) {
        console.log('Failed to get local stream', err);
      });
    } else {
      call.close();
    }
  });

  useEffect(() => {
    let audio = document.getElementById('user-id');

    audio.srcObject = null;

    if (deafen && remoteStream && remoteStream instanceof MediaStream) {
      audio.srcObject = remoteStream;
    }
  }, [deafen, remoteStream]);

  function startCall() {
    let peerRoom = null

    if (peer) {
      peerRoom = peer;
    } else {
      peerRoom = new Peer(channel, peerOptions);
    }

    var roomId = window.prompt("Please enter your name:", "Some room id");

    if (roomId === channel) {
      throw alert('Room id cannot be the same as yours.');
    }

    var getUserMedia = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia);

    getUserMedia({ video: false, audio: true }, (stream) => {
      const call = peerRoom.call(roomId, stream);
      call.on('stream', (anotherStream) => {
        setDeafen(true);
        setRemoteStream(anotherStream);
        setCanDisconnect(true);
      });
    }, (err) => {
      console.error('Failed to get local stream', err);
    });
  }

  function disconnect() {
    if (canDisconnect) {
      peer.disconnect();
      setCanDisconnect(!canDisconnect);
    }
  }

  function dismute() {
    setDeafen(!deafen);
  }

  return (
    <div className="card">
      <audio id="user-id" autoPlay></audio>
      <button onClick={startCall}>Start call</button>
      {canDisconnect && (
        <button onClick={disconnect}>Disconnect</button>
      )}
      <button onClick={dismute} className={deafen ? 'mute' : 'mute isMuted'}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-1.7 0-3 1.2-3 2.6v6.8c0 1.4 1.3 2.6 3 2.6s3-1.2 3-2.6V4.6C15 3.2 13.7 2 12 2z" /><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18.4v3.3M8 22h8" /></svg>
        <span>Mute</span>
      </button>

      <div id="remote_vid"></div>
      <div id="local_vid"></div>
    </div>
  );
}
