import { gql } from '@apollo/client'
export const SEND_VIDEO_INVITATION = gql`
    mutation sendVideoInvitation($to:String!){
        sendVideoInvitation(to: $to){

                from
                to
            
        }
    }
`
export const SEND_RESPONSE_VIDEO_INVITATION = gql`
    mutation responseVideoInvitation($to:String!, $agreeOrNot:String!){
        responseVideoInvitation(to: $to, agreeOrNot:$agreeOrNot){
            
                from
                to
                content
            
        }
    }
`
export const SEND_SDP = gql`
    mutation sendSdp($sdp:RTCSessionDescriptionInitInput!, $to:String!){
        sendSdp(to: $to, sdp:$sdp){
            
                from
                to
                sdp{
                    sdp
                    type
                }
            
        }
    }
`
export const SEND_ICE = gql`

    mutation sendIce($ice:RTCIceCandidateInput, $to:String!){
        sendIce(to: $to, ice:$ice){
           
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
export const HANG_UP = gql`
    mutation hangup($to:String!){
        hangup(to: $to){
            
            success
            
        }
    }
`

export const REACT_TO_MESSAGE = gql`
  mutation reactToMessage($uuid: String!, $content:String!){
    reactToMessage(uuid:$uuid, content:$content){
      uuid
    }
  }
`

export const SEND_MESSAGE = gql`
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

