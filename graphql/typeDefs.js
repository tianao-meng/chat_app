const { gql } = require('apollo-server');
module.exports = gql`
type User {
    username: String!,
    email: String,
    createdAt:String!,
    token:String,
    latestMessage: Message,
    imageUrl: String
}

type Message {
    uuid: String!,
    content: String!,
    to: String!,
    from: String!,
    createdAt:String!,
    reactions: [Reaction]
}

type Reaction {
    uuid: String!,
    content: String!,
    createdAt:String!,
    message: Message!,
    user: User!,
}

type RTCSessionDescriptionInit {
    sdp: String,
    type: String,
}
input RTCSessionDescriptionInitInput {
    sdp: String,
    type: String,
}

type RTCIceCandidateInit {
    candidate: String,
    sdpMLineIndex: Int,
    sdpMid: String,
    usernameFragment: String,
}
input RTCIceCandidateInitInput {
    candidate: String,
    sdpMLineIndex: Int,
    sdpMid: String,
    usernameFragment: String,
}

type RTCIceCandidate {
    address: String,
    candidate: String,
    component: String,
    foundation: String,
    port: Int,
    priority: Int,
    protocol: String,
    relatedAddress: String,
    relatedPort: Int,
    sdpMLineIndex: Int,
    sdpMid: String,
    tcpType: String,
    type: String,
    usernameFragment: String,
    toJSON: RTCIceCandidateInit,
}
input RTCIceCandidateInput {
    address: String,
    candidate: String,
    component: String,
    foundation: String,
    port: Int,
    priority: Int,
    protocol: String,
    relatedAddress: String,
    relatedPort: Int,
    sdpMLineIndex: Int,
    sdpMid: String,
    tcpType: String,
    type: String,
    usernameFragment: String,
    toJSON: RTCIceCandidateInitInput,
}
type Invitation{
    from: String!,
    to: String!,
}
type Response{
    from: String!,
    to: String!,
    content: String!
}
type sdpResponse {
    from: String!,
    to: String!,
    sdp:RTCSessionDescriptionInit
}
type iceResponse {
    from: String!,
    to: String!,
    ice:RTCIceCandidate 
}
type Query {
getUsers: [User]! 
login(username: String!, password: String!): User!
getMessages(from:String!): [Message]!
}
type Mutation {
    register(
        username:String!,
        email: String!,
        password: String!,
        confirmPassword: String!,
    ):User!
    sendMessage(to:String!, content: String!):Message!
    reactToMessage(uuid: String!, content: String!): Reaction!

    sendVideoInvitation(to: String!): Invitation!
    responseVideoInvitation(to:String!, agreeOrNot: String!): Response!
    sendSdp(sdp:RTCSessionDescriptionInitInput, to: String!): sdpResponse!
    sendIce(ice:RTCIceCandidateInput, to: String!): iceResponse!
}

type Subscription {
    newMessage: Message!
    newReaction: Reaction!

    newVideoInvitation: Invitation!
    newVideoResponse: Response!
    newSdp: sdpResponse!
    newIce: iceResponse! 
}
`;