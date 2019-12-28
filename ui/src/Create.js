import React from 'react';
import axios from 'axios';
import TaskInit from './TaskInit';
import CDrivePathSelector from './CDrivePathSelector';
import './App.css';
import './Create.css';

class Create extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeStepIndex: 0,
      examplesPath: "",
      labelsPath: "",
      taskName: "",
      template: "",
      specs: ""
    };
    this.getSpecs = this.getSpecs.bind(this);
    this.onTaskInit = this.onTaskInit.bind(this);
    this.onExamplesPathSelect = this.onExamplesPathSelect.bind(this);
    this.onLabelsPathSelect = this.onLabelsPathSelect.bind(this);
    this.nextStep = this.nextStep.bind(this);
    this.previousStep = this.previousStep.bind(this);
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
  onTaskInit(taskName, template) {
    this.setState({
      taskName: taskName,
      template: template,
      activeStepIndex: this.state.activeStepIndex + 1
    });
  }
  onExamplesPathSelect(path) {
    this.setState({
      examplesPath: path,
      activeStepIndex: this.state.activeStepIndex + 1
    });
  }
  onLabelsPathSelect(path) {
    this.setState({
      labelsPath: path
    });
  }
  nextStep() {
    this.setState({activeStepIndex: this.state.activeStepIndex + 1});
  }
  previousStep() {
    this.setState({activeStepIndex: this.state.activeStepIndex - 1});
  }
  render() {
    if(this.state.specs === "") {
      this.getSpecs();
    }
    let component, header;
    switch(this.state.activeStepIndex) {
      case 0:
        component = (
          <TaskInit init={this.onTaskInit}  />
        );
        header = "Step 1: Task details";
        break;
      case 1:
        component = (
          <CDrivePathSelector specs={this.state.specs} primaryFn={this.onExamplesPathSelect} 
            primaryBtn={"Select this folder"} secondaryFn={this.previousStep} secondaryBtn={"Back"} />
        );
        header = "Step 2: Select folder containing html files for examples";
        break;
      case 2:
        component = (
          <CDrivePathSelector specs={this.state.specs} primaryFn={this.onLabelsPathSelect} 
            primaryBtn={"Create Task"} secondaryFn={this.previousStep} secondaryBtn={"Back"} />
        );
        header = "Step 3: Select CSV file containing possible label values";
        break;
      default:
        component = "";
        header = "";
    }
    return(
      <div className="labeler-container"> 
        <div className="create-step-container">
          <h1 className="h3 mb-3 font-weight-bold text-center header-text">{header}</h1>
          {component}
        </div>
      </div>
    );
  }
}
export default Create;
