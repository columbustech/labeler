import React from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
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
  labelExample() {
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
      return (
        <div className="example-container">
        </div>
      );
    }
  }
}

export default Examples;
