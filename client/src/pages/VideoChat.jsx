/*import React, { useEffect, useState, useRef } from 'react';
import Header from "../Components/Header";
import { Container, Row, Col, Image } from 'react-bootstrap';
import "../styles/VideoChat.css";
import { Peer } from "peerjs";

const VideoChat = () => {
    const [yourMeetingID, setYourMeetingID] = useState("");
    const [otherMeetingID, setOtherMeetingID] = useState("");
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState(null);
    const [endCall, setEndCall] = useState(false);

    const peerRef = useRef();

    useEffect(()=>{
        if(endCall){
            localStream.getTracks().forEach(track => track.stop());
            remoteStreams.stream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
            setRemoteStreams(null);
            if (peerRef.current) {
                peerRef.current.disconnect(); // Disconnect PeerJS instance
                peerRef.current.destroy(); // Destroy PeerJS instance
            }
            dataConnection.close();
        }
    }, [endCall])

    useEffect(() => {
        const peer = new Peer();

        //auto generating meetingID for current user
        peer.on('open', (id) => {
            setYourMeetingID(id);
        });

        //auto accepts calls, basically an event listner 
        peer.on('call', (call) => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(stream => {
                    call.answer(stream);
                    setLocalStream(stream);
                    setRemoteStreams({ id: call.peer, stream })

                })
                .catch(err => console.error('Error getting user media:', err));
        });

        peerRef.current = peer;

        return () => {
            peer.destroy();
        };
    }, []);

    function handleChange(event) {
        setYourMeetingID(event.target.value);
    }

    function handleOtherChange(event) {
        setOtherMeetingID(event.target.value);
    }

    function endCallFunction(){
        setEndCall(true);
        const call = peerRef.current.call(otherMeetingID, localStream);
        call.on("close", (idk) => console.log(idk))
    }

    //allows for outgoing calls
    function handleCall() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                setLocalStream(stream);
                const call = peerRef.current.call(otherMeetingID, stream);
                call.on('stream', (remoteStream) => {
                    setRemoteStreams({ id: otherMeetingID, stream: remoteStream });
                });
            })
            .catch(err => console.error('Error getting user media:', err));
    }

    return (
        <div>
            <Header />
            <div>
                <Container>
                    <form>
                        <label>
                            YOUR Meeting ID
                            <input type='text' value={yourMeetingID} onChange={handleChange} />
                        </label>
                        <label>
                            Enter OTHER Meeting ID to call
                            <input type='text' value={otherMeetingID} onChange={handleOtherChange} />
                        </label>
                        <input type="button" value="CALL" onClick={handleCall} />
                        <input type="button" value="END" onClick={endCallFunction} />
                    </form>
                    <Row>
                        <Col>
                            {localStream && (
                                <video ref={(ref) => ref && (ref.srcObject = localStream)} autoPlay playsInline />
                            )}
                        </Col>
                    </Row>
                    <Col>
                        {remoteStreams && (
                            <video ref={(ref) => ref && (ref.srcObject = remoteStreams.stream)} autoPlay playsInline />
                        )}
                    </Col>
                    <Row>
                        <Col>
                            {!localStream && (
                                <Image src="https://t4.ftcdn.net/jpg/02/29/75/83/360_F_229758328_7x8jwCwjtBMmC6rgFzLFhZoEpLobB6L8.jpg" />
                            )}
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            {!remoteStreams && (
                                <Image src="https://t4.ftcdn.net/jpg/02/29/75/83/360_F_229758328_7x8jwCwjtBMmC6rgFzLFhZoEpLobB6L8.jpg" />
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
}

export default VideoChat;
*/
import React, { useEffect, useState, useRef } from 'react';
import Header from "../Components/Header";
import { Container, Row, Col, Image } from 'react-bootstrap';
import "../styles/VideoChat.module.css";
import { Peer } from "peerjs";
import CollabCode from '../Components/CollabCode';

const VideoChat = () => {
    const [yourMeetingID, setYourMeetingID] = useState("");
    const [otherMeetingID, setOtherMeetingID] = useState("");
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState(null);
    const [currentCall, setCurrentCall] = useState(null);
    const [endCall, setEndCall] = useState(false);
    const [dataConnection, setDataConnection] = useState(null);

    const [reset, setReset] = useState(false);

    const peerRef = useRef();

    useEffect(() => {
        const peer = new Peer();

        //auto generating meetingID for current user
        peer.on('open', (id) => {
            setYourMeetingID(id);
        });

        //auto accepts calls, basically an event listner 
        peer.on('call', (call) => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(stream => {
                    call.answer(stream);
                    setLocalStream(stream);
                    call.on("stream", (remoteStream) => {
                        setRemoteStreams(remoteStream)
                    })
                    setCurrentCall(call);
                })

                .catch(err => console.error('Error getting user media:', err));
        });

        peer.on('connection', (conn) => {
            conn.on('data', (data) => {
                if (data === 'call ended') {
                    handleRemoteEndCall();
                }
            });
            setDataConnection(conn);
        });

        peerRef.current = peer;

        return () => {
            peer.destroy();
        };
    }, [reset]);

    //allows for outgoing calls
    function handleCall() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                setLocalStream(stream);
                const call = peerRef.current.call(otherMeetingID, stream);
                setCurrentCall(call);
                call.on('stream', (remoteStream) => {
                    setRemoteStreams(remoteStream);
                });

                const conn = peerRef.current.connect(otherMeetingID);
                conn.on('open', () => {
                    setDataConnection(conn);
                });

            })
            .catch(err => console.error('Error getting user media:', err));
    }

    function handleChange(event) {
        setYourMeetingID(event.target.value);
    }

    function handleOtherChange(event) {
        setOtherMeetingID(event.target.value);
    }

    function endCallFunction() {
        if (currentCall) {
            currentCall.close();
            handleLocalEndCall();
        }
        if (dataConnection) {
            dataConnection.send("call ended");
        }
    }

    function handleLocalEndCall() {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (remoteStreams) {
            remoteStreams.getTracks().forEach(track => track.stop());
            setRemoteStreams(null);
        }
        setCurrentCall(null);
    }

    function handleRemoteEndCall() {
        setEndCall(true);
        handleLocalEndCall();
    }

    function resetCallState() {
        if (peerRef.current) {
            peerRef.current.destroy();
        }
        setYourMeetingID("");
        setOtherMeetingID("");
        setEndCall(false);
        setDataConnection(null);
    }

    useEffect(() => {
        if (endCall) {
            resetCallState();
        }
    }, [endCall]);


    return (
        <div>
    <Header />
    <Container>
        
        <Row>
            <Col xs={12} md={6} lg={5}>
                <Row>
                    <Col>
                        {localStream && !endCall ? (
                            <video ref={(ref) => ref && (ref.srcObject = localStream)} autoPlay playsInline />
                        ) : (
                            <Image src="https://t4.ftcdn.net/jpg/02/29/75/83/360_F_229758328_7x8jwCwjtBMmC6rgFzLFhZoEpLobB6L8.jpg" />
                        )}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {remoteStreams && !endCall ? (
                            <video ref={(ref) => ref && (ref.srcObject = remoteStreams)} autoPlay playsInline />
                        ) : (
                            <Image src="https://t4.ftcdn.net/jpg/02/29/75/83/360_F_229758328_7x8jwCwjtBMmC6rgFzLFhZoEpLobB6L8.jpg" />
                        )}
                    </Col>
                </Row>
            </Col>
            <Col xs={12} md={6} lg={7}>
                <CollabCode />
            </Col>
        </Row>
    </Container>
</div>

    );
}

export default VideoChat;
