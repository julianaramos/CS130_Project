const request = require("supertest");
const app = require('./app.js');
const sinon = require('sinon');
const firebase = require('firebase');
const assert = require('assert');

describe('Firebase route testing', () => {
    let dbStub, runTransactionStub, docStub, getStub, setStub, updateStub;

    const req = {
        body: {
            uid: 'test-uid',
            uml_id: 'test-uml_id'
        }
    };

    beforeEach(() => {
        getStub = sinon.stub();
        setStub = sinon.stub();
        updateStub = sinon.stub();
        docStub = sinon.stub();

        runTransactionStub = sinon.stub().callsFake(async (fakeTransaction) => {
            await fakeTransaction({
                get: getStub,
                set: setStub,
                update: updateStub
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

    
    it('should return error message when create fails', async () => {
        getStub.callsFake(() => {
            throw new Error('Getting from database failed');
        });
        const res = await request(app).post('/copy-uml').send(req).expect(503);
    });
});