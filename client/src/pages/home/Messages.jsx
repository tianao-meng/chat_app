import React from 'react'
import { Col } from 'react-bootstrap'
import { gql, useLazyQuery } from '@apollo/client';
import {useEffect} from 'react';
import {useMessageDispatch, useMessageState} from '../../context/message'

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
        if(selectedUser && !selectedUser.messages){
            getMessages({variables: {from: selectedUser.username}});
        }
    }, [selectedUser]);
    useEffect(() => {
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
                <p key={message.uuid}>{message.content}</p>
            ))

        } else {
            selectedChatMarkup =  <p> You can send your first message </p>
        }
    }

    return (
        <Col xs={8}>
            {selectedChatMarkup}
        </Col>
    )
}
