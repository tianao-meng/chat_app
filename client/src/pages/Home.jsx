import React from 'react'
import {Row, Col, Button} from 'react-bootstrap'
import {Link, useNavigate} from 'react-router-dom'
import {useAuthDispatch} from '../context/auth'
import { gql, useQuery } from '@apollo/client';

const GET_USERS = gql`
    query getUsers{
        getUsers{
            email username createdAt
        }
    }
`
export default function Home() {
    const navigate = useNavigate();
    const dispatch = useAuthDispatch();
    const {data, loading, error}= useQuery(GET_USERS);
    const logout = () => {
        dispatch({type: 'LOGOUT'});
        navigate('/login');
    }
    if(error) {
        console.error(error);
    }
    if(data){
        console.log(data);
    }

    let usersMarkup;
    if (loading){
        usersMarkup = <p>loading ...</p>
    } else if (data.getUsers.length === 0){
        usersMarkup = <p>No other users has joined yet</p>
    } else {
        usersMarkup = data.getUsers.map((user) => {
            return(

                <div key={user.username}>
                    <p>{user.username}</p>
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
        <Row className="bg-white">
            <Col xs={4}>
                {usersMarkup }
            </Col>
            <Col xs={8}>
                <p>Messages</p>
            </Col>
        </Row>
        </>
    )
}
