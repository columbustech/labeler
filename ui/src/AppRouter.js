import React from 'react';
import { BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import Create from './Create';
import Perform from './Perform';
import Monitor from './Monitor';
import App from './App';

class AppRouter extends React.Component {
    render() {
        return(
            <Router>
                <Switch>
                    <Route path="/" component={App} />
                    <Route path="/create/" component={Create} />
                    <Route path="/monitor/" component={Monitor} />
                    <Route path="/perform/" component={Perform} />
                </Switch>
            </Router>
        );
    }
}

export default AppRouter;
