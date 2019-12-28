import React from 'react';
import { Link } from "react-router-dom";
import './TaskInit.css';

class TaskInit extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      taskName: "",
      template: "None"
    };
    this.taskNameChange = this.taskNameChange.bind(this);
    this.templateChange = this.templateChange.bind(this);
  }
  taskNameChange(e) {
    this.setState({taskName: e.target.value});
  }
  templateChange(e) {
    this.setState({template: e.target.value});
  }
  render() {
    return(
      <div className="step-form">
        <label htmlFor="task-name">Task Name:</label>
        <input type="text" className="step-form-item" value={this.state.taskName} autoFocus 
          onChange={this.taskNameChange} id="task-name"/>
        <label htmlFor="template-select">Template:</label>
        <select onChange={this.templateChange} id="template-select" className="step-form-item">
          <option value="None">None</option>
          <option value="EM">Entity Matching</option>
          <option value="SM">Schema Matching</option>
        </select>
        <div className="step-form-item step-buttons">
          <button className="btn btn-large btn-primary btn-st1" 
            onClick={() => this.props.init(this.state.taskName, this.state.template)}>
            Next
          </button>
          <Link to="/" className="btn btn-large btn-secondary btn-st1">
            Home
          </Link>
        </div>
      </div>
    );
  }
}

export default TaskInit;
