const request = require("supertest");
const app = require('./app.js');
const sinon = require('sinon');
const firebase = require('firebase');
const assert = require('assert');

describe('Firebase route testing', () => {
    let dbStub, runTransactionStub, docStub, getStub, setStub, updateStub, deleteStub;

    const req = {
        uid: 'test-uid',
        uml_id: 'test-uml_id',
        content: 'content',
        privacy: 'privacy',
        name: 'name'
    };

    beforeEach(() => {
        getStub = sinon.stub();
        setStub = sinon.stub();
        updateStub = sinon.stub();
        deleteStub = sinon.stub();
        docStub = sinon.stub();

        runTransactionStub = sinon.stub().callsFake(async (fakeTransaction) => {
            await fakeTransaction({
                get: getStub,
                set: setStub,
                update: updateStub,
                delete: deleteStub,
            });
        });

        dbStub = sinon.stub(firebase, 'firestore').returns({
            collection: sinon.stub().returnsThis(),
            doc: docStub,
            runTransaction: runTransactionStub,
        });

    });

    afterEach(() => {
        sinon.reset();
        sinon.restore();
    });

    it('should return success message when create succeeds', async () => { 
        docStub.returns({id: "new_uml_id"});
        getStub.callsFake(() => ({
            data: () => ({ savedUML: ['saved_uml_id'] })
        }));

        const res = await request(app).post('/create-new-uml').send(req).expect(200);

        //make sure that id from uml doc ends up at the end of the array from the userDoc that we use in update
        assert(updateStub.calledWith(sinon.match.any,{ savedUML: ['saved_uml_id', 'new_uml_id']}));
    });

    it('should return error message when create fails', async () => {
        getStub.callsFake(() => {
            throw new Error('Getting from database failed');
        });
        const res = await request(app).post('/create-new-uml').send(req).expect(503);
    });

    it('should return success message when copy succeeds', async () => { 
        docStub.returns({id: "new_uml_id"});
        getStub.onCall(0).callsFake(() => ({
            data: () => ({ savedUML: ['saved_uml_id'] })
        }));

        getStub.onCall(1).callsFake(() => ({
            data: () => ({ content: 'copy_uml_content', name: 'copy_uml_name' })
        }));

        //await createNewUml(req, res);
        const res = await request(app).post('/copy-uml').send(req).expect(200);

        //make sure that the new uml is set with the data ffrom the copied one
        assert(setStub.calledWith(sinon.match.any,{ content: 'copy_uml_content', privacy: 'public', name: 'copy_uml_name-copy'}));

        //make sure that id from new uml doc ends up at the end of the array from the userDoc that we use in update
        assert(updateStub.calledWith(sinon.match.any,{ savedUML: ['saved_uml_id', 'new_uml_id']}));
    });

    
    it('should return error message when copy fails', async () => {
        getStub.callsFake(() => {
            throw new Error('Getting from database failed');
        });
        const res = await request(app).post('/copy-uml').send(req).expect(503);
    });

    it('should return success message when update succeeds', async () => { 
        docStub.returns({id: "some_uml_id"});

        //await createNewUml(req, res);
        const res = await request(app).post('/update-uml').send(req).expect(200);

        //make sure that the uml is set with the data we passed in
        assert(setStub.calledWith(sinon.match.any,{ content: 'content', privacy: 'privacy', name: 'name'}));

    });

    it('should return error message when update fails', async () => {
        setStub.callsFake(() => {
            throw new Error('Getting from database failed');
        });
        const res = await request(app).post('/update-uml').send(req).expect(503);
    });

    it('should return success message when delete succeeds', async () => { 
        getStub.callsFake(() => ({
            data: () => ({ savedUML: ['saved_uml_id', 'test-uml_id'] })
        }));

        //await createNewUml(req, res);
        const res = await request(app).post('/delete-uml').send(req).expect(200);

        //make sure that id from input ends up being deleted from the user's saved UML
        assert(updateStub.calledWith(sinon.match.any,{ savedUML: ['saved_uml_id']}));
    });

    
    it('should return error message when delete fails', async () => {
        setStub.callsFake(() => {
            throw new Error('Getting from database failed');
        });
        const res = await request(app).post('/delete-uml').send(req).expect(503);
    });
});