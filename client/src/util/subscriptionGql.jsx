import { gql } from '@apollo/client'
export const NEW_MESSAGE = gql`
    subscription newMessage{
        newMessage{
            uuid
            from
            to
            content
            createdAt
        }
    }
`
export const NEW_REACTION = gql`
    subscription newReaction{
        newReaction{
            uuid
            content
            message{
                uuid
                from
                to
            }
        }
    }
`

export const NEW_VIDEO_INVITATION = gql`
    subscription newVideoInvitation{
        newVideoInvitation{
            
                from
                to
            
            
        }
    }
`
export const NEW_VIDEO_RESPONSE = gql`
    subscription newVideoResponse{
        newVideoResponse{
            
                from
                to
                content
            
            
        }
    }
`
export const NEW_SDP = gql`
    subscription newSdp{
        newSdp{
            
                from
                to
                sdp{
                    sdp,
                    type
                }
            
            
        }
    }
`

export const NEW_ICE = gql`
    subscription newIce{
        newIce{
            
                from
                to
                ice{
                    address,
                    candidate,
                    component,
                    foundation,
                    port,
                    priority,
                    protocol,
                    relatedAddress,
                    relatedPort,
                    sdpMLineIndex,
                    sdpMid,
                    tcpType,
                    type,
                    usernameFragment,
                }
            
            
        }
    }
`
export const NEW_HANG_UP = gql`
    subscription newHangUp{
        newHangUp{
            
            success
            
        }
    }
`