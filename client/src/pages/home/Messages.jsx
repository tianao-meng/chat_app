import React , {useState}from 'react'
import { Col, Form} from 'react-bootstrap'
import { gql, useLazyQuery, useMutation } from '@apollo/client';
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
            reactions{
                content
                uuid
            }
        }
    }
`;

const SEND_MESSAGE = gql`
    mutation sendMessage($to:String! $content:String!){
        sendMessage(to: $to, content:$content){
            uuid
            from
            to
            content
            createdAt
        }
    }
`

export default function Messages() {
    const dispatch = useMessageDispatch();
    const {users} = useMessageState();

    const [content, setContent] = useState('')

    const selectedUser = users ? users.find(user => user.selected === true) : null;
    const messages = selectedUser ? selectedUser.messages : null;

    const [getMessages, {loading: messagesLoading, data: messageData}] = useLazyQuery(GET_MESSAGES)
    const [sendMessage ] = useMutation(SEND_MESSAGE, {
        onError: (err)=> console.log(err),
    })

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
        selectedChatMarkup = <p className="info-text"> Loading ... </p> 
    } else{
        if(!messages){

            selectedChatMarkup =  <p className="info-text"> Find a user to have a chat </p>

        } else if(messages.length > 0) {

            selectedChatMarkup = messages.map((message) => (
                <Message key={message.uuid} message={message}/>
            ))

        } else {
            selectedChatMarkup =  <p className="info-text"> You can send your first message </p>
        }
    }

    const submitMessage = (e) => {
        e.preventDefault();
        if(content.trim() === '' || !selectedUser){
            return;
        }
        setContent('');
        sendMessage({variables: {to: selectedUser.username, content}})
        // mutation for sending message 
    }

    return (
        <Col className="p-0" xs={10} md={8}>
            <div className="messages-box d-flex flex-column-reverse p-4">
                {selectedChatMarkup}
            </div>
            
            <div className="px-3 py-2">

                <Form onSubmit={submitMessage}>
                    <Form.Group className="d-flex align-items-center m-0">
                        <Form.Control type="text" className="message-input rounded-pill bg-secondary border-0 p-4 " placeholder="Type a message..." value={content} onChange={e => setContent(e.target.value)} />
                        <i role="button" className="fas fa-paper-plane fa-2x text-primary ms-2" onClick={submitMessage}></i>
                    </Form.Group>
                </Form>
            </div>
        </Col>
    )
}
