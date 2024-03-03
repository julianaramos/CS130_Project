import React from "react";
import { cleanup, render, fireEvent, screen, waitFor} from "@testing-library/react";
import { Provider, useSelector } from 'react-redux';
import configureStore from 'redux-mock-store';
import axios from "axios";
import Dashboard from "./Dashboard";
import Home from "./Home";
import * as router from 'react-router'
import Query from "./Query";

jest.mock("axios");

describe("Dashboard Testing", () => {
    let store, navigateStub, useLocationStub, axiosStub;

    beforeEach(() => {
        const mockStore = configureStore([]);
        store = mockStore({
            user: {uid: 'uid'},
            uml: {uml_id: 'uml_id'}
          });
        navigateStub = jest.fn();
        axiosStub = jest.spyOn(axios, 'post');
        jest.spyOn(router, 'useNavigate').mockImplementation(() => navigateStub);
        useLocationStub = jest.spyOn(router, 'useLocation').mockImplementation(() => {return {state: ''}})
      });

    afterEach(() => {
        cleanup();
      });

    it("should fetch user uml diagrams based on the uid in redux", async () => {
        axiosStub.mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          data: [{content: "c", description: "description1", diagram: '', name: 'name1', privacy: 'public', timestamp: 1, uml_id: '1'}, {content: "c", description: "description2", diagram: '', name: 'name2', privacy: 'public', timestamp: 2, uml_id: '2'}]
        }));

        render(
            <Provider store={store}>
              <Dashboard />
            </Provider>
          );

        await waitFor(() => { // Wait for the apis to be called, wont fail immediately
            expect(axiosStub).toHaveBeenCalledTimes(1);
            expect(axiosStub).toBeCalledWith("http://localhost:4000/get-user-uml", {"uid": "uid"});
        });
        
        // Using findByText, the tests wont fail immediately, but will wait for up to 1 second to find the item, then fail
        // No need to wrap in waitFor
        expect(await screen.findByText('name1')).toBeInTheDocument();
        expect(await screen.findByText('description1')).toBeInTheDocument();
        expect(await screen.findByText('name2')).toBeInTheDocument();
        expect(await screen.findByText('description2')).toBeInTheDocument();
    });

    it("should take user to query page w/ loaded uml if edit is clicked", async () => {
        axiosStub.mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          data: [{content: "c", description: "description1", diagram: '', name: 'name1', privacy: 'public', timestamp: 1, uml_id: '1'}, {content: "c", description: "description2", diagram: '', name: 'name2', privacy: 'public', timestamp: 2, uml_id: '2'}]
        }));

        render(
            <Provider store={store}>
              <Dashboard />
            </Provider>
          );

        const editButton = await screen.findAllByText('Edit');
        fireEvent.click(editButton[0]);

        await waitFor(() => { 
            expect(axiosStub).toHaveBeenCalledTimes(1);
            expect(navigateStub).toHaveBeenCalledTimes(1);
            expect(axiosStub).toBeCalledWith("http://localhost:4000/get-user-uml", {"uid": "uid"});
            expect(navigateStub).toBeCalledWith("/query", {"state": {"content": "c", "description": "description1", "diagram": "", "name": "name1", "privacy": "public", "timestamp": 1, "uml_id": "1"}});
        });
    });

    it("should take user to query page w/ nothing loaded if create is clicked", async () => {
        axiosStub.mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          data: [{content: "c", description: "description1", diagram: '', name: 'name1', privacy: 'public', timestamp: 1, uml_id: '1'}, {content: "c", description: "description2", diagram: '', name: 'name2', privacy: 'public', timestamp: 2, uml_id: '2'}]
        }));

        render(
            <Provider store={store}>
              <Dashboard />
            </Provider>
          );

        const createButton = await screen.findByText('Create');
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(axiosStub).toHaveBeenCalledTimes(1);
            expect(navigateStub).toHaveBeenCalledTimes(1);
            expect(axios.post).toBeCalledWith("http://localhost:4000/get-user-uml", {"uid": "uid"});
            expect(navigateStub).toBeCalledWith("/query");
        });
    });

    it("should delete a uml if delete button is pressed", async () => {
        axiosStub.mockImplementationOnce(() =>
            Promise.resolve({
            status: 200,
            data: [{content: "c", description: "description1", diagram: '', name: 'name1', privacy: 'public', timestamp: 1, uml_id: '1'}, {content: "c", description: "description2", diagram: '', name: 'name2', privacy: 'public', timestamp: 2, uml_id: '2'}]
        }));

        axiosStub.mockImplementationOnce(() =>
            Promise.resolve({
            status: 200,
        }));

        render(
            <Provider store={store}>
              <Dashboard />
            </Provider>
          );

        const deleteButton = await screen.findAllByText('Delete');
        fireEvent.click(deleteButton[0]);
        
        await waitFor(() => {
            expect(axiosStub).toHaveBeenCalledTimes(2);
            expect(axiosStub).toHaveBeenNthCalledWith(1, "http://localhost:4000/get-user-uml", {"uid": "uid"});
            expect(axiosStub).toHaveBeenNthCalledWith(2, "http://localhost:4000/delete-uml", {"uid": "uid", "uml_id": "1"});
        });

        expect(await screen.findByText('name2')).toBeInTheDocument();
        await waitFor(() => { // Needs to have wait for or else we will query right away
            expect(screen.queryByText('name1')).toBeNull();
        });
    });
});

