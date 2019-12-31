import React from 'react';
import Cookies from 'universal-cookie';
import axios from 'axios';
import { Link } from "react-router-dom";
import { FaPlus, FaTasks, FaDesktop } from 'react-icons/fa';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      specs: {}
    };
    this.getSpecs = this.getSpecs.bind(this);
    this.authenticateUser = this.authenticateUser.bind(this);
  }
  getSpecs() {
    const request = axios({
      method: 'GET',
      url: `${window.location.protocol}//${window.location.hostname}${window.location.pathname}api/specs`
    });
    request.then(
      response => {
        this.setState({specs: response.data});
      },
    );
  }
  authenticateUser() {
    const cookies = new Cookies();
    var columbus_token = cookies.get('labeler_token');
    if (columbus_token !== undefined) {
      this.setState({isLoggedIn: true});
      return(null);
    }
    var url_string = window.location.href;
    var url = new URL(url_string);
    var code = url.searchParams.get("code");
    var redirect_uri = this.state.specs.cdriveUrl + "app/" + this.state.specs.username + "/labeler/";
    if (code == null) {
      window.location.href = this.state.specs.authUrl + "o/authorize/?response_type=code&client_id=" + this.state.specs.clientId + "&redirect_uri=" + redirect_uri + "&state=1234xyz";
    } else {
      const request = axios({
        method: 'POST',
        url: redirect_uri + "api/access-token",
        data: {
          code: code,
          redirect_uri: redirect_uri
        }
      });
      request.then(
        response => {
          cookies.set('labeler_token', response.data.access_token);
          this.setState({isLoggedIn: true});
        },
        err => {
        }
      );
    }
  }
  render() {
    if (Object.keys(this.state.specs).length === 0) {
      this.getSpecs();
      return(null);
    } else if (!this.state.isLoggedIn) {
      this.authenticateUser();
      return(null);
    } else {
      return(
        <div className="labeler-container"> 
          <h1 className="h2 mb-3 font-weight-bold text-center white-text">DATA LABELER</h1>
          <div className="task-options">
            <table>
              <tr>
                <td>
                  <div className="task-icon">
                    <Link to={{ pathname: "create/", state: {specs: this.state.specs} }} className="thumbnail-link">
                      <FaPlus style={{margin: 50 }} size={100} color="#4A274F" />
                    </Link>
                  </div>
                </td>
                <td>
                  <div className="task-icon">
                    <Link to="monitor/" className="thumbnail-link" >
                      <FaDesktop style={{margin: 50 }} size={100} color="#4A274F" />
                    </Link>
                  </div>
                </td>
                <td>
                  <div className="task-icon">
                    <Link to={{ pathname: "perform/", specs:this.state.specs}}  className="thumbnail-link">
                      <FaTasks style={{margin: 50 }} size={100} color="#4A274F" />
                    </Link>
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
}

export default App;
