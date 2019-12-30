import React from 'react';
import './Loading.css';

class Loading extends React.Component {
  render() {
    return(
      <div className="size-hundred">
        <div className="size-hundred flex-div">
          <div className="spinner-border colored-display m-auto" style={{width: "100px", height: "100px"}} role="status">
            <span className="sr-only"></span>
          </div>
        </div>
        <div className="colored-display large-font text-center m-auto">{this.props.message}</div>
      </div>
    );
  }
}

export default Loading;

