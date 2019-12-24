import React from 'react';
import { FaPlus, FaTasks, FaDesktop } from 'react-icons/fa';
import './App.css';

class App extends React.Component {
  render() {
    return(
      <div className="labeler-container"> 
        <h1 className="h2 mb-3 font-weight-bold text-center white-text">DATA LABELER</h1>
        <div className="task-options">
          <table>
            <tr>
              <td>
                <div className="task-icon">
                  <FaPlus style={{margin: 50 }} size={100} color="#4A274F" />
                </div>
              </td>
              <td>
                <div className="task-icon">
                  <FaDesktop style={{margin: 50 }} size={100} color="#4A274F" />
                </div>
              </td>
              <td>
                <div className="task-icon">
                  <FaTasks style={{margin: 50 }} size={100} color="#4A274F" />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="text-div white-text">
                  Create Task
                </div>
              </td>
              <td>
                <div className="text-div white-text">
                  Monitor Tasks 
                </div>
              </td>
              <td>
                <div className="text-div white-text">
                  Perform Task
                </div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    );
  }
}

export default App;
