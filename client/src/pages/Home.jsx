import React,{useState, useEffect} from 'react'
import {Row, Col, Button, Image} from 'react-bootstrap'
import {Link, useNavigate} from 'react-router-dom'
import {useAuthDispatch} from '../context/auth'
import { gql, useQuery, useLazyQuery } from '@apollo/client';

const GET_USERS = gql`
    query getUsers{
        getUsers{
            username createdAt imageUrl
            latestMessage{
                uuid
                from
                to
                content
                createdAt
            }
        }
    }
`;
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
export default function Home() {
    const navigate = useNavigate();
    const dispatch = useAuthDispatch();
    const {data, loading, error}= useQuery(GET_USERS);
    const [selectedUser, setSelectedUser] = useState(null);

    const [getMessages, {loading: messagesLoading, data: messageData}] = useLazyQuery(GET_MESSAGES)

    useEffect(() => {
        if(setSelectedUser){
            getMessages({variables: {from: selectedUser}});
        }
    }, [selectedUser, getMessages])

    if(messageData){
        console.log(messageData.getMessages);
    }

    const logout = () => {
        dispatch({type: 'LOGOUT'});
        navigate('/login');
    }
    // if(error) {
    //     console.error(error);
    // }
    // if(data){
    //     console.log(data);
    // }



    let usersMarkup;
    if (loading){
        usersMarkup = <p>loading ...</p>
    } else if (data.getUsers.length === 0){
        usersMarkup = <p>No other users has joined yet</p>
    } else {
        usersMarkup = data.getUsers.map((user) => {
            return(

                <div className="d-flex p-3" key={user.username} onClick={() => setSelectedUser(user.username)}>
                    <Image  src={user.imageUrl} roundedCircle 
                    style={{width: 50, height: 50, objectFit:'cover', marginRight:'20px'}}
                    />
                    <div>
                        <p className="text-success">{user.username}</p>
                        <p className="font-weight-light">
                            {user.latestMessage ? user.latestMessage.content : 'you are now connected'}
                        </p>

                    </div>
                </div>
            )
        })
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
            <Col xs={4} className="px-0 bg-secondary">
                {usersMarkup }
            </Col>
            <Col xs={8}>
                {messageData && messageData.getMessages.length > 0 ? (
                    messageData.getMessages.map((message) => (
                        <p key={message.uuid}>{message.content}</p>
                    ))
                ) : <p> Messages </p>}
            </Col>
        </Row>
        </>
    )
}
