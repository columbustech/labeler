import React from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa';
import './Perform.css';

class Perform extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      taskList: [],
      specs: {},
      fetchComplete: false
    };
    this.getSpecs = this.getSpecs.bind(this);
    this.fetchTasks = this.fetchTasks.bind(this);
  }
  getSpecs() {
    var pathname = window.location.pathname.substr(0, window.location.pathname.indexOf("labeler") + 8);
    const request = axios({
      method: 'GET',
      url: `${window.location.protocol}//${window.location.hostname}${pathname}api/specs`
    });
    request.then(
      response => {
        this.setState({specs: response.data});
      },
    );
  }
  fetchTasks() {
    const request = axios({
      method: 'GET',
      url: `${this.state.specs.cdriveUrl}app/${this.state.specs.username}/labeler/api/list-tasks`,
    });
    request.then(
      response => {
        this.setState({
          taskList: response.data.tasks,
          fetchComplete: true
        });
      },
    );
  }
  componentDidMount() {
    if (this.props.location && (this.props.location.specs)) {
      this.setState({specs: this.props.location.specs});
    } else {
      this.getSpecs();
    }
  }
  render() {
    if (Object.keys(this.state.specs).length === 0) {
      return (null);
    } else if (!this.state.fetchComplete) {
      this.fetchTasks();
      return(null);
    } else {
      let tasks;
      tasks = this.state.taskList.map((task, i) => {
        return (
          <Link key={i} to={{pathname: "/example/", specs: this.state.specs, taskName:task.taskName}} className="list-group-item custom-lgi list-group-item-action">
            {`${i+1}. ${task.taskName}`}
          </Link>
        );
      });
      while(tasks.length < 8) {
        var emptyTask = (
          <Link to="/" className="list-group-item disabled custom-lgi"></Link>
        );
        tasks.push(emptyTask);
      }
      return(
        <div className="task-container"> 
          <div className="home-link-container">
            <Link to={{ pathname: "/", specs:this.state.specs }}>
              <FaArrowLeft size={25} color="#4A274F" />
            </Link>
          </div>
          <h1 className="h3 mb-3 font-weight-bold text-center header-text">Select a Labeling Task</h1>
          <div className="task-list-container">
            <div className="list-group custom-list-group">
              {tasks}
            </div>
          </div>
        </div>
      );
    }
  }
}

export default Perform;
