import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // To get user's name

const VideoCallPage = () => {
    const { appointmentId } = useParams();
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get('roomId');
    const jitsiContainerRef = useRef(null);
    const [jitsiApi, setJitsiApi] = useState(null);
    const [userName, setUserName] = useState('User');

    useEffect(() => {
        // Get user's name from JWT token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserName(decoded.user.name || 'User'); // Extract name
            } catch (e) { console.error("Invalid token"); }
        }

        // Check if Jitsi script is already loaded
        if (!window.JitsiMeetExternalAPI) {
            const script = document.createElement('script');
            script.src = 'https://meet.jit.si/external_api.js'; // Jitsi external API
            script.async = true;
            script.onload = initializeJitsi; // Initialize after script loads
            document.body.appendChild(script);
        } else {
            initializeJitsi(); // Initialize if script is already there
        }

        // Cleanup function to dispose Jitsi meeting when component unmounts
        return () => {
            jitsiApi?.dispose();
        };
    }, [roomId, userName]); // Re-run effect if roomId or userName changes

    const initializeJitsi = () => {
        if (!roomId || !jitsiContainerRef.current) {
            console.error("Room ID or container missing");
            return; // Don't initialize if room ID or container is missing
        }
        
        // Dispose existing API instance if it exists
        jitsiApi?.dispose(); 

        const domain = 'meet.jit.si';
        const options = {
            roomName: roomId, // Use the unique ID from the appointment
            width: '100%',
            height: '100%',
            parentNode: jitsiContainerRef.current,
            interfaceConfigOverwrite: {
                // You can customize the Jitsi interface here
                SHOW_CHROME_EXTENSION_BANNER: false,
            },
            configOverwrite: {
                startWithAudioMuted: false,
                startWithVideoMuted: false,
            },
            userInfo: {
                displayName: userName // Set the user's display name
            }
        };

        // Create the Jitsi Meet API instance
        const api = new window.JitsiMeetExternalAPI(domain, options);
        setJitsiApi(api);

        // Example: Add event listeners if needed
        // api.addEventListener('videoConferenceLeft', () => {
        //     console.log('User left the call');
        //     // Redirect back to dashboard or show a message
        //     window.location.href = '/dashboard'; 
        // });
    };

    return (
        <div className="w-full h-screen flex flex-col">
            <h1 className="text-center text-xl font-semibold p-4 bg-gray-100">Video Consultation</h1>
            {/* The Jitsi Meet interface will be embedded here */}
            <div ref={jitsiContainerRef} className="flex-grow w-full h-full" />
        </div>
    );
};

export default VideoCallPage;