describe("Home Testing", () => {
  let store, navigateStub, useLocationStub, axiosStub;

  beforeEach(() => {
      const mockStore = configureStore([]);
      store = mockStore({
          user: {uid: 'uid'},
          uml: {uml_id: 'uml_id'}
        });
      navigateStub = jest.fn();
      axiosStub = jest.spyOn(axios, 'post');
      jest.spyOn(router, 'useNavigate').mockImplementation(() => navigateStub);
      useLocationStub = jest.spyOn(router, 'useLocation').mockImplementation(() => {return {state: ''}});
    });

  afterEach(() => {
      cleanup();
    });

  it("should fetch public user uml diagrams on home page", async () => {
      axiosStub.mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
        data: [{content: "c", description: "description1", diagram: '', name: 'name1', privacy: 'public', timestamp: 1, uml_id: '1'}, {content: "c", description: "description2", diagram: '', name: 'name2', privacy: 'public', timestamp: 2, uml_id: '2'}]
      }));

      render(
          <Provider store={store}>
            <Home />
          </Provider>
        );

      await waitFor(() => { // Wait for the apis to be called, wont fail immediately
          expect(axiosStub).toHaveBeenCalledTimes(1);
          expect(axiosStub).toBeCalledWith("http://localhost:4000/get-all-uml", {"a": true, "c": true, "s": true, "seq":true, "u":true, "nameContains": ""});
      });
      
      // Using findByText, the tests wont fail immediately, but will wait for up to 1 second to find the item, then fail
      // No need to wrap in waitFor
      expect(await screen.findByText('name1')).toBeInTheDocument();
      expect(await screen.findByText('description1')).toBeInTheDocument();
      expect(await screen.findByText('name2')).toBeInTheDocument();
      expect(await screen.findByText('description2')).toBeInTheDocument();
  });

  it("filter buttons should change call to route", async () => {
    axiosStub.mockImplementationOnce(() =>
    Promise.resolve({
      status: 200,
      data: [{content: "c", description: "description1", diagram: '', name: 'name1', privacy: 'public', timestamp: 1, uml_id: '1'}, {content: "c", description: "description2", diagram: '', name: 'name2', privacy: 'public', timestamp: 2, uml_id: '2'}]
    }));

    render(
        <Provider store={store}>
          <Home />
        </Provider>
      );

    await waitFor(() => { // Wait for the apis to be called, wont fail immediately
        expect(axiosStub).toHaveBeenCalledTimes(1);
        expect(axiosStub).toBeCalledWith("http://localhost:4000/get-all-uml", {"a": true, "c": true, "s": true, "seq":true, "u":true, "nameContains": ""});
    });

    const filterBar = await screen.findByText('Filter');
    fireEvent.click(filterBar);

    const stateButton = await screen.findAllByRole('checkbox');
    fireEvent.click(stateButton[0]);

    const applyButton = await screen.findByText('Apply');
    fireEvent.click(applyButton);

    await waitFor(() => { // Wait for the apis to be called, wont fail immediately
      expect(axiosStub).toHaveBeenCalledTimes(2);
      expect(axiosStub).toBeCalledWith("http://localhost:4000/get-all-uml", {"a": true, "c": true, "s": false, "seq":true, "u":true, "nameContains": ""});
  });
  });

  it("filter nameContains input should change call to route", async () => {
    axiosStub.mockImplementation(() =>
    Promise.resolve({
      status: 200,
      data: [{content: "c", description: "description1", diagram: '', name: 'name1', privacy: 'public', timestamp: 1, uml_id: '1'}, {content: "c", description: "description2", diagram: '', name: 'name2', privacy: 'public', timestamp: 2, uml_id: '2'}]
    }));

    render(
        <Provider store={store}>
          <Home />
        </Provider>
      );

    await waitFor(() => { // Wait for the apis to be called, wont fail immediately
        expect(axiosStub).toHaveBeenCalledTimes(1);
        expect(axiosStub).toHaveBeenNthCalledWith(1, "http://localhost:4000/get-all-uml", {"a": true, "c": true, "s": true, "seq":true, "u":true, "nameContains": ""});
    });

    const filterBar = await screen.findByText('Filter');
    fireEvent.click(filterBar);

    const nameContainsBox = await screen.findByLabelText("Name Contains");
    fireEvent.change(nameContainsBox, { target: { value: "name" } });
    expect(await screen.findByDisplayValue('name')).toBeInTheDocument();

    const applyButton = await screen.findByText('Apply');
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(axiosStub).toHaveBeenCalledTimes(2);
      expect(axiosStub).toHaveBeenNthCalledWith(2, "http://localhost:4000/get-all-uml", {"a": true, "c": true, "s": true, "seq":true, "u":true, "nameContains": "name"});
  });
  });

  it("content from promptBar is routed to query page with state set", async () => {
    axiosStub.mockImplementation(() =>
    Promise.resolve({
      status: 200,
      data: [{content: "c", description: "description1", diagram: '', name: 'name1', privacy: 'public', timestamp: 1, uml_id: '1'}, {content: "c", description: "description2", diagram: '', name: 'name2', privacy: 'public', timestamp: 2, uml_id: '2'}]
    }));

    render(
        <Provider store={store}>
          <Home />
        </Provider>
      );

    await waitFor(() => { // Wait for the apis to be called, wont fail immediately
        expect(axiosStub).toHaveBeenCalledTimes(1);
        expect(axiosStub).toHaveBeenNthCalledWith(1, "http://localhost:4000/get-all-uml", {"a": true, "c": true, "s": true, "seq":true, "u":true, "nameContains": ""});
    });

    const promptBar = await screen.findByLabelText('unload your ideas...');
    fireEvent.change(promptBar, { target: { value: "prompt" } });

    expect(await screen.findByDisplayValue('prompt')).toBeInTheDocument();

    fireEvent.keyDown(promptBar, { key: "Enter", code: 13 });

    await waitFor(() => {
      expect(navigateStub).toHaveBeenCalledTimes(1);
      expect(navigateStub).toBeCalledWith("/query", {"state": {"prompt": "prompt", "oneTimeLoad": true}});
    });
  });
});

