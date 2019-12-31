import React from 'react';
import { HashRouter as Router, Route, Switch} from 'react-router-dom';
import Create from './Create';
import Perform from './Perform';
import Monitor from './Monitor';
import Examples from './Examples';
import App from './App';

class AppRouter extends React.Component {
    render() {
        return(
            <Router>
                <Switch>
                    <Route path="/create/" component={Create} />
                    <Route path="/monitor/" component={Monitor} />
                    <Route path="/perform/" component={Perform} />
                    <Route path="/example/" component={Examples} />
                    <Route path="/" component={App} />
                </Switch>
            </Router>
        );
    }
}

export default AppRouter;
