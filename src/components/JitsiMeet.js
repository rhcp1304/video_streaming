// Gdrive-Party/src/components/JitsiMeet.js
import React from 'react';

class JitsiMeet extends React.Component {
    constructor(props) {
        super(props);
        this.jitsiContainer = React.createRef();
        this.api = null; // To store the JitsiMeetExternalAPI instance
    }

    componentDidMount() {
        this.loadJitsiScript().then(() => {
            this.initializeJitsi();
        });
    }

    componentWillUnmount() {
        if (this.api) {
            this.api.dispose();
            console.log('Jitsi API disposed');
        }
    }

    loadJitsiScript() {
        return new Promise((resolve) => {
            // Check if JitsiMeetExternalAPI is already loaded to prevent multiple script loads
            if (window.JitsiMeetExternalAPI) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://8x8.vc/vpaas-magic-cookie-b8bac73eabc045188542601ffbd7eb7c/external_api.js';
            script.async = true;
            script.onload = resolve;
            script.onerror = (error) => {
                console.error("Failed to load Jitsi script:", error);
                // Optionally handle error, e.g., show a message to the user
            };
            document.body.appendChild(script);
        });
    }

    initializeJitsi() {
        if (!this.jitsiContainer.current) {
            console.warn("Jitsi container not found. Cannot initialize Jitsi Meet.");
            return;
        }

        const { room_id, name } = this.props;
        // The fixed part of your Jitsi as a Service (JaaS) domain
        const domain = "8x8.vc";
        // This is the App ID from your provided Jitsi code
        const jaasAppId = "vpaas-magic-cookie-b8bac73eabc045188542601ffbd7eb7c";

        const options = {
            roomName: `${jaasAppId}/${room_id}`, // Dynamic room name based on GDrive-Party room_id
            parentNode: this.jitsiContainer.current,
            userInfo: {
                displayName: name, // Use the display name from PartyRoom
            },
            configOverwrite: {
                startWithVideoMuted: false, // Start with video unmuted
                startWithAudioMuted: false, // Start with audio unmuted
                disableDeepLinking: true, // Prevents redirection to Jitsi apps
                prejoinPageEnabled: false, // Skips the pre-join page
                enableClosePage: false, // Prevents closing the tab/window on conference end
                // You can customize the toolbar buttons further if needed
                toolbarButtons: [
                    'microphone', 'camera', 'desktop', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat',
                    'settings', 'raisehand', 'videoquality', 'filmstrip',
                    'tileview', 'videobackgroundblur', 'mute-everyone'
                ]
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                SHOW_CHROME_EXTENSION_BANNER: false,
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'fullscreen', 'fodeviceselection', 'hangup',
                    'profile', 'chat', 'settings', 'tileview'
                ],
                // Hide the "Invite people" button if not needed
                // HIDE_INVITE_MORE_BUTTON: true,
            },
            // Note: If you intend to use premium features like recording,
            // you will need to generate and include a JWT here for authentication.
            // Example: jwt: "YOUR_GENERATED_JWT_TOKEN",
        };

        try {
            this.api = new window.JitsiMeetExternalAPI(domain, options);

            // Add event listeners for better debugging and control
            this.api.addEventListener('videoConferenceJoined', () => {
                console.log('Jitsi conference joined successfully');
            });
            this.api.addEventListener('participantLeft', (participant) => {
                console.log('Jitsi participant left:', participant);
            });
            this.api.addEventListener('readyToClose', () => {
                console.log('Jitsi conference ready to close (user clicked hangup)');
                // You might want to remove the Jitsi component from the DOM here
                // For example, by updating a state in PartyRoom to unmount JitsiMeet
            });
            this.api.addEventListener('apiReady', () => {
                console.log('Jitsi API is ready');
            });
            this.api.addEventListener('errorOccurred', (error) => {
                console.error('Jitsi API error:', error);
            });

        } catch (error) {
            console.error("Error initializing JitsiMeetExternalAPI:", error);
            // Handle cases where the API might not be available or options are invalid
        }
    }

    render() {
        return (
            <div
                ref={this.jitsiContainer}
                // Setting a default size. You might want to adjust this or make it responsive
                // based on your overall layout needs.
                style={{ height: '400px', width: '100%', maxWidth: '400px', margin: 'auto' }}
            >
                {/* Jitsi iframe will be mounted inside this div */}
            </div>
        );
    }
}

export default JitsiMeet;