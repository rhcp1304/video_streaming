import React, { useRef, useEffect } from 'react';

const JitsiMeeting = ({ roomName, displayName }) => {
  const jitsiContainerRef = useRef(null);
  const api = useRef(null);

  useEffect(() => {
    // --- Your specific JaaS details from the dashboard ---
    const jaasBaseDomain = '8x8.vc';
    const jaasApiIdentifier = 'vpaas-magic-cookie-b8bac73eabc045188542601ffbd7eb7c'; // This is part of your API key/context
    const fullJitsiRoomName = `${jaasApiIdentifier}/${roomName}`; // Jitsi room name includes your identifier

    // Optional: Include your JWT if you intend to use premium features (recording, outbound calls, etc.)
    // Replace 'YOUR_JWT_TOKEN_HERE' with your actual JWT from the dashboard
    const jwtToken = 'YOUR_JWT_TOKEN_HERE';
    // ---------------------------------------------------

    const options = {
      roomName: fullJitsiRoomName, // Use the full room name including your API identifier
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: displayName,
      },
      // Include the JWT if it's available and you need premium features
      // jwt: jwtToken, // Uncomment this line and set jwtToken if you are using premium features

      configOverwrite: {
        // No need for externalConnectUrl here if the API identifier is part of the roomName and script src
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        // Add other Jitsi configuration overrides as needed
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        // Add other Jitsi UI configuration overrides as needed
      },
    };

    // Dynamically load the Jitsi Meet External API script
    // The script URL now correctly includes your JaaS API identifier in the path
    const script = document.createElement('script');
    script.src = `https://${jaasBaseDomain}/${jaasApiIdentifier}/external_api.js`;
    script.async = true;
    script.onload = () => {
      if (window.JitsiMeetExternalAPI) {
        // Initialize JitsiMeetExternalAPI with the base domain and options
        api.current = new window.JitsiMeetExternalAPI(jaasBaseDomain, options);
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