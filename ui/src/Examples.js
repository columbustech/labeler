import React from 'react';
import axios from 'axios';
import { Redirect, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Complete from './Complete';
import './Examples.css';

class Examples extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false,
      specs: {},
      taskName: '',
      exampleNo: -1,
      isComplete: false,
      labelOptions: [],
      totalExamples: 0,
      completeExamples: 0,
      labelCounts: [],
    };
    this.nextExample = this.nextExample.bind(this);
    this.labelExample = this.labelExample.bind(this);
    this.updateStats = this.updateStats.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.clearLabels = this.clearLabels.bind(this);
  }
  componentDidMount() {
    if(this.props.location && this.props.location.specs && this.props.location.taskName) {
      const request = axios({
        method: 'GET',
        url: `${this.props.location.specs.cdriveUrl}app/${this.props.location.specs.username}/labeler/api/label-options?taskName=${this.props.location.taskName}`
      });
      request.then(
        response => {
          this.setState({
            taskName: this.props.location.taskName,
            specs: this.props.location.specs,
            labelOptions: response.data.labels
          });
        },
      );
    } else {
      this.setState({redirect: true});
    }
  }
  nextExample() {
    const request = axios({
      method: 'GET',
      url: `${this.state.specs.cdriveUrl}app/${this.state.specs.username}/labeler/api/next-example?taskName=${this.state.taskName}`
    });
    request.then(
      response => {
        if(response.data.exampleNo === -1) {
          this.setState({isComplete: true});
        } else {
          this.setState({exampleNo: response.data.exampleNo});
          this.updateStats();
        }
      },
    );
  }
  updateStats() {
    const request = axios({
      method: 'GET',
      url: `${this.state.specs.cdriveUrl}app/${this.state.specs.username}/labeler/api/task-stats?taskName=${this.state.taskName}`,
    });
    request.then(
      response => {
        var labelCounts = response.data.labels.map((label, i) => {
          var ret = {};
          ret.label = label;
          ret.count = response.data.counts[i];
          return ret;
        });
        console.log(labelCounts);
        this.setState({
          totalExamples: response.data.total,
          completedExamples: response.data.counts.reduce((a,b) => a+b, 0),
          labelCounts: labelCounts
        });
      },
    );
  }
  labelExample(label) {
    const request = axios({
      method: 'POST',
      url: `${this.state.specs.cdriveUrl}app/${this.state.specs.username}/labeler/api/label-example`,
      data: {
        taskName: this.state.taskName,
        exampleNo: this.state.exampleNo,
        label: label
      }
    });
    request.then(
      response => {
        this.setState({exampleNo: -1});
      },
    );
  }
  deleteTask() {
    const request = axios({
      method: 'POST',
      url: `${this.state.specs.cdriveUrl}app/${this.state.specs.username}/labeler/api/delete`,
      data: {
        taskName: this.state.taskName
      }
    });
    request.then(
      response => {
        this.setState({redirect: true});
      },
    );
  }
  clearLabels() {
    const request = axios({
      method: 'POST',
      url: `${this.state.specs.cdriveUrl}app/${this.state.specs.username}/labeler/api/clear`,
      data: {
        taskName: this.state.taskName
      }
    });
    request.then(
      response => {
        this.nextExample();
      },
    );
  }
  render() {
    if (this.state.redirect) {
      return (
        <Redirect to="/monitor/" />
      );
    } else if (Object.keys(this.state.specs).length === 0) {
      return (null);
    } else if (this.state.isComplete) {
      return (
        <Complete to="/complete/" />
      );
    } else if (this.state.exampleNo === -1) {
      this.nextExample();
      return (null);
    } else {
      let labelButtons;
      labelButtons = this.state.labelOptions.map(labelName => {
        return (
          <div className="label-button-container">
            <button className="btn btn-lg btn-block label-button" onClick={() => this.labelExample(labelName)} >
              {labelName}
            </button> 
          </div>
        );
      });
      var iFrameSrc = `${this.state.specs.cdriveUrl}app/${this.state.specs.username}/labeler/${this.state.taskName}/example.html?id=${this.state.exampleNo}`;
      var ddItems = [];
      var downloadUrl = `${this.state.specs.cdriveUrl}app/${this.state.specs.username}/labeler/api/download?taskName=${this.state.taskName}`;
      ddItems.push(
        <Link to={{pathname:"/monitor/", specs: this.state.specs, selectedTaskName: this.state.taskName}} className="dropdown-item">
          Download (CDrive)
        </Link>
      );
      ddItems.push(
        <a href={downloadUrl} className="dropdown-item">
          Download (Local)
        </a>
      );
      ddItems.push(
        <Dropdown.Item onClick={this.deleteTask} >
          Delete Task
        </Dropdown.Item>
      );
      ddItems.push(
        <Dropdown.Item onClick={this.clearLabels} >
          Clear Labels
        </Dropdown.Item>
      );
      ddItems.push(
        <Link to={{pathname:"/monitor/", specs: this.state.specs}} className="dropdown-item">
          Back
        </Link>
      );
      var labelStr = this.state.labelCounts.map(item => {
        return `${item.label}: ${item.count}`;
      }).join(',');
      return (
        <div className="example-container">
          <div className="examples-header">
            <div className="actions-container">
              <DropdownButton variant="transparent" title="Actions" alignLeft size="lg">
                {ddItems}
              </DropdownButton>
            </div>
            <div className="stat-container">
              <h1 className="h5 m-2 header-text">Total: {this.state.totalExamples}, Completed: {this.state.completedExamples}, {labelStr}</h1>
            </div>
          </div>
          <h1 className="h3 mb-3 font-weight-bold text-center header-text">Example No: {this.state.exampleNo}</h1>
          <div className="example-iframe-container">
            <iframe title="example-iframe" src={iFrameSrc} width="800" height="500"></iframe>
          </div>
          <div className="label-options-container">
            {labelButtons}
          </div>
        </div>
      );
    }
  }
}

export default Examples;
