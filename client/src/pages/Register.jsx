import React from 'react'
import {Row, Col, Form, Button} from 'react-bootstrap'
import {useState} from 'react'
import { gql, useMutation } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';

const REGISTER_USER = gql`
  mutation register($username: String!,$email: String!,$password: String!,$confirmPassword: String!) {
    register(username: $username, email: $email, password: $password,confirmPassword: $confirmPassword) {
        username
        email
        createdAt 
    }
  }
`;
export default function Register(props) {
    const navigate = useNavigate();
    const [variables, setVariables] = useState({
        email:'',
        username:'',
        password:'',
        confirmPassword:'',
      });
      const[errors, setErrors] = useState({});
      const [registerUser, {loading}] = useMutation(REGISTER_USER, {
          update:(_, __) => {
              navigate('/login')
          },
          onError: (err)=>{
              console.log(err.graphQLErrors[0].extensions.errors)
              setErrors(err.graphQLErrors[0].extensions.errors)
          }
      });
      const submitRegisterForm = e => {
        e.preventDefault();
        registerUser({variables})
    }
    return (
        <Row className="bg-white py-5 justify-content-center">
            <Col sm={8} md={6} lg={4}>
            
            <h1 className="text-center">Register</h1> 
            <Form onSubmit={submitRegisterForm}>
            <Form.Group className="mb-3">
                <Form.Label className={errors.email && 'text-danger'}>{errors.email ?? 'Email Address'}</Form.Label>
                <Form.Control className={errors.email && 'is-invalid'} type="email" value={variables.email} onChange={e => setVariables({...variables, email: e.target.value})} placeholder="Enter email" />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label className={errors.username && 'text-danger'}>{errors.username?? 'Username'}</Form.Label>
                <Form.Control className={errors.username && 'is-invalid'} type="text" value={variables.username} onChange={e => setVariables({...variables, username: e.target.value})} placeholder="Enter username" />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label className={errors.password && 'text-danger'}>{errors.password ?? 'Password'}</Form.Label>
                <Form.Control className={errors.password && 'is-invalid'} type="password" value={variables.password} onChange={e => setVariables({...variables, password: e.target.value})} placeholder="Enter password" />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label className={errors.confirmPassword && 'text-danger'}>{errors.confirmPassword ?? 'Confirm Password'}</Form.Label>
                <Form.Control className={errors.confirmPassword && 'is-invalid'} type="password" value={variables.confirmPassword} onChange={e => setVariables({...variables, confirmPassword: e.target.value})} placeholder="Please confirm your password" />
            </Form.Group>
            <div className="text-center">
                <Button variant="success" type="submit"  style={{color: "white"}} disabled={loading}>
                   {loading ? "Loading..." : "Register"} 
                </Button>
                <br />
                <small>Already have an account?<Link to='/login'>Login</Link></small>
            </div> 
            </Form>
            </Col>
      </Row>
    )
}
