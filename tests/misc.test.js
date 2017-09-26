const request = require('supertest-as-promised'),
    httpStatus = require('http-status'),
    chai = require('chai');

const app = require('../app'),
    expect = chai.expect;

chai.config.includeStack = true;


describe('## Misc', () => {

    describe('# GET /api/service-check', () => {
        it('should return OK', (done) => {
            request(app)
                .get('/api/service-check')
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.message).to.equal('OK');
                    done();
                })
                .catch(done);
        });
    });

    describe('# GET /api/404', () => {
        it('should return 404 status', (done) => {
            request(app)
                .get('/api/404')
                .expect(httpStatus.NOT_FOUND)
                .then((res) => {
                    expect(res.body.message).to.equal('API not found');
                    done();
                })
                .catch(done);
        });
    });
});