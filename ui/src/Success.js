import React from 'react';
import { Link } from "react-router-dom";
import './Success.css';

class Success extends React.Component {
  render() {
    return (
      <div className="size-hundred">
        <div className="large-font text-center m-auto">
          {this.props.message}
        </div>
        <div className="navigation-options">
          <Link className="btn btn-primary btn-lg" to={{pathname:"/perform/", specs:this.props.specs}} >
            Perform Task
          </Link>
          <Link className="btn btn-secondary btn-lg ml-5" to="/" >
            Home
          </Link>
        </div>
      </div>
    );
  }
}

export default Success;

