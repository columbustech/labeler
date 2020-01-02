import React from 'react';
import axios from 'axios';
import { Redirect, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
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
      labelOptions: []
    };
    this.nextExample = this.nextExample.bind(this);
    this.labelExample = this.labelExample.bind(this);
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
        }
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
  render() {
    if (this.state.redirect) {
      return (
        <Redirect to="/perform/" />
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
      return (
        <div className="example-container">
          <div className="home-link-container">
            <Link to={{ pathname: "/perform/", specs:this.state.specs }}>
              <FaArrowLeft size={25} color="#4A274F" />
            </Link>
          </div>
          <h1 className="h3 mb-3 font-weight-bold text-center header-text">Label Example</h1>
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
