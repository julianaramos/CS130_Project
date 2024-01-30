const request = require("supertest");
const app = require('./app.js');
const sinon = require('sinon');
const firebase = require('firebase');
const assert = require('assert');

describe('createNewUml', () => {
    let dbStub, runTransactionStub, setStub, updateStub;

    runTransactionStub = sinon.stub();
    setStub = sinon.stub();
    updateStub = sinon.stub();

    const req = {
        body: {
            uid: 'test-uid'
        }
    };

    beforeEach(() => {
        dbStub = sinon.stub(firebase, 'firestore').returns({
            collection: sinon.stub().returnsThis(),
            doc: sinon.stub().returns({id: "new_uml_id"}),
            runTransaction: runTransactionStub,
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return success message when transaction succeeds', async () => {
        runTransactionStub.callsFake(async (fakeTransaction) => {
            console.log('running transaction');
            await fakeTransaction({
                get: sinon.stub().callsFake(() => ({
                    data: () => ({ savedUML: ['saved_uml_id'] })
                })),
                set: setStub,
                update: updateStub
            });
        })

        //await createNewUml(req, res);
        const res = await request(app).post('/create-new-uml').send(req).expect(200);

        //make sure that id from uml doc ends up at the end of the array from the userDoc that we use in update
        assert(updateStub.calledWith(sinon.match.any,{ savedUML: ['saved_uml_id', 'new_uml_id']}));
    });

    it('should return error message when transaction fails', async () => {

        runTransactionStub.callsFake(async (fakeTransaction) => {
            console.log('running aaaaaa');
            await fakeTransaction({
                get: sinon.stub().callsFake(() => {
                    throw new Error('Getting from database failed');
                }),
                set: setStub,
                update: updateStub
            });
        })
        const res = await request(app).post('/create-new-uml').send(req).expect(503);
    });
});