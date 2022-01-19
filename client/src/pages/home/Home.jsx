/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useRef} from 'react'
import {Row, Col, Button } from 'react-bootstrap'
import {Link, useNavigate} from 'react-router-dom'
import {useAuthDispatch, useAuthState} from '../../context/auth'
import {useVideoDispatch, useVideoState} from '../../context/video'
import {useMessageDispatch} from '../../context/message'
import { gql, useSubscription, useMutation } from '@apollo/client'
import Users from './Users'
import Messages from './Messages'

const NEW_MESSAGE = gql`
    subscription newMessage{
        newMessage{
            uuid
            from
            to
            content
            createdAt
        }
    }
`
const NEW_REACTION = gql`
    subscription newReaction{
        newReaction{
            uuid
            content
            message{
                uuid
                from
                to
            }
        }
    }
`
const NEW_VIDEO_INVITATION = gql`
    subscription newVideoInvitation{
        newVideoInvitation{
            
                from
                to
            
            
        }
    }
`
const NEW_VIDEO_RESPONSE = gql`
    subscription newVideoResponse{
        newVideoResponse{
            
                from
                to
                content
            
            
        }
    }
`
const NEW_SDP = gql`
    subscription newSdp{
        newSdp{
            
                from
                to
                sdp{
                    sdp,
                    type
                }
            
            
        }
    }
`
const NEW_ICE = gql`
    subscription newIce{
        newIce{
            
                from
                to
                ice{
                    address,
                    candidate,
                    component,
                    foundation,
                    port,
                    priority,
                    protocol,
                    relatedAddress,
                    relatedPort,
                    sdpMLineIndex,
                    sdpMid,
                    tcpType,
                    type,
                    usernameFragment,
                }
            
            
        }
    }
`
const SEND_VIDEO_INVITATION = gql`
    mutation sendVideoInvitation($to:String!){
        sendVideoInvitation(to: $to){

                from
                to
            
        }
    }
`
const SEND_RESPONSE_VIDEO_INVITATION = gql`
    mutation responseVideoInvitation($to:String!, $agreeOrNot:String!){
        responseVideoInvitation(to: $to, agreeOrNot:$agreeOrNot){
            
                from
                to
                content
            
        }
    }
`
const SEND_SDP = gql`
    mutation sendSdp($sdp:RTCSessionDescriptionInitInput!, $to:String!){
        sendSdp(to: $to, sdp:$sdp){
            
                from
                to
                sdp{
                    sdp
                    type
                }
            
        }
    }
`
const SEND_ICE = gql`

    mutation sendIce($ice:RTCIceCandidateInput, $to:String!){
        sendIce(to: $to, ice:$ice){
           
                from
                to
                ice{
                    address,
                    candidate,
                    component,
                    foundation,
                    port,
                    priority,
                    protocol,
                    relatedAddress,
                    relatedPort,
                    sdpMLineIndex,
                    sdpMid,
                    tcpType,
                    type,
                    usernameFragment,
                }
            
        }
    }
`

export default function Home() {
    // const navigate = useNavigate();
    const authDispatch = useAuthDispatch();
    const videoDispatch = useVideoDispatch();
    const messageDispatch = useMessageDispatch();
    const {user} = useAuthState();
    let {pc, stream} = useVideoState();
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
    
    const offerOptions = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
    };

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
            const localStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
            localVideo.current.srcObject = localStream;
            videoDispatch({type: 'SET_STREAM', payload: localStream});
            console.log('p1 send invitation stream: ', localStream)

            // send video invitation
            sendVideoInvitation({variables: {
                to: invitedTo
            }})
            
            // send offer to server


        } else {
            localVideo.current.srcObject= null;
        }

    }, [invitedTo]);

    useEffect(() => {
        if(videoInvitationError){
            console.log(videoInvitationError);
        }
        console.log('videoInvitation: ', videoInvitation);
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
       const localStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
       localVideo.current.srcObject = localStream;
    //    remoteVideo.current.srcObject = localStream;
       videoDispatch({type: 'SET_STREAM', payload: localStream});
       console.log('p2 received invitation stream: ', localStream);
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
                // eslint-disable-next-line no-const-assign
                pc = new RTCPeerConnection({});
                pc.onicecandidate = onIceCandidate;
                pc.ontrack = gotRemoteStream; 
                // console.log('stream: ', stream);
                console.log('p1 set offer stream: ', stream);
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
                const offer = await pc.createOffer(offerOptions);
                // console.log('offer: ', offer);
                await pc.setLocalDescription(offer);
                videoDispatch({type: 'SET_PC', payload: pc});
                await sendSdp({variables:{to: invitedTo, sdp: offer}}) 
                
            } else {
                stream = null;
                setInvitedTo('');
                videoDispatch({type: 'SET_STREAM', payload: null});

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

                pc = new RTCPeerConnection({});
            
                console.log('p2 set anser stream: ', stream);
                // console.log('answer: ', answer)
                // pc.addEventListener('icecandidate', e => onIceCandidate(e)); 
                videoDispatch({type: 'SET_PC', payload: pc})
                pc.onicecandidate = onIceCandidate;
                pc.ontrack = gotRemoteStream;
                await pc.setRemoteDescription(sdpRes.sdp);
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                videoDispatch({type: 'SET_PC', payload: pc})
                await sendSdp({variables:{to: sdpRes.from, sdp: answer}})
            } else {
                console.log("sdpRes.type: ", sdpRes.sdp.type)
                pc.setRemoteDescription(sdpRes.sdp);
                videoDispatch({type: 'SET_PC', payload: pc})
            }
        }
    }, [newSdpData, newSdpError])

    const onIceCandidate = async (e) => {
        // console.log('candidate: ', e.candidate.address);
        await sendIce({variables:{ice:e.candidate, to: invitedTo}});
        // send the iceCandidate to server to redirect to another user;

    }
    useEffect(async () => {
        // if(!pc){
        //     return;
        // }
        if(newIceError){
            console.log(newIceError);
        }
        if(!newIceData){
            return;
        }
        if(newIceData.newIce){
            const iceRes = newIceData.newIce;
            // console.log('ice candidate: ', iceRes.ice)
            pc.addIceCandidate(iceRes.ice);
            videoDispatch({type: 'SET_PC', payload: pc})
        }
    }, [newIceData, newIceError])

    function gotRemoteStream(e) {
        console.log('in')
        if (remoteVideo.current.srcObject !== e.streams[0]) {
            console.log('remote stream: ', e.streams[0])
            
          remoteVideo.current.srcObject = e.streams[0];
          
          
        }
    }
    // useEffect(() => {
    //     if(remoteVideo.current){

    //         console.log('remoteVideo: ', remoteVideo.current.srcObject)
    //     }
    // }, [pc])

    const logout = () => {
        authDispatch({type: 'LOGOUT'});
        window.location.href = 'login';
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
                        <i role="button" className="fas fa-stop-circle fa-2x text-danger m-auto"></i>
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
