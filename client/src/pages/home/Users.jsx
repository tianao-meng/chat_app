import React from 'react'
import { gql, useQuery } from '@apollo/client';
import {Image} from 'react-bootstrap'
import {Col} from 'react-bootstrap'
import classNames from 'classnames'
import {useMessageDispatch, useMessageState} from '../../context/message'


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

export default function Users() {

    const dispatch = useMessageDispatch();
    const {users } = useMessageState();
    const {loading}= useQuery(GET_USERS, {
        onCompleted: (data) => dispatch({type: 'SET_USERS', payload: data.getUsers}),
        onError: (err) => console.log(err)
    });
    

    let usersMarkup;
    if (loading || !users){
        usersMarkup = <p>loading ...</p>
    } else if (users.length === 0){
        usersMarkup = <p>No other users has joined yet</p>
    } else {
        usersMarkup = users.map((user) => {
            const selected = user.selected;
            // console.log(selected)
            return(


                <div role="button" className={classNames('d-flex p-3 users-container', {'bg-white': selected})} key={user.username} onClick={() => dispatch({type: 'SET_SELECTED_USER', payload: user.username})}>
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
            <Col xs={4} className="px-0 bg-secondary">
                {usersMarkup }
            </Col>
    )
}
