import React from 'react'
import { Col } from 'react-bootstrap'
import { gql, useLazyQuery } from '@apollo/client';
import {useEffect} from 'react';
import {useMessageDispatch, useMessageState} from '../../context/message'
import Message from './Message'

const GET_MESSAGES = gql`
    query getMessages($from: String!){
        getMessages(from: $from){
            uuid
            content
            to
		    from
            createdAt
        }
    }
`;

export default function Messages() {
    const dispatch = useMessageDispatch();
    const {users} = useMessageState();

    const selectedUser = users ? users.find(user => user.selected === true) : null;
    const messages = selectedUser ? selectedUser.messages : null;
    const [getMessages, {loading: messagesLoading, data: messageData}] = useLazyQuery(GET_MESSAGES)
    
    useEffect(() => {
        // console.log(selectedUser)
        if(selectedUser && !selectedUser.messages){
            getMessages({variables: {from: selectedUser.username}});
        }
    }, [selectedUser]);
    useEffect(() => {
        // console.log(messageData);
        if(messageData){
            dispatch({type: 'SET_USER_MESSAGES', payload:{
                username: selectedUser.username,
                messages: messageData.getMessages
            }})
        }
    }, [messageData]);

    let selectedChatMarkup;

    if (messagesLoading){
        selectedChatMarkup = <p> Loading ... </p> 
    } else{
        if(!messages){

            selectedChatMarkup =  <p> Find a user to have a chat </p>

        } else if(messages.length > 0) {

            selectedChatMarkup = messages.map((message) => (
                <Message key={message.uuid} message={message}/>
            ))

        } else {
            selectedChatMarkup =  <p> You can send your first message </p>
        }
    }

    return (
        <Col className="messages-box d-flex flex-column-reverse" xs={10} md={8}>
            {selectedChatMarkup}
        </Col>
    )
}
