import React from "react";
import { cleanup, render, fireEvent, screen, waitFor} from "@testing-library/react";
import { Provider, useSelector } from 'react-redux';
import configureStore from 'redux-mock-store';
import axios from "axios";
import Dashboard from "./Dashboard";
import Home from "./Home";
import * as router from 'react-router'

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
        useLocationStub = jest.fn();
        axiosStub = jest.spyOn(axios, 'post');
        jest.spyOn(router, 'useNavigate').mockImplementation(() => navigateStub);
        jest.spyOn(router, 'useLocation').mockImplementation(() => useLocationStub)
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
      useLocationStub = jest.fn();
      axiosStub = jest.spyOn(axios, 'post');
      jest.spyOn(router, 'useNavigate').mockImplementation(() => navigateStub);
      jest.spyOn(router, 'useLocation').mockImplementation(() => useLocationStub)
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

    const nameContainsBox = screen.getByLabelText("Name Contains");
    fireEvent.change(nameContainsBox, { target: { value: "name" } });

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
    fireEvent.keyDown(promptBar, { key: "Enter", code: 13 });

    await waitFor(() => {
      expect(navigateStub).toHaveBeenCalledTimes(1);
      expect(navigateStub).toBeCalledWith("/query", {"state": {"prompt": "prompt", "oneTimeLoad": true}});
  });
  });
});
