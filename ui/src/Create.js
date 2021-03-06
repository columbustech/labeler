import React from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import TaskInit from './TaskInit';
import CDrivePathSelector from './CDrivePathSelector';
import Loading from './Loading';
import Success from './Success';
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
      uploadFrom: "",
      specs: "",
      isExecuting: false,
      taskStatusPollId: 0
    };
    this.getSpecs = this.getSpecs.bind(this);
    this.onTaskInit = this.onTaskInit.bind(this);
    this.onExamplesPathSelect = this.onExamplesPathSelect.bind(this);
    this.onLabelsPathSelect = this.onLabelsPathSelect.bind(this);
    this.taskStatusPoll = this.taskStatusPoll.bind(this);
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
  onTaskInit(taskName, template, uploadFrom) {
    this.setState({
      taskName: taskName,
      template: template,
      activeStepIndex: this.state.activeStepIndex + 1,
      uploadFrom: uploadFrom
    });
  }
  onExamplesPathSelect(path) {
    this.setState({
      examplesPath: path,
      activeStepIndex: this.state.activeStepIndex + 1
    });
  }
  taskStatusPoll() {
    const request = axios({
      method: 'GET',
      url: `${this.state.specs.cdriveUrl}app/${this.state.specs.username}/labeler/api/task-creation-status?taskName=${this.state.taskName}`,
    });
    request.then(
      response => {
        if(response.data.taskStatus === "ready") {
          clearInterval(this.state.taskStatusPollId);
          this.setState({
            isExecuting: false
          });
        }
      },
    );
  }
  onLabelsPathSelect(path) {
    this.setState({
      labelsPath: path,
      isExecuting: true,
      activeStepIndex: this.state.activeStepIndex + 1
    });
    const cookies = new Cookies();
    const request = axios({
      method: 'POST',
      url: `${this.state.specs.cdriveUrl}app/${this.state.specs.username}/labeler/api/create-task`,
      data: {
        taskName: this.state.taskName,
        template: this.state.template,
        examplesPath: this.state.examplesPath,
        labelsPath: path,
        accessToken: cookies.get('labeler_token')
      }
    });
    request.then(
      response => {
        this.setState({
          taskStatusPollId: setInterval(() => this.taskStatusPoll(), 1000)
        });
      },
    );
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
          <CDrivePathSelector specs={this.state.specs} primaryFn={this.onExamplesPathSelect} key="2"
            primaryBtn={"Select this folder"} secondaryFn={this.previousStep} secondaryBtn={"Back"} />
        );
        header = "Step 2: Select the folder containing examples from CDrive";
        break;
      case 2:
        component = (
          <CDrivePathSelector specs={this.state.specs} primaryFn={this.onLabelsPathSelect} key="3"
            primaryBtn={"Create Task"} secondaryFn={this.previousStep} secondaryBtn={"Back"} fileSelector={true} />
        );
        header = "Step 3: Select JSON file containing possible label values from CDrive";
        break;
      case 3:
        if (this.state.isExecuting) {
          header = `Creating Task`;
          component = <Loading message={`Creating task ${this.state.taskName}, this may take a couple of minutes`} />
        } else {
          header = 'Task Created!';
          component = <Success specs={this.state.specs} message={`Task ${this.state.taskName} has been created`} taskName={this.state.taskName}/>
        }
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
