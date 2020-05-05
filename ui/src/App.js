import React from 'react';
import Cookies from 'universal-cookie';
import axios from 'axios';
import Examples from './Examples';
import Home from './Home';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      component: Home,
      taskName: "",
      specs: {},
      isLoggedIn: false
    };
    this.initPage = this.initPage.bind(this);
    this.authenticateUser = this.authenticateUser.bind(this);
  }
  authenticateUser() {
    const cookies = new Cookies();
    var accessToken = cookies.get('labeler_token');
    if (accessToken !== undefined) {
      this.setState({isLoggedIn: true});
      return;
    }
    var url = new URL(window.location.href);
    var code = url.searchParams.get("code");
    var redirect_uri = `${this.state.specs.cdriveUrl}app/${this.state.specs.username}/labeler/`;
    if (code == null) {
      window.location.href = `${this.state.specs.authUrl}o/authorize/?response_type=code&client_id=${this.state.specs.clientId}&redirect_uri=${redirect_uri}&state=1234xyz`;
    } else {
      const request = axios({
        method: 'POST',
        url: `${redirect_uri}api/access-token`,
        data: {
          code: code,
          redirect_uri: redirect_uri
        }
      });
      request.then(
        response => {
          cookies.set('labeler_token', response.data.access_token);
          window.location.href = redirect_uri;
        }, err => {
        }
      );
    }
  }
  initPage() {
    var tokens = window.location.pathname.split('/');
    var newState = {};
    if ((tokens.length>5) && (tokens[4] === "example")) {
      newState['component'] = Examples;
      newState['taskName'] = tokens[5];
    } else {
      newState['component'] = Home;
      newState['taskName'] = "";
    }
    const request = axios({
      method: 'GET',
      url: `${window.location.protocol}//${window.location.hostname}/${tokens[1]}/${tokens[2]}/${tokens[3]}/api/specs`
    });
    request.then(
      response => {
        newState['specs'] = response.data;
        this.setState(newState);
      },
    );
  }
  render() {
    if (Object.keys(this.state.specs).length === 0) {
      this.initPage();
      return (null);
    } else if (!this.state.isLoggedIn) {
      this.authenticateUser();
      return (null);
    } else {
      return (
        <this.state.component specs={this.state.specs} taskName={this.state.taskName} />
      );
    }
  }
}

export default App;
