import React from 'react'
import {Row, Col, Form, Button} from 'react-bootstrap'
import {useState} from 'react'
import { gql, useLazyQuery } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';

const LOGIN_USER = gql`
  query login($username: String!,$password: String!) {
    login(username: $username, password: $password) {
        username
        email
        token
        createdAt
    }
  }
`;
export default function Login(props) {
    const navigate = useNavigate();
    const [variables, setVariables] = useState({
        username:'',
        password:'',
      });
      const[errors, setErrors] = useState({});
      const [loginUser, {data,loading}] = useLazyQuery(LOGIN_USER, {
          onError: (err)=>{
              console.log(err.graphQLErrors[0].extensions.errors)
              setErrors(err.graphQLErrors[0].extensions.errors)
          },
          onCompleted: (data)=>{
            if(!data){
                return;
            }
            localStorage.setItem('token', data.login.token);
            navigate('/');
          }
      });
      const submitLoginForm = e => {
        e.preventDefault();
        loginUser({variables})
    }
    return (
        <Row className="bg-white py-5 justify-content-center">
            <Col sm={8} md={6} lg={4}>
            
            <h1 className="text-center">Login</h1> 
            <Form onSubmit={submitLoginForm}>
                <Form.Group className="mb-3">
                    <Form.Label className={errors.username && 'text-danger'}>{errors.username?? 'Username'}</Form.Label>
                    <Form.Control className={errors.username && 'is-invalid'} type="text" value={variables.username} onChange={e => setVariables({...variables, username: e.target.value})} placeholder="Enter username" />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label className={errors.password && 'text-danger'}>{errors.password ?? 'Password'}</Form.Label>
                    <Form.Control className={errors.password && 'is-invalid'} type="password" value={variables.password} onChange={e => setVariables({...variables, password: e.target.value})} placeholder="Enter password" />
                </Form.Group>
                <div className="text-center">
                    <Button variant="success" type="submit"  style={{color: "white"}} disabled={loading}>
                    {loading ? "Loading..." : "Login"} 
                    </Button>
                    <br />
                    <small>Don't have an account?<Link to='/register'>Register</Link></small>
                </div> 
            </Form>
            </Col>
      </Row>
    )
}
