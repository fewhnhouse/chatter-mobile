import gql from "graphql-tag";
const CREATE_GROUP_MUTATION = gql`
  mutation createGroup($id: Int!, $userId: Int!) {
    createGroup(id: $id, userId: $userId) {
      id
      name
    }
  }
`;
export default CREATE_GROUP_MUTATION;