describe("Query Testing", () => {
  let store, navigateStub, useLocationStub, axiosStub;

  beforeEach(() => {
      const mockStore = configureStore([]);
      store = mockStore({
          user: {uid: 'uid'},
          uml: {uml_id: 'uml_id'}
        });
      navigateStub = jest.fn();
      axiosStub = jest.spyOn(axios, 'post');
      jest.spyOn(router, 'useNavigate').mockImplementation(() => navigateStub);
      useLocationStub = jest.spyOn(router, 'useLocation').mockImplementation(() => {return {state: ''}});
    });

  afterEach(() => {
      cleanup();
    });

  it("should call plant uml visualizer after editing uml text box and display the result", async () => {
      axiosStub.mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
        data: 'diagram'
      }));

      render(
          <Provider store={store}>
            <Query />
          </Provider>
        );

      const umlBox = await screen.findByTestId("uml-box")
      fireEvent.change(umlBox, { target: { value: "uml_code" } });

      expect(await screen.findByDisplayValue('uml_code')).toBeInTheDocument();

      await waitFor(() => {
        expect(axiosStub).toHaveBeenCalledTimes(1);
        expect(axiosStub).toBeCalledWith("http://localhost:4000/fetch-plant-uml", {uml_code: "uml_code", response_type: 'SVG', return_as_uri: true});
      });

      const diagramBox = await screen.findByAltText('UML Diagram');
      
      await waitFor(() => {
        expect(diagramBox.src).toContain('diagram');
      });

  });

  it("should query ai with info from prompt box and uml code and then display & visualize the generated code", async () => {
    axiosStub.mockImplementationOnce(() =>
    Promise.resolve({
      status: 200,
      data: "first_diagram"
    }));

    axiosStub.mockImplementationOnce(() =>
    Promise.resolve({
      status: 200,
      data: "first_diagram_refreshed"
    }));

    axiosStub.mockImplementationOnce(() =>
    Promise.resolve({
      status: 200,
      data: {uml_code: "generated_code"}
    }));

    axiosStub.mockImplementationOnce(() =>
    Promise.resolve({
      status: 200,
      data: "final_diagram"
    }));

    render(
        <Provider store={store}>
          <Query />
        </Provider>
      );

    const umlBox = await screen.findByTestId("uml-box")
    fireEvent.change(umlBox, { target: { value: "uml_code" } });

    expect(await screen.findByDisplayValue('uml_code')).toBeInTheDocument();

    await waitFor(() => {
      expect(axiosStub).toHaveBeenCalledTimes(1);
      expect(axiosStub).toHaveBeenNthCalledWith(1, "http://localhost:4000/fetch-plant-uml", {uml_code: "uml_code", response_type: 'SVG', return_as_uri: true});
    });

    const promptBox = await screen.findByLabelText("Your Prompt");
    fireEvent.change(promptBox, { target: { value: "prompt" } });

    expect(await screen.findByDisplayValue('prompt')).toBeInTheDocument();

    const submitButton = await screen.findByText("Submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axiosStub).toHaveBeenCalledTimes(3); // 1 for after code is entered, 1 after prompt is entered, 1 after submit
      expect(axiosStub).toHaveBeenNthCalledWith(3, "http://localhost:4000/query-assistant-code-generator", {uml_code: "uml_code", prompt: "prompt", query: "prompt"});
    });

    expect(await screen.findByDisplayValue('generated_code')).toBeInTheDocument();

    await waitFor(() => {
      expect(axiosStub).toHaveBeenCalledTimes(4);
      expect(axiosStub).toHaveBeenNthCalledWith(4, "http://localhost:4000/fetch-plant-uml", {uml_code: "generated_code", response_type: 'SVG', return_as_uri: true});
    });

    const diagramBox = await screen.findByAltText('UML Diagram');

    await waitFor(() => {
      expect(diagramBox.src).toContain('final_diagram');
    });
  });

  it("should create new uml if this is a new document and set redux state to the newly generated uml_id", async () => {
    const mockStore1 = configureStore([]);
    const store1 = mockStore1({
        user: {uid: 'uid'},
        uml: {uml_id: null}
      });

    axiosStub.mockImplementationOnce(() =>
    Promise.resolve({
      status: 200,
      data: "diagram"
    }));

    axiosStub.mockImplementationOnce(() =>
    Promise.resolve({
      status: 200,
      data: "result_uml_id"
    }));

    render(
        <Provider store={store1}>
          <Query />
        </Provider>
      );

    const umlBox = await screen.findByTestId("uml-box")
    fireEvent.change(umlBox, { target: { value: "uml_code" } });

    expect(await screen.findByDisplayValue('uml_code')).toBeInTheDocument();

    await waitFor(() => {
      expect(axiosStub).toHaveBeenCalledTimes(1);
      expect(axiosStub).toHaveBeenNthCalledWith(1, "http://localhost:4000/fetch-plant-uml", {uml_code: "uml_code", response_type: 'SVG', return_as_uri: true});
    });

    const diagramBox = await screen.findByAltText('UML Diagram');
      
    await waitFor(() => {
      expect(diagramBox.src).toContain('diagram');
    });

    const saveButton = await screen.findByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(axiosStub).toHaveBeenCalledTimes(2);
      expect(axiosStub).toHaveBeenNthCalledWith(2, "http://localhost:4000/create-new-uml", {content: "uml_code", description: "", diagram: "diagram", privacy: "public", name: "untitled", uid: "uid", "uml_id": null});
      expect(store1.getActions()).toEqual([{ type: 'uml/setUML', payload: "result_uml_id" }]);
    });

  });

  it("should update uml if uml_id is set by redux", async () => {
    axiosStub.mockImplementationOnce(() =>
    Promise.resolve({
      status: 200,
      data: "diagram"
    }));

    axiosStub.mockImplementationOnce(() =>
    Promise.resolve({
      status: 200,
      data: "result_uml_id"
    }));

    render(
        <Provider store={store}>
          <Query />
        </Provider>
      );

    const umlBox = await screen.findByTestId("uml-box")
    fireEvent.change(umlBox, { target: { value: "uml_code" } });

    expect(await screen.findByDisplayValue('uml_code')).toBeInTheDocument();

    await waitFor(() => {
      expect(axiosStub).toHaveBeenCalledTimes(1);
      expect(axiosStub).toHaveBeenNthCalledWith(1, "http://localhost:4000/fetch-plant-uml", {uml_code: "uml_code", response_type: 'SVG', return_as_uri: true});
    });

    const diagramBox = await screen.findByAltText('UML Diagram');
      
    await waitFor(() => {
      expect(diagramBox.src).toContain('diagram');
    });

    const saveButton = await screen.findByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(axiosStub).toHaveBeenCalledTimes(2);
      expect(axiosStub).toHaveBeenNthCalledWith(2, "http://localhost:4000/update-uml", {content: "uml_code", description: "", diagram: "diagram", privacy: "public", name: "untitled", uid: "uid", uml_id: "uml_id"});
    });

  });

  it("should load in uml file data and display based on useLocation state", async () => {
    useLocationStub.mockImplementationOnce(() => ({
      state: {
        name: 'file_name',
        description: 'file_description',
        privacy: 'private',
        content: 'file_content',
      }
    }));

    axiosStub.mockImplementationOnce(() =>
    Promise.resolve({
      status: 200,
      data: "diagram"
    }));

    render(
        <Provider store={store}>
          <Query />
        </Provider>
      );


    await waitFor(() => {
      expect(axiosStub).toHaveBeenCalledTimes(1);
      expect(axiosStub).toHaveBeenNthCalledWith(1, "http://localhost:4000/fetch-plant-uml", {uml_code: "file_content", response_type: 'SVG', return_as_uri: true});
    });

    expect(await screen.findByDisplayValue('file_content')).toBeInTheDocument();
  });

  it("should change saved file properties with buttons on nav bar", async () => {

    axiosStub.mockImplementationOnce(() =>
    Promise.resolve({
      status: 200,
      data: "diagram"
    }));

    render(
        <Provider store={store}>
          <Query />
        </Provider>
      );

    const nameBox = await screen.findByDisplayValue('untitled');
    fireEvent.change(nameBox, { target: { value: "name" } });
    expect(await screen.findByDisplayValue('name')).toBeInTheDocument();

    const descriptionButton = await screen.findByText('Description');
    fireEvent.click(descriptionButton);
    const descriptionBox = await screen.findByLabelText('Description...');
    fireEvent.change(descriptionBox, { target: { value: "newdescription" } });
    expect(await screen.findByDisplayValue('newdescription')).toBeInTheDocument();
    fireEvent.keyDown(descriptionBox, { key: "Escape", code: 27 });

    const privateButton = await screen.findByLabelText('Private');
    fireEvent.click(privateButton);

    const saveButton = await screen.findByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(axiosStub).toHaveBeenCalledTimes(1);
      expect(axiosStub).toHaveBeenNthCalledWith(1, "http://localhost:4000/update-uml", {content: "", description: "newdescription", diagram: "", privacy: "private", name: "name", uid: "uid", uml_id: "uml_id"});
    });




  });

  it("should ask for assistance from ai when button is toggled and display result to screen", async () => {
    axiosStub.mockImplementationOnce(() =>
    Promise.resolve({
      status: 200,
      data: "first_diagram"
    }));

    axiosStub.mockImplementationOnce(() =>
    Promise.resolve({
      status: 200,
      data: "first_diagram_refreshed"
    }));

    axiosStub.mockImplementationOnce(() =>
    Promise.resolve({
      status: 200,
      data: {uml_code: "generated_code"}
    }));

    axiosStub.mockImplementationOnce(() =>
    Promise.resolve({
      status: 200,
      data: "final_diagram"
    }));

    render(
        <Provider store={store}>
          <Query />
        </Provider>
      );

    const umlBox = await screen.findByTestId("uml-box")
    fireEvent.change(umlBox, { target: { value: "uml_code" } });

    expect(await screen.findByDisplayValue('uml_code')).toBeInTheDocument();

    await waitFor(() => {
      expect(axiosStub).toHaveBeenCalledTimes(1);
      expect(axiosStub).toHaveBeenNthCalledWith(1, "http://localhost:4000/fetch-plant-uml", {uml_code: "uml_code", response_type: 'SVG', return_as_uri: true});
    });

    const promptBox = await screen.findByLabelText("Your Prompt");
    fireEvent.change(promptBox, { target: { value: "prompt" } });

    expect(await screen.findByDisplayValue('prompt')).toBeInTheDocument();

    const toggleButton = await screen.findByLabelText("Query");
    fireEvent.click(toggleButton);

    const submitButton = await screen.findByText("Submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axiosStub).toHaveBeenCalledTimes(3); // 1 for after code is entered, 1 after prompt is entered, 1 after submit
      expect(axiosStub).toHaveBeenNthCalledWith(3, 'http://localhost:4000/query-assistant-code-examiner', {uml_code: "uml_code", prompt: "prompt", query: "prompt"});
    });

    // TODO Do something with output
  });
});
