import React, { useRef, useEffect } from 'react';

const JitsiMeeting = ({ roomName, displayName }) => {
  const jitsiContainerRef = useRef(null);
  const api = useRef(null);

  useEffect(() => {
    const domain = 'meet.jit.si'; // Or your self-hosted Jitsi domain
    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: displayName,
      },
      configOverwrite: {
        // Optional: Customize Jitsi Meet settings
        startWithAudioMuted: false,
        startWithVideoMuted: false,
      },
      interfaceConfigOverwrite: {
        // Optional: Customize Jitsi Meet UI
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
      },
    };

    // Dynamically load the Jitsi Meet External API script
    const script = document.createElement('script');
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => {
      if (window.JitsiMeetExternalAPI) {
        api.current = new window.JitsiMeetExternalAPI(domain, options);
        // You can add event listeners here to interact with the Jitsi meeting
        // For example: api.current.addEventListener('videoConferenceJoined', handleConferenceJoined);
      }
    };
    jitsiContainerRef.current.appendChild(script);

    return () => {
      // Clean up: Dispose the Jitsi API when the component unmounts
      if (api.current) {
        api.current.dispose();
      }
      if (jitsiContainerRef.current && script.parentNode === jitsiContainerRef.current) {
        jitsiContainerRef.current.removeChild(script);
      }
    };
  }, [roomName, displayName]);

  return <div ref={jitsiContainerRef} style={{ width: '700px', height: '500px' }} />;
};

export default JitsiMeeting;