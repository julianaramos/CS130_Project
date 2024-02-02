const request = require("supertest");
const app = require('./app.js');
const sinon = require('sinon');
const firebase = require('firebase');
const axios = require('axios');
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

describe('PlantUML diagram fetching testing', () => {
    let getStub;

    beforeEach(() => {
        getStub = sinon.stub(axios, 'get');
    });

    afterEach(() => {
        sinon.reset();
        sinon.restore();
    });

    it('should return 400 when umlCode is missing', async () => {
        const req = {
            response_type: 'SVG'
        };
        const res = await request(app).post('/fetch-plant-uml').send(req).expect(400);
    });

    it('should return 400 when responseType is missing', async () => {
        const req = {
            uml_code: 'non-empty code'
        };
        const res = await request(app).post('/fetch-plant-uml').send(req).expect(400);
    });

    it('should return 400 when uml_code is not a string', async() => {
        const req = {
            uml_code: 5,
            response_type: 'SVG'
        };
        const res = await request(app).post('/fetch-plant-uml').send(req).expect(400);
    });

    it('should return 400 when response_type is invalid', async () => {
        const req = {
            uml_code: 'non-empty code',
            response_type: 'INVALID'
        };
        const res = await request(app).post('/fetch-plant-uml').send(req).expect(400);
    });

    it('should return 400 when return_as_uri is not a boolean', async() => {
        const req = {
            uml_code: 'non-empty code',
            response_type: 'SVG',
            return_as_uri: 0
        };
        const res = await request(app).post('/fetch-plant-uml').send(req).expect(400);
    });
    
    it('should return 500 when PlantUML server request times out', async() => {
        const req = {
            uml_code: 'non-empty code',
            response_type: 'SVG'
        };

        // Stub a server timeout
        getStub.throws({ code: 'ECONNABORTED' });

        const res = await request(app).post('/fetch-plant-uml').send(req).expect(500);
    });

    it('should return 400 when PlantUML server returns invalid code error', async() => {
        const req = {
            uml_code: 'non-empty code',
            response_type: 'SVG'
        };

        // Stub invalid code error from server
        getStub.throws({ response: { status: 400 } });

        const res = await request(app).post('/fetch-plant-uml').send(req).expect(400);
    });

    it('should return 500 when PlantUML server returns some other error', async() => {
        const req = {
            uml_code: 'non-empty code',
            response_type: 'SVG'
        };

        // Stub arbitrary error from server
        getStub.throws(new Error('Some error'));

        const res = await request(app).post('/fetch-plant-uml').send(req).expect(500);
    });

    it('should return SVG when PlantUML SVG request succeeds', async () => {
        const req = {
            uml_code: 'non-empty code',
            response_type: 'SVG'
        };
        const svg_data = 'SVG DATA';

        // Stub successful SVG request
        getStub.resolves({ data: svg_data });

        const res = await request(app).post('/fetch-plant-uml').send(req).expect(200);

        // Ensure response is expected SVG data
        assert.strictEqual(res.text, svg_data);
    });

    it('should return PNG when PlantUML PNG request succeeds', async () => {
        const req = {
            uml_code: 'non-empty code',
            response_type: 'SVG'
        };
        const png_data = 'PNG DATA';

        // Stub successful PNG request
        getStub.resolves({ data: png_data });

        const res = await request(app).post('/fetch-plant-uml').send(req).expect(200);

        // Ensure response is expected PNG data
        assert.strictEqual(res.text, png_data);
    });

    it('should return SVG as URI when PlantUML SVG request succeeds and URI requested', async () => {
        const req = {
            uml_code: 'non-empty code',
            response_type: 'SVG',
            return_as_uri: true
        };
        const svg_data = 'SVG DATA';
        const svg_uri_prefix = 'data:image/svg+xml;base64,';

        // Stub successful SVG request
        getStub.resolves({ data: svg_data });

        const res = await request(app).post('/fetch-plant-uml').send(req).expect(200);

        // Ensure response URI starts with the correct mime type
        assert(res.text.startsWith(svg_uri_prefix));

        // Ensure response data decodes to the expected SVG data
        const base64_data = res.text.replace(svg_uri_prefix, '');
        const decoded_data = Buffer.from(base64_data, 'base64').toString();
        assert.strictEqual(decoded_data, svg_data);
    });

    it('should return PNG as URI when PlantUML PNG request succeeds and URI requested', async () => {
        const req = {
            uml_code: 'non-empty code',
            response_type: 'PNG',
            return_as_uri: true
        };
        const png_data = 'PNG DATA';
        const png_uri_prefix = 'data:image/png;base64,';

        // Stub successful PNG request
        getStub.resolves({ data: png_data });

        const res = await request(app).post('/fetch-plant-uml').send(req).expect(200);
        
        // Ensure response URI starts with the correct mime type
        assert(res.text.startsWith(png_uri_prefix));

        // Ensure response data decodes to the expected PNG data
        const base64_data = res.text.replace(png_uri_prefix, '');
        const decoded_data = Buffer.from(base64_data, 'base64').toString();
        assert.strictEqual(decoded_data, png_data);
    });
});

