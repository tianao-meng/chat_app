import React, {useState} from 'react'
import classNames from 'classnames'
import {useAuthState} from '../../context/auth'
import moment from 'moment'
import {OverlayTrigger, Tooltip, Button, Popover} from 'react-bootstrap'
import { gql,  useMutation } from '@apollo/client';

const reactions = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎']

const REACT_TO_MESSAGE = gql`
  mutation reactToMessage($uuid: String!, $content:String!){
    reactToMessage(uuid:$uuid, content:$content){
      uuid
    }
  }
`

export default function Message({message}) {
    const {user} = useAuthState();
    const sent = message.from === user.username;
    const received = !sent;
    const [showPopover, setShowPopover] = useState(false);
    const reactionIcons =[...new Set(message.reactions.map(r => r.content))]
    const [reactToMessage] = useMutation(REACT_TO_MESSAGE, {
      onError: (err) => console.log(err),
      onCompleted: (data) => {
        setShowPopover(false);
      }
    })


    const react = (reaction) => {
      reactToMessage({variables:{uuid: message.uuid, content: reaction}})
    }
    const reactButton = (
      <OverlayTrigger
        
        show={showPopover}

        trigger="click" 
        placement="top"

        onToggle={setShowPopover}
        transition={false}
        rootClose

        overlay={
          <Popover className="rounded-pill">
            <Popover.Body className="react-button-popover px-0 py-2">
              {
                reactions.map(reaction => (
                  <Button className="react-icon-button" variant="link" key={reaction} onClick={() => react(reaction)}>
                    {reaction}
                  </Button>
                ))
              }
            </Popover.Body>
          </Popover>
        }
      >
            <Button variant='link' className='px-2 border-0'>
              <i className="far fa-smile"/>
            </Button>
      </OverlayTrigger>
    )

    return (
      <div className={classNames("d-flex my-3",{
        'ms-auto' : sent,
        'me-auto': received,
      })}>
        {sent && reactButton}
        <OverlayTrigger
          placement={sent ? 'right' : 'left'}
          overlay={
          <Tooltip>
            {moment(message.createdAt).format('YYYY-MM-DD @ HH:mm:a')}
          </Tooltip>
        }
      >

            
            <div className={classNames("py-2 px-3 rounded-pill position-relative", {
                'bg-primary': sent,
                'bg-secondary': received,
            })}>
                {
                  message.reactions.length > 0 && (
                    <div className="reactions-div bg-secondary p-1 rounded-pill">
                     {reactionIcons} {reactionIcons.length}
                    </div>
                  )
                }
                <p className={classNames({
                    "text-white":sent,
                })} key={message.uuid}>{message.content}</p>
            </div>
       
        </OverlayTrigger>
        {received && reactButton}
      </div>

    )
}
