const request = require('supertest-as-promised'),
    httpStatus = require('http-status'),
    chai = require('chai');

const app = require('../app'),
    expect = chai.expect;

chai.config.includeStack = true;


describe('## Test /api/organizations', () => {
    let orgsSuccess = {
            "org_name": "Paradise Island",
            "daughters": [{"org_name":"Banana tree"}]
        },
        orgsFailedInvalidFormat = {
            "org_name": "Paradise Island",
            "daughters": {"org_name":"Banana tree"}
        },
        orgsFailedReferenceToItself = {
            "org_name": "Paradise Island",
            "daughters": [{"org_name":"Paradise Island"}]
        };

    describe('# POST /api/organizations', () => {
        it('should create organizations with their relations', (done) => {
            request(app)
                .post('/api/organizations')
                .send(orgsSuccess)
                .expect(httpStatus.CREATED)
                .then((res) => {
                    expect(res.body.message).to.equal(httpStatus[201]);
                    done();
                })
                .catch(done);
        });

        it('should fails due invalid format post data', (done) => {
            request(app)
                .post('/api/organizations')
                .send(orgsFailedInvalidFormat)
                .expect(httpStatus.INTERNAL_SERVER_ERROR)
                .then((res) => {
                    expect(res.body.message).to.equal(httpStatus[500]);
                    done();
                })
                .catch(done);
        });

        it('should fails due org references to itself', (done) => {
            request(app)
                .post('/api/organizations')
                .send(orgsFailedReferenceToItself)
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .then((res) => {
                    expect(res.body.message).to.equal(
                        `Received data has organization that referenced to itself: ${orgsFailedReferenceToItself.org_name}`);
                    done();
                })
                .catch(done);
        });
    });
});
