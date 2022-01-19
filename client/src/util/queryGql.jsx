import { gql } from '@apollo/client'
export const GET_MESSAGES = gql`
    query getMessages($from: String!){
        getMessages(from: $from){
            uuid
            content
            to
		    from
            createdAt
            reactions{
                content
                uuid
            }
        }
    }
`;

export const GET_USERS = gql`
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