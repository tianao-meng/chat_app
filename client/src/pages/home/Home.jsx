import React, {useEffect} from 'react'
import {Row, Col, Button } from 'react-bootstrap'
import {Link, useNavigate} from 'react-router-dom'
import {useAuthDispatch, useAuthState} from '../../context/auth'
import {useMessageDispatch} from '../../context/message'
import { gql, useSubscription } from '@apollo/client'
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

export default function Home() {
    // const navigate = useNavigate();
    const authDispatch = useAuthDispatch();
    const messageDispatch = useMessageDispatch();

    const {user} = useAuthState();
    const {data:messageData, error:messageError} = useSubscription (NEW_MESSAGE);
    const {data:reactionData, error:reactionError} = useSubscription (NEW_REACTION);
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

    const logout = () => {
        authDispatch({type: 'LOGOUT'});
        window.location.href = 'login';
    }

    return (
        <>
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
        <Row className="bg-white w-100">
            <Users />
            <Messages />
        </Row>
        </>
    )
}
