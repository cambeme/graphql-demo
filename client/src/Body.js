import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { toast } from 'react-toastify';
import { ButtonGroup, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

const USER_READ = gql`
  query {
    getUsers {
      id
      name
    }
  }
`;

const USER_CREATE = gql`
  mutation ($name: String!) {
    createUser(name: $name) {
      id
      name
    }
  }
`;

const USER_UPDATE = gql`
  mutation ($id: Int!, $name: String!) {
    updateUser(id: $id, name: $name) {
      id
      name
    }
  }
`;

const USER_DELETE = gql`
 mutation ($id: Int!) {
    deleteUser(id: $id){
      success
    }
  }
`;

export default class Body extends React.Component {
  constructor(props) {
    super(props);

    this.refetch = null;
    this.action = null;
    this.state = {
      modal: false,
      id: null,
      name: ''
    };

    this.toggle = this.toggle.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  toggle(id, name) {
    let updateObj = {
      id: null,
      name: '',
      modal: !this.state.modal
    };

    if (id) {
      updateObj.id = id;
    }

    if (name) {
      updateObj.name = name;
    }

    this.setState(updateObj);
  }

  handleChange(event) {
    this.setState({ name: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();

    if (this.action === 'create') {
      this.props.client
        .mutate({
          mutation: USER_CREATE,
          variables: {
            name: this.state.name
          }
        })
        .then(({ data, errors }) => {
          if (data && data.createUser) {
            this.refetch();
            this.toggle();
            toast.success('User created!');
          }
        }).catch((error) => {
          if (error.graphQLErrors.length > 0)
            toast.error(error.graphQLErrors[0].message);
        });
    } else {
      this.props.client
        .mutate({
          mutation: USER_UPDATE,
          variables: {
            id: this.state.id,
            name: this.state.name
          }
        })
        .then(({ data }) => {
          if (data && data.updateUser) {
            this.refetch();
            this.toggle();
            toast.success('User updated!');
          }
        }).catch((error) => {
          if (error.graphQLErrors.length > 0)
            toast.error(error.graphQLErrors[0].message);
        });
    }
  }

  deleteUser(id) {
    // eslint-disable-next-line
    if (confirm("Are you serious?")) {
      this.props.client
        .mutate({
          mutation: USER_DELETE,
          variables: {
            id
          }
        })
        .then(({ data }) => {
          if (data && data.deleteUser && data.deleteUser.success === true) {
            this.refetch();
            toast.success('User deleted!');
          }
        }).catch((error) => {
          if (error.graphQLErrors.length > 0)
            toast.error(error.graphQLErrors[0].message);
        });
    }
  }

  render() {
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md-12">
            <Button
              color="primary"
              onClick={() => {
                this.action = 'create';
                this.toggle();
              }}
            >Create New User
              </Button>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <Query query={USER_READ}>
              {({ data, loading, error, refetch }) => {
                this.refetch = refetch;

                if (loading) {
                  return <span>Loading ...</span>;
                }

                if(error) {
                  return <span>Error! Something happened!</span>;
                }

                if (data && data.getUsers && data.getUsers.length > 0) {
                  return (
                    <table className="table table-dark table-hover text-center">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          data.getUsers.map(el => (
                            <tr key={`user-${el.id}`}>
                              <td>
                                {el.name}
                              </td>
                              <td>
                                <ButtonGroup>
                                  <Button
                                    color="success"
                                    onClick={() => {
                                      this.action = 'update';
                                      this.toggle(el.id, el.name);
                                    }}>
                                    Update
                                    </Button>
                                  <Button
                                    color="danger"
                                    onClick={() => {
                                      this.deleteUser(el.id)
                                    }}>
                                    Delete
                                  </Button>
                                </ButtonGroup>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  )
                }
                return (
                  <div className="text-center">Don't have any user</div>
                );
              }}
            </Query>
          </div>
        </div>
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <Form onSubmit={this.handleSubmit}>
            <ModalHeader toggle={this.toggle}>{this.action === 'create' ? 'New' : 'Update'} User</ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label for="name">Name</Label>
                <Input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Type name here"
                  onChange={this.handleChange}
                  defaultValue={this.state.name} />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button color={this.action === 'create' ? 'primary' : 'success'} type="submit">Save</Button>{' '}
              <Button color="secondary" onClick={this.toggle}>Cancel</Button>
            </ModalFooter>
          </Form>
        </Modal>
      </React.Fragment>
    );
  }
}