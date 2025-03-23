import React, { useState, useEffect, useContext } from "react";
import { DataContext } from "../../context";
import Button from "../button";
import PageControl from "../pageControl";
import "./index.css";
import KeyValueEditor from "../keyValueEditor";

export const initialServerState = { port: 3001, rawBody: "", headers: [] };

const ServerTab = ({ serverState = initialServerState, tabName }) => {
  const { data, serverRequests, onSetServers } = useContext(DataContext);
  const [localState, setLocalState] = useState(serverState);
  const [serverStatus, setServerStatus] = useState("Server is not running.");
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [requestDetails, setRequestDetails] = useState(null);

  const serverBtnClick = () => {
    if (isServerRunning) {
      stopServer();
      return;
    }

    startServer();
  };

  const startServer = () => {
    window.electronAPI.sendMessage("start-server", localState.port, localState.rawBody, localState.headers);

    const handleResponse = (response) => {
      setServerStatus(response);
      setIsServerRunning(true);
      window.electronAPI.removeListener("server-response", handleResponse);
    };

    window.electronAPI.onReceiveMessage("server-response", handleResponse);
  };

  const stopServer = () => {
    window.electronAPI.sendMessage("stop-server", localState.port);
    const handleResponse = (response) => {
      setServerStatus(response);
      setRequestDetails(null);
      setIsServerRunning(false);
      window.electronAPI.removeListener("server-response", handleResponse);
    };

    window.electronAPI.onReceiveMessage("server-response", handleResponse);
  };

  useEffect(() => {
    if (data.servers[tabName]) {
      setLocalState(data.servers[tabName]);
    }
  }, [data, tabName]);

  useEffect(() => {
    window.electronAPI.sendMessage("get-server-status", localState.port);

    const handleResponse = (response) => {
      setIsServerRunning(response);
      window.electronAPI.removeListener("server-status", handleResponse);
    };

    window.electronAPI.onReceiveMessage("server-status", handleResponse);
  }, [localState.port]);

  useEffect(() => {
    setRequestDetails(serverRequests[localState.port] ?? null);
  }, [serverRequests[localState.port], localState.port]);

  useEffect(() => {
    // Is is do something?, yes set initial state
    // onSetServers(tabName, {...localState})
  }, []);

  return (
    <div className="serverTab">
      <div className="serverTabHead">
        <span>Port: </span>
        <input
          type="number"
          value={localState.port}
          onChange={(e) =>
            onSetServers(tabName, {
              ...localState,
              port: parseInt(e.target.value),
            })
          }
          placeholder="Enter port number"
        />
        <Button
          title={isServerRunning ? "Stop" : "Start"}
          onClick={() => serverBtnClick()}
        />
      </div>
      <div className="serverRawBody">
        <PageControl>
          <textarea
            tabName="Raw body"
            value={localState.rawBody}
            onChange={(e) =>
              onSetServers(tabName, { ...localState, rawBody: e.target.value })
            }
            placeholder="please enter raw response body, or leave it blank."
          />
          <KeyValueEditor
            tabName="Response headers"
            data={localState.headers}
            onChange={(data) =>
              onSetServers(tabName, { ...localState, headers: data })
            }
          />
        </PageControl>
      </div>

      <div className="responseWrapper">
        <p>{serverStatus}</p>
        {requestDetails && (
          <div className="scrollWrapper">
            <h2>Request Details</h2>
            <pre>{JSON.stringify(requestDetails, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerTab;
