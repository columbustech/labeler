import React from 'react';
import axios from 'axios';
import { Redirect, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Cookies from 'universal-cookie';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import './Examples.css';

class Examples extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      exampleNo: -1,
      isComplete: false,
      labelOptions: [],
      totalExamples: 0,
      completeExamples: 0,
      labelCounts: [],
    };
    this.getLabelOptions = this.getLabelOptions.bind(this);
    this.nextExample = this.nextExample.bind(this);
    this.completeTask = this.completeTask.bind(this);
    this.labelExample = this.labelExample.bind(this);
    this.updateStats = this.updateStats.bind(this);
  }
  getLabelOptions() {
		const request = axios({
			method: 'GET',
			url: `${this.props.specs.cdriveUrl}app/${this.props.specs.username}/labeler/api/label-options?taskName=${this.props.match.params.taskName}`
		});
		request.then(
			response => {
				this.setState({
					labelOptions: response.data.labels
				});
			},
		);
  }
  nextExample() {
    const request = axios({
      method: 'GET',
      url: `${this.props.specs.appUrl}api/next-example?taskName=${this.props.match.params.taskName}`
    });
    request.then(
      response => {
        if(response.data.exampleNo === -1) {
          this.completeTask();
        } else {
          this.setState({exampleNo: response.data.exampleNo});
          this.updateStats();
        }
      },
    );
  }
  completeTask() {
    const cookies = new Cookies();
    this.setState({isComplete: true});
    const request = axios({
      method: 'POST',
      url: `${this.props.specs.appUrl}api/complete-task`,
      data: {
        taskName: this.props.match.params.taskName,
      },
      headers: {
        'Authorization': `Bearer ${cookies.get('labeler_token')}`,
      }
    });
    request.then(
      response => {
        window.location.href = response.data.redirectUrl;
      },
    )
  }
  updateStats() {
    const request = axios({
      method: 'GET',
      url: `${this.props.specs.appUrl}api/task-stats?taskName=${this.props.match.params.taskName}`,
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
      url: `${this.props.specs.appUrl}api/label-example`,
      data: {
        taskName: this.props.match.params.taskName,
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
  render() {
    if (this.state.labelOptions.length === 0) {
      this.getLabelOptions();
      return (null);
    } else if (this.state.isComplete) {
			return(null);
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
      var iFrameSrc = `${this.props.specs.appUrl}${this.props.match.params.taskName}/example.html?id=${this.state.exampleNo}`;
      var labelStr = this.state.labelCounts.map(item => {
        return `${item.label}: ${item.count}`;
      }).join(',');
      return (
        <div className="example-container">
          <div className="examples-header">
            <div className="stat-container">
              <h1 className="h5 m-2 header-text">Total: {this.state.totalExamples}, Completed: {this.state.completedExamples}, {labelStr}</h1>
            </div>
          </div>
          <h1 className="h3 mb-3 font-weight-bold text-center header-text">Example No: {this.state.completedExamples + 1}</h1>
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
