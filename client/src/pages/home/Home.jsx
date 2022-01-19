/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useRef} from 'react'
import {Row, Col, Button } from 'react-bootstrap'
import {Link} from 'react-router-dom'
import {useAuthDispatch, useAuthState} from '../../context/auth'
import {useVideoDispatch, useVideoState} from '../../context/video'
import {useMessageDispatch} from '../../context/message'
import { useSubscription, useMutation } from '@apollo/client'
import Users from './Users'
import Messages from './Messages'
import {NEW_MESSAGE, NEW_REACTION, NEW_VIDEO_INVITATION, NEW_VIDEO_RESPONSE, NEW_SDP, NEW_ICE, NEW_HANG_UP} from '../../util/subscriptionGql'
import {SEND_VIDEO_INVITATION, SEND_RESPONSE_VIDEO_INVITATION, SEND_SDP, SEND_ICE, HANG_UP} from '../../util/mutationGql'
import p2pClietClass from '../../util/p2pClient'



export default function Home() {

    const authDispatch = useAuthDispatch();
    const videoDispatch = useVideoDispatch();
    const messageDispatch = useMessageDispatch();
    const {user} = useAuthState();
    let {p2pClient} = useVideoState();
    // console.log('pc: ',pc)

    const [invitedTo, setInvitedTo] = useState('')
    const [receivedFrom, setReceivedFrom] = useState('')
    const localVideo = useRef(null);
    const remoteVideo = useRef(null);


    const {data:messageData, error:messageError} = useSubscription (NEW_MESSAGE);
    const {data:reactionData, error:reactionError} = useSubscription (NEW_REACTION);

    const {data:videoInvitation, error:videoInvitationError} = useSubscription (NEW_VIDEO_INVITATION);
    const {data:responseVideoInvitationData, error:responseVideoInvitationError} = useSubscription (NEW_VIDEO_RESPONSE);
    const {data:newSdpData, error:newSdpError} = useSubscription (NEW_SDP);
    const {data:newIceData, error:newIceError} = useSubscription (NEW_ICE);
    const {data:newHangUpData, error:newHangUpError} = useSubscription (NEW_HANG_UP);


    const [sendVideoInvitation ] = useMutation(SEND_VIDEO_INVITATION, {
        onError: (err)=> console.log(err),
    });
    const [sendResponseVideoInvitation ] = useMutation(SEND_RESPONSE_VIDEO_INVITATION, {
        onError: (err)=> console.log(err),
    });
    const [sendSdp ] = useMutation(SEND_SDP, {
        onError: (err)=> console.log(err),
    });
    const [sendIce ] = useMutation(SEND_ICE, {
        onError: (err)=> console.log(err),
    });
    const [hangup ] = useMutation(HANG_UP, {
        onError: (err)=> console.log(err),
    });
    


    const initializeP2P = async () => {
        if(p2pClient){
            return;
        }
        const p2p = new p2pClietClass();
        await p2p.setStream();
        // console.log('p2pClient: ', p2p)
        // console.log('stream: ',p2p.getStream())
        localVideo.current.srcObject = p2p.getStream();
        videoDispatch({type: 'SET_P2P_CLIENT', payload: p2p});
    }

    useEffect(() => {
        if(messageError) console.log(messageError);
        if(messageData){
            const message = messageData.newMessage
            const otherUser = user.username === message.to ? message.from : message.to;
            messageDispatch({type:'ADD_MESSAGE', payload: {username: otherUser, message}})
        }
    }, [messageData, messageError])

    useEffect(() => {
        if(reactionError) console.log(reactionError);
        if(reactionData){
            const reaction = reactionData.newReaction
            const otherUser = user.username === reaction.message.to ? reaction.message.from : reaction.message.to;
            messageDispatch({type:'ADD_REACTION', payload: {username: otherUser, reaction}})
        }
    }, [reactionData, reactionError])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(async () => {
        // console.log('localVideo: ', localVideo)
        if(localVideo.current === null){
            return;
        }
        if(invitedTo && !receivedFrom){
           
            await initializeP2P()            
            // send video invitation
            sendVideoInvitation({variables: {
                to: invitedTo
            }})
            
        } else {
            localVideo.current.srcObject= null;
        }

    }, [invitedTo]);

    useEffect(() => {
        if(videoInvitationError){
            console.log(videoInvitationError);
        }
        if(!videoInvitation){
            return;
        }
        if(videoInvitation.newVideoInvitation){
            const invitation = videoInvitation.newVideoInvitation;
            setReceivedFrom(invitation.from);
        }
    }, [videoInvitation, videoInvitationError])

    const confirmVideo = async () => {

       await sendResponseVideoInvitation({variables: {
           to: receivedFrom,
           agreeOrNot: 'confirm'
       }});
       setInvitedTo(receivedFrom);
       setReceivedFrom('');
       await initializeP2P();
    }
    const rejectVideo = async () => {
        await sendResponseVideoInvitation({variables: {
            to: receivedFrom,
            agreeOrNot: 'reject'
        }});
        setReceivedFrom('');
    }

    useEffect(async () => {
        if(responseVideoInvitationError){
            console.log(responseVideoInvitationError);
        }
        if(!responseVideoInvitationData){
            return;
        }
        if(responseVideoInvitationData.newVideoResponse){
            const response = responseVideoInvitationData.newVideoResponse;
            const rejectOrConfirm = response.content;
            if(rejectOrConfirm === 'confirm'){
                p2pClient.initPc(onIceCandidate, gotRemoteStream);
                await p2pClient.createOffer();
                await sendSdp({variables:{to: invitedTo, sdp: p2pClient.getOffer()}}) 
                
            } else {
                p2pClient.closeVideo();
                setInvitedTo('');
            }
            
        }
    }, [responseVideoInvitationData, responseVideoInvitationError])

    useEffect(async () => {
        if(newSdpError){
            console.log(newSdpError);
        }
        if(!newSdpData){
            return;
        }

        if(newSdpData.newSdp){
            const sdpRes = newSdpData.newSdp;
            if(sdpRes.sdp.type ==='offer'){
                
                p2pClient.initPc(onIceCandidate, gotRemoteStream); 
                await p2pClient.createAnswer(sdpRes.sdp)
                await sendSdp({variables:{to: sdpRes.from, sdp: p2pClient.getAnswer()}})
            } else {
                p2pClient.setRemoteSdp(sdpRes.sdp);
            }
        }
    }, [newSdpData, newSdpError])

    const onIceCandidate = async (e) => {

        await sendIce({variables:{ice:e.candidate, to: invitedTo}});

    }
    useEffect(async () => {

        if(newIceError){
            console.log(newIceError);
        }
        if(!newIceData){
            return;
        }
        if(newIceData.newIce){
            const iceRes = newIceData.newIce;
            p2pClient.addIceCandidate(iceRes.ice);
        }
    }, [newIceData, newIceError])

    useEffect(() => {

        if(newHangUpError){
            console.log(newHangUpError);
        }

        if(!newHangUpData){
            return;
        }

        closeVideo()

    },[newHangUpData, newHangUpError])

    function gotRemoteStream(e) {
        if (remoteVideo.current.srcObject !== e.streams[0]) {
            
          remoteVideo.current.srcObject = e.streams[0];
          
          
        }
    }

    const logout = () => {
        authDispatch({type: 'LOGOUT'});
        window.location.href = 'login';
    }

    const closeVideo = () => {
        p2pClient.closeVideo();
        setInvitedTo('');
        setReceivedFrom('');
    }

    const handleHangUp = async () => {
          closeVideo();
          await hangup({variables:{to: invitedTo}});
    }

    return (
        <>
        {
            (receivedFrom) ? 
            (<div className="invitation-dialog">
                <p>you received video invitation from {receivedFrom}</p>
                <div className="btn-groups">
                   <Button className="accept-btn" onClick={confirmVideo}>
                        Confirm
                   </Button>
                   <Button className="reject-btn" onClick={rejectVideo}>
                        Reject
                   </Button>
                </div>
            </div>) : null
        }

        <Row className="bg-white justify-content-around w-100 mb-1">
            <Col className="d-flex justify-content-center">
                <Link to='/login'>
                    <Button variant='link'>
                        Login
                    </Button>
                </Link>
            </Col>
            <Col className="d-flex justify-content-center">
                <Link to='/register'>
                    <Button variant='link'>
                        Regiter 
                    </Button>
                </Link>
            </Col>
            <Col className="d-flex justify-content-center">
                <Button variant='link' onClick={logout}>
                    Logout 
                </Button>
            </Col>
            
        </Row>
        {
            (invitedTo) ? (
                <>
                    <Row className="video-container w-100 h-100">
                        <Col className="p-0">
                            <video className="local-video w-100 h-100" ref={localVideo}  playsInline autoPlay muted></video>
                        </Col>
                        <Col className="p-0">
                            <video className="remote-video w-100 h-100" ref={remoteVideo}  playsInline autoPlay muted></video>
                        </Col>
                    </Row>
                    <div className="endRow  mb-1 w-100 p-2">
                        <i role="button" className="fas fa-stop-circle fa-2x text-danger m-auto" onClick={handleHangUp}></i>
                    </div>
                </>
            ) : null
        }
        <Row className="bg-white w-100">
            <Users />
            <Messages setInvitedTo={setInvitedTo}/>
        </Row>
        </>
    )
}
