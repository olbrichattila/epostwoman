import React, { useState, useContext, useEffect } from "react";
import { DataContext } from "../../context";
import Button from "../button";
import PageControl from "../pageControl";
import KeyValueEditor from "../keyValueEditor";
import "./index.css";

const initialRequest = {
  body: "",
  url: "",
  method: "GET",
  requestBody: "",
  headers: [],
  formRequest: [],
};

const RequestTab = ({ request = initialRequest, tabName }) => {
  const { data, onSetRequests } = useContext(DataContext);
  const [serverStatus, setServerStatus] = useState(null);
  const [localState, setLocalState] = useState(request);
  const [activePageIndex, setActivePageIndex] = useState(0);

  const postRequest = () => {
    let requestBody = activePageIndex === 0 ? localState.requestBody : getFormRequest();
    window.electronAPI.sendMessage(
      "http-request",
      localState.url,
      "GET",
      "body",
      []
      // localState.method,
      // requestBody,
      // localState.headers
    );

    const handleResponse = (response) => {
      setServerStatus(response);
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
  }

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
          onChange={(e) =>
            onSetRequests(tabName, { ...localState, method: e.target.value })
          }
        >
          <option>GET</option>
          <option>POST</option>
          <option>DELETE</option>
          <option>PATCH</option>
          <option>OPTIONS</option>
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
        <PageControl onPageChange={index => setActivePageIndex(index)}>
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
          <pre>{JSON.stringify(serverStatus, null, 2)}</pre>
        ) : null}
      </div>
    </div>
  );
};

export default RequestTab;
