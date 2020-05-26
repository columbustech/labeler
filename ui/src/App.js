import React from 'react';
import Cookies from 'universal-cookie';
import axios from 'axios';
import Examples from './Examples';
import Home from './Home';
import { BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      taskName: "",
      specs: {},
      pageReady: false,
    };
    this.authenticateUser = this.authenticateUser.bind(this);
    this.getLatestTask = this.getLatestTask.bind(this);
    this.userDetails = this.userDetails.bind(this);
  }
  componentDidMount() {
    const request = axios({
      method: 'GET',
      url: `${process.env.PUBLIC_URL}/api/specs/`
    });
    request.then(
      response => {
        this.setState({"specs": response.data});
        this.authenticateUser();
      },
    );
  }
  authenticateUser() {
    const cookies = new Cookies();
    var accessToken = cookies.get('labeler_token');
    if (accessToken !== undefined) {
      this.userDetails();
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
          this.getLatestTask();
        }, err => {
        }
      );
    }
  }
  userDetails() {
    const cookies = new Cookies();
    const request = axios({
      method: 'GET',
      url: `${this.state.specs.cdriveApiUrl}user-details/`,
      headers: {
        'Authorization': `Bearer ${cookies.get('labeler_token')}`,
      }
    });
    request.then(response => {
      this.getLatestTask();
    }, err => {
        cookies.remove('labeler_token'); 
        window.location.reload(false);
    });
  }
  getLatestTask() {
    const cookies = new Cookies();
    const request = axios({
      method: 'GET',
      url: `${this.state.specs.appUrl}api/latest-task`,
      headers: {
        'Authorization': `Bearer ${cookies.get('labeler_token')}`,
      }
    });
    request.then(response => {
      this.setState({
        taskName: response.data.taskName,
        pageReady: true
      });
    }, err => {
    });
  }
  render() {
    if (!this.state.pageReady) {
      return (null);
    } else {
      var url = new URL(process.env.PUBLIC_URL);
      let redirect;
      if (this.state.taskName === "") {
        redirect = (
          <Redirect from="/" to="/home/" />
        );
      } else {
        redirect = (
          <Redirect from="/" to={`/example/${this.state.taskName}`} />
        );
      }
      return (
        <Router basename={url.pathname} >
          <Switch>
            <Route
              path="/example/:taskName"
              render={(props) => <Examples {...props} specs={this.state.specs} />}
            />
            <Route
              path="/home/"
              render={(props) => <Home {...props} specs={this.state.specs} />}
            />
            {redirect}
          </Switch>
        </Router>
      );
    }
  }
}

export default App;
