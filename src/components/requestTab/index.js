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

const RequestTab = ({ request = initialClientRequest, tabName, tabIndex = 0 }) => {
  const { data, onSetRequests, updateCookies, getCookieStrings } =
    useContext(DataContext);

  const [serverStatus, setServerStatus] = useState(null);
  const [localState, setLocalState] = useState(request);
  const [activePageIndex, setActivePageIndex] = useState(tabIndex);

  const onStatusChange = (tabName, status) => {
    onSetRequests(tabName, status);
    setLocalState(status);
  };

  const postRequest = () => {
    const requestBody =
      activePageIndex === 0 ? localState.requestBody : getFormRequest();
    let headers = localState.headers;

    if (!headers["Cookie"]) {
      const cookieStrings = getCookieStrings(tabName);
      headers = cookieStrings
        ? [...localState.headers, { key: "Cookie", value: cookieStrings }]
        : localState.headers;
    }

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

  const parseCookies = (cookieHeaders) => {
    const resultObj = {
      headerCount: 0,
      values: [],
      render(value) {
        const result = [];
        for (var i = 0; i < this.headerCount; i++) {
          result.push(value[i] ?? { key: "", value: "" });
        }

        return result;
      },
    };

    if (!cookieHeaders) return resultObj;

    resultObj.values = cookieHeaders.map((cookie) => {
      const cookieList = [];
      const parts = cookie.split(";");

      for (let i = 0; i < parts.length; i++) {
        const [key, ...valParts] = parts[i].split("=");
        const value = valParts.join("=").trim();
        cookieList.push({ key, value });
        if (resultObj.headerCount < i) {
          resultObj.headerCount = i;
        }
      }

      return cookieList;
    });

    return resultObj;
  };

  useEffect(() => {
    if (data.requests[tabName]) {
      setLocalState(data.requests[tabName]);
    }
  }, [data.requests, tabName]);

  useEffect(() => {
    if (request) {
      setLocalState(request);
    }
  }, [request, tabName]);

  useEffect(() => {
    setActivePageIndex(tabIndex);
  }, [tabIndex])

  let cookieHeader = null;
  if (localState.headers) {
    cookieHeader =
      localState.headers["set-cookie"] ||
      localState.headers["Set-Cookie"] ||
      localState.headers["SET-COOKIE"];
  }

  let parsedCookies = null;
  if (cookieHeader) {
    parsedCookies = parseCookies(
      serverStatus && serverStatus.headers["set-cookie"]
        ? serverStatus.headers["set-cookie"]
        : null
    );
  }

  return (
    <div className="requestTab">
      <div className="requestTabHead">
        <span>Method: </span>
        <select
          value={localState.method}
          onChange={(e) =>
            onStatusChange(tabName, { ...localState, method: e.target.value })
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
            onStatusChange(tabName, { ...localState, url: e.target.value })
          }
        />
        <Button title="Send" onClick={() => postRequest()} />
      </div>

      <div className="requestRawBody">
        <PageControl
          tabIndex={activePageIndex}
          onPageChange={(index) => setActivePageIndex(index)}
        >
          <div className="requestBody" tabName="Raw body">
            <textarea
              value={localState.requestBody}
              onChange={(e) =>
                onStatusChange(tabName, {
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
                onStatusChange(tabName, { ...localState, formRequest: data })
              }
            />
          </div>
          <div className="requestBody" tabName="Headers">
            <KeyValueEditor
              data={localState.headers}
              onChange={(data) =>
                onStatusChange(tabName, { ...localState, headers: data })
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
                <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
                <div>
                  <div>{serverStatus.message}</div>
                  <div>{serverStatus.code}</div>
                </div>
              </div>
            )}
            <span>Content: <b>{serverStatus.status ?? ''}</b></span>
            <PageControl>
              <div tabName="Headers" className="scrollableTableWrapper">
                <table>
                  <thead></thead>
                  <tbody>
                    {serverStatus.headers &&
                      Object.keys(serverStatus.headers).map((key) => (
                        <tr>
                          <td>{key}</td>
                          <td>{serverStatus.headers[key]}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
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
              <div tabName="Cookies" className="scrollableTableWrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Cookie</th>
                      <th
                        colSpan={
                          parsedCookies ? parsedCookies.headerCount - 1 : 1
                        }
                      >
                        Other parameters
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedCookies &&
                      parsedCookies.values.map((value) => (
                        <tr>
                          {parsedCookies.render(value).map((item) => {
                            return (
                              <td>
                                {item.key}: {item.value}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </PageControl>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default RequestTab;
