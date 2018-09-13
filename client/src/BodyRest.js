import React from 'react';
import { toast } from 'react-toastify';
import { ButtonGroup, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

const apiLink = 'http://localhost:8001';

export default class Body extends React.Component {
  constructor(props) {
    super(props);

    this.action = null;
    this.state = {
      users: [],
      error: '',
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
      fetch(`${apiLink}/user/create`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.state.name,
        })
      }).then(res => res.json()).then(response => {
        if (response.success === true) {
          let newUsers = [...this.state.users, response.data]
          this.setState({ users: newUsers });
          this.toggle();
          toast.success('User created!');
        } else {
          toast.error(response.message);
        }
      }).catch(error => {
        toast.error(error.message);
      });
    } else {
      fetch(`${apiLink}/user/edit`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: this.state.id,
          name: this.state.name,
        })
      }).then(res => res.json()).then(response => {
        if (response.success === true) {
          let newUsers = [...this.state.users];
          newUsers.forEach((ele, index) => {
            if (ele.id === response.data.id) {
              newUsers[index].name = response.data.name;
            }
          });
          this.setState({ users: newUsers });
          this.toggle();
          toast.success('User updated!');
        } else {
          toast.error(response.message);
        }
      }).catch(error => {
        toast.error(error.message);
      });
    }
  }

  deleteUser(id) {
    // eslint-disable-next-line
    if (confirm("Are you serious?")) {
      fetch(`${apiLink}/user/delete`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id
        })
      }).then(res => res.json()).then(response => {
        if (response.success === true) {
          let newUsers = [...this.state.users];
          newUsers = newUsers.filter(el => el.id !== response.data.id);
          this.setState({ users: newUsers });
          toast.success('User deleted!');
        } else {
          toast.error(response.message);
        }
      }).catch(error => {
        toast.error(error.message);
      });
    }
  }

  componentDidMount() {
    fetch(`${apiLink}/users/`, {
      method: 'GET'
    }).then(res => res.json()).then(data => {
      this.setState({ users: data });
    }).catch(error => {
      this.setState({error: error.message});
    });
  }

  render() {
    const error = this.state.error;
    const users = this.state.users;
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
            {
              error ? <span>Error! Something happened!</span> :
                users.length > 0 ? (
                  <table className="table table-dark table-hover text-center">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        users.map(el => (
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
                ) : (
                    <div className="text-center">Don't have any user</div>
                  )
            }
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