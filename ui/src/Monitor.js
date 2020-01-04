import React from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { Link } from "react-router-dom";
import { FaArrowLeft, FaTrash, FaDownload } from 'react-icons/fa';
import CDrivePathSelector from './CDrivePathSelector';
import Loading from './Loading';
import './Monitor.css';

class Monitor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      taskList: [],
      specs: {},
      fetchComplete: false,
      selectedTaskName: "",
      saveStatus: ""
    };
    this.getSpecs = this.getSpecs.bind(this);
    this.fetchTasks = this.fetchTasks.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.saveTask = this.saveTask.bind(this);
    this.saveClick = this.saveClick.bind(this);
    this.cancelSave = this.cancelSave.bind(this);
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
      url: `${this.state.specs.cdriveUrl}app/${this.state.specs.username}/labeler/api/list-tasks-detailed`,
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
  deleteTask(taskName) {
    const request = axios({
      method: 'POST',
      url: `${this.state.specs.cdriveUrl}app/${this.state.specs.username}/labeler/api/delete`,
      data: {
        taskName: taskName
      }
    });
    request.then(
      response => {
        this.fetchTasks();
      },
    );
  }
  saveClick(taskName) {
    this.setState({
      selectedTaskName: taskName
    });
  }
  saveTask(path) {
    this.setState({saveStatus: "saving"});
    const cookies = new Cookies();
    const request = axios({
      method: 'POST',
      url: `${this.state.specs.cdriveUrl}app/${this.state.specs.username}/labeler/api/save`,
      data: {
        taskName: this.state.selectedTaskName,
        path: path,
        accessToken: cookies.get('labeler_token')
      }
    });
    request.then(
      response => {
        this.setState({
          saveStatus: "saved",
        });
      },
    );
  }
  cancelSave() {
    this.setState({
      selectedTaskName: "",
      saveStatus: ""
    });
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
      return(null);
    } else if (!this.state.fetchComplete) {
      this.fetchTasks();
      return(null);
    } else if (this.state.saveStatus === "saving") {
      return(
        <div className="path-selector-container">
          <h1 className="h3 mb-3 font-weight-bold text-center header-text">Saving to CDrive</h1>
          <Loading message={`Saving labels for task ${this.state.selectedTaskName} to CDrive`} />
        </div>
      );
    } else if (this.state.saveStatus === "saved") {
      console.log("reached here");
      return(
        <div className="path-selector-container">
          <h1 className="h3 mb-3 font-weight-bold text-center header-text">Saved!</h1>
          <div className="size-hundred">
            <div className="large-font text-center m-auto">
              Labels {"for"} task {this.state.selectedTaskName} have been saved to CDrive
            </div>
            <div className="navigation-options">
              <a className="btn btn-primary btn-lg" href={this.state.specs.cdriveUrl}>
                View {"in"} CDrive
              </a>
              <button className="btn btn-secondary btn-lg ml-5" onClick={this.cancelSave} >
                Back
              </button>
            </div>
          </div>
        </div>
      );
    } else if (this.state.selectedTaskName !== "") {
      return (
        <div className="path-selector-container">
          <h1 className="h3 mb-3 font-weight-bold text-center header-text">Select CDrive Folder to save output</h1>
          <CDrivePathSelector specs={this.state.specs} primaryFn={this.saveTask} primaryBtn={"Select this folder"} 
            secondaryFn={this.cancelSave} secondaryBtn={"Back"} />
        </div>
      );
    } else {
      let tasks;
      tasks = this.state.taskList.map((task, i) => {
        return(
          <tr key={i} className="monitor-task-row" >
            <td className="monitor-task-cell" >
              {task.taskName}
            </td>
            <td className="monitor-task-cell text-center" >
              {task.complete}
            </td>
            <td className="monitor-task-cell text-center">
              {task.total}
            </td>
            <td className="monitor-task-cell">
              <button className="task-action-btn" onClick={() => this.saveClick(task.taskName)} >
                <FaDownload size={25} color="#4A274F" />
              </button>
              <button className="task-action-btn" onClick={() => this.deleteTask(task.taskName)} >
                <FaTrash size={25} color="#4A274F" />
              </button>
            </td>
          </tr>
        );
      });
      return (
        <div className="monitor-container"> 
          <div className="home-link-container">
            <Link to={{ pathname: "/", specs:this.state.specs }}>
              <FaArrowLeft size={25} color="#4A274F" />
            </Link>
          </div>
          <h1 className="h3 mb-3 font-weight-bold text-center header-text">Select a Labeling Task</h1>
          <div className="monitor-list-container">
            <table className="monitor-list-table">
              <thead>
                <tr className="monitor-task-header-row">
                  <td className="monitor-task-header-cell task-name-header-cell">Task Name</td>
                  <td className="monitor-task-header-cell">Labeled</td>
                  <td className="monitor-task-header-cell">Total</td>
                  <td className="monitor-task-header-cell">Actions</td>
                </tr>
              </thead>
              <tbody>
                {tasks} 
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  }
}

export default Monitor;
