import React, { useState, useContext, useEffect } from "react";
import { DataContext } from "../../context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import Button from "../button";
import PageControl from "../pageControl";
import KeyValueEditor from "../keyValueEditor";
import "./index.css";

export const initialClientRequest = {
  body: "",
  url: "",
  method: "GET",
  requestBody: "",
  headers: [],
  formRequest: [],
};

const RequestTab = ({ request = initialClientRequest, tabName }) => {
  const { data, onSetRequests, updateCookies, getCookieStrings } =
    useContext(DataContext);
  const [serverStatus, setServerStatus] = useState(null);
  const [localState, setLocalState] = useState(request);
  const [activePageIndex, setActivePageIndex] = useState(0);

  const postRequest = () => {
    const requestBody =
      activePageIndex === 0 ? localState.requestBody : getFormRequest();
    const cookieStrings = getCookieStrings(tabName);
    const headers = cookieStrings
      ? [...localState.headers, { key: "Cookie", value: cookieStrings }]
      : localState.headers;

    window.electronAPI.sendMessage(
      "http-request",
      localState.url,
      localState.method,
      requestBody,
      headers
    );

    const handleResponse = (response) => {
      setServerStatus(response);
      updateCookies(tabName, response.headers);
      window.electronAPI.removeListener("http-response", handleResponse);
    };

    window.electronAPI.onReceiveMessage("http-response", handleResponse);
  };

  const getFormRequest = () => {
    const params = new URLSearchParams();

    localState.formRequest.forEach((item) => {
      params.append(item.key, item.value);
    });

    return params.toString();
  };

  const isValidJSON = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (data.requests[tabName]) {
      setLocalState(data.requests[tabName]);
    }
  }, [data.requests, tabName]);

  return (
    <div className="requestTab">
      <div className="requestTabHead">
        <span>Method: </span>
        <select
          value={localState.method}
          onChange={(e) =>
            onSetRequests(tabName, { ...localState, method: e.target.value })
          }
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
          <option value="OPTIONS">OPTIONS</option>
          {/* TODO  more */}
        </select>
        <input
          type="text"
          value={localState.url}
          placeholder="URL"
          onChange={(e) =>
            onSetRequests(tabName, { ...localState, url: e.target.value })
          }
        />
        <Button title="Send" onClick={() => postRequest()} />
      </div>

      <div className="requestRawBody">
        <PageControl onPageChange={(index) => setActivePageIndex(index)}>
          <div className="requestBody" tabName="Raw body">
            <textarea
              value={localState.requestBody}
              onChange={(e) =>
                onSetRequests(tabName, {
                  ...localState,
                  requestBody: e.target.value,
                })
              }
            />
          </div>
          <div className="requestBody" tabName="Form request">
            <KeyValueEditor
              data={localState.formRequest}
              onChange={(data) =>
                onSetRequests(tabName, { ...localState, formRequest: data })
              }
            />
          </div>
          <div className="requestBody" tabName="Headers">
            <KeyValueEditor
              data={localState.headers}
              onChange={(data) =>
                onSetRequests(tabName, { ...localState, headers: data })
              }
            />
          </div>
        </PageControl>
      </div>

      <div className="requestWrapper">
        {serverStatus ? (
          <>
            {serverStatus.error && (
              <div className="error">
                <FontAwesomeIcon icon={faExclamationTriangle}  size="3x" />
                <div>
                  <div>{serverStatus.message}</div>
                  <div>{serverStatus.code}</div>
                </div>
              </div>
            )}
            <span>Content:</span>
            <PageControl>
              <pre tabName="Headers">
                {JSON.stringify(serverStatus.headers, null, 2)}
              </pre>
              <pre tabName="Plain Text">{serverStatus.data}</pre>
              <pre tabName="JSON">
                <code>
                  {isValidJSON(serverStatus.data)
                    ? JSON.stringify(JSON.parse(serverStatus.data), null, 2)
                    : "Invalid JSON string: " + serverStatus.data}
                </code>
              </pre>
              <iframe
                tabName="HTML"
                srcDoc={serverStatus.data}
                title="Inline HTML Iframe"
                width="100%"
                height="300px"
                sandbox="allow-same-origin"
              />
              <pre tabName="Full response">
                {JSON.stringify(serverStatus, null, 2)}
              </pre>
            </PageControl>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default RequestTab;
