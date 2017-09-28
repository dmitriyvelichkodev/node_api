const request = require('supertest-as-promised'),
    httpStatus = require('http-status'),
    chai = require('chai');

const app = require('../app'),
    dbInit = require('../config/dbInit'),
    models = require('../models/models'),
    expect = chai.expect;

chai.config.includeStack = true;

/*
 Use careful only in testing
 */
const dbCleanUp = function() {
    return models.db.sequelize.sync({force: true});
};

before(function(done) {
    dbInit.creatingConnection()
        .then(dbInit.creatingDatabase)
        .then(dbCleanUp)
        .then(() => done())
    }
);

describe('## Testing /api/organizations', function() {

    describe('# POST /api/organizations', function() {
        beforeEach(function(done) {
            dbCleanUp()
                .then(() => done())
        });

        let orgsSuccess = {
                "org_name": "Paradise Island",
                "daughters": [{"org_name":"Banana tree"}]
            };
        it('should create organizations with their relations', function(done) {
            request(app)
                .post('/api/organizations')
                .send(orgsSuccess)
                .expect(httpStatus.CREATED)
                .then((res) => {
                    expect(res.body.message).to.equal(httpStatus[201]);
                    done();
                })
                .catch(() => done())
        });

        let orgsFailedInvalidFormat = {
            "org_name": "Paradise Island",
            "daughters": {"org_name":"Banana tree"}
        };
        it('should fails due invalid format post data', function(done) {
            request(app)
                .post('/api/organizations')
                .send(orgsFailedInvalidFormat)
                .expect(httpStatus.INTERNAL_SERVER_ERROR)
                .then((res) => {
                    expect(res.body.message).to.equal(httpStatus[500]);
                    done();
                })
                .catch(() => done())
        });

        let orgsFailedReferenceToItself = {
            "org_name": "Paradise Island",
            "daughters": [{"org_name":"Paradise Island"}]
        };
        it('should fails due org references to itself', function(done) {
            request(app)
                .post('/api/organizations')
                .send(orgsFailedReferenceToItself)
                .expect(httpStatus.UNPROCESSABLE_ENTITY)
                .then((res) => {
                    expect(res.body.message).to.equal(
                        `Received data has organization that referenced to itself: ${orgsFailedReferenceToItself.org_name}`);
                    done();
                })
                .catch(() => done())
        });




    });

    // describe('# GET /api/organizations', function() {
    //
    //     beforeEach(function() {
    //         return dbCleanUp;
    //     });

});
