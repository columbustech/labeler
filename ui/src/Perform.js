import React from 'react';

class Perform extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      exampleNo: -1,
      examplesCount: 0,
      taskName: "",
      taskList: true
    };
  }
  render() {
    if (this.state.taskList) {
      return(
        <div className="labeler-container"> 
          
        </div>
      );
    } else {
      return(
        <div className="labeler-container"> 
        </div>
      );
    }
  }
}

export default Perform;
