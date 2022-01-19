const {User, Message, Reaction} = require('../../models')
const {UserInputError, AuthenticationError, ForbiddenError, withFilter} = require('apollo-server')
const {Op} = require('sequelize')


// sendIce(ice:RTCIceCandidateInput, to: String!): Boolean!
module.exports  = {
    Mutation: {
        sendVideoInvitation: async (parent, {to}, {pubsub, user}) => {
                console.log('pubsub: ', pubsub);
                if(!user) throw new AuthenticationError('Unauthencated');
                const invitation = {from: user.username, to,}
                console.log('invitation: ', invitation)
                pubsub.publish('NEW_VIDEO_INVITATION', {newVideoInvitation: invitation});
                return invitation;
        },
        responseVideoInvitation: async (parent, {to, agreeOrNot}, {pubsub, user}) => {
            if(!user) throw new AuthenticationError('Unauthencated');

            const response = {from: user.username, to, content: agreeOrNot};
            console.log('response: ', response);
            pubsub.publish('NEW_VIDEO_RESPONSE', {newVideoResponse: response}); 
            return response;
        },
        sendSdp: async (parent, {sdp, to}, {pubsub, user}) => {
            if(!user) throw new AuthenticationError('Unauthencated');
            const sdpRes = {from: user.username, to, sdp};
            pubsub.publish('NEW_SDP_RESPONSE', {newSdp: sdpRes}); 
            return sdpRes;            
        },
        sendIce: async (parent, {ice, to}, {pubsub, user}) => {
            console.log('ice: ', ice);
            if(!user) throw new AuthenticationError('Unauthencated');
            const iceRes = {from: user.username, to, ice};
            pubsub.publish('NEW_ICE_RESPONSE', {newIce: iceRes});
            return iceRes;
        }

    },
    Subscription:{

        newVideoInvitation: {
            subscribe:  withFilter(
                (_, __, {pubsub, user}) => {
                    console.log('in new video');
                    if(!user) throw new AuthenticationError('Unauthencated');
                    return pubsub.asyncIterator('NEW_VIDEO_INVITATION')
                },
                async ({newVideoInvitation}, _, {user}) => {
                    console.log('newVideoInvitation: ', newVideoInvitation);
                    if(newVideoInvitation.to === user.username){
                        return true;
                    }
                    return false;
                }
            )
        },
        newVideoResponse: {
            subscribe:  withFilter(
                (_, __, {pubsub, user}) => {
                    
                    if(!user) throw new AuthenticationError('Unauthencated');
                    return pubsub.asyncIterator('NEW_VIDEO_RESPONSE')
                },
                async ({newVideoResponse}, _, {user}) => {
                    console.log('new video response: ', newVideoResponse); 
                    if(newVideoResponse.to === user.username){
                        return true;
                    }
                    return false;
                }
            )
        },
        newSdp: {
            subscribe:  withFilter(
                (_, __, {pubsub, user}) => {
                    
                    if(!user) throw new AuthenticationError('Unauthencated');
                    return pubsub.asyncIterator('NEW_SDP_RESPONSE')
                },
                async ({newSdp}, _, {user}) => {
                    // console.log('newSdp: ', newSdp);
                    if(newSdp.to === user.username){
                        return true;
                    }
                    return false;
                }
            )
        },
        newIce: {
            subscribe:  withFilter(
                (_, __, {pubsub, user}) => {
                    
                    if(!user) throw new AuthenticationError('Unauthencated');
                    return pubsub.asyncIterator('NEW_ICE_RESPONSE')
                },
                async ({newIce}, _, {user}) => {
                    console.log('newIce: ', newIce); 
                    if(newIce.to === user.username){
                        return true;
                    }
                    return false;
                }
            )
        },
    }
  };