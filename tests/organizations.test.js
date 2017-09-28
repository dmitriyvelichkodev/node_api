const httpStatus = require('http-status'),
    chai = require('chai'),
    chaiHttp = require('chai-http');

const app = require('../app'),
    dbInit = require('../config/dbInit'),
    models = require('../models/models'),
    expect = chai.expect;

chai.config.includeStack = true;
chai.use(chaiHttp);


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
        .then(() => {
            done();
        })
    }
);

describe('## Testing /api/organizations', function() {

    describe('# POST /api/organizations', function() {
        beforeEach((done) => {
            dbCleanUp().then(() => {
                done();
            });
        });
        let orgsSuccess = {
                "org_name": "Paradise Island",
                "daughters": [{"org_name":"Banana tree"}]
            };
        it('should create organizations with their relations', function(done) {
            chai.request(app)
                .post('/api/organizations')
                .send(orgsSuccess)
                .end((err, res) => {
                    expect(res.status).to.equal(httpStatus.CREATED);
                    expect(res.body.message).to.equal("Created");
                    done();
                });
        });

        let orgsFailedInvalidFormat = {
            "org_name": "Paradise Island",
            "daughters": {"org_name":"Banana tree"}
        };
        it('should fails due invalid format post data', function(done) {
            chai.request(app)
                .post('/api/organizations')
                .send(orgsFailedInvalidFormat)
                .end((err, res) => {
                    expect(res.status).to.equal(httpStatus.INTERNAL_SERVER_ERROR);
                    expect(res.body.message).to.equal(httpStatus[500]);
                    done();
                });
        });

        let orgsFailedReferenceToItself = {
            "org_name": "Paradise Island",
            "daughters": [{"org_name":"Paradise Island"}]
        };
        it('should fails due org references to itself', function(done) {
            chai.request(app)
                .post('/api/organizations')
                .send(orgsFailedReferenceToItself)
                .end((err, res) => {
                    expect(res.status).to.equal(httpStatus.UNPROCESSABLE_ENTITY);
                    expect(res.body.message).to.equal(
                        `Received data has organization that referenced to itself: ${orgsFailedReferenceToItself.org_name}`);
                    done();
                });
        });
    });

    describe('# GET /api/organizations', function() {
        describe("Test for get hierarchy", function() {
            before(function (done) {
                dbCleanUp()
                    .then(() => {
                        return models.Organization.bulkCreate([
                                {name: "org1Level1"},
                                {name: "org1Level2"},
                                {name: "org2Level2"},
                                {name: "org1Level3"}
                            ])
                    })
                    .then(() => {
                        return models.Relation.bulkCreate([
                            {id: 1, parentName: "org1Level1", daughterName: "org1Level2"},
                            {id: 2, parentName: "org1Level1", daughterName: "org2Level2"},
                            {id: 3, parentName: "org1Level2", daughterName: "org1Level3"},
                            {id: 4, parentName: "org2Level2", daughterName: "org1Level3"}
                        ])
                    })
                    .then(() => done())
            });

            it('should return right relations list', function(done) {
                chai.request(app)
                    .get('/api/organizations/org1Level2/relations')
                    .end((err, res) => {
                        expect(res.status).to.equal(httpStatus.OK);
                        expect(res.body).to.deep.equal({
                            page: 1,
                            per_page: 100,
                            page_count: 1,
                            total_count: 3,
                            records:
                                [{ org_name: 'org1Level3', relationship_type: 'daughter' },
                                    { org_name: 'org1Level1', relationship_type: 'parent' },
                                    { org_name: 'org2Level2', relationship_type: 'sister' } ]
                        });
                        done();
                    });
            });
        });

    });

});