describe('Scale adding testing', () => {
    const check_scale_command = async (req, correct_scale_command) => {
        const res = await request(app).post('/add-scale-to-uml').send(req).expect(200);

        // Find index of @enduml line
        const lines = res.text.split('\n');
        const end_index = lines.findIndex(line => line.trim() === '@enduml');

        // Ensure line before @enduml is correct scale command
        assert.strictEqual(lines[end_index - 1], correct_scale_command);
    };

    it('should return 400 when umlCode is missing', async () => {
        const req = {
            scale_width: 100
        };
        const res = await request(app).post('/add-scale-to-uml').send(req).expect(400);
    });

    it('should return 400 when both scale_width and scale_height are missing', async () => {
        const req = {
            uml_code: '@enduml'
        };
        const res = await request(app).post('/add-scale-to-uml').send(req).expect(400);
    });

    it('should return 400 when uml_code is not a string', async() => {
        const req = {
            uml_code: 5,
            scale_width: 100
        };
        const res = await request(app).post('/add-scale-to-uml').send(req).expect(400);
    });

    it('should return 400 when scale_width is not an int', async() => {
        const req = {
            uml_code: '@enduml',
            scale_width: '100'
        };
        const res = await request(app).post('/add-scale-to-uml').send(req).expect(400);
    });

    it('should return 400 when scale_width is not an int', async() => {
        const req = {
            uml_code: '@enduml',
            scale_height: '100'
        };
        const res = await request(app).post('/add-scale-to-uml').send(req).expect(400);
    });

    it('should return 400 when max is not a boolean', async() => {
        const req = {
            uml_code: '@enduml',
            scale_width: 100,
            max: 10
        };
        const res = await request(app).post('/add-scale-to-uml').send(req).expect(400);
    });

    it('should return 400 when @enduml is missing', async() => {
        const req = {
            uml_code: '@startuml',
            scale_width: 100
        };
        const res = await request(app).post('/add-scale-to-uml').send(req).expect(400);
    });

    it('should return code with correct scale command when scale_width is specified and max is not passed', async() => {
        const req = {
            uml_code: '@startuml\nsome_line\n@enduml\n',
            scale_width: 100
        };
        const correct_scale_command = 'scale 100 width';
        await check_scale_command(req, correct_scale_command);
    });

    it('should return code with correct scale command when scale_height is specified and max is not passed', async() => {
        const req = {
            uml_code: '@startuml\nsome_line\n@enduml\n',
            scale_height: 100
        };
        const correct_scale_command = 'scale 100 height';
        await check_scale_command(req, correct_scale_command);
    });

    it('should return code with correct scale command when scale_width and scale_height are specified and max is not passed', async() => {
        const req = {
            uml_code: '@startuml\nsome_line\n@enduml\n',
            scale_width: 100,
            scale_height: 200
        };
        const correct_scale_command = 'scale 100x200';
        await check_scale_command(req, correct_scale_command);
    });

    it('should return same code with correct scale command as not passing max when max is passed as false', async() => {
        const req = {
            uml_code: '@startuml\nsome_line\n@enduml\n',
            scale_width: 100,
            scale_height: 200,
            max: false
        };
        const correct_scale_command = 'scale 100x200';
        await check_scale_command(req, correct_scale_command);
    });

    it('should return code with correct scale command when max is passed as true', async() => {
        const req = {
            uml_code: '@startuml\nsome_line\n@enduml\n',
            scale_width: 100,
            scale_height: 200,
            max: true
        };
        const correct_scale_command = 'scale max 100x200';
        await check_scale_command(req, correct_scale_command);
    });
});
