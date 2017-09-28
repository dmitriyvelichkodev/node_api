const httpStatus = require('http-status'),
    chai = require('chai'),
    chaiHttp = require('chai-http');

const app = require('../app'),
    expect = chai.expect;

chai.config.includeStack = true;
chai.use(chaiHttp);


describe('## Misc', () => {

    describe('# GET /api/service-check', () => {
        it('should return OK', (done) => {
            chai.request(app)
                .get('/api/service-check')
                .end((err, res) => {
                    expect(res.status).to.equal(httpStatus.OK);
                    expect(res.body.message).to.equal('OK');
                    done();
                })

        });
    });

    describe('# GET /api/404', () => {
        it('should return 404 status', (done) => {
            chai.request(app)
                .get('/api/404')
                .end((err, res) => {
                    expect(res.status).to.equal(httpStatus.NOT_FOUND);
                    expect(res.body.message).to.equal('API not found');
                    done();
                })
        });
    });
});