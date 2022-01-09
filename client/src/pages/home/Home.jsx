import React from 'react'
import {Row, Col, Button } from 'react-bootstrap'
import {Link, useNavigate} from 'react-router-dom'
import {useAuthDispatch} from '../../context/auth'

import Users from './Users'
import Messages from './Messages'


export default function Home() {
    // const navigate = useNavigate();
    const dispatch = useAuthDispatch();

    const logout = () => {
        dispatch({type: 'LOGOUT'});
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
