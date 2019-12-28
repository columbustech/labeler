import React from 'react';
import Cookies from 'universal-cookie';
import axios from 'axios';
import { FaFolder, FaFile } from 'react-icons/fa';
import './CDrivePathSelector.css';

class CDrivePathSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      path: "users",
      driveObjects: []
    };
    this.getDriveObjects = this.getDriveObjects.bind(this);
    this.breadcrumbClick = this.breadcrumbClick.bind(this);
    this.listClick = this.listClick.bind(this);
  }
  componentDidMount() {
    this.getDriveObjects("users/" + this.props.specs.username);
  }
  getDriveObjects(path) {
    const cookies = new Cookies();
    var auth_header = 'Bearer ' + cookies.get('labeler_token');
    const request = axios({
      method: 'GET',
      url: this.props.specs.cdriveApiUrl + "list/?path=" + path,
      headers: {'Authorization': auth_header}
    });
    request.then(
      response => {
        this.setState({
          driveObjects: response.data.driveObjects,
          path: path
        });
      },
      err => {
        if (err.response.status === 401) {
          cookies.remove('labeler_token');
          window.location.reload(false);
        }
      }
    );
  }
  breadcrumbClick(index) {
    var tokens = this.state.path.split("/");
    var newPath = tokens.slice(0,index+1).join("/");
    this.getDriveObjects(newPath);
  }
  listClick(e, index) {
    var newPath;
    if (this.state.driveObjects[index].type === "Folder") {
      newPath = this.state.path + "/" + this.state.driveObjects[index].name;
      this.getDriveObjects(newPath);
    }
  }
  render() {
    var tokens = this.state.path.split("/");
    let items;

    items = tokens.map((token, i) => {
      if(i === tokens.length - 1){
        return (
          <li className="breadcrumb-item active" aria-current="page">
            <button className="btn" disabled>{token}</button>
          </li>
        );
      } else {
        return (
          <li className="breadcrumb-item">
            <button onClick={() => this.breadcrumbClick(i)} className="btn btn-link">
              {token}
            </button>
          </li>
        );
      }
    });
    let rows;
    if(this.state.driveObjects.length !== 0) {
      rows = this.state.driveObjects.map((dobj, i) => {
        var name = dobj.name;
        if (name.length > 10) {
          name = name.substring(0,7) + "...";
        }
        if (dobj.type === "Folder") {
          return (
            <div className="folder-item drive-item" onClick={e => this.listClick(e, i)}>
              <div>
                <FaFolder size={60} color="#92cefe" />
              </div>
              <div className="drive-item-name">
                {name}
              </div>
            </div>
          );
        } else {
          return (
            <div  className="file-item drive-item">
              <div>
                <FaFile size={60} color="#9c9c9c" />
              </div>
              <div className="drive-item-name">
                {name}
              </div>
            </div>
            );
        }
      });
    }
    return(
      <div className="cdrive-path-selector" >
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb bg-transparent">
            {items}
          </ol>
        </nav>
        <div className="folder-list">
          {rows}
        </div>
        <div className="select-submit" >
          <div className="select-btn">
            <button className="btn btn-primary btn-lg btn-block" onClick={() => this.props.primaryFn(this.state.path)} >
              {this.props.primaryBtn}
            </button>
          </div>
          <div className="select-btn">
            <button className="btn btn-secondary btn-lg btn-block" onClick={this.props.secondaryFn} >
              {this.props.secondaryBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default CDrivePathSelector;

