import React, { useState, useEffect, useContext } from "react";
import { DataContext } from "../../context";
import Button from "../button";
import PageControl from "../pageControl";
import "./index.css";
import KeyValueEditor from "../keyValueEditor";

export const initialServerState = { port: 3001, rawBody: "", headers: [] };

const ServerTab = ({
  serverState = initialServerState,
  tabName,
  tabIndex = 0,
}) => {
  const { data, serverRequests, onSetServers } = useContext(DataContext);
  const [localState, setLocalState] = useState(serverState);
  const [serverStatus, setServerStatus] = useState("Server is not running.");
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [requestDetails, setRequestDetails] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(tabIndex);

  const onServerRequest = (tabName, status) => {
    onSetServers(tabName, status);
    setLocalState(status);
  };

  const serverBtnClick = () => {
    if (isServerRunning) {
      stopServer();
      return;
    }

    startServer();
  };

  const startServer = () => {
    window.electronAPI.sendMessage(
      "start-server",
      localState.port,
      localState.rawBody,
      localState.headers
    );

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
    if (serverState) {
      setLocalState(serverState);
    }
  }, [serverState]);

  useEffect(() => {
    setActiveTabIndex(tabIndex);
  }, [tabIndex]);

  return (
    <div className="serverTab">
      <div className="serverTabHead">
        <span>Port: </span>
        <input
          type="number"
          value={localState.port}
          onChange={(e) =>
            onServerRequest(tabName, {
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
        <PageControl
          tabIndex={activeTabIndex}
          onPageChange={(i) => setActiveTabIndex(i)}
        >
          <textarea
            tabName="Raw body"
            value={localState.rawBody}
            onChange={(e) =>
              onServerRequest(tabName, {
                ...localState,
                rawBody: e.target.value,
              })
            }
            placeholder="please enter raw response body, or leave it blank."
          />
          <KeyValueEditor
            tabName="Response headers"
            data={localState.headers}
            onChange={(data) =>
              onServerRequest(tabName, { ...localState, headers: data })
            }
          />
        </PageControl>
      </div>

      <div className="responseWrapper">
        <p>{serverStatus}</p>
        {requestDetails && (
          <PageControl>
            <div tabName="Headers" className="scrollableTableWrapper">
              <table>
                <thead></thead>
                <tbody>
                  {Object.keys(requestDetails.headers).map((key) => (
                    <tr>
                      <td>{key}</td>
                      <td>{requestDetails.headers[key]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="scrollWrapper" tabName="Request body">
              <pre>{requestDetails.body}</pre>
            </div>
            <div className="scrollWrapper" tabName="Request details">
              <pre>{JSON.stringify(requestDetails, null, 2)}</pre>
            </div>
          </PageControl>
        )}
      </div>
    </div>
  );
};

export default ServerTab;